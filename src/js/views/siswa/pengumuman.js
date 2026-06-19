import { storage } from '../../../src/js/utils/storage.js';
import { authApi } from '../../../src/js/api/auth.js';

const PENGUMUMAN_DATABASE = [
    {
        id: 1,
        title: 'Libur Hari Raya Idul Fitri 1445 H',
        tag: 'PENTING',
        tagCode: 'penting',
        icon: '📢',
        desc: 'Diberitahukan kepada seluruh siswa bahwa libur hari raya Idul Fitri 1445 H akan dimulai pada tanggal 17 Juni 2026...',
        date: '20 Juni 2026',
        time: '10.30'
    },
    {
        id: 2,
        title: 'Perubahan Jadwal Pelajaran Kelas 5',
        tag: 'KELAS',
        tagCode: 'kelas',
        icon: '📘',
        desc: 'Sehubungan dengan adanya kegiatan sekolah, berikut perubahan jadwal pelajaran untuk kelas 5....',
        date: '18 Juni 2026',
        time: '08.15'
    },
    {
        id: 3,
        title: 'Pengumuman Penerimaan Raport',
        tag: 'UMUM',
        tagCode: 'umum',
        icon: '📅',
        desc: 'Pengambilan raport semester genap akan dilaksanakan pada tanggal 2 Agustus 2026 di ruang kelas masing-masing dan......',
        date: '17 Juni 2026',
        time: '14.20'
    },
    {
        id: 4,
        title: 'Pengumpulan Tugas Proyek',
        tag: 'KELAS',
        tagCode: 'kelas',
        icon: '📘',
        desc: 'Jangan lupa untuk mengumpulkan tugas sebelum batas waktu yang telah ditentukan.....',
        date: '15 Juni 2026',
        time: '11.45'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize user info display
    const user = storage.getUser();
    if (user) {
        document.getElementById('user-display-name').textContent = user.name || 'Rohmat';
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;
    }

    // 2. Set up logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // 3. Initial Render
    renderAnnouncements(PENGUMUMAN_DATABASE);

    // 4. Real-time search filter
    const searchInput = document.getElementById('search-announcement');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        const filtered = PENGUMUMAN_DATABASE.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.desc.toLowerCase().includes(query) || 
            p.tag.toLowerCase().includes(query)
        );

        renderAnnouncements(filtered);
    });
});

function renderAnnouncements(list) {
    const container = document.getElementById('announcements-feed');
    
    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔍</span>
                <p>Pengumuman tidak ditemukan.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(p => `
        <div class="list-item" style="align-items: flex-start; cursor: default;">
            <div class="item-left" style="align-items: flex-start;">
                <div class="item-icon-box general" style="font-size: 1.35rem; width: 44px; height: 44px; margin-top: 4px;">
                    ${p.icon}
                </div>
                <div class="item-details">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
                        <span class="badge-tag ${p.tagCode}">${p.tag}</span>
                        <h4 style="margin: 0; font-size: 1.15rem; font-weight: 800;">${p.title}</h4>
                    </div>
                    <p style="color: #64748b; line-height: 1.5; font-size: 0.95rem; font-weight: 500; max-width: 700px;">${p.desc}</p>
                </div>
            </div>
            <div class="item-right">
                <span class="item-date" style="font-size: 0.85rem; color: #888888;">
                    ${p.date}<br>${p.time}
                </span>
            </div>
        </div>
    `).join('');
}
