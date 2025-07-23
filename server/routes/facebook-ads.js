const express = require('express');
const router = express.Router();
const MetaBusinessAPI = require('../meta-business-api');

const metaAPI = new MetaBusinessAPI();

// Facebook Login URL generation
router.get('/auth/login-url', (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/facebook-ads/auth/callback`;
    const loginUrl = metaAPI.generateLoginUrl(redirectUri);
    res.json({ loginUrl });
});

// OAuth callback handler
router.get('/auth/callback', async (req, res) => {
    const { code, error } = req.query;
    
    if (error) {
        return res.redirect('/member-tax-dashboard?error=auth_failed');
    }

    try {
        const redirectUri = `${req.protocol}://${req.get('host')}/api/facebook-ads/auth/callback`;
        const accessToken = await metaAPI.exchangeCodeForToken(code, redirectUri);
        
        if (accessToken) {
            // Store token in session or database
            req.session.facebookAccessToken = accessToken;
            res.redirect('/member-tax-dashboard?success=connected');
        } else {
            res.redirect('/member-tax-dashboard?error=token_failed');
        }
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/member-tax-dashboard?error=callback_failed');
    }
});

// Get ad accounts
router.get('/accounts', async (req, res) => {
    try {
        const accessToken = req.session.facebookAccessToken;
        if (!accessToken) {
            return res.status(401).json({ error: 'Not authenticated with Facebook' });
        }

        const accounts = await metaAPI.getAdAccounts(accessToken);
        res.json({ accounts });
    } catch (error) {
        console.error('Error fetching ad accounts:', error);
        res.status(500).json({ error: 'Failed to fetch ad accounts' });
    }
});

// Get ad spend data
router.get('/spend/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        const { dateRange = 'last_30_days' } = req.query;
        const accessToken = req.session.facebookAccessToken;

        if (!accessToken) {
            return res.status(401).json({ error: 'Not authenticated with Facebook' });
        }

        const spendData = await metaAPI.getAdSpend(accountId, accessToken, dateRange);
        const campaignData = await metaAPI.getCampaignSpend(accountId, accessToken, dateRange);

        res.json({ 
            totalSpend: spendData,
            campaigns: campaignData
        });
    } catch (error) {
        console.error('Error fetching ad spend:', error);
        res.status(500).json({ error: 'Failed to fetch ad spend data' });
    }
});

// Import ad spend to tax records
router.post('/import-spend', async (req, res) => {
    try {
        const { accountId, dateRange, campaigns } = req.body;
        const accessToken = req.session.facebookAccessToken;

        if (!accessToken) {
            return res.status(401).json({ error: 'Not authenticated with Facebook' });
        }

        // Get detailed spend data
        const spendData = await metaAPI.getAdSpend(accountId, accessToken, dateRange);
        
        // Process and save to tax records
        const taxRecords = spendData.map(data => ({
            date: new Date().toISOString().split('T')[0],
            description: `Facebook Ads - Account ${accountId}`,
            amount: parseFloat(data.spend || 0),
            category: 'Advertising',
            platform: 'Facebook/Instagram',
            deductible: true
        }));

        // Here you would save to your database
        // For now, we'll return the processed data
        res.json({ 
            success: true, 
            records: taxRecords,
            totalAmount: taxRecords.reduce((sum, record) => sum + record.amount, 0)
        });
    } catch (error) {
        console.error('Error importing ad spend:', error);
        res.status(500).json({ error: 'Failed to import ad spend data' });
    }
});

// Check connection status
router.get('/status', (req, res) => {
    const connected = !!req.session.facebookAccessToken;
    res.json({ connected });
});

// Disconnect Facebook
router.post('/disconnect', (req, res) => {
    delete req.session.facebookAccessToken;
    res.json({ success: true });
});

module.exports = router;