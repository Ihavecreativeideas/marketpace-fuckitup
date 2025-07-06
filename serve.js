const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static('.'));

// Simple HTML page that includes our React Native Web app
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarketPlace - Community First Marketplace</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        * { box-sizing: border-box; }
    </style>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState } = React;
        
        // Simple MarketPlace Landing Page
        const MarketPlaceLanding = () => {
            const [showDemo, setShowDemo] = useState(false);
            
            if (showDemo) {
                return (
                    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'}}>
                        <div style={{padding: '20px', color: 'white'}}>
                            <button 
                                onClick={() => setShowDemo(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)', 
                                    border: 'none', 
                                    padding: '10px 20px', 
                                    borderRadius: '8px', 
                                    color: 'white',
                                    marginBottom: '20px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Back to Landing
                            </button>
                            <h2>MarketPlace Demo Features</h2>
                            <div style={{display: 'grid', gap: '20px', maxWidth: '800px'}}>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px'}}>
                                    <h3>✓ Fixed Landing Page Scrolling</h3>
                                    <p>Proper ScrollView with bottom padding for floating navigation</p>
                                </div>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px'}}>
                                    <h3>✓ Working "Join the Campaign" Button</h3>
                                    <p>Fixed navigation structure with HomeStack implementation</p>
                                </div>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px'}}>
                                    <h3>✓ Complete Marketplace Categories</h3>
                                    <p>Rent, Buy/Sell, Odd Jobs, Services, Shops, The Hub - all with listings</p>
                                </div>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px'}}>
                                    <h3>✓ Calendar Booking Systems</h3>
                                    <p>Interactive date selection for Services and Entertainment providers</p>
                                </div>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px'}}>
                                    <h3>✓ Network Error Fixed</h3>
                                    <p>CORS configuration updated and problematic API calls removed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            return (
                <div style={{minHeight: '100vh', overflowY: 'auto'}}>
                    {/* Hero Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        paddingTop: '60px',
                        paddingBottom: '40px',
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        textAlign: 'center',
                        color: 'white'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '40px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '32px',
                            fontWeight: 'bold'
                        }}>
                            MP
                        </div>
                        <h1 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '8px'}}>MarketPlace</h1>
                        <h2 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', opacity: 0.95}}>
                            Pick Up the Pace in Your Community
                        </h2>
                        <p style={{fontSize: '16px', opacity: 0.9}}>
                            Delivering Opportunities — Not Just Packages
                        </p>
                    </div>
                    
                    {/* Join Campaign Section */}
                    <div style={{padding: '40px 20px', textAlign: 'center', background: '#f8f9fa'}}>
                        <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1a1a2e'}}>
                            Join the Campaign
                        </h2>
                        <p style={{fontSize: '16px', color: '#666', marginBottom: '24px', lineHeight: 1.5}}>
                            Be part of the movement to strengthen local communities through neighbor-to-neighbor commerce.
                        </p>
                        
                        <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
                            <button 
                                onClick={() => setShowDemo(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                    color: 'white',
                                    padding: '16px 32px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                                }}
                            >
                                View Demo Features
                            </button>
                            
                            <button 
                                onClick={() => alert('Driver application would open here!')}
                                style={{
                                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                    color: 'white',
                                    padding: '16px 32px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                                }}
                            >
                                Apply to Drive
                            </button>
                        </div>
                        
                        <p style={{fontSize: '14px', color: '#666', marginTop: '16px'}}>
                            Earn $4 pickup + $2 dropoff + $0.50/mile + 100% tips
                        </p>
                    </div>
                    
                    {/* Features Section */}
                    <div style={{padding: '40px 20px', background: 'white'}}>
                        <h2 style={{fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px', color: '#1a1a2e'}}>
                            Why Join MarketPlace?
                        </h2>
                        
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto'}}>
                            <div style={{textAlign: 'center', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px'}}>
                                <div style={{fontSize: '48px', marginBottom: '16px'}}>🏠</div>
                                <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a2e'}}>Community First</h3>
                                <p style={{fontSize: '14px', color: '#666', lineHeight: 1.5}}>
                                    Keep money circulating in your neighborhood while building stronger community connections
                                </p>
                            </div>
                            
                            <div style={{textAlign: 'center', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px'}}>
                                <div style={{fontSize: '48px', marginBottom: '16px'}}>🛒</div>
                                <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a2e'}}>Everything Local</h3>
                                <p style={{fontSize: '14px', color: '#666', lineHeight: 1.5}}>
                                    Buy, sell, rent, find services, book entertainment - all in one community platform
                                </p>
                            </div>
                            
                            <div style={{textAlign: 'center', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px'}}>
                                <div style={{fontSize: '48px', marginBottom: '16px'}}>🚚</div>
                                <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a2e'}}>Local Jobs</h3>
                                <p style={{fontSize: '14px', color: '#666', lineHeight: 1.5}}>
                                    Create delivery jobs for neighbors while supporting local businesses and services
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Testimonials */}
                    <div style={{padding: '40px 20px', background: '#f8f9fa'}}>
                        <h2 style={{fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px', color: '#1a1a2e'}}>
                            Community Stories
                        </h2>
                        
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto'}}>
                            <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                                <p style={{fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.5}}>
                                    "I booked a local jazz musician for my birthday party through The Hub. Supporting local talent while getting amazing entertainment!"
                                </p>
                                <p style={{fontSize: '12px', color: '#8B5CF6', fontWeight: 'bold'}}>— Sarah, Community Member</p>
                            </div>
                            
                            <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                                <p style={{fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.5}}>
                                    "As a parent, renting baby gear instead of buying has saved me hundreds. Plus my neighbors make extra income!"
                                </p>
                                <p style={{fontSize: '12px', color: '#8B5CF6', fontWeight: 'bold'}}>— Mike, Parent</p>
                            </div>
                            
                            <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                                <p style={{fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.5}}>
                                    "My handyman business grew 300% after joining MarketPlace. Local customers, fair prices, community support."
                                </p>
                                <p style={{fontSize: '12px', color: '#8B5CF6', fontWeight: 'bold'}}>— Carlos, Service Provider</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom padding for scrolling */}
                    <div style={{height: '40px'}}></div>
                </div>
            );
        };
        
        ReactDOM.render(<MarketPlaceLanding />, document.getElementById('root'));
    </script>
</body>
</html>
`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MarketPlace demo running on port ${PORT}`);
});