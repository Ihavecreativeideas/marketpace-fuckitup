// Quick Facebook authentication fix for MyPace
// This creates the correct redirect URI for the current domain

// Function to get the correct redirect URI based on current domain
function getCorrectRedirectUri() {
  const currentDomain = window.location.hostname;
  
  if (currentDomain.includes('workspace.ihavecreativeid.repl.co')) {
    return 'https://workspace.ihavecreativeid.repl.co/api/facebook/callback';
  } else if (currentDomain.includes('www.marketpace.shop')) {
    return 'https://www.marketpace.shop/api/facebook/callback';
  } else if (currentDomain.includes('marketpace.shop')) {
    return 'https://marketpace.shop/auth/facebook/callback';
  } else if (currentDomain.includes('localhost')) {
    return 'http://localhost:5000/api/facebook/callback';
  } else {
    return 'https://www.marketpace.shop/api/facebook/callback';
  }
}

// Function to create correct Facebook auth URL
function createFacebookAuthUrl() {
  const appId = '1043690817269912'; // Your Facebook App ID
  const redirectUri = getCorrectRedirectUri();
  const scopes = 'user_friends,pages_read_engagement,pages_show_list';
  
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
  
  console.log('Current domain:', window.location.hostname);
  console.log('Using redirect URI:', redirectUri);
  console.log('Facebook auth URL:', authUrl);
  
  return authUrl;
}

// Test the current setup
console.log('Facebook Auth Fix Loaded');
console.log('Current domain:', window.location.hostname);
console.log('Correct redirect URI:', getCorrectRedirectUri());
console.log('Facebook auth URL:', createFacebookAuthUrl());

// Export for use in MyPace
window.facebookAuthFix = {
  getCorrectRedirectUri,
  createFacebookAuthUrl
};