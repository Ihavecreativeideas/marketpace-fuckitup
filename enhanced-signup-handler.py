#!/usr/bin/env python3
"""
Enhanced MarketPace Signup Handler with Business Profiles
Handles comprehensive user registration with personal and business profiles
"""

import sqlite3
import hashlib
import os
import sys
import json
from datetime import datetime

class EnhancedSignupManager:
    def __init__(self, db_path="demo_users.db"):
        self.db_path = db_path
        self.ensure_enhanced_schema()
        
        # Twilio setup for SMS notifications
        self.twilio_client = None
        try:
            if os.environ.get("TWILIO_ACCOUNT_SID") and os.environ.get("TWILIO_AUTH_TOKEN"):
                from twilio.rest import Client
                self.twilio_client = Client(
                    os.environ.get("TWILIO_ACCOUNT_SID"),
                    os.environ.get("TWILIO_AUTH_TOKEN")
                )
                self.twilio_phone = os.environ.get("TWILIO_PHONE_NUMBER")
        except ImportError:
            pass
    
    def ensure_enhanced_schema(self):
        """Ensure database has all required columns for enhanced profiles"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Add new columns if they don't exist
        columns_to_add = [
            ('account_type', 'TEXT DEFAULT "personal"'),
            ('bio', 'TEXT'),
            ('business_name', 'TEXT'),
            ('business_website', 'TEXT'),
            ('business_address', 'TEXT'),
            ('business_phone', 'TEXT'),
            ('business_description', 'TEXT'),
            ('business_categories', 'TEXT'),
            ('early_supporter', 'BOOLEAN DEFAULT 1'),
            ('signup_date', 'TEXT'),
            ('country', 'TEXT'),
            ('state', 'TEXT')
        ]
        
        # Whitelist of allowed column names and definitions for security
        allowed_columns = {
            'account_type': 'TEXT DEFAULT "personal"',
            'bio': 'TEXT',
            'business_name': 'TEXT',
            'business_website': 'TEXT',
            'business_address': 'TEXT',
            'business_phone': 'TEXT',
            'business_description': 'TEXT',
            'business_categories': 'TEXT',
            'early_supporter': 'BOOLEAN DEFAULT 1',
            'signup_date': 'TEXT',
            'country': 'TEXT',
            'state': 'TEXT'
        }
        
        for column_name, column_def in columns_to_add:
            try:
                # Only proceed if column is in our whitelist with exact definition
                if column_name in allowed_columns and column_def == allowed_columns[column_name]:
                    # Safe to execute since values are from controlled whitelist
                    cursor.execute(f'ALTER TABLE demo_users ADD COLUMN {column_name} {column_def}')
            except sqlite3.OperationalError:
                pass  # Column already exists
        
        conn.commit()
        conn.close()
    
    def generate_user_id(self, email):
        """Generate unique user ID from email"""
        return hashlib.md5(email.encode()).hexdigest()[:12]
    
    def create_enhanced_user(self, user_data):
        """Create new user account with enhanced profile support"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Prepare common data
            password_hash = hashlib.sha256(user_data['password'].encode()).hexdigest()
            phone = self.format_phone_number(user_data['phone'])
            full_name = f"{user_data['firstName']} {user_data['lastName']}"
            interests = ','.join(user_data.get('interests', []))
            business_categories = ','.join(user_data.get('businessCategories', []))
            
            # Check if email already exists and handle updates
            cursor.execute("SELECT user_id, full_name FROM demo_users WHERE email = ?", (user_data['email'],))
            existing_user = cursor.fetchone()
            
            if existing_user:
                # Update existing user account
                
                cursor.execute('''
                    UPDATE demo_users SET 
                    password_hash = ?, phone = ?, full_name = ?, country = ?, state = ?, city = ?, 
                    interests = ?, business_name = ?, business_website = ?, 
                    business_address = ?, business_phone = ?, business_description = ?, 
                    bio = ?, business_categories = ?, account_type = ?
                    WHERE email = ?
                ''', (
                    password_hash, phone, full_name, user_data.get('country'), user_data.get('state'), user_data['city'], 
                    interests, user_data.get('businessName'), user_data.get('businessWebsite'), 
                    user_data.get('businessAddress'), user_data.get('workPhone'),
                    user_data.get('businessDescription'), user_data.get('bio'), 
                    business_categories, user_data['accountType'], user_data['email']
                ))
                conn.commit()
                
                # Prepare data for SMS notification
                notification_data = {
                    'full_name': full_name,
                    'phone': phone,
                    'account_type': user_data['account_type'],
                    'business_name': user_data.get('businessName'),
                    'city': user_data['city']
                }
                self.send_welcome_notifications(notification_data)
                
                return {
                    "success": True,
                    "user_id": existing_user[0], 
                    "message": f"Account updated successfully! Welcome back, {full_name}."
                }
            
            # Generate unique user ID
            user_id = self.generate_user_id(user_data['email'])
            
            # Hash password
            password_hash = hashlib.sha256(user_data['password'].encode()).hexdigest()
            
            # Format phone number
            phone = self.format_phone_number(user_data['phone'])
            
            # Prepare user data
            full_name = f"{user_data['firstName']} {user_data['lastName']}"
            interests = ','.join(user_data.get('interests', []))
            business_categories = ','.join(user_data.get('businessCategories', []))
            
            # Insert user with all enhanced fields
            cursor.execute("""
                INSERT INTO demo_users 
                (user_id, full_name, email, password_hash, phone, country, state, city, interests, 
                 account_type, bio, business_name, business_website, business_address, 
                 business_phone, business_description, business_categories, 
                 early_supporter, signup_date, sms_notifications, email_updates, 
                 terms_accepted, demo_access_granted)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                full_name,
                user_data['email'],
                password_hash,
                phone,
                user_data.get('country'),
                user_data.get('state'),
                user_data['city'],
                interests,
                user_data.get('accountType', 'personal'),
                user_data.get('bio', ''),
                user_data.get('businessName', ''),
                user_data.get('businessWebsite', ''),
                user_data.get('businessAddress', ''),
                user_data.get('businessPhone', ''),
                user_data.get('businessDescription', ''),
                business_categories,
                user_data.get('earlySupporter', True),
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                user_data.get('notifications', True),
                user_data.get('notifications', True),
                True,
                True
            ))
            
            conn.commit()
            conn.close()
            
            # Send welcome notifications if enabled
            if user_data.get('notifications', True):
                self.send_welcome_notifications({
                    'full_name': full_name,
                    'email': user_data['email'],
                    'phone': phone,
                    'city': user_data['city'],
                    'account_type': user_data.get('accountType', 'personal'),
                    'business_name': user_data.get('businessName', '')
                })
            
            return {
                "success": True,
                "user_id": user_id,
                "message": "Account created successfully! Welcome to MarketPace."
            }
            
        except Exception as e:
            print(f"Database error: {e}")
            return {"success": False, "error": "Failed to create account. Please try again."}
    
    def format_phone_number(self, phone):
        """Format phone number for consistency"""
        # Remove all non-digit characters
        phone = ''.join(filter(str.isdigit, phone))
        
        # Handle different phone number formats
        if len(phone) == 10:
            # US number without country code
            return f"+1{phone}"
        elif len(phone) == 11 and phone.startswith('1'):
            # US number with country code
            return f"+{phone}"
        elif len(phone) > 11:
            # International number
            return f"+{phone}"
        else:
            # Invalid number, return as is for error handling
            return phone
    
    def send_welcome_notifications(self, user_data):
        """Send welcome SMS and email notifications"""
        try:
            # Prepare welcome message
            account_type_msg = ""
            if user_data.get('account_type') == 'dual' and user_data.get('business_name'):
                account_type_msg = f" Your business '{user_data['business_name']}' is now part of the MarketPace community!"
            
            sms_message = f"""🎉 Welcome to MarketPace, {user_data['full_name']}!{account_type_msg}

Your account is ready! You can now:
• Browse local marketplace listings
• Connect with your {user_data['city']} community
• Access early supporter benefits

Ready to get started? Visit your community page now!

- The MarketPace Team"""
            
            # Send SMS if Twilio is available and phone number is valid
            if self.twilio_client and user_data.get('phone'):
                try:
                    # Skip SMS for demo numbers (555-xxx-xxxx) to avoid Twilio errors
                    phone_digits = ''.join(filter(str.isdigit, user_data['phone']))
                    if phone_digits.startswith('555') or phone_digits.startswith('1555'):
                        print(f"SMS skipped for demo number: {user_data['phone']}")
                        print(f"Welcome message would be: {sms_message}")
                    else:
                        message = self.twilio_client.messages.create(
                            body=sms_message,
                            from_=self.twilio_phone,
                            to=user_data['phone']
                        )
                        print(f"Welcome SMS sent to {user_data['phone']} - SID: {message.sid}")
                except Exception as e:
                    print(f"SMS sending failed: {e}")
                    print(f"Welcome message would be: {sms_message}")
            
        except Exception as e:
            print(f"Error sending welcome notifications: {e}")

def handle_enhanced_signup(request_data):
    """Handle enhanced signup request"""
    try:
        signup_manager = EnhancedSignupManager()
        result = signup_manager.create_enhanced_user(request_data)
        return result
    except Exception as e:
        print(f"Signup handler error: {e}")
        return {"success": False, "error": "Internal server error"}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            request_data = json.loads(sys.argv[1])
            result = handle_enhanced_signup(request_data)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}))
    else:
        print(json.dumps({"success": False, "error": "No data provided"}))