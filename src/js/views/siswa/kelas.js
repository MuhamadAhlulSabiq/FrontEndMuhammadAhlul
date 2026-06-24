import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // 1. Initialize user info display
    const user = storage.getUser();
    if (user) {
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = user.name || 'Rohmat';
        
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;
    }

    // 2. Set up logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // 3. Render Classroom data dynamically
    renderClassesGrid();
    renderActivitiesFeed();

    // 4. Toggle Gabung Kelas Panel
    const toggleJoinBtn = document.getElementById('btn-toggle-join-class');
    const joinBox = document.querySelector('.gabung-kelas-box');
    if (toggleJoinBtn && joinBox) {
        toggleJoinBtn.addEventListener('click', () => {
            const isHidden = joinBox.style.display === 'none';
            joinBox.style.display = isHidden ? 'block' : 'none';
            toggleJoinBtn.innerHTML = isHidden ? `
                <svg style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.5;" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Batal
            ` : `
                <svg style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.5;" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Gabung Kelas Baru
            `;
            if (isHidden) {
                document.getElementById('class-code-input').focus();
            }
        });
    }

    // 5. Handle Join Class Form Submit
    const joinForm = document.getElementById('join-class-form');
    const mainPanel = document.getElementById('kelas-main-panel');
    const successPanel = document.getElementById('kelas-success-panel');
    const pageTitle = document.getElementById('page-main-title');
    const pageSubtitle = document.getElementById('page-main-subtitle');

    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const codeInput = document.getElementById('class-code-input').value.trim();
            const classId = parseInt(codeInput);

            if (isNaN(classId)) {
                alert('Kode kelas harus berupa angka (ID kelas).');
                return;
            }

            try {
                const response = await apiClient.post('/kelas/join', {
                    kelas_id: classId
                });

                if (response.success && response.data) {
                    const joinedClass = response.data;
                    
                    // Set success details
                    const successClassEl = document.getElementById('success-class-name');
                    if (successClassEl) successClassEl.textContent = joinedClass.nama_kelas;

                    // Transition to success state
                    mainPanel.style.display = 'none';
                    successPanel.style.display = 'block';
                    
                    if (pageTitle) pageTitle.textContent = 'Bergabung Kelas';
                    if (pageSubtitle) pageSubtitle.textContent = 'Konfirmasi status keanggotaan kelas Anda.';
                } else {
                    alert(response.message || 'Gagal bergabung ke kelas.');
                }
            } catch (err) {
                console.error(err);
                alert(err.message || 'Terjadi kesalahan saat bergabung ke kelas. Pastikan kode kelas benar.');
            }
        });
    }

    // 6. Success Back Button
    const successBackBtn = document.getElementById('btn-success-back');
    if (successBackBtn) {
        successBackBtn.addEventListener('click', () => {
            // Reset and show classes
            if (joinForm) joinForm.reset();
            if (joinBox) {
                joinBox.style.display = 'none';
                if (toggleJoinBtn) {
                    toggleJoinBtn.innerHTML = `
                        <svg style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.5;" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Gabung Kelas Baru
                    `;
                }
            }
            successPanel.style.display = 'none';
            mainPanel.style.display = 'block';

            if (pageTitle) pageTitle.textContent = 'Kelas Saya';
            if (pageSubtitle) pageSubtitle.textContent = 'Daftar kelas aktif yang Anda ikuti.';

            // Re-render
            renderClassesGrid();
            renderActivitiesFeed();
        });
    }
});

