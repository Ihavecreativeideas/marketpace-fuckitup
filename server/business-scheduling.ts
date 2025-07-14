import { db } from "./db";
import { 
  businesses, 
  employees, 
  schedules, 
  fillInRequests, 
  announcements, 
  notifications,
  users,
  volunteers,
  volunteerHours,
  volunteerSchedules,
  type InsertBusiness,
  type InsertEmployee,
  type InsertSchedule,
  type InsertFillInRequest,
  type InsertAnnouncement,
  type InsertNotification,
  type InsertVolunteer,
  type InsertVolunteerHours,
  type InsertVolunteerSchedule
} from "../shared/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export class BusinessSchedulingService {
  
  // Business Management
  async createBusiness(ownerId: string, businessData: Omit<InsertBusiness, 'ownerId'>) {
    const business = await db.insert(businesses).values({
      ...businessData,
      ownerId
    }).returning();
    return business[0];
  }

  async getUserBusinesses(ownerId: string) {
    return await db.select().from(businesses).where(eq(businesses.ownerId, ownerId));
  }

  async getBusiness(businessId: string, ownerId: string) {
    const business = await db.select()
      .from(businesses)
      .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, ownerId)));
    return business[0];
  }

  // Employee Management
  async inviteEmployee(businessId: string, employeeData: Omit<InsertEmployee, 'businessId'>) {
    const employee = await db.insert(employees).values({
      ...employeeData,
      businessId,
      status: 'pending'
    }).returning();

    // Create notification for the invited user if they exist
    if (employeeData.userId) {
      await this.createNotification({
        userId: employeeData.userId,
        businessId,
        type: 'employee_invitation',
        title: 'You have been invited to join a team',
        message: `You have been invited to join ${employeeData.role} at a business.`,
        data: { employeeId: employee[0].id }
      });
    }

    return employee[0];
  }

  async getBusinessEmployees(businessId: string) {
    return await db.select({
      employee: employees,
      user: users
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .where(eq(employees.businessId, businessId));
  }

  async updateEmployeeStatus(employeeId: string, status: 'pending' | 'active' | 'inactive') {
    const updated = await db.update(employees)
      .set({ status })
      .where(eq(employees.id, employeeId))
      .returning();
    return updated[0];
  }

  // Business Settings Management
  async saveBusinessSettings(businessId: string, settings: any) {
    const updated = await db.update(businesses)
      .set({ 
        settings: settings,
        updatedAt: new Date()
      })
      .where(eq(businesses.id, businessId))
      .returning();
    return updated[0];
  }

  async getBusinessSettings(businessId: string) {
    const business = await db.select()
      .from(businesses)
      .where(eq(businesses.id, businessId));
    return business[0]?.settings || this.getDefaultSettings();
  }

  getDefaultSettings() {
    return {
      notifications: {
        frequency: '2',
        daysBefore: '1',
        hoursBefore: '2',
        methods: {
          sms: true,
          email: true,
          push: false
        },
        latePolicy: '10'
      },
      payments: {
        schedule: 'after-shift',
        method: 'instant-pay',
        baseRate: '15.00',
        features: {
          timeTracking: false,
          breakDeduction: true,
          tipPool: false,
          taxWithholding: true,
          bonuses: false,
          commission: false
        }
      },
      advanced: {
        coverage: 'optional',
        changeWindow: '48',
        timeClock: 'app',
        payroll: 'stripe'
      }
    };
  }

  // SMS Notification System
  async sendShiftNotification(employeeId: string, shiftDetails: any, notificationSettings: any) {
    const employee = await db.select({
      employee: employees,
      user: users
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .where(eq(employees.id, employeeId));

    if (!employee[0] || !employee[0].user?.phone) {
      throw new Error('Employee or phone number not found');
    }

    const phoneNumber = employee[0].user.phone;
    const businessName = shiftDetails.businessName || 'Your Business';
    
    const message = this.generateShiftNotificationMessage(
      employee[0].employee.firstName || 'Team Member',
      shiftDetails,
      businessName,
      notificationSettings
    );

    // Send SMS using Twilio integration
    return await this.sendSMS(phoneNumber, message);
  }

  generateShiftNotificationMessage(employeeName: string, shiftDetails: any, businessName: string, settings: any) {
    const { title, startTime, endTime, date } = shiftDetails;
    const formattedDate = new Date(date).toLocaleDateString();
    const formattedStartTime = new Date(startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const formattedEndTime = new Date(endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    let urgencyText = '';
    if (settings.hoursBefore <= 4) {
      urgencyText = ' 🚨 URGENT REMINDER';
    }

    return `Hi ${employeeName}! ${urgencyText}

📅 Upcoming Shift at ${businessName}
• ${title}
• ${formattedDate} from ${formattedStartTime} - ${formattedEndTime}

Please confirm your availability. If you cannot make it, find a replacement or contact management immediately.

Reply CONFIRM to acknowledge or HELP for assistance.

- MarketPace Business Scheduling`;
  }

  async sendSMS(phoneNumber: string, message: string) {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log(`SMS sent successfully. SID: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  // Enhanced SMS Invitation System
  async sendSMSInvitation(phoneNumber: string, inviteData: any) {
    const { role, businessName, inviteLink } = inviteData;
    
    const message = `🎯 Team Invitation - ${businessName}

You're invited to join our team as ${role}!

${businessName} uses MarketPace Pro for professional scheduling and instant payments. Join thousands of team members earning money with flexible shifts.

✅ Instant payments after each shift
✅ Professional scheduling system  
✅ SMS shift reminders
✅ Easy shift swapping

Join now: ${inviteLink}

Questions? Reply to this message.

- ${businessName} via MarketPace Pro`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Payment Processing Integration
  async processEmployeePayment(employeeId: string, shiftId: string, paymentData: any) {
    const { amount, paymentMethod, hoursWorked, hourlyRate } = paymentData;
    
    // Calculate payment based on settings
    const totalAmount = this.calculateShiftPayment(hoursWorked, hourlyRate, paymentData);
    
    // Process payment through Stripe or selected method
    const paymentResult = await this.processStripePayment(employeeId, totalAmount, paymentMethod);
    
    // Record payment in database
    if (paymentResult.success) {
      await this.recordPayment(employeeId, shiftId, totalAmount, paymentMethod, paymentResult.transactionId);
    }
    
    return paymentResult;
  }

  calculateShiftPayment(hoursWorked: number, baseRate: number, paymentData: any) {
    let totalAmount = hoursWorked * baseRate;
    
    // Apply overtime (1.5x after 8 hours)
    if (hoursWorked > 8) {
      const overtimeHours = hoursWorked - 8;
      const regularPay = 8 * baseRate;
      const overtimePay = overtimeHours * (baseRate * 1.5);
      totalAmount = regularPay + overtimePay;
    }
    
    // Apply holiday rate if applicable
    if (paymentData.isHoliday) {
      totalAmount = hoursWorked * (baseRate * 2);
    }
    
    // Add performance bonuses if enabled
    if (paymentData.performanceBonus) {
      totalAmount += paymentData.performanceBonus;
    }
    
    return Math.round(totalAmount * 100) / 100; // Round to 2 decimal places
  }

  async processStripePayment(employeeId: string, amount: number, paymentMethod: string) {
    // Stripe payment integration would go here
    // For demo purposes, returning success
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
      amount: amount,
      method: paymentMethod
    };
  }

  async recordPayment(employeeId: string, shiftId: string, amount: number, method: string, transactionId: string) {
    // Record payment in payments table (would need to create this table)
    console.log(`Recording payment: Employee ${employeeId}, Shift ${shiftId}, Amount $${amount}, Method ${method}, Transaction ${transactionId}`);
    return true;
  }

  async updateEmployeeStatus(employeeId: string, status: 'pending' | 'active' | 'inactive') {
    const updated = await db.update(employees)
      .set({ 
        status,
        joinedAt: status === 'active' ? new Date() : undefined
      })
      .where(eq(employees.id, employeeId))
      .returning();
    return updated[0];
  }

  async acceptEmployeeInvitation(employeeId: string, userId: string) {
    const updated = await db.update(employees)
      .set({ 
        userId,
        status: 'active',
        joinedAt: new Date()
      })
      .where(eq(employees.id, employeeId))
      .returning();
    return updated[0];
  }

  // Schedule Management
  async createSchedule(scheduleData: InsertSchedule) {
    const schedule = await db.insert(schedules).values(scheduleData).returning();

    // Notify the assigned employee
    const employee = await db.select().from(employees).where(eq(employees.id, scheduleData.employeeId));
    if (employee[0]?.userId) {
      await this.createNotification({
        userId: employee[0].userId,
        businessId: scheduleData.businessId,
        type: 'schedule_assignment',
        title: 'New shift assigned',
        message: `You have been assigned to ${scheduleData.title}`,
        data: { scheduleId: schedule[0].id }
      });
    }

    return schedule[0];
  }

  async getBusinessSchedules(businessId: string, startDate?: Date, endDate?: Date) {
    let query = db.select({
      schedule: schedules,
      employee: employees,
      user: users
    })
    .from(schedules)
    .leftJoin(employees, eq(schedules.employeeId, employees.id))
    .leftJoin(users, eq(employees.userId, users.id))
    .where(eq(schedules.businessId, businessId));

    if (startDate) {
      query = query.where(and(
        eq(schedules.businessId, businessId),
        gte(schedules.startTime, startDate)
      ));
    }

    if (endDate) {
      query = query.where(and(
        eq(schedules.businessId, businessId),
        lte(schedules.startTime, endDate)
      ));
    }

    return await query.orderBy(schedules.startTime);
  }

  async getEmployeeSchedules(employeeId: string, startDate?: Date, endDate?: Date) {
    let query = db.select()
      .from(schedules)
      .where(eq(schedules.employeeId, employeeId));

    if (startDate && endDate) {
      query = query.where(and(
        eq(schedules.employeeId, employeeId),
        gte(schedules.startTime, startDate),
        lte(schedules.startTime, endDate)
      ));
    }

    return await query.orderBy(schedules.startTime);
  }

  async updateScheduleStatus(scheduleId: string, status: 'confirmed' | 'declined' | 'cancelled', userId?: string) {
    const schedule = await db.select().from(schedules).where(eq(schedules.id, scheduleId));
    if (!schedule[0]) throw new Error('Schedule not found');

    const updated = await db.update(schedules)
      .set({ 
        status,
        confirmedAt: status === 'confirmed' ? new Date() : undefined,
        declinedAt: status === 'declined' ? new Date() : undefined,
        cancelledAt: status === 'cancelled' ? new Date() : undefined
      })
      .where(eq(schedules.id, scheduleId))
      .returning();

    // If declined, create a fill-in request
    if (status === 'declined') {
      await this.createFillInFromSchedule(schedule[0]);
    }

    // Notify business owner about status change
    const business = await db.select().from(businesses).where(eq(businesses.id, schedule[0].businessId));
    if (business[0]) {
      await this.createNotification({
        userId: business[0].ownerId,
        businessId: schedule[0].businessId,
        type: 'schedule_status_change',
        title: `Schedule ${status}`,
        message: `${schedule[0].title} has been ${status}`,
        data: { scheduleId }
      });
    }

    return updated[0];
  }

  // Fill-in Request Management
  async createFillInRequest(fillInData: InsertFillInRequest) {
    const fillIn = await db.insert(fillInRequests).values(fillInData).returning();

    // Notify all active employees in the business
    await this.notifyAllEmployeesAboutFillIn(fillInData.businessId, fillIn[0]);

    return fillIn[0];
  }

  async createFillInFromSchedule(schedule: any) {
    const fillInData: InsertFillInRequest = {
      businessId: schedule.businessId,
      originalScheduleId: schedule.id,
      title: `Fill-in needed: ${schedule.title}`,
      description: `Urgent fill-in needed for ${schedule.title}`,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      urgencyLevel: 'high',
      status: 'open',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    return await this.createFillInRequest(fillInData);
  }

  async getBusinessFillInRequests(businessId: string) {
    return await db.select()
      .from(fillInRequests)
      .where(eq(fillInRequests.businessId, businessId))
      .orderBy(desc(fillInRequests.createdAt));
  }

  async claimFillInRequest(fillInId: string, employeeId: string) {
    const fillIn = await db.select().from(fillInRequests).where(eq(fillInRequests.id, fillInId));
    if (!fillIn[0] || fillIn[0].status !== 'open') {
      throw new Error('Fill-in request not available');
    }

    const updated = await db.update(fillInRequests)
      .set({ 
        claimedBy: employeeId,
        claimedAt: new Date(),
        status: 'claimed'
      })
      .where(eq(fillInRequests.id, fillInId))
      .returning();

    // Notify business owner
    const business = await db.select().from(businesses).where(eq(businesses.id, fillIn[0].businessId));
    if (business[0]) {
      const employee = await db.select().from(employees).where(eq(employees.id, employeeId));
      await this.createNotification({
        userId: business[0].ownerId,
        businessId: fillIn[0].businessId,
        type: 'fill_in_claimed',
        title: 'Fill-in request claimed',
        message: `${employee[0]?.firstName} ${employee[0]?.lastName} has claimed the fill-in for ${fillIn[0].title}`,
        data: { fillInId }
      });
    }

    return updated[0];
  }

  async confirmFillIn(fillInId: string) {
    const updated = await db.update(fillInRequests)
      .set({ 
        status: 'filled',
        filledAt: new Date()
      })
      .where(eq(fillInRequests.id, fillInId))
      .returning();

    return updated[0];
  }

  // Announcement Management
  async createAnnouncement(announcementData: InsertAnnouncement) {
    const announcement = await db.insert(announcements).values(announcementData).returning();

    // Notify all employees based on target audience
    const employees_list = await this.getBusinessEmployees(announcementData.businessId);
    
    for (const emp of employees_list) {
      if (emp.employee.userId && this.shouldReceiveAnnouncement(emp.employee, announcementData.targetAudience)) {
        await this.createNotification({
          userId: emp.employee.userId,
          businessId: announcementData.businessId,
          type: 'announcement',
          title: announcementData.title,
          message: announcementData.content,
          data: { announcementId: announcement[0].id }
        });
      }
    }

    return announcement[0];
  }

  async getBusinessAnnouncements(businessId: string) {
    return await db.select()
      .from(announcements)
      .where(eq(announcements.businessId, businessId))
      .orderBy(desc(announcements.createdAt));
  }

  // Notification Management
  async createNotification(notificationData: InsertNotification) {
    const notification = await db.insert(notifications).values(notificationData).returning();
    return notification[0];
  }

  async getUserNotifications(userId: string, limit: number = 20) {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(notificationId: string) {
    const updated = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))
      .returning();
    return updated[0];
  }

  async markAllNotificationsAsRead(userId: string) {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Helper methods
  private async notifyAllEmployeesAboutFillIn(businessId: string, fillIn: any) {
    const employees_list = await this.getBusinessEmployees(businessId);
    
    for (const emp of employees_list) {
      if (emp.employee.userId && emp.employee.status === 'active') {
        await this.createNotification({
          userId: emp.employee.userId,
          businessId: businessId,
          type: 'fill_in_request',
          title: 'Urgent fill-in needed',
          message: `${fillIn.title} - ${fillIn.urgencyLevel} priority`,
          data: { fillInId: fillIn.id }
        });
      }
    }
  }

  private shouldReceiveAnnouncement(employee: any, targetAudience: string): boolean {
    switch (targetAudience) {
      case 'all':
        return true;
      case 'managers':
        return employee.role === 'manager';
      case 'employees':
        return employee.role !== 'manager';
      default:
        return true;
    }
  }

  // Dashboard Statistics
  async getBusinessStats(businessId: string) {
    const activeEmployees = await db.select()
      .from(employees)
      .where(and(eq(employees.businessId, businessId), eq(employees.status, 'active')));

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

    const thisWeekSchedules = await db.select()
      .from(schedules)
      .where(and(
        eq(schedules.businessId, businessId),
        gte(schedules.startTime, thisWeekStart),
        lte(schedules.startTime, thisWeekEnd)
      ));

    const pendingConfirmations = await db.select()
      .from(schedules)
      .where(and(
        eq(schedules.businessId, businessId),
        eq(schedules.status, 'scheduled'),
        eq(schedules.requiresConfirmation, true)
      ));

    const urgentFillIns = await db.select()
      .from(fillInRequests)
      .where(and(
        eq(fillInRequests.businessId, businessId),
        eq(fillInRequests.status, 'open')
      ));

    return {
      activeEmployees: activeEmployees.length,
      thisWeekShifts: thisWeekSchedules.length,
      pendingConfirmations: pendingConfirmations.length,
      urgentFillIns: urgentFillIns.length
    };
  }

  // SMS Invitation functionality
  async sendSMSInvitation(data: {
    phoneNumber: string;
    role: string;
    inviteLink: string;
    businessName: string;
  }) {
    // Import Twilio client
    const twilio = require('twilio');
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error('Twilio credentials not configured');
    }
    
    const client = twilio(accountSid, authToken);
    
    const message = `🎯 You're invited to join ${data.businessName} as a ${data.role}! 

Join our team on MarketPace:
${data.inviteLink}

MarketPace makes scheduling and team communication easy. Download the app and accept your invitation to get started!

Questions? Reply to this message.`;
    
    try {
      const result = await client.messages.create({
        body: message,
        from: twilioPhone,
        to: data.phoneNumber
      });
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error: any) {
      console.error('Twilio SMS error:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  // Generate secure invitation link
  generateInviteLink(businessId: string, role: string): string {
    const linkId = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
    return `https://marketpace.shop/invite/${linkId}?business=${businessId}&role=${role}`;
  }

  // Volunteer Management Methods
  async addVolunteer(businessId: string, volunteerData: Omit<InsertVolunteer, 'businessId'>) {
    const volunteer = await db.insert(volunteers).values({
      ...volunteerData,
      businessId,
      status: 'active'
    }).returning();

    return volunteer[0];
  }

  async getBusinessVolunteers(businessId: string) {
    return await db.select()
      .from(volunteers)
      .where(eq(volunteers.businessId, businessId))
      .orderBy(desc(volunteers.createdAt));
  }

  async getVolunteer(volunteerId: string, businessId: string) {
    const volunteer = await db.select()
      .from(volunteers)
      .where(and(eq(volunteers.id, volunteerId), eq(volunteers.businessId, businessId)));
    return volunteer[0];
  }

  async updateVolunteerStatus(volunteerId: string, status: 'active' | 'inactive' | 'on-leave') {
    const updated = await db.update(volunteers)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(volunteers.id, volunteerId))
      .returning();
    return updated[0];
  }

  async logVolunteerHours(businessId: string, hoursData: Omit<InsertVolunteerHours, 'businessId'>) {
    const hours = await db.insert(volunteerHours).values({
      ...hoursData,
      businessId,
      verified: false
    }).returning();

    // Update volunteer's total hours
    const totalHoursWorked = hoursData.totalHours;
    await db.update(volunteers)
      .set({ 
        totalHours: totalHoursWorked,
        updatedAt: new Date()
      })
      .where(eq(volunteers.id, hoursData.volunteerId));

    return hours[0];
  }

  async getVolunteerHours(businessId: string, volunteerId?: string, startDate?: Date, endDate?: Date) {
    let query = db.select({
      hours: volunteerHours,
      volunteer: volunteers
    })
    .from(volunteerHours)
    .leftJoin(volunteers, eq(volunteerHours.volunteerId, volunteers.id))
    .where(eq(volunteerHours.businessId, businessId));

    if (volunteerId) {
      query = query.where(eq(volunteerHours.volunteerId, volunteerId));
    }

    if (startDate && endDate) {
      query = query.where(and(
        gte(volunteerHours.date, startDate),
        lte(volunteerHours.date, endDate)
      ));
    }

    return await query.orderBy(desc(volunteerHours.date));
  }

  async scheduleVolunteer(businessId: string, scheduleData: Omit<InsertVolunteerSchedule, 'businessId'>) {
    const schedule = await db.insert(volunteerSchedules).values({
      ...scheduleData,
      businessId,
      status: 'scheduled'
    }).returning();

    // Send SMS notification if requested
    if (scheduleData.notificationSent) {
      const volunteer = await this.getVolunteer(scheduleData.volunteerId, businessId);
      if (volunteer && volunteer.phone) {
        await this.sendVolunteerNotification(volunteer, schedule[0]);
      }
    }

    return schedule[0];
  }

  async getVolunteerSchedules(businessId: string, volunteerId?: string, startDate?: Date, endDate?: Date) {
    let query = db.select({
      schedule: volunteerSchedules,
      volunteer: volunteers
    })
    .from(volunteerSchedules)
    .leftJoin(volunteers, eq(volunteerSchedules.volunteerId, volunteers.id))
    .where(eq(volunteerSchedules.businessId, businessId));

    if (volunteerId) {
      query = query.where(eq(volunteerSchedules.volunteerId, volunteerId));
    }

    if (startDate && endDate) {
      query = query.where(and(
        gte(volunteerSchedules.startTime, startDate),
        lte(volunteerSchedules.endTime, endDate)
      ));
    }

    return await query.orderBy(volunteerSchedules.startTime);
  }

  async verifyVolunteerHours(hoursId: string, verifiedBy: string) {
    const updated = await db.update(volunteerHours)
      .set({
        verified: true,
        verifiedBy,
        verifiedAt: new Date()
      })
      .where(eq(volunteerHours.id, hoursId))
      .returning();
    return updated[0];
  }

  async getVolunteerStats(businessId: string) {
    const volunteers = await this.getBusinessVolunteers(businessId);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyHours = await this.getVolunteerHours(businessId, undefined, thisMonth);
    
    const upcomingSchedules = await db.select()
      .from(volunteerSchedules)
      .where(and(
        eq(volunteerSchedules.businessId, businessId),
        gte(volunteerSchedules.startTime, new Date())
      ));

    const tasks = await db.select({ task: volunteerHours.task })
      .from(volunteerHours)
      .where(eq(volunteerHours.businessId, businessId))
      .groupBy(volunteerHours.task);

    const totalMonthlyHours = monthlyHours.reduce((sum, record) => 
      sum + (record.hours?.totalHours || 0), 0);

    return {
      activeVolunteers: volunteers.filter(v => v.status === 'active').length,
      totalHoursThisMonth: Math.round(totalMonthlyHours / 100), // Convert from stored format
      upcomingShifts: upcomingSchedules.length,
      differentTasks: tasks.length
    };
  }

  async sendVolunteerNotification(volunteer: any, schedule: any) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    const startTime = new Date(schedule.startTime).toLocaleString();
    const message = `📅 Volunteer Shift Reminder
    
Hi ${volunteer.firstName}! You're scheduled for:

${schedule.title}
${startTime}

Task: ${schedule.task}
${schedule.description ? `Details: ${schedule.description}` : ''}

Thanks for volunteering! Reply if you have questions.`;
    
    try {
      const result = await client.messages.create({
        body: message,
        from: twilioPhone,
        to: volunteer.phone
      });
      
      // Mark notification as sent
      await db.update(volunteerSchedules)
        .set({ notificationSent: true })
        .where(eq(volunteerSchedules.id, schedule.id));
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error: any) {
      console.error('Twilio SMS error:', error);
      throw new Error(`Failed to send volunteer notification: ${error.message}`);
    }
  }
}