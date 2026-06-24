import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

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
        editBtn.addEventListener('click', async () => {
            try {
                // Fetch fresh profile from API
                const response = await apiClient.get('/profile');
                const user = response.data || {};
                
                // Pre-fill inputs
                document.getElementById('edit-name').value = user.nama || user.name || '';
                document.getElementById('edit-username').value = user.username || '';
                document.getElementById('edit-email').value = user.email || '';
                document.getElementById('edit-password').value = ''; // clear password input
                
                modal.style.display = 'flex';
            } catch (err) {
                console.error(err);
                alert('Gagal mengambil data profil terbaru.');
            }
        });
    }

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (editForm && modal) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('edit-name').value.trim();
            const username = document.getElementById('edit-username').value.trim();
            const email = document.getElementById('edit-email').value.trim();
            const password = document.getElementById('edit-password').value.trim();

            const payload = {
                nama: name,
                username,
                email
            };

            if (password) {
                payload.password = password;
            }

            try {
                const response = await apiClient.put('/profile', payload);

                if (response.success && response.data) {
                    const updatedUser = response.data;
                    
                    // Update LocalStorage user details
                    storage.setUser({
                        id: updatedUser.id,
                        name: updatedUser.nama,
                        username: updatedUser.username,
                        email: updatedUser.email,
                        role: updatedUser.role
                    });

                    alert('Profil berhasil diperbarui!');
                    renderProfile();
                    modal.style.display = 'none';
                }
            } catch (err) {
                console.error(err);
                let msg = err.message;
                if (err.errors) {
                    msg = Object.values(err.errors).flat().join('\n');
                }
                alert(`Gagal memperbarui profil:\n${msg}`);
            }
        });
    }
});

async function renderProfile() {
    // Attempt to load fresh data from API
    let user = storage.getUser() || {};
    try {
        const response = await apiClient.get('/profile');
        if (response.success && response.data) {
            user = {
                id: response.data.id,
                name: response.data.nama,
                username: response.data.username,
                email: response.data.email,
                role: response.data.role
            };
            // Keep local storage in sync
            storage.setUser(user);
        }
    } catch (e) {
        console.warn('Gagal memuat profil fresh dari server, fallback ke local storage:', e);
    }

    if (!user.name) return;

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
