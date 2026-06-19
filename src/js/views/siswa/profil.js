import { storage } from '../../../src/js/utils/storage.js';
import { authApi } from '../../../src/js/api/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load profile data from storage or fallback to mockup values
    const user = storage.getUser() || {
        name: 'Rohmat',
        email: 'rohmat@gmail.com',
        username: 'rohmat',
        classLevel: '5'
    };

    // 2. Populate DOM elements
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email-desc').textContent = user.email;
    document.getElementById('profile-avatar').src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;

    document.getElementById('info-fullname').textContent = user.name;
    document.getElementById('info-username').textContent = user.username || user.name.toLowerCase().replace(/\s+/g, '');
    document.getElementById('info-email').textContent = user.email;
    document.getElementById('info-class').textContent = user.classLevel || '5';

    // 3. Set up logouts
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    const profileLogoutBtn = document.getElementById('btn-profile-logout');
    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // 4. Edit profile trigger
    const editBtn = document.querySelector('.btn-profile-edit');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            alert('Fitur edit profil sedang dikembangkan oleh tim Backend Laravel.');
        });
    }
});
