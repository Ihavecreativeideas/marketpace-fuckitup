// Meta Business API Integration for Facebook Ad Tracking
const fetch = require('node-fetch');

class MetaBusinessAPI {
    constructor() {
        this.appId = process.env.FACEBOOK_APP_ID;
        this.appSecret = process.env.FACEBOOK_APP_SECRET;
        this.baseUrl = 'https://graph.facebook.com/v18.0';
    }

    // Generate App Access Token (easier than user access token)
    async getAppAccessToken() {
        try {
            const response = await fetch(
                `${this.baseUrl}/oauth/access_token?client_id=${this.appId}&client_secret=${this.appSecret}&grant_type=client_credentials`
            );
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error getting app access token:', error);
            return null;
        }
    }

    // Simplified ad account discovery
    async getAdAccounts(userAccessToken) {
        try {
            const response = await fetch(
                `${this.baseUrl}/me/adaccounts?fields=id,name,account_status&access_token=${userAccessToken}`
            );
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching ad accounts:', error);
            return [];
        }
    }

    // Get ad spend data for a specific account
    async getAdSpend(adAccountId, userAccessToken, dateRange = 'last_30_days') {
        try {
            const response = await fetch(
                `${this.baseUrl}/${adAccountId}/insights?fields=spend,impressions,clicks,cpc,cpm&date_preset=${dateRange}&access_token=${userAccessToken}`
            );
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching ad spend:', error);
            return [];
        }
    }

    // Get campaign-level spending breakdown
    async getCampaignSpend(adAccountId, userAccessToken, dateRange = 'last_30_days') {
        try {
            const response = await fetch(
                `${this.baseUrl}/${adAccountId}/campaigns?fields=name,spend,status&date_preset=${dateRange}&access_token=${userAccessToken}`
            );
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching campaign spend:', error);
            return [];
        }
    }

    // Get Facebook Login URL for easier authentication
    generateLoginUrl(redirectUri) {
        const scope = 'ads_read,ads_management';
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
    }

    // Exchange code for access token
    async exchangeCodeForToken(code, redirectUri) {
        try {
            const response = await fetch(
                `${this.baseUrl}/oauth/access_token?client_id=${this.appId}&client_secret=${this.appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
            );
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            return null;
        }
    }
}

module.exports = MetaBusinessAPI;