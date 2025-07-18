// Customer Booking Interface for Services and Rentals
// Customer booking functionality for services and entertainers

function bookService(providerId, providerName, serviceType) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h3 style="color: #00ffff; margin-bottom: 20px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 255, 255, 0.2)"/>
                    <path d="M9 9h6v6h-6z" stroke="currentColor" stroke-width="1.5" fill="rgba(139, 92, 246, 0.3)"/>
                    <path d="m9 1 0 4M15 1l0 4M1 9l22 0" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Book ${providerName}
            </h3>
            
            <div style="background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 255, 0.3);">
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="color: #00ffff; display: block; margin-bottom: 5px;">Select Date:</label>
                        <input type="date" id="bookingDate" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 10px; color: white; width: 100%;" min="${new Date().toISOString().split('T')[0]}" onchange="loadAvailableTimes('${providerId}')">
                    </div>
                    
                    <div>
                        <label style="color: #00ffff; display: block; margin-bottom: 5px;">Available Times:</label>
                        <div id="availableTimesContainer" style="color: #e2e8f0; padding: 20px; text-align: center; font-style: italic;">
                            Please select a date to see available times
                        </div>
                    </div>
                    
                    <div>
                        <label style="color: #00ffff; display: block; margin-bottom: 5px;">Your Name:</label>
                        <input type="text" id="customerName" placeholder="Enter your name" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 10px; color: white; width: 100%;">
                    </div>
                    
                    <div>
                        <label style="color: #00ffff; display: block; margin-bottom: 5px;">Service Details:</label>
                        <textarea id="serviceDetails" placeholder="Describe what you need..." style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 10px; color: white; width: 100%; height: 80px; resize: vertical;"></textarea>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="confirmServiceBooking('${providerId}', '${providerName}', '${serviceType}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Confirm Booking</button>
                <button onclick="closeBookingModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function loadAvailableTimes(providerId) {
    const date = document.getElementById('bookingDate').value;
    const container = document.getElementById('availableTimesContainer');
    
    if (!date) {
        container.innerHTML = 'Please select a date to see available times';
        return;
    }
    
    const availableTimes = window.bookingSystem.getAvailableTimes(providerId, date);
    
    if (availableTimes.length === 0) {
        container.innerHTML = `
            <div style="color: #ef4444; padding: 20px; text-align: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-bottom: 10px;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(239, 68, 68, 0.2)"/>
                    <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <p>No available times for this date. Please choose another date.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
            ${availableTimes.map(time => `
                <button class="time-slot-btn" data-time="${time}" onclick="selectTimeSlot(this)">
                    ${time}
                </button>
            `).join('')}
        </div>
    `;
}

function selectTimeSlot(button) {
    // Remove selection from all time slots
    document.querySelectorAll('.time-slot-btn').forEach(btn => btn.classList.remove('selected'));
    // Select this time slot
    button.classList.add('selected');
}

function confirmServiceBooking(providerId, providerName, serviceType) {
    const date = document.getElementById('bookingDate').value;
    const selectedTimeBtn = document.querySelector('.time-slot-btn.selected');
    const customerName = document.getElementById('customerName').value;
    const serviceDetails = document.getElementById('serviceDetails').value;
    
    if (!date || !selectedTimeBtn || !customerName || !serviceDetails) {
        alert('Please fill in all fields and select a time slot');
        return;
    }
    
    const time = selectedTimeBtn.dataset.time;
    const bookingId = window.bookingSystem.bookTimeSlot(providerId, customerName, date, time, serviceDetails);
    
    closeBookingModal();
    
    // Show confirmation
    showBookingConfirmation(bookingId, providerName, date, time, serviceDetails);
}

function showBookingConfirmation(bookingId, providerName, date, time, serviceDetails) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h3 style="color: #10b981; margin-bottom: 20px; text-align: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(16, 185, 129, 0.2)"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2"/>
                </svg>
                Booking Confirmed!
            </h3>
            
            <div style="background: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <p style="color: #e2e8f0; margin-bottom: 10px;"><strong style="color: #10b981;">Booking ID:</strong> ${bookingId}</p>
                <p style="color: #e2e8f0; margin-bottom: 10px;"><strong style="color: #10b981;">Provider:</strong> ${providerName}</p>
                <p style="color: #e2e8f0; margin-bottom: 10px;"><strong style="color: #10b981;">Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p style="color: #e2e8f0; margin-bottom: 10px;"><strong style="color: #10b981;">Time:</strong> ${time}</p>
                <p style="color: #e2e8f0; margin-bottom: 0;"><strong style="color: #10b981;">Service:</strong> ${serviceDetails}</p>
            </div>
            
            <div style="background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(59, 130, 246, 0.3);">
                <p style="color: #3b82f6; margin: 0; font-size: 14px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px; vertical-align: middle;">
                        <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.2)"/>
                        <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                    The service provider has been notified. They will contact you to confirm details and pricing.
                </p>
            </div>
            
            <div style="text-align: center;">
                <button onclick="closeBookingModal()" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeBookingModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) document.body.removeChild(modal);
}

