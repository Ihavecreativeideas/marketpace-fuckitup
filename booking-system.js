// MarketPace Booking System for Services and Entertainers
class BookingSystem {
    constructor() {
        this.availableSlots = JSON.parse(localStorage.getItem('marketpace_available_slots') || '{}');
        this.bookedSlots = JSON.parse(localStorage.getItem('marketpace_booked_slots') || '{}');
        this.soldItems = JSON.parse(localStorage.getItem('marketpace_sold_items') || '[]');
        this.rentalBookings = JSON.parse(localStorage.getItem('marketpace_rental_bookings') || '{}');
    }

    // Service Provider Sets Available Times
    setAvailability(providerId, providerName, serviceType, dates) {
        if (!this.availableSlots[providerId]) {
            this.availableSlots[providerId] = {
                name: providerName,
                type: serviceType,
                slots: {}
            };
        }
        
        dates.forEach(dateSlot => {
            const dateKey = dateSlot.date;
            if (!this.availableSlots[providerId].slots[dateKey]) {
                this.availableSlots[providerId].slots[dateKey] = [];
            }
            this.availableSlots[providerId].slots[dateKey] = dateSlot.times;
        });
        
        this.saveAvailability();
        return true;
    }

    // Get Available Times for a Provider
    getAvailableTimes(providerId, date) {
        if (!this.availableSlots[providerId] || !this.availableSlots[providerId].slots[date]) {
            return [];
        }
        
        const availableTimes = this.availableSlots[providerId].slots[date];
        const bookedTimes = this.getBookedTimes(providerId, date);
        
        return availableTimes.filter(time => !bookedTimes.includes(time));
    }

    // Book a Time Slot
    bookTimeSlot(providerId, customerName, date, time, serviceDetails) {
        const bookingId = 'booking_' + Date.now();
        
        if (!this.bookedSlots[providerId]) {
            this.bookedSlots[providerId] = {};
        }
        
        if (!this.bookedSlots[providerId][date]) {
            this.bookedSlots[providerId][date] = [];
        }
        
        const booking = {
            id: bookingId,
            customer: customerName,
            time: time,
            service: serviceDetails,
            status: 'confirmed',
            bookedAt: new Date().toISOString()
        };
        
        this.bookedSlots[providerId][date].push(booking);
        this.saveBookings();
        
        return bookingId;
    }

    // Get Booked Times for a Provider on a Date
    getBookedTimes(providerId, date) {
        if (!this.bookedSlots[providerId] || !this.bookedSlots[providerId][date]) {
            return [];
        }
        
        return this.bookedSlots[providerId][date].map(booking => booking.time);
    }

    // Mark Item as Sold
    markItemSold(itemId, itemName, buyer, price) {
        const soldItem = {
            id: itemId,
            name: itemName,
            buyer: buyer,
            price: price,
            soldAt: new Date().toISOString()
        };
        
        this.soldItems.push(soldItem);
        localStorage.setItem('marketpace_sold_items', JSON.stringify(this.soldItems));
        
        return true;
    }

    // Check if Item is Sold
    isItemSold(itemId) {
        return this.soldItems.some(item => item.id === itemId);
    }

    // Book Rental Item
    bookRental(itemId, itemName, renterName, startDate, endDate, timeSlot) {
        const rentalId = 'rental_' + Date.now();
        
        if (!this.rentalBookings[itemId]) {
            this.rentalBookings[itemId] = [];
        }
        
        const rental = {
            id: rentalId,
            renter: renterName,
            startDate: startDate,
            endDate: endDate,
            timeSlot: timeSlot,
            status: 'confirmed',
            bookedAt: new Date().toISOString()
        };
        
        this.rentalBookings[itemId].push(rental);
        localStorage.setItem('marketpace_rental_bookings', JSON.stringify(this.rentalBookings));
        
        return rentalId;
    }

    // Check if Rental Date is Available
    isRentalDateAvailable(itemId, date, timeSlot) {
        if (!this.rentalBookings[itemId]) {
            return true;
        }
        
        return !this.rentalBookings[itemId].some(rental => {
            const rentalStart = new Date(rental.startDate);
            const rentalEnd = new Date(rental.endDate);
            const checkDate = new Date(date);
            
            return checkDate >= rentalStart && checkDate <= rentalEnd && 
                   rental.timeSlot === timeSlot && rental.status === 'confirmed';
        });
    }

    // Save data to localStorage
    saveAvailability() {
        localStorage.setItem('marketpace_available_slots', JSON.stringify(this.availableSlots));
    }

    saveBookings() {
        localStorage.setItem('marketpace_booked_slots', JSON.stringify(this.bookedSlots));
    }
}

// Global booking system instance
window.bookingSystem = new BookingSystem();

