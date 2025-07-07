#!/usr/bin/env python3
"""
MarketPace Demo Signup Handler with SMS Notifications
Handles user registration and sends SMS notifications for launch updates
"""

import os
import json
import sqlite3
import hashlib
import datetime
from twilio.rest import Client

# Twilio configuration
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER")

class DemoSignupManager:
    def __init__(self, db_path="demo_users.db"):
        self.db_path = db_path
        self.init_database()
        
        # Initialize Twilio client if credentials are available
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
            self.twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        else:
            self.twilio_client = None
            print("Warning: Twilio credentials not found. SMS notifications disabled.")
    
    def init_database(self):
        """Initialize SQLite database for demo users"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS demo_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT NOT NULL,
                city TEXT NOT NULL,
                interests TEXT,
                sms_notifications BOOLEAN DEFAULT 1,
                email_updates BOOLEAN DEFAULT 1,
                terms_accepted BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_id TEXT UNIQUE,
                launch_notified BOOLEAN DEFAULT 0,
                demo_access_granted BOOLEAN DEFAULT 1
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_user_id(self, email):
        """Generate unique user ID from email"""
        return hashlib.md5(email.encode()).hexdigest()[:12]
    
    def create_demo_user(self, user_data):
        """Create new demo user account"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            user_id = self.generate_user_id(user_data['email'])
            
            cursor.execute('''
                INSERT INTO demo_users 
                (full_name, email, phone, city, interests, sms_notifications, 
                 email_updates, terms_accepted, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_data['fullName'],
                user_data['email'],
                user_data['phone'],
                user_data['city'],
                user_data.get('interests', ''),
                user_data.get('smsNotifications', True),
                user_data.get('emailUpdates', True),
                user_data.get('termsAccepted', True),
                user_id
            ))
            
            conn.commit()
            conn.close()
            
            # Send welcome notifications
            self.send_welcome_notifications(user_data)
            
            return {
                'success': True,
                'user_id': user_id,
                'message': 'Demo account created successfully'
            }
            
        except sqlite3.IntegrityError:
            return {
                'success': False,
                'error': 'Email already registered'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_welcome_notifications(self, user_data):
        """Send welcome SMS and email notifications"""
        # Send SMS welcome message if enabled
        if user_data.get('smsNotifications') and self.twilio_client and TWILIO_PHONE_NUMBER:
            try:
                welcome_sms = f"""
🎉 Welcome to MarketPace, {user_data['fullName'].split()[0]}!

Your demo access is ready. You're now part of the movement to build stronger communities through local commerce.

🎁 EARLY SUPPORTER BENEFITS:
• Lifetime Pro features
• Special supporter badge
• First access when we launch in {user_data['city']}
• Priority driver opportunities

We'll text you when MarketPace goes live in your area!

Reply STOP to opt out anytime.
- The MarketPace Team
                """.strip()
                
                self.twilio_client.messages.create(
                    body=welcome_sms,
                    from_=TWILIO_PHONE_NUMBER,
                    to=user_data['phone']
                )
                print(f"Welcome SMS sent to {user_data['phone']}")
                
            except Exception as e:
                print(f"Failed to send SMS to {user_data['phone']}: {e}")
    
    def send_launch_notification(self, city, user_phone=None):
        """Send launch notification to users in specific city"""
        if not self.twilio_client or not TWILIO_PHONE_NUMBER:
            print("Twilio not configured for SMS notifications")
            return
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if user_phone:
            # Send to specific user
            cursor.execute('''
                SELECT full_name, phone FROM demo_users 
                WHERE phone = ? AND sms_notifications = 1 AND launch_notified = 0
            ''', (user_phone,))
        else:
            # Send to all users in city
            cursor.execute('''
                SELECT full_name, phone FROM demo_users 
                WHERE city LIKE ? AND sms_notifications = 1 AND launch_notified = 0
            ''', (f'%{city}%',))
        
        users = cursor.fetchall()
        
        for name, phone in users:
            try:
                launch_sms = f"""
🚀 MARKETPACE IS LIVE in {city.upper()}!

Hi {name.split()[0]}, the wait is over! MarketPace is now available in your area.

🎉 Your Early Supporter Benefits Are Active:
• Lifetime Pro membership
• Special founder badge
• All features unlocked
• Priority delivery opportunities

Download the app or visit MarketPace.shop to start connecting with your community!

Thanks for believing in local commerce.
- Brooke & The MarketPace Team
                """.strip()
                
                self.twilio_client.messages.create(
                    body=launch_sms,
                    from_=TWILIO_PHONE_NUMBER,
                    to=phone
                )
                
                # Mark as notified
                cursor.execute('''
                    UPDATE demo_users SET launch_notified = 1 
                    WHERE phone = ?
                ''', (phone,))
                
                print(f"Launch notification sent to {phone}")
                
            except Exception as e:
                print(f"Failed to send launch SMS to {phone}: {e}")
        
        conn.commit()
        conn.close()
    
    def get_demo_stats(self):
        """Get demo signup statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM demo_users')
        total_users = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM demo_users WHERE sms_notifications = 1')
        sms_enabled = cursor.fetchone()[0]
        
        cursor.execute('SELECT city, COUNT(*) FROM demo_users GROUP BY city ORDER BY COUNT(*) DESC LIMIT 10')
        top_cities = cursor.fetchall()
        
        cursor.execute('SELECT interests, COUNT(*) FROM demo_users WHERE interests != "" GROUP BY interests')
        interests = cursor.fetchall()
        
        conn.close()
        
        return {
            'total_users': total_users,
            'sms_enabled': sms_enabled,
            'top_cities': top_cities,
            'interests': interests
        }

# CLI interface for testing
if __name__ == "__main__":
    import sys
    
    manager = DemoSignupManager()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python demo-signup-handler.py stats")
        print("  python demo-signup-handler.py launch <city>")
        print("  python demo-signup-handler.py test-sms <phone>")
        print("  python demo-signup-handler.py create-user")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "stats":
        stats = manager.get_demo_stats()
        print(json.dumps(stats))
    
    elif command == "create-user":
        # Read user data from stdin
        user_data = json.loads(sys.stdin.read())
        result = manager.create_demo_user(user_data)
        print(json.dumps(result))
    
    elif command == "launch" and len(sys.argv) > 2:
        city = sys.argv[2]
        manager.send_launch_notification(city)
        print(f"Launch notifications sent for {city}")
    
    elif command == "test-sms" and len(sys.argv) > 2:
        phone = sys.argv[2]
        manager.send_launch_notification("Test City", phone)
        print(f"Test SMS sent to {phone}")
    
    else:
        print("Invalid command")