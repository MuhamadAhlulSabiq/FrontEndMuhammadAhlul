import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize mock database
    storage.initDb();

    // Load and render profile data
    renderProfile();

    // Set up logout bindings
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

    // Edit profile Modal triggers
    const editBtn = document.getElementById('btn-edit-profile');
    const modal = document.getElementById('edit-profile-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const editForm = document.getElementById('edit-profile-form');

    if (editBtn && modal) {
        editBtn.addEventListener('click', () => {
            const user = storage.getUser();
            if (user) {
                // Pre-fill inputs
                document.getElementById('edit-name').value = user.name || 'Bu Nina';
                document.getElementById('edit-username').value = user.username || 'nina';
                document.getElementById('edit-email').value = user.email || 'nina@guru.com';
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

            const user = storage.getUser() || {};
            const updatedUser = {
                ...user,
                name,
                username,
                email
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
    if (profileAvatar) profileAvatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=guru_${user.id || 'nina'}`;

    const infoFullname = document.getElementById('info-fullname');
    if (infoFullname) infoFullname.textContent = user.name;
    
    const infoUsername = document.getElementById('info-username');
    if (infoUsername) infoUsername.textContent = user.username || user.name.toLowerCase().replace(/\s+/g, '');
    
    const infoEmail = document.getElementById('info-email');
    if (infoEmail) infoEmail.textContent = user.email;

    // Update Top bar user info too (if exists on page)
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) userAvatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=guru_${user.id || 'nina'}`;

    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName) userDisplayName.textContent = user.name;
}
