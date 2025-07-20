    <script>
        let selectedCategory = 'all';
        
        // Dropdown functions
        function toggleFilter() {
            const dropdown = document.getElementById('filterDropdown');
            dropdown.classList.toggle('show');
            // Close menu dropdown if open
            document.getElementById('menuDropdown').classList.remove('show');
        }

        function toggleMenu() {
            const dropdown = document.getElementById('menuDropdown');
            dropdown.classList.toggle('show');
            // Close filter dropdown if open
            document.getElementById('filterDropdown').classList.remove('show');
        }

        function filterBy(type) {
            alert(`Filtering by: ${type}`);
            document.getElementById('filterDropdown').classList.remove('show');
        }

        // Rental filtering function
        function filterRentals() {
            // Show rental liability disclaimer
            const rentalModal = document.createElement('div');
            rentalModal.className = 'modal-overlay';
            rentalModal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <h3 style="color: #00ffff; margin-bottom: 20px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(34, 197, 94, 0.2)"/><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.5"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.5"/></svg> Local Rentals</h3>
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                        <h4 style="color: #ef4444; margin: 0 0 10px 0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 4px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(245, 158, 11, 0.2)"/><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" stroke="currentColor" stroke-width="1.5"/><path d="M12 15.75h.007v.008H12v-.008z" stroke="currentColor" stroke-width="2"/></svg> Important Rental Disclaimer</h4>
                        <p style="color: #e2e8f0; margin: 0; font-size: 14px; line-height: 1.4;">
                            <span class="marketpace-text">MarketPace</span> is NOT responsible for lost, damaged, or stolen rental items. 
                            Members must create their own rental terms and conditions. 
                            All communication and liability is between renter and item owner.
                        </p>
                    </div>
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                        <h4 style="color: #3b82f6; margin: 0 0 10px 0;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.2)"/><path d="M16 3h5v4h-5z" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.1)"/><path d="M2 21h20v-7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="17" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="17" r="2" stroke="currentColor" stroke-width="1.5"/></svg> Delivery Options</h4>
                        <p style="color: #e2e8f0; margin: 0; font-size: 14px; line-height: 1.4;">
                            • Self pickup/dropoff (free)<br>
                            • Paid delivery service (2 fees: pickup + dropoff)<br>
                            • Renter can choose to pass full delivery cost to renter
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="closeRentalModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Cancel</button>
                        <button onclick="showRentalListings()" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">View Rentals</button>
                    </div>
                </div>
            `;
            document.body.appendChild(rentalModal);
        }

        function closeRentalModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        function showRentalListings() {
            closeRentalModal();
            
            // Filter feed to show only rental items
            const feedPosts = document.querySelectorAll('.feed-post');
            let rentalCount = 0;
            
            feedPosts.forEach(post => {
                const postText = post.textContent.toLowerCase();
                if (postText.includes('rent') || postText.includes('rental') || postText.includes('for rent') || postText.includes('/day')) {
                    post.style.display = 'block';
                    rentalCount++;
                } else {
                    post.style.display = 'none';
                }
            });
            
            // Show notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 200px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                z-index: 1000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            `;
            notification.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-weight: bold; margin-bottom: 5px;">Showing ${rentalCount} rental items in your area</div>
                    <div style="font-size: 12px; opacity: 0.9;">Click "<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(34, 197, 94, 0.2)"/><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.5"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.5"/></svg> Map" in header to view on interactive map</div>
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 4000);
        }

        // Category filtering functionality
        function filterByCategory(category) {
            console.log('Filtering by category:', category);
            
            const feedPosts = document.querySelectorAll('.feed-post');
            const feed = document.querySelector('.feed');
            let visibleCount = 0;
            
            // Define category mappings
            const categoryMappings = {
                'vehicles': ['car', 'truck', 'vehicle', 'auto', 'motorcycle', 'bike'],
                'electronics': ['phone', 'computer', 'laptop', 'tv', 'electronics', 'tech'],
                'home-garden': ['home', 'garden', 'furniture', 'decor'],
                'furniture': ['chair', 'table', 'couch', 'furniture', 'bed'],
                'fashion': ['clothing', 'shoes', 'fashion', 'jacket', 'shirt'],
                'sports': ['sports', 'exercise', 'fitness', 'outdoors'],
                'baby-kids': ['baby', 'kids', 'children', 'toy'],
                'pets': ['pet', 'dog', 'cat', 'animal'],
                'books-media': ['book', 'media', 'dvd', 'cd'],
                'health-beauty': ['health', 'beauty', 'cosmetic'],
                'toys-games': ['toy', 'game', 'puzzle'],
                'tools': ['tool', 'equipment', 'washer', 'drill'],
                'music': ['music', 'instrument', 'guitar'],
                'art-crafts': ['art', 'craft', 'paint'],
                'appliances': ['appliance', 'microwave', 'refrigerator'],
                'food-beverage': ['food', 'beverage', 'restaurant']
            };
            
            const keywords = categoryMappings[category] || [category];
            
            feedPosts.forEach(post => {
                const postText = post.textContent.toLowerCase();
                const matchesCategory = keywords.some(keyword => postText.includes(keyword));
                
                if (matchesCategory) {
                    post.style.display = 'block';
                    visibleCount++;
                } else {
                    post.style.display = 'none';
                }
            });
            
            // Remove existing no-items message
            const existingMessage = feed.querySelector('.no-items-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Show "none available" message if no items found
            if (visibleCount === 0) {
                const noItemsMessage = document.createElement('div');
                noItemsMessage.className = 'no-items-message';
                noItemsMessage.style.cssText = `
                    background: rgba(0, 0, 0, 0.4); 
                    backdrop-filter: blur(20px); 
                    border: 1px solid rgba(255, 255, 255, 0.2); 
                    border-radius: 12px; 
                    padding: 40px 20px; 
                    text-align: center; 
                    margin: 20px 0;
                `;
                noItemsMessage.innerHTML = `
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px; opacity: 0.6;">
                        <rect x="2" y="2" width="20" height="20" rx="3" stroke="#00ffff" stroke-width="1.5" fill="rgba(0, 255, 255, 0.1)"/>
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="#00ffff" stroke-width="1.5"/>
                        <circle cx="7" cy="7" r="1" fill="#00ffff"/>
                    </svg>
                    <h3 style="color: #00ffff; margin-bottom: 12px; font-size: 20px;">None Available at This Time</h3>
                    <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">No ${category.replace('-', ' & ')} items found in your area. Be the first to post!</p>
                    <button class="commerce-btn primary" onclick="openAdvancedPostModal('sale')" style="background: linear-gradient(135deg, #00ffff, #8b5cf6); margin-top: 10px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Post in This Category
                    </button>
                `;
                feed.appendChild(noItemsMessage);
            }
            
            // Show notification
            showNotification(`Filtered to ${category.replace('-', ' & ')} category - ${visibleCount} items found`, visibleCount > 0 ? 'success' : 'warning');
        }
        
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            const colors = {
                'success': '#10b981',
                'error': '#ef4444',
                'info': '#3b82f6',
                'warning': '#f59e0b'
            };
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${colors[type] || colors.success};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 2000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                font-size: 14px;
                font-weight: 500;
                min-width: 200px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            `;
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Hide and remove notification
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 4000);
        }
        
        function clearCategoryFilter() {
            const feedPosts = document.querySelectorAll('.feed-post');
            const feed = document.querySelector('.feed');
            
            // Show all posts
            feedPosts.forEach(post => {
                post.style.display = 'block';
            });
            
            // Remove no-items message if it exists
            const existingMessage = feed.querySelector('.no-items-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            showNotification('Category filter cleared - showing all posts', 'info');
        }

        // Main rental filtering function called by the rental button
        function filterRentals() {
            console.log('Filtering to show rental items only...');
            
            // Show rental disclaimer modal
            const rentalModal = document.createElement('div');
            rentalModal.className = 'modal-overlay';
            rentalModal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <h3 style="color: #ff6b6b; margin-bottom: 20px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 4px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(245, 158, 11, 0.2)"/><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" stroke="currentColor" stroke-width="1.5"/><path d="M12 15.75h.007v.008H12v-.008z" stroke="currentColor" stroke-width="2"/></svg> Rental Liability Disclaimer</h3>
                    <div style="background: rgba(255, 107, 107, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255, 107, 107, 0.3);">
                        <p style="margin: 0 0 15px 0; font-weight: bold; color: #ff6b6b;">IMPORTANT: <span class="marketpace-text">MarketPace</span> is NOT responsible for:</p>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Lost, damaged, or stolen rental items</li>
                            <li>Member-to-member rental agreements</li>
                            <li>Item condition or functionality</li>
                            <li>Rental terms and conditions (set by item owner)</li>
                        </ul>
                        <p style="margin: 15px 0 0 0; font-style: italic;">All rentals are member-to-member transactions. Create your own rental terms and conditions.</p>
                    </div>
                    
                    <h4 style="color: #00ffff; margin-bottom: 15px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.2)"/><rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.1)"/><path d="M6 10h12M6 14h12M6 18h8" stroke="currentColor" stroke-width="1.5"/></svg> Rental Pricing Structure</h4>
                    <div style="background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 255, 0.3);">
                        <p><strong>Recommended:</strong> Flat daily rate (more flexible)</p>
                        <p><strong>Pickup:</strong> Morning routes 9am-12pm</p>
                        <p><strong>Dropoff:</strong> Evening routes 6pm-9pm</p>
                        <p><strong>Route Break Fee:</strong> $4 extra for custom timing</p>
                        <p><strong>Business Subscribers:</strong> $2 fee (3x/week renters)</p>
                        <p><strong>Delivery Cost:</strong> Renter pays full amount (doubled for pickup + dropoff)</p>
                        <p><strong>Tips:</strong> Both parties can tip drivers</p>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="closeRentalModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Cancel</button>
                        <button onclick="showRentalFeed()" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">View Rentals</button>
                    </div>
                </div>
            `;
            document.body.appendChild(rentalModal);
        }

        function showRentalFeed() {
            closeRentalModal();
            
            // Filter feed to show only rental items
            const feedPosts = document.querySelectorAll('.feed-post');
            let rentalCount = 0;
            
            feedPosts.forEach(post => {
                const postText = post.textContent.toLowerCase();
                if (postText.includes('rent') || postText.includes('rental') || postText.includes('for rent')) {
                    post.style.display = 'block';
                    rentalCount++;
                } else {
                    post.style.display = 'none';
                }
            });
            
            // Show notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 200px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                z-index: 1000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            `;
            notification.textContent = `Showing ${rentalCount} rental items in your area`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 3000);
        }

        // Rental action functions
        function rentItem(itemName, dailyPrice) {
            const rentalModal = document.createElement('div');
            rentalModal.className = 'modal-overlay';
            rentalModal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <h3 style="color: #00ffff; margin-bottom: 20px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(34, 197, 94, 0.2)"/><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.5"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.5"/></svg> Rent ${itemName}</h3>
                    
                    <div style="background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 255, 0.3);">
                        <h4 style="color: #00ffff; margin-bottom: 15px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.2)"/><rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.1)"/><path d="M6 10h12M6 14h12M6 18h8" stroke="currentColor" stroke-width="1.5"/></svg> Rental Details</h4>
                        <p><strong>Daily Rate:</strong> $${dailyPrice.toFixed(2)} (Recommended flat rate)</p>
                        <p><strong>Pickup Schedule:</strong> Morning routes 9am-12pm</p>
                        <p><strong>Dropoff Schedule:</strong> Evening routes 6pm-9pm</p>
                        <p><strong>Custom Timing:</strong> +$4 route break fee</p>
                        <p><strong>Business Subscribers:</strong> $2 fee (for 3x/week renters)</p>
                    </div>
                    
                    <div style="background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255, 107, 107, 0.3);">
                        <p style="margin: 0; font-weight: bold; color: #ff6b6b;">Delivery Cost: Renter pays full amount (doubled for pickup + dropoff)</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px;">Both parties can tip drivers. You create your own rental terms.</p>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="closeRentalModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Cancel</button>
                        <button onclick="proceedWithRental('${itemName}', ${dailyPrice})" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Proceed to Rent</button>
                    </div>
                </div>
            `;
            document.body.appendChild(rentalModal);
        }

        function selfPickup(itemName) {
            // Navigate to messaging page with item owner
            window.location.href = `/message-owner?item=${encodeURIComponent(itemName)}&type=rental`;
        }

        function proceedWithRental(itemName, dailyPrice) {
            closeRentalModal();
            // Navigate to rental delivery selection page
            window.location.href = `/rental-delivery?item=${encodeURIComponent(itemName)}&price=${dailyPrice}`;
        }

        function closeRentalModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        function goToProfile() {
            window.location.href = '/profile';
            document.getElementById('menuDropdown').classList.remove('show');
        }

        function goToSettings() {
            window.location.href = '/settings';
            document.getElementById('menuDropdown').classList.remove('show');
        }

        function goToDeliveries() {
            window.location.href = '/deliveries';
            document.getElementById('menuDropdown').classList.remove('show');
        }

        function goToSponsor() {
            window.location.href = '/sponsorship.html';
            document.getElementById('menuDropdown').classList.remove('show');
        }

        function goToSecurity() {
            window.location.href = '/security';
            document.getElementById('menuDropdown').classList.remove('show');
        }
        
        function goToResetLive() {
            document.getElementById('menuDropdown').classList.remove('show');
            window.location.href = '/reset-to-live';
        }

        // Local Event Calendar Function
        function openLocalEventCalendar() {
            console.log('Opening local event calendar...');
            window.location.href = '/local-event-calendar.html';
        }

        // Enhanced Interactive Map Functions
        function showInteractiveMap(category) {
            console.log('Opening interactive map with category:', category);
            window.location.href = '/interactive-map';
        }

        function showInteractiveMapModal(category) {
            const mapModal = document.createElement('div');
            mapModal.className = 'modal-overlay';
            mapModal.innerHTML = `
                <div class="modal-content" style="max-width: 90vw; max-height: 90vh; padding: 0; border-radius: 15px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #1a0b3d, #6b46c1); padding: 20px; color: white;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0; color: #00ffff;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 8px; vertical-align: middle;">
                                        <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/>
                                        <circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/>
                                        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                    Interactive Map
                                </h3>
                                <p style="margin: 5px 0 0 0; opacity: 0.8;">Find rentals, shops, services & more nearby</p>
                            </div>
                            <button onclick="closeMapModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer;">×</button>
                        </div>
                        
                        <!-- Map Controls -->
                        <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                            <select id="radiusSelector" onchange="updateMapRadius()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px; border-radius: 6px;">
                                <option value="5">5 miles</option>
                                <option value="10" selected>10 miles</option>
                                <option value="25">25 miles</option>
                                <option value="50">50 miles</option>
                            </select>
                            
                            <select id="townSelector" onchange="updateMapTown()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px; border-radius: 6px;">
                                <option value="all">All Launched Towns</option>
                                <option value="orange-beach">Orange Beach, AL</option>
                                <option value="gulf-shores">Gulf Shores, AL</option>
                                <option value="foley">Foley, AL</option>
                                <option value="spanish-fort">Spanish Fort, AL</option>
                                <option value="daphne">Daphne, AL</option>
                                <option value="fairhope">Fairhope, AL</option>
                                <option value="mobile">Mobile, AL</option>
                                <option value="pensacola">Pensacola, FL</option>
                                <option value="destin">Destin, FL</option>
                                <option value="panama-city">Panama City, FL</option>
                            </select>
                            
                            <div style="display: flex; gap: 8px;">
                                <button onclick="filterMapItems('rentals')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(34, 197, 94, 0.2)"/><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.5"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.5"/></svg> Rentals</button>
                                <button onclick="filterMapItems('sales')" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(34, 197, 94, 0.2)"/><path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.5"/></svg> For Sale</button>
                                <button onclick="filterMapItems('services')" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(245, 158, 11, 0.2)"/><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="1.5"/></svg> Services</button>
                                <button onclick="filterMapItems('shops')" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" stroke="currentColor" stroke-width="1.5"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.5"/></svg> Shops</button>
                                <button onclick="filterMapItems('all')" style="background: linear-gradient(135deg, #6b7280, #4b5563); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">All</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Map Area -->
                    <div id="mapContainer" style="height: 500px; background: linear-gradient(135deg, #0f172a, #1e293b); position: relative; overflow: hidden;">
                        <!-- Futuristic Grid Background -->
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.1) 0px, transparent 1px, transparent 20px, rgba(0, 255, 255, 0.1) 21px), repeating-linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0px, transparent 1px, transparent 20px, rgba(0, 255, 255, 0.1) 21px); opacity: 0.3;"></div>
                        <!-- Radar Sweep Animation -->
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 400px; border-radius: 50%; border: 2px solid rgba(0, 255, 255, 0.3); opacity: 0.5; animation: pulse 4s ease-in-out infinite;"></div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; height: 300px; border-radius: 50%; border: 2px solid rgba(0, 255, 255, 0.4); opacity: 0.6; animation: pulse 3s ease-in-out infinite reverse;"></div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; border-radius: 50%; border: 2px solid rgba(0, 255, 255, 0.5); opacity: 0.7; animation: pulse 2s ease-in-out infinite;"></div>
                        <!-- Central Radar Dot -->
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: rgba(0, 255, 255, 0.8); border-radius: 50%; box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);"></div>
                        <!-- Map Items Grid -->
                        <div id="mapItems" style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; overflow-y: auto; padding: 10px; z-index: 10;">
                            <!-- Rental Items -->
                            <div class="map-item rental-item" onclick="openItemDetails('Power Washer', 'rental', '1.2 miles', '$45/day')" style="background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.3s ease;">
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;">RENTAL</div>
                                    <div style="color: #00ffff; font-weight: bold;">1.2 miles away</div>
                                </div>
                                <h4 style="color: white; margin: 0 0 8px 0;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(245, 158, 11, 0.2)"/><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="1.5"/></svg> Power Washer</h4>
                                <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">Perfect for driveways and decks</p>
                                <div style="color: #10b981; font-weight: bold;">$45.00/day</div>
                                <div style="color: #64748b; font-size: 12px; margin-top: 5px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(239, 68, 68, 0.2)"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/></svg> General area: Orange Beach</div>
                            </div>
                            
                            <div class="map-item rental-item" onclick="openItemDetails('Beach Chairs Set', 'rental', '2.1 miles', '$25/day')" style="background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.3s ease;">
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;">RENTAL</div>
                                    <div style="color: #00ffff; font-weight: bold;">2.1 miles away</div>
                                </div>
                                <h4 style="color: white; margin: 0 0 8px 0;">🏖️ Beach Chairs Set</h4>
                                <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">Umbrella and chairs for beach days</p>
                                <div style="color: #10b981; font-weight: bold;">$25.00/day</div>
                                <div style="color: #64748b; font-size: 12px; margin-top: 5px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(239, 68, 68, 0.2)"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/></svg> General area: Orange Beach</div>
                            </div>
                            
                            <!-- For Sale Items -->
                            <div class="map-item sale-item" onclick="openItemDetails('Vintage Leather Jacket', 'sale', '0.8 miles', '$85')" style="background: rgba(245, 158, 11, 0.1); border: 2px solid #f59e0b; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.3s ease;">
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <div style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;">FOR SALE</div>
                                    <div style="color: #00ffff; font-weight: bold;">0.8 miles away</div>
                                </div>
                                <h4 style="color: white; margin: 0 0 8px 0;">👘 Vintage Leather Jacket</h4>
                                <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">Perfect condition, size medium</p>
                                <div style="color: #f59e0b; font-weight: bold;">$85.00</div>
                                <div style="color: #64748b; font-size: 12px; margin-top: 5px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(239, 68, 68, 0.2)"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/></svg> General area: Orange Beach</div>
                            </div>
                            
                            <!-- Service Items -->
                            <div class="map-item service-item" onclick="openItemDetails('Mike\\'s Handyman Service', 'service', '3.2 miles', 'Starting at $50')" style="background: rgba(59, 130, 246, 0.1); border: 2px solid #3b82f6; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.3s ease;">
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <div style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;">SERVICE</div>
                                    <div style="color: #00ffff; font-weight: bold;">3.2 miles away</div>
                                </div>
                                <h4 style="color: white; margin: 0 0 8px 0;">🔨 Mike's Handyman Service</h4>
                                <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">Licensed plumbing, electrical, painting</p>
                                <div style="color: #3b82f6; font-weight: bold;">Starting at $50.00</div>
                                <div style="color: #64748b; font-size: 12px; margin-top: 5px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(239, 68, 68, 0.2)"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/></svg> Exact address: 123 Gulf Shores Blvd</div>
                            </div>
                            
                            <!-- Shop Items -->
                            <div class="map-item shop-item" onclick="openItemDetails('Sarah\\'s Boutique', 'shop', '1.5 miles', 'Clothing & Accessories')" style="background: rgba(139, 92, 246, 0.1); border: 2px solid #8b5cf6; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.3s ease;">
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <div style="background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;">SHOP</div>
                                    <div style="color: #00ffff; font-weight: bold;">1.5 miles away</div>
                                </div>
                                <h4 style="color: white; margin: 0 0 8px 0;">👗 Sarah's Boutique</h4>
                                <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">Vintage clothing and accessories</p>
                                <div style="color: #8b5cf6; font-weight: bold;">Clothing & Accessories</div>
                                <div style="color: #64748b; font-size: 12px; margin-top: 5px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(239, 68, 68, 0.2)"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/></svg> Exact address: 456 Beach Blvd</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(mapModal);
        }

        function closeMapModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        function updateMapRadius() {
            const radius = document.getElementById('radiusSelector').value;
            console.log(`Updating map radius to ${radius} miles`);
            // In a real implementation, this would filter items based on actual distance
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
                background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;
                padding: 10px 20px; border-radius: 8px; z-index: 10000;
            `;
            notification.textContent = `Map updated to show items within ${radius} miles`;
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 2000);
        }

        function updateMapTown() {
            const town = document.getElementById('townSelector').value;
            console.log(`Filtering map to town: ${town}`);
            const townName = town === 'all' ? 'all launched towns' : document.getElementById('townSelector').selectedOptions[0].text;
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
                background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white;
                padding: 10px 20px; border-radius: 8px; z-index: 10000;
            `;
            notification.textContent = `Map filtered to ${townName}`;
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 2000);
        }

        function filterMapItems(category) {
            const allItems = document.querySelectorAll('.map-item');
            allItems.forEach(item => {
                if (category === 'all') {
                    item.style.display = 'block';
                } else if (category === 'rentals' && item.classList.contains('rental-item')) {
                    item.style.display = 'block';
                } else if (category === 'sales' && item.classList.contains('sale-item')) {
                    item.style.display = 'block';
                } else if (category === 'services' && item.classList.contains('service-item')) {
                    item.style.display = 'block';
                } else if (category === 'shops' && item.classList.contains('shop-item')) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        function openItemDetails(itemName, type, distance, price) {
            const detailModal = document.createElement('div');
            detailModal.className = 'modal-overlay';
            detailModal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <h3 style="color: #00ffff; margin-bottom: 20px;">${itemName}</h3>
                    
                    <div style="background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 255, 0.3);">
                        <p><strong>Type:</strong> ${type.toUpperCase()}</p>
                        <p><strong>Distance:</strong> ${distance}</p>
                        <p><strong>Price:</strong> ${price}</p>
                        <p><strong>Location Privacy:</strong> ${type === 'service' || type === 'shop' ? 'Exact address shown' : 'General area only for privacy'}</p>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="closeItemDetails()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Close</button>
                        <button onclick="contactSeller('${itemName}')" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Contact</button>
                        ${type === 'rental' ? `<button onclick="verifyCondition('${itemName}', '${type}s')" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(255, 255, 255, 0.2)"/><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.5"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="1.5"/></svg>Verify Condition</button>` : ''}
                    </div>
                </div>
            `;
            document.body.appendChild(detailModal);
        }

        function closeItemDetails() {
            const modals = document.querySelectorAll('.modal-overlay');
            const lastModal = modals[modals.length - 1];
            if (lastModal) {
                document.body.removeChild(lastModal);
            }
        }

        function contactSeller(itemName) {
            alert(`Contact request sent for ${itemName}. Seller will be notified.`);
            closeItemDetails();
        }

        // Message Owner Function
        function messageOwner(sellerName, itemName, itemId) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <h3 style="color: #00ffff; margin-bottom: 20px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                            <rect x="2" y="6" width="20" height="12" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 255, 255, 0.2)"/>
                            <path d="m2 7 8.97 5.7a1.94 1.94 0 0 0 2.06 0L22 7" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        Message ${sellerName}
                    </h3>
                    <p style="color: #e2e8f0; margin-bottom: 20px;">Send a message about: <strong>${itemName}</strong></p>
                    <textarea placeholder="Type your message here..." style="width: 100%; height: 100px; padding: 10px; background: rgba(0, 255, 255, 0.1); border: 2px solid #00ffff; border-radius: 8px; color: white; resize: vertical;"></textarea>
                    <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
                        <button onclick="closeMessageModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Cancel</button>
                        <button onclick="sendMessage('${itemName}', '${sellerName}')" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Send Message</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function closeMessageModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        function sendMessage(itemName, sellerName) {
            const messageText = document.querySelector('.modal-overlay textarea').value;
            if (!messageText.trim()) {
                showNotification('Please enter a message', 'error');
                return;
            }
            
            closeMessageModal();
            showNotification(`Message sent to ${sellerName} about ${itemName}!`, 'success');
            
            // Store conversation in localStorage for demo
            const conversations = JSON.parse(localStorage.getItem('marketpace_conversations') || '{}');
            const conversationId = `${sellerName}_${itemName}`;
            if (!conversations[conversationId]) {
                conversations[conversationId] = [];
            }
            conversations[conversationId].push({
                sender: 'You',
                message: messageText,
                timestamp: new Date().toISOString(),
                itemName: itemName
            });
            localStorage.setItem('marketpace_conversations', JSON.stringify(conversations));
        }
            
            if (message) {
                showNotification(`Message sent to ${sellerName} about ${itemName}!`, 'success');
                closeMessageModal();
                
                // Create conversation and save to localStorage
                const conversationId = 'conv_' + Date.now();
                const conversation = {
                    id: conversationId,
                    participants: ['You', sellerName || 'Seller'],
                    lastMessage: message,
                    timestamp: new Date().toISOString(),
                    itemContext: {
                        name: itemName,
                        seller: sellerName
                    },
                    messages: [{
                        sender: 'You',
                        message: message,
                        timestamp: new Date().toISOString()
                    }]
                };
                
                const conversations = JSON.parse(localStorage.getItem('marketpace_conversations') || '[]');
                conversations.unshift(conversation);
                localStorage.setItem('marketpace_conversations', JSON.stringify(conversations));
                
                // Update messages badge
                incrementMessagesBadge();
                
                // Simulate seller response after 3 seconds
                setTimeout(() => {
                    simulateSellerResponse(sellerName, itemName, conversationId);
                    // Update badge again after seller response
                    setTimeout(() => {
                        updateMessagesBadge();
                    }, 100);
                }, 3000);
                
            } else {
                showNotification('Please enter a message', 'error');
            }
        }

        function simulateSellerResponse(sellerName, itemName, conversationId) {
            const responses = [
                `Hi! Thanks for your interest in my ${itemName}. I'd be happy to help!`,
                `Hello! Yes, the ${itemName} is still available. What would you like to know?`,
                `Hey there! I saw your message about the ${itemName}. It's in excellent condition!`,
                `Thanks for reaching out! The ${itemName} is ready for pickup or delivery. What works for you?`,
                `Hi! I appreciate your message. The ${itemName} is available. When would you like to see it?`,
                `Hello! The ${itemName} is exactly as described. Would you like more photos?`,
                `Thanks for your interest! The ${itemName} is priced to sell. Are you ready to move forward?`
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            // Add seller response to conversation
            const conversations = JSON.parse(localStorage.getItem('marketpace_conversations') || '[]');
            const conversation = conversations.find(c => c.id === conversationId);
            if (conversation) {
                if (!conversation.messages) conversation.messages = [];
                conversation.messages.push({
                    sender: sellerName,
                    message: randomResponse,
                    timestamp: new Date().toISOString()
                });
                conversation.lastMessage = randomResponse;
                localStorage.setItem('marketpace_conversations', JSON.stringify(conversations));
                
                showNotification(`${sellerName} replied to your message!`, 'info');
            }
        }

        // Profile Settings and Navigation Functions
        function toggleLogoDropdown() {
            const dropdown = document.getElementById('logoDropdown');
            if (dropdown) {
                dropdown.remove();
            } else {
                const dropdown = document.createElement('div');
                dropdown.id = 'logoDropdown';
                dropdown.className = 'modal-overlay';
                dropdown.innerHTML = `
                    <div class="modal-content" style="max-width: 400px; margin-top: 100px;">
                        <h3 style="color: #00ffff; margin-bottom: 20px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.5"/></svg> Profile Settings</h3>
                        
                        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                            <h4 style="color: #ef4444; margin: 0 0 10px 0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(255, 255, 255, 0.2)"/><path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" stroke="currentColor" stroke-width="1.5" fill="rgba(255, 255, 255, 0.3)"/></svg> Demo Mode Active</h4>
                            <p style="color: #e2e8f0; margin: 0; font-size: 14px; line-height: 1.4;">
                                You're currently in demo mode. Click "Reset to Live" to switch to the live platform.
                            </p>
                        </div>
                        
                        <div style="display: grid; gap: 10px; margin-bottom: 20px;">
                            <button onclick="goToProfile(); closeLogoDropdown();" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">
                                My Profile
                            </button>
                            <button onclick="goToPage('/cart'); closeLogoDropdown();" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" stroke="currentColor" stroke-width="1.5"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.5"/></svg> Shopping Cart
                            </button>
                            <button onclick="goToPage('/settings'); closeLogoDropdown();" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.5"/></svg> Settings
                            </button>
                            <button onclick="resetToLive(); closeLogoDropdown();" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">
                                Reset to Live
                            </button>
                        </div>
                        
                        <button onclick="closeLogoDropdown()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%;">Close</button>
                    </div>
                `;
                document.body.appendChild(dropdown);
            }
        }

        function closeLogoDropdown() {
            const dropdown = document.getElementById('logoDropdown');
            if (dropdown) dropdown.remove();
        }

        function goToProfile() {
            // Check current account mode and navigate to appropriate profile
            const currentAccount = localStorage.getItem('currentAccount') || 'personal';
            
            if (currentAccount === 'business') {
                // Navigate to business profile/dashboard
                window.location.href = '/unified-pro-page';
            } else {
                // Navigate to personal profile
                window.location.href = '/profile.html';
            }
        }

        function openProfileSettings() {
            const settingsModal = document.createElement('div');
            settingsModal.className = 'modal-overlay';
            settingsModal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <h3 style="color: #00ffff; margin-bottom: 20px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.5"/></svg> Profile Settings</h3>
                    
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                        <h4 style="color: #ef4444; margin: 0 0 10px 0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(255, 255, 255, 0.2)"/><path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" stroke="currentColor" stroke-width="1.5" fill="rgba(255, 255, 255, 0.3)"/></svg> Demo Mode Active</h4>
                        <p style="color: #e2e8f0; margin: 0; font-size: 14px; line-height: 1.4;">
                            You're currently in demo mode. Click "Reset to Live" to switch to the live platform.
                        </p>
                        <button onclick="goToResetLive()" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 10px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(255, 255, 255, 0.2)"/><path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" stroke="currentColor" stroke-width="1.5" fill="rgba(255, 255, 255, 0.3)"/></svg> Reset to Live Mode</button>
                    </div>
                    
                    <div style="display: grid; gap: 10px;">
                        <button onclick="goToMyProfile()" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; text-align: left;">My Profile Page</button>
                        <button onclick="goToSettings()" style="background: linear-gradient(135deg, #6b7280, #4b5563); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; text-align: left;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.5"/></svg> Account Settings</button>
                        <button onclick="goToSecurity()" style="background: linear-gradient(135deg, #7c3aed, #6b46c1); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; text-align: left;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(34, 197, 94, 0.2)"/><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.5"/></svg> Security & Privacy</button>
                        <button onclick="inviteFriends()" style="background: linear-gradient(135deg, #1877f2, #42a5f5); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; text-align: left;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(255, 255, 255, 0.2)"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.5"/></svg> Invite Friends</button>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                        <button onclick="closeProfileSettings()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(settingsModal);
        }

        function closeProfileSettings() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        function goToMyProfile() {
            closeProfileSettings();
            // Check current account mode and navigate to appropriate profile
            const currentAccount = localStorage.getItem('currentAccount') || 'personal';
            
            if (currentAccount === 'business') {
                window.location.href = '/unified-pro-page';
            } else {
                window.location.href = '/profile.html';
            }
        }

        // Add missing functions for profile settings
        function goToCart() {
            closeProfileSettings();
            window.location.href = '/cart';
        }

        function goToDeliveries() {
            closeProfileSettings();
            window.location.href = '/delivery';
        }

        function goToSponsors() {
            closeProfileSettings();
            window.location.href = '/sponsors';
        }

        function goToSettings() {
            closeProfileSettings();
            window.location.href = '/settings';
        }

        function goToSecurity() {
            closeProfileSettings();
            window.location.href = '/security';
        }

        function createBusinessProfile() {
            closeProfileSettings();
            window.location.href = '/marketpace-pro-signup';
        }

        function resetToLive() {
            closeProfileSettings();
            if (confirm('This will remove all demo data and reset to live mode. Are you sure?')) {
                // Clear all demo data
                localStorage.removeItem('demoMode');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('cartItems');
                localStorage.removeItem('favorites');
                showNotification('Demo data cleared! You are now in live mode.', 'success');
                window.location.reload();
            }
        }

        function logout() {
            closeProfileSettings();
            if (confirm('Are you sure you want to logout?')) {
                // Clear all user data
                localStorage.clear();
                sessionStorage.clear();
                // Redirect to signup/login page
                window.location.href = '/signup-login';
            }
        }

        // Header navigation functions - removed duplicate, using comprehensive version

        // Navigate to rentals page (NOT map)
        function filterToRentals() {
            console.log('Navigating to rentals page...');
            window.location.href = '/rentals';
        }

        // Driver login functionality
        function showDriverLogin() {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <h3 style="color: #00ffff; margin-bottom: 20px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(255, 255, 255, 0.2)"/><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2" stroke="currentColor" stroke-width="1.5"/></svg> Driver Login</h3>
                    <form id="driverLoginForm">
                        <div class="form-group">
                            <label class="form-label">Username</label>
                            <input type="text" id="driverUsername" class="form-input" placeholder="Enter username" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="driverPassword" class="form-input" placeholder="Enter password" required>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button type="submit" class="action-btn" style="background: linear-gradient(135deg, #10b981, #059669); flex: 1;">Login</button>
                            <button type="button" onclick="closeModal()" class="action-btn" style="background: linear-gradient(135deg, #6b7280, #4b5563); flex: 1;">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('driverLoginForm').onsubmit = function(e) {
                e.preventDefault();
                const username = document.getElementById('driverUsername').value;
                const password = document.getElementById('driverPassword').value;
                
                // Check for admin credentials
                if (username === 'admin' && password === 'admin') {
                    showNotification('Driver login successful!', 'success');
                    closeModal();
                    window.location.href = '/driver-dashboard';
                } else {
                    showNotification('Invalid credentials', 'error');
                }
            };
        }

        function closeModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        // Scroll behavior for bottom navigation
        let lastScrollTop = 0;
        let ticking = false;

        function updateNavigation() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const bottomNav = document.getElementById('bottomNav');
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                bottomNav.classList.add('hidden');
            } else {
                // Scrolling up
                bottomNav.classList.remove('hidden');
            }
            
            lastScrollTop = scrollTop;
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateNavigation);
                ticking = true;
            }
        }

        // Add scroll listener
        window.addEventListener('scroll', requestTick);

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Community page loaded, testing button functionality...');
            initializePostTypes();
            console.log('All community functions initialized successfully');
        });

        // Call Now functionality for services
        function callNow(phoneNumber) {
            if (phoneNumber && phoneNumber !== 'N/A') {
                // Format phone number for calling
                const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
                const telLink = `tel:${cleanPhone}`;
                
                // Check if on mobile device
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    window.location.href = telLink;
                    showNotification('Opening phone app to call...', 'success');
                } else {
                    // On desktop, show the phone number
                    showNotification(`Call: ${phoneNumber}`, 'info');
                    navigator.clipboard.writeText(phoneNumber).then(() => {
                        setTimeout(() => showNotification('Phone number copied to clipboard!', 'success'), 1000);
                    });
                }
            } else {
                showNotification('Phone number not available', 'error');
            }
        }

        // Duplicate function removed - using main notification system above

        // Condition Verification Function - Navigate to Rental Details
        function verifyCondition(itemName, category) {
            // Navigate directly to rental details page
            window.location.href = '/rental-details';
        }

        let selectedRating = 0;

        function setRating(rating) {
            selectedRating = rating;
            // Update button styles to show selection
            const buttons = document.querySelectorAll('.rating-btn');
            buttons.forEach((btn, index) => {
                if (index + 1 <= rating) {
                    btn.style.transform = 'scale(1.1)';
                    btn.style.boxShadow = '0 0 10px rgba(139, 92, 246, 0.5)';
                } else {
                    btn.style.transform = 'scale(1)';
                    btn.style.boxShadow = 'none';
                }
            });
        }

        function submitVerification(itemName, category) {
            const notes = document.getElementById('conditionNotes').value;
            const photo = document.getElementById('conditionPhoto').files[0];
            
            if (selectedRating === 0) {
                alert('Please select a rating before submitting.');
                return;
            }
            
            closeVerificationModal();
            
            // Show success notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed; top: 200px; left: 50%; transform: translateX(-50%);
                background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white;
                padding: 20px; border-radius: 10px; z-index: 10000; max-width: 400px; text-align: center;
            `;
            notification.innerHTML = `
                <h4 style="margin: 0 0 10px 0;">Verification Submitted</h4>
                <p style="margin: 0; font-size: 14px;">Your ${selectedRating}-star verification for "${itemName}" has been sent to the owner for confirmation. This helps build community trust!</p>
            `;
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 4000);
        }

        function closeVerificationModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
            selectedRating = 0;
        }
        function verifyCondition(itemName, type) {
            closeItemDetails();
            
            const verificationModal = document.createElement('div');
            verificationModal.className = 'modal-overlay';
            verificationModal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <h3 style="color: #00ffff; margin-bottom: 20px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 255, 255, 0.2)"/><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.5"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="1.5"/></svg> Condition Verification - ${itemName}</h3>
                    
                    <div style="background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 255, 0.3);">
                        <h4 style="color: #00ffff; margin-bottom: 15px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.2)"/><rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.1)"/><path d="M6 10h12M6 14h12M6 18h8" stroke="currentColor" stroke-width="1.5"/></svg> Verification Process</h4>
                        <p><strong>Step 1:</strong> Upload clear photos of the item</p>
                        <p><strong>Step 2:</strong> Rate the condition (1-5 stars)</p>
                        <p><strong>Step 3:</strong> Add condition notes</p>
                        <p><strong>Step 4:</strong> Owner confirmation required</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="color: #00ffff; display: block; margin-bottom: 10px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(99, 102, 241, 0.2)"/><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.5"/></svg> Upload Photos:</label>
                        <input type="file" id="conditionPhotos" multiple accept="image/*" style="background: rgba(0, 0, 0, 0.3); color: white; border: 1px solid rgba(0, 255, 255, 0.3); padding: 10px; border-radius: 5px; width: 100%;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="color: #00ffff; display: block; margin-bottom: 10px;">Condition Rating:</label>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="setConditionRating(1)" class="rating-btn" style="background: rgba(239, 68, 68, 0.6); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">1★ Poor</button>
                            <button onclick="setConditionRating(2)" class="rating-btn" style="background: rgba(245, 158, 11, 0.6); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">2★ Fair</button>
                            <button onclick="setConditionRating(3)" class="rating-btn" style="background: rgba(251, 191, 36, 0.6); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">3★ Good</button>
                            <button onclick="setConditionRating(4)" class="rating-btn" style="background: rgba(34, 197, 94, 0.6); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">4★ Very Good</button>
                            <button onclick="setConditionRating(5)" class="rating-btn" style="background: rgba(16, 185, 129, 0.6); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">5★ Excellent</button>
                        </div>
                        <div id="selectedRating" style="margin-top: 10px; color: #00ffff;"></div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="color: #00ffff; display: block; margin-bottom: 10px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(139, 92, 246, 0.2)"/><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="1.5"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.5"/></svg> Condition Notes:</label>
                        <textarea id="conditionNotes" placeholder="Describe the item's condition in detail..." style="background: rgba(0, 0, 0, 0.3); color: white; border: 1px solid rgba(0, 255, 255, 0.3); padding: 10px; border-radius: 5px; width: 100%; height: 80px; resize: vertical;"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="closeVerificationModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Cancel</button>
                        <button onclick="submitVerification('${itemName}', '${type}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Submit Verification</button>
                    </div>
                </div>
            `;
            document.body.appendChild(verificationModal);
        }

        let selectedConditionRating = 0;

        function setConditionRating(rating) {
            selectedConditionRating = rating;
            
            // Update visual feedback
            const ratingButtons = document.querySelectorAll('.rating-btn');
            ratingButtons.forEach((btn, index) => {
                if (index < rating) {
                    btn.style.opacity = '1';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    btn.style.opacity = '0.6';
                    btn.style.transform = 'scale(1)';
                }
            });
            
            const ratingDisplay = document.getElementById('selectedRating');
            const ratingTexts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
            ratingDisplay.textContent = `Selected: ${rating}★ ${ratingTexts[rating]}`;
        }

        function submitVerification(itemName, type) {
            const photos = document.getElementById('conditionPhotos').files;
            const notes = document.getElementById('conditionNotes').value;
            
            if (selectedConditionRating === 0) {
                alert('Please select a condition rating');
                return;
            }
            
            if (!notes.trim()) {
                alert('Please add condition notes');
                return;
            }
            
            closeVerificationModal();
            
            // Show success message
            const successModal = document.createElement('div');
            successModal.className = 'modal-overlay';
            successModal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <h3 style="color: #10b981; margin-bottom: 20px;">Verification Submitted</h3>
                    
                    <div style="background: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(16, 185, 129, 0.3);">
                        <p><strong>Item:</strong> ${itemName}</p>
                        <p><strong>Rating:</strong> ${selectedConditionRating}★</p>
                        <p><strong>Photos:</strong> ${photos.length} uploaded</p>
                        <p><strong>Status:</strong> Pending owner confirmation</p>
                        <p style="margin-top: 15px; font-size: 14px;">Owner will be notified to confirm the condition verification. This helps ensure transparency in ${type} transactions.</p>
                    </div>
                    
                    <button onclick="closeSuccessModal()" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Close</button>
                </div>
            `;
            document.body.appendChild(successModal);
        }

        function closeVerificationModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        function closeSuccessModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        // Driver Performance Rating System
        function showDriverPerformance() {
            const performanceModal = document.createElement('div');
            performanceModal.className = 'modal-overlay';
            performanceModal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <h3 style="color: #00ffff; margin-bottom: 20px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.2)"/><path d="M16 3h5v4h-5z" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.1)"/><path d="M2 21h20v-7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="17" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="17" r="2" stroke="currentColor" stroke-width="1.5"/></svg> Driver Performance & Reviews</h3>
                    
                    <div style="background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 255, 0.3);">
                        <h4 style="color: #00ffff; margin-bottom: 15px;">Driver: Mike Johnson</h4>
                        <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                            <div>
                                <p><strong>Overall Rating:</strong> 4.8★ (127 reviews)</p>
                                <p><strong>Deliveries Completed:</strong> 342</p>
                                <p><strong>On-Time Rate:</strong> 96%</p>
                            </div>
                            <div>
                                <p><strong>Damage Rate:</strong> 0.2% (1 incident)</p>
                                <p><strong>Customer Rating:</strong> 4.9★</p>
                                <p><strong>Active Since:</strong> Jan 2024</p>
                            </div>
                        </div>
                        
                        <div style="margin-top: 15px;">
                            <h5 style="color: #00ffff; margin-bottom: 10px;">Recent Reviews:</h5>
                            <div style="background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                                <p style="margin: 0; font-size: 14px;">"Great service! Item arrived exactly as described. Very careful handling." - Sarah M. (5★)</p>
                            </div>
                            <div style="background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                                <p style="margin: 0; font-size: 14px;">"Professional and on time. Would definitely request Mike again." - David L. (5★)</p>
                            </div>
                            <div style="background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 5px;">
                                <p style="margin: 0; font-size: 14px;">"Good communication throughout delivery process." - Lisa K. (4★)</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="closeDriverPerformance()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Close</button>
                        <button onclick="requestDriver('Mike Johnson')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Request This Driver</button>
                    </div>
                </div>
            `;
            document.body.appendChild(performanceModal);
        }

        function closeDriverPerformance() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        function requestDriver(driverName) {
            closeDriverPerformance();
            alert(`Driver request sent for ${driverName}. You'll be notified when they're available for your delivery.`);
        }

        // Facebook share functionality
        function openFacebookShare() {
            document.getElementById('mainMenuDropdown').classList.remove('show');
            
            const facebookModal = document.createElement('div');
            facebookModal.className = 'modal-overlay';
            facebookModal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <h3 style="color: #00ffff; margin-bottom: 20px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(255, 255, 255, 0.2)"/><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="rgba(255, 255, 255, 0.1)"/><path d="M9 9h6M9 13h6M9 17h4" stroke="currentColor" stroke-width="1.5"/></svg> Facebook Share Options</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <button onclick="shareMarketPaceIntegration()" style="background: linear-gradient(135deg, #1877f2, #42a5f5); color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(99, 102, 241, 0.2)"/><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="1.5"/></svg> Share Community
                        </button>
                        <button onclick="shareItemListing()" style="background: linear-gradient(135deg, #1877f2, #42a5f5); color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" stroke="currentColor" stroke-width="1.5"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.5"/></svg> Share Item
                        </button>
                        <button onclick="openIntegrationSetup()" style="background: linear-gradient(135deg, #1877f2, #42a5f5); color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.5"/></svg> Setup Integration
                        </button>
                    </div>
                    <button onclick="closeFacebookShareModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 20px;">Close</button>
                </div>
            `;
            document.body.appendChild(facebookModal);
        }

        function closeFacebookShareModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        function shareMarketPaceIntegration() {
            closeFacebookShareModal();
            const shareText = "Join MarketPace - the local community marketplace! Buy, sell, rent items and support local businesses with delivery!";
            const shareUrl = window.location.origin;
            const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
            window.open(facebookShareUrl, '_blank', 'width=600,height=400');
        }

        function shareItemListing() {
            closeFacebookShareModal();
            alert('Select an item from your posts to share on Facebook');
        }

        function openIntegrationSetup() {
            closeFacebookShareModal();
            window.location.href = '/facebook-marketplace-integration';
        }
        
        function inviteFriends() {
            document.getElementById('menuDropdown').classList.remove('show');
            
            // Check if user logged in with Facebook
            const user = JSON.parse(localStorage.getItem('marketpaceUser') || '{}');
            
            if (user.provider === 'facebook') {
                // Facebook-specific invitation
                const inviteModal = document.createElement('div');
                inviteModal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
                    align-items: center; justify-content: center;
                `;
                
                inviteModal.innerHTML = `
                    <div style="
                        background: linear-gradient(135deg, #1a0b3d, #6b46c1); 
                        padding: 30px; border-radius: 20px; max-width: 400px; 
                        text-align: center; color: white; border: 2px solid #1877f2;
                    ">
                        <h2 style="color: #1877f2; margin-bottom: 20px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(255, 255, 255, 0.2)"/><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="rgba(255, 255, 255, 0.1)"/><path d="M9 9h6M9 13h6M9 17h4" stroke="currentColor" stroke-width="1.5"/></svg> Invite Your Facebook Friends!</h2>
           e="margin-bottom: 20px; line-height: 1.5;">
                        Share MarketPace with friends in your area to build a stronger local community marketplace!
                    </p>
                    <div style="margin: 20px 0;">
                        <button onclick="copyInviteLink()" style="
                            background: #00ffff; color: #1a0b3d; border: none; 
                            padding: 12px 24px; border-radius: 25px; margin: 5px;
                            cursor: pointer; font-weight: bold;
                        "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.2)"/><rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.1)"/><path d="M6 10h12M6 14h12M6 18h8" stroke="currentColor" stroke-width="1.5"/></svg> Copy Link</button>
                        <button onclick="shareInvite()" style="
                            background: #9d4edd; color: white; border: none; 
                            padding: 12px 24px; border-radius: 25px; margin: 5px;
                            cursor: pointer; font-weight: bold;
                        "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.2)"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" stroke-width="1.5"/></svg>Share</button>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); 
                        padding: 8px 20px; border-radius: 15px; cursor: pointer;
                    ">Close</button>
                </div>
            `;
            
            document.body.appendChild(inviteModal);
        }
        
        function copyInviteLink() {
            const inviteText = window.location.origin;
            navigator.clipboard.writeText(inviteText).then(() => {
                alert('MarketPace link copied to clipboard!');
            });
        }
        
        function shareInvite() {
            if (navigator.share) {
                navigator.share({
                    title: 'Join MarketPace Community',
                    text: 'Join me on MarketPace - the local community marketplace!',
                    url: window.location.origin
                });
            } else {
                copyInviteLink();
            }
        }

        function goToCart() {
            window.location.href = '/cart';
            const dropdown = document.getElementById('menuDropdown');
            if (dropdown) dropdown.classList.remove('show');
        }

        async function logout() {
            try {
                // Call server logout endpoint
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                // Clear all user data from localStorage regardless of server response
                localStorage.removeItem('marketpaceUser');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userProfile');
                localStorage.removeItem('sessionData');
                localStorage.removeItem('marketplaceCart');
                localStorage.removeItem('userFavorites');
                
                // Clear any other stored user information
                sessionStorage.clear();
                
                // Show logout confirmation
                alert('Successfully logged out. You can now test Facebook and Google authentication.');
                
                // Redirect to signup/login page
                window.location.href = '/signup-login';
                
            } catch (error) {
                console.error('Logout error:', error);
                
                // Clear local data even if server call fails
                localStorage.clear();
                sessionStorage.clear();
                
                alert('Logged out (local session cleared). You can now test authentication.');
                window.location.href = '/signup-login';
            }
            
            // Close dropdown menu if open
            const menuDropdown = document.getElementById('menuDropdown');
            if (menuDropdown) {
                menuDropdown.classList.remove('show');
            }
        }

        // End of navigation functions

        // Facebook Marketplace-style posting modal
        function openAdvancedPostModal_OLD(type = 'general') {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: #1a0b3d;
                border: 2px solid #00ffff;
                border-radius: 15px;
                padding: 30px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
            `;
            
            modalContent.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: #00ffff; margin: 0;">Create ${type.charAt(0).toUpperCase() + type.slice(1)} Post</h2>
                    <button onclick="this.closest('.posting-modal').remove()" style="background: none; border: none; color: #00ffff; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                
                <form id="postForm" style="color: #e2e8f0;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: #00ffff;">Post Category:</label>
                        <select id="postCategory" style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0;">
                            <option value="general">General</option>
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                            <option value="service">Service</option>
                            <option value="event">Event</option>
                            <option value="job">Job/Hiring</option>
                            <option value="iso">ISO (In Search Of)</option>
                            <option value="poll">Poll</option>
                            <option value="announcement">Announcement</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: #00ffff;">Title:</label>
                        <input type="text" id="postTitle" placeholder="What are you posting about?" style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0;" required>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: #00ffff;">Description:</label>
                        <textarea id="postDescription" placeholder="Tell us more about your post..." style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0; min-height: 100px;" required></textarea>
                    </div>
                    
                    <div id="priceField" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 5px; color: #00ffff;">Price:</label>
                        <input type="text" id="postPrice" placeholder="$0.00" style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0;">
                    </div>
                    
                    <div id="eventFields" style="display: none;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; color: #00ffff;">Event Date:</label>
                            <input type="date" id="eventDate" style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0;">
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; color: #00ffff;">Event Time:</label>
                            <input type="time" id="eventTime" style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0;">
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; color: #00ffff;">Location:</label>
                            <input type="text" id="eventLocation" placeholder="Event location" style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0;">
                        </div>
                    </div>
                    
                    <div id="pollFields" style="display: none;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; color: #00ffff;">Poll Options:</label>
                            <input type="text" id="pollOption1" placeholder="Option 1" style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0; margin-bottom: 10px;">
                            <input type="text" id="pollOption2" placeholder="Option 2" style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: #00ffff;">Images:</label>
                        <input type="file" id="postImages" multiple accept="image/*" style="width: 100%; padding: 10px; border: 1px solid #00ffff; border-radius: 5px; background: #2d1b69; color: #e2e8f0;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 10px; color: #00ffff;">Action Buttons:</label>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            <label style="display: flex; align-items: center; color: #e2e8f0;">
                                <input type="checkbox" id="deliverNow" style="margin-right: 5px;"> Deliver Now
                            </label>
                            <label style="display: flex; align-items: center; color: #e2e8f0;">
                                <input type="checkbox" id="selfPickup" style="margin-right: 5px;"> Self Pickup
                            </label>
                            <label style="display: flex; align-items: center; color: #e2e8f0;">
                                <input type="checkbox" id="bookNow" style="margin-right: 5px;"> Book Now
                            </label>
                            <label style="display: flex; align-items: center; color: #e2e8f0;">
                                <input type="checkbox" id="callNow" style="margin-right: 5px;"> Call Now
                            </label>
                            <label style="display: flex; align-items: center; color: #e2e8f0;">
                                <input type="checkbox" id="messageNow" style="margin-right: 5px;"> Message Now
                            </label>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="this.closest('.posting-modal').remove()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                        <button type="submit" style="padding: 10px 20px; background: #00ffff; color: #1a0b3d; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Create Post</button>
                    </div>
                </form>
            `;
            
            modal.className = 'posting-modal';
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Set initial category
            document.getElementById('postCategory').value = type;
            updateFormFields();
            
            // Add event listeners
            document.getElementById('postCategory').addEventListener('change', updateFormFields);
            document.getElementById('postForm').addEventListener('submit', handlePostSubmit);
            
            function updateFormFields() {
                const category = document.getElementById('postCategory').value;
                const priceField = document.getElementById('priceField');
                const eventFields = document.getElementById('eventFields');
                const pollFields = document.getElementById('pollFields');
                
                // Hide all conditional fields
                priceField.style.display = 'none';
                eventFields.style.display = 'none';
                pollFields.style.display = 'none';
                
                // Show relevant fields based on category
                if (category === 'sale' || category === 'service' || category === 'rent') {
                    priceField.style.display = 'block';
                }
                
                if (category === 'event') {
                    eventFields.style.display = 'block';
                }
                
                if (category === 'poll') {
                    pollFields.style.display = 'block';
                }
            }
            
            function handlePostSubmit(e) {
                e.preventDefault();
                
                const formData = {
                    category: document.getElementById('postCategory').value,
                    title: document.getElementById('postTitle').value,
                    description: document.getElementById('postDescription').value,
                    price: document.getElementById('postPrice').value,
                    eventDate: document.getElementById('eventDate').value,
                    eventTime: document.getElementById('eventTime').value,
                    eventLocation: document.getElementById('eventLocation').value,
                    pollOption1: document.getElementById('pollOption1').value,
                    pollOption2: document.getElementById('pollOption2').value,
                    actionButtons: {
                        deliverNow: document.getElementById('deliverNow').checked,
                        selfPickup: document.getElementById('selfPickup').checked,
                        bookNow: document.getElementById('bookNow').checked,
                        callNow: document.getElementById('callNow').checked,
                        messageNow: document.getElementById('messageNow').checked
                    },
                    created: new Date().toISOString(),
                    author: 'Community Member'
                };
                
                // Save to localStorage
                const existingPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
                existingPosts.unshift(formData);
                localStorage.setItem('communityPosts', JSON.stringify(existingPosts));
                
                // Close modal
                modal.remove();
                
                // Show success message
                showNotification(`${formData.category.charAt(0).toUpperCase() + formData.category.slice(1)} post "${formData.title}" created successfully!`, 'success');
                
                // Refresh page to show new post
                setTimeout(() => location.reload(), 1000);
            }
        }

        // Post creation
        function createPost(type = 'general') {
            openAdvancedPostModal(type);
        }

        // Commerce functions
        function addToCart(itemName, price = null, seller = null, image = null) {
            // Get or create cart data
            let cartData = JSON.parse(localStorage.getItem('marketplaceCart')) || { items: [] };
            
            // Generate item data
            const newItem = {
                id: Date.now(),
                name: itemName,
                seller: seller || "Local Seller",
                price: price || 25.00,
                image: image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
                size: "small",
                available: true,
                availabilityStatus: Math.random() > 0.7 ? "limited" : "available"
            };
            
            // Add to cart
            cartData.items.push(newItem);
            
            // Save to localStorage
            localStorage.setItem('marketplaceCart', JSON.stringify(cartData));
            
            // Update cart badge
            updateCartBadge();
            
            // Show notification
            showNotification(`"${itemName}" added to cart!`, 'success');
        }
        
        // Update cart badge
        function updateCartBadge() {
            const cartData = JSON.parse(localStorage.getItem('marketplaceCart')) || { items: [] };
            const badge = document.getElementById('cartBadge');
            if (badge) {
                badge.textContent = cartData.items.length;
                badge.style.display = cartData.items.length > 0 ? 'inline-block' : 'none';
            }
        }
        
        // Duplicate function removed - using main notification system

        function makeOffer(item) {
            const offer = prompt(`Make an offer for "${item}":`);
            if (offer) {
                alert(`Offer of $${offer} sent for "${item}"!`);
            }
        }

        function callService(serviceName) {
            // In a real app, this would use device calling functionality
            if (window.location.protocol === 'tel:') {
                window.location.href = 'tel:+1234567890'; // Service phone number
            } else {
                const confirmCall = confirm(`Call ${serviceName} service now?\n\nPhone: (123) 456-7890`);
                if (confirmCall) {
                    window.open('tel:+1234567890', '_self');
                }
            }
        }

        function deliverNow(item, price = null, seller = null, image = null) {
            // Add item to cart first
            addToCart(item, price, seller, image);
            
            // Show success message
            showNotification(`${item} added to cart! Redirecting to checkout...`, 'success');
            
            // Navigate to cart page after brief delay
            setTimeout(() => {
                window.location.href = '/cart';
            }, 1500);
        }

        function rentNow(item) {
            console.log(`Navigating to rentals for "${item}"`);
            window.location.href = '/rentals';
        }

        function bookService(service) {
            alert(`Booking "${service}" service`);
        }

        // Social interaction functions
        function likePost(button) {
            const isLiked = button.classList.contains('liked');
            if (isLiked) {
                button.classList.remove('liked');
                button.innerHTML = 'Like';
                button.style.color = 'rgba(255, 255, 255, 0.8)';
                showNotification('Like removed', 'info');
            } else {
                button.classList.add('liked');
                button.innerHTML = '❤️ Liked';
                button.style.color = '#ff6b6b';
                showNotification('Post liked!', 'success');
            }
        }

        function favoritePost(button) {
            const isFavorited = button.classList.contains('favorited');
            if (isFavorited) {
                button.classList.remove('favorited');
                button.innerHTML = 'Favorite';
                button.style.color = 'rgba(255, 255, 255, 0.8)';
                showNotification('Removed from favorites', 'info');
            } else {
                button.classList.add('favorited');
                button.innerHTML = '⭐ Favorited';
                button.style.color = '#ffd93d';
                showNotification('Added to favorites!', 'success');
            }
        }

        function commentPost(postElement) {
            // Get the post element if not provided
            if (!postElement) {
                postElement = event.target.closest('.feed-post');
            }
            
            // Check if comment section already exists
            let commentSection = postElement.querySelector('.comments-section');
            if (!commentSection) {
                // Create comment section
                commentSection = document.createElement('div');
                commentSection.className = 'comments-section';
                commentSection.innerHTML = `
                    <div class="comment-input-section">
                        <input type="text" class="comment-input" placeholder="Write a comment..." style="
                            width: 100%; 
                            padding: 10px; 
                            background: rgba(255,255,255,0.1); 
                            border: 1px solid rgba(255,255,255,0.2); 
                            border-radius: 20px; 
                            color: white; 
                            margin: 10px 0;
                        ">
                        <button onclick="postComment(this)" style="
                            background: linear-gradient(135deg, #00ffff, #9d4edd);
                            border: none;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 15px;
                            cursor: pointer;
                            margin-left: 10px;
                        ">Post</button>
                    </div>
                    <div class="comments-list"></div>
                `;
                postElement.appendChild(commentSection);
            }
            
            // Focus on comment input
            const commentInput = commentSection.querySelector('.comment-input');
            commentInput.focus();
        }

        function sharePost() {
            if (navigator.share) {
                navigator.share({
                    title: 'MarketPace Community Post',
                    text: 'Check out this post on MarketPace!',
                    url: window.location.href
                });
            } else {
                // Fallback for browsers without native sharing
                const url = window.location.href;
                navigator.clipboard.writeText(url).then(() => {
                    alert('Post link copied to clipboard!');
                }).catch(() => {
                    alert('Share feature - link: ' + url);
                });
            }
        }

        function viewUserProfile(username) {
            // Profile viewing functionality
            showNotification(`Loading ${username.replace(/-/g, ' ')} profile...`, 'info');
            
            // Map usernames to profile types and redirect accordingly
            const profileMap = {
                'sarah-boutique': '/public-pro-shop.html',
                'sarahs-boutique': '/public-pro-shop.html',
                'toms-tool-rentals': '/user-profile.html', 
                'mikes-handyman-service': '/public-pro-service.html',
                'dj-sunset-vibes': '/unified-pro-page',
                'coastal-gifts': '/public-pro-shop.html',
                'coastal-gifts-souvenirs': '/public-pro-shop.html',
                'gulf-coast-handyman': '/public-pro-service.html',
                'artisan-photography': '/public-pro-creative.html',
                'tech-electronics-store': '/public-pro-shop.html',
                'autocars-dealership': '/public-pro-shop.html'
            };

            // If it's a known demo account, go to their public Pro page
            if (profileMap[username]) {
                setTimeout(() => {
                    window.location.href = profileMap[username] + '?user=' + username;
                }, 1000);
            } else {
                // For regular users, create a basic profile page experience
                setTimeout(() => {
                    window.location.href = '/user-profile.html?user=' + username;
                }, 1000);
            }
        }

        // Check if user is logged in
        function checkLoginStatus() {
            // Check for OAuth user data in URL params
            const urlParams = new URLSearchParams(window.location.search);
            const userParam = urlParams.get('user');
            
            if (userParam) {
                // Store OAuth user data in localStorage
                const userData = JSON.parse(decodeURIComponent(userParam));
                localStorage.setItem('marketpaceUser', JSON.stringify(userData));
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Update profile display
                updateProfileDisplay(userData);
                return;
            }
            
            // Check localStorage for existing user
            const userData = localStorage.getItem('marketpaceUser');
            if (!userData) {
                // Not logged in, redirect to landing page
                window.location.href = '/';
                return;
            }
            
            const user = JSON.parse(userData);
            if (!user.loggedIn) {
                window.location.href = '/';
                return;
            }
            
            updateProfileDisplay(user);
        }
        
        function updateProfileDisplay(user) {
            // Update profile display with user info
            if (user.profilePicture) {
                // Use Facebook profile picture for main profile button
                const mainProfilePic = document.getElementById('profileMainPicture');
                const mainProfileInitials = document.getElementById('profileMainInitials');
                if (mainProfilePic && mainProfileInitials) {
                    mainProfilePic.src = user.profilePicture;
                    mainProfilePic.style.display = 'block';
                    mainProfileInitials.style.display = 'none';
                }
                
                // Update all other profile pics in posts
                document.querySelectorAll('.profile-pic').forEach(pic => {
                    pic.innerHTML = `<img src="${user.profilePicture}" alt="${user.name}" style="width: 100%; height: 100%; border-radius: 6px; object-fit: cover;">`;
                });
            } else if (user.name) {
                const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
                
                // Update main profile button
                const mainProfileInitials = document.getElementById('profileMainInitials');
                if (mainProfileInitials) {
                    mainProfileInitials.textContent = initials;
                }
                
                // Update other profile pics
                document.querySelectorAll('.profile-pic span').forEach(span => {
                    span.textContent = initials;
                });
            } else if (user.email) {
                const initials = user.email.substring(0, 2).toUpperCase();
                
                // Update main profile button
                const mainProfileInitials = document.getElementById('profileMainInitials');
                if (mainProfileInitials) {
                    mainProfileInitials.textContent = initials;
                }
                
                // Update other profile pics
                document.querySelectorAll('.profile-pic span').forEach(span => {
                    span.textContent = initials;
                });
            }
            
            // Update any display name elements
            if (user.name) {
                document.querySelectorAll('.user-name').forEach(nameEl => {
                    nameEl.textContent = user.name;
                });
                
                // Update placeholder text to use real name
                const statusInput = document.querySelector('.status-input');
                if (statusInput) {
                    statusInput.placeholder = `${user.name.split(' ')[0]}, share with your community!`;
                }
            }
        }

        function showFacebookWelcomeInvite() {
            const welcomeModal = document.createElement('div');
            welcomeModal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.9); z-index: 10000; display: flex; 
                align-items: center; justify-content: center;
            `;
            
            welcomeModal.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #1a0b3d, #6b46c1); 
                    padding: 40px; border-radius: 20px; max-width: 450px; 
                    text-align: center; color: white; border: 3px solid #1877f2;
                    box-shadow: 0 20px 60px rgba(24, 119, 242, 0.3);
                ">
                    <h1 style="color: #1877f2; margin-bottom: 20px; font-size: 28px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(236, 72, 153, 0.2)"/><path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" stroke="currentColor" stroke-width="1.5" fill="rgba(236, 72, 153, 0.3)"/></svg> Welcome to MarketPace!</h1>
                    <p style="margin-bottom: 25px; line-height: 1.6; font-size: 16px;">
                        Hey Brooke! Thanks for joining with Facebook. Want to invite your Facebook friends 
                        to join the MarketPace community? The more neighbors we have, the better our local marketplace becomes!
                    </p>
                    <div style="margin: 25px 0;">
                        <button onclick="shareFacebookPost(); this.parentElement.parentElement.parentElement.remove();" style="
                            background: #1877f2; color: white; border: none; 
                            padding: 15px 25px; border-radius: 25px; margin: 8px;
                            cursor: pointer; font-weight: bold; font-size: 14px;
                        "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(139, 92, 246, 0.2)"/><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="1.5"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.5"/></svg> Share on Facebook</button>
                        <button onclick="sendFacebookMessage(); this.parentElement.parentElement.parentElement.remove();" style="
                            background: #42a5f5; color: white; border: none; 
                            padding: 15px 25px; border-radius: 25px; margin: 8px;
                            cursor: pointer; font-weight: bold; font-size: 14px;
                        "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="6" width="20" height="12" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 255, 255, 0.2)"/><path d="m2 7 8.97 5.7a1.94 1.94 0 0 0 2.06 0L22 7" stroke="currentColor" stroke-width="1.5"/></svg> Message Friends</button>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); 
                        padding: 10px 25px; border-radius: 15px; cursor: pointer; margin-top: 10px;
                    ">Maybe Later</button>
                </div>
            `;
            
            document.body.appendChild(welcomeModal);
        }

        function createLogoParticles() {
            const logoParticlesContainer = document.getElementById('logoParticles');
            if (!logoParticlesContainer) {
                console.log('Logo particles container not found, skipping...');
                return;
            }
            
            // Create 8 logo particles for bigger logo
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'logo-particle';
                
                // Random starting position around the logo
                const angle = (360 / 8) * i + Math.random() * 20;
                particle.style.setProperty('--start-angle', angle + 'deg');
                particle.style.animationDelay = (i * 0.3) + 's';
                
                logoParticlesContainer.appendChild(particle);
            }
        }

        // Advanced Post Modal Functions - REMOVED DUPLICATE

        function clearCategorySelection() {
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
        }

        function toggleFieldsForCategory(category) {
            const priceGroup = document.getElementById('priceGroup');
            const rentalPricingGroup = document.getElementById('rentalPricingGroup');
            const eventDetailsGroup = document.getElementById('eventDetailsGroup');
            const pollOptions = document.getElementById('pollOptions');
            const jobCompanyGroup = document.getElementById('jobCompanyGroup');
            const jobTypeGroup = document.getElementById('jobTypeGroup');
            const jobSalaryGroup = document.getElementById('jobSalaryGroup');
            const jobRequirementsGroup = document.getElementById('jobRequirementsGroup');
            const jobBenefitsGroup = document.getElementById('jobBenefitsGroup');
            
            // Hide all optional fields first
            if (priceGroup) priceGroup.style.display = 'none';
            if (rentalPricingGroup) rentalPricingGroup.style.display = 'none';
            if (eventDetailsGroup) eventDetailsGroup.style.display = 'none';
            if (pollOptions) pollOptions.style.display = 'none';
            if (jobCompanyGroup) jobCompanyGroup.style.display = 'none';
            if (jobTypeGroup) jobTypeGroup.style.display = 'none';
            if (jobSalaryGroup) jobSalaryGroup.style.display = 'none';
            if (jobRequirementsGroup) jobRequirementsGroup.style.display = 'none';
            if (jobBenefitsGroup) jobBenefitsGroup.style.display = 'none';
            
            // Show relevant fields based on category
            if (category === 'sale' || category === 'service') {
                if (priceGroup) priceGroup.style.display = 'block';
            } else if (category === 'rent') {
                if (rentalPricingGroup) rentalPricingGroup.style.display = 'block';
            } else if (category === 'event') {
                if (eventDetailsGroup) eventDetailsGroup.style.display = 'block';
            } else if (category === 'poll') {
                if (pollOptions) pollOptions.style.display = 'block';
            } else if (category === 'job') {
                if (jobCompanyGroup) jobCompanyGroup.style.display = 'block';
                if (jobTypeGroup) jobTypeGroup.style.display = 'block';
                if (jobSalaryGroup) jobSalaryGroup.style.display = 'block';
                if (jobRequirementsGroup) jobRequirementsGroup.style.display = 'block';
                if (jobBenefitsGroup) jobBenefitsGroup.style.display = 'block';
            }
        }

        function selectCategory(category) {
            // Clear previous selections
            clearCategorySelection();
            
            // Select new category
            const categoryBtn = document.querySelector(`[data-category="${category}"]`);
            if (categoryBtn) {
                categoryBtn.classList.add('selected');
            }
            
            toggleFieldsForCategory(category);
        }

        function addPollOption() {
            const pollList = document.getElementById('pollOptionsList');
            const optionDiv = document.createElement('div');
            optionDiv.className = 'poll-option';
            optionDiv.innerHTML = `
                <input type="text" class="form-input" placeholder="Option ${pollList.children.length + 1}">
                <button type="button" class="remove-option" onclick="removePollOption(this)">×</button>
            `;
            pollList.appendChild(optionDiv);
        }

        function removePollOption(button) {
            const pollList = document.getElementById('pollOptionsList');
            if (pollList.children.length > 2) {
                button.parentElement.remove();
            }
        }

        // Search Popup Functions
        function toggleSearchPopup() {
            // Search popup removed - now using inline category buttons
            console.log('Search activated - categories shown in header');
        }

        function changeRadius() {
            const currentRadius = localStorage.getItem('searchRadius') || '30';
            const radiusOptions = ['5', '10', '15', '30', '50'];
            const currentIndex = radiusOptions.indexOf(currentRadius);
            const nextIndex = (currentIndex + 1) % radiusOptions.length;
            const newRadius = radiusOptions[nextIndex];
            
            localStorage.setItem('searchRadius', newRadius);
            document.getElementById('searchInput').placeholder = `Search ${newRadius}-mile area...`;
            
            console.log(`Search radius changed to ${newRadius} miles`);
        }



        function searchFor(category) {
            console.log('Searching for:', category);
            showNotification(`Searching ${category}...`, 'info');
            toggleSearchPopup();
            // Add actual search logic here
        }

        // Profile Modal Functions
        function openProfileModal() {
            document.getElementById('profileModal').style.display = 'flex';
            // Load user profile data
            const user = JSON.parse(localStorage.getItem('marketpaceUser') || '{}');
            const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'MP';
            document.getElementById('profilePlaceholder').textContent = initials;
        }

        function closeProfileModal() {
            document.getElementById('profileModal').style.display = 'none';
        }

        function previewProfilePic() {
            const file = document.getElementById('profilePicInput').files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('profilePicPreview');
                    preview.innerHTML = `<img src="${e.target.result}" class="profile-avatar">`;
                };
                reader.readAsDataURL(file);
            }
        }

        function saveProfilePic() {
            const file = document.getElementById('profilePicInput').files[0];
            if (file) {
                // In a real app, upload to server
                // For demo, save to localStorage
                const reader = new FileReader();
                reader.onload = function(e) {
                    localStorage.setItem('userProfilePic', e.target.result);
                    
                    // Update profile button
                    const profileButton = document.querySelector('.profile-button');
                    profileButton.innerHTML = `<img src="${e.target.result}" class="profile-avatar">`;
                    
                    showNotification('Profile picture updated successfully!', 'success');
                    closeProfileModal();
                };
                reader.readAsDataURL(file);
            } else {
                showNotification('Please select a photo first', 'error');
            }
        }

        function useFacebookProfilePic() {
            // In a real app, fetch from Facebook API
            const user = JSON.parse(localStorage.getItem('marketpaceUser') || '{}');
            if (user.profilePicture) {
                localStorage.setItem('userProfilePic', user.profilePicture);
                
                // Update profile button
                const profileButton = document.querySelector('.profile-button');
                profileButton.innerHTML = `<img src="${user.profilePicture}" class="profile-avatar">`;
                
                // Update profile preview
                const preview = document.getElementById('profilePicPreview');
                preview.innerHTML = `<img src="${user.profilePicture}" class="profile-avatar">`;
                
                showNotification('Facebook profile picture applied!', 'success');
            } else {
                showNotification('No Facebook profile picture found', 'error');
            }
        }

        function inviteFacebookFriends() {
            showNotification('Opening Facebook friend invitation...', 'info');
            
            // Create Facebook invitation modal
            const inviteModal = document.createElement('div');
            inviteModal.className = 'profile-modal';
            inviteModal.innerHTML = `
                <div class="profile-modal-content">
                    <div class="post-modal-header">
                        <h3 class="post-modal-title">Invite Facebook Friends</h3>
                        <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                    </div>
                    <h4 style="color: #00ffff; margin-bottom: 20px;">Share MarketPace with your friends!</h4>
                    <p style="color: white; margin-bottom: 20px;">Help your community discover local commerce and job opportunities.</p>
                    <button class="upload-btn" onclick="shareToFacebookPost()">Share as Facebook Post</button>
                    <button class="upload-btn" onclick="shareToFacebookMessenger()">Send via Messenger</button>
                    <button class="upload-btn" style="background: #ef4444;" onclick="this.parentElement.parentElement.remove()">Cancel</button>
                </div>
            `;
            document.body.appendChild(inviteModal);
        }

        function inviteContacts() {
            showNotification('Opening contact invitation...', 'info');
            
            // Create contact invitation modal  
            const inviteModal = document.createElement('div');
            inviteModal.className = 'profile-modal';
            inviteModal.innerHTML = `
                <div class="profile-modal-content">
                    <div class="post-modal-header">
                        <h3 class="post-modal-title">Invite Contacts</h3>
                        <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                    </div>
                    <h4 style="color: #00ffff; margin-bottom: 20px;">Join the Community</h4>
                    <p style="color: white; margin-bottom: 20px;">Share this link with friends and family:</p>
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <input type="text" value="https://marketpace.shop/join" readonly style="width: 100%; background: none; border: none; color: #00ffff; text-align: center;">
                    </div>
                    <button class="upload-btn" onclick="copyInviteLink()">Copy Link</button>
                    <button class="upload-btn" onclick="shareInviteLink()">Share Link</button>
                    <button class="upload-btn" style="background: #ef4444;" onclick="this.parentElement.parentElement.remove()">Cancel</button>
                </div>
            `;
            document.body.appendChild(inviteModal);
        }

        function shareToFacebookPost() {
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://marketpace.shop')}&quote=${encodeURIComponent('Join me on MarketPace - discover local commerce, jobs, and community opportunities in our neighborhood! <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(34, 197, 94, 0.2)"/><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.5"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.5"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="rgba(0, 255, 255, 0.2)"/><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" stroke="currentColor" stroke-width="1.5"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.5"/></svg>')}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
            showNotification('Facebook share opened!', 'success');
        }

        function shareToFacebookMessenger() {
            const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent('https://marketpace.shop')}&app_id=1043690817269912&redirect_uri=${encodeURIComponent(window.location.href)}`;
            window.open(messengerUrl, '_blank', 'width=600,height=400');
            showNotification('Messenger share opened!', 'success');
        }

        function copyInviteLink() {
            navigator.clipboard.writeText('https://marketpace.shop/join').then(() => {
                showNotification('Invite link copied to clipboard!', 'success');
            }).catch(() => {
                showNotification('Could not copy link', 'error');
            });
        }

        function shareInviteLink() {
            if (navigator.share) {
                navigator.share({
                    title: 'Join MarketPace',
                    text: 'Join me on MarketPace - discover local commerce and community opportunities!',
                    url: 'https://marketpace.shop/join'
                });
            } else {
                copyInviteLink();
            }
        }

        // Duplicate navigation function removed - using main one below

        // Close popups when clicking outside
        document.addEventListener('click', function(e) {
            const searchPopup = document.getElementById('searchPopup');
            const searchWrapper = document.querySelector('.search-wrapper');
            
            if (searchPopup && !searchWrapper.contains(e.target) && !searchPopup.contains(e.target)) {
                searchPopup.classList.remove('show');
            }
        });

        // Category button click handlers
        // Profile loading moved to main DOMContentLoaded

        // New function for main menu toggle
        function toggleMainMenu() {
            const dropdown = document.getElementById('mainMenuDropdown');
            dropdown.classList.toggle('show');
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.filter-btn') && !event.target.closest('.filter-dropdown')) {
                const filterDropdown = document.getElementById('filterDropdown');
                if (filterDropdown) filterDropdown.classList.remove('show');
            }
            if (!event.target.closest('.profile-main-button') && !event.target.closest('.menu-dropdown')) {
                const mainMenuDropdown = document.getElementById('mainMenuDropdown');
                if (mainMenuDropdown) mainMenuDropdown.classList.remove('show');
            }
        });

        // Initialize post types (placeholder function)
        function initializePostTypes() {
            // Function for initializing post types when needed
            console.log('Post types initialized');
        }

        // Initialize page when DOM is loaded
        // Create floating particles
        function createParticles() {
            const particlesContainer = document.querySelector('.particles');
            if (!particlesContainer) {
                console.log('Particles container not found, creating one...');
                const newParticlesContainer = document.createElement('div');
                newParticlesContainer.className = 'particles';
                document.body.appendChild(newParticlesContainer);
                return createParticles(); // Retry with new container
            }
            
            const particleCount = 40;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 8 + 's';
                particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        // MAIN INITIALIZATION - Single consolidated DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
            console.log('MarketPace Community loading...');
            
            try {
                // Initialize all functions
                createParticles();
                createLogoParticles();
                updateCartBadge();
                checkLoginStatus();
                initializePostTypes();
                
                // Add post modal functionality
                const categoryButtons = document.querySelectorAll('.category-btn');
                categoryButtons.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const category = this.getAttribute('data-category');
                        selectCategory(category);
                    });
                });

                // Post form submission
                const postForm = document.getElementById('advancedPostForm');
                if (postForm) {
                    postForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        showNotification('Post created successfully!', 'success');
                        closePostModal();
                    });
                }
                
                // Load saved profile picture
                const savedProfilePic = localStorage.getItem('userProfilePic');
                if (savedProfilePic) {
                    const profileButton = document.querySelector('.profile-button');
                    if (profileButton) {
                        profileButton.innerHTML = `<img src="${savedProfilePic}" class="profile-avatar">`;
                    }
                }
                
                // Facebook invite check
                if (localStorage.getItem('showFacebookInvite') === 'true') {
                    localStorage.removeItem('showFacebookInvite');
                    setTimeout(() => showFacebookWelcomeInvite(), 1500);
                }
                
                console.log('Community page loaded successfully');
                
                // Check for initial category filter from URL
                checkInitialCategory();
                
                setTimeout(() => {
                    showNotification('Navigation ready - all buttons active!', 'success');
                }, 1000);
                
            } catch (error) {
                console.error('❌ Initialization error:', error);
                showNotification('Some features may not work. Please refresh.', 'error');
            }
        });
        
        // Filter posts by category - COMPLETELY REWRITTEN AND FUNCTIONAL
        function filterByCategory(category) {
            console.log('🔍 Filtering by category:', category);
            
            // Get all posts
            const posts = document.querySelectorAll('.feed-post');
            console.log('Found posts:', posts.length);
            
            let visibleCount = 0;
            
            // Hide/show posts based on category
            posts.forEach(post => {
                const postCategory = post.getAttribute('data-category');
                const postType = post.getAttribute('data-type');
                
                console.log('📝 Post category:', postCategory, 'type:', postType);
                
                // Show posts that match the category OR show all if category is 'all'
                if (category === 'all' || postCategory === category) {
                    post.style.display = 'block';
                    post.style.opacity = '1';
                    visibleCount++;
                } else {
                    post.style.display = 'none';
                }
            });
            
            console.log('Showing', visibleCount, 'posts for category:', category);
            
            // Show notification
            const categoryDisplayNames = {
                'fashion': 'Fashion & Clothing',
                'tools': 'Tools & Equipment', 
                'home-garden': 'Home & Garden Services',
                'all': 'All Categories'
            };
            
            const displayName = categoryDisplayNames[category] || category;
            
            const notification = document.createElement('div');
            notification.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 255, 255, 0.2)"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/></svg> Showing ${visibleCount} ${displayName} posts`;
            notification.style.cssText = `
                position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
                background: linear-gradient(135deg, #00ffff, #0080ff); color: #000;
                padding: 10px 20px; border-radius: 25px; font-weight: bold;
                z-index: 1000; font-size: 14px; box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
        
        // Browse category function for menu integration
        function browseCategory(category) {
            console.log('️ Browsing category from menu:', category);
            
            // Navigate to community page if not already there
            if (!window.location.pathname.includes('community')) {
                window.location.href = `/community?category=${category}`;
                return;
            }
            
            // Update URL with category parameter
            const url = new URL(window.location);
            url.searchParams.set('category', category);
            window.history.pushState({}, '', url);
            
            // Apply the filter
            filterByCategory(category);
        }
        
        // Check URL parameters on page load and apply category filter
        function checkInitialCategory() {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            if (category) {
                console.log('Initial category from URL:', category);
                filterByCategory(category);
            }
        }
        
        // Hide/show search bar on scroll
        window.addEventListener('scroll', function() {
            const searchWrapper = document.querySelector('.search-wrapper');
            if (!searchWrapper) return;
            
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > window.lastScrollTop && scrollTop > 100) {
                // Scrolling down - hide search bar
                searchWrapper.classList.add('hidden');
            } else {
                // Scrolling up - show search bar
                searchWrapper.classList.remove('hidden');
            }
            window.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });

        // Open full verification page for item details and delivery scheduling
        function openVerificationPage(itemName, memberName, category, price) {
            try {
                console.log(`Opening verification page for ${itemName} by ${memberName}...`);
                
                // Store item details for verification page
                localStorage.setItem('verificationItem', JSON.stringify({
                    name: itemName,
                    owner: memberName,
                    category: category,
                    price: price,
                    timestamp: Date.now()
                }));
                
                // Navigate to dedicated verification page
                window.location.href = '/item-verification';
                
                showNotification(`Opening verification for ${itemName}`, 'info');
            } catch (error) {
                console.error('Verification page error:', error);
                showNotification('Verification page error', 'error');
            }
        }

        // Go to specific member profile page
        function goToMemberProfile(memberName, initials) {
            try {
                console.log(`Navigating to ${memberName}'s profile...`);
                
                // Store member info for profile page
                localStorage.setItem('selectedMember', JSON.stringify({
                    name: memberName,
                    initials: initials,
                    verified: true
                }));
                
                // Navigate to profile page
                window.location.href = '/profile';
                
                showNotification(`Opening ${memberName}'s profile`, 'info');
            } catch (error) {
                console.error('Profile navigation error:', error);
                showNotification('Profile navigation error', 'error');
            }
        }

        // Removed duplicate DOMContentLoaded listener - consolidated below
        
        // Initialize cart badge on page load
        updateCartBadge();
        
        // Initialize messages badge on page load
        updateMessagesBadge();

        // Facebook-style Messages Navigation
        function goToMessages() {
            window.location.href = '/messages';
        }

        // Update messages badge with notification count
        function updateMessagesBadge() {
            const conversations = JSON.parse(localStorage.getItem('marketpace_conversations') || '[]');
            const badge = document.getElementById('messagesBadge');
            
            if (conversations.length > 0) {
                badge.textContent = conversations.length;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        // Update badge when new messages are created
        function incrementMessagesBadge() {
            const conversations = JSON.parse(localStorage.getItem('marketpace_conversations') || '[]');
            const badge = document.getElementById('messagesBadge');
            
            if (conversations.length > 0) {
                badge.textContent = conversations.length;
                badge.classList.remove('hidden');
                
                // Animate the badge
                badge.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    badge.style.transform = 'scale(1)';
                }, 200);
            }
        }

        // Navigation functions for bottom navigation
        function goToPage(page) {
            console.log('Navigating to:', page);
            try {
                console.log(`Navigating to ${page}...`);
                
                switch(page) {
                    case 'home':
                        window.location.href = '/community';
                        break;
                    case 'shop':
                    case 'shops':
                        window.location.href = '/shops';
                        break;
                    case 'service':
                    case 'services':
                        window.location.href = '/services';
                        break;
                    case 'hub':
                    case 'the-hub':
                        window.location.href = '/the-hub';
                        break;
                    case 'delivery':
                        window.location.href = '/delivery';
                        break;
                    case 'rentals':
                        window.location.href = '/rentals';
                        break;
                    case 'menu':
                        window.location.href = '/marketpace-menu';
                        break;
                    case 'profile':
                        window.location.href = '/profile';
                        break;
                    case 'cart':
                        window.location.href = '/cart';
                        break;
                    case 'community':
                    case 'home':
                        showNotification('You are already on the Community page', 'info');
                        break;
                    default:
                        console.log(`Unknown page: ${page}`);
                        showNotification(`Navigation to ${page} not available yet`, 'info');
                }
            } catch (error) {
                console.error('Navigation error:', error);
                showNotification('Navigation error occurred', 'error');
            }
        }

        // Profile menu functions
        function goToProfile() {
            try {
                console.log('Going to profile...');
                // Check current account mode and navigate to appropriate profile
                const currentAccount = localStorage.getItem('currentAccount') || 'personal';
                
                if (currentAccount === 'business') {
                    // Navigate to business profile/dashboard
                    window.location.href = '/unified-pro-page';
                } else {
                    // Navigate to personal profile
                    window.location.href = '/profile.html';
                }
            } catch (error) {
                console.error('Profile navigation error:', error);
                showNotification('Profile navigation error', 'error');
            }
        }

        function goToCart() {
            try {
                console.log('Going to cart...');
                window.location.href = '/cart';
            } catch (error) {
                console.error('Cart navigation error:', error);
                showNotification('Cart navigation error', 'error');
            }
        }

        function logout() {
            try {
                console.log('Logging out...');
                
                // Clear all stored user data
                localStorage.removeItem('marketpaceUser');
                localStorage.removeItem('cart');
                localStorage.removeItem('favorites');
                sessionStorage.clear();
                
                // Redirect to home page
                window.location.href = '/';
                
                showNotification('Logged out successfully', 'success');
            } catch (error) {
                console.error('Logout error:', error);
                showNotification('Logout completed', 'info');
                window.location.href = '/';
            }
        }

        // Filter Posts Function with Radius Integration
        function filterPosts(category) {
            // Remove active class from all filter items
            document.querySelectorAll('.filter-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked filter
            event.target.classList.add('active');
            
            console.log(`Filtering posts by: ${category}`);
            
            // Get user's current location and radius preference
            const userLocation = getUserLocation();
            const radiusPreference = localStorage.getItem('searchRadius') || '10'; // Default 10 miles
            
            // Filter feed posts based on category and radius
            const feedPosts = document.querySelectorAll('.feed-post');
            feedPosts.forEach(post => {
                let showPost = false;
                
                if (category === 'all') {
                    showPost = true;
                } else {
                    // Check category match (in real implementation, check data attributes)
                    const postCategory = post.getAttribute('data-category') || 'general';
                    showPost = (postCategory === category);
                }
                
                // Apply radius filtering for launched towns only
                if (showPost) {
                    const postLocation = post.getAttribute('data-location');
                    const postTown = post.getAttribute('data-town');
                    
                    // Check if town has launched MarketPace with active drivers
                    if (postTown && !isLaunchedTown(postTown)) {
                        showPost = false;
                    }
                    
                    // Apply radius filtering if location available
                    if (showPost && userLocation && postLocation) {
                        const distance = calculateDistance(userLocation, postLocation);
                        if (distance > parseInt(radiusPreference)) {
                            showPost = false;
                        }
                    }
                }
                
                post.style.display = showPost ? 'block' : 'none';
            });
            
            showNotification(`Showing ${category} posts within ${radiusPreference} miles`, 'info');
        }

        // Get user location from localStorage or prompt
        function getUserLocation() {
            return JSON.parse(localStorage.getItem('userLocation') || 'null');
        }

        // Check if town has launched MarketPace with active drivers and members
        function isLaunchedTown(townName) {
            const launchedTowns = [
                'Orange Beach, AL', 'Gulf Shores, AL', 'Foley, AL', 'Spanish Fort, AL',
                'Daphne, AL', 'Fairhope, AL', 'Mobile, AL', 'Pensacola, FL',
                'Destin, FL', 'Fort Walton Beach, FL', 'Panama City, FL', 'Tallahassee, FL'
            ];
            return launchedTowns.some(town => town.toLowerCase().includes(townName.toLowerCase()));
        }

        // Calculate distance between two locations (simplified)
        function calculateDistance(loc1, loc2) {
            // Simplified distance calculation (in real implementation, use proper geo calculation)
            const lat1 = loc1.lat, lon1 = loc1.lng;
            const lat2 = loc2.lat, lon2 = loc2.lng;
            
            const R = 3959; // Earth radius in miles
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        // Facebook Sharing Functions
        function openFacebookShare() {
            const shareModal = document.createElement('div');
            shareModal.className = 'profile-modal';
            shareModal.innerHTML = `
                <div class="profile-modal-content">
                    <div class="post-modal-header">
                        <h3 class="post-modal-title">Share to Facebook</h3>
                        <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                    </div>
                    <div style="margin: 20px 0;">
                        <button class="upload-btn" onclick="shareMarketPaceToFacebook()">Share MarketPace Community</button>
                        <button class="upload-btn" onclick="shareSpecificItemToFacebook()">Share Specific Item</button>
                        <button class="upload-btn" onclick="openMarketplaceIntegration()">Setup Marketplace Integration</button>
                    </div>
                </div>
            `;
            document.body.appendChild(shareModal);
        }

        function shareMarketPaceToFacebook() {
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://marketpace.shop')}&quote=${encodeURIComponent('Join me on MarketPace - discover local commerce, jobs, and community opportunities!')}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
            showNotification('Facebook share opened!', 'success');
        }

        function shareSpecificItemToFacebook() {
            const shareUrl = `https://www.facebook.com/marketplace/create/`;
            window.open(shareUrl, '_blank');
            showNotification('Opening Facebook Marketplace...', 'info');
        }

        function openMarketplaceIntegration() {
            window.location.href = '/facebook-marketplace-integration';
        }

        // Add missing functions for integrated platforms
        function shareMarketPaceIntegration() {
            // Clean Facebook share text without complex SVG paths
            const shareText = 'Join me on MarketPace - discover local commerce, jobs, and community opportunities!';
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://marketpace.shop')}&quote=${encodeURIComponent(shareText)}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
            showNotification('Facebook share opened!', 'success');
        }

        function goToMyProfile() {
            console.log('Going to My Profile...');
            // Check current account mode and navigate to appropriate profile
            const currentAccount = localStorage.getItem('currentAccount') || 'personal';
            
            if (currentAccount === 'business') {
                window.location.href = '/unified-pro-page';
            } else {
                window.location.href = '/profile.html';
            }
        }

        function goToSettings() {
            window.location.href = '/settings';
            document.getElementById('menuDropdown').classList.remove('show');
        }

        function goToDeliveries() {
            window.location.href = '/delivery';
            document.getElementById('menuDropdown').classList.remove('show');
        }

        function goToSponsor() {
            window.location.href = '/sponsorship.html';
            document.getElementById('menuDropdown').classList.remove('show');
        }

        function goToSecurity() {
            window.location.href = '/security';
            document.getElementById('menuDropdown').classList.remove('show');
        }
        
        // Notification preferences
        let notificationPreferences = JSON.parse(localStorage.getItem('notificationPreferences') || '{}');
        
        function toggleNotificationPreference(category) {
            notificationPreferences[category] = !notificationPreferences[category];
            localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));
            
            // Update UI indicator in menu
            if (window.parent && window.parent.updateNotificationIndicator) {
                window.parent.updateNotificationIndicator(category, notificationPreferences[category]);
            }
            
            showNotification(
                `${notificationPreferences[category] ? 'Enabled' : 'Disabled'} notifications for ${category.replace('-', ' & ')}`,
                notificationPreferences[category] ? '#10b981' : '#f59e0b'
            );
        }
        
        // Initialize page - check for category filter from URL parameters
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Community page initialized');
            
            // Check for category parameter in URL
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');
            
            if (categoryParam) {
                console.log('Filtering by category from URL:', categoryParam);
                setTimeout(() => {
                    filterByCategory(categoryParam);
                }, 500); // Small delay to ensure posts are loaded
            }
            
            // Setup notification listeners
            window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'filterCategory') {
                    filterByCategory(event.data.category);
                }
            });
        });

        // Add missing helper functions for comments
        function postComment(buttonElement) {
            const commentSection = buttonElement.closest('.comments-section');
            const commentInput = commentSection.querySelector('.comment-input');
            const commentText = commentInput.value.trim();
            
            if (!commentText) {
                showNotification('Please enter a comment', 'error');
                return;
            }
            
            const commentsList = commentSection.querySelector('.comments-list');
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.innerHTML = `
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin: 5px 0;">
                    <strong style="color: #00ffff;">You</strong>
                    <span style="color: #e2e8f0; font-size: 12px; margin-left: 10px;">just now</span>
                    <p style="color: white; margin: 5px 0;">${commentText}</p>
                    <button onclick="likeComment(this)" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 12px;">Like</button>
                </div>
            `;
            commentsList.appendChild(newComment);
            commentInput.value = '';
            showNotification('Comment posted!', 'success');
        }

        function likeComment(buttonElement) {
            if (buttonElement.style.color === 'rgb(255, 107, 107)') {
                buttonElement.style.color = 'rgba(255, 255, 255, 0.6)';
                buttonElement.textContent = 'Like';
            } else {
                buttonElement.style.color = '#ff6b6b';
                buttonElement.textContent = '❤️ Liked';
            }
        }

        // Helper functions for comment interactions
        function deleteComment(buttonElement) {
            const comment = buttonElement.closest('.comment-item');
            comment.remove();
            showNotification('Comment deleted', 'info');
        }

        function replyToComment(buttonElement) {
            const repliesSection = buttonElement.closest('.comment-item').querySelector('.replies-section');
            if (repliesSection.querySelector('.reply-input')) return; // Already has reply box
            
            const replyBox = document.createElement('div');
            replyBox.innerHTML = `
                <div class="reply-input" style="margin-top: 8px;">
                    <input type="text" placeholder="Write a reply..." style="width: 80%; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 15px; color: white;">
                    <button onclick="submitReply(this)" style="background: #00ffff; border: none; color: white; padding: 6px 12px; border-radius: 12px; cursor: pointer; margin-left: 8px;">Reply</button>
                </div>
            `;
            repliesSection.appendChild(replyBox);
        }

        function submitReply(buttonElement) {
            const replyInput = buttonElement.previousElementSibling;
            const replyText = replyInput.value.trim();
            if (!replyText) return;
            
            const repliesSection = buttonElement.closest('.replies-section');
            const replyElement = document.createElement('div');
            replyElement.innerHTML = `
                <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 8px; margin: 5px 0; border-left: 2px solid #00ffff;">
                    <strong style="color: #00ffff; font-size: 12px;">You</strong>
                    <span style="color: #e2e8f0; font-size: 11px; margin-left: 8px;">just now</span>
                    <p style="color: white; font-size: 13px; margin: 3px 0;">${replyText}</p>
                </div>
            `;
            repliesSection.appendChild(replyElement);
            buttonElement.closest('.reply-input').remove();
            showNotification('Reply posted!', 'success');
        }

        // Add all missing functions for community page
        function messageOwner(sellerName, itemName, itemId) {
            const conversations = JSON.parse(localStorage.getItem('marketpaceConversations') || '{}');
            const conversationId = `${sellerName}-${Date.now()}`;
            
            if (!conversations[conversationId]) {
                conversations[conversationId] = {
                    id: conversationId,
                    participant: sellerName,
                    itemName: itemName,
                    itemId: itemId,
                    messages: [],
                    lastUpdate: new Date().toISOString()
                };
            }
            
            localStorage.setItem('marketpaceConversations', JSON.stringify(conversations));
            showNotification(`Opening conversation with ${sellerName}`, 'success');
            setTimeout(() => {
                window.location.href = '/messages';
            }, 1000);
        }

        function goToPage(page) {
            const pageMap = {
                'home': '/community',
                'community': '/community',
                'shops': '/shops',
                'services': '/services',
                'the-hub': '/the-hub',
                'rentals': '/rentals',
                'menu': '/marketpace-menu',
                '/cart': '/cart',
                '/settings': '/settings'
            };
            
            const targetPage = pageMap[page] || page;
            window.location.href = targetPage;
        }

        function selfPickup(itemName) {
            showNotification(`Self pickup selected for ${itemName}`, 'success');
            // Add self pickup logic here
        }

        // ESSENTIAL FUNCTIONS - CLEAN IMPLEMENTATION
        function openLocalEventCalendar() {
            window.location.href = '/local-event-calendar';
        }

        function showInteractiveMap() {
            window.location.href = '/interactive-map';
        }

        function openAdvancedPostModal(type) {
            var title = prompt('Enter title for your ' + type + ' post:');
            if (title) {
                showNotification(type + ' post "' + title + '" created successfully!', 'success');
            }
        }

        function commentPost(postElement) {
            showNotification('Comment section opened', 'info');
        }

        // SIMPLIFIED REPLY FUNCTIONS 
        function replyToComment(buttonElement) {
            showNotification('Reply function activated', 'info');
        }

        function postReply(buttonElement) {
            showNotification('Reply posted!', 'success');
        }

        // ==================== FACEBOOK FRIEND INVITE SYSTEM ====================
        
        // Facebook friend invite functions
        function shareFacebookPost() {
            const message = `🏘️ Hey friends! I just joined MarketPace - a new community marketplace for our neighborhood! 

✨ Buy, sell, rent items locally
Get delivery from neighbors  
🤝 Support local businesses
Build stronger community connections

Join me at: https://www.marketpace.shop

Let's keep our money circulating locally and support each other! 💪

#MarketPace #LocalCommunity #NeighborToNeighbor`;

            if (navigator.share) {
                navigator.share({
                    title: 'Join me on MarketPace!',
                    text: message,
                    url: 'https://www.marketpace.shop'
                });
            } else {
                // Facebook sharing fallback
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.marketpace.shop')}&quote=${encodeURIComponent(message)}`;
                window.open(facebookUrl, '_blank', 'width=600,height=400');
            }
            
            showNotification('Shared to Facebook successfully!', 'success');
        }

        function sendFacebookMessage() {
            const message = `Hey! I just joined MarketPace - a community marketplace for our neighborhood. You can buy, sell, and rent items locally with delivery! Check it out: https://www.marketpace.shop`;
            
            // Open Facebook Messenger
            const messengerUrl = `https://m.me/?text=${encodeURIComponent(message)}`;
            window.open(messengerUrl, '_blank');
            
            showNotification('Opening Facebook Messenger...', 'success');
        }

        // ==================== ENHANCED CART FUNCTIONALITY ====================
        
        // Enhanced addToCart function with better success messaging
        function addToCartEnhanced(itemName, price, seller, imageUrl) {
            // Get or create cart data
            let cartData = JSON.parse(localStorage.getItem('marketplaceCart')) || { items: [] };
            
            // Check if item already exists in cart
            const existingItem = cartData.items.find(item => item.name === itemName && item.seller === seller);
            
            if (existingItem) {
                showNotification(`${itemName} is already in your cart!`, 'info');
                return;
            }
            
            // Generate item data
            const newItem = {
                id: Date.now(),
                name: itemName,
                seller: seller || "Local Seller",
                price: price || 25.00,
                image: imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
                addedAt: new Date().toISOString()
            };
            
            cartData.items.push(newItem);
            localStorage.setItem('marketplaceCart', JSON.stringify(cartData));
            
            // Show success notification with cart count
            const cartCount = cartData.items.length;
            showNotification(`${itemName} added to cart! (${cartCount} item${cartCount > 1 ? 's' : ''})`, 'success');
            
            // Update cart badge if exists
            updateCartBadge(cartCount);
        }

        // Update cart badge display
        function updateCartBadge(count) {
            const cartBadges = document.querySelectorAll('.cart-badge, .notification-badge');
            cartBadges.forEach(badge => {
                if (count > 0) {
                    badge.textContent = count;
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            });
        }

        // Initialize cart badge on page load
        document.addEventListener('DOMContentLoaded', function() {
            const cartData = JSON.parse(localStorage.getItem('marketplaceCart')) || { items: [] };
            updateCartBadge(cartData.items.length);
        });

        // ==================== SELLER PAYMENT FLOW WITH COMMISSION HANDLING ====================
        
        // Process seller payment with MarketPace commission
        function processSellerPayment(orderId, totalAmount, sellerId) {
            const commission = totalAmount * 0.05; // 5% MarketPace commission
            const sellerPayout = totalAmount - commission;
            const deliveryFeeSplit = 3.00; // $4 pickup + $2 drop, seller pays half
            const protectionFee = 0.50;
            
            // Calculate final seller amount
            const finalSellerAmount = sellerPayout - deliveryFeeSplit - protectionFee;
            
            console.log('Payment Processing:', {
                orderId,
                totalAmount: totalAmount.toFixed(2),
                commission: commission.toFixed(2),
                deliveryFeeSplit: deliveryFeeSplit.toFixed(2),
                protectionFee: protectionFee.toFixed(2),
                finalSellerAmount: finalSellerAmount.toFixed(2)
            });
            
            // Hold payment until buyer accepts item
            const paymentHold = {
                orderId,
                sellerId,
                amount: finalSellerAmount,
                status: 'held', // held, released, disputed
                holdReason: 'awaiting_buyer_acceptance',
                createdAt: new Date().toISOString()
            };
            
            // Store in localStorage (in production, this would be server-side)
            let heldPayments = JSON.parse(localStorage.getItem('heldPayments')) || [];
            heldPayments.push(paymentHold);
            localStorage.setItem('heldPayments', JSON.stringify(heldPayments));
            
            return paymentHold;
        }

        // Release payment when buyer accepts item
        function releaseBuyerAcceptedPayment(orderId) {
            let heldPayments = JSON.parse(localStorage.getItem('heldPayments')) || [];
            const paymentIndex = heldPayments.findIndex(p => p.orderId === orderId);
            
            if (paymentIndex !== -1) {
                heldPayments[paymentIndex].status = 'released';
                heldPayments[paymentIndex].releasedAt = new Date().toISOString();
                localStorage.setItem('heldPayments', JSON.stringify(heldPayments));
                
                showNotification(`Payment of $${heldPayments[paymentIndex].amount.toFixed(2)} released to seller!`, 'success');
                
                // Send notification to seller (in production, this would trigger SMS/email)
                console.log('Seller notification: Payment released for order', orderId);
                
                return true;
            }
            
            return false;
        }

        // Handle return scenarios with $2 drop fee + mileage
        function processReturnPayment(orderId, mileage) {
            const dropFee = 2.00;
            const mileageFee = mileage * 0.50;
            const returnFee = dropFee + mileageFee;
            
            let heldPayments = JSON.parse(localStorage.getItem('heldPayments')) || [];
            const paymentIndex = heldPayments.findIndex(p => p.orderId === orderId);
            
            if (paymentIndex !== -1) {
                const originalAmount = heldPayments[paymentIndex].amount;
                const refundToSeller = originalAmount - returnFee;
                
                heldPayments[paymentIndex].status = 'returned';
                heldPayments[paymentIndex].returnFee = returnFee;
                heldPayments[paymentIndex].sellerRefund = refundToSeller;
                heldPayments[paymentIndex].returnedAt = new Date().toISOString();
                
                localStorage.setItem('heldPayments', JSON.stringify(heldPayments));
                
                console.log('Return processed:', {
                    orderId,
                    originalAmount: originalAmount.toFixed(2),
                    returnFee: returnFee.toFixed(2),
                    sellerRefund: refundToSeller.toFixed(2)
                });
                
                return { returnFee, sellerRefund };
            }
            
            return null;
        }

        // ==================== TIP SYSTEM FOR DRIVERS ====================
        
        // Enhanced tip system
        function addDriverTip(amount, driverId, orderId) {
            const tip = {
                id: Date.now(),
                driverId,
                orderId,
                amount: parseFloat(amount),
                createdAt: new Date().toISOString(),
                status: 'pending' // pending, processed
            };
            
            let driverTips = JSON.parse(localStorage.getItem('driverTips')) || [];
            driverTips.push(tip);
            localStorage.setItem('driverTips', JSON.stringify(driverTips));
            
            showNotification(`$${amount} tip added for driver! 100% goes directly to them.`, 'success');
            
            return tip;
        }

        // Process all tips for a driver
        function processDriverTips(driverId) {
            let driverTips = JSON.parse(localStorage.getItem('driverTips')) || [];
            const pendingTips = driverTips.filter(tip => tip.driverId === driverId && tip.status === 'pending');
            
            const totalTips = pendingTips.reduce((sum, tip) => sum + tip.amount, 0);
            
            // Mark tips as processed
            driverTips = driverTips.map(tip => {
                if (tip.driverId === driverId && tip.status === 'pending') {
                    tip.status = 'processed';
                    tip.processedAt = new Date().toISOString();
                }
                return tip;
            });
            
            localStorage.setItem('driverTips', JSON.stringify(driverTips));
            
            return { totalTips, processedCount: pendingTips.length };
        }

        // ==================== ENHANCED NOTIFICATION SYSTEM ====================
        
        // Send notification to seller when item purchased
        function notifySellerPurchase(itemName, buyerName, orderId, deliveryMethod) {
            const notification = {
                id: Date.now(),
                type: 'purchase',
                sellerId: 'current_seller', // In production, get from item data
                title: '🛒 New Purchase!',
                message: `${buyerName} just bought your "${itemName}"! Order #${orderId}`,
                deliveryInfo: deliveryMethod,
                createdAt: new Date().toISOString(),
                read: false
            };
            
            // Store notification
            let sellerNotifications = JSON.parse(localStorage.getItem('sellerNotifications')) || [];
            sellerNotifications.unshift(notification);
            localStorage.setItem('sellerNotifications', JSON.stringify(sellerNotifications));
            
            // Show success message
            showNotification('Seller has been notified of your purchase!', 'success');
            
            // In production, this would trigger SMS/email to seller
            console.log('Seller notification sent:', notification);
        }



        // Load cart count on page initialization and update comment buttons
        document.addEventListener('DOMContentLoaded', function() {
            const cartData = JSON.parse(localStorage.getItem('marketplaceCart')) || { items: [] };
            updateCartBadge(cartData.items.length);
            
            // Update all comment buttons with new functionality
            document.querySelectorAll('.interaction-btn').forEach(btn => {
                if (btn.textContent.includes('Comment')) {
                    btn.setAttribute('onclick', 'commentPost(this.closest(\'.feed-post\'))');
                }
            });
        });
    </script>
<script>
// Initialize booking system and account switching
document.addEventListener('DOMContentLoaded', function() {
    // Add sold badges to sold items
    setTimeout(checkAndDisplaySoldItems, 1000);
    // Add provider setup buttons
    setTimeout(addProviderSetupButtons, 1000);
    // Initialize profile display
    setTimeout(updateProfileDisplay, 500);
});

function checkAndDisplaySoldItems() {
    const posts = document.querySelectorAll('.feed-post');
    posts.forEach(post => {
        if (post.innerHTML.includes('Vintage Leather Jacket')) {
            addSoldBadge(post);
        }
    });
}

function addSoldBadge(postElement) {
    const postContent = postElement.querySelector('.post-content');
    if (postContent && !postContent.querySelector('.sold-badge')) {
        const soldBadge = document.createElement('div');
        soldBadge.className = 'sold-badge';
        soldBadge.innerHTML = `
            <div style="position: absolute; top: 10px; right: 10px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3); z-index: 10;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="margin-right: 4px; vertical-align: middle;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(255, 255, 255, 0.2)"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2"/>
                </svg>
                SOLD
            </div>
        `;
        postContent.style.position = 'relative';
        postContent.appendChild(soldBadge);
        
        // Disable commerce buttons
        const commerceActions = postContent.querySelectorAll('.commerce-btn');
        commerceActions.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }
}

function addProviderSetupButtons() {
    const servicePosts = document.querySelectorAll('.post-service');
    servicePosts.forEach(post => {
        const commerceActions = post.querySelector('.commerce-actions');
        if (commerceActions && !commerceActions.querySelector('.setup-availability-btn')) {
            const setupBtn = document.createElement('button');
            setupBtn.className = 'commerce-btn setup-availability-btn';
            setupBtn.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
            setupBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(139, 92, 246, 0.2)"/>
                    <path d="M9 9h6v6h-6z" stroke="currentColor" stroke-width="1.5" fill="rgba(139, 92, 246, 0.3)"/>
                    <path d="m9 1 0 4M15 1l0 4M1 9l22 0" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Set Availability
            `;
            setupBtn.onclick = () => setupProviderAvailability('handyman_mike', 'Mike\'s Handyman Service', 'handyman');
            commerceActions.appendChild(setupBtn);
        }
    });
}

// Post promotion functionality
function promotePost(postId) {
    // Create promotion modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a0b3d, #2d1b69); border: 2px solid #ffd700; border-radius: 15px; padding: 30px; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);">
            <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center; font-size: 24px;">✨ Promote Your Post</h3>
            
            <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 10px;">Promotion Options</h4>
                <label style="display: block; margin-bottom: 10px; color: white;">
                    <input type="radio" name="platform" value="marketpace" checked style="margin-right: 8px;">
                    MarketPace Featured (Increase local visibility)
                </label>
                <label style="display: block; margin-bottom: 10px; color: white;">
                    <input type="radio" name="platform" value="facebook" style="margin-right: 8px;">
                    📘 Facebook Marketplace (Cross-post with delivery links)
                </label>
                <label style="display: block; color: white;">
                    <input type="radio" name="platform" value="both" style="margin-right: 8px;">
                    🚀 Both Platforms (Maximum reach)
                </label>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="color: #ffd700; display: block; margin-bottom: 8px;">Promotion Budget:</label>
                <select id="budgetSelect" style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(0, 0, 0, 0.6); color: white; border: 1px solid #ffd700;">
                    <option value="5">$5 - 1 Day Featured</option>
                    <option value="15">$15 - 3 Days Featured</option>
                    <option value="25">$25 - 7 Days Featured</option>
                    <option value="50">$50 - 14 Days Premium</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="color: #ffd700; display: block; margin-bottom: 8px;">⏰ Duration:</label>
                <select id="durationSelect" style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(0, 0, 0, 0.6); color: white; border: 1px solid #ffd700;">
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 25px;">
                <button onclick="startPromotion('${postId}')" style="flex: 1; background: linear-gradient(135deg, #ffd700, #ffed4a); color: #1a1a2e; padding: 12px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    🚀 Start Promotion
                </button>
                <button onclick="closePromotionModal()" style="flex: 1; background: rgba(255, 255, 255, 0.1); color: white; padding: 12px 20px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; cursor: pointer;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.promotionModal = modal;
}

function startPromotion(postId) {
    const platform = document.querySelector('input[name="platform"]:checked').value;
    const budget = document.getElementById('budgetSelect').value;
    const duration = document.getElementById('durationSelect').value;
    
    showNotification(`Post promotion started!\n\nPlatform: ${platform === 'both' ? 'MarketPace + Facebook' : platform}\nBudget: $${budget}\nDuration: ${duration} days\n\nYour post will receive enhanced visibility and reach more local customers.`, 'success');
    
    closePromotionModal();
}

function closePromotionModal() {
    if (window.promotionModal) {
        document.body.removeChild(window.promotionModal);
        window.promotionModal = null;
    }
}

// Duplicate function removed - using main notification system above

// Self-pickup checkout functionality for rental items
function addSelfPickupToRentals() {
    const rentalPosts = document.querySelectorAll('.post-rental');
    
    rentalPosts.forEach(post => {
        const commerceActions = post.querySelector('.commerce-actions');
        if (commerceActions && !commerceActions.querySelector('.self-pickup-btn')) {
            const selfPickupBtn = document.createElement('button');
            selfPickupBtn.className = 'commerce-btn self-pickup-btn';
            selfPickupBtn.style.cssText = `
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                margin-left: 5px;
            `;
            selfPickupBtn.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 4px; vertical-align: middle;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(255, 255, 255, 0.2)"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Self-Pickup
            `;
            
            const itemName = post.querySelector('.post-text').textContent.split(' -')[0].trim();
            const priceElement = post.querySelector('.price-tag');
            const basePrice = priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) : 25.00;
            
            selfPickupBtn.onclick = () => startSelfPickupFlow(itemName, basePrice);
            commerceActions.appendChild(selfPickupBtn);
        }
    });
}

