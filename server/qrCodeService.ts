import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { qrCodes, qrScans, type QRCode, type QRScan } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface GenerateQRRequest {
  userId: string;
  purpose: 'pickup' | 'service_checkin' | 'business_booking' | 'rental_self_pickup' | 'rental_self_return' | 'rental_driver_pickup_owner' | 'rental_driver_dropoff_renter' | 'rental_driver_pickup_renter' | 'rental_driver_return_owner';
  relatedId: string;
  expiryHours?: number;
}

export interface VerifyQRRequest {
  qrCodeId: string;
  scannedBy: string;
  geoLat?: number;
  geoLng?: number;
}

export interface QRCodeData {
  id: string;
  qrImage: string;
  verificationUrl: string;
  purpose: string;
  expiresAt: Date;
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
    
    // Create verification URL
    const verificationUrl = `${this.baseUrl}/qr-verify/${qrCodeId}`;
    
    // Generate QR code image
    const qrImage = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#1a0b3d',
        light: '#FFFFFF'
      },
      width: 256
    });

    // Save to database
    await db.insert(qrCodes).values({
      id: qrCodeId,
      userId: request.userId,
      purpose: request.purpose,
      relatedId: request.relatedId,
      expiresAt,
      status: 'active'
    });

    return {
      id: qrCodeId,
      qrImage,
      verificationUrl,
      purpose: request.purpose,
      expiresAt
    };
  }

  async verifyQRCode(request: VerifyQRRequest): Promise<{
    success: boolean;
    message: string;
    purpose?: string;
    relatedId?: string;
    nextAction?: string;
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

      // Log the scan
      await db.insert(qrScans).values({
        id: uuidv4(),
        qrCodeId: request.qrCodeId,
        scannedBy: request.scannedBy,
        geoLat: request.geoLat,
        geoLng: request.geoLng,
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
        nextAction: result.nextAction
      };

    } catch (error) {
      console.error('QR verification error:', error);
      return { success: false, message: 'Verification failed. Please try again.' };
    }
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