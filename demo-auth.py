#!/usr/bin/env python3
"""
MarketPace Demo Authentication System
Handles login verification for demo signup users
"""

import sqlite3
import hashlib
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os

class DemoAuthHandler(BaseHTTPRequestHandler):
    def __init__(self, db_path="demo_users.db"):
        self.db_path = db_path
        
    def setup_database(self):
        """Ensure demo users database exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='demo_users'
            """)
            
            if not cursor.fetchone():
                print("Demo users table not found - please run demo signup first")
                return False
                
            conn.close()
            return True
            
        except Exception as e:
            print(f"Database setup error: {e}")
            return False
    
    def verify_demo_user(self, email, password):
        """Verify demo user credentials"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Hash the provided password
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cursor.execute("""
                SELECT user_id, email, phone, full_name, 
                       city, interests, created_at
                FROM demo_users 
                WHERE LOWER(email) = LOWER(?) 
                AND password_hash = ?
            """, (email, password_hash))
            
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return {
                    'user_id': user[0],
                    'email': user[1],
                    'phone': user[2],
                    'full_name': user[3],
                    'city': user[4],
                    'interests': user[5],
                    'early_supporter': True,  # All demo users are early supporters
                    'signup_date': user[6]
                }
            
            return None
            
        except Exception as e:
            print(f"User verification error: {e}")
            return None
    
    def format_phone_number(self, phone):
        """Format phone number consistently"""
        # Remove all non-digit characters
        digits_only = ''.join(filter(str.isdigit, phone))
        
        # Add country code if missing
        if len(digits_only) == 10:
            digits_only = '1' + digits_only
        
        # Format as +1XXXXXXXXXX
        if len(digits_only) == 11 and digits_only.startswith('1'):
            return f"+{digits_only}"
        
        return phone  # Return original if can't format

    def do_POST(self):
        """Handle POST requests for demo login"""
        try:
            # Parse the request path
            parsed_path = urlparse(self.path)
            
            if parsed_path.path == '/api/demo-login':
                # Get request body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                try:
                    data = json.loads(post_data.decode('utf-8'))
                    email = data.get('email', '').strip()
                    phone = data.get('phone', '').strip()
                    
                    if not email or not phone:
                        self.send_error_response(400, "Email and phone are required")
                        return
                    
                    # Setup database
                    if not self.setup_database():
                        self.send_error_response(500, "Database not available")
                        return
                    
                    # Verify user
                    user = self.verify_demo_user(email, phone)
                    
                    if user:
                        # Successful login
                        self.send_json_response({
                            'success': True,
                            'message': 'Login successful',
                            'user': user
                        })
                    else:
                        # Failed login
                        self.send_error_response(401, "Invalid credentials or user not found")
                        
                except json.JSONDecodeError:
                    self.send_error_response(400, "Invalid JSON data")
                    
            else:
                self.send_error_response(404, "Endpoint not found")
                
        except Exception as e:
            print(f"POST request error: {e}")
            self.send_error_response(500, "Internal server error")
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/demo-stats':
            # Return demo statistics
            stats = self.get_demo_stats()
            self.send_json_response(stats)
        else:
            self.send_error_response(404, "Endpoint not found")
    
    def get_demo_stats(self):
        """Get demo signup statistics"""
        try:
            if not self.setup_database():
                return {'error': 'Database not available'}
                
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get total users
            cursor.execute("SELECT COUNT(*) FROM demo_users")
            total_users = cursor.fetchone()[0]
            
            # Get users by city
            cursor.execute("""
                SELECT city, COUNT(*) 
                FROM demo_users 
                GROUP BY city 
                ORDER BY COUNT(*) DESC
            """)
            cities = cursor.fetchall()
            
            # Get early supporters
            cursor.execute("SELECT COUNT(*) FROM demo_users WHERE early_supporter = 1")
            early_supporters = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                'total_users': total_users,
                'early_supporters': early_supporters,
                'cities': [{'name': city[0], 'users': city[1]} for city in cities[:10]],
                'demo_drivers': 342,  # Simulated
                'demo_shops': 89      # Simulated
            }
            
        except Exception as e:
            print(f"Stats error: {e}")
            return {'error': 'Failed to get statistics'}
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response = json.dumps(data, indent=2)
        self.wfile.write(response.encode('utf-8'))
    
    def send_error_response(self, status_code, message):
        """Send error response"""
        self.send_json_response({
            'success': False,
            'message': message
        }, status_code)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def create_demo_auth_handler():
    """Create demo auth handler with database path"""
    class Handler(BaseHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            self.auth_handler = DemoAuthHandler()
            super().__init__(*args, **kwargs)
        
        def do_POST(self):
            self.auth_handler.do_POST = lambda: DemoAuthHandler.do_POST(self.auth_handler)
            self.auth_handler.path = self.path
            self.auth_handler.headers = self.headers
            self.auth_handler.rfile = self.rfile
            self.auth_handler.send_response = self.send_response
            self.auth_handler.send_header = self.send_header
            self.auth_handler.end_headers = self.end_headers
            self.auth_handler.wfile = self.wfile
            self.auth_handler.do_POST()
        
        def do_GET(self):
            self.auth_handler.do_GET = lambda: DemoAuthHandler.do_GET(self.auth_handler)
            self.auth_handler.path = self.path
            self.auth_handler.send_response = self.send_response
            self.auth_handler.send_header = self.send_header
            self.auth_handler.end_headers = self.end_headers
            self.auth_handler.wfile = self.wfile
            self.auth_handler.do_GET()
        
        def do_OPTIONS(self):
            self.auth_handler.do_OPTIONS = lambda: DemoAuthHandler.do_OPTIONS(self.auth_handler)
            self.auth_handler.send_response = self.send_response
            self.auth_handler.send_header = self.send_header
            self.auth_handler.end_headers = self.end_headers
            self.auth_handler.do_OPTIONS()
    
    return Handler

if __name__ == "__main__":
    print("MarketPace Demo Authentication Service")
    print("Starting server on port 8001...")
    
    server = HTTPServer(('localhost', 8001), create_demo_auth_handler())
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down demo auth server...")
        server.shutdown()