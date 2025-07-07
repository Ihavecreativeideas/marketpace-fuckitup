#!/usr/bin/env python3
import sqlite3
import sys

def clear_all_users():
    """Clear all users from demo database"""
    try:
        conn = sqlite3.connect('demo_users.db')
        cursor = conn.cursor()
        
        # Delete all users
        cursor.execute("DELETE FROM demo_users")
        
        # Reset the auto-increment counter
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='demo_users'")
        
        conn.commit()
        count = cursor.rowcount
        
        # Verify deletion
        cursor.execute("SELECT COUNT(*) FROM demo_users")
        remaining = cursor.fetchone()[0]
        
        conn.close()
        
        print(f"Cleared {count} users from database. Remaining users: {remaining}")
        return True
        
    except Exception as e:
        print(f"Error clearing database: {e}")
        return False

if __name__ == "__main__":
    clear_all_users()