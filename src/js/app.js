import { storage } from './utils/storage.js';
import { authApi } from './api/auth.js';

/**
 * Global App Initialization
 * Shared logic across multiple pages can be placed here.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Shared logout button listener if available
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await authApi.logout();
        });
    }

    // Populate profile card elements if present
    const user = storage.getUser();
    if (user) {
        const nameEl = document.getElementById('user-display-name');
        if (nameEl) nameEl.textContent = user.name || 'User';

        const roleBadgeEl = document.getElementById('user-role-badge');
        if (roleBadgeEl) roleBadgeEl.textContent = user.role ? user.role.toUpperCase() : 'USER';
        
        const avatarEl = document.getElementById('user-avatar');
        if (avatarEl && user.role) {
            avatarEl.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.role}_${user.id || 'seed'}`;
        }
    }
});
