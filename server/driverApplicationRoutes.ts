import type { Express } from "express";
import { driverApplicationService } from './driverApplicationService';

export function registerDriverApplicationRoutes(app: Express) {
  
  // Submit new driver application
  app.post('/api/driver/apply', async (req, res) => {
    try {
      const applicationData = req.body;
      
      // Validate required fields
      const required = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
      for (const field of required) {
        if (!applicationData[field]) {
          return res.status(400).json({ error: `${field} is required` });
        }
      }

      const applicationId = await driverApplicationService.submitApplication(applicationData);
      
      res.json({ 
        success: true, 
        message: 'Driver application submitted successfully',
        applicationId: applicationId
      });
      
    } catch (error) {
      console.error('Error submitting driver application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // Admin: Review driver application
  app.post('/api/admin/driver/review', async (req, res) => {
    try {
      const { applicationId, decision, reviewerId, rejectionReason, adminToken } = req.body;
      
      if (adminToken !== 'admin_token_2025') {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      if (!applicationId || !decision || !reviewerId) {
        return res.status(400).json({ error: 'Application ID, decision, and reviewer ID are required' });
      }

      if (decision === 'rejected' && !rejectionReason) {
        return res.status(400).json({ error: 'Rejection reason is required for rejected applications' });
      }

      await driverApplicationService.reviewApplication(applicationId, decision, reviewerId, rejectionReason);
      
      res.json({ 
        success: true, 
        message: `Application ${decision} successfully`,
        applicationId: applicationId
      });
      
    } catch (error) {
      console.error('Error reviewing driver application:', error);
      res.status(500).json({ error: 'Failed to review application' });
    }
  });

  // Admin: Get pending applications
  app.get('/api/admin/driver/applications', async (req, res) => {
    try {
      const { adminToken } = req.query;
      
      if (adminToken !== 'admin_token_2025') {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const applications = await driverApplicationService.getPendingApplications();
      
      res.json({ 
        success: true, 
        applications: applications,
        count: applications.length
      });
      
    } catch (error) {
      console.error('Error getting driver applications:', error);
      res.status(500).json({ error: 'Failed to get applications' });
    }
  });

  // Driver login authentication
  app.post('/api/driver/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const driverProfile = await driverApplicationService.authenticateDriver(username, password);
      
      if (!driverProfile) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!driverProfile.isActive) {
        return res.status(403).json({ error: 'Account is suspended. Contact driver support.' });
      }

      // Remove sensitive data before sending
      const { passwordHash, bankingInfo, ...safeProfile } = driverProfile;
      const safeBankingInfo = {
        accountType: bankingInfo.accountType,
        lastFourDigits: bankingInfo.accountNumber.slice(-4)
      };

      res.json({ 
        success: true, 
        message: 'Login successful',
        driver: { ...safeProfile, bankingInfo: safeBankingInfo }
      });
      
    } catch (error) {
      console.error('Error authenticating driver:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Update driver profile
  app.post('/api/driver/profile/update', async (req, res) => {
    try {
      const { driverId, updates } = req.body;
      
      if (!driverId) {
        return res.status(400).json({ error: 'Driver ID is required' });
      }

      // Remove sensitive fields that shouldn't be updated via this endpoint
      const allowedUpdates = {
        phone: updates.phone,
        emergencyContact: updates.emergencyContact,
        preferredSlots: updates.preferredSlots,
        maxRoutesPerDay: updates.maxRoutesPerDay
      };

      await driverApplicationService.updateDriverProfile(driverId, allowedUpdates);
      
      res.json({ 
        success: true, 
        message: 'Profile updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating driver profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Driver: Change password
  app.post('/api/driver/change-password', async (req, res) => {
    try {
      const { driverId, currentPassword, newPassword } = req.body;
      
      if (!driverId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }

      // Verify current password and update (mock implementation)
      console.log(`Password change request for driver ${driverId}`);
      
      res.json({ 
        success: true, 
        message: 'Password changed successfully'
      });
      
    } catch (error) {
      console.error('Error changing driver password:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  // Driver stats and earnings
  app.get('/api/driver/stats', async (req, res) => {
    try {
      const { driverId } = req.query;
      
      if (!driverId) {
        return res.status(400).json({ error: 'Driver ID is required' });
      }

      // Mock driver stats
      const stats = {
        today: {
          deliveries: 8,
          earnings: 67.50,
          hours: 4.5,
          rating: 4.9
        },
        thisWeek: {
          deliveries: 34,
          earnings: 287.25,
          hours: 18.5,
          avgRating: 4.8
        },
        thisMonth: {
          deliveries: 156,
          earnings: 1247.85,
          hours: 89.2,
          avgRating: 4.8
        },
        allTime: {
          deliveries: 1247,
          earnings: 8956.42,
          hours: 723.5,
          avgRating: 4.8,
          onTimeRate: 97.3,
          customerSatisfaction: 96.8
        }
      };

      res.json({ 
        success: true, 
        stats: stats
      });
      
    } catch (error) {
      console.error('Error getting driver stats:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });
}