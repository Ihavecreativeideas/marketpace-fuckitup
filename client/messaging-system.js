// MarketPace Messaging System
// Handles direct messaging between buyers and sellers

// Message data structure
let messageThreads = new Map();
let currentUserId = 'user_' + Math.random().toString(36).substr(2, 9);

// Initialize messaging system
function initializeMessaging() {
    // Load existing messages from localStorage
    const savedThreads = JSON.parse(localStorage.getItem('marketpace_messages') || '{}');
    messageThreads = new Map(Object.entries(savedThreads));
}

function createMessageThread(sellerId, sellerName, itemName, itemId) {
    const threadId = `thread_${currentUserId}_${sellerId}_${itemId}`;
    
    if (!messageThreads.has(threadId)) {
        const thread = {
            id: threadId,
            participants: [currentUserId, sellerId],
            sellerName: sellerName,
            itemName: itemName,
            itemId: itemId,
            messages: [],
            lastActivity: new Date().toISOString(),
            unreadCount: 0
        };
        
        messageThreads.set(threadId, thread);
        saveMessages();
    }
    
    return messageThreads.get(threadId);
}

function openMessageModal(sellerId, sellerName, itemName, itemId) {
    const thread = createMessageThread(sellerId, sellerName, itemName, itemId);
    
    const modal = document.createElement('div');
    modal.className = 'messaging-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeMessagingModal()"></div>
        <div class="modal-content messaging-content">
            <div class="message-header">
                <div class="conversation-info">
                    <h3>💬 Message ${sellerName}</h3>
                    <p>About: <strong>${itemName}</strong></p>
                </div>
                <span class="close-btn" onclick="closeMessagingModal()">&times;</span>
            </div>
            
            <div class="message-thread" id="messageThread">
                ${renderMessages(thread.messages)}
            </div>
            
            <div class="message-input-area">
                <div class="message-input-container">
                    <textarea id="messageInput" placeholder="Type your message..." rows="2"></textarea>
                    <button class="send-btn" onclick="sendMessage('${thread.id}', '${sellerName}', '${itemName}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Send
                    </button>
                </div>
                
                <div class="quick-messages">
                    <button class="quick-msg-btn" onclick="insertQuickMessage('Is this item still available?')">
                        Still available?
                    </button>
                    <button class="quick-msg-btn" onclick="insertQuickMessage('What condition is it in?')">
                        Condition?
                    </button>
                    <button class="quick-msg-btn" onclick="insertQuickMessage('Can you deliver?')">
                        Can deliver?
                    </button>
                    <button class="quick-msg-btn" onclick="insertQuickMessage('When can I pick this up?')">
                        When pickup?
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Focus on message input
    setTimeout(() => {
        document.getElementById('messageInput').focus();
    }, 100);
    
    // Scroll to bottom of messages
    scrollToBottomOfMessages();
}