function startSelfPickupFlow(itemName, basePrice) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h3 style="color: #10b981; margin-bottom: 20px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 8px; vertical-align: middle;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(16, 185, 129, 0.2)"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Self-Pickup Rental: ${itemName}
            </h3>
            
            <div style="background: rgba(16, 185, 129, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <h4 style="color: #10b981; margin-bottom: 10px;">Eco-Friendly Choice!</h4>
                <p style="margin: 0; font-size: 14px;">By choosing self-pickup, you're reducing carbon emissions and supporting sustainable commerce.</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="color: #00ffff; display: block; margin-bottom: 10px;">Rental Duration:</label>
                <select id="rentalHours" style="background: rgba(0, 0, 0, 0.3); color: white; border: 1px solid rgba(0, 255, 255, 0.3); padding: 10px; border-radius: 5px; width: 100%;">
                    <option value="4">4 hours - $${(basePrice * 0.5).toFixed(2)}</option>
                    <option value="8">8 hours - $${(basePrice * 0.75).toFixed(2)}</option>
                    <option value="24" selected>Full day (24h) - $${basePrice.toFixed(2)}</option>
                    <option value="48">2 days - $${(basePrice * 1.8).toFixed(2)}</option>
                    <option value="72">3 days - $${(basePrice * 2.5).toFixed(2)}</option>
                </select>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="color: #00ffff; margin-bottom: 10px;">Pricing Breakdown:</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Rental Cost:</span>
                    <span id="displayRentalCost">$${basePrice.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Delivery:</span>
                    <span style="color: #10b981;">FREE (Self-Pickup)</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Platform Sustainability Fee (5%):</span>
                    <span id="displaySustainabilityFee">$${(basePrice * 0.05).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Stripe Processing Fee:</span>
                    <span id="displayStripeFee">$${((basePrice * 1.05) * 0.029 + 0.30).toFixed(2)}</span>
                </div>
                <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.2); margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; color: #00ffff;">
                    <span>Total You Pay:</span>
                    <span id="displayTotal">$${(basePrice * 1.05 + (basePrice * 1.05) * 0.029 + 0.30).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,255,255,0.3); color: #10b981;">
                    <span><strong>Owner Receives:</strong></span>
                    <span id="displayOwnerNet"><strong>$${(basePrice * 0.95).toFixed(2)}</strong></span>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="closeSelfPickupModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer;">Cancel</button>
                <button onclick="proceedToSelfPickupCheckout('${itemName}', ${basePrice})" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer;">Proceed to Checkout</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Update pricing when duration changes
    document.getElementById('rentalHours').addEventListener('change', function() {
        updateSelfPickupPricing(basePrice);
    });
}

