// Global State
let currentThemeData = null;
let paletteCache = {}; // Start empty, filled by theme-generated
let tokenOverrides = {}; // { 'Status/error': { light: '50', dark: '900' } }

// Backend Messages Handler
window.onmessage = (event) => {
    const { type, payload } = event.data.pluginMessage;

    // Dispatch custom event so modules can listen to specific messages
    // This allows decoupling the switch statement
    const customEvent = new CustomEvent('plugin-message', { detail: { type, payload } });
    window.dispatchEvent(customEvent);

    // Common handlers
    if (type === 'show-progress') {
        const overlay = document.getElementById('progress-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.getElementById('progress-message').textContent = payload.message;
        }
    } else if (type === 'hide-progress') {
        const overlay = document.getElementById('progress-overlay');
        if (overlay) overlay.style.display = 'none';

    } else if (type === 'notify') {
        // Display a temporary notification
        showNotification(payload.message, payload.status);
    }
};

// Helper: Show Notification
function showNotification(message, status = 'info') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            display: none;
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            background: #333;
            color: white;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
        `;
        document.body.appendChild(notification);
    }

    notification.textContent = message;

    // Style based on status
    if (status === 'error') notification.style.background = '#ef4444';
    else if (status === 'success') notification.style.background = '#10b981';
    else notification.style.background = '#333';

    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Add Progress Overlay HTML if not present
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('progress-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'progress-overlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        `;
        overlay.innerHTML = `
            <div class="spinner" style="
                width: 40px; 
                height: 40px; 
                border: 4px solid #f3f3f3; 
                border-top: 4px solid #3498db; 
                border-radius: 50%; 
                animation: spin 1s linear infinite;"></div>
            <div id="progress-message" style="margin-top: 16px; font-weight: 600; color: #333;">Processing...</div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(overlay);
    }
});
