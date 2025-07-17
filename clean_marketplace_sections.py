#!/usr/bin/env python3
"""
Clean up marketplace section files by removing all demo posts and keeping only the "no items" message
"""

import re

# Define the clean content for each marketplace section
def clean_shops_feed():
    return '''        <!-- Feed Posts -->
        <div class="feed">
            <!-- No items available message -->
            <div class="no-items-message" style="
                background: rgba(0, 0, 0, 0.4); 
                backdrop-filter: blur(20px); 
                border: 1px solid rgba(255, 255, 255, 0.2); 
                border-radius: 12px; 
                padding: 40px 20px; 
                text-align: center; 
                margin: 20px 0;
            ">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px; opacity: 0.6;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="#00ffff" stroke-width="1.5" fill="rgba(0, 255, 255, 0.1)"/>
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="#00ffff" stroke-width="1.5"/>
                    <circle cx="7" cy="7" r="1" fill="#00ffff"/>
                </svg>
                <h3 style="color: #00ffff; margin-bottom: 12px; font-size: 20px;">No Items for Sale</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">Be the first to list something for sale in your community!</p>
                <button class="commerce-btn primary" onclick="openAdvancedPostModal('sale')" style="background: linear-gradient(135deg, #00ffff, #8b5cf6); margin-top: 10px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    List an Item for Sale
                </button>
            </div>
        </div>'''

def clean_services_feed():
    return '''        <!-- Feed Posts -->
        <div class="feed">
            <!-- No services available message -->
            <div class="no-items-message" style="
                background: rgba(0, 0, 0, 0.4); 
                backdrop-filter: blur(20px); 
                border: 1px solid rgba(255, 255, 255, 0.2); 
                border-radius: 12px; 
                padding: 40px 20px; 
                text-align: center; 
                margin: 20px 0;
            ">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px; opacity: 0.6;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="#f59e0b" stroke-width="1.5" fill="rgba(245, 158, 11, 0.1)"/>
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="#f59e0b" stroke-width="1.5"/>
                </svg>
                <h3 style="color: #f59e0b; margin-bottom: 12px; font-size: 20px;">No Services Available</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">Be the first to offer a service in your community!</p>
                <button class="commerce-btn primary" onclick="openAdvancedPostModal('service')" style="background: linear-gradient(135deg, #f59e0b, #d97706); margin-top: 10px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    List a Service
                </button>
            </div>
        </div>'''

def clean_rentals_feed():
    return '''        <!-- Feed Posts -->
        <div class="feed">
            <!-- No rentals available message -->
            <div class="no-items-message" style="
                background: rgba(0, 0, 0, 0.4); 
                backdrop-filter: blur(20px); 
                border: 1px solid rgba(255, 255, 255, 0.2); 
                border-radius: 12px; 
                padding: 40px 20px; 
                text-align: center; 
                margin: 20px 0;
            ">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px; opacity: 0.6;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="#10b981" stroke-width="1.5" fill="rgba(16, 185, 129, 0.1)"/>
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#10b981" stroke-width="1.5"/>
                    <polyline points="9,22 9,12 15,12 15,22" stroke="#10b981" stroke-width="1.5"/>
                </svg>
                <h3 style="color: #10b981; margin-bottom: 12px; font-size: 20px;">No Items for Rent</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">Be the first to list something for rent in your community!</p>
                <button class="commerce-btn primary" onclick="openAdvancedPostModal('rent')" style="background: linear-gradient(135deg, #10b981, #06b6d4); margin-top: 10px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    List an Item for Rent
                </button>
            </div>
        </div>'''

def clean_marketplace_file(filename, clean_feed_content):
    """Clean a marketplace file by replacing everything between feed start and main container end"""
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the start of the Feed Posts section
    feed_start = content.find('        <!-- Feed Posts -->')
    if feed_start == -1:
        print(f"Could not find Feed Posts section in {filename}")
        return False
        
    # Find the end of the main container (before Bottom Navigation)
    main_end = content.find('    <!-- Bottom Navigation -->')
    if main_end == -1:
        print(f"Could not find Bottom Navigation section in {filename}")
        return False
    
    # Replace everything between feed start and main container end
    new_content = (
        content[:feed_start] + 
        clean_feed_content + 
        '\n\n        <!-- Main Container End -->\n    </div>\n\n' +
        content[main_end:]
    )
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Successfully cleaned {filename}")
    return True

# Clean all three marketplace section files
if __name__ == "__main__":
    files_to_clean = [
        ('shops.html', clean_shops_feed()),
        ('services.html', clean_services_feed()), 
        ('rentals.html', clean_rentals_feed())
    ]
    
    for filename, clean_content in files_to_clean:
        clean_marketplace_file(filename, clean_content)
    
    print("\nAll marketplace section files cleaned successfully!")
    print("Each section now shows only the appropriate 'no items available' message.")