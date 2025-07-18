// MarketPace Counter Offer System
// Pre-calculated discount percentages with pop-up notifications

// Pre-calculated discount options
const DISCOUNT_OPTIONS = [15, 25, 35, 40, 50];

// Counter offer data structure
let activeCounterOffers = new Map();

function createCounterOffer(itemId, originalPrice, buyerId, sellerId) {
    const offers = DISCOUNT_OPTIONS.map(discount => {
        const discountAmount = originalPrice * (discount / 100);
        const offerPrice = originalPrice - discountAmount;
        return {
            discount: discount,
            price: offerPrice.toFixed(2),
            savings: discountAmount.toFixed(2)
        };
    });

    const counterOffer = {
        id: `co_${Date.now()}`,
        itemId,
        originalPrice,
        buyerId,
        sellerId,
        status: 'pending',
        offers,
        selectedOffer: null,
        sellerResponse: null,
        timestamp: new Date()
    };

    activeCounterOffers.set(counterOffer.id, counterOffer);
    return counterOffer;
}

function showCounterOfferModal(itemName, originalPrice, itemId, sellerId) {
    const modal = document.createElement('div');
    modal.className = 'counter-offer-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeCounterOfferModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>💬 Make Counter Offer</h3>
                <span class="close-btn" onclick="closeCounterOfferModal()">&times;</span>
            </div>
            <div class="modal-body">
                <p><strong>${itemName}</strong></p>
                <p>Original Price: <span class="original-price">$${originalPrice}</span></p>
                
                <div class="offer-options">
                    <h4>Select your offer:</h4>
                    ${DISCOUNT_OPTIONS.map(discount => {
                        const discountAmount = originalPrice * (discount / 100);
                        const offerPrice = originalPrice - discountAmount;
                        return `
                            <div class="offer-option" onclick="selectCounterOffer(${discount}, ${offerPrice.toFixed(2)})">
                                <div class="discount-badge">${discount}% OFF</div>
                                <div class="offer-price">$${offerPrice.toFixed(2)}</div>
                                <div class="savings">Save $${discountAmount.toFixed(2)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="offer-actions">
                    <button class="cancel-btn" onclick="closeCounterOfferModal()">Cancel</button>
                    <button class="send-offer-btn" id="sendOfferBtn" onclick="sendCounterOffer('${itemId}', '${sellerId}')" disabled>
                        Send Counter Offer
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function selectCounterOffer(discount, price) {
    // Remove previous selections
    document.querySelectorAll('.offer-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Mark current selection
    event.target.closest('.offer-option').classList.add('selected');
    
    // Store selected offer
    window.selectedCounterOffer = { discount, price };
    
    // Enable send button
    document.getElementById('sendOfferBtn').disabled = false;
}

function sendCounterOffer(itemId, sellerId) {
    if (!window.selectedCounterOffer) return;
    
    const buyerId = 'current_user'; // Replace with actual user ID
    const counterOffer = createCounterOffer(itemId, window.originalPrice, buyerId, sellerId);
    counterOffer.selectedOffer = window.selectedCounterOffer;
    
    // Show buyer confirmation
    showPopupNotification(
        `💬 Counter offer sent! Offered $${window.selectedCounterOffer.price} (${window.selectedCounterOffer.discount}% off)`,
        'info',
        4000
    );
    
    // Notify seller
    setTimeout(() => {
        showSellerCounterOfferNotification(counterOffer);
    }, 1000);
    
    closeCounterOfferModal();
}

function showSellerCounterOfferNotification(counterOffer) {
    const modal = document.createElement('div');
    modal.className = 'seller-notification-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="notification-content">
            <div class="notification-header">
                <h3>💬 New Counter Offer Received</h3>
            </div>
            <div class="notification-body">
                <p><strong>Buyer offered:</strong> $${counterOffer.selectedOffer.price}</p>
                <p><strong>Original price:</strong> $${counterOffer.originalPrice}</p>
                <p><strong>Discount:</strong> ${counterOffer.selectedOffer.discount}% off (Save $${counterOffer.selectedOffer.savings})</p>
                
                <div class="seller-actions">
                    <button class="decline-btn" onclick="handleSellerResponse('${counterOffer.id}', 'decline')">
                        ❌ Decline
                    </button>
                    <button class="accept-btn" onclick="handleSellerResponse('${counterOffer.id}', 'accept')">
                        ✅ Accept Offer
                    </button>
                    <button class="counter-btn" onclick="showCustomCounterModal('${counterOffer.id}')">
                        💬 Counter Back
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function showCustomCounterModal(counterOfferId) {
    const counterOffer = activeCounterOffers.get(counterOfferId);
    const modal = document.createElement('div');
    modal.className = 'custom-counter-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeCustomCounterModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>💬 Your Counter Offer</h3>
                <span class="close-btn" onclick="closeCustomCounterModal()">&times;</span>
            </div>
            <div class="modal-body">
                <p>Buyer offered: <strong>$${counterOffer.selectedOffer.price}</strong></p>
                <p>Your asking price: <strong>$${counterOffer.originalPrice}</strong></p>
                
                <div class="custom-price-input">
                    <label>Your counter offer (take it or leave it):</label>
                    <div class="price-input-container">
                        <span class="dollar-sign">$</span>
                        <input type="number" id="customCounterPrice" min="1" max="${counterOffer.originalPrice}" 
                               step="0.01" placeholder="Enter price">
                    </div>
                </div>
                
                <div class="counter-actions">
                    <button class="cancel-btn" onclick="closeCustomCounterModal()">Cancel</button>
                    <button class="send-counter-btn" onclick="sendCustomCounter('${counterOfferId}')">
                        Send Final Offer
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function handleSellerResponse(counterOfferId, action) {
    const counterOffer = activeCounterOffers.get(counterOfferId);
    counterOffer.sellerResponse = action;
    
    // Close seller notification
    document.querySelector('.seller-notification-modal').remove();
    
    if (action === 'accept') {
        // Add item to buyer's cart
        addItemToCart(counterOffer.itemId, counterOffer.selectedOffer.price);
        
        // Notify buyer
        showPopupNotification(
            `✅ Offer accepted! Item added to cart at $${counterOffer.selectedOffer.price}`,
            'success',
            4000
        );
        
        // Notify seller
        showPopupNotification(
            `✅ Counter offer accepted! Item available in buyer's cart.`,
            'success',
            4000
        );
        
    } else if (action === 'decline') {
        // Notify buyer
        showPopupNotification(
            `❌ Counter offer declined by seller.`,
            'error',
            4000
        );
        
        // Notify seller
        showPopupNotification(
            `❌ Counter offer declined.`,
            'info',
            3000
        );
    }
    
    counterOffer.status = action;
}

function sendCustomCounter(counterOfferId) {
    const customPrice = document.getElementById('customCounterPrice').value;
    if (!customPrice || customPrice <= 0) {
        alert('Please enter a valid price');
        return;
    }
    
    const counterOffer = activeCounterOffers.get(counterOfferId);
    counterOffer.sellerResponse = 'counter';
    counterOffer.finalOffer = parseFloat(customPrice);
    
    closeCustomCounterModal();
    
    // Notify seller
    showPopupNotification(
        `💬 Final offer sent: $${customPrice} (take it or leave it)`,
        'info',
        4000
    );
    
    // Notify buyer with final decision
    setTimeout(() => {
        showBuyerFinalOfferNotification(counterOffer);
    }, 1000);
}

function showBuyerFinalOfferNotification(counterOffer) {
    const modal = document.createElement('div');
    modal.className = 'buyer-final-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="notification-content">
            <div class="notification-header">
                <h3>💬 Seller's Final Offer</h3>
            </div>
            <div class="notification-body">
                <p><strong>Seller's final offer:</strong> $${counterOffer.finalOffer}</p>
                <p><strong>Your original offer:</strong> $${counterOffer.selectedOffer.price}</p>
                <p><strong>Original price:</strong> $${counterOffer.originalPrice}</p>
                <p class="final-warning">⚠️ This is a "take it or leave it" offer - no more counters allowed</p>
                
                <div class="final-actions">
                    <button class="decline-final-btn" onclick="declineFinalOffer('${counterOffer.id}')">
                        ❌ Decline
                    </button>
                    <button class="accept-final-btn" onclick="acceptFinalOffer('${counterOffer.id}')">
                        ✅ Accept & Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function acceptFinalOffer(counterOfferId) {
    const counterOffer = activeCounterOffers.get(counterOfferId);
    
    // Add to cart at final offer price
    addItemToCart(counterOffer.itemId, counterOffer.finalOffer);
    
    // Close modal
    document.querySelector('.buyer-final-modal').remove();
    
    // Notify buyer
    showPopupNotification(
        `✅ Final offer accepted! Item added to cart at $${counterOffer.finalOffer}`,
        'success',
        4000
    );
    
    counterOffer.status = 'final_accepted';
}

function declineFinalOffer(counterOfferId) {
    const counterOffer = activeCounterOffers.get(counterOfferId);
    
    // Close modal
    document.querySelector('.buyer-final-modal').remove();
    
    // Notify buyer
    showPopupNotification(
        `❌ Final offer declined. Counter offer ended.`,
        'error',
        4000
    );
    
    counterOffer.status = 'final_declined';
}

function addItemToCart(itemId, price) {
    // Note: Item is NOT held - still available for others until purchase process starts
    let cart = JSON.parse(localStorage.getItem('marketpace_cart') || '[]');
    
    const cartItem = {
        id: itemId,
        price: parseFloat(price),
        negotiatedPrice: true,
        addedAt: new Date().toISOString()
    };
    
    cart.push(cartItem);
    localStorage.setItem('marketpace_cart', JSON.stringify(cart));
    
    // Update cart counter
    updateCartCounter();
}

function closeCounterOfferModal() {
    const modal = document.querySelector('.counter-offer-modal');
    if (modal) modal.remove();
}

function closeCustomCounterModal() {
    const modal = document.querySelector('.custom-counter-modal');
    if (modal) modal.remove();
}

// Ensure self-pickup doesn't charge delivery fees
function calculateDeliveryFee(deliveryMethod, distance = 0) {
    if (deliveryMethod === 'self-pickup') {
        return 0; // No delivery fee for self-pickup
    }
    
    // Standard delivery calculation
    const baseFee = 8; // $4 pickup + $4 dropoff
    const mileageFee = distance * 0.50;
    return baseFee + mileageFee;
}

// Pop-up notification system
function showPopupNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `popup-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
    
    return notification;
}

// Export functions for global use
window.showPopupNotification = showPopupNotification;
window.showCounterOfferModal = showCounterOfferModal;
window.selectCounterOffer = selectCounterOffer;
window.sendCounterOffer = sendCounterOffer;
window.handleSellerResponse = handleSellerResponse;
window.sendCustomCounter = sendCustomCounter;
window.acceptFinalOffer = acceptFinalOffer;
window.declineFinalOffer = declineFinalOffer;
window.closeCounterOfferModal = closeCounterOfferModal;
window.closeCustomCounterModal = closeCustomCounterModal;
window.calculateDeliveryFee = calculateDeliveryFee;

// CSS Styles for counter offer system
if (!document.getElementById('counter-offer-styles')) {
    const counterOfferStyle = document.createElement('style');
    counterOfferStyle.id = 'counter-offer-styles';
counterOfferStyle.textContent = `
.counter-offer-modal, .seller-notification-modal, .custom-counter-modal, .buyer-final-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.modal-content, .notification-content {
    background: linear-gradient(135deg, #1a0b3d 0%, #2d1b69 100%);
    border-radius: 15px;
    padding: 25px;
    max-width: 500px;
    width: 90%;
    border: 2px solid #00ffff;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
}

.modal-header, .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    color: #00ffff;
    border-bottom: 1px solid rgba(0, 255, 255, 0.3);
    padding-bottom: 15px;
}

.close-btn {
    font-size: 24px;
    cursor: pointer;
    color: #ff6b6b;
    font-weight: bold;
}

.original-price {
    color: #ffc107;
    font-weight: bold;
}

.offer-options {
    margin: 20px 0;
}

.offer-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin: 10px 0;
    background: rgba(0, 255, 255, 0.1);
    border: 2px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.offer-option:hover {
    border-color: #00ffff;
    background: rgba(0, 255, 255, 0.2);
}

.offer-option.selected {
    border-color: #00ffff;
    background: rgba(0, 255, 255, 0.3);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

.discount-badge {
    background: #ff6b6b;
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-weight: bold;
    font-size: 12px;
}

.offer-price {
    font-size: 18px;
    font-weight: bold;
    color: #22c55e;
}

.savings {
    font-size: 14px;
    color: #ffc107;
}

.offer-actions, .seller-actions, .counter-actions, .final-actions {
    display: flex;
    gap: 15px;
    margin-top: 20px;
}

.cancel-btn, .decline-btn, .decline-final-btn {
    flex: 1;
    padding: 12px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

.send-offer-btn, .accept-btn, .accept-final-btn {
    flex: 1;
    padding: 12px;
    background: #22c55e;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

.counter-btn, .send-counter-btn {
    flex: 1;
    padding: 12px;
    background: #ffc107;
    color: #1a0b3d;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

.send-offer-btn:disabled {
    background: #666;
    cursor: not-allowed;
}

.price-input-container {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.dollar-sign {
    font-size: 20px;
    color: #00ffff;
    margin-right: 5px;
}

#customCounterPrice {
    flex: 1;
    padding: 10px;
    background: rgba(0, 255, 255, 0.1);
    border: 2px solid #00ffff;
    border-radius: 8px;
    color: white;
    font-size: 16px;
}

.final-warning {
    background: rgba(255, 107, 107, 0.2);
    border: 1px solid #ff6b6b;
    border-radius: 8px;
    padding: 10px;
    margin: 15px 0;
    color: #ff6b6b;
    text-align: center;
}

.modal-body, .notification-body {
    color: #e2e8f0;
    line-height: 1.6;
}
/* Pop-up Notification Styles */
.popup-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 15000;
    min-width: 300px;
    max-width: 500px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: slideInRight 0.3s ease-out;
}

.popup-notification.success {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: 2px solid #22c55e;
}

.popup-notification.error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: 2px solid #ef4444;
}

.popup-notification.info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: 2px solid #3b82f6;
}

.notification-content {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
}

.notification-message {
    font-weight: 500;
    line-height: 1.4;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    margin-left: 15px;
    opacity: 0.8;
}

.notification-close:hover {
    opacity: 1;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

    document.head.appendChild(counterOfferStyle);
}