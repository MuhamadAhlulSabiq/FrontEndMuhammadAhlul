import { storage } from '../../../src/js/utils/storage.js';
import { authApi } from '../../../src/js/api/auth.js';

const MATERIALS_DATABASE = {
    semua: [
        {
            title: 'Sistem Persamaan Kuadrat',
            subject: 'Matematika - Kelas 5',
            time: '2 hari yang lalu',
            classCode: 'mtk',
            docType: 'PDF'
        },
        {
            title: 'Hobbies',
            subject: 'Bahasa Inggris - Kelas 2',
            time: '3 hari yang lalu',
            classCode: 'ing',
            docType: 'PPT'
        },
        {
            title: 'Pecahan',
            subject: 'Matematika - Kelas 5',
            time: '4 hari yang lalu',
            classCode: 'mtk',
            docType: 'PDF'
        },
        {
            title: 'My Family',
            subject: 'Bahasa Inggris - Kelas 2',
            time: '5 hari yang lalu',
            classCode: 'ing',
            docType: 'PPT'
        }
    ],
    mtk: [
        {
            title: 'Sistem Persamaan Kuadrat',
            subject: 'Matematika - Kelas 5',
            time: '2 hari yang lalu',
            classCode: 'mtk',
            docType: 'PDF'
        },
        {
            title: 'Bilangan Bulat',
            subject: 'Matematika - Kelas 5',
            time: '3 hari yang lalu',
            classCode: 'mtk',
            docType: 'PPT'
        },
        {
            title: 'Pecahan',
            subject: 'Matematika - Kelas 5',
            time: '4 hari yang lalu',
            classCode: 'mtk',
            docType: 'PDF'
        },
        {
            title: 'Geometri dan Pengukuran',
            subject: 'Matematika - Kelas 5',
            time: '5 hari yang lalu',
            classCode: 'mtk',
            docType: 'PPT'
        }
    ],
    ing: [
        {
            title: 'Numbers & Colors',
            subject: 'Bahasa Inggris - Kelas 2',
            time: '2 hari yang lalu',
            classCode: 'ing',
            docType: 'PDF'
        },
        {
            title: 'Hobbies',
            subject: 'Bahasa Inggris - Kelas 2',
            time: '3 hari yang lalu',
            classCode: 'ing',
            docType: 'PPT'
        },
        {
            title: 'Things in the Classroom',
            subject: 'Bahasa Inggris - Kelas 2',
            time: '4 hari yang lalu',
            classCode: 'ing',
            docType: 'PDF'
        },
        {
            title: 'My Family',
            subject: 'Bahasa Inggris - Kelas 2',
            time: '5 hari yang lalu',
            classCode: 'ing',
            docType: 'PPT'
        }
    ]
};

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

    // 3. Initial rendering (default is 'semua')
    renderMaterials('semua');

    // 4. Tab filtering listener
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');

            // Render matching list
            const subjectKey = tab.dataset.subject;
            renderMaterials(subjectKey);
        });
    });
});

function renderMaterials(key) {
    const container = document.getElementById('materials-feed');
    const items = MATERIALS_DATABASE[key] || [];

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📂</span>
                <p>Tidak ada materi tersedia untuk kategori ini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(m => `
        <div class="list-item">
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
}