// Rental booking with conflict checking
function bookRental(itemId, itemName, ownerName, dailyRate) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h3 style="color: #00ffff; margin-bottom: 20px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 255, 255, 0.2)"/>
                    <path d="M9 9h6v6h-6z" stroke="currentColor" stroke-width="1.5" fill="rgba(139, 92, 246, 0.3)"/>
                    <path d="m9 1 0 4M15 1l0 4M1 9l22 0" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Rent ${itemName}
            </h3>
            
            <div style="background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 255, 0.3);">
                <div style="display: grid; gap: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="color: #00ffff; display: block; margin-bottom: 5px;">Start Date:</label>
                            <input type="date" id="rentalStartDate" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 10px; color: white; width: 100%;" min="${new Date().toISOString().split('T')[0]}" onchange="updateRentalAvailability('${itemId}')">
                        </div>
                        <div>
                            <label style="color: #00ffff; display: block; margin-bottom: 5px;">End Date:</label>
                            <input type="date" id="rentalEndDate" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 10px; color: white; width: 100%;" min="${new Date().toISOString().split('T')[0]}" onchange="updateRentalAvailability('${itemId}')">
                        </div>
                    </div>
                    
                    <div>
                        <label style="color: #00ffff; display: block; margin-bottom: 5px;">Time Slot:</label>
                        <select id="rentalTimeSlot" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 10px; color: white; width: 100%;" onchange="updateRentalAvailability('${itemId}')">
                            <option value="morning">Morning (9am-12pm pickup, 6pm-9pm return)</option>
                            <option value="afternoon">Afternoon (12pm-3pm pickup, 6pm-9pm return)</option>
                            <option value="evening">Evening (3pm-6pm pickup, 6pm-9pm return)</option>
                            <option value="fullday">Full Day (9am pickup, 9pm return)</option>
                        </select>
                    </div>
                    
                    <div id="availabilityCheck" style="color: #e2e8f0; padding: 15px; text-align: center; font-style: italic;">
                        Please select dates to check availability
                    </div>
                    
                    <div>
                        <label style="color: #00ffff; display: block; margin-bottom: 5px;">Your Name:</label>
                        <input type="text" id="renterName" placeholder="Enter your name" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 10px; color: white; width: 100%;">
                    </div>
                </div>
                
                <div id="rentalPricingInfo" style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid rgba(139, 92, 246, 0.3);">
                    <h4 style="color: #8b5cf6; margin: 0 0 10px 0;">Pricing Breakdown:</h4>
                    <div id="pricingDetails" style="color: #e2e8f0;">Select dates to see pricing</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirmRentalBtn" onclick="confirmRentalBooking('${itemId}', '${itemName}', '${ownerName}', ${dailyRate})" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;" disabled>Confirm Rental</button>
                <button onclick="closeBookingModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function updateRentalAvailability(itemId) {
    const startDate = document.getElementById('rentalStartDate').value;
    const endDate = document.getElementById('rentalEndDate').value;
    const timeSlot = document.getElementById('rentalTimeSlot').value;
    const availabilityDiv = document.getElementById('availabilityCheck');
    const pricingDiv = document.getElementById('pricingDetails');
    const confirmBtn = document.getElementById('confirmRentalBtn');
    
    if (!startDate || !endDate) {
        availabilityDiv.innerHTML = 'Please select both start and end dates';
        confirmBtn.disabled = true;
        return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
        availabilityDiv.innerHTML = '<span style="color: #ef4444;">End date must be after start date</span>';
        confirmBtn.disabled = true;
        return;
    }
    
    // Check availability for each date in the range
    const dates = getDateRange(startDate, endDate);
    const unavailableDates = dates.filter(date => 
        !window.bookingSystem.isRentalDateAvailable(itemId, date, timeSlot)
    );
    
    if (unavailableDates.length > 0) {
        availabilityDiv.innerHTML = `
            <div style="color: #ef4444;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(239, 68, 68, 0.2)"/>
                    <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Not available: ${unavailableDates.map(d => new Date(d).toLocaleDateString()).join(', ')}
            </div>
        `;
        confirmBtn.disabled = true;
    } else {
        availabilityDiv.innerHTML = `
            <div style="color: #10b981;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(16, 185, 129, 0.2)"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2"/>
                </svg>
                Available for all selected dates!
            </div>
        `;
        confirmBtn.disabled = false;
    }
    
    // Update pricing
    const days = dates.length;
    const dailyRate = parseFloat(document.getElementById('confirmRentalBtn').onclick.toString().match(/\d+\.?\d*/)[0]);
    const subtotal = days * dailyRate;
    const platformFee = subtotal * 0.05;
    const deliveryFee = 61; // Standard MarketPace delivery
    const total = subtotal + deliveryFee;
    
    pricingDiv.innerHTML = `
        <div style="display: grid; gap: 5px;">
            <div style="display: flex; justify-content: space-between;">
                <span>Rental (${days} days × $${dailyRate}):</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Delivery Fee:</span>
                <span>$${deliveryFee.toFixed(2)}</span>
            </div>
            <hr style="border: 1px solid rgba(139, 92, 246, 0.3); margin: 5px 0;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; color: #8b5cf6;">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 5px;">
                *Owner receives $${(subtotal - platformFee).toFixed(2)} (5% platform fee deducted)
            </div>
        </div>
    `;
}

function getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    while (currentDate <= lastDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

function confirmRentalBooking(itemId, itemName, ownerName, dailyRate) {
    const startDate = document.getElementById('rentalStartDate').value;
    const endDate = document.getElementById('rentalEndDate').value;
    const timeSlot = document.getElementById('rentalTimeSlot').value;
    const renterName = document.getElementById('renterName').value;
    
    if (!startDate || !endDate || !renterName) {
        alert('Please fill in all required fields');
        return;
    }
    
    const rentalId = window.bookingSystem.bookRental(itemId, itemName, renterName, startDate, endDate, timeSlot);
    
    closeBookingModal();
    
    // Show confirmation
    showRentalConfirmation(rentalId, itemName, ownerName, startDate, endDate, timeSlot);
}

function showRentalConfirmation(rentalId, itemName, ownerName, startDate, endDate, timeSlot) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h3 style="color: #10b981; margin-bottom: 20px; text-align: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(16, 185, 129, 0.2)"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2"/>
                </svg>
                Rental Confirmed!
            </h3>
            
            <div style="background: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <p style="color: #e2e8f0; margin-bottom: 10px;"><strong style="color: #10b981;">Rental ID:</strong> ${rentalId}</p>
                <p style="color: #e2e8f0; margin-bottom: 10px;"><strong style="color: #10b981;">Item:</strong> ${itemName}</p>
                <p style="color: #e2e8f0; margin-bottom: 10px;"><strong style="color: #10b981;">Owner:</strong> ${ownerName}</p>
                <p style="color: #e2e8f0; margin-bottom: 10px;"><strong style="color: #10b981;">Dates:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
                <p style="color: #e2e8f0; margin-bottom: 0;"><strong style="color: #10b981;">Time Slot:</strong> ${timeSlot}</p>
            </div>
            
            <div style="background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(59, 130, 246, 0.3);">
                <p style="color: #3b82f6; margin: 0; font-size: 14px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px; vertical-align: middle;">
                        <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(59, 130, 246, 0.2)"/>
                        <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                    These dates are now blocked for other renters. The owner will arrange pickup and dropoff details.
                </p>
            </div>
            
            <div style="text-align: center;">
                <button onclick="closeBookingModal()" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}