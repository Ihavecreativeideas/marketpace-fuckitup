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
        
        // Simple MarketPlace Landing Page
        const MarketPaceLanding = () => {
            const [currentStep, setCurrentStep] = useState('landing');
            const [signupData, setSignupData] = useState({
                accountType: '',
                personalInfo: {},
                businessInfo: {},
                preferences: {}
            });
            
            // Step 1: Account Type Selection
            if (currentStep === 'accountType') {
                return (
                    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '40px 20px'}}>
                        <div style={{maxWidth: '600px', margin: '0 auto', color: 'white'}}>
                            <button 
                                onClick={() => setCurrentStep('landing')}
                                style={{
                                    background: 'rgba(255,255,255,0.2)', 
                                    border: 'none', 
                                    padding: '10px 20px', 
                                    borderRadius: '8px', 
                                    color: 'white',
                                    marginBottom: '30px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Back
                            </button>
                            
                            <h2 style={{fontSize: '28px', marginBottom: '20px', textAlign: 'center'}}>Choose Your Account Type</h2>
                            <p style={{textAlign: 'center', marginBottom: '40px', opacity: 0.9}}>
                                Select how you'd like to participate in your local MarketPace community
                            </p>
                            
                            <div style={{display: 'grid', gap: '20px'}}>
                                <div 
                                    onClick={() => {
                                        setSignupData({...signupData, accountType: 'personal'});
                                        setCurrentStep('personalInfo');
                                    }}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '30px',
                                        borderRadius: '15px',
                                        cursor: 'pointer',
                                        border: '2px solid transparent',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.borderColor = '#8B5CF6'}
                                    onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                                >
                                    <h3 style={{fontSize: '22px', marginBottom: '10px'}}>🏠 Personal Account</h3>
                                    <p style={{opacity: 0.9, lineHeight: 1.5}}>
                                        Perfect for individuals who want to buy, sell, and rent items in their neighborhood. 
                                        Connect with neighbors and build community relationships.
                                    </p>
                                    <div style={{marginTop: '15px', fontSize: '14px', opacity: 0.8}}>
                                        • Buy and sell personal items
                                        • Rent equipment and tools
                                        • Find local services
                                        • Book entertainment
                                    </div>
                                </div>
                                
                                <div 
                                    onClick={() => {
                                        setSignupData({...signupData, accountType: 'dual'});
                                        setCurrentStep('personalInfo');
                                    }}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '30px',
                                        borderRadius: '15px',
                                        cursor: 'pointer',
                                        border: '2px solid transparent',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.borderColor = '#8B5CF6'}
                                    onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                                >
                                    <h3 style={{fontSize: '22px', marginBottom: '10px'}}>🏢 Personal + Business Account</h3>
                                    <p style={{opacity: 0.9, lineHeight: 1.5}}>
                                        Ideal for entrepreneurs and service providers who want to grow their business 
                                        while staying connected to their community.
                                    </p>
                                    <div style={{marginTop: '15px', fontSize: '14px', opacity: 0.8}}>
                                        • Everything in Personal Account
                                        • Professional business profile
                                        • Advanced shop features
                                        • Service booking calendar
                                        • Entertainment hub access
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Step 2: Personal Information
            if (currentStep === 'personalInfo') {
                return (
                    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '40px 20px'}}>
                        <div style={{maxWidth: '600px', margin: '0 auto', color: 'white'}}>
                            <button 
                                onClick={() => setCurrentStep('accountType')}
                                style={{
                                    background: 'rgba(255,255,255,0.2)', 
                                    border: 'none', 
                                    padding: '10px 20px', 
                                    borderRadius: '8px', 
                                    color: 'white',
                                    marginBottom: '30px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Back
                            </button>
                            
                            <h2 style={{fontSize: '28px', marginBottom: '20px', textAlign: 'center'}}>Tell Us About Yourself</h2>
                            <p style={{textAlign: 'center', marginBottom: '30px', opacity: 0.9}}>
                                Help your neighbors get to know you better
                            </p>
                            
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px'}}>
                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>First Name *</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter your first name"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                
                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Last Name *</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter your last name"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                
                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Bio</label>
                                    <textarea 
                                        placeholder="Tell your neighbors about yourself, your interests, or what you're looking for..."
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                
                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Your Interests</label>
                                    <textarea 
                                        placeholder="Type your interests and hobbies, separated by commas (e.g., vintage clothing, home brewing, woodworking, yoga, local music, gardening tools, electronics, art supplies, books, gaming, photography equipment, fitness gear, handmade crafts, outdoor gear, cooking, pet supplies, etc.)"
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px',
                                            resize: 'vertical'
                                        }}
                                    />
                                    <div style={{fontSize: '12px', opacity: 0.8, marginTop: '5px'}}>
                                        💡 This helps you see relevant items first and helps local shops find their perfect customers
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        if (signupData.accountType === 'dual') {
                                            setCurrentStep('businessInfo');
                                        } else {
                                            setCurrentStep('preferences');
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                        color: 'white',
                                        padding: '15px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {signupData.accountType === 'dual' ? 'Next: Business Info' : 'Next: Preferences'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Step 3: Business Information (only for dual accounts)
            if (currentStep === 'businessInfo') {
                return (
                    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '40px 20px'}}>
                        <div style={{maxWidth: '600px', margin: '0 auto', color: 'white'}}>
                            <button 
                                onClick={() => setCurrentStep('personalInfo')}
                                style={{
                                    background: 'rgba(255,255,255,0.2)', 
                                    border: 'none', 
                                    padding: '10px 20px', 
                                    borderRadius: '8px', 
                                    color: 'white',
                                    marginBottom: '30px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Back
                            </button>
                            
                            <h2 style={{fontSize: '28px', marginBottom: '20px', textAlign: 'center'}}>Business Information</h2>
                            <p style={{textAlign: 'center', marginBottom: '30px', opacity: 0.9}}>
                                Set up your professional profile to reach local customers
                            </p>
                            
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px'}}>
                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Business Type *</label>
                                    <select 
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                    >
                                        <option value="">Select business type</option>
                                        <option value="shop">🛒 Shop (Retail/Products)</option>
                                        <option value="service">🛠 Service Provider</option>
                                        <option value="entertainment">🎭 Entertainment (The Hub)</option>
                                    </select>
                                </div>
                                
                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Business Name *</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter your business name"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                
                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Business Description</label>
                                    <textarea 
                                        placeholder="Describe your business, services, or products..."
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                
                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Contact Information</label>
                                    <input 
                                        type="text" 
                                        placeholder="Business phone, email, or website"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                
                                <button 
                                    onClick={() => setCurrentStep('preferences')}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                        color: 'white',
                                        padding: '15px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Next: Preferences
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Step 4: Preferences & Setup
            if (currentStep === 'preferences') {
                return (
                    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '40px 20px'}}>
                        <div style={{maxWidth: '600px', margin: '0 auto', color: 'white'}}>
                            <button 
                                onClick={() => setCurrentStep(signupData.accountType === 'dual' ? 'businessInfo' : 'personalInfo')}
                                style={{
                                    background: 'rgba(255,255,255,0.2)', 
                                    border: 'none', 
                                    padding: '10px 20px', 
                                    borderRadius: '8px', 
                                    color: 'white',
                                    marginBottom: '30px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Back
                            </button>
                            
                            <h2 style={{fontSize: '28px', marginBottom: '20px', textAlign: 'center'}}>Final Setup</h2>
                            <p style={{textAlign: 'center', marginBottom: '30px', opacity: 0.9}}>
                                Customize your MarketPace experience
                            </p>
                            
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px', marginBottom: '20px'}}>
                                <h3 style={{marginBottom: '15px'}}>Location Preferences</h3>
                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display: 'block', marginBottom: '8px'}}>Search Radius for Local Listings</label>
                                    <select style={{width: '100%', padding: '10px', borderRadius: '6px', border: 'none'}}>
                                        <option value="5">5 miles</option>
                                        <option value="10">10 miles</option>
                                        <option value="25">25 miles</option>
                                        <option value="50">50 miles</option>
                                    </select>
                                </div>
                                
                                <h3 style={{marginBottom: '15px', marginTop: '25px'}}>Notification Preferences</h3>
                                <label style={{display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer'}}>
                                    <input type="checkbox" defaultChecked style={{marginRight: '10px'}} />
                                    <span>New listings in my area</span>
                                </label>
                                <label style={{display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer'}}>
                                    <input type="checkbox" defaultChecked style={{marginRight: '10px'}} />
                                    <span>Messages and offers</span>
                                </label>
                                <label style={{display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer'}}>
                                    <input type="checkbox" style={{marginRight: '10px'}} />
                                    <span>Community updates and events</span>
                                </label>
                            </div>
                            
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px', marginBottom: '20px'}}>
                                <h3 style={{marginBottom: '15px'}}>Campaign Launch Benefits</h3>
                                <div style={{fontSize: '14px', lineHeight: 1.6}}>
                                    <p style={{marginBottom: '10px'}}>🎉 <strong>Free Pro Access During Campaign:</strong> All features unlocked</p>
                                    <p style={{marginBottom: '10px'}}>⭐ <strong>Early Supporter Badge:</strong> Special recognition in your community</p>
                                    <p style={{marginBottom: '10px'}}>🚀 <strong>Featured Listings:</strong> Priority placement for your posts</p>
                                    <p>💎 <strong>Lifetime Benefits:</strong> Exclusive perks when campaign ends</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setCurrentStep('welcome')}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                    color: 'white',
                                    padding: '18px',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                Join MarketPlace Community
                            </button>
                        </div>
                    </div>
                );
            }
            
            // Welcome Screen
            if (currentStep === 'welcome') {
                return (
                    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{maxWidth: '600px', textAlign: 'center', color: 'white'}}>
                            <div style={{fontSize: '60px', marginBottom: '20px'}}>🎉</div>
                            <h2 style={{fontSize: '32px', marginBottom: '20px'}}>Welcome to MarketPace!</h2>
                            <p style={{fontSize: '18px', marginBottom: '30px', opacity: 0.9}}>
                                You're now part of a community-first marketplace that strengthens neighborhoods and supports local businesses.
                            </p>
                            
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px', marginBottom: '30px'}}>
                                <h3 style={{marginBottom: '20px'}}>What's Next?</h3>
                                <div style={{textAlign: 'left', fontSize: '16px', lineHeight: 1.6}}>
                                    <p style={{marginBottom: '10px'}}>✓ Complete your profile with photos</p>
                                    <p style={{marginBottom: '10px'}}>✓ Browse local listings in your area</p>
                                    <p style={{marginBottom: '10px'}}>✓ Post your first item or service</p>
                                    <p style={{marginBottom: '10px'}}>✓ Connect with neighbors</p>
                                    <p>✓ Join community discussions</p>
                                </div>
                            </div>
                            
                            <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
                                <button 
                                    onClick={() => alert('Would navigate to MarketPace Buy/Sell section (floating navigation bar)')}
                                    style={{
                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                        color: 'white',
                                        padding: '15px 30px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Enter MarketPace Buy/Sell
                                </button>
                                
                                <button 
                                    onClick={() => setCurrentStep('landing')}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        padding: '15px 30px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Back to Landing
                                </button>
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
                        <h1 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '8px'}}>MarketPace</h1>
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
                                onClick={() => setCurrentStep('accountType')}
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
                                Join the Campaign
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
                            Why Join MarketPace?
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
                                <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a2e'}}>Enhanced Marketplace</h3>
                                <p style={{fontSize: '14px', color: '#666', lineHeight: 1.5}}>
                                    Buy, sell, rent items with counter offers, delivery options, and secure payments - like Facebook Marketplace enhanced for communities
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
                                    "My handyman business grew 300% after joining MarketPace. Local customers, fair prices, community support."
                                </p>
                                <p style={{fontSize: '12px', color: '#8B5CF6', fontWeight: 'bold'}}>— Carlos, Service Provider</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom padding for floating navigation */}
                    <div style={{height: '100px'}}></div>
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