const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security and CORS for web deployment
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: ['https://marketpace.shop', 'https://www.marketpace.shop', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json());
app.use('/attached_assets', express.static(path.join(__dirname, 'attached_assets')));

// Serve MarketPace app at root for MarketPace.shop domain
app.get('/', (req, res) => {
  try {
    const serveContent = fs.readFileSync('serve.js', 'utf8');
    const htmlMatch = serveContent.match(/res\.send\(`([\s\S]*?)`\);/);
    if (htmlMatch) {
      let html = htmlMatch[1];
      
      // Update title and meta for web deployment
      html = html.replace(
        '<title>MarketPace - Community First Marketplace</title>',
        `<title>MarketPace - Delivering Opportunities | Community-First Marketplace</title>
         <meta name="description" content="More than a marketplace. We deliver opportunity — supporting local shops, services, and entertainers in your community. You set the pace, we make it happen!">
         <meta property="og:title" content="MarketPace - Delivering Opportunities">
         <meta property="og:description" content="Community-first marketplace supporting local businesses with delivery services.">
         <meta property="og:url" content="https://marketpace.shop">
         <meta property="og:type" content="website">
         <meta name="twitter:card" content="summary_large_image">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">`
      );
      
      res.send(html);
    } else {
      res.status(500).send('Error loading MarketPace app');
    }
  } catch (error) {
    console.error('Error serving app:', error);
    res.status(500).send('Error loading MarketPace app');
  }
});

// Serve pitch/landing page at /pitch route
app.get('/pitch', (req, res) => {
  try {
    const pitchContent = fs.readFileSync('pitch-page.js', 'utf8');
    const htmlMatch = pitchContent.match(/res\.send\(`([\s\S]*?)`\);/);
    if (htmlMatch) {
      let html = htmlMatch[1];
      
      // Update for web deployment
      html = html.replace(
        '<title>MarketPace – Delivering Opportunities</title>',
        `<title>MarketPace – Delivering Opportunities | Founder's Story</title>
         <meta name="description" content="Learn why Brooke Brown created MarketPace as an alternative to Facebook Marketplace, focusing on community empowerment and local commerce.">
         <meta property="og:title" content="MarketPace - Founder's Pledge">
         <meta property="og:description" content="Supporting local shops, services, and entertainers in your community.">
         <meta property="og:url" content="https://marketpace.shop/pitch">`
      );
      
      res.send(html);
    } else {
      res.status(500).send('Error loading pitch page');
    }
  } catch (error) {
    console.error('Error serving pitch page:', error);
    res.status(500).send('Error loading pitch page');
  }
});

// API routes for demo functionality
app.post('/api/integrations/website/test', (req, res) => {
  const { websiteUrl, platformType, accessToken } = req.body;
  
  // Demo response for web version
  setTimeout(() => {
    res.json({
      success: true,
      store: 'Demo Store',
      productCount: 25,
      plan: 'Basic',
      message: 'Demo integration successful!'
    });
  }, 1500);
});

app.post('/api/integrations/tickets/connect', (req, res) => {
  const { platform, apiKey } = req.body;
  
  setTimeout(() => {
    res.json({
      success: true,
      eventsImported: Math.floor(Math.random() * 20) + 5,
      message: `Demo ${platform} integration successful!`
    });
  }, 1000);
});

// Sponsorship routes
app.get('/sponsorship', (req, res) => {
  try {
    const pitchContent = fs.readFileSync('pitch-page.js', 'utf8');
    const sponsorshipMatch = pitchContent.match(/app\.get\('\/sponsorship', \(req, res\) => \{[\s\S]*?res\.send\(`([\s\S]*?)`\);[\s\S]*?\}\);/);
    if (sponsorshipMatch) {
      res.send(sponsorshipMatch[1]);
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error serving sponsorship page:', error);
    res.redirect('/');
  }
});

app.get('/sponsorship/success', (req, res) => {
  try {
    const pitchContent = fs.readFileSync('pitch-page.js', 'utf8');
    const successMatch = pitchContent.match(/app\.get\('\/sponsorship\/success', \(req, res\) => \{[\s\S]*?res\.send\(`([\s\S]*?)`\);[\s\S]*?\}\);/);
    if (successMatch) {
      res.send(successMatch[1]);
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error serving sponsorship success page:', error);
    res.redirect('/');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).redirect('/');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MarketPace Web App running on port ${PORT}`);
  console.log(`Ready for deployment to MarketPace.shop`);
});

module.exports = app;