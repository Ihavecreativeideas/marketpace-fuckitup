// Test the essential functions that are failing
function goToPage(page) {
    console.log('goToPage called with:', page);
    const pageMap = {
        'community': '/community',
        'shops': '/shops', 
        'services': '/services',
        'hub': '/the-hub',
        'rentals': '/rentals',
        'menu': '/marketpace-menu'
    };
    
    const targetPage = pageMap[page] || page;
    window.location.href = targetPage;
}

function openAdvancedPostModal(type = 'general') {
    console.log('openAdvancedPostModal called with:', type);
    showNotification(`Opening ${type} post creator...`, 'info');
    const title = prompt(`Enter title for your ${type} post:`);
    if (title) {
        showNotification(`${type} post "${title}" created successfully!`, 'success');
    }
}

function commentPost(postElement) {
    console.log('commentPost called');
    showNotification('Comment section opened', 'info');
}

function likePost(button) {
    console.log('likePost called');
    showNotification('Post liked!', 'success');
}

function favoritePost(button) {
    console.log('favoritePost called');
    showNotification('Post favorited!', 'success');
}

function showNotification(message, type = 'info') {
    console.log(`NOTIFICATION [${type}]: ${message}`);
    // Simple alert for testing
    alert(`${type.toUpperCase()}: ${message}`);
}

console.log('Test functions loaded successfully');