function renderMessages(messages) {
    if (messages.length === 0) {
        return `
            <div class="no-messages">
                <p>Start the conversation! Ask about the item, condition, or pickup details.</p>
            </div>
        `;
    }
    
    return messages.map(message => {
        const isCurrentUser = message.senderId === currentUserId;
        return `
            <div class="message ${isCurrentUser ? 'sent' : 'received'}">
                <div class="message-content">
                    <p>${message.text}</p>
                    <div class="message-time">${formatMessageTime(message.timestamp)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function sendMessage(threadId, sellerName, itemName) {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText) {
        showPopupNotification('Please enter a message', 'error', 2000);
        return;
    }
    
    const thread = messageThreads.get(threadId);
    const message = {
        id: 'msg_' + Date.now(),
        senderId: currentUserId,
        text: messageText,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    thread.messages.push(message);
    thread.lastActivity = new Date().toISOString();
    
    // Clear input
    messageInput.value = '';
    
    // Update UI
    document.getElementById('messageThread').innerHTML = renderMessages(thread.messages);
    scrollToBottomOfMessages();
    
    // Save messages
    saveMessages();
    
    // Show success notification
    showPopupNotification(`Message sent to ${sellerName}!`, 'success', 2000);
    
    // Simulate seller response after delay (for demo)
    setTimeout(() => {
        simulateSellerResponse(threadId, sellerName);
    }, 2000 + Math.random() * 3000);
}

function simulateSellerResponse(threadId, sellerName) {
    const thread = messageThreads.get(threadId);
    const responses = [
        "Hi! Yes, it's still available. Would you like to see it?",
        "Thanks for your interest! It's in excellent condition.",
        "Sure, I can deliver for an extra $5. When works for you?",
        "You can pick it up anytime after 3pm. Just let me know!",
        "Great question! I can send you more photos if you'd like.",
        "It's been well maintained. Happy to answer any other questions!"
    ];
    
    const response = {
        id: 'msg_' + Date.now(),
        senderId: 'seller_demo',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        read: false
    };
    
    thread.messages.push(response);
    thread.lastActivity = new Date().toISOString();
    
    // Update UI if modal is still open
    const messageThread = document.getElementById('messageThread');
    if (messageThread) {
        messageThread.innerHTML = renderMessages(thread.messages);
        scrollToBottomOfMessages();
        
        // Show notification that seller responded
        showPopupNotification(`${sellerName} replied to your message!`, 'info', 3000);
    }
    
    saveMessages();
}

function insertQuickMessage(text) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = text;
    messageInput.focus();
}

function scrollToBottomOfMessages() {
    const messageThread = document.getElementById('messageThread');
    if (messageThread) {
        messageThread.scrollTop = messageThread.scrollHeight;
    }
}

function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    } else if (diff < 86400000) { // Less than 24 hours
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function closeMessagingModal() {
    const modal = document.querySelector('.messaging-modal');
    if (modal) modal.remove();
}

function saveMessages() {
    const threadsObject = Object.fromEntries(messageThreads);
    localStorage.setItem('marketpace_messages', JSON.stringify(threadsObject));
}

// Add to cart and go to cart function
function addToCartAndNavigate(itemName, price, sellerName, imageUrl, deliveryMethod = 'self-pickup') {
    const cartItem = {
        id: 'item_' + Date.now(),
        name: itemName,
        price: parseFloat(price),
        seller: sellerName,
        image: imageUrl,
        deliveryMethod: deliveryMethod,
        deliveryFee: calculateDeliveryFee(deliveryMethod),
        timestamp: new Date().toISOString()
    };
    
    // Get existing cart
    const cart = JSON.parse(localStorage.getItem('marketpace_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('marketpace_cart', JSON.stringify(cart));
    
    // Show notification and navigate to cart
    showPopupNotification(`${itemName} added to cart!`, 'success', 2000);
    
    // Navigate to cart after brief delay
    setTimeout(() => {
        window.location.href = '/cart';
    }, 1000);
}

// Export functions
window.openMessageModal = openMessageModal;
window.sendMessage = sendMessage;
window.insertQuickMessage = insertQuickMessage;
window.closeMessagingModal = closeMessagingModal;
window.addToCartAndNavigate = addToCartAndNavigate;

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeMessaging);

// CSS Styles for messaging system
if (!document.getElementById('messaging-styles')) {
    const messagingStyle = document.createElement('style');
    messagingStyle.id = 'messaging-styles';
    messagingStyle.textContent = `
    .messaging-modal {
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

    .messaging-content {
        width: 500px;
        height: 600px;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
    }

    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
        margin-bottom: 15px;
    }

    .conversation-info h3 {
        color: #00ffff;
        margin: 0 0 5px 0;
    }

    .conversation-info p {
        color: #ccc;
        margin: 0;
        font-size: 14px;
    }

    .message-thread {
        flex: 1;
        overflow-y: auto;
        padding: 10px 0;
        margin-bottom: 15px;
    }

    .no-messages {
        text-align: center;
        color: #888;
        padding: 40px 20px;
        font-style: italic;
    }

    .message {
        margin-bottom: 15px;
        display: flex;
    }

    .message.sent {
        justify-content: flex-end;
    }

    .message.received {
        justify-content: flex-start;
    }

    .message-content {
        max-width: 70%;
        padding: 12px 15px;
        border-radius: 15px;
        position: relative;
    }

    .message.sent .message-content {
        background: linear-gradient(135deg, #00ffff, #0ea5e9);
        color: #1a0b3d;
    }

    .message.received .message-content {
        background: rgba(255, 255, 255, 0.1);
        color: #e2e8f0;
    }

    .message-content p {
        margin: 0 0 5px 0;
        line-height: 1.4;
    }

    .message-time {
        font-size: 11px;
        opacity: 0.7;
    }

    .message-input-area {
        border-top: 1px solid rgba(0, 255, 255, 0.3);
        padding-top: 15px;
    }

    .message-input-container {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }

    #messageInput {
        flex: 1;
        padding: 12px;
        background: rgba(0, 255, 255, 0.1);
        border: 2px solid rgba(0, 255, 255, 0.3);
        border-radius: 10px;
        color: white;
        resize: none;
        font-family: inherit;
    }

    #messageInput:focus {
        outline: none;
        border-color: #00ffff;
    }

    .send-btn {
        padding: 12px 15px;
        background: linear-gradient(135deg, #00ffff, #0ea5e9);
        color: #1a0b3d;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .send-btn:hover {
        background: linear-gradient(135deg, #0ea5e9, #0284c7);
    }

    .quick-messages {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .quick-msg-btn {
        padding: 6px 12px;
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 15px;
        color: #00ffff;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
    }

    .quick-msg-btn:hover {
        background: rgba(0, 255, 255, 0.2);
        border-color: #00ffff;
    }
    `;

    document.head.appendChild(messagingStyle);
}