// Service Provider Availability Setup
function setupProviderAvailability(providerId, providerName, serviceType) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div style="background: linear-gradient(135deg, #ffd700, #f59e0b); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #ffd700;">
                <h4 style="color: #1a0b3d; margin: 0 0 8px 0; font-weight: bold;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px; vertical-align: middle;">
                        <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(26, 11, 61, 0.2)"/>
                        <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                    MarketPace Pro Feature - FREE Until Jan 1, 2026!
                </h4>
                <p style="color: #1a0b3d; margin: 0; font-size: 13px;">Professional booking calendar is a Pro feature. Launch special: All Pro features are completely free!</p>
            </div>
            
            <h3 style="color: #00ffff; margin-bottom: 20px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="rgba(0, 255, 255, 0.2)"/>
                    <path d="M9 9h6v6h-6z" stroke="currentColor" stroke-width="1.5" fill="rgba(139, 92, 246, 0.3)"/>
                    <path d="m9 1 0 4M15 1l0 4M1 9l22 0" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Set Your Availability - ${providerName}
            </h3>
            
            <div style="background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 255, 0.3);">
                <p style="color: #e2e8f0; margin-bottom: 15px;">Select dates and times when you're available for bookings:</p>
                
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="color: #00ffff; display: block; margin-bottom: 5px;">Date:</label>
                        <input type="date" id="availabilityDate" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 10px; color: white; width: 100%;" min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div>
                        <label style="color: #00ffff; display: block; margin-bottom: 5px;">Available Time Slots:</label>
                        <div id="timeSlotContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
                            <button type="button" class="time-slot-btn" data-time="9:00 AM">9:00 AM</button>
                            <button type="button" class="time-slot-btn" data-time="10:00 AM">10:00 AM</button>
                            <button type="button" class="time-slot-btn" data-time="11:00 AM">11:00 AM</button>
                            <button type="button" class="time-slot-btn" data-time="12:00 PM">12:00 PM</button>
                            <button type="button" class="time-slot-btn" data-time="1:00 PM">1:00 PM</button>
                            <button type="button" class="time-slot-btn" data-time="2:00 PM">2:00 PM</button>
                            <button type="button" class="time-slot-btn" data-time="3:00 PM">3:00 PM</button>
                            <button type="button" class="time-slot-btn" data-time="4:00 PM">4:00 PM</button>
                            <button type="button" class="time-slot-btn" data-time="5:00 PM">5:00 PM</button>
                            <button type="button" class="time-slot-btn" data-time="6:00 PM">6:00 PM</button>
                            <button type="button" class="time-slot-btn" data-time="7:00 PM">7:00 PM</button>
                            <button type="button" class="time-slot-btn" data-time="8:00 PM">8:00 PM</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="selectedAvailability" style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; min-height: 60px;">
                <h4 style="color: #8b5cf6; margin: 0 0 10px 0;">Selected Availability:</h4>
                <div id="availabilityList" style="color: #e2e8f0;">No availability set yet</div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="addAvailabilitySlot('${providerId}', '${providerName}', '${serviceType}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Add Availability</button>
                <button onclick="saveProviderAvailability('${providerId}', '${providerName}', '${serviceType}')" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Save & Finish</button>
                <button onclick="closeAvailabilityModal()" style="background: rgba(107, 114, 128, 0.6); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add CSS for time slot buttons
    const style = document.createElement('style');
    style.textContent = `
        .time-slot-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #e2e8f0;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
        }
        .time-slot-btn:hover {
            background: rgba(0, 255, 255, 0.2);
            border-color: #00ffff;
        }
        .time-slot-btn.selected {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            border-color: #8b5cf6;
            color: white;
        }
    `;
    document.head.appendChild(style);
    
    // Add click handlers for time slots
    modal.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
        });
    });
}

// Add availability slot
function addAvailabilitySlot(providerId, providerName, serviceType) {
    const date = document.getElementById('availabilityDate').value;
    const selectedTimes = Array.from(document.querySelectorAll('.time-slot-btn.selected')).map(btn => btn.dataset.time);
    
    if (!date || selectedTimes.length === 0) {
        alert('Please select a date and at least one time slot');
        return;
    }
    
    const availabilityList = document.getElementById('availabilityList');
    const existingSlots = availabilityList.innerHTML === 'No availability set yet' ? [] : 
        Array.from(availabilityList.children).map(div => ({
            date: div.dataset.date,
            times: JSON.parse(div.dataset.times)
        }));
    
    existingSlots.push({ date, times: selectedTimes });
    
    availabilityList.innerHTML = existingSlots.map(slot => 
        `<div data-date="${slot.date}" data-times='${JSON.stringify(slot.times)}' style="margin-bottom: 8px; padding: 8px; background: rgba(139, 92, 246, 0.2); border-radius: 6px;">
            <strong>${new Date(slot.date).toLocaleDateString()}:</strong> ${slot.times.join(', ')}
        </div>`
    ).join('');
    
    // Clear selections
    document.getElementById('availabilityDate').value = '';
    document.querySelectorAll('.time-slot-btn.selected').forEach(btn => btn.classList.remove('selected'));
}

// Save provider availability
function saveProviderAvailability(providerId, providerName, serviceType) {
    const availabilityList = document.getElementById('availabilityList');
    const slots = Array.from(availabilityList.children).map(div => ({
        date: div.dataset.date,
        times: JSON.parse(div.dataset.times)
    }));
    
    if (slots.length === 0) {
        alert('Please add at least one availability slot');
        return;
    }
    
    window.bookingSystem.setAvailability(providerId, providerName, serviceType, slots);
    closeAvailabilityModal();
    
    // Show success notification
    showNotification('✅ Availability updated successfully! Customers can now book your services.', 'success');
}

function closeAvailabilityModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) document.body.removeChild(modal);
}