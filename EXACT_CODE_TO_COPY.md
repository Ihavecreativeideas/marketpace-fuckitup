# EXACT CODE TO COPY AND PASTE

## 1. ADMIN-LOGIN.HTML - COMPLETE FILE

Here's the exact content for admin-login.html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - MarketPace</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #1a0b3d 0%, #6b46c1 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .floating-particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .particle {
            position: absolute;
            background: rgba(0, 255, 255, 0.6);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite, glow 3s ease-in-out infinite alternate;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(120deg); }
            66% { transform: translateY(10px) rotate(240deg); }
        }

        @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.5); }
            100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.8); }
        }

        .login-container {
            background: rgba(0, 0, 0, 0.8);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
            border: 2px solid rgba(0, 255, 255, 0.4);
            backdrop-filter: blur(20px);
            width: 100%;
            max-width: 400px;
            position: relative;
            z-index: 2;
        }

        .login-title {
            color: #00ffff;
            font-size: 28px;
            text-align: center;
            margin-bottom: 30px;
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
            font-weight: 700;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            color: #e2e8f0;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(0, 255, 255, 0.3);
            border-radius: 10px;
            color: #ffffff;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        input[type="text"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: #00ffff;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
        }

        .login-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #00ffff, #0099cc);
            border: none;
            border-radius: 10px;
            color: #1a0b3d;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 20px;
        }

        .login-btn:hover {
            background: linear-gradient(135deg, #00cccc, #007799);
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0, 255, 255, 0.4);
        }

        .error-message {
            color: #ff4444;
            text-align: center;
            margin-top: 15px;
            padding: 10px;
            background: rgba(255, 68, 68, 0.1);
            border-radius: 5px;
            border: 1px solid rgba(255, 68, 68, 0.3);
            display: none;
        }

        .back-link {
            text-align: center;
            margin-top: 20px;
        }

        .back-link a {
            color: #00ffff;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
        }

        .back-link a:hover {
            color: #ffffff;
        }

        .demo-info {
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            color: #00ffff;
            font-size: 14px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="floating-particles"></div>
    
    <div class="login-container">
        <h1 class="login-title">Admin Login</h1>
        
        <div class="demo-info">
            <strong>Admin Credentials:</strong><br>
            Username: admin | Password: admin<br>
            <em>or</em><br>
            Username: marketpace_admin | Password: MP2025_Secure!
        </div>
        
        <form id="adminLoginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" placeholder="Enter admin username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter admin password" required>
            </div>

            <button type="submit" class="login-btn">Login to Admin Dashboard</button>
        </form>

        <div class="error-message" id="errorMessage"></div>

        <div class="back-link">
            <a href="/">← Back to MarketPace</a>
        </div>
    </div>

    <script>
        // Create floating particles
        function createParticles() {
            const container = document.querySelector('.floating-particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.width = Math.random() * 4 + 2 + 'px';
                particle.style.height = particle.style.width;
                particle.style.animationDelay = Math.random() * 6 + 's';
                container.appendChild(particle);
            }
        }

        // Admin login credentials
        const adminCredentials = {
            'admin': 'admin',
            'marketpace_admin': 'MP2025_Secure!'
        };

        // Handle login form submission
        document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');

            // Check credentials
            if (adminCredentials[username] && adminCredentials[username] === password) {
                // Store admin session
                localStorage.setItem('marketpace_admin', 'true');
                localStorage.setItem('admin_username', username);
                
                // Redirect to admin dashboard
                window.location.href = '/admin-dashboard';
            } else {
                // Show error message
                errorDiv.textContent = 'Invalid username or password. Try admin/admin or marketpace_admin/MP2025_Secure!';
                errorDiv.style.display = 'block';
                
                // Clear form
                document.getElementById('password').value = '';
            }
        });

        // Initialize particles
        createParticles();
    </script>
</body>
</html>
```

## 2. PITCH-PAGE.HTML - FOUNDER IMAGE SECTION

Find this section in your pitch-page.html and replace it:

```html
<img src="assets/founder-brooke-brown.jpg" alt="Brooke Brown - Founder" style="width: 180px; height: 180px; border-radius: 15px; object-fit: cover; border: 3px solid rgba(0, 255, 255, 0.5); box-shadow: 0 0 25px rgba(0, 255, 255, 0.4); margin-bottom: 15px;">
```

## 3. KEY ISSUE DIAGNOSIS

The admin login should work with these exact credentials:
- Username: admin, Password: admin
- Username: marketpace_admin, Password: MP2025_Secure!

If it's not working, the issue is that line 224 in the JavaScript needs to be:
```javascript
window.location.href = '/admin-dashboard';
```

Copy the complete admin-login.html file above to GitHub and it should work immediately.