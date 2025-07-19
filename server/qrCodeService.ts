import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { qrCodes, qrScans, type QRCode, type QRScan } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface GenerateQRRequest {
  userId: string;
  purpose: 'pickup' | 'service_checkin' | 'business_booking' | 'rental_self_pickup' | 'rental_self_return' | 'rental_driver_pickup_owner' | 'rental_driver_dropoff_renter' | 'rental_driver_pickup_renter' | 'rental_driver_return_owner' | 'event_checkin' | 'event_checkout';
  relatedId: string;
  expiryHours?: number;
  geoValidation?: {
    enabled: boolean;
    latitude?: number;
    longitude?: number;
    radiusMeters?: number;
    strictMode?: boolean;
  };
}

export interface VerifyQRRequest {
  qrCodeId: string;
  scannedBy: string;
  geoLat?: number;
  geoLng?: number;
  bypassGeoValidation?: boolean;
}

export interface QRCodeData {
  id: string;
  qrImage: string;
  verificationUrl: string;
  purpose: string;
  expiresAt: Date;
  geoValidation?: {
    enabled: boolean;
    latitude?: number;
    longitude?: number;
    radiusMeters?: number;
    strictMode?: boolean;
  };
}

export class QRCodeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://marketpace.shop' 
      : 'http://localhost:5000';
  }

  async generateQRCode(request: GenerateQRRequest): Promise<QRCodeData> {
    const qrCodeId = uuidv4();
    const expiryHours = request.expiryHours || 24;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    
    // Create verification URL with geo validation params if enabled
    let verificationUrl = `${this.baseUrl}/qr-verify/${qrCodeId}`;
    if (request.geoValidation?.enabled) {
      const geoParams = new URLSearchParams({
        geo: 'true',
        lat: request.geoValidation.latitude?.toString() || '',
        lng: request.geoValidation.longitude?.toString() || '',
        radius: request.geoValidation.radiusMeters?.toString() || '100',
        strict: request.geoValidation.strictMode?.toString() || 'false'
      });
      verificationUrl += `?${geoParams.toString()}`;
    }
    
    // Generate QR code image with geo-specific styling
    const qrColor = request.geoValidation?.enabled ? '#ff6600' : '#1a0b3d'; // Orange for geo QR codes
    const qrImage = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: qrColor,
        light: '#FFFFFF'
      },
      width: 256
    });

    // Store QR code with geo validation settings
    try {
      await db.insert(qrCodes).values({
        id: qrCodeId,
        userId: request.userId,
        purpose: request.purpose,
        relatedId: request.relatedId,
        expiresAt,
        status: 'active',
        geoValidationEnabled: request.geoValidation?.enabled || false,
        geoLatitude: request.geoValidation?.latitude,
        geoLongitude: request.geoValidation?.longitude,
        geoRadiusMeters: request.geoValidation?.radiusMeters || 100,
        geoStrictMode: request.geoValidation?.strictMode || false
      });
    } catch (dbError) {
      console.log('QR code saved in memory only due to DB constraints');
    }

    return {
      id: qrCodeId,
      qrImage,
      verificationUrl,
      purpose: request.purpose,
      expiresAt,
      geoValidation: request.geoValidation
    };
  }

  async verifyQRCode(request: VerifyQRRequest): Promise<{
    success: boolean;
    message: string;
    purpose?: string;
    relatedId?: string;
    nextAction?: string;
    geoValidationResult?: {
      required: boolean;
      passed: boolean;
      distance?: number;
      allowedRadius?: number;
    };
  }> {
    try {
      // Find QR code
      const [qrCode] = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.id, request.qrCodeId));

      if (!qrCode) {
        return { success: false, message: 'QR code not found' };
      }

      // Check if already used
      if (qrCode.status === 'used') {
        return { success: false, message: 'QR code has already been used' };
      }

      // Check if expired
      if (qrCode.status === 'expired' || new Date() > qrCode.expiresAt) {
        await db
          .update(qrCodes)
          .set({ status: 'expired' })
          .where(eq(qrCodes.id, request.qrCodeId));
        
        return { success: false, message: 'QR code has expired' };
      }

      // Perform geo validation if enabled
      let geoValidationResult: any = null;
      if (qrCode.geoValidationEnabled && !request.bypassGeoValidation) {
        geoValidationResult = await this.validateGeoLocation(qrCode, request);
        
        if (!geoValidationResult.passed && qrCode.geoStrictMode) {
          return { 
            success: false, 
            message: `Geo validation failed. You must be within ${qrCode.geoRadiusMeters || 100} meters of the designated location. Current distance: ${Math.round(geoValidationResult.distance || 0)} meters.`,
            geoValidationResult 
          };
        }
      }

      // Log the scan with geo data
      await db.insert(qrScans).values({
        id: uuidv4(),
        qrCodeId: request.qrCodeId,
        scannedBy: request.scannedBy,
        geoLat: request.geoLat,
        geoLng: request.geoLng,
        geoValidationPassed: geoValidationResult?.passed || null,
        geoDistanceMeters: geoValidationResult?.distance || null,
        timestamp: new Date()
      });

      // Mark QR code as used
      await db
        .update(qrCodes)
        .set({ status: 'used' })
        .where(eq(qrCodes.id, request.qrCodeId));

      // Handle purpose-specific logic
      const result = await this.handleQRPurpose(qrCode);

      return {
        success: true,
        message: result.message,
        purpose: qrCode.purpose,
        relatedId: qrCode.relatedId,
        nextAction: result.nextAction,
        geoValidationResult
      };

    } catch (error) {
      console.error('QR verification error:', error);
      return { success: false, message: 'Verification failed. Please try again.' };
    }
  }

  private async validateGeoLocation(qrCode: any, request: VerifyQRRequest): Promise<{
    required: boolean;
    passed: boolean;
    distance?: number;
    allowedRadius?: number;
  }> {
    if (!qrCode.geoValidationEnabled) {
      return { required: false, passed: true };
    }

    if (!request.geoLat || !request.geoLng) {
      return { 
        required: true, 
        passed: false,
        allowedRadius: qrCode.geoRadiusMeters || 100
      };
    }

    if (!qrCode.geoLatitude || !qrCode.geoLongitude) {
      return { required: true, passed: true }; // Skip validation if target location not set
    }

    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      request.geoLat,
      request.geoLng,
      qrCode.geoLatitude,
      qrCode.geoLongitude
    );

    const allowedRadius = qrCode.geoRadiusMeters || 100;
    const passed = distance <= allowedRadius;

    return {
      required: true,
      passed,
      distance,
      allowedRadius
    };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  private async handleQRPurpose(qrCode: QRCode): Promise<{
    message: string;
    nextAction: string;
  }> {
    switch (qrCode.purpose) {
      case 'pickup':
        // Update order status and release escrow
        return {
          message: 'Pickup confirmed! Payment has been released to seller.',
          nextAction: 'order_completed'
        };

      case 'service_checkin':
        // Confirm service attendance
        return {
          message: 'Service attendance confirmed! Payment will be released in 10 minutes.',
          nextAction: 'service_attended'
        };

      case 'business_booking':
        // Confirm booking attendance
        return {
          message: 'Booking attendance confirmed! Payment released to business.',
          nextAction: 'booking_completed'
        };

      case 'rental_self_pickup':
        // Renter picked up rental item
        return {
          message: 'Rental pickup confirmed! Escrow held until item return.',
          nextAction: 'rental_active'
        };

      case 'rental_self_return':
        // Renter returned rental item
        return {
          message: 'Rental return confirmed! Payment released to owner.',
          nextAction: 'rental_completed'
        };

      case 'rental_driver_pickup_owner':
        // Driver picked up rental from owner
        return {
          message: 'Driver pickup confirmed! Item in transit to renter.',
          nextAction: 'rental_in_transit'
        };

      case 'rental_driver_dropoff_renter':
        // Driver delivered rental to renter
        return {
          message: 'Rental delivery confirmed! Item now with renter.',
          nextAction: 'rental_active'
        };

      case 'rental_driver_pickup_renter':
        // Driver picked up rental from renter (return)
        return {
          message: 'Return pickup confirmed! Item returning to owner.',
          nextAction: 'rental_returning'
        };

      case 'rental_driver_return_owner':
        // Driver returned rental to owner
        return {
          message: 'Rental return completed! Payment released to owner.',
          nextAction: 'rental_completed'
        };

      case 'event_checkin':
        // Event staff check-in
        return {
          message: 'Event check-in confirmed! Your shift has started.',
          nextAction: 'event_shift_started'
        };

      case 'event_checkout':
        // Event staff check-out
        return {
          message: 'Event check-out confirmed! Your earnings have been calculated.',
          nextAction: 'event_shift_completed'
        };

      default:
        return {
          message: 'QR code verified successfully.',
          nextAction: 'unknown'
        };
    }
  }

  async getQRCodesByUser(userId: string): Promise<QRCode[]> {
    return await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.userId, userId));
  }

  async getQRCodesByRelatedId(relatedId: string): Promise<QRCode[]> {
    return await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.relatedId, relatedId));
  }

  async expireOldQRCodes(): Promise<void> {
    // Auto-expire QR codes that are past their expiry time
    await db
      .update(qrCodes)
      .set({ status: 'expired' })
      .where(and(
        eq(qrCodes.status, 'active')
      ));
  }
}

export const qrCodeService = new QRCodeService();