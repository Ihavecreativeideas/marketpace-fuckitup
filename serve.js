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
            const [currentPage, setCurrentPage] = useState('community');
            const [showPostForm, setShowPostForm] = useState(false);
            const [posts, setPosts] = useState([
                {
                    id: 1,
                    author: 'Sarah M.',
                    time: '2 hours ago',
                    content: 'Just listed a barely used baby stroller! Perfect for local families. Check it out in the marketplace!',
                    category: 'sell',
                    avatar: '#4CAF50'
                },
                {
                    id: 2,
                    author: "Mike's Handyman Services",
                    time: '4 hours ago',
                    content: 'Available for home repairs this week! Reasonable rates, local references. Message me for a quote.',
                    category: 'services',
                    avatar: '#FF9800'
                }
            ]);

            const PostForm = ({ onClose, pageType }) => {
                const [formData, setFormData] = useState({
                    title: '',
                    description: '',
                    category: pageType === 'community' ? 'sell' : pageType,
                    price: '',
                    image: null
                });

                const categoryOptions = pageType === 'community' 
                    ? ['sell', 'rent', 'jobs', 'services', 'shops', 'entertainment']
                    : [pageType];

                const handleSubmit = (e) => {
                    e.preventDefault();
                    const newPost = {
                        id: posts.length + 1,
                        author: 'You',
                        time: 'Just now',
                        content: formData.title + ' - ' + formData.description,
                        category: formData.category,
                        avatar: '#2196F3'
                    };
                    setPosts([newPost, ...posts]);
                    setShowPostForm(false);
                    setFormData({ title: '', description: '', category: pageType === 'community' ? 'sell' : pageType, price: '', image: null });
                };

                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '30px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}>
                            <h2 style={{color: '#333', marginBottom: '20px'}}>Create New Post</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '2px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                        placeholder="What are you offering?"
                                        required
                                    />
                                </div>

                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '2px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                        required
                                    >
                                        {categoryOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '2px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            minHeight: '100px',
                                            resize: 'vertical'
                                        }}
                                        placeholder="Describe what you're offering..."
                                        required
                                    />
                                </div>

                                {(formData.category === 'sell' || formData.category === 'rent') && (
                                    <div style={{marginBottom: '15px'}}>
                                        <label style={{display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>
                                            Price ({formData.category === 'rent' ? 'per day' : 'total'})
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '2px solid #ddd',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                            placeholder="Enter price"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                )}

                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>Image (Optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '2px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>

                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Post
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        style={{
                                            flex: 1,
                                            background: '#ddd',
                                            color: '#333',
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            };

            const renderPageContent = () => {
                const pageTitle = {
                    community: 'Community Feed',
                    rent: 'Rent Items',
                    buysell: 'Buy & Sell',
                    jobs: 'Odd Jobs',
                    services: 'Services',
                    shops: 'Local Shops',
                    hub: 'The Hub (Entertainment)',
                    menu: 'Main Menu'
                };

                const filteredPosts = currentPage === 'community' 
                    ? posts 
                    : posts.filter(post => post.category === currentPage || (currentPage === 'buysell' && post.category === 'sell'));

                return (
                    <div style={{padding: '20px', paddingBottom: '120px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{fontSize: '24px', margin: 0}}>{pageTitle[currentPage]}</h2>
                            {currentPage !== 'menu' && (
                                <button
                                    onClick={() => setShowPostForm(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '25px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    + Create Post
                                </button>
                            )}
                        </div>

                        {currentPage === 'menu' ? (
                            <div style={{display: 'grid', gap: '15px'}}>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px'}}>
                                    <h3 style={{margin: '0 0 10px 0'}}>👤 My Profile</h3>
                                    <p style={{margin: 0, opacity: 0.8}}>View and edit your profile information</p>
                                </div>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px'}}>
                                    <h3 style={{margin: '0 0 10px 0'}}>🚚 My Deliveries</h3>
                                    <p style={{margin: 0, opacity: 0.8}}>Track your current and past deliveries</p>
                                </div>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px'}}>
                                    <h3 style={{margin: '0 0 10px 0'}}>⚙️ Settings</h3>
                                    <p style={{margin: 0, opacity: 0.8}}>Notifications, privacy, and account settings</p>
                                </div>
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px'}}>
                                    <h3 style={{margin: '0 0 10px 0'}}>🛡️ Security & Safety</h3>
                                    <p style={{margin: 0, opacity: 0.8}}>Learn about our security policies and safety guidelines</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {filteredPosts.length === 0 ? (
                                    <div style={{textAlign: 'center', padding: '40px', opacity: 0.7}}>
                                        <p>No posts yet in this section. Be the first to post!</p>
                                    </div>
                                ) : (
                                    filteredPosts.map(post => (
                                        <div key={post.id} style={{
                                            background: 'rgba(255,255,255,0.1)', 
                                            padding: '15px', 
                                            borderRadius: '10px', 
                                            marginBottom: '15px'
                                        }}>
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                                <div style={{
                                                    width: '40px', 
                                                    height: '40px', 
                                                    borderRadius: '50%', 
                                                    background: post.avatar, 
                                                    marginRight: '10px'
                                                }}></div>
                                                <div>
                                                    <div style={{fontWeight: 'bold'}}>{post.author}</div>
                                                    <div style={{fontSize: '12px', opacity: 0.7}}>
                                                        {post.time} • {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p style={{margin: 0, lineHeight: 1.5}}>{post.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                );
            };

            if (currentStep === 'community') {
                return (
                    <div style={{
                        minHeight: '100vh',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                        {/* Header */}
                        <div style={{padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
                            <h1 style={{margin: '0', fontSize: '28px'}}>MarketPace</h1>
                            <p style={{margin: '5px 0 0', opacity: 0.8}}>Connecting Your Neighborhood</p>
                        </div>
                        
                        {/* Page Content */}
                        {renderPageContent()}
                        
                        {/* Post Form Modal */}
                        {showPostForm && (
                            <PostForm 
                                onClose={() => setShowPostForm(false)} 
                                pageType={currentPage}
                            />
                        )}
                        
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
                                {key: 'community', icon: '🏘️', label: 'Community'},
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
                                    onClick={() => setCurrentPage(tab.key)}
                                    style={{
                                        background: tab.key === currentPage ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'transparent',
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
                        
                        {/* Back to Landing Button */}
                        <button 
                            onClick={() => setCurrentStep('landing')}
                            style={{
                                position: 'fixed',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                padding: '8px 16px',
                                fontSize: '14px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            Back to Landing
                        </button>
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