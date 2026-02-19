// Utility Functions

// Format date to YYYY-MM-DD
function getFormattedDate(date = new Date()) {
    return date.toISOString().split('T')[0];
}

// Safe JSON parse with fallback
function safeJSONParse(str, fallback = null) {
    try {
        return JSON.parse(str) || fallback;
    } catch (e) {
        console.error('JSON Parse Error:', e);
        return fallback;
    }
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if device is mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save data with timestamp
function saveWithTimestamp(key, data) {
    const item = {
        data: data,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// Get data with timestamp
function getWithTimestamp(key) {
    const item = safeJSONParse(localStorage.getItem(key));
    return item ? item.data : null;
}

// Clear old data (older than specified days)
function clearOldData(days = 30) {
    const now = new Date().getTime();
    const msInDay = 86400000;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('puasaku_')) {
            const item = safeJSONParse(localStorage.getItem(key));
            if (item && item.timestamp) {
                const itemDate = new Date(item.timestamp).getTime();
                if (now - itemDate > days * msInDay) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
}

// Export functions for use in other files
window.puasakuUtils = {
    getFormattedDate,
    safeJSONParse,
    debounce,
    isMobile,
    generateId,
    saveWithTimestamp,
    getWithTimestamp,
    clearOldData
};
