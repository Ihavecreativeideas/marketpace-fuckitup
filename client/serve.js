const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static('.'));

// Unified MarketPace landing page with pitch content and app demo
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarketPace - Delivering Opportunities | Community-First Marketplace</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #0d0221, #1a0633, #2d1b4e, #1e0b3d);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
            color: white;
            overflow-x: hidden;
            position: relative;
        }
        * { box-sizing: border-box; }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(0, 191, 255, 0.08) 0%, transparent 50%);
            pointer-events: none;
            z-index: 1;
        }

        /* Floating particles */
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
        }
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: linear-gradient(45deg, #00FFFF, #8A2BE2);
            opacity: 0.6;
            animation: float 6s infinite ease-in-out;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }

        /* Header styles */
        .hero-section {
            text-align: center;
            padding: 80px 20px 40px;
            position: relative;
            z-index: 10;
        }
        .hero-title {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #00FFFF, #FFFFFF, #8A2BE2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            filter: drop-shadow(0 0 10px rgba(138, 43, 226, 0.4));
        }
        .hero-subtitle {
            font-size: 20px;
            margin-bottom: 30px;
            opacity: 0.9;
            max-width: 800px;
            margin: 0 auto 30px;
        }
        .action-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin: 40px 0;
        }
        .btn {
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            position: relative;
            z-index: 10;
        }
        .btn-primary {
            background: linear-gradient(45deg, #00FFFF, #8A2BE2);
            color: white;
        }
        .btn-secondary {
            background: linear-gradient(45deg, #FF6B35, #F7931E);
            color: white;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 255, 255, 0.3);
        }

        /* Founder's message */
        .founder-section {
            max-width: 900px;
            margin: 60px auto;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            border: 2px solid rgba(0, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 10;
        }
        .founder-title {
            font-size: 28px;
            color: #00FFFF;
            margin-bottom: 20px;
            text-align: center;
        }
        .founder-message {
            font-size: 16px;
            line-height: 1.8;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .founder-signature {
            text-align: right;
            font-style: italic;
            font-size: 18px;
            color: #8A2BE2;
            margin-top: 20px;
        }

        /* Section styling */
        .section {
            max-width: 1200px;
            margin: 60px auto;
            padding: 0 20px;
            position: relative;
            z-index: 10;
        }
        .section-title {
            font-size: 32px;
            text-align: center;
            margin-bottom: 40px;
            color: #00FFFF;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
        }
        
        .particle {
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 255, 255, 0.6);
            border-radius: 50%;
            animation: float 6s infinite linear;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        }
        
        .particle:nth-child(odd) {
            background: rgba(138, 43, 226, 0.6);
            box-shadow: 0 0 10px rgba(138, 43, 226, 0.8);
            animation-duration: 8s;
        }
        
        @keyframes float {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
            }
        }
    </style>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div class="particles" id="particles"></div>
    
    <!-- Hero Section -->
    <section class="hero-section">
        <h1 class="hero-title">MarketPace</h1>
        <p class="hero-subtitle">Delivering Opportunities. Building Local Power.</p>
        <p style="font-size: 18px; margin-bottom: 40px; opacity: 0.8;">
            More than a marketplace. We deliver opportunity — supporting local shops, services, and entertainers in your community. You set the pace, we make it happen!
        </p>
        
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="scrollToDemo()">Try MarketPace Demo</button>
            <a href="/sponsorship" class="btn btn-secondary">Partner With Us</a>
        </div>
    </section>

    <!-- Founder's Pledge Section -->
    <section class="founder-section">
        <h2 class="founder-title">A Personal Pledge from Our Founder</h2>
        <div class="founder-message">
            <p>I started MarketPace after years of frustration with Facebook Marketplace and other platforms designed more for data harvesting than community building.</p>
            
            <p>I watched talented musicians lose money to ticket scammers. I saw local businesses struggle to compete with algorithms that prioritize engagement over authenticity. I experienced firsthand how platforms designed to "connect" us often leave us feeling more isolated and manipulated.</p>
            
            <p>The breaking point came when I realized these platforms aren't broken — they're working exactly as designed. They extract value from our communities and give little back.</p>
            
            <p>MarketPace is different. We're building a platform where your data stays yours, where algorithms serve community needs instead of corporate profits, and where every transaction strengthens your neighborhood rather than depleting it.</p>
            
            <p>This isn't just another app. It's a movement toward community-first technology that puts people before profits and neighbors before algorithms.</p>
        </div>
        <div class="founder-signature">— Brooke Brown, Founder</div>
    </section>

    <!-- Interactive Demo Section -->
    <section class="section" id="demo">
        <h2 class="section-title">Experience MarketPace</h2>
        <div id="root"></div>
    </section>
    <script type="text/babel">
        const { useState } = React;
        
        console.log('React and ReactDOM loaded:', typeof React, typeof ReactDOM);
        
        const MarketPaceLanding = () => {
            console.log('MarketPaceLanding component rendering');
            const [currentStep, setCurrentStep] = useState('landing');
            const [currentFilter, setCurrentFilter] = useState('all');
            const [showPostForm, setShowPostForm] = useState(false);
            const [expandedComments, setExpandedComments] = useState({});
            const [commentTexts, setCommentTexts] = useState({});
            const [currentPage, setCurrentPage] = useState('marketplace');
            const [profileSection, setProfileSection] = useState('items');
            // User's own items/posts
            const [userItems, setUserItems] = useState([
                {
                    id: 1,
                    title: 'MacBook Pro 2021',
                    description: 'Excellent condition, barely used. Perfect for students or professionals.',
                    price: 1200,
                    category: 'sell',
                    status: 'active',
                    views: 45,
                    likes: 8,
                    offers: [
                        { id: 1, amount: 1000, buyer: 'John D.', status: 'pending' },
                        { id: 2, amount: 1100, buyer: 'Sarah M.', status: 'declined' }
                    ],
                    deliveryOption: 'marketpace',
                    promoted: true,
                    createdAt: '2 days ago'
                },
                {
                    id: 2,
                    title: 'Guitar Lessons',
                    description: 'Professional guitar instructor with 10+ years experience. All skill levels welcome.',
                    price: 50,
                    category: 'services',
                    status: 'active',
                    views: 23,
                    likes: 12,
                    offers: [],
                    deliveryOption: 'pickup',
                    promoted: false,
                    createdAt: '5 days ago'
                }
            ]);

            // User analytics and profile data
            const [userAnalytics, setUserAnalytics] = useState({
                totalViews: 68,
                totalLikes: 20,
                totalOffers: 2,
                conversionRate: 15.2,
                topPerformingItem: 'MacBook Pro 2021',
                recentActivity: [
                    { type: 'view', item: 'MacBook Pro 2021', time: '2 hours ago' },
                    { type: 'offer', item: 'MacBook Pro 2021', amount: 1000, time: '1 day ago' },
                    { type: 'like', item: 'Guitar Lessons', time: '2 days ago' }
                ]
            });

            const [notifications, setNotifications] = useState([
                { id: 1, type: 'offer', message: 'New offer of $1,000 on MacBook Pro 2021', time: '1 day ago', read: false },
                { id: 2, type: 'like', message: 'Someone liked your Guitar Lessons post', time: '2 days ago', read: false },
                { id: 3, type: 'view', message: 'Your MacBook Pro 2021 got 5 new views', time: '3 days ago', read: true }
            ]);

            const [posts, setPosts] = useState([
                {
                    id: 1,
                    author: 'Sarah M.',
                    time: '2 hours ago',
                    content: 'Just listed a barely used baby stroller! Perfect for local families. Check it out in the marketplace!',
                    category: 'sell',
                    avatar: '#4CAF50',
                    likes: 12,
                    isLiked: false,
                    comments: [
                        { id: 1, author: 'Jessica L.', content: 'Is this still available?', time: '1 hour ago' }
                    ]
                },
                {
                    id: 2,
                    author: "Mike's Handyman Services",
                    time: '4 hours ago',
                    content: 'Available for home repairs this week! Reasonable rates, local references. Message me for a quote.',
                    category: 'services',
                    avatar: '#FF9800',
                    likes: 8,
                    isLiked: true,
                    comments: [
                        { id: 1, author: 'Tom R.', content: 'Sent you a message!', time: '3 hours ago' },
                        { id: 2, author: 'Linda K.', content: 'Great service last time!', time: '2 hours ago' }
                    ]
                },
                {
                    id: 3,
                    author: 'Emma Community Events',
                    time: '6 hours ago',
                    content: 'Organizing a neighborhood cleanup this Saturday at 10 AM. Join us to make our community beautiful! Free coffee and donuts for volunteers.',
                    category: 'community',
                    avatar: '#9C27B0',
                    likes: 25,
                    isLiked: false,
                    comments: [
                        { id: 1, author: 'Alex M.', content: "Count me in! I'll bring garbage bags.", time: '4 hours ago' },
                        { id: 2, author: 'Maria S.', content: 'What a great initiative!', time: '3 hours ago' }
                    ]
                },
                {
                    id: 4,
                    author: 'Local Coffee Shop',
                    time: '8 hours ago',
                    content: "New seasonal menu is here! Try our pumpkin spice latte and support local business. 10% off for MarketPace members!",
                    category: 'shops',
                    avatar: '#795548',
                    likes: 18,
                    isLiked: true,
                    comments: [
                        { id: 1, author: 'David P.', content: 'Love this place!', time: '6 hours ago' }
                    ]
                }
            ]);

            // Integration functions
            const connectTicketPlatform = async (platform) => {
                const apiKey = prompt('Enter your ' + platform.charAt(0).toUpperCase() + platform.slice(1) + ' API key:');
                if (!apiKey) return;

                let secretKey = null;
                if (platform === 'stubhub') {
                    secretKey = prompt('Enter your StubHub secret key (required for OAuth):');
                    if (!secretKey) return;
                }

                try {
                    const response = await fetch('/api/integrations/tickets/connect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ platform, apiKey, secretKey })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        alert('Successfully connected ' + platform + '! Imported ' + result.eventsImported + ' events.');
                    } else {
                        alert('Failed to connect ' + platform + ': ' + result.error);
                    }
                } catch (error) {
                    alert('Error connecting ' + platform + ': ' + error.message);
                }
            };

            // User-friendly Shopify integration
            const connectShopify = async () => {
                const storeUrl = prompt('Enter your Shopify store URL (e.g., https://your-store.myshopify.com):');
                if (!storeUrl) {
                    alert('Store URL is required for Shopify integration');
                    return;
                }
                
                const accessToken = prompt('Enter your Shopify Private App Access Token. To get this: Go to Shopify Admin > Settings > Apps > Develop apps > Create app > Generate token');
                if (!accessToken) {
                    alert('Access token is required for Shopify integration');
                    return;
                }
                
                alert('Connecting to your Shopify store...');
                
                try {
                    const response = await fetch('/api/integrations/website/test', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            websiteUrl: storeUrl,
                            platformType: 'shopify',
                            accessToken: accessToken
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert('Shopify Connected! Store: ' + result.store + ', Products: ' + result.productCount + ', Plan: ' + result.plan);
                        localStorage.setItem('shopify_connected', 'true');
                    } else {
                        alert('Connection Failed: ' + result.error);
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            };

            const connectWooCommerce = () => {
                alert('✅ WooCommerce Connected!\n\n' +
                      '🛒 Imported 23 products from your store\n' +
                      '📦 All inventory synced with MarketPace\n' +
                      '🚚 Products now available for local delivery\n\n' +
                      'Your WooCommerce customers can now get same-day delivery!');
            };

            const connectEtsy = () => {
                alert('✅ Etsy Shop Connected!\n\n' +
                      '🎨 Imported 15 handmade items from your shop\n' +
                      '📦 All products synced with MarketPace\n' +
                      '🚚 Items now available for local delivery\n\n' +
                      'Your Etsy customers can now get local delivery!');
            };

            // Social media shop connections
            const connectTikTokShop = () => {
                alert('✅ TikTok Shop Connected!\n\n' +
                      '📱 Imported 31 trending products\n' +
                      '🎬 All viral items synced with MarketPace\n' +
                      '🚚 Products now available for local delivery\n\n' +
                      'Your TikTok followers can now get instant delivery!');
            };

            const connectFacebookShop = () => {
                alert('✅ Facebook Shop Connected!\n\n' +
                      '📘 Imported 28 products from your catalog\n' +
                      '📦 All items synced with MarketPace\n' +
                      '🚚 Products now available for local delivery\n\n' +
                      'Your Facebook customers can now get same-day delivery!');
            };

            const connectInstagramShop = () => {
                alert('✅ Instagram Shop Connected!\n\n' +
                      '📸 Imported 19 featured products\n' +
                      '📦 All items synced with MarketPace\n' +
                      '🚚 Products now available for local delivery\n\n' +
                      'Your Instagram followers can now get instant delivery!');
            };

            // Facebook Marketing functions
            const connectFacebook = () => {
                alert('✅ Facebook Marketing Enabled!\n\n' +
                      '🚀 Your MarketPace listings will now automatically:\n' +
                      '• Share to Facebook with delivery links\n' +
                      '• Respond to "Is this available?" questions\n' +
                      '• Include "Order for Delivery" buttons\n\n' +
                      '📱 Ready to boost your sales through Facebook!');
            };

            const shareToFacebook = () => {
                const sampleProduct = {
                    id: 'p001',
                    title: 'Vintage Chair',
                    description: 'Beautiful vintage chair in excellent condition. Perfect for home office or dining room.',
                    price: 75
                };

                // Show immediate success with what would be posted
                alert('✅ Product shared to Facebook successfully!\n\n' +
                      '📱 Posted: "' + sampleProduct.title + '"\n' +
                      '💰 Price: $' + sampleProduct.price + '\n' +
                      '📝 Description: ' + sampleProduct.description + '\n' +
                      '🚚 Added "Order for Delivery" link\n' +
                      '🤖 Auto-replies now active for availability questions\n\n' +
                      'Link: https://marketpace.app/product/' + sampleProduct.id + '?deliver_now=true');
            };

            const PostForm = ({ onClose }) => {
                const [formData, setFormData] = useState({
                    title: '',
                    description: '',
                    category: 'community',
                    price: '',
                    image: null
                });

                const categoryOptions = ['community', 'sell', 'rent', 'jobs', 'services', 'shops', 'entertainment'];

                const handleSubmit = (e) => {
                    e.preventDefault();
                    const newPost = {
                        id: posts.length + 1,
                        author: 'You',
                        time: 'Just now',
                        content: formData.title + ' - ' + formData.description,
                        category: formData.category,
                        avatar: '#2196F3',
                        likes: 0,
                        isLiked: false,
                        comments: []
                    };
                    setPosts([newPost, ...posts]);
                    setShowPostForm(false);
                    setFormData({ title: '', description: '', category: 'community', price: '', image: null });
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

            const handleLike = (postId) => {
                setPosts(posts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            isLiked: !post.isLiked,
                            likes: post.isLiked ? post.likes - 1 : post.likes + 1
                        };
                    }
                    return post;
                }));
            };

            const addComment = (postId, commentText) => {
                if (!commentText.trim()) return;
                
                setPosts(posts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            comments: [...post.comments, {
                                id: post.comments.length + 1,
                                author: 'You',
                                content: commentText,
                                time: 'Just now'
                            }]
                        };
                    }
                    return post;
                }));
            };

            const DeliveriesPage = () => {
                const [deliveryTab, setDeliveryTab] = useState('current');
                const [currentDeliveries] = useState([
                    {
                        id: 1,
                        item: 'MacBook Pro 2021',
                        buyer: 'John D.',
                        seller: 'You',
                        status: 'In Transit',
                        driver: 'Mike Wilson',
                        estimatedArrival: '2:30 PM',
                        trackingColor: 'Dark Blue',
                        cost: '$15.50'
                    }
                ]);
                
                const [pastDeliveries] = useState([
                    {
                        id: 2,
                        item: 'Guitar Lessons',
                        buyer: 'Sarah M.',
                        seller: 'You',
                        status: 'Delivered',
                        completedAt: '2 days ago',
                        rating: 5,
                        cost: '$8.00'
                    }
                ]);

                return (
                    <div style={{padding: '20px', paddingBottom: '120px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{fontSize: '24px', margin: 0}}>My Deliveries</h2>
                        </div>

                        {/* Delivery Tabs */}
                        <div style={{
                            display: 'flex', 
                            gap: '8px', 
                            marginBottom: '25px', 
                            flexWrap: 'wrap',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '15px'
                        }}>
                            {[
                                {key: 'current', icon: '🚚', label: 'Current'},
                                {key: 'past', icon: '📦', label: 'Past Deliveries'}
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setDeliveryTab(tab.key)}
                                    style={{
                                        background: tab.key === deliveryTab 
                                            ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' 
                                            : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        minWidth: 'fit-content',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Color Legend */}
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{margin: '0 0 10px 0', fontSize: '14px'}}>📍 Tracking Legend</h4>
                            <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    <div style={{width: '12px', height: '12px', background: 'linear-gradient(45deg, #1565C0, #42A5F5)', borderRadius: '50%'}}></div>
                                    <span>Dark Blue → Light Blue (Your Purchases)</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    <div style={{width: '12px', height: '12px', background: 'linear-gradient(45deg, #C62828, #EF5350)', borderRadius: '50%'}}></div>
                                    <span>Dark Red → Light Red (Your Sales)</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Deliveries */}
                        {deliveryTab === 'current' && (
                            <div>
                                <h3 style={{marginBottom: '15px'}}>Current Deliveries ({currentDeliveries.length})</h3>
                                {currentDeliveries.map(delivery => (
                                    <div key={delivery.id} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '20px',
                                        borderRadius: '15px',
                                        marginBottom: '15px',
                                        border: '1px solid rgba(21,101,192,0.3)'
                                    }}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                                            <div>
                                                <h4 style={{margin: '0 0 5px 0', fontSize: '18px'}}>{delivery.item}</h4>
                                                <p style={{margin: '0 0 8px 0', opacity: 0.8}}>Buyer: {delivery.buyer}</p>
                                                <div style={{display: 'flex', gap: '15px', fontSize: '14px'}}>
                                                    <span style={{color: '#42A5F5'}}>🚚 {delivery.status}</span>
                                                    <span style={{opacity: 0.7}}>👨‍🚗 {delivery.driver}</span>
                                                    <span style={{opacity: 0.7}}>⏰ ETA: {delivery.estimatedArrival}</span>
                                                </div>
                                            </div>
                                            <span style={{color: '#4CAF50', fontWeight: 'bold'}}>{delivery.cost}</span>
                                        </div>
                                        
                                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                            <button style={{
                                                background: 'rgba(76,175,80,0.2)',
                                                color: 'white',
                                                border: '1px solid rgba(76,175,80,0.3)',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}>
                                                📞 Contact Driver
                                            </button>
                                            <button style={{
                                                background: 'rgba(33,150,243,0.2)',
                                                color: 'white',
                                                border: '1px solid rgba(33,150,243,0.3)',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}>
                                                📍 Track Live
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Past Deliveries */}
                        {deliveryTab === 'past' && (
                            <div>
                                <h3 style={{marginBottom: '15px'}}>Past Deliveries ({pastDeliveries.length})</h3>
                                {pastDeliveries.map(delivery => (
                                    <div key={delivery.id} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '20px',
                                        borderRadius: '15px',
                                        marginBottom: '15px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                                            <div>
                                                <h4 style={{margin: '0 0 5px 0', fontSize: '18px'}}>{delivery.item}</h4>
                                                <p style={{margin: '0 0 8px 0', opacity: 0.8}}>Buyer: {delivery.buyer}</p>
                                                <div style={{display: 'flex', gap: '15px', fontSize: '14px'}}>
                                                    <span style={{color: '#4CAF50'}}>✅ {delivery.status}</span>
                                                    <span style={{opacity: 0.7}}>📅 {delivery.completedAt}</span>
                                                    <span style={{opacity: 0.7}}>⭐ {delivery.rating}/5</span>
                                                </div>
                                            </div>
                                            <span style={{color: '#4CAF50', fontWeight: 'bold'}}>{delivery.cost}</span>
                                        </div>
                                        
                                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                            <button style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}>
                                                📄 View Receipt
                                            </button>
                                            <button style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}>
                                                ⭐ Rate Delivery
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            };

            const ReportUserPage = () => {
                const [reportData, setReportData] = useState({
                    userId: '',
                    reason: '',
                    description: ''
                });

                const submitReport = () => {
                    if (!reportData.userId || !reportData.reason) {
                        alert('Please fill in all required fields');
                        return;
                    }
                    alert('Report submitted successfully. Our team will review it within 24 hours.');
                    setCurrentPage('settings');
                };

                return (
                    <div style={{padding: '20px', paddingBottom: '120px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <button onClick={() => setCurrentPage('settings')} style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '18px',
                                cursor: 'pointer'
                            }}>← Back</button>
                            <h2 style={{fontSize: '24px', margin: 0}}>Report User</h2>
                            <div></div>
                        </div>

                        <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                            <h3 style={{margin: '0 0 15px 0', color: '#F44336'}}>🚨 Report Suspicious Activity</h3>
                            
                            <div style={{display: 'grid', gap: '15px'}}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontSize: '14px'}}>User ID or Email *</label>
                                    <input
                                        value={reportData.userId}
                                        onChange={(e) => setReportData({...reportData, userId: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            fontSize: '14px'
                                        }}
                                        placeholder="Enter user ID or email address"
                                    />
                                </div>

                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontSize: '14px'}}>Reason for Report *</label>
                                    <select
                                        value={reportData.reason}
                                        onChange={(e) => setReportData({...reportData, reason: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="scam">Scam or Fraud</option>
                                        <option value="spam">Spam or Bot Activity</option>
                                        <option value="harassment">Harassment</option>
                                        <option value="fake-listing">Fake Listings</option>
                                        <option value="payment-issues">Payment Issues</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontSize: '14px'}}>Description</label>
                                    <textarea
                                        value={reportData.description}
                                        onChange={(e) => setReportData({...reportData, description: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            fontSize: '14px',
                                            minHeight: '80px',
                                            resize: 'vertical'
                                        }}
                                        placeholder="Provide additional details about the issue..."
                                    />
                                </div>

                                <button onClick={submitReport} style={{
                                    background: '#F44336',
                                    color: 'white',
                                    border: 'none',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginTop: '10px'
                                }}>
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    </div>
                );
            };

            const PasswordRecoveryPage = () => {
                const [email, setEmail] = useState('');
                const [sent, setSent] = useState(false);

                const sendRecoveryEmail = () => {
                    if (!email) {
                        alert('Please enter your email address');
                        return;
                    }
                    setSent(true);
                };

                return (
                    <div style={{padding: '20px', paddingBottom: '120px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <button onClick={() => setCurrentPage('settings')} style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '18px',
                                cursor: 'pointer'
                            }}>← Back</button>
                            <h2 style={{fontSize: '24px', margin: 0}}>Password Recovery</h2>
                            <div></div>
                        </div>

                        <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                            {!sent ? (
                                <div>
                                    <h3 style={{margin: '0 0 15px 0'}}>🔒 Reset Your Password</h3>
                                    <p style={{margin: '0 0 20px 0', opacity: 0.8}}>
                                        Enter your email address and we'll send you a secure link to reset your password.
                                    </p>
                                    
                                    <div style={{display: 'grid', gap: '15px'}}>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                background: 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                fontSize: '16px'
                                            }}
                                            placeholder="Enter your email address"
                                        />
                                        
                                        <button onClick={sendRecoveryEmail} style={{
                                            background: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            padding: '15px',
                                            borderRadius: '10px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}>
                                            Send Recovery Email
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{textAlign: 'center'}}>
                                    <div style={{fontSize: '48px', marginBottom: '20px'}}>✅</div>
                                    <h3 style={{margin: '0 0 10px 0', color: '#4CAF50'}}>Recovery Email Sent!</h3>
                                    <p style={{margin: '0 0 20px 0', opacity: 0.8}}>
                                        Check your email inbox for password reset instructions. The link will expire in 1 hour.
                                    </p>
                                    <button onClick={() => setCurrentPage('settings')} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}>
                                        Back to Settings
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            };

            const SecurityPoliciesPage = () => {
                return (
                    <div style={{padding: '20px', paddingBottom: '120px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <button onClick={() => setCurrentPage('settings')} style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '18px',
                                cursor: 'pointer'
                            }}>← Back</button>
                            <h2 style={{fontSize: '24px', margin: 0}}>Security Policies</h2>
                            <div></div>
                        </div>

                        <div style={{display: 'grid', gap: '15px'}}>
                            {/* Data Protection */}
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                <h3 style={{margin: '0 0 15px 0', color: '#4CAF50'}}>🛡️ Data Protection</h3>
                                <ul style={{margin: 0, paddingLeft: '20px', opacity: 0.9}}>
                                    <li>End-to-end encryption for all messages</li>
                                    <li>Secure payment processing via Stripe</li>
                                    <li>No data sharing with third parties</li>
                                    <li>Regular security audits and updates</li>
                                </ul>
                            </div>

                            {/* Anti-Scammer Measures */}
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                <h3 style={{margin: '0 0 15px 0', color: '#FF9800'}}>🚨 Anti-Scammer Measures</h3>
                                <ul style={{margin: 0, paddingLeft: '20px', opacity: 0.9}}>
                                    <li>AI-powered bot detection system</li>
                                    <li>Trust score verification for all users</li>
                                    <li>Phone and email verification required</li>
                                    <li>Community reporting system</li>
                                    <li>Automatic suspicious activity flagging</li>
                                </ul>
                            </div>

                            {/* Privacy Controls */}
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                <h3 style={{margin: '0 0 15px 0', color: '#2196F3'}}>👁️ Privacy Controls</h3>
                                <ul style={{margin: 0, paddingLeft: '20px', opacity: 0.9}}>
                                    <li>Control who can see your listings</li>
                                    <li>Hide contact information until verified</li>
                                    <li>Location privacy settings</li>
                                    <li>Data export and deletion options</li>
                                </ul>
                            </div>

                            {/* Contact Security Team */}
                            <div style={{background: 'rgba(244,67,54,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(244,67,54,0.3)'}}>
                                <h3 style={{margin: '0 0 15px 0', color: '#F44336'}}>24/7 Security Support</h3>
                                <p style={{margin: '0 0 15px 0', opacity: 0.9}}>
                                    If you encounter any security issues or suspicious activity, contact our security team immediately.
                                </p>
                                <button onClick={() => alert('Security team contacted! Response within 15 minutes.')} style={{
                                    background: '#F44336',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}>
                                    Contact Security Team
                                </button>
                            </div>
                        </div>
                    </div>
                );
            };

            const SettingsPage = () => {
                const [userSafety, setUserSafety] = useState({
                    trustScore: 85,
                    emailVerified: true,
                    phoneVerified: false,
                    canPost: true,
                    reportCount: 0
                });

                const [securityStats, setSecurityStats] = useState({
                    totalUsers: 1247,
                    flaggedUsers: 12,
                    averageTrustScore: 78,
                    recentReports: 8,
                    botDetections: 3,
                    verifiedUsers: 892
                });

                const verifyPhone = () => {
                    setUserSafety({...userSafety, phoneVerified: true, trustScore: userSafety.trustScore + 10});
                    alert('Phone verification request sent! Check your messages.');
                };

                const reportUser = () => {
                    setCurrentPage('report-user');
                };

                return (
                    <div style={{padding: '20px', paddingBottom: '120px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{fontSize: '24px', margin: 0}}>Settings</h2>
                        </div>

                        <div style={{display: 'grid', gap: '15px'}}>
                            {/* Account Settings */}
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                <h3 style={{margin: '0 0 15px 0'}}>👤 Account Settings</h3>
                                <div style={{display: 'grid', gap: '10px'}}>
                                    <button onClick={() => setCurrentPage('profile')} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        📝 Edit Profile Information
                                    </button>
                                    <button onClick={() => setCurrentPage('password-recovery')} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        🔒 Change Password
                                    </button>
                                    <button onClick={() => alert('Email preferences updated!')} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        📧 Email Preferences
                                    </button>
                                </div>
                            </div>

                            {/* Scammer Protection Dashboard */}
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                <h3 style={{margin: '0 0 15px 0'}}>🛡️ Scammer Protection</h3>
                                <div style={{display: 'grid', gap: '15px'}}>
                                    {/* Your Safety Score */}
                                    <div style={{background: 'rgba(76,175,80,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(76,175,80,0.3)'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                                            <span style={{fontWeight: 'bold', color: '#4CAF50'}}>Your Trust Score</span>
                                            <span style={{fontSize: '24px', fontWeight: 'bold', color: '#4CAF50'}}>{userSafety.trustScore}</span>
                                        </div>
                                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                            <span style={{background: userSafety.emailVerified ? '#4CAF50' : '#757575', padding: '4px 8px', borderRadius: '12px', fontSize: '12px'}}>
                                                {userSafety.emailVerified ? '✓ Email Verified' : '✗ Email Not Verified'}
                                            </span>
                                            <span style={{background: userSafety.phoneVerified ? '#4CAF50' : '#757575', padding: '4px 8px', borderRadius: '12px', fontSize: '12px'}}>
                                                {userSafety.phoneVerified ? '✓ Phone Verified' : '✗ Phone Not Verified'}
                                            </span>
                                        </div>
                                        {!userSafety.phoneVerified && (
                                            <button onClick={verifyPhone} style={{
                                                background: '#4CAF50',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 15px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                marginTop: '10px'
                                            }}>
                                                Verify Phone Number
                                            </button>
                                        )}
                                    </div>

                                    {/* Community Safety Stats */}
                                    <div style={{background: 'rgba(33,150,243,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(33,150,243,0.3)'}}>
                                        <h4 style={{margin: '0 0 10px 0', color: '#2196F3'}}>Community Safety</h4>
                                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px'}}>
                                            <div>
                                                <span style={{opacity: 0.7}}>Total Users:</span>
                                                <span style={{float: 'right', fontWeight: 'bold'}}>{securityStats.totalUsers}</span>
                                            </div>
                                            <div>
                                                <span style={{opacity: 0.7}}>Verified Users:</span>
                                                <span style={{float: 'right', fontWeight: 'bold', color: '#4CAF50'}}>{securityStats.verifiedUsers}</span>
                                            </div>
                                            <div>
                                                <span style={{opacity: 0.7}}>Flagged Users:</span>
                                                <span style={{float: 'right', fontWeight: 'bold', color: '#FF9800'}}>{securityStats.flaggedUsers}</span>
                                            </div>
                                            <div>
                                                <span style={{opacity: 0.7}}>Bot Detections:</span>
                                                <span style={{float: 'right', fontWeight: 'bold', color: '#F44336'}}>{securityStats.botDetections}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Safety Actions */}
                                    <div style={{display: 'grid', gap: '10px'}}>
                                        <button onClick={reportUser} style={{
                                            background: 'rgba(244,67,54,0.2)',
                                            color: '#F44336',
                                            border: '1px solid rgba(244,67,54,0.3)',
                                            padding: '12px 15px',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            textAlign: 'left'
                                        }}>
                                            🚨 Report Suspicious User
                                        </button>
                                        <button onClick={() => alert('Block list updated!')} style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            padding: '12px 15px',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            textAlign: 'left'
                                        }}>
                                            🚫 Manage Block List
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Settings */}
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                <h3 style={{margin: '0 0 15px 0'}}>🔔 Notification Settings</h3>
                                <div style={{display: 'grid', gap: '10px'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0'}}>
                                        <span>New offers on my items</span>
                                        <button style={{background: '#4CAF50', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '12px'}}>ON</button>
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0'}}>
                                        <span>Delivery updates</span>
                                        <button style={{background: '#4CAF50', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '12px'}}>ON</button>
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0'}}>
                                        <span>Security alerts</span>
                                        <button style={{background: '#4CAF50', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '12px'}}>ON</button>
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0'}}>
                                        <span>Marketing emails</span>
                                        <button style={{background: '#757575', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '12px'}}>OFF</button>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy & Security */}
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                <h3 style={{margin: '0 0 15px 0'}}>🛡️ Privacy & Security</h3>
                                <div style={{display: 'grid', gap: '10px'}}>
                                    <button onClick={() => alert('Two-factor authentication setup!')} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        🔐 Two-Factor Authentication
                                    </button>
                                    <button onClick={() => setCurrentPage('security-policies')} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        👁️ Privacy Settings
                                    </button>
                                    <button onClick={() => alert('Data export initiated!')} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        📊 Data Export
                                    </button>
                                </div>
                            </div>

                            {/* Support */}
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                <h3 style={{margin: '0 0 15px 0'}}>❓ Support & Help</h3>
                                <div style={{display: 'grid', gap: '10px'}}>
                                    <button style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        📚 Help Center
                                    </button>
                                    <button style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        💬 Contact Support
                                    </button>
                                    <button style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        📋 Terms of Service
                                    </button>
                                </div>
                            </div>

                            {/* Account Actions */}
                            <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                <h3 style={{margin: '0 0 15px 0'}}>⚠️ Account Actions</h3>
                                <div style={{display: 'grid', gap: '10px'}}>
                                    <button style={{
                                        background: 'rgba(255,152,0,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255,152,0,0.3)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        🚪 Sign Out
                                    </button>
                                    <button style={{
                                        background: 'rgba(244,67,54,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(244,67,54,0.3)',
                                        padding: '12px 15px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}>
                                        🗑️ Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            };

            const ProfilePage = () => {
                return (
                    <div style={{padding: '20px', paddingBottom: '120px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{fontSize: '24px', margin: 0}}>My Profile</h2>
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
                                + Create New Post
                            </button>
                        </div>

                        {/* Profile Navigation */}
                        <div style={{
                            display: 'flex', 
                            gap: '8px', 
                            marginBottom: '25px', 
                            flexWrap: 'wrap',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '15px'
                        }}>
                            {[
                                {key: 'items', icon: '📦', label: 'My Items'},
                                {key: 'analytics', icon: '📊', label: 'Analytics'},
                                {key: 'promotions', icon: '🚀', label: 'Promotions'},
                                {key: 'integrations', icon: '🔗', label: 'Integrations'},
                                {key: 'notifications', icon: '🔔', label: 'Notifications'}
                            ].map(section => (
                                <button
                                    key={section.key}
                                    onClick={() => setProfileSection(section.key)}
                                    style={{
                                        background: section.key === profileSection 
                                            ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' 
                                            : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        minWidth: 'fit-content',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span>{section.icon}</span>
                                    <span>{section.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Profile Content */}
                        {profileSection === 'items' && (
                            <div>
                                <h3 style={{marginBottom: '15px'}}>My Items ({userItems.length})</h3>
                                {userItems.map(item => (
                                    <div key={item.id} style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '20px',
                                        borderRadius: '15px',
                                        marginBottom: '20px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                                            <div style={{flex: 1}}>
                                                <h4 style={{margin: '0 0 8px 0', fontSize: '18px'}}>{item.title}</h4>
                                                <p style={{margin: '0 0 10px 0', opacity: 0.8, lineHeight: 1.5}}>{item.description}</p>
                                                <div style={{display: 'flex', gap: '15px', fontSize: '14px', marginBottom: '10px'}}>
                                                    <span style={{color: '#4CAF50', fontWeight: 'bold'}}>{'$' + item.price}</span>
                                                    <span style={{opacity: 0.7}}>👁️ {item.views} views</span>
                                                    <span style={{opacity: 0.7}}>❤️ {item.likes} likes</span>
                                                    <span style={{opacity: 0.7}}>📅 {item.createdAt}</span>
                                                </div>
                                            </div>
                                            {item.promoted && (
                                                <span style={{
                                                    background: 'linear-gradient(135deg, #FF6B6B, #FF5722)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    🚀 PROMOTED
                                                </span>
                                            )}
                                        </div>

                                        {/* Offers Section */}
                                        {item.offers.length > 0 && (
                                            <div style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                marginBottom: '15px'
                                            }}>
                                                <h5 style={{margin: '0 0 10px 0', fontSize: '14px'}}>Counter Offers ({item.offers.length})</h5>
                                                {item.offers.map(offer => (
                                                    <div key={offer.id} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '8px 0',
                                                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                                                    }}>
                                                        <div>
                                                            <span style={{fontWeight: 'bold'}}>{'$' + offer.amount}</span>
                                                            <span style={{marginLeft: '10px', opacity: 0.7}}>from {offer.buyer}</span>
                                                        </div>
                                                        <div style={{display: 'flex', gap: '8px'}}>
                                                            {offer.status === 'pending' && (
                                                                <>
                                                                    <button style={{
                                                                        background: '#4CAF50',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '12px',
                                                                        cursor: 'pointer'
                                                                    }}>Accept</button>
                                                                    <button style={{
                                                                        background: '#FF5722',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '12px',
                                                                        cursor: 'pointer'
                                                                    }}>Decline</button>
                                                                </>
                                                            )}
                                                            {offer.status === 'declined' && (
                                                                <span style={{color: '#FF5722', fontSize: '12px'}}>Declined</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                            <button style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}>
                                                📝 Edit Post
                                            </button>
                                            <button style={{
                                                background: item.promoted ? 'rgba(255,107,107,0.2)' : 'rgba(76,175,80,0.2)',
                                                color: 'white',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}>
                                                {item.promoted ? '🚀 Boost More' : '🚀 Promote'}
                                            </button>
                                            <button style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}>
                                                🚚 Delivery: {item.deliveryOption === 'marketpace' ? 'MarketPace' : 'Pickup'}
                                            </button>
                                            <button style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}>
                                                📊 View Analytics
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {profileSection === 'analytics' && (
                            <div>
                                <h3 style={{marginBottom: '15px'}}>Profile Analytics</h3>
                                <div style={{display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '20px'}}>
                                    <div style={{background: 'rgba(76,175,80,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(76,175,80,0.3)'}}>
                                        <h4 style={{margin: '0 0 5px 0'}}>👁️ Total Views</h4>
                                        <p style={{margin: 0, fontSize: '24px', fontWeight: 'bold'}}>{userAnalytics.totalViews}</p>
                                    </div>
                                    <div style={{background: 'rgba(255,107,107,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,107,107,0.3)'}}>
                                        <h4 style={{margin: '0 0 5px 0'}}>❤️ Total Likes</h4>
                                        <p style={{margin: 0, fontSize: '24px', fontWeight: 'bold'}}>{userAnalytics.totalLikes}</p>
                                    </div>
                                    <div style={{background: 'rgba(139,92,246,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(139,92,246,0.3)'}}>
                                        <h4 style={{margin: '0 0 5px 0'}}>💰 Total Offers</h4>
                                        <p style={{margin: 0, fontSize: '24px', fontWeight: 'bold'}}>{userAnalytics.totalOffers}</p>
                                    </div>
                                    <div style={{background: 'rgba(255,193,7,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,193,7,0.3)'}}>
                                        <h4 style={{margin: '0 0 5px 0'}}>📈 Conversion Rate</h4>
                                        <p style={{margin: 0, fontSize: '24px', fontWeight: 'bold'}}>{userAnalytics.conversionRate}%</p>
                                    </div>
                                </div>
                                
                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px', marginBottom: '20px'}}>
                                    <h4 style={{margin: '0 0 15px 0'}}>🏆 Top Performing Item</h4>
                                    <p style={{margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#4CAF50'}}>{userAnalytics.topPerformingItem}</p>
                                </div>

                                <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                    <h4 style={{margin: '0 0 15px 0'}}>📅 Recent Activity</h4>
                                    {userAnalytics.recentActivity.map((activity, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '10px 0',
                                            borderBottom: index !== userAnalytics.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                        }}>
                                            <div>
                                                <span style={{fontWeight: 'bold'}}>
                                                    {activity.type === 'view' && '👁️'} 
                                                    {activity.type === 'offer' && '💰'} 
                                                    {activity.type === 'like' && '❤️'} 
                                                </span>
                                                <span style={{marginLeft: '8px'}}>
                                                    {activity.type === 'view' && 'New view on ' + activity.item}
                                                    {activity.type === 'offer' && 'New offer of $' + activity.amount + ' on ' + activity.item}
                                                    {activity.type === 'like' && 'New like on ' + activity.item}
                                                </span>
                                            </div>
                                            <span style={{opacity: 0.7, fontSize: '12px'}}>{activity.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profileSection === 'promotions' && (
                            <div>
                                <h3 style={{marginBottom: '15px'}}>🚀 Promotion Center</h3>
                                <div style={{display: 'grid', gap: '15px'}}>
                                    <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                        <h4 style={{margin: '0 0 10px 0'}}>Boost Your Posts</h4>
                                        <p style={{margin: '0 0 15px 0', opacity: 0.8}}>Increase visibility and get more views on your items</p>
                                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                            <button style={{background: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                $2 - 24 Hour Boost
                                            </button>
                                            <button style={{background: '#FF9800', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                $5 - 3 Day Boost
                                            </button>
                                            <button style={{background: '#9C27B0', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                $10 - 7 Day Boost
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                        <h4 style={{margin: '0 0 10px 0'}}>Pin to Top</h4>
                                        <p style={{margin: '0 0 15px 0', opacity: 0.8}}>Keep your post at the top of category feeds</p>
                                        <button style={{background: '#FF5722', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                            $1/day - Pin to Top
                                        </button>
                                    </div>

                                    <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                        <h4 style={{margin: '0 0 10px 0'}}>Featured Listing</h4>
                                        <p style={{margin: '0 0 15px 0', opacity: 0.8}}>Get featured on the community homepage</p>
                                        <button style={{background: '#673AB7', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                            $15 - Featured for 7 days
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {profileSection === 'integrations' && (
                            <div>
                                <h3 style={{marginBottom: '15px'}}>🔗 Platform Integrations</h3>
                                <div style={{display: 'grid', gap: '15px'}}>
                                    <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                        <h4 style={{margin: '0 0 10px 0'}}>🎫 Ticket Selling Platforms</h4>
                                        <p style={{margin: '0 0 15px 0', opacity: 0.8}}>Import events and tickets from major platforms</p>
                                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                            <button 
                                                onClick={() => connectTicketPlatform('ticketmaster')}
                                                style={{background: 'rgba(0,93,170,0.2)', color: 'white', border: '1px solid rgba(0,93,170,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + Ticketmaster
                                            </button>
                                            <button 
                                                onClick={() => connectTicketPlatform('eventbrite')}
                                                style={{background: 'rgba(247,123,33,0.2)', color: 'white', border: '1px solid rgba(247,123,33,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + Eventbrite
                                            </button>
                                            <button 
                                                onClick={() => connectTicketPlatform('stubhub')}
                                                style={{background: 'rgba(0,129,138,0.2)', color: 'white', border: '1px solid rgba(0,129,138,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + StubHub
                                            </button>
                                            <button 
                                                onClick={() => connectTicketPlatform('seatgeek')}
                                                style={{background: 'rgba(44,210,139,0.2)', color: 'white', border: '1px solid rgba(44,210,139,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + SeatGeek
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                        <h4 style={{margin: '0 0 10px 0'}}>🛒 E-commerce Platforms</h4>
                                        <p style={{margin: '0 0 15px 0', opacity: 0.8}}>Sync your existing online store with MarketPace</p>
                                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                            <button 
                                                onClick={() => connectShopify()}
                                                style={{background: 'rgba(76,175,80,0.2)', color: 'white', border: '1px solid rgba(76,175,80,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + Connect Shopify
                                            </button>
                                            <button 
                                                onClick={() => connectWooCommerce()}
                                                style={{background: 'rgba(76,175,80,0.2)', color: 'white', border: '1px solid rgba(76,175,80,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + Connect WooCommerce
                                            </button>
                                            <button 
                                                onClick={() => connectEtsy()}
                                                style={{background: 'rgba(76,175,80,0.2)', color: 'white', border: '1px solid rgba(76,175,80,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + Connect Etsy
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                        <h4 style={{margin: '0 0 10px 0'}}>📱 Social Media Shops</h4>
                                        <p style={{margin: '0 0 15px 0', opacity: 0.8}}>Import products from social commerce platforms</p>
                                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                            <button 
                                                onClick={() => connectTikTokShop()}
                                                style={{background: 'rgba(255,0,80,0.2)', color: 'white', border: '1px solid rgba(255,0,80,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + TikTok Shop
                                            </button>
                                            <button 
                                                onClick={() => connectFacebookShop()}
                                                style={{background: 'rgba(59,89,152,0.2)', color: 'white', border: '1px solid rgba(59,89,152,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + Facebook Shop
                                            </button>
                                            <button 
                                                onClick={() => connectInstagramShop()}
                                                style={{background: 'rgba(29,161,242,0.2)', color: 'white', border: '1px solid rgba(29,161,242,0.3)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                + Instagram Shop
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                        <h4 style={{margin: '0 0 10px 0'}}>🤖 Facebook Marketing Automation</h4>
                                        <p style={{margin: '0 0 15px 0', opacity: 0.8}}>Automatically share your listings on Facebook and respond to customers</p>
                                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px'}}>
                                            <button 
                                                onClick={() => connectFacebook()}
                                                style={{background: 'rgba(59,89,152,0.3)', color: 'white', border: '1px solid rgba(59,89,152,0.5)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                Enable Facebook Marketing
                                            </button>
                                            <button 
                                                onClick={() => shareToFacebook()}
                                                style={{background: 'rgba(76,175,80,0.3)', color: 'white', border: '1px solid rgba(76,175,80,0.5)', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer'}}>
                                                Share Product Demo
                                            </button>
                                        </div>
                                        <div style={{fontSize: '12px', opacity: 0.7}}>
                                            <div>✅ Share listings to Facebook automatically</div>
                                            <div>✅ Add "Order for Delivery" links to posts</div>
                                            <div>✅ Reply to "Is this available?" questions instantly</div>
                                        </div>
                                    </div>

                                    <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
                                        <h4 style={{margin: '0 0 10px 0'}}>📈 Traffic Sources</h4>
                                        <p style={{margin: '0 0 15px 0', opacity: 0.8}}>Track where your visitors are coming from</p>
                                        <div style={{fontSize: '14px'}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                                <span>Direct visits:</span><span>45%</span>
                                            </div>
                                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                                <span>Social media:</span><span>30%</span>
                                            </div>
                                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                                <span>Search engines:</span><span>25%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {profileSection === 'notifications' && (
                            <div>
                                <h3 style={{marginBottom: '15px'}}>🔔 Notifications ({notifications.filter(n => !n.read).length})</h3>
                                <div style={{display: 'grid', gap: '10px'}}>
                                    {notifications.map(notification => (
                                        <div key={notification.id} style={{
                                            background: notification.read ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                                            padding: '15px',
                                            borderRadius: '10px',
                                            border: notification.read ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(76,175,80,0.3)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{flex: 1}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px'}}>
                                                    <span>
                                                        {notification.type === 'offer' && '💰'}
                                                        {notification.type === 'like' && '❤️'}
                                                        {notification.type === 'view' && '👁️'}
                                                    </span>
                                                    {!notification.read && (
                                                        <span style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            background: '#4CAF50',
                                                            borderRadius: '50%'
                                                        }}></span>
                                                    )}
                                                </div>
                                                <p style={{margin: '0 0 5px 0', fontWeight: notification.read ? 'normal' : 'bold'}}>
                                                    {notification.message}
                                                </p>
                                                <p style={{margin: 0, fontSize: '12px', opacity: 0.7}}>{notification.time}</p>
                                            </div>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => {
                                                        setNotifications(notifications.map(n => 
                                                            n.id === notification.id ? {...n, read: true} : n
                                                        ));
                                                    }}
                                                    style={{
                                                        background: 'rgba(76,175,80,0.2)',
                                                        color: 'white',
                                                        border: '1px solid rgba(76,175,80,0.3)',
                                                        padding: '6px 12px',
                                                        borderRadius: '15px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            };

            const renderPageContent = () => {
                const filteredPosts = currentFilter === 'all' 
                    ? posts 
                    : posts.filter(post => post.category === currentFilter || (currentFilter === 'buysell' && post.category === 'sell'));

                return (
                    <div style={{padding: '20px', paddingBottom: '120px'}}>
                        {/* Header */}
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{fontSize: '24px', margin: 0}}>Community Marketplace</h2>
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
                        </div>

                        {/* Filter Buttons */}
                        <div style={{
                            display: 'flex', 
                            gap: '8px', 
                            marginBottom: '25px', 
                            flexWrap: 'wrap',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '15px'
                        }}>
                            {[
                                {key: 'all', icon: '🌟', label: 'All Posts'},
                                {key: 'community', icon: '🏘️', label: 'Community'},
                                {key: 'sell', icon: '🛒', label: 'For Sale'},
                                {key: 'rent', icon: '🏠', label: 'For Rent'},
                                {key: 'jobs', icon: '🔨', label: 'Jobs'},
                                {key: 'services', icon: '⚙️', label: 'Services'},
                                {key: 'shops', icon: '🏪', label: 'Shops'},
                                {key: 'entertainment', icon: '🎭', label: 'Entertainment'}
                            ].map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => setCurrentFilter(filter.key)}
                                    style={{
                                        background: filter.key === currentFilter 
                                            ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' 
                                            : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        minWidth: 'fit-content',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span>{filter.icon}</span>
                                    <span>{filter.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Posts Feed */}
                        <div>
                            {filteredPosts.length === 0 ? (
                                <div style={{textAlign: 'center', padding: '40px', opacity: 0.7}}>
                                    <p>No posts yet in this section. Be the first to post!</p>
                                </div>
                            ) : (
                                filteredPosts.map(post => (
                                    <div key={post.id} style={{
                                            background: 'rgba(255,255,255,0.1)', 
                                            padding: '20px', 
                                            borderRadius: '15px', 
                                            marginBottom: '20px',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            {/* Post Header */}
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}}>
                                                <div style={{
                                                    width: '45px', 
                                                    height: '45px', 
                                                    borderRadius: '50%', 
                                                    background: post.avatar, 
                                                    marginRight: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}>{post.author.charAt(0)}</div>
                                                <div>
                                                    <div style={{fontWeight: 'bold', fontSize: '16px'}}>{post.author}</div>
                                                    <div style={{fontSize: '12px', opacity: 0.7}}>
                                                        {post.time} • {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Post Content */}
                                            <p style={{margin: '0 0 15px 0', lineHeight: 1.6, fontSize: '15px'}}>{post.content}</p>
                                            
                                            {/* Engagement Buttons */}
                                            <div style={{
                                                display: 'flex', 
                                                gap: '15px', 
                                                alignItems: 'center',
                                                paddingTop: '15px',
                                                borderTop: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                <button
                                                    onClick={() => handleLike(post.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: post.isLiked ? '#FF6B6B' : 'rgba(255,255,255,0.7)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '14px',
                                                        transition: 'color 0.2s'
                                                    }}
                                                >
                                                    {post.isLiked ? '❤️' : '🤍'} {post.likes}
                                                </button>
                                                
                                                <button
                                                    onClick={() => setExpandedComments({
                                                        ...expandedComments, 
                                                        [post.id]: !expandedComments[post.id]
                                                    })}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'rgba(255,255,255,0.7)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    💬 {post.comments.length}
                                                </button>
                                                
                                                <button
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'rgba(255,255,255,0.7)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    📤 Share
                                                </button>
                                            </div>
                                            
                                            {/* Comments Section */}
                                            {expandedComments[post.id] && (
                                                <div style={{marginTop: '15px'}}>
                                                    <div style={{
                                                        background: 'rgba(0,0,0,0.2)',
                                                        borderRadius: '10px',
                                                        padding: '15px',
                                                        marginBottom: '10px'
                                                    }}>
                                                        {post.comments.map(comment => (
                                                            <div key={comment.id} style={{
                                                                marginBottom: '10px',
                                                                paddingBottom: '10px',
                                                                borderBottom: comment.id !== post.comments[post.comments.length - 1].id ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                                            }}>
                                                                <div style={{fontWeight: 'bold', fontSize: '13px', marginBottom: '2px'}}>
                                                                    {comment.author}
                                                                </div>
                                                                <div style={{fontSize: '14px', marginBottom: '2px'}}>
                                                                    {comment.content}
                                                                </div>
                                                                <div style={{fontSize: '11px', opacity: 0.6}}>
                                                                    {comment.time}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        {/* Add Comment */}
                                                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                                            <input
                                                                type="text"
                                                                placeholder="Write a comment..."
                                                                value={commentTexts[post.id] || ''}
                                                                onChange={(e) => setCommentTexts({
                                                                    ...commentTexts,
                                                                    [post.id]: e.target.value
                                                                })}
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        addComment(post.id, commentTexts[post.id] || '');
                                                                        setCommentTexts({
                                                                            ...commentTexts,
                                                                            [post.id]: ''
                                                                        });
                                                                    }
                                                                }}
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '8px 12px',
                                                                    borderRadius: '20px',
                                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                                    background: 'rgba(255,255,255,0.1)',
                                                                    color: 'white',
                                                                    fontSize: '14px'
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    addComment(post.id, commentTexts[post.id] || '');
                                                                    setCommentTexts({
                                                                        ...commentTexts,
                                                                        [post.id]: ''
                                                                    });
                                                                }}
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                                                                    border: 'none',
                                                                    borderRadius: '20px',
                                                                    padding: '8px 15px',
                                                                    color: 'white',
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px'
                                                                }}
                                                            >
                                                                Post
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                ))
                            )}
                        </div>
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
                        {currentPage === 'marketplace' && renderPageContent()}
                        {currentPage === 'profile' && <ProfilePage />}
                        {currentPage === 'deliveries' && <DeliveriesPage />}
                        {currentPage === 'settings' && <SettingsPage />}
                        {currentPage === 'report-user' && <ReportUserPage />}
                        {currentPage === 'password-recovery' && <PasswordRecoveryPage />}
                        {currentPage === 'security-policies' && <SecurityPoliciesPage />}
                        
                        {/* Post Form Modal */}
                        {showPostForm && (
                            <PostForm 
                                onClose={() => setShowPostForm(false)} 
                            />
                        )}
                        
                        {/* Simple Bottom Menu */}
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
                            <button
                                onClick={() => setCurrentPage('marketplace')}
                                style={{
                                    background: currentPage === 'marketplace' ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.1)',
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
                                <span style={{fontSize: '16px'}}>🏘️</span>
                                <span>Community</span>
                            </button>
                            <button
                                onClick={() => setCurrentPage('profile')}
                                style={{
                                    background: currentPage === 'profile' ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.1)',
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
                                <span style={{fontSize: '16px'}}>👤</span>
                                <span>Profile</span>
                            </button>
                            <button
                                onClick={() => setCurrentPage('deliveries')}
                                style={{
                                    background: currentPage === 'deliveries' ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.1)',
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
                                <span style={{fontSize: '16px'}}>🚚</span>
                                <span>Deliveries</span>
                            </button>
                            <button
                                onClick={() => setCurrentPage('settings')}
                                style={{
                                    background: currentPage === 'settings' ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.1)',
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
                                <span style={{fontSize: '16px'}}>⚙️</span>
                                <span>Settings</span>
                            </button>
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
        
        try {
            console.log('About to render MarketPaceLanding');
            ReactDOM.render(<MarketPaceLanding />, document.getElementById('root'));
            console.log('Render successful');
        } catch (error) {
            console.error('Render error:', error);
            document.getElementById('root').innerHTML = '<h1>Loading Error: ' + error.message + '</h1>';
        }

        // Create floating particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 50;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random horizontal position
                particle.style.left = Math.random() * 100 + '%';
                
                // Random animation delay
                particle.style.animationDelay = Math.random() * 6 + 's';
                
                // Random size variation
                const size = Math.random() * 3 + 1;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                
                particlesContainer.appendChild(particle);
            }
        }
        
        // Initialize particles
        createParticles();

        // Scroll to demo function
        function scrollToDemo() {
            document.getElementById('demo').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    </script>

    <!-- Footer -->
    <footer style="background: rgba(0, 0, 0, 0.3); text-align: center; padding: 30px; font-size: 14px; color: #ccc; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 60px;">
        <p>&copy; 2025 MarketPace · Delivering Opportunities, Building Local Power</p>
        <p style="font-size: 12px; opacity: 0.7; margin-top: 10px;">
            "Big tech platforms have taught us to rely on strangers and algorithms.<br>
            MarketPace reminds us what happens when we invest in each other."
        </p>
    </footer>
</body>
</html>
`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MarketPace demo running on port ${PORT}`);
});