function updateSelfPickupPricing(basePrice) {
    const hours = parseInt(document.getElementById('rentalHours').value);
    let rentalCost = basePrice;
    
    if (hours === 4) rentalCost = basePrice * 0.5;
    else if (hours === 8) rentalCost = basePrice * 0.75;
    else if (hours === 48) rentalCost = basePrice * 1.8;
    else if (hours === 72) rentalCost = basePrice * 2.5;
    
    const sustainabilityFee = rentalCost * 0.05;
    const subtotal = rentalCost + sustainabilityFee;
    const stripeFee = (subtotal * 0.029) + 0.30;
    const total = subtotal + stripeFee;
    const ownerNet = rentalCost - sustainabilityFee;
    
    document.getElementById('displayRentalCost').textContent = `$${rentalCost.toFixed(2)}`;
    document.getElementById('displaySustainabilityFee').textContent = `$${sustainabilityFee.toFixed(2)}`;
    document.getElementById('displayStripeFee').textContent = `$${stripeFee.toFixed(2)}`;
    document.getElementById('displayTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('displayOwnerNet').textContent = `$${ownerNet.toFixed(2)}`;
}

function proceedToSelfPickupCheckout(itemName, basePrice) {
    const hours = parseInt(document.getElementById('rentalHours').value);
    let rentalCost = basePrice;
    
    if (hours === 4) rentalCost = basePrice * 0.5;
    else if (hours === 8) rentalCost = basePrice * 0.75;
    else if (hours === 48) rentalCost = basePrice * 1.8;
    else if (hours === 72) rentalCost = basePrice * 2.5;
    
    const sustainabilityFee = rentalCost * 0.05;
    const subtotal = rentalCost + sustainabilityFee;
    const stripeFee = (subtotal * 0.029) + 0.30;
    const totalCost = subtotal + stripeFee;
    const ownerNet = rentalCost - sustainabilityFee;
    
    // Store checkout data
    localStorage.setItem('selfPickupCheckout', JSON.stringify({
        itemName: itemName,
        basePrice: rentalCost,
        hours: hours,
        sustainabilityFee: sustainabilityFee,
        stripeFee: stripeFee,
        totalCost: totalCost,
        ownerNet: ownerNet,
        checkoutType: 'self-pickup'
    }));
    
    // Navigate to checkout page
    window.location.href = '/self-pickup-checkout.html';
}

function closeSelfPickupModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Initialize self-pickup functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addSelfPickupToRentals, 1000); // Add self-pickup buttons after page loads
    
    // Initialize account switcher
    initializeAccountSwitcher();
});

