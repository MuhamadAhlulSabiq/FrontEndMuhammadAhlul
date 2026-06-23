import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // DOM Elements
    const formSettings = document.getElementById('form-settings-full');
    const tabItems = document.querySelectorAll('.tab-nav-item');
    const mainContent = document.querySelector('.main-content');
    
    // Logo Upload Elements
    const logoUploadTrigger = document.getElementById('logo-upload-trigger');
    const fileLogoInput = document.getElementById('settings-school-logo');
    const logoPreviewWrapper = document.getElementById('logo-preview-wrapper');
    
    // Form Inputs
    const inputSchoolName = document.getElementById('settings-school-name');
    const inputSchoolAddress = document.getElementById('settings-school-address');
    const inputSchoolEmail = document.getElementById('settings-school-email');
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
    const btnEditProfil = document.getElementById('btn-edit-profil');

    // Local Variables
    let selectedLogoBase64 = null;
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
        
        inputSchoolName.value = settings.schoolName || 'SMA Negeri 1 Kita Bersama';
        inputSchoolAddress.value = settings.schoolAddress || 'Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan, 12110';
        inputSchoolEmail.value = settings.schoolEmail || 'info@sman1kita.sch.id';
        selectLanguage.value = settings.language || 'id';
        
        checkEmailNotif.checked = settings.emailNotifications !== false; // default to true
        checkPushNotif.checked = settings.pushNotifications === true; // default to false
        
        is2faEnabled = settings.twoFactorAuth === true;
        update2faBtnUI();

        if (settings.logoUrl) {
            selectedLogoBase64 = settings.logoUrl;
            logoPreviewWrapper.innerHTML = `<img src="${settings.logoUrl}" alt="Logo Sekolah" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
        } else {
            selectedLogoBase64 = null;
            logoPreviewWrapper.innerHTML = `
                <div class="logo-fallback-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                    </svg>
                </div>
            `;
        }

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
            let currentActiveSectionId = 'section-profil';
            
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

    // 4. Handle School Logo Upload Preview
    if (logoUploadTrigger && fileLogoInput) {
        logoUploadTrigger.addEventListener('click', () => {
            fileLogoInput.click();
        });
    }

    if (fileLogoInput) {
        fileLogoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Ukuran file maksimal 2MB!');
                    fileLogoInput.value = '';
                    return;
                }

                // Read and preview image
                const reader = new FileReader();
                reader.onload = (event) => {
                    selectedLogoBase64 = event.target.result;
                    logoPreviewWrapper.innerHTML = `<img src="${selectedLogoBase64}" alt="Logo Sekolah" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

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
        formChangePassword.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const oldPass = document.getElementById('password-old').value;
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

            // Save state of change password
            const settings = storage.getSettings();
            const dateStr = 'Terakhir diubah baru saja';
            settings.passwordLastChanged = dateStr;
            storage.updateSettings(settings);
            
            // Log in activity
            storage.addActivity({
                title: 'Mengubah password keamanan akun admin',
                time: 'Baru saja',
                type: 'system',
                classCode: 'general'
            });

            alert('Password berhasil diperbarui!');
            textPasswordLastChanged.textContent = dateStr;
            closeModal();
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

    // 8. Edit Profile Pencil Quick Scroll
    if (btnEditProfil) {
        btnEditProfil.addEventListener('click', () => {
            inputSchoolName.focus();
        });
    }

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
        formSettings.addEventListener('submit', (e) => {
            e.preventDefault();

            const schoolName = inputSchoolName.value.trim();
            const schoolAddress = inputSchoolAddress.value.trim();
            const schoolEmail = inputSchoolEmail.value.trim();
            const language = selectLanguage.value;
            const emailNotifications = checkEmailNotif.checked;
            const pushNotifications = checkPushNotif.checked;

            const existingSettings = storage.getSettings();

            const updatedSettings = {
                ...existingSettings,
                schoolName,
                schoolAddress,
                schoolEmail,
                language,
                emailNotifications,
                pushNotifications,
                twoFactorAuth: is2faEnabled,
                logoUrl: selectedLogoBase64
            };

            // Update local storage
            storage.updateSettings(updatedSettings);

            // Log activity in system
            storage.addActivity({
                title: 'Memperbarui pengaturan platform & profil sekolah',
                time: 'Baru saja',
                type: 'system',
                classCode: 'general'
            });

            alert('Pengaturan berhasil disimpan!');
            loadSettings();
        });
    }
});
