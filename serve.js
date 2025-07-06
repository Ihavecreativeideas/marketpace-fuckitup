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
    <title>MarketPace - Community First Marketplace</title>
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
        
        const MarketPaceLanding = () => {
            const [currentStep, setCurrentStep] = useState('landing');
            
            if (currentStep === 'community') {
                return (
                    <div style={{
                        minHeight: '100vh',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        paddingBottom: '100px'
                    }}>
                        {/* Header */}
                        <div style={{padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
                            <h1 style={{margin: '0', fontSize: '28px'}}>MarketPace Community</h1>
                            <p style={{margin: '5px 0 0', opacity: 0.8}}>Connecting Your Neighborhood</p>
                        </div>
                        
                        {/* Community Content */}
                        <div style={{padding: '20px'}}>
                            <div style={{marginBottom: '30px'}}>
                                <h2 style={{fontSize: '20px', marginBottom: '15px'}}>Community Feed</h2>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', marginBottom: '15px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                        <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#4CAF50', marginRight: '10px'}}></div>
                                        <div>
                                            <div style={{fontWeight: 'bold'}}>Sarah M.</div>
                                            <div style={{fontSize: '12px', opacity: 0.7}}>2 hours ago</div>
                                        </div>
                                    </div>
                                    <p style={{margin: '0', lineHeight: 1.5}}>Just listed a barely used baby stroller! Perfect for local families. Check it out in the marketplace!</p>
                                </div>
                                
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', marginBottom: '15px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                        <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#FF9800', marginRight: '10px'}}></div>
                                        <div>
                                            <div style={{fontWeight: 'bold'}}>Mike's Handyman Services</div>
                                            <div style={{fontSize: '12px', opacity: 0.7}}>4 hours ago</div>
                                        </div>
                                    </div>
                                    <p style={{margin: '0', lineHeight: 1.5}}>Available for home repairs this week! Reasonable rates, local references. Message me for a quote.</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setCurrentStep('landing')}
                                style={{
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    borderRadius: '25px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Back to Landing
                            </button>
                        </div>
                        
                        {/* Floating Navigation */}
                        <div style={{
                            position: 'fixed',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.8)',
                            borderRadius: '30px',
                            padding: '10px 20px',
                            display: 'flex',
                            gap: '15px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            {[
                                {key: 'rent', icon: '🏠', label: 'Rent'},
                                {key: 'buysell', icon: '🛒', label: 'Buy/Sell'},
                                {key: 'jobs', icon: '🔨', label: 'Odd Jobs'},
                                {key: 'services', icon: '⚙️', label: 'Services'},
                                {key: 'shops', icon: '🏪', label: 'Shops'},
                                {key: 'hub', icon: '🎭', label: 'The Hub'},
                                {key: 'menu', icon: '☰', label: 'Menu'}
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => alert('Navigating to ' + tab.label + ' section')}
                                    style={{
                                        background: tab.key === 'community' ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'transparent',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '2px',
                                        minWidth: '60px'
                                    }}
                                >
                                    <span style={{fontSize: '16px'}}>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            }
            
            return (
                <div style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{padding: '40px 20px', textAlign: 'center'}}>
                        <h1 style={{fontSize: '48px', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
                            MarketPace
                        </h1>
                        <p style={{fontSize: '24px', marginBottom: '40px', opacity: 0.9}}>
                            Community-First Marketplace
                        </p>
                        <p style={{fontSize: '18px', maxWidth: '600px', margin: '0 auto 60px', lineHeight: 1.6}}>
                            Connecting neighbors, building communities, and empowering local commerce through our innovative platform.
                        </p>
                        
                        <button 
                            onClick={() => setCurrentStep('community')}
                            style={{
                                background: 'white',
                                color: '#667eea',
                                border: 'none',
                                padding: '16px 32px',
                                fontSize: '18px',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                transition: 'transform 0.2s'
                            }}
                        >
                            Enter MarketPace
                        </button>
                        
                        <div style={{marginTop: '80px', textAlign: 'left', maxWidth: '800px', margin: '80px auto 0'}}>
                            <h2 style={{fontSize: '32px', marginBottom: '30px', textAlign: 'center'}}>Why Join MarketPace?</h2>
                            
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '50px'}}>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '15px', backdropFilter: 'blur(10px)'}}>
                                    <h3 style={{fontSize: '20px', marginBottom: '15px', color: '#FFD700'}}>🏠 Hyperlocal Focus</h3>
                                    <p style={{lineHeight: 1.6, opacity: 0.9}}>
                                        Shop and sell within your neighborhood. Build relationships with people you might see at the grocery store.
                                    </p>
                                </div>
                                
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '15px', backdropFilter: 'blur(10px)'}}>
                                    <h3 style={{fontSize: '20px', marginBottom: '15px', color: '#FFD700'}}>🚚 Community Delivery</h3>
                                    <p style={{lineHeight: 1.6, opacity: 0.9}}>
                                        Local drivers earning fair wages. Your neighbors helping neighbors with fast, reliable delivery.
                                    </p>
                                </div>
                                
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '15px', backdropFilter: 'blur(10px)'}}>
                                    <h3 style={{fontSize: '20px', marginBottom: '15px', color: '#FFD700'}}>💰 Fair Economics</h3>
                                    <p style={{lineHeight: 1.6, opacity: 0.9}}>
                                        Money stays in your community. Transparent fees that support local growth, not distant shareholders.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        
        ReactDOM.render(<MarketPaceLanding />, document.getElementById('root'));
    </script>
</body>
</html>
`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MarketPace demo running on port ${PORT}`);
});