// Facebook OAuth Redirect URI Tester
const redirectUris = [
  'https://marketpace.shop/auth/facebook/callback',
  'https://www.marketpace.shop/auth/facebook/callback',
  'https://marketpace.shop/api/auth/facebook/callback',
  'https://www.marketpace.shop/api/auth/facebook/callback',
  'https://faf26e36-4adc-420b-9f18-2050868598c7-00-16nyruavjog3u.spock.replit.dev/auth/facebook/callback',
  'https://faf26e36-4adc-420b-9f18-2050868598c7-00-16nyruavjog3u.spock.replit.dev/api/auth/facebook/callback'
];

const clientId = '1043690817269912';
const scope = 'pages_show_list,catalog_management,pages_read_engagement,business_management,commerce_account_read_orders,commerce_account_read_settings';
const state = 'facebook_shop_integration';

console.log('Testing Facebook OAuth Redirect URIs:');
console.log('=====================================\n');

redirectUris.forEach((uri, index) => {
  const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(uri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;
  
  console.log(`${index + 1}. Testing: ${uri}`);
  console.log(`   OAuth URL: ${authUrl}`);
  console.log('   Test this URL in browser to check if Facebook accepts it\n');
});

console.log('Instructions:');
console.log('1. Copy each OAuth URL above');
console.log('2. Paste into browser');
console.log('3. If Facebook shows login page (not error), that redirect URI works');
console.log('4. Use the working redirect URI in the integration');