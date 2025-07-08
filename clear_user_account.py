#!/usr/bin/env python3
"""
Script to clear a user account from MarketPace demo database
"""

import sqlite3
import sys

def clear_user_account(email):
    """Clear user account and reset tokens for given email"""
    try:
        conn = sqlite3.connect('demo_users.db')
        cursor = conn.cursor()
        
        # Remove user from demo_users table
        cursor.execute('DELETE FROM demo_users WHERE email = ?', (email,))
        deleted_users = cursor.rowcount
        
        # Remove any password reset tokens
        cursor.execute('DELETE FROM password_reset_tokens WHERE email = ?', (email,))
        deleted_tokens = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        print(f'✓ Removed {deleted_users} user records and {deleted_tokens} reset tokens for {email}')
        print('✓ You can now sign up again with this email address.')
        return True
        
    except Exception as e:
        print(f'Error clearing account: {e}')
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 clear_user_account.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    clear_user_account(email)