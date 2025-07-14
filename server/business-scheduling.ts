import { db } from "./db";
import { 
  businesses, 
  employees, 
  schedules, 
  fillInRequests, 
  announcements, 
  notifications,
  users,
  type InsertBusiness,
  type InsertEmployee,
  type InsertSchedule,
  type InsertFillInRequest,
  type InsertAnnouncement,
  type InsertNotification
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
}