// MarketPace Seller Posting Options
// Allows sellers to configure counter offers and delivery methods before posting

function showSellerPostingModal(postType = 'sale') {
    const modal = document.createElement('div');
    modal.className = 'seller-posting-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeSellerPostingModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>📝 Create ${postType === 'sale' ? 'Sale' : postType === 'rental' ? 'Rental' : 'Service'} Post</h3>
                <span class="close-btn" onclick="closeSellerPostingModal()">&times;</span>
            </div>
            <div class="modal-body">
                <!-- Basic Item Info -->
                <div class="form-group">
                    <label>Item/Service Name:</label>
                    <input type="text" id="itemName" placeholder="What are you offering?">
                </div>
                
                <div class="form-group">
                    <label>Description:</label>
                    <textarea id="itemDescription" placeholder="Describe your item/service..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Price:</label>
                    <input type="number" id="itemPrice" placeholder="Enter price" min="1" step="0.01">
                </div>
                
                <!-- Counter Offer Settings -->
                <div class="settings-section">
                    <h4>💬 Counter Offer Settings</h4>
                    <div class="toggle-group">
                        <label class="toggle-switch">
                            <input type="checkbox" id="allowCounterOffers" onchange="toggleCounterOfferOptions()">
                            <span class="slider"></span>
                            Allow counter offers on this item
                        </label>
                        <label class="toggle-switch">
                            <input type="checkbox" id="allowMessages" checked>
                            <span class="slider"></span>
                            Allow messages from buyers
                        </label>
                    </div>
                    
                    <div class="counter-offer-options" id="counterOfferOptions" style="display: none;">
                        <p class="info-text">Buyers can choose from these discount options:</p>
                        <div class="discount-preview">
                            <div class="discount-option">15% off = <span id="discount15">$0</span></div>
                            <div class="discount-option">25% off = <span id="discount25">$0</span></div>
                            <div class="discount-option">35% off = <span id="discount35">$0</span></div>
                            <div class="discount-option">40% off = <span id="discount40">$0</span></div>
                            <div class="discount-option">50% off = <span id="discount50">$0</span></div>
                        </div>
                        <p class="note">You can accept, decline, or counter back with your own price.</p>
                    </div>
                </div>
                
                <!-- Delivery Method Settings -->
                <div class="settings-section">
                    <h4>🚚 Delivery Options</h4>
                    <div class="delivery-options">
                        <label class="delivery-option">
                            <input type="checkbox" name="deliveryMethods" value="self-pickup" checked>
                            <div class="option-content">
                                <strong>Self Pickup</strong> - FREE
                                <small>Buyer picks up from your location</small>
                            </div>
                        </label>
                        
                        <label class="delivery-option">
                            <input type="checkbox" name="deliveryMethods" value="marketplace-delivery">
                            <div class="option-content">
                                <strong>MarketPace Delivery</strong> - Split Cost
                                <small>Professional delivery service (costs split with buyer)</small>
                            </div>
                        </label>
                        
                        <label class="delivery-option">
                            <input type="checkbox" name="deliveryMethods" value="seller-delivery">
                            <div class="option-content">
                                <strong>Private Party Delivery</strong> - You Set S&H Fee
                                <small>You provide delivery service (not MarketPace delivery) and set shipping & handling fee. Marketplace still collects 5% commission.</small>
                            </div>
                        </label>
                    </div>
                    
                    <div class="custom-delivery-fee" id="customDeliveryFee" style="display: none;">
                        <label>Your S&H fee:</label>
                        <input type="number" id="sellerDeliveryFee" placeholder="Enter shipping & handling fee" min="0" step="0.01">
                        <small style="color: #ffc107; display: block; margin-top: 5px;">Note: MarketPace still collects 5% commission on the item price</small>
                    </div>
                </div>
                
                <!-- Photo Upload -->
                <div class="settings-section">
                    <h4>📸 Photos</h4>
                    <div class="photo-upload">
                        <input type="file" id="itemPhotos" multiple accept="image/*" onchange="previewPhotos()">
                        <label for="itemPhotos" class="upload-btn">Choose Photos</label>
                        <div class="photo-preview" id="photoPreview"></div>
                    </div>
                </div>
                
                <!-- Post Actions -->
                <div class="post-actions">
                    <button class="cancel-btn" onclick="closeSellerPostingModal()">Cancel</button>
                    <button class="post-btn" onclick="publishPost('${postType}')">Publish Post</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Setup price change listener for counter offer preview
    document.getElementById('itemPrice').addEventListener('input', updateCounterOfferPreview);
    
    // Setup delivery method change listener
    document.querySelectorAll('input[name="deliveryMethods"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateDeliveryOptions);
    });
}

function toggleCounterOfferOptions() {
    const checkbox = document.getElementById('allowCounterOffers');
    const options = document.getElementById('counterOfferOptions');
    
    if (checkbox.checked) {
        options.style.display = 'block';
        updateCounterOfferPreview();
    } else {
        options.style.display = 'none';
    }
}

function updateCounterOfferPreview() {
    const price = parseFloat(document.getElementById('itemPrice').value) || 0;
    const discounts = [15, 25, 35, 40, 50];
    
    discounts.forEach(discount => {
        const discountAmount = price * (discount / 100);
        const discountedPrice = price - discountAmount;
        document.getElementById(`discount${discount}`).textContent = '$' + discountedPrice.toFixed(2);
    });
}

