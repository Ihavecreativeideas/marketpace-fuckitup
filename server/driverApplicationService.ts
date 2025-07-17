import { notificationService } from './notificationService';
import { notificationCenter } from './notificationCenter';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export interface DriverApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  driversLicense: {
    number: string;
    state: string;
    expirationDate: string;
    fileUrl?: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    insurance: {
      company: string;
      policyNumber: string;
      expirationDate: string;
      fileUrl?: string;
    };
  };
  experience: {
    hasDeliveryExperience: boolean;
    previousJobs: string;
    references?: string;
  };
  availability: {
    preferredSlots: string[];
    maxHoursPerWeek: number;
    startDate: string;
  };
  backgroundCheck: {
    consentGiven: boolean;
    status: 'pending' | 'cleared' | 'failed';
    reportUrl?: string;
  };
  documents: {
    profilePhoto?: string;
    w9Form?: string;
    bankingInfo?: string;
  };
  applicationStatus: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'hired';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  hiringDate?: Date;
}

export interface DriverProfile {
  id: string;
  userId: string;
  applicationId: string;
  employeeNumber: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: any;
  vehicle: any;
  isActive: boolean;
  status: 'training' | 'active' | 'suspended' | 'terminated';
  hiringDate: Date;
  rating: number;
  completedDeliveries: number;
  totalEarnings: number;
  preferredSlots: string[];
  maxRoutesPerDay: number;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bankingInfo: {
    accountType: string;
    routingNumber: string;
    accountNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class DriverApplicationService {
  
  // Submit new driver application
  async submitApplication(applicationData: Omit<DriverApplication, 'id' | 'submittedAt' | 'applicationStatus'>): Promise<string> {
    try {
      const applicationId = `APP-${Date.now()}`;
      
      const application: DriverApplication = {
        ...applicationData,
        id: applicationId,
        applicationStatus: 'submitted',
        submittedAt: new Date()
      };
      
      // Save application to database (mock for now)
      console.log('Saving driver application:', applicationId);
      
      // Send confirmation to applicant
      await this.sendApplicationConfirmation(application);
      
      // Notify admin of new application
      await this.notifyAdminNewApplication(application);
      
      // Initiate background check if consent given
      if (application.backgroundCheck.consentGiven) {
        await this.initiateBackgroundCheck(application);
      }
      
      return applicationId;
    } catch (error) {
      console.error('Error submitting driver application:', error);
      throw new Error('Failed to submit application');
    }
  }

  // Review and approve/reject application
  async reviewApplication(applicationId: string, decision: 'approved' | 'rejected', reviewerId: string, rejectionReason?: string): Promise<void> {
    try {
      // Get application
      const application = await this.getApplication(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Update application status
      application.applicationStatus = decision;
      application.reviewedAt = new Date();
      application.reviewedBy = reviewerId;
      if (rejectionReason) {
        application.rejectionReason = rejectionReason;
      }

      if (decision === 'approved') {
        // Create driver profile and login credentials
        const driverProfile = await this.createDriverProfile(application);
        
        // Send approval notification with login credentials
        await this.sendApprovalNotification(application, driverProfile);
        
        // Update application status to hired
        application.applicationStatus = 'hired';
        application.hiringDate = new Date();
        
      } else {
        // Send rejection notification
        await this.sendRejectionNotification(application, rejectionReason);
      }

      // Save updated application
      console.log('Updated application status:', applicationId, decision);
      
    } catch (error) {
      console.error('Error reviewing application:', error);
      throw new Error('Failed to review application');
    }
  }

  // Create driver profile and login credentials
  private async createDriverProfile(application: DriverApplication): Promise<DriverProfile> {
    try {
      const employeeNumber = `MP-${String(Date.now()).slice(-6)}`;
      const username = `${application.firstName.toLowerCase()}.${application.lastName.toLowerCase()}.driver`;
      const tempPassword = this.generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const driverProfile: DriverProfile = {
        id: `driver_${Date.now()}`,
        userId: `user_${Date.now()}`,
        applicationId: application.id,
        employeeNumber,
        username,
        passwordHash,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        address: application.address,
        vehicle: application.vehicle,
        isActive: true,
        status: 'training',
        hiringDate: new Date(),
        rating: 5.0,
        completedDeliveries: 0,
        totalEarnings: 0,
        preferredSlots: application.availability.preferredSlots,
        maxRoutesPerDay: Math.min(Math.floor(application.availability.maxHoursPerWeek / 12), 4),
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        bankingInfo: {
          accountType: '',
          routingNumber: '',
          accountNumber: ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save driver profile to database
      console.log('Created driver profile:', driverProfile.username);
      
      // Store temporary password for notification
      (driverProfile as any).tempPassword = tempPassword;
      
      return driverProfile;
    } catch (error) {
      console.error('Error creating driver profile:', error);
      throw new Error('Failed to create driver profile');
    }
  }

  // Send application confirmation
  private async sendApplicationConfirmation(application: DriverApplication): Promise<void> {
    const emailContent = this.generateApplicationConfirmationEmail(application);
    
    await notificationService.sendPurchaseEmail({
      customerName: `${application.firstName} ${application.lastName}`,
      customerEmail: application.email,
      customerPhone: application.phone,
      purchaseType: 'driver_application',
      itemName: 'Driver Application Received',
      amount: 0,
      transactionId: application.id
    });

    // Send SMS confirmation
    await notificationService.sendPurchaseSMS({
      customerName: `${application.firstName} ${application.lastName}`,
      customerEmail: '',
      customerPhone: application.phone,
      purchaseType: 'driver_application',
      itemName: `🚚 DRIVER APPLICATION RECEIVED\n\nThank you ${application.firstName}! We received your MarketPace driver application (${application.id}).\n\nYou'll hear from us within 2-3 business days.\n\nQuestions? Contact drivers@marketpace.shop`,
      amount: 0,
      transactionId: application.id
    });
  }

  // Notify admin of new application
  private async notifyAdminNewApplication(application: DriverApplication): Promise<void> {
    await notificationCenter.sendAdminAnnouncement({
      title: `🚚 New Driver Application: ${application.firstName} ${application.lastName}`,
      message: `New driver application received from ${application.firstName} ${application.lastName} in ${application.address.city}, ${application.address.state}. Review required.`,
      targetAudience: 'specific',
      memberIds: ['admin_user'],
      priority: 'high',
      channels: ['email', 'sms'],
      actionUrl: '/admin-driver-applications.html'
    });
  }

  // Send approval notification with login credentials
  private async sendApprovalNotification(application: DriverApplication, driverProfile: DriverProfile): Promise<void> {
    const tempPassword = (driverProfile as any).tempPassword;
    
    // Send detailed email with login instructions
    const emailContent = this.generateApprovalEmail(application, driverProfile, tempPassword);
    
    await notificationService.sendPurchaseEmail({
      customerName: `${application.firstName} ${application.lastName}`,
      customerEmail: application.email,
      customerPhone: application.phone,
      purchaseType: 'driver_approval',
      itemName: '🎉 Driver Application APPROVED - Login Details Inside',
      amount: 0,
      transactionId: application.id
    });

    // Send SMS with login credentials
    await notificationService.sendPurchaseSMS({
      customerName: `${application.firstName} ${application.lastName}`,
      customerEmail: '',
      customerPhone: application.phone,
      purchaseType: 'driver_approval',
      itemName: `🎉 CONGRATULATIONS ${application.firstName}!\n\nYour MarketPace driver application is APPROVED!\n\nLogin Details:\nUsername: ${driverProfile.username}\nPassword: ${tempPassword}\n\nDashboard: marketpace.shop/driver-dashboard\n\nTraining starts immediately. Welcome to the team!`,
      amount: 0,
      transactionId: application.id
    });
  }

  // Send rejection notification
  private async sendRejectionNotification(application: DriverApplication, reason?: string): Promise<void> {
    await notificationService.sendPurchaseEmail({
      customerName: `${application.firstName} ${application.lastName}`,
      customerEmail: application.email,
      customerPhone: application.phone,
      purchaseType: 'driver_rejection',
      itemName: 'Driver Application Update',
      amount: 0,
      transactionId: application.id
    });

    const rejectionMessage = reason 
      ? `Thank you for your interest in driving for MarketPace. Unfortunately, we cannot move forward with your application at this time. Reason: ${reason}. You may reapply in 6 months.`
      : `Thank you for your interest in driving for MarketPace. Unfortunately, we cannot move forward with your application at this time. You may reapply in 6 months.`;

    await notificationService.sendPurchaseSMS({
      customerName: `${application.firstName} ${application.lastName}`,
      customerEmail: '',
      customerPhone: application.phone,
      purchaseType: 'driver_rejection',
      itemName: rejectionMessage,
      amount: 0,
      transactionId: application.id
    });
  }

  // Initiate background check
  private async initiateBackgroundCheck(application: DriverApplication): Promise<void> {
    try {
      // Mock background check initiation
      console.log(`Initiating background check for ${application.firstName} ${application.lastName}`);
      
      // In real implementation, this would call background check API
      // For demo, we'll simulate instant approval
      setTimeout(async () => {
        application.backgroundCheck.status = 'cleared';
        console.log(`Background check cleared for ${application.firstName} ${application.lastName}`);
        
        // Update application status to under review
        application.applicationStatus = 'under_review';
      }, 2000);
      
    } catch (error) {
      console.error('Error initiating background check:', error);
      application.backgroundCheck.status = 'failed';
    }
  }

  // Generate temporary password
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Generate application confirmation email
  private generateApplicationConfirmationEmail(application: DriverApplication): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Driver Application Received - MarketPace</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0d0221 0%, #1a0b3d 50%, #2d1b69 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; }
          .timeline { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Application Received!</h1>
            <p style="margin: 0; color: #87ceeb;">Thank you for applying to drive with MarketPace</p>
          </div>
          
          <div class="content">
            <p>Hi ${application.firstName},</p>
            
            <p>We've successfully received your driver application (#${application.id}) for MarketPace delivery services in ${application.address.city}, ${application.address.state}.</p>
            
            <div class="timeline">
              <h3>What Happens Next:</h3>
              <ul>
                <li><strong>Background Check</strong> - Processing (1-2 business days)</li>
                <li><strong>Application Review</strong> - Our team reviews your qualifications</li>
                <li><strong>Decision</strong> - You'll receive an email/SMS within 2-3 business days</li>
                <li><strong>If Approved</strong> - Login credentials and training materials sent immediately</li>
              </ul>
            </div>
            
            <p>Questions? Contact us at <strong>drivers@marketpace.shop</strong></p>
            
            <p>Thank you for your interest in joining the MarketPace driver community!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate approval email
  private generateApprovalEmail(application: DriverApplication, driverProfile: DriverProfile, tempPassword: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to MarketPace Driver Team!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #28a745 0%, #4caf50 100%); padding: 30px; text-align: center; color: white; }
          .credentials { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .content { padding: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 CONGRATULATIONS!</h1>
            <p style="margin: 0;">You're officially a MarketPace Driver!</p>
          </div>
          
          <div class="content">
            <p>Hi ${application.firstName},</p>
            
            <p><strong>Welcome to the MarketPace driver team!</strong> Your application has been approved and your driver account is ready.</p>
            
            <div class="credentials">
              <h3>Your Driver Dashboard Login:</h3>
              <p><strong>URL:</strong> https://marketpace.shop/driver-dashboard</p>
              <p><strong>Username:</strong> ${driverProfile.username}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              <p><strong>Employee #:</strong> ${driverProfile.employeeNumber}</p>
              
              <p style="color: #d73502; font-size: 14px;"><strong>Important:</strong> Please change your password after first login.</p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Log into your driver dashboard using the credentials above</li>
              <li>Complete your profile setup (emergency contact, banking info)</li>
              <li>Review delivery procedures and safety guidelines</li>
              <li>Start accepting routes immediately!</li>
            </ol>
            
            <h3>Earnings Structure:</h3>
            <ul>
              <li>$4.00 per pickup</li>
              <li>$2.00 per delivery</li>
              <li>$0.50 per mile</li>
              <li>100% of customer tips</li>
              <li>Weekly bonuses for high ratings</li>
            </ul>
            
            <p>Questions? Contact driver support at <strong>drivers@marketpace.shop</strong> or call (555) 123-DRIVE.</p>
            
            <p>Welcome to MarketPace - let's deliver opportunities together!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Get application by ID (mock implementation)
  private async getApplication(applicationId: string): Promise<DriverApplication | null> {
    // Mock implementation - would query database
    return {
      id: applicationId,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      dateOfBirth: '1990-05-15',
      address: {
        street: '123 Main St',
        city: 'Orange Beach',
        state: 'AL',
        zipCode: '36561'
      },
      driversLicense: {
        number: 'AL123456789',
        state: 'AL',
        expirationDate: '2027-05-15'
      },
      vehicle: {
        make: 'Honda',
        model: 'Accord',
        year: 2020,
        licensePlate: 'ABC123',
        insurance: {
          company: 'State Farm',
          policyNumber: 'SF123456',
          expirationDate: '2025-12-31'
        }
      },
      experience: {
        hasDeliveryExperience: true,
        previousJobs: 'DoorDash driver for 2 years'
      },
      availability: {
        preferredSlots: ['9am-12pm', '12pm-3pm'],
        maxHoursPerWeek: 30,
        startDate: '2025-01-20'
      },
      backgroundCheck: {
        consentGiven: true,
        status: 'pending'
      },
      documents: {},
      applicationStatus: 'submitted',
      submittedAt: new Date()
    };
  }

  // Get all pending applications
  async getPendingApplications(): Promise<DriverApplication[]> {
    // Mock implementation
    return [];
  }

  // Update driver profile
  async updateDriverProfile(driverId: string, updates: Partial<DriverProfile>): Promise<void> {
    console.log(`Updating driver profile ${driverId}:`, updates);
  }

  // Driver login authentication
  async authenticateDriver(username: string, password: string): Promise<DriverProfile | null> {
    try {
      // Mock implementation - would query database
      const mockProfile: DriverProfile = {
        id: 'driver_123',
        userId: 'user_123',
        applicationId: 'APP_123',
        employeeNumber: 'MP-123456',
        username: username,
        passwordHash: await bcrypt.hash(password, 10),
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1234567890',
        address: { street: '123 Main St', city: 'Orange Beach', state: 'AL', zipCode: '36561' },
        vehicle: { make: 'Honda', model: 'Accord', year: 2020, licensePlate: 'ABC123' },
        isActive: true,
        status: 'active',
        hiringDate: new Date(),
        rating: 4.8,
        completedDeliveries: 156,
        totalEarnings: 2847.50,
        preferredSlots: ['9am-12pm', '12pm-3pm'],
        maxRoutesPerDay: 2,
        emergencyContact: { name: 'Jane Smith', phone: '+0987654321', relationship: 'Spouse' },
        bankingInfo: { accountType: 'Checking', routingNumber: '123456789', accountNumber: '****5678' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Verify password
      const isValid = await bcrypt.compare(password, mockProfile.passwordHash);
      return isValid ? mockProfile : null;
      
    } catch (error) {
      console.error('Driver authentication error:', error);
      return null;
    }
  }
}

export const driverApplicationService = new DriverApplicationService();