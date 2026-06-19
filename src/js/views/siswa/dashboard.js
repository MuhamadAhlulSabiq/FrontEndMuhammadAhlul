import { storage } from '../../../src/js/utils/storage.js';
import { authApi } from '../../../src/js/api/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize user info display
    const user = storage.getUser();
    if (user) {
        document.getElementById('welcome-title').textContent = `Halo, ${user.name || 'Rohmat'}!`;
        document.getElementById('user-display-name').textContent = user.name || 'Rohmat';
        document.getElementById('user-display-role').textContent = (user.role || 'Siswa').toUpperCase();
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;
    }

    // 2. Set up logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // 3. Render exact mockup data for Dashboard
    renderDashboard({
        stats: {
            kelasCount: 2,
            materiCount: 10,
            tugasCount: 5,
            pengumumanCount: 2
        },
        materiTerbaru: [
            {
                id: 1,
                title: 'Sistem Persamaan Kuadrat',
                subject: 'Matematika - Kelas 5',
                time: '2 hari yang lalu',
                classCode: 'mtk',
                docType: 'PDF'
            },
            {
                id: 2,
                title: 'Hobbies',
                subject: 'Bahasa Inggris - Kelas 2',
                time: '3 hari yang lalu',
                classCode: 'ing',
                docType: 'PPT'
            }
        ],
        tugasTerdekat: [
            {
                id: 10,
                title: 'Tugas Matematika',
                date: '25 Mei 2026',
                classCode: 'mtk'
            },
            {
                id: 11,
                title: 'Tugas Bahasa Inggris',
                date: '24 Mei 2026',
                classCode: 'ing'
            }
        ]
    });
});

function renderDashboard(data) {
    // Stats count
    document.getElementById('stat-kelas-count').textContent = data.stats.kelasCount;
    document.getElementById('stat-materi-count').textContent = data.stats.materiCount;
    document.getElementById('stat-tugas-count').textContent = data.stats.tugasCount;
    document.getElementById('stat-pengumuman-count').textContent = data.stats.pengumumanCount;

    // Render Materi Terbaru
    const materiContainer = document.getElementById('recent-materials');
    materiContainer.innerHTML = data.materiTerbaru.map(m => `
        <div class="list-item" onclick="window.location.href='materi.html'">
            <div class="item-left">
                <div class="item-icon-box ${m.classCode}">
                    ${m.classCode === 'mtk' ? '✕' : 'En'}
                </div>
                <div class="item-details">
                    <h4>${m.title}</h4>
                    <p>${m.subject}</p>
                </div>
            </div>
            <div class="item-right">
                <span class="badge-doc ${m.docType.toLowerCase()}">${m.docType}</span>
                <span class="item-date">${m.time}</span>
            </div>
        </div>
    `).join('');

    // Render Tugas Terdekat
    const tugasContainer = document.getElementById('upcoming-assignments');
    tugasContainer.innerHTML = data.tugasTerdekat.map(t => `
        <div class="list-item" onclick="window.location.href='tugas.html'">
            <div class="item-left">
                <div class="item-icon-box ${t.classCode}">
                    ${t.classCode === 'mtk' ? '✕' : 'En'}
                </div>
                <div class="item-details">
                    <h4>${t.title}</h4>
                    <p>Deadline: ${t.date}</p>
                </div>
            </div>
            <div class="item-right">
                <span class="item-date" style="color: #ef4444; font-weight: 700;">Segera</span>
            </div>
        </div>
    `).join('');
}
