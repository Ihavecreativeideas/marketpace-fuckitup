import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";

export interface DriverApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleType: 'car' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'bicycle';
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  licensePlate: string;
  itemSizePreferences: {
    small: boolean;    // Envelopes, small packages
    medium: boolean;   // Standard boxes, groceries
    large: boolean;    // Furniture, appliances (requires truck/trailer)
  };
  documentsUploaded: {
    driversLicense: boolean;
    insurance: boolean;
    backgroundCheck: boolean;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  approvedAt?: Date;
  driverDashboardCredentials?: {
    username: string;
    password: string;
  };
}

class DriverApplicationManager {
  private static applications: Map<string, DriverApplication> = new Map();
  private static approvedDrivers: Set<string> = new Set();

  static async submitApplication(applicationData: Omit<DriverApplication, 'id' | 'status' | 'submittedAt'>): Promise<string> {
    const applicationId = `DRV${Date.now()}`;
    
    const application: DriverApplication = {
      ...applicationData,
      id: applicationId,
      status: 'pending',
      submittedAt: new Date()
    };

    this.applications.set(applicationId, application);

    // Auto-approve if all documents are uploaded (simulation)
    if (this.allDocumentsUploaded(application)) {
      await this.approveApplication(applicationId);
    }

    return applicationId;
  }

  static async approveApplication(applicationId: string): Promise<void> {
    const application = this.applications.get(applicationId);
    if (!application) throw new Error('Application not found');

    // Generate driver dashboard credentials
    const username = `driver_${application.firstName.toLowerCase()}_${application.lastName.toLowerCase()}`;
    const password = this.generateRandomPassword();

    application.status = 'approved';
    application.approvedAt = new Date();
    application.driverDashboardCredentials = { username, password };

    this.approvedDrivers.add(applicationId);
    this.applications.set(applicationId, application);

    // Send email notification (simulated)
    await this.sendDriverCredentialsEmail(application);
  }

  private static allDocumentsUploaded(application: DriverApplication): boolean {
    const docs = application.documentsUploaded;
    return docs.driversLicense && docs.insurance && docs.backgroundCheck;
  }

  private static generateRandomPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private static async sendDriverCredentialsEmail(application: DriverApplication): Promise<void> {
    console.log(`
=== DRIVER APPROVED: EMAIL SENT ===
To: ${application.email}
Subject: Welcome to MarketPlace Driver Team!

Dear ${application.firstName} ${application.lastName},

Congratulations! Your driver application has been approved.

Your Driver Dashboard Credentials:
Username: ${application.driverDashboardCredentials?.username}
Password: ${application.driverDashboardCredentials?.password}

You can now log in to the driver dashboard and start accepting delivery routes.

Earnings Structure:
- $4 per pickup
- $2 per dropoff  
- $0.50 per mile
- 100% of customer tips

Welcome to the MarketPlace driver team!

Best regards,
MarketPlace Driver Operations
==============================
    `);
  }

  static getApplication(id: string): DriverApplication | undefined {
    return this.applications.get(id);
  }

  static getAllApplications(): DriverApplication[] {
    return Array.from(this.applications.values());
  }

  static getApprovedDrivers(): DriverApplication[] {
    return Array.from(this.applications.values()).filter(app => app.status === 'approved');
  }
}

export function registerDriverRoutes(app: Express): void {
  // Submit driver application
  app.post('/api/driver/apply', async (req, res) => {
    try {
      const applicationData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        licenseNumber: req.body.licenseNumber,
        vehicleType: req.body.vehicleType || 'car',
        vehicleYear: req.body.vehicleYear,
        vehicleMake: req.body.vehicleMake,
        vehicleModel: req.body.vehicleModel,
        vehicleColor: req.body.vehicleColor,
        licensePlate: req.body.licensePlate,
        itemSizePreferences: {
          small: req.body.itemSizePreferences?.small || false,
          medium: req.body.itemSizePreferences?.medium || false,
          large: req.body.itemSizePreferences?.large || false
        },
        documentsUploaded: {
          driversLicense: req.body.documentsUploaded?.driversLicense || false,
          insurance: req.body.documentsUploaded?.insurance || false,
          backgroundCheck: req.body.documentsUploaded?.backgroundCheck || false
        }
      };

      const applicationId = await DriverApplicationManager.submitApplication(applicationData);
      
      res.json({
        success: true,
        applicationId,
        message: 'Application submitted successfully'
      });
    } catch (error) {
      console.error('Driver application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  });

  // Get application status
  app.get('/api/driver/application/:id', async (req, res) => {
    try {
      const application = DriverApplicationManager.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.json({
        success: true,
        application: {
          id: application.id,
          status: application.status,
          submittedAt: application.submittedAt,
          approvedAt: application.approvedAt
        }
      });
    } catch (error) {
      console.error('Get application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get application status'
      });
    }
  });

  // Admin: Get all applications (protected route)
  app.get('/api/admin/driver/applications', isAuthenticated, async (req, res) => {
    try {
      const applications = DriverApplicationManager.getAllApplications();
      res.json({
        success: true,
        applications
      });
    } catch (error) {
      console.error('Get all applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get applications'
      });
    }
  });

  // Admin: Approve application (protected route)
  app.post('/api/admin/driver/approve/:id', isAuthenticated, async (req, res) => {
    try {
      await DriverApplicationManager.approveApplication(req.params.id);
      res.json({
        success: true,
        message: 'Application approved successfully'
      });
    } catch (error) {
      console.error('Approve application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve application'
      });
    }
  });

  // Get approved drivers
  app.get('/api/driver/approved', async (req, res) => {
    try {
      const drivers = DriverApplicationManager.getApprovedDrivers();
      res.json({
        success: true,
        drivers: drivers.map(driver => ({
          id: driver.id,
          name: `${driver.firstName} ${driver.lastName}`,
          vehicle: `${driver.vehicleYear} ${driver.vehicleMake} ${driver.vehicleModel}`,
          licensePlate: driver.licensePlate,
          approvedAt: driver.approvedAt
        }))
      });
    } catch (error) {
      console.error('Get approved drivers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get approved drivers'
      });
    }
  });
}

export { DriverApplicationManager };