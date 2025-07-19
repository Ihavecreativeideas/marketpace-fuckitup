import { Router } from 'express';

const router = Router();

// Business Sponsor Management API for Pro Members
// Allows Pro members to add/manage sponsors on their business pages

// Get sponsors for a business
router.get('/api/sponsors/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // Demo sponsors data - in production, query from database
    const sponsors = [
      {
        id: 'sponsor_001',
        businessId: businessId,
        name: 'Browns Painting',
        url: 'https://brownspainting.com',
        description: 'Professional Painting Services',
        icon: '🎨',
        type: 'Legacy Sponsor',
        addedDate: '2025-01-15T00:00:00Z',
        isActive: true
      },
      {
        id: 'sponsor_002',
        businessId: businessId,
        name: 'Local Tech Solutions',
        url: 'https://example.com',
        description: 'IT Support & Web Design',
        icon: '💻',
        type: 'Community Partner',
        addedDate: '2025-07-19T00:00:00Z',
        isActive: true
      }
    ];
    
    res.json({
      success: true,
      sponsors: sponsors,
      totalSponsors: sponsors.length
    });
    
  } catch (error: any) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Add new sponsor for a business
router.post('/api/sponsors/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { name, url, description, icon, type } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Sponsor name is required'
      });
    }
    
    // Create new sponsor record
    const newSponsor = {
      id: `sponsor_${Date.now()}`,
      businessId: businessId,
      name: name,
      url: url || '',
      description: description || 'Business Partner',
      icon: icon || '🏢',
      type: type || 'Community Partner',
      addedDate: new Date().toISOString(),
      isActive: true
    };
    
    // In production, save to database
    console.log('Adding sponsor:', newSponsor);
    
    res.json({
      success: true,
      sponsor: newSponsor,
      message: `Sponsor "${name}" added successfully`
    });
    
  } catch (error: any) {
    console.error('Error adding sponsor:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update sponsor information
router.put('/api/sponsors/:sponsorId', async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const { name, url, description, icon, type, isActive } = req.body;
    
    // In production, update database record
    const updatedSponsor = {
      id: sponsorId,
      name: name,
      url: url,
      description: description,
      icon: icon,
      type: type,
      isActive: isActive !== undefined ? isActive : true,
      updatedDate: new Date().toISOString()
    };
    
    console.log('Updating sponsor:', updatedSponsor);
    
    res.json({
      success: true,
      sponsor: updatedSponsor,
      message: 'Sponsor updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete/deactivate sponsor
router.delete('/api/sponsors/:sponsorId', async (req, res) => {
  try {
    const { sponsorId } = req.params;
    
    // In production, mark as inactive or delete from database
    console.log(`Deactivating sponsor: ${sponsorId}`);
    
    res.json({
      success: true,
      message: 'Sponsor removed successfully'
    });
    
  } catch (error: any) {
    console.error('Error removing sponsor:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get sponsor analytics for business owner
router.get('/api/sponsors/:businessId/analytics', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // Demo analytics data
    const analytics = {
      totalSponsors: 2,
      activeSponsorships: 2,
      sponsorClicks: 156,
      topPerformingSponsor: 'Browns Painting',
      averageMonthlyClicks: 78,
      sponsorshipValue: '$500/month', // Estimated value
      credibilityScore: 9.2 // Out of 10
    };
    
    res.json({
      success: true,
      analytics: analytics
    });
    
  } catch (error: any) {
    console.error('Error fetching sponsor analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Track sponsor click/visit
router.post('/api/sponsors/:sponsorId/visit', async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const { visitorIP, userAgent, referrer } = req.body;
    
    // In production, log the visit for analytics
    const visitLog = {
      sponsorId: sponsorId,
      visitedAt: new Date().toISOString(),
      visitorIP: visitorIP,
      userAgent: userAgent,
      referrer: referrer
    };
    
    console.log('Sponsor visit tracked:', visitLog);
    
    res.json({
      success: true,
      message: 'Visit tracked'
    });
    
  } catch (error: any) {
    console.error('Error tracking sponsor visit:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get sponsor types/categories available
router.get('/api/sponsors/types', async (req, res) => {
  try {
    const sponsorTypes = [
      { value: 'Community Partner', label: 'Community Partner', color: '#00ffff' },
      { value: 'Event Sponsor', label: 'Event Sponsor', color: '#ff6b6b' },
      { value: 'Business Sponsor', label: 'Business Sponsor', color: '#4ecdc4' },
      { value: 'Legacy Sponsor', label: 'Legacy Sponsor', color: '#FFD700' },
      { value: 'Platinum Sponsor', label: 'Platinum Sponsor', color: '#e6e6fa' },
      { value: 'Gold Sponsor', label: 'Gold Sponsor', color: '#ffd700' },
      { value: 'Silver Sponsor', label: 'Silver Sponsor', color: '#c0c0c0' }
    ];
    
    res.json({
      success: true,
      types: sponsorTypes
    });
    
  } catch (error: any) {
    console.error('Error fetching sponsor types:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export { router as sponsorManagementRoutes };