// Account Switcher Functions
let currentAccount = localStorage.getItem('currentAccount') || 'personal';
let userAccounts = JSON.parse(localStorage.getItem('userAccounts') || '{"personal": {"name": "Personal Account", "type": "individual"}, "business": null}');

function initializeAccountSwitcher() {
    updateAccountSwitcher();
    updatePageMode();
}

function toggleAccountSwitcher() {
    const modal = document.getElementById('accountSwitcherModal');
    if (modal.style.display === 'none') {
        modal.style.display = 'flex';
        updateAccountSwitcher();
    } else {
        modal.style.display = 'none';
    }
}

function toggleAccountSwitcher() {
    const modal = document.getElementById('accountSwitcherModal');
    if (modal.style.display === 'none') {
        modal.style.display = 'flex';
        updateAccountSwitcher();
    } else {
        modal.style.display = 'none';
    }
}

function closeAccountSwitcher() {
    document.getElementById('accountSwitcherModal').style.display = 'none';
}

function updateAccountSwitcher() {
    const businessAccount = document.getElementById('businessAccount');
    const createBusinessBtn = document.getElementById('createBusinessBtn');
    const accountSwitcherBtn = document.getElementById('accountSwitcherBtn');
    
    if (userAccounts.business) {
        businessAccount.style.display = 'flex';
        createBusinessBtn.style.display = 'none';
        document.getElementById('businessAccountName').textContent = userAccounts.business.name;
    } else {
        businessAccount.style.display = 'none';
        createBusinessBtn.style.display = 'block';
    }
    
    // Update active state
    document.querySelectorAll('.account-option').forEach(option => {
        option.classList.remove('active');
    });
    
    if (currentAccount === 'personal') {
        document.getElementById('personalAccount').classList.add('active');
        // Icon-only button, no text to update
    } else if (currentAccount === 'business') {
        document.getElementById('businessAccount').classList.add('active');
        // Icon-only button, no text to update
    }
}

