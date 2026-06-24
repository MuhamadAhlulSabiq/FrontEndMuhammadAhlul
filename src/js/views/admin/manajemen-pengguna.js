import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // DOM Elements
    const form = document.getElementById('form-add-guru');
    const nameInput = document.getElementById('nama-lengkap');
    const emailInput = document.getElementById('email-institusi');
    const toggleAutoEmail = document.getElementById('toggle-auto-email');
    const emailPreviewHint = document.getElementById('email-preview-hint');
    const btnCancel = document.getElementById('btn-cancel-form');
    
    const fileInput = document.getElementById('file-photo-profile');
    const btnBrowse = document.getElementById('btn-browse-file');
    const avatarPlaceholder = document.querySelector('.avatar-circle-placeholder');

    let selectedAvatarDataUrl = null;

    // Email Auto-generator helper
    const generateEmail = (fullName) => {
        if (!fullName) return 'nama.guru@sekolahkita.sch.id';
        // Clean name: lowercase, trim, replace spaces and special chars with dot
        const cleanName = fullName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s]/g, '') // remove special chars
            .replace(/\s+/g, '.');       // spaces to dots
        return `${cleanName}@sekolahkita.sch.id`;
    };

    // Update Email Institution field based on Name and Auto-generate status
    const updateEmailField = () => {
        if (toggleAutoEmail && toggleAutoEmail.checked) {
            const email = generateEmail(nameInput.value);
            emailInput.value = email;
            emailPreviewHint.textContent = email;
            emailInput.readOnly = true;
            emailInput.style.backgroundColor = '#f8fafc'; // light gray bg to show readonly
        } else {
            emailInput.readOnly = false;
            emailInput.style.backgroundColor = '#ffffff';
        }
    };

    // Listen to changes in Name input
    if (nameInput) {
        nameInput.addEventListener('input', updateEmailField);
    }

    // Listen to changes in Auto-email Toggle switch
    if (toggleAutoEmail) {
        toggleAutoEmail.addEventListener('change', updateEmailField);
    }

    // Initialize state
    updateEmailField();

    // File upload triggers
    if (btnBrowse && fileInput) {
        btnBrowse.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Ukuran file maksimal 2MB!');
                    fileInput.value = ''; // clear input
                    return;
                }

                // Show preview using FileReader
                const reader = new FileReader();
                reader.onload = (event) => {
                    selectedAvatarDataUrl = event.target.result;
                    avatarPlaceholder.innerHTML = `<img src="${selectedAvatarDataUrl}" alt="Preview Foto" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle Cancel Button Click
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin membatalkan pendaftaran? Data yang telah diisi akan hilang.')) {
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Handle Form Submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const passwordDefault = 'Password123'; // Password default untuk guru baru
            const username = email.split('@')[0];

            try {
                // Panggil API backend untuk menyimpan user baru
                await apiClient.post('/admin', {
                    nama: name,
                    username: username,
                    email: email,
                    password: passwordDefault,
                    role: 'guru'
                });

                alert(`Data pengajar ${name} berhasil disimpan di database! Password default: ${passwordDefault}`);
                window.location.href = 'dashboard.html';

            } catch (err) {
                console.error(err);
                if (err.status === 422 && err.errors) {
                    const errorMessages = Object.values(err.errors).flat().join('\n');
                    alert(`Gagal menyimpan pengajar:\n${errorMessages}`);
                } else {
                    alert(`Terjadi kesalahan: ${err.message}`);
                }
            }
        });
    }
});
