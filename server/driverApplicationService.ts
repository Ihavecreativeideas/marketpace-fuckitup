// Driver Application Service
// Manages driver applications, approvals, and credential generation

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
    };
  };
  experience: {
    hasDeliveryExperience: boolean;
    previousJobs: string;
    references: string;
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
  notificationPreferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
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
  vehicle: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export class DriverApplicationService {
  private applications: Map<string, DriverApplication> = new Map();
  private drivers: Map<string, DriverProfile> = new Map();

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleApps: DriverApplication[] = [
      {
        id: 'app-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'johnsmith@email.com',
        phone: '(555) 123-4567',
        dateOfBirth: '1990-05-15',
        address: {
          street: '123 Main St',
          city: 'Mobile',
          state: 'AL',
          zipCode: '36601'
        },
        driversLicense: {
          number: 'DL123456789',
          state: 'AL',
          expirationDate: '2026-05-15'
        },
        vehicle: {
          make: 'Honda',
          model: 'Civic',
          year: 2018,
          licensePlate: 'ABC123',
          insurance: {
            company: 'State Farm',
            policyNumber: 'SF123456',
            expirationDate: '2025-12-31'
          }
        },
        experience: {
          hasDeliveryExperience: true,
          previousJobs: '2 years with DoorDash',
          references: 'Available upon request'
        },
        availability: {
          preferredSlots: ['morning', 'afternoon'],
          maxHoursPerWeek: 20,
          startDate: '2025-02-01'
        },
        backgroundCheck: {
          consentGiven: true,
          status: 'pending'
        },
        documents: {
          profilePhoto: 'john-profile.jpg'
        },
        notificationPreferences: {
          emailNotifications: true,
          smsNotifications: true
        },
        applicationStatus: 'submitted',
        submittedAt: new Date('2025-01-15'),
      },
      {
        id: 'app-002',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@email.com',
        phone: '(555) 987-6543',
        dateOfBirth: '1985-08-22',
        address: {
          street: '456 Oak Ave',
          city: 'Pensacola',
          state: 'FL',
          zipCode: '32501'
        },
        driversLicense: {
          number: 'FL987654321',
          state: 'FL',
          expirationDate: '2027-08-22'
        },
        vehicle: {
          make: 'Ford',
          model: 'Explorer',
          year: 2020,
          licensePlate: 'XYZ789',
          insurance: {
            company: 'Progressive',
            policyNumber: 'PG789012',
            expirationDate: '2025-10-15'
          }
        },
        experience: {
          hasDeliveryExperience: true,
          previousJobs: '5 years rideshare with Uber/Lyft',
          references: 'Available upon request'
        },
        availability: {
          preferredSlots: ['morning', 'afternoon', 'evening'],
          maxHoursPerWeek: 40,
          startDate: '2025-01-20'
        },
        backgroundCheck: {
          consentGiven: true,
          status: 'pending'
        },
        documents: {
          profilePhoto: 'maria-profile.jpg'
        },
        notificationPreferences: {
          emailNotifications: true,
          smsNotifications: false
        },
        applicationStatus: 'submitted',
        submittedAt: new Date('2025-01-16'),
      }
    ];

    sampleApps.forEach(app => {
      this.applications.set(app.id, app);
    });
  }

  getAllApplications(): DriverApplication[] {
    return Array.from(this.applications.values());
  }

  getApplicationById(id: string): DriverApplication | undefined {
    return this.applications.get(id);
  }

  async submitApplication(applicationData: any): Promise<string> {
    const applicationId = `app-${Date.now()}`;
    
    const application: DriverApplication = {
      id: applicationId,
      firstName: applicationData.firstName,
      lastName: applicationData.lastName,
      email: applicationData.email,
      phone: applicationData.phone,
      dateOfBirth: applicationData.dateOfBirth,
      address: {
        street: applicationData.address,
        city: applicationData.city,
        state: applicationData.state,
        zipCode: applicationData.zipCode
      },
      driversLicense: {
        number: applicationData.licenseNumber,
        state: applicationData.licenseState,
        expirationDate: applicationData.licenseExpiration
      },
      vehicle: {
        make: applicationData.vehicleMake,
        model: applicationData.vehicleModel,
        year: parseInt(applicationData.vehicleYear),
        licensePlate: applicationData.licensePlate,
        insurance: {
          company: applicationData.insuranceCompany || '',
          policyNumber: applicationData.insurancePolicyNumber || '',
          expirationDate: applicationData.insuranceExpiration || ''
        }
      },
      experience: {
        hasDeliveryExperience: applicationData.hasDeliveryExperience || false,
        previousJobs: applicationData.previousJobs || '',
        references: applicationData.references || ''
      },
      availability: {
        preferredSlots: applicationData.preferredSlots || [],
        maxHoursPerWeek: parseInt(applicationData.maxHours) || 20,
        startDate: applicationData.startDate || ''
      },
      backgroundCheck: {
        consentGiven: applicationData.backgroundConsent || false,
        status: 'pending'
      },
      documents: {
        profilePhoto: applicationData.profilePhoto || ''
      },
      notificationPreferences: {
        emailNotifications: applicationData.emailNotifications !== false,
        smsNotifications: applicationData.smsNotifications !== false
      },
      applicationStatus: 'submitted',
      submittedAt: new Date()
    };

    this.applications.set(applicationId, application);
    
    // Send confirmation notifications based on user preferences
    await this.sendApplicationConfirmation(application);
    
    return applicationId;
  }

  async approveApplication(applicationId: string): Promise<{ 
    success: boolean; 
    email: string; 
    username: string; 
    password: string; 
    employeeNumber: string; 
    error?: string; 
  }> {
    const application = this.applications.get(applicationId);
    if (!application) {
      return { success: false, email: '', username: '', password: '', employeeNumber: '', error: 'Application not found' };
    }

    // Generate credentials
    const username = `${application.firstName.toLowerCase()}.${application.lastName.toLowerCase()}`;
    const password = this.generatePassword();
    const employeeNumber = `MP${Date.now().toString().slice(-6)}`;

    // Create driver profile
    const driverProfile: DriverProfile = {
      id: `driver-${Date.now()}`,
      userId: applicationId,
      applicationId: applicationId,
      employeeNumber: employeeNumber,
      username: username,
      passwordHash: password, // In production, this should be hashed
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      vehicle: application.vehicle,
      isActive: true,
      createdAt: new Date()
    };

    // Update application status
    application.applicationStatus = 'approved';
    application.reviewedAt = new Date();
    application.hiringDate = new Date();

    // Store driver profile
    this.drivers.set(driverProfile.id, driverProfile);

    // Send notification email (using existing notification service)
    await this.sendApprovalNotification(application, username, password, employeeNumber);

    return {
      success: true,
      email: application.email,
      username: username,
      password: password,
      employeeNumber: employeeNumber
    };
  }

  async rejectApplication(applicationId: string, reason: string): Promise<{ 
    success: boolean; 
    email: string; 
    error?: string; 
  }> {
    const application = this.applications.get(applicationId);
    if (!application) {
      return { success: false, email: '', error: 'Application not found' };
    }

    // Update application status
    application.applicationStatus = 'rejected';
    application.reviewedAt = new Date();
    application.rejectionReason = reason;

    // Send notification email
    await this.sendRejectionNotification(application, reason);

    return {
      success: true,
      email: application.email
    };
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async sendApprovalNotification(application: DriverApplication, username: string, password: string, employeeNumber: string): Promise<void> {
    try {
      // Dynamically import notification service to avoid circular dependencies
      const { smsService } = await import('./smsService');
      const { emailService } = await import('./emailService');
      
      // Send SMS notification
      try {
        await smsService.sendSMS(
          application.phone,
          `Congratulations! Your MarketPace driver application has been approved. Your credentials:\n\nUsername: ${username}\nPassword: ${password}\nEmployee ID: ${employeeNumber}\n\nAccess your driver dashboard at: https://www.marketpace.shop/driver-dashboard`
        );
      } catch (smsError) {
        console.warn('SMS notification failed:', smsError);
      }

      // Send email notification
      try {
        const emailContent = `
          <h2>Welcome to MarketPace!</h2>
          <p>Dear ${application.firstName},</p>
          <p>Congratulations! Your driver application has been approved.</p>
          <h3>Your Driver Credentials:</h3>
          <ul>
            <li><strong>Username:</strong> ${username}</li>
            <li><strong>Password:</strong> ${password}</li>
            <li><strong>Employee ID:</strong> ${employeeNumber}</li>
          </ul>
          <p>You can now access your driver dashboard at: <a href="https://www.marketpace.shop/driver-dashboard">https://www.marketpace.shop/driver-dashboard</a></p>
          <p>Welcome to the MarketPace team!</p>
        `;

        await emailService.sendEmail(
          application.email,
          'MarketPace Driver Application Approved',
          emailContent
        );
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }
    } catch (error) {
      console.error('Error sending approval notification:', error);
    }
  }

  private async sendRejectionNotification(application: DriverApplication, reason: string): Promise<void> {
    try {
      // Dynamically import notification service to avoid circular dependencies
      const { smsService } = await import('./smsService');
      const { emailService } = await import('./emailService');
      
      // Send SMS notification
      try {
        await smsService.sendSMS(
          application.phone,
          `Your MarketPace driver application has been reviewed. Unfortunately, we cannot proceed at this time. Reason: ${reason}. You may reapply in 30 days.`
        );
      } catch (smsError) {
        console.warn('SMS notification failed:', smsError);
      }

      // Send email notification
      try {
        const emailContent = `
          <h2>MarketPace Driver Application Update</h2>
          <p>Dear ${application.firstName},</p>
          <p>Thank you for your interest in joining MarketPace as a driver.</p>
          <p>After reviewing your application, we are unable to proceed at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>You may reapply in 30 days if you would like to address any concerns.</p>
          <p>Thank you for your understanding.</p>
        `;

        await emailService.sendEmail(
          application.email,
          'MarketPace Driver Application Update',
          emailContent
        );
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }
    } catch (error) {
      console.error('Error sending rejection notification:', error);
    }
  }

  private async sendApplicationConfirmation(application: DriverApplication): Promise<void> {
    try {
      const { smsService } = await import('./smsService');
      const { emailService } = await import('./emailService');
      
      // Send SMS confirmation if opted in
      if (application.notificationPreferences.smsNotifications) {
        try {
          await smsService.sendSMS(
            application.phone,
            `Thank you ${application.firstName}! Your MarketPace driver application has been submitted successfully. We'll review it within 24-48 hours and notify you of the decision. Application ID: ${application.id}`
          );
        } catch (smsError) {
          console.warn('SMS confirmation failed:', smsError);
        }
      }

      // Send email confirmation if opted in
      if (application.notificationPreferences.emailNotifications) {
        try {
          const emailContent = `
            <h2>Driver Application Received</h2>
            <p>Dear ${application.firstName},</p>
            <p>Thank you for applying to become a MarketPace driver!</p>
            <p><strong>Application ID:</strong> ${application.id}</p>
            <p><strong>Status:</strong> Under Review</p>
            <h3>What's Next:</h3>
            <ul>
              <li>We'll review your application within 24-48 hours</li>
              <li>You'll receive notification of our decision via ${application.notificationPreferences.smsNotifications ? 'SMS and email' : 'email'}</li>
              <li>If approved, you'll receive your driver credentials immediately</li>
            </ul>
            <p>Thank you for your interest in joining MarketPace!</p>
            <p>Best regards,<br>The MarketPace Team</p>
          `;

          await emailService.sendEmail(
            application.email,
            'MarketPace Driver Application Received',
            emailContent
          );
        } catch (emailError) {
          console.warn('Email confirmation failed:', emailError);
        }
      }
    } catch (error) {
      console.error('Error sending application confirmation:', error);
    }
  }
}

export const driverApplicationService = new DriverApplicationService();