function updateDeliveryOptions() {
    const sellerDeliveryChecked = document.querySelector('input[value="seller-delivery"]').checked;
    const customFeeSection = document.getElementById('customDeliveryFee');
    
    if (sellerDeliveryChecked) {
        customFeeSection.style.display = 'block';
    } else {
        customFeeSection.style.display = 'none';
    }
}

function previewPhotos() {
    const files = document.getElementById('itemPhotos').files;
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function publishPost(postType) {
    const postData = {
        type: postType,
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDescription').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        allowCounterOffers: document.getElementById('allowCounterOffers').checked,
        allowMessages: document.getElementById('allowMessages').checked,
        deliveryMethods: Array.from(document.querySelectorAll('input[name="deliveryMethods"]:checked')).map(cb => cb.value),
        sellerDeliveryFee: document.getElementById('sellerDeliveryFee')?.value || null,
        photos: document.getElementById('itemPhotos').files.length,
        timestamp: new Date().toISOString()
    };
    
    // Validate required fields
    if (!postData.name || !postData.description || !postData.price) {
        showPopupNotification('Please fill in all required fields', 'error', 3000);
        return;
    }
    
    if (postData.deliveryMethods.length === 0) {
        showPopupNotification('Please select at least one delivery method', 'error', 3000);
        return;
    }
    
    // Save to local storage (in real app, this would go to server)
    const posts = JSON.parse(localStorage.getItem('marketpace_posts') || '[]');
    postData.id = 'post_' + Date.now();
    posts.unshift(postData);
    localStorage.setItem('marketpace_posts', JSON.stringify(posts));
    
    closeSellerPostingModal();
    
    // Show success message
    const counterOfferText = postData.allowCounterOffers ? ' (Counter offers enabled)' : '';
    const messageText = postData.allowMessages ? ' (Messages enabled)' : '';
    const deliveryText = postData.deliveryMethods.includes('self-pickup') ? ' Self-pickup available.' : '';
    
    showPopupNotification(
        `✅ ${postData.name} posted successfully!${counterOfferText}${messageText}${deliveryText}`, 
        'success', 
        4000
    );
    
    // Refresh the current page to show new post
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function closeSellerPostingModal() {
    const modal = document.querySelector('.seller-posting-modal');
    if (modal) modal.remove();
}

// Export functions
window.showSellerPostingModal = showSellerPostingModal;
window.toggleCounterOfferOptions = toggleCounterOfferOptions;
window.updateCounterOfferPreview = updateCounterOfferPreview;
window.updateDeliveryOptions = updateDeliveryOptions;
window.previewPhotos = previewPhotos;
window.publishPost = publishPost;
window.closeSellerPostingModal = closeSellerPostingModal;

// CSS Styles
const style = document.createElement('style');
style.textContent = `
.seller-posting-modal {
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
    overflow-y: auto;
}

.seller-posting-modal .modal-content {
    background: linear-gradient(135deg, #1a0b3d 0%, #2d1b69 100%);
    border-radius: 15px;
    padding: 25px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    border: 2px solid #00ffff;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #00ffff;
    font-weight: bold;
}

.form-group input, .form-group textarea {
    width: 100%;
    padding: 12px;
    background: rgba(0, 255, 255, 0.1);
    border: 2px solid #00ffff;
    border-radius: 8px;
    color: white;
    font-size: 14px;
}

.form-group textarea {
    height: 80px;
    resize: vertical;
}

.settings-section {
    margin: 25px 0;
    padding: 20px;
    background: rgba(0, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(0, 255, 255, 0.2);
}

.settings-section h4 {
    color: #00ffff;
    margin-bottom: 15px;
}

.toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: relative;
    width: 50px;
    height: 24px;
    background: #666;
    border-radius: 12px;
    margin-right: 10px;
    transition: background 0.3s;
}

.slider:before {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
}

.toggle-switch input:checked + .slider {
    background: #00ffff;
}

.toggle-switch input:checked + .slider:before {
    transform: translateX(26px);
}

.discount-preview {
    margin: 15px 0;
    padding: 15px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
}

.discount-option {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    padding: 5px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.delivery-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.delivery-option {
    display: flex;
    align-items: center;
    padding: 15px;
    background: rgba(0, 255, 255, 0.1);
    border: 2px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.delivery-option:hover {
    border-color: #00ffff;
    background: rgba(0, 255, 255, 0.2);
}

.delivery-option input {
    margin-right: 15px;
    width: auto;
}

.option-content {
    flex: 1;
}

.option-content strong {
    display: block;
    color: #00ffff;
    margin-bottom: 5px;
}

.option-content small {
    color: #ccc;
    font-size: 12px;
}

.custom-delivery-fee {
    margin-top: 15px;
    padding: 15px;
    background: rgba(255, 193, 7, 0.1);
    border-radius: 8px;
}

.photo-upload {
    text-align: center;
}

.upload-btn {
    display: inline-block;
    padding: 12px 20px;
    background: linear-gradient(135deg, #00ffff, #9d4edd);
    color: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

.photo-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
}

.preview-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid #00ffff;
}

.post-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    justify-content: flex-end;
}

.cancel-btn {
    padding: 12px 25px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

.post-btn {
    padding: 12px 25px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

.info-text, .note {
    font-size: 14px;
    color: #ccc;
    margin: 10px 0;
}

.note {
    font-style: italic;
    color: #ffc107;
}
`;

document.head.appendChild(style);