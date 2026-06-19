import { storage } from '../../../src/js/utils/storage.js';
import { authApi } from '../../../src/js/api/auth.js';

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

    // 3. Render Classroom Activities
    renderActivities([
        {
            title: 'Tugas Matematika dikumpulkan',
            time: '1 days ago',
            type: 'check',
            classCode: 'mtk'
        },
        {
            title: 'Diskusi baru di Bahasa Inggris',
            time: '2 days ago',
            type: 'message',
            classCode: 'ing'
        },
        {
            title: 'Materi Trigonometri',
            time: '3 days ago',
            type: 'math',
            classCode: 'mtk'
        }
    ]);

    // 4. Handle Join Class Form Submit
    const joinForm = document.getElementById('join-class-form');
    const mainPanel = document.getElementById('kelas-main-panel');
    const successPanel = document.getElementById('kelas-success-panel');
    const pageTitle = document.getElementById('page-main-title');
    const pageSubtitle = document.getElementById('page-main-subtitle');

    joinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('class-code-input').value;
        console.log(`Bergabung ke kelas dengan kode: ${code}`);

        // Transition to success state
        mainPanel.style.display = 'none';
        successPanel.style.display = 'block';
        
        // Temporarily adjust titles
        pageTitle.textContent = 'Bergabung Kelas';
        pageSubtitle.textContent = 'Konfirmasi status keanggotaan kelas Anda.';
    });

    // 5. Success Back Button
    document.getElementById('btn-success-back').addEventListener('click', () => {
        // Reset and show classes
        joinForm.reset();
        successPanel.style.display = 'none';
        mainPanel.style.display = 'block';

        pageTitle.textContent = 'Kelas Saya';
        pageSubtitle.textContent = 'Daftar kelas aktif yang Anda ikuti.';
    });
});

function renderActivities(list) {
    const container = document.getElementById('recent-classroom-activities');
    container.innerHTML = list.map(item => {
        let icon = '🔔';
        if (item.type === 'check') icon = '✓';
        if (item.type === 'message') icon = 'En';
        if (item.type === 'math') icon = '±';

        return `
            <div class="list-item">
                <div class="item-left">
                    <div class="item-icon-box ${item.classCode}" style="font-weight: bold; font-size: 1.2rem;">
                        ${icon}
                    </div>
                    <div class="item-details">
                        <h4 style="font-weight: 700; color: #000000;">${item.title}</h4>
                    </div>
                </div>
                <div class="item-right">
                    <span class="item-date">${item.time}</span>
                </div>
            </div>
        `;
    }).join('');
}
