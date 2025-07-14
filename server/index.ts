import express from 'express';
import cors from 'cors';
import path from 'path';
import { BusinessSchedulingService } from './business-scheduling';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize services
const schedulingService = new BusinessSchedulingService();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    port: port,
    timestamp: new Date().toISOString(),
    server: 'MarketPace Full Server with Volunteer Management'
  });
});

// Volunteer Management API Routes
app.post('/api/volunteers', async (req, res) => {
  try {
    const { businessId, ...volunteerData } = req.body;
    const volunteer = await schedulingService.addVolunteer(businessId, volunteerData);
    res.json(volunteer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/volunteers/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const volunteers = await schedulingService.getBusinessVolunteers(businessId);
    res.json(volunteers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/volunteer-hours', async (req, res) => {
  try {
    const { businessId, ...hoursData } = req.body;
    const hours = await schedulingService.logVolunteerHours(businessId, hoursData);
    res.json(hours);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/volunteer-hours/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { volunteerId, startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    const hours = await schedulingService.getVolunteerHours(
      businessId, 
      volunteerId as string, 
      start, 
      end
    );
    res.json(hours);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/volunteer-schedules', async (req, res) => {
  try {
    const { businessId, ...scheduleData } = req.body;
    const schedule = await schedulingService.scheduleVolunteer(businessId, scheduleData);
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/volunteer-schedules/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { volunteerId, startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    const schedules = await schedulingService.getVolunteerSchedules(
      businessId, 
      volunteerId as string, 
      start, 
      end
    );
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/volunteer-hours/:hoursId/verify', async (req, res) => {
  try {
    const { hoursId } = req.params;
    const { verifiedBy } = req.body;
    const verifiedHours = await schedulingService.verifyVolunteerHours(hoursId, verifiedBy);
    res.json(verifiedHours);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/volunteer-stats/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const stats = await schedulingService.getVolunteerStats(businessId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Business Management API Routes
app.post('/api/businesses', async (req, res) => {
  try {
    const { ownerId, ...businessData } = req.body;
    const business = await schedulingService.createBusiness(ownerId, businessData);
    res.json(business);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/businesses/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const businesses = await schedulingService.getUserBusinesses(ownerId);
    res.json(businesses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Employee Management API Routes
app.post('/api/employees', async (req, res) => {
  try {
    const { businessId, ...employeeData } = req.body;
    const employee = await schedulingService.inviteEmployee(businessId, employeeData);
    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const employees = await schedulingService.getBusinessEmployees(businessId);
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule Management API Routes
app.post('/api/schedules', async (req, res) => {
  try {
    const schedule = await schedulingService.createSchedule(req.body);
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/schedules/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    const schedules = await schedulingService.getBusinessSchedules(businessId, start, end);
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Static file routes for all HTML pages
const htmlRoutes = [
  '/', '/community', '/shops', '/services', '/rentals', '/the-hub', 
  '/menu', '/profile', '/cart', '/settings', '/delivery', '/deliveries',
  '/business-scheduling', '/interactive-map', '/item-verification',
  '/signup-login', '/message-owner', '/rental-delivery', '/support'
];

htmlRoutes.forEach(route => {
  app.get(route, (req, res) => {
    let fileName = route === '/' ? 'pitch-page.html' : route.slice(1) + '.html';
    if (route === '/menu') fileName = 'marketpace-menu.html';
    
    res.sendFile(path.join(process.cwd(), fileName), (err) => {
      if (err) {
        res.redirect('/');
      }
    });
  });
});

// Catch-all for other HTML pages
app.get('/:page', (req, res) => {
  const pageName = req.params.page;
  const filePath = path.join(process.cwd(), pageName + '.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.redirect('/');
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ MarketPace Full Server running on port ${port}`);
  console.log(`🌐 Binding to 0.0.0.0:${port} for external access`);
  console.log(`🔧 Volunteer Management API: /api/volunteers, /api/volunteer-hours, /api/volunteer-schedules`);
  console.log(`📊 Business Scheduling API: /api/businesses, /api/employees, /api/schedules`);
  console.log(`🚀 Ready for development and testing`);
}).on('error', (err) => {
  console.error(`❌ Failed to start on port ${port}:`, err.message);
});

export default app;