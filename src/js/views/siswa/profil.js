import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize mock database
    storage.initDb();

    // 1. Load and render profile data
    renderProfile();

    // 2. Set up logout
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

    // 3. Edit profile Modal triggers
    const editBtn = document.querySelector('.btn-profile-edit');
    const modal = document.getElementById('edit-profile-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const editForm = document.getElementById('edit-profile-form');

    if (editBtn && modal) {
        editBtn.addEventListener('click', () => {
            const user = storage.getUser();
            if (user) {
                // Pre-fill inputs
                document.getElementById('edit-name').value = user.name || 'Rohmat';
                document.getElementById('edit-username').value = user.username || 'rohmat';
                document.getElementById('edit-email').value = user.email || 'rohmat@gmail.com';
                document.getElementById('edit-class').value = user.class || '5';
            }
            modal.style.display = 'flex';
        });
    }

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (editForm && modal) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('edit-name').value.trim();
            const username = document.getElementById('edit-username').value.trim();
            const email = document.getElementById('edit-email').value.trim();
            const classVal = document.getElementById('edit-class').value.trim();

            const user = storage.getUser() || {};
            const updatedUser = {
                ...user,
                name,
                username,
                email,
                class: classVal
            };

            // Save to localStorage
            storage.setUser(updatedUser);

            // Re-render display
            renderProfile();
            
            // Hide modal
            modal.style.display = 'none';
        });
    }
});

function renderProfile() {
    const user = storage.getUser();
    if (!user) return;

    // Populate DOM elements
    const profileName = document.getElementById('profile-name');
    if (profileName) profileName.textContent = user.name;
    
    const profileEmailDesc = document.getElementById('profile-email-desc');
    if (profileEmailDesc) profileEmailDesc.textContent = user.email;
    
    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) profileAvatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;

    const infoFullname = document.getElementById('info-fullname');
    if (infoFullname) infoFullname.textContent = user.name;
    
    const infoUsername = document.getElementById('info-username');
    if (infoUsername) infoUsername.textContent = user.username || user.name.toLowerCase().replace(/\s+/g, '');
    
    const infoEmail = document.getElementById('info-email');
    if (infoEmail) infoEmail.textContent = user.email;
    
    const infoClass = document.getElementById('info-class');
    if (infoClass) infoClass.textContent = user.class || '5';

    // Update Top bar user info too
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) userAvatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;

    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName) userDisplayName.textContent = user.name;
}
