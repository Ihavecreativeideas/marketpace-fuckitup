#!/usr/bin/env python3
"""
MarketPace Password Reset System
Handles password reset requests with email and SMS verification codes
"""

import sqlite3
import hashlib
import random
import string
import os
from datetime import datetime, timedelta
import json


class PasswordResetManager:
    def __init__(self, db_path="demo_users.db"):
        self.db_path = db_path
        self.init_reset_table()
        
        # Twilio setup
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
            print("Twilio not available, SMS features disabled")
    
    def init_reset_table(self):
        """Initialize password reset tokens table"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL,
                    reset_code TEXT NOT NULL,
                    method TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT 0
                )
            ''')
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error initializing reset table: {e}")
    
    def generate_reset_code(self):
        """Generate 6-digit reset code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def user_exists(self, email):
        """Check if user exists in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT email, phone FROM demo_users WHERE LOWER(email) = LOWER(?)", (email,))
            user = cursor.fetchone()
            conn.close()
            
            return user
        except Exception as e:
            print(f"Error checking user existence: {e}")
            return None
    
    def create_reset_token(self, email, method):
        """Create password reset token"""
        try:
            user = self.user_exists(email)
            if not user:
                return None, "User not found"
            
            reset_code = self.generate_reset_code()
            expires_at = datetime.now() + timedelta(hours=1)  # 1 hour expiry
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Clean up old unused tokens for this email
            cursor.execute(
                "DELETE FROM password_reset_tokens WHERE email = ? AND used = 0",
                (email,)
            )
            
            # Create new token
            cursor.execute('''
                INSERT INTO password_reset_tokens (email, reset_code, method, expires_at)
                VALUES (?, ?, ?, ?)
            ''', (email, reset_code, method, expires_at))
            
            conn.commit()
            conn.close()
            
            # Send the code
            if method == 'email':
                success = self.send_email_code(email, reset_code)
            elif method == 'sms':
                success = self.send_sms_code(user[1], reset_code)  # user[1] is phone
            else:
                return None, "Invalid reset method"
            
            if success:
                return reset_code, None
            else:
                return None, f"Failed to send reset code via {method}"
                
        except Exception as e:
            print(f"Error creating reset token: {e}")
            return None, "Error creating reset token"
    
    def send_email_code(self, email, reset_code):
        """Send reset code via email"""
        try:
            # For demo purposes, we'll print the code instead of sending actual email
            # In production, you'd configure SMTP settings
            print(f"Email reset code for {email}: {reset_code}")
            
            # Simulate email sending
            # You would implement actual email sending here with your email service
            return True
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def send_sms_code(self, phone, reset_code):
        """Send reset code via SMS"""
        try:
            if not self.twilio_client:
                print(f"SMS reset code for {phone}: {reset_code}")
                return True
            
            message = f"Your MarketPace password reset code is: {reset_code}. This code expires in 1 hour."
            
            self.twilio_client.messages.create(
                body=message,
                from_=self.twilio_phone,
                to=phone
            )
            
            print(f"SMS sent to {phone}")
            return True
            
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return False
    
    def verify_reset_code(self, email, reset_code):
        """Verify reset code and return validity"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, expires_at FROM password_reset_tokens 
                WHERE email = ? AND reset_code = ? AND used = 0
                ORDER BY created_at DESC LIMIT 1
            ''', (email, reset_code))
            
            token = cursor.fetchone()
            
            if not token:
                conn.close()
                return False, "Invalid or expired reset code"
            
            # Check if token is expired
            expires_at = datetime.fromisoformat(token[1])
            if datetime.now() > expires_at:
                conn.close()
                return False, "Reset code has expired"
            
            conn.close()
            return True, token[0]  # Return token ID
            
        except Exception as e:
            print(f"Error verifying reset code: {e}")
            return False, "Error verifying reset code"
    
    def reset_password(self, email, reset_code, new_password):
        """Reset user password with verification"""
        try:
            # Verify the reset code
            is_valid, token_id_or_error = self.verify_reset_code(email, reset_code)
            if not is_valid:
                return False, token_id_or_error
            
            token_id = token_id_or_error
            
            # Hash the new password
            password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Update user password
            cursor.execute(
                "UPDATE demo_users SET password_hash = ? WHERE LOWER(email) = LOWER(?)",
                (password_hash, email)
            )
            
            # Mark token as used
            cursor.execute(
                "UPDATE password_reset_tokens SET used = 1 WHERE id = ?",
                (token_id,)
            )
            
            conn.commit()
            conn.close()
            
            return True, "Password reset successfully"
            
        except Exception as e:
            print(f"Error resetting password: {e}")
            return False, "Error resetting password"
    
    def cleanup_expired_tokens(self):
        """Clean up expired tokens"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "DELETE FROM password_reset_tokens WHERE expires_at < ?",
                (datetime.now(),)
            )
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error cleaning up tokens: {e}")


def handle_reset_request(request_data):
    """Handle password reset request"""
    try:
        email = request_data.get('email')
        method = request_data.get('method', 'email')
        
        if not email:
            return {"success": False, "message": "Email is required"}
        
        if method not in ['email', 'sms']:
            return {"success": False, "message": "Invalid reset method"}
        
        reset_manager = PasswordResetManager()
        reset_code, error = reset_manager.create_reset_token(email, method)
        
        if error:
            return {"success": False, "message": error}
        
        method_text = "email" if method == "email" else "phone"
        return {
            "success": True,
            "message": f"Reset code sent to your {method_text}. Check your {method_text} and enter the 6-digit code."
        }
        
    except Exception as e:
        print(f"Reset request error: {e}")
        return {"success": False, "message": "Error processing reset request"}


def handle_password_reset(request_data):
    """Handle password reset confirmation"""
    try:
        email = request_data.get('email')
        reset_code = request_data.get('resetCode')
        new_password = request_data.get('newPassword')
        
        if not email or not reset_code or not new_password:
            return {"success": False, "message": "All fields are required"}
        
        if len(new_password) < 6:
            return {"success": False, "message": "Password must be at least 6 characters long"}
        
        reset_manager = PasswordResetManager()
        success, message = reset_manager.reset_password(email, reset_code, new_password)
        
        return {"success": success, "message": message}
        
    except Exception as e:
        print(f"Password reset error: {e}")
        return {"success": False, "message": "Error resetting password"}


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "message": "No action specified"}))
        sys.exit(1)
    
    action = sys.argv[1]
    
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "message": "No data provided"}))
        sys.exit(1)
    
    try:
        request_data = json.loads(sys.argv[2])
    except json.JSONDecodeError:
        print(json.dumps({"success": False, "message": "Invalid JSON data"}))
        sys.exit(1)
    
    if action == "request":
        result = handle_reset_request(request_data)
    elif action == "reset":
        result = handle_password_reset(request_data)
    else:
        result = {"success": False, "message": "Invalid action"}
    
    print(json.dumps(result))