async function renderClassesGrid() {
    const container = document.getElementById('class-grid-container');
    if (!container) return;

    try {
        const response = await apiClient.get('/kelas');
        const classes = response.data || [];

        if (classes.length === 0) {
            container.innerHTML = '<div class="empty-state">Anda belum bergabung ke kelas mana pun.</div>';
            return;
        }

        container.innerHTML = classes.map(c => {
            let illustration = '';
            const subjectLower = c.jurusan ? c.jurusan.toLowerCase() : '';

            if (subjectLower.includes('mat') || subjectLower.includes('mtk') || subjectLower.includes('hitung')) {
                illustration = `
                    <svg viewBox="0 0 200 120" width="100%" height="100%">
                        <rect x="20" y="80" width="16" height="30" fill="#93c5fd" rx="2"/>
                        <rect x="44" y="65" width="16" height="45" fill="#60a5fa" rx="2"/>
                        <rect x="68" y="50" width="16" height="60" fill="#3b82f6" rx="2"/>
                        <rect x="92" y="35" width="16" height="75" fill="#2563eb" rx="2"/>
                        <rect x="116" y="20" width="16" height="90" fill="#1d4ed8" rx="2"/>
                        <rect x="140" y="5" width="16" height="105" fill="#1e3a8a" rx="2"/>
                        <path d="M22 90 L 52 70 L 82 55 L 112 30 L 148 10" fill="none" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round"/>
                        <path d="M138 10 L 148 10 L 148 20" fill="none" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round"/>
                    </svg>
                `;
            } else if (subjectLower.includes('ing') || subjectLower.includes('english')) {
                illustration = `
                    <svg viewBox="0 0 200 120" width="100%" height="100%">
                        <rect x="10" y="10" width="120" height="70" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
                        <rect x="15" y="15" width="110" height="60" fill="#1e3a8a"/>
                        <line x1="12" y1="80" x2="128" y2="80" stroke="#cbd5e1" stroke-width="3"/>
                        <circle cx="110" cy="30" r="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
                        <rect x="25" y="45" width="40" height="25" fill="#fef08a" opacity="0.1"/>
                        <path d="M140 110c3-18 12-25 24-25s21 7 24 25z" fill="#f43f5e"/>
                        <circle cx="164" cy="74" r="10" fill="#fee2e2"/>
                        <path d="M152 70c2-7 8-10 15-8s10 8 7 15z" fill="#1e1b4b"/>
                        <line x1="152" y1="90" x2="125" y2="65" stroke="#fee2e2" stroke-width="3" stroke-linecap="round"/>
                        <line x1="125" y1="65" x2="98" y2="45" stroke="#d97706" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                `;
            } else {
                // Science flask illustration
                illustration = `
                    <svg viewBox="0 0 200 120" width="100%" height="100%">
                        <path d="M85 20 h30 v25 l22 45 a8 8 0 0 1 -7 12 h-60 a8 8 0 0 1 -7 -12 l22 -45 z" fill="#dbeafe" stroke="#1552C6" stroke-width="3"/>
                        <path d="M68 85 h64 l-12 -22 h-40 z" fill="#3b82f6" opacity="0.8"/>
                        <circle cx="100" cy="45" r="4" fill="#ffffff"/>
                        <circle cx="108" cy="62" r="5" fill="#ffffff"/>
                        <circle cx="92" cy="72" r="3" fill="#ffffff"/>
                    </svg>
                `;
            }

            return `
                <div class="class-card" onclick="window.location.href='materi.html?class_id=${c.id}'" style="cursor: pointer;">
                    <div class="class-card-header">
                        <h3 class="class-card-title">${c.nama_kelas}</h3>
                    </div>
                    <div class="class-card-illustration">
                        ${illustration}
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal memuat daftar kelas.</div>';
    }
}

async function renderActivitiesFeed() {
    const container = document.getElementById('recent-classroom-activities');
    if (!container) return;

    try {
        const response = await apiClient.get('/notifikasi');
        const list = response.data || [];

        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state">Belum ada aktivitas terbaru.</div>';
            return;
        }

        container.innerHTML = list.map(item => {
            let icon = '🔔';
            if (item.tipe === 'Tugas') icon = '📝';
            if (item.tipe === 'Forum') icon = '💬';
            if (item.tipe === 'Info') icon = '✓';

            // Format date time
            const dateObj = new Date(item.created_at);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            const timeStr = isNaN(dateObj.getTime()) ? 'Baru saja' : `${dateObj.getDate()} ${months[dateObj.getMonth()]}`;

            return `
                <div class="list-item" style="animation: fadeIn 0.3s ease;">
                    <div class="item-left">
                        <div class="item-icon-box general" style="font-weight: bold; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">
                            ${icon}
                        </div>
                        <div class="item-details">
                            <h4 style="font-weight: 700; color: #000000;">${item.judul}</h4>
                            <p style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">${item.pesan}</p>
                        </div>
                    </div>
                    <div class="item-right">
                        <span class="item-date">${timeStr}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal memuat aktivitas kelas.</div>';
    }
}
