import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // DOM Elements
    const formSettings = document.getElementById('form-settings-full');
    const tabItems = document.querySelectorAll('.tab-nav-item');
    const mainContent = document.querySelector('.main-content');
    
    // Form Inputs
    const inputUsername = document.getElementById('settings-username');
    const selectLanguage = document.getElementById('settings-language');
    const checkEmailNotif = document.getElementById('settings-email-notif');
    const checkPushNotif = document.getElementById('settings-push-notif');
    
    // Password Modal Elements
    const modalPassword = document.getElementById('modal-password');
    const btnChangePassword = document.getElementById('btn-change-password');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const formChangePassword = document.getElementById('form-change-password');
    const textPasswordLastChanged = document.getElementById('password-last-changed');

    // Action Buttons
    const btnBackupNow = document.getElementById('btn-backup-now');
    const btn2faToggle = document.getElementById('btn-2fa-toggle');
    const btnCancelSettings = document.getElementById('btn-cancel-settings');

    // Local Variables
    let is2faEnabled = false;

    // 1. Load Username from Active Session
    const activeUser = storage.getUser();
    if (activeUser) {
        inputUsername.value = activeUser.username || 'admin_sekolah';
    } else {
        inputUsername.value = 'admin_sekolah';
    }

    // 2. Load & Render Settings from Local Storage
    const loadSettings = () => {
        const settings = storage.getSettings();
        
        selectLanguage.value = settings.language || 'id';

        if (settings.passwordLastChanged) {
            textPasswordLastChanged.textContent = settings.passwordLastChanged;
        } else {
            textPasswordLastChanged.textContent = 'Terakhir diubah 3 bulan yang lalu';
        }
    };

    // Initialize Settings values
    loadSettings();

    // 3. Tab Navigation & Smooth Scrolling
    tabItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active classes
            tabItems.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button
            item.classList.add('active');
            
            // Scroll smoothly to target section
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Optional Scroll Spy to highlight left tabs as page scrolls
    if (mainContent) {
        mainContent.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('.settings-section-card');
            let currentActiveSectionId = 'section-preferensi';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // If scroll is near the section top
                if (mainContent.scrollTop >= (sectionTop - 80)) {
                    currentActiveSectionId = section.getAttribute('id');
                }
            });
            
            tabItems.forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('data-target') === currentActiveSectionId) {
                    tab.classList.add('active');
                }
            });
        });
    }

    // Password Modal Handlers

    // 5. Change Password Modal Handlers
    if (btnChangePassword && modalPassword) {
        btnChangePassword.addEventListener('click', () => {
            modalPassword.style.display = 'flex';
        });
    }

    const closeModal = () => {
        modalPassword.style.display = 'none';
        formChangePassword.reset();
    };

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Close modal if clicked outside content
    window.addEventListener('click', (e) => {
        if (e.target === modalPassword) {
            closeModal();
        }
    });

    if (formChangePassword) {
        formChangePassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newPass = document.getElementById('password-new').value;
            const confirmPass = document.getElementById('password-confirm').value;

            if (newPass !== confirmPass) {
                alert('Konfirmasi password baru tidak cocok!');
                return;
            }

            if (newPass.length < 6) {
                alert('Password baru harus minimal 6 karakter!');
                return;
            }

            const activeUser = storage.getUser();
            if (!activeUser || !activeUser.id) {
                alert('Sesi admin tidak ditemukan. Silakan login kembali.');
                return;
            }

            try {
                // Perbarui password admin via API update user di backend
                await apiClient.put(`/admin/${activeUser.id}`, {
                    password: newPass
                });
                
                alert('Password admin berhasil diperbarui!');
                
                const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                const dateStr = `Terakhir diubah pada ${today}`;
                
                // Save state of change password
                const settings = storage.getSettings();
                settings.passwordLastChanged = dateStr;
                storage.updateSettings(settings);
                
                textPasswordLastChanged.textContent = dateStr;
                closeModal();
            } catch (err) {
                console.error(err);
                if (err.status === 422 && err.errors) {
                    const errorMessages = Object.values(err.errors).flat().join('\n');
                    alert(`Gagal mengubah password:\n${errorMessages}`);
                } else {
                    alert(`Gagal mengubah password: ${err.message}`);
                }
            }
        });
    }

    // 6. Handle Backup Simulation
    if (btnBackupNow) {
        btnBackupNow.addEventListener('click', () => {
            btnBackupNow.disabled = true;
            btnBackupNow.textContent = 'Sedang Mem-backup...';
            btnBackupNow.style.opacity = '0.7';

            setTimeout(() => {
                storage.addActivity({
                    title: 'Melakukan backup database sistem manual',
                    time: 'Baru saja',
                    type: 'system',
                    classCode: 'general'
                });
                
                alert('Backup berhasil! Seluruh berkas database telah diunggah ke server cloud.');
                btnBackupNow.disabled = false;
                btnBackupNow.textContent = 'Backup Sekarang';
                btnBackupNow.style.opacity = '1';
            }, 1800);
        });
    }

    // 7. Handle Two-Factor Auth Toggle
    function update2faBtnUI() {
        if (is2faEnabled) {
            btn2faToggle.textContent = 'Nonaktifkan 2FA';
            btn2faToggle.style.backgroundColor = '#fee2e2';
            btn2faToggle.style.color = '#ef4444';
            btn2faToggle.style.borderColor = '#fca5a5';
        } else {
            btn2faToggle.textContent = 'Aktifkan 2FA';
            btn2faToggle.style.backgroundColor = '#ffffff';
            btn2faToggle.style.color = '#475569';
            btn2faToggle.style.borderColor = '#cbd5e1';
        }
    }

    if (btn2faToggle) {
        btn2faToggle.addEventListener('click', () => {
            is2faEnabled = !is2faEnabled;
            update2faBtnUI();
            
            const message = is2faEnabled 
                ? 'Fitur Two-Factor Authentication berhasil diaktifkan!' 
                : 'Fitur Two-Factor Authentication berhasil dinonaktifkan!';
            
            alert(message);
        });
    }

    // 8. Edit Profile - Removed

    // 9. Cancel Settings Changes
    if (btnCancelSettings) {
        btnCancelSettings.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin membatalkan perubahan? Data yang belum disimpan akan dikembalikan.')) {
                loadSettings();
                alert('Perubahan dibatalkan.');
            }
        });
    }

    // 10. Submit Settings form
    if (formSettings) {
        formSettings.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = inputUsername.value.trim();
            const language = selectLanguage.value;
            const emailNotifications = checkEmailNotif.checked;
            const pushNotifications = checkPushNotif.checked;

            // Perbarui username admin di backend terlebih dahulu
            const activeUser = storage.getUser();
            if (activeUser && activeUser.id) {
                try {
                    await apiClient.put(`/admin/${activeUser.id}`, {
                        username: username
                    });
                    // Perbarui sesi local
                    activeUser.username = username;
                    storage.setUser(activeUser);
                } catch (err) {
                    console.error(err);
                    if (err.status === 422 && err.errors) {
                        const errorMessages = Object.values(err.errors).flat().join('\n');
                        alert(`Gagal memperbarui username admin:\n${errorMessages}`);
                        return;
                    } else {
                        alert(`Gagal memperbarui username admin: ${err.message}`);
                        return;
                    }
                }
            }

            const existingSettings = storage.getSettings();

            const updatedSettings = {
                ...existingSettings,
                language,
                emailNotifications,
                pushNotifications,
                twoFactorAuth: is2faEnabled
            };

            // Update local storage
            storage.updateSettings(updatedSettings);

            // Log activity in system
            storage.addActivity({
                title: 'Memperbarui pengaturan platform & preferensi akun',
                time: 'Baru saja',
                type: 'system',
                classCode: 'general'
            });

            alert('Pengaturan berhasil disimpan!');
            loadSettings();
        });
    }
});