function updatePageMode() {
    document.body.classList.remove('personal-mode', 'business-mode');
    
    if (currentAccount === 'business') {
        document.body.classList.add('business-mode');
    } else {
        document.body.classList.add('personal-mode');
    }
}

function switchToPersonal() {
    currentAccount = 'personal';
    localStorage.setItem('currentAccount', 'personal');
    updateAccountSwitcher();
    updatePageMode();
    updateProfileDisplay();
    closeAccountSwitcher();
    
    alert('Switched to Personal Account\n\nYou are now using your individual profile for personal posts and purchases.');
}

function switchToBusiness() {
    if (!userAccounts.business) {
        alert('No business account found. Please create one first.');
        return;
    }
    
    currentAccount = 'business';
    localStorage.setItem('currentAccount', 'business');
    updateAccountSwitcher();
    updatePageMode();
    updateProfileDisplay();
    closeAccountSwitcher();
    
    alert('Switched to Business Account - MarketPace Pro features activated!\n\nYou now have access to employee scheduling, integrations, and business tools.');
}

function createBusinessAccount() {
    window.location.href = '/pro-account-manager.html';
}

// Update profile display based on current account
function updateProfileDisplay() {
    const profileButton = document.querySelector('.profile-pic, .header img[alt*="Profile"]');
    const profileName = document.querySelector('.profile-name, .header .name');
    
    if (currentAccount === 'business' && userAccounts.business) {
        // Update to business profile
        if (profileButton) {
            profileButton.src = userAccounts.business.avatar || 'marketpace-logo-1.jpeg';
            profileButton.alt = 'Business Profile';
        }
        if (profileName) {
            profileName.textContent = userAccounts.business.name;
        }
        
        // Add business indicator to posts
        document.body.classList.add('business-mode');
        
        // Show promote buttons for business accounts
        document.querySelectorAll('.business-only.promote-btn').forEach(btn => {
            btn.style.display = 'inline-block';
        });
    } else {
        // Update to personal profile
        if (profileButton) {
            profileButton.src = userAccounts.personal?.avatar || 'marketpace-logo-1.jpeg';
            profileButton.alt = 'Personal Profile';
        }
        if (profileName) {
            profileName.textContent = userAccounts.personal?.name || 'Personal Account';
        }
        
        // Remove business mode
        document.body.classList.remove('business-mode');
        
        // Hide promote buttons for personal accounts
        document.querySelectorAll('.business-only.promote-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

// Enhanced profile navigation
function goToProfile() {
    // Check current account mode and navigate to appropriate profile
    const currentAccount = localStorage.getItem('currentAccount') || 'personal';
    
    if (currentAccount === 'business') {
        window.location.href = '/unified-pro-page';
    } else {
        window.location.href = '/profile.html';
    }
}

// Enhanced posting with promotion options
function createNewPost() {
    if (currentAccount === 'business') {
        window.location.href = '/business-post-creator.html';
    } else {
        openAdvancedPostModal();
    }
}

// Post promotion functionality (Facebook-style)
function promotePost(postId) {
    if (currentAccount !== 'business') {
        alert('Post promotion is only available for business accounts. Upgrade to MarketPace Pro to access this feature.');
        return;
    }
    
    showPromotionModal(postId);
}

function showPromotionModal(postId) {
    const modal = document.createElement('div');
    modal.className = 'promotion-modal-overlay';
    modal.innerHTML = `
        <div class="promotion-modal">
            <div class="promotion-header">
                <h3>Promote Post</h3>
                <button onclick="closePromotionModal()" class="close-btn">&times;</button>
            </div>
            
            <div class="promotion-options">
                <h4>Choose Budget & Duration</h4>
                
                <div class="budget-section">
                    <label>Daily Budget:</label>
                    <select id="dailyBudget">
                        <option value="5">$5/day</option>
                        <option value="10">$10/day</option>
                        <option value="20">$20/day</option>
                        <option value="50">$50/day</option>
                        <option value="100">$100/day</option>
                    </select>
                </div>
                
                <div class="duration-section">
                    <label>Duration:</label>
                    <select id="duration">
                        <option value="1">1 day</option>
                        <option value="3">3 days</option>
                        <option value="7">1 week</option>
                        <option value="14">2 weeks</option>
                        <option value="30">1 month</option>
                    </select>
                </div>
                
                <div class="platform-section">
                    <label>Promote On:</label>
                    <div class="platform-options">
                        <label><input type="checkbox" value="marketpace" checked> MarketPace</label>
                        <label><input type="checkbox" value="facebook"> Facebook</label>
                        <label><input type="checkbox" value="both"> Both Platforms</label>
                    </div>
                </div>
                
                <div class="total-cost">
                    <strong>Total Cost: $<span id="totalCost">5</span></strong>
                </div>
                
                <div class="promotion-actions">
                    <button onclick="startPromotion('${postId}')" class="promote-btn">Start Promotion</button>
                    <button onclick="closePromotionModal()" class="cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Calculate total cost when options change
    const budgetSelect = document.getElementById('dailyBudget');
    const durationSelect = document.getElementById('duration');
    const totalCostSpan = document.getElementById('totalCost');
    
    function updateTotalCost() {
        const daily = parseInt(budgetSelect.value);
        const days = parseInt(durationSelect.value);
        totalCostSpan.textContent = daily * days;
    }
    
    budgetSelect.addEventListener('change', updateTotalCost);
    durationSelect.addEventListener('change', updateTotalCost);
}

function closePromotionModal() {
    const modal = document.querySelector('.promotion-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function startPromotion(postId) {
    const budget = document.getElementById('dailyBudget').value;
    const duration = document.getElementById('duration').value;
    const platforms = Array.from(document.querySelectorAll('.platform-options input:checked')).map(cb => cb.value);
    
    const totalCost = parseInt(budget) * parseInt(duration);
    
    alert(`Promotion Started!\n\nPost ID: ${postId}\nDaily Budget: $${budget}\nDuration: ${duration} days\nPlatforms: ${platforms.join(', ')}\nTotal Cost: $${totalCost}\n\nYour post will be promoted across the selected platforms.`);
    
    closePromotionModal();
}

// Tip Modal Functions
function openTipModal(businessName, businessId) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'tip-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(10px);
    `;
    
    modalOverlay.innerHTML = `
        <div class="tip-modal" style="
            background: linear-gradient(135deg, #1a0b3d 0%, #2d1b69 50%, #4c2885 100%);
            border: 2px solid rgba(255, 215, 0, 0.5); border-radius: 20px; padding: 30px;
            max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;
            position: relative; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        ">
            <button class="close-btn" onclick="closeTipModal()" style="
                position: absolute; top: 15px; right: 15px; background: none; border: none;
                color: #FFD700; font-size: 1.5rem; cursor: pointer; padding: 5px;
                border-radius: 50%; transition: all 0.3s ease;
            ">&times;</button>
            
            <h2 style="
                color: #FFD700; text-align: center; margin-bottom: 20px; font-size: 1.8rem;
                background: linear-gradient(135deg, #FFD700, #FFA500); background-clip: text;
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            ">Tip ${businessName}</h2>
            
            <div class="business-info" style="
                text-align: center; margin-bottom: 25px; padding: 15px;
                background: rgba(255, 255, 255, 0.1); border-radius: 12px; backdrop-filter: blur(10px);
            ">
                <div style="color: #FFD700; font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">${businessName}</div>
                <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">Show appreciation with a tip</div>
            </div>
            
            <div class="tip-amounts" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                <button class="tip-amount-btn" onclick="selectTipAmount(5)" data-amount="5" style="
                    background: rgba(255, 215, 0, 0.1); border: 2px solid rgba(255, 215, 0, 0.3);
                    color: #FFD700; padding: 15px; border-radius: 12px; cursor: pointer;
                    transition: all 0.3s ease; font-weight: bold;
                ">$5</button>
                <button class="tip-amount-btn" onclick="selectTipAmount(10)" data-amount="10" style="
                    background: rgba(255, 215, 0, 0.1); border: 2px solid rgba(255, 215, 0, 0.3);
                    color: #FFD700; padding: 15px; border-radius: 12px; cursor: pointer;
                    transition: all 0.3s ease; font-weight: bold;
                ">$10</button>
                <button class="tip-amount-btn" onclick="selectTipAmount(20)" data-amount="20" style="
                    background: rgba(255, 215, 0, 0.1); border: 2px solid rgba(255, 215, 0, 0.3);
                    color: #FFD700; padding: 15px; border-radius: 12px; cursor: pointer;
                    transition: all 0.3s ease; font-weight: bold;
                ">$20</button>
                <button class="tip-amount-btn" onclick="selectTipAmount(50)" data-amount="50" style="
                    background: rgba(255, 215, 0, 0.1); border: 2px solid rgba(255, 215, 0, 0.3);
                    color: #FFD700; padding: 15px; border-radius: 12px; cursor: pointer;
                    transition: all 0.3s ease; font-weight: bold;
                ">$50</button>
                <button class="tip-amount-btn" onclick="selectTipAmount(100)" data-amount="100" style="
                    background: rgba(255, 215, 0, 0.1); border: 2px solid rgba(255, 215, 0, 0.3);
                    color: #FFD700; padding: 15px; border-radius: 12px; cursor: pointer;
                    transition: all 0.3s ease; font-weight: bold;
                ">$100</button>
                <button class="tip-amount-btn" onclick="showCustomAmount()" style="
                    background: rgba(0, 255, 255, 0.1); border: 2px solid rgba(0, 255, 255, 0.3);
                    color: #00ffff; padding: 15px; border-radius: 12px; cursor: pointer;
                    transition: all 0.3s ease; font-weight: bold;
                ">Custom</button>
            </div>
            
            <div id="customAmountInput" style="display: none; margin-bottom: 20px;">
                <input type="number" id="customTipAmount" placeholder="Enter custom amount" min="1" max="500" style="
                    width: 100%; padding: 15px; border: 2px solid rgba(255, 215, 0, 0.3);
                    border-radius: 12px; background: rgba(255, 255, 255, 0.1);
                    color: white; font-size: 1rem; text-align: center;
                ">
            </div>
            
            <div class="tip-message" style="margin-bottom: 20px;">
                <textarea id="tipMessage" placeholder="Add a message (optional)" style="
                    width: 100%; height: 80px; padding: 15px; border: 2px solid rgba(255, 215, 0, 0.3);
                    border-radius: 12px; background: rgba(255, 255, 255, 0.1);
                    color: white; font-size: 0.9rem; resize: vertical;
                "></textarea>
            </div>
            
            <div class="tip-actions" style="display: flex; gap: 15px;">
                <button onclick="processTip('${businessName}', '${businessId}')" id="sendTipBtn" style="
                    flex: 1; background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a0b3d;
                    border: none; padding: 15px; border-radius: 12px; font-weight: bold;
                    cursor: pointer; font-size: 1rem; transition: all 0.3s ease;
                " disabled>Send Tip</button>
                <button onclick="closeTipModal()" style="
                    background: rgba(255, 255, 255, 0.1); color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3); padding: 15px 20px;
                    border-radius: 12px; cursor: pointer; font-weight: bold;
                ">Cancel</button>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.appendChild(modalOverlay);
    
    // Click outside to close
    modalOverlay.onclick = function(e) {
        if (e.target === modalOverlay) {
            closeTipModal();
        }
    };
}

function selectTipAmount(amount) {
    // Clear custom input
    document.getElementById('customAmountInput').style.display = 'none';
    document.getElementById('customTipAmount').value = '';
    
    // Update button styling
    document.querySelectorAll('.tip-amount-btn').forEach(btn => {
        btn.style.background = 'rgba(255, 215, 0, 0.1)';
        btn.style.borderColor = 'rgba(255, 215, 0, 0.3)';
    });
    
    // Highlight selected button
    const selectedBtn = document.querySelector(`[data-amount="${amount}"]`);
    if (selectedBtn) {
        selectedBtn.style.background = 'rgba(255, 215, 0, 0.3)';
        selectedBtn.style.borderColor = '#FFD700';
    }
    
    // Enable send button
    const sendBtn = document.getElementById('sendTipBtn');
    sendBtn.disabled = false;
    sendBtn.setAttribute('data-amount', amount);
}

function showCustomAmount() {
    // Clear preset selections
    document.querySelectorAll('.tip-amount-btn').forEach(btn => {
        btn.style.background = 'rgba(255, 215, 0, 0.1)';
        btn.style.borderColor = 'rgba(255, 215, 0, 0.3)';
    });
    
    // Show custom input
    document.getElementById('customAmountInput').style.display = 'block';
    document.getElementById('customTipAmount').focus();
    
    // Monitor custom input
    const customInput = document.getElementById('customTipAmount');
    customInput.oninput = function() {
        const amount = parseFloat(this.value);
        const sendBtn = document.getElementById('sendTipBtn');
        
        if (amount && amount >= 1 && amount <= 500) {
            sendBtn.disabled = false;
            sendBtn.setAttribute('data-amount', amount);
        } else {
            sendBtn.disabled = true;
            sendBtn.removeAttribute('data-amount');
        }
    };
}

function processTip(businessName, businessId) {
    const amount = document.getElementById('sendTipBtn').getAttribute('data-amount');
    const message = document.getElementById('tipMessage').value;
    
    if (!amount) {
        alert('Please select a tip amount');
        return;
    }
    
    // Show processing state
    const sendBtn = document.getElementById('sendTipBtn');
    sendBtn.textContent = 'Processing...';
    sendBtn.disabled = true;
    
    // Create tip data
    const tipData = {
        businessName: businessName,
        businessId: businessId,
        amount: parseFloat(amount),
        message: message,
        timestamp: new Date().toISOString()
    };
    
    // Call tip processing API
    fetch('/api/tips/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            alert(`Tip sent successfully!\n\n$${amount} tip sent to ${businessName}\n\nThank you for supporting local businesses!`);
            closeTipModal();
        } else {
            throw new Error(data.error || 'Failed to process tip');
        }
    })
    .catch(error => {
        console.error('Tip processing error:', error);
        alert('Failed to process tip. Please try again.');
        sendBtn.textContent = 'Send Tip';
        sendBtn.disabled = false;
    });
}

function closeTipModal() {
    const modal = document.querySelector('.tip-modal-overlay');
    if (modal) {
        modal.remove();
    }
}
</script>
