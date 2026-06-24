import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

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
        editBtn.addEventListener('click', async () => {
            try {
                // Fetch fresh profile from API
                const response = await apiClient.get('/profile');
                const user = response.data || {};
                
                // Pre-fill inputs
                document.getElementById('edit-name').value = user.nama || user.name || '';
                document.getElementById('edit-username').value = user.username || '';
                document.getElementById('edit-email').value = user.email || '';
                
                // Reset password field
                const editPasswordInput = document.getElementById('edit-password');
                if (editPasswordInput) {
                    editPasswordInput.value = '';
                }

                // Class input is read-only
                const editClassInput = document.getElementById('edit-class');
                if (editClassInput) {
                    editClassInput.disabled = true;
                    // Try to get class name from info-class text
                    const infoClassEl = document.getElementById('info-class');
                    editClassInput.value = infoClassEl ? infoClassEl.textContent : '-';
                }

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
            const password = document.getElementById('edit-password').value;

            const payload = {
                nama: name,
                username: username,
                email: email
            };

            if (password && password.trim().length > 0) {
                payload.password = password;
            }

            try {
                const response = await apiClient.put('/profile', payload);

                if (response.success && response.data) {
                    const updatedUser = response.data;
                    
                    // Update LocalStorage user details cache
                    storage.setUser({
                        id: updatedUser.id,
                        name: updatedUser.nama,
                        username: updatedUser.username,
                        email: updatedUser.email,
                        role: updatedUser.role
                    });

                    alert('Profil berhasil diperbarui!');
                    await renderProfile();
                    modal.style.display = 'none';
                } else {
                    alert('Gagal memperbarui profil: ' + (response.message || 'Error tidak diketahui'));
                }
            } catch (err) {
                console.error(err);
                if (err.errors) {
                    const errMsg = Object.values(err.errors).flat().join('\n');
                    alert(`Gagal memperbarui profil:\n${errMsg}`);
                } else {
                    alert('Gagal menghubungi server untuk memperbarui profil.');
                }
            }
        });
    }
});

async function renderProfile() {
    let user = storage.getUser() || {};
    let firstClassTingkat = '-';

    try {
        // Fetch fresh profile and classes in parallel
        const [profileRes, classesRes] = await Promise.all([
            apiClient.get('/profile'),
            apiClient.get('/kelas')
        ]);

        if (profileRes.success && profileRes.data) {
            user = {
                id: profileRes.data.id,
                name: profileRes.data.nama,
                username: profileRes.data.username,
                email: profileRes.data.email,
                role: profileRes.data.role
            };
            // Keep local storage in sync
            storage.setUser(user);
        }

        if (classesRes.success && classesRes.data && classesRes.data.length > 0) {
            // Get tingkat from the first joined class
            firstClassTingkat = classesRes.data.map(c => c.tingkat).join(', ');
        }
    } catch (e) {
        console.warn('Gagal sinkronisasi data profil dari server:', e);
    }

    if (!user.name) return;

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
    if (infoClass) infoClass.textContent = firstClassTingkat;

    // Update Top bar user info too (if exists on page)
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) userAvatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;

    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName) userDisplayName.textContent = user.name;
}
