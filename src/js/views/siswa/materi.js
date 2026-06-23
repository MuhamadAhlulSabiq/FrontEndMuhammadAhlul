import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';

let activeSubjectFilter = 'semua';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize mock database
    storage.initDb();

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

    // 3. Initial rendering (default is 'semua')
    renderMaterials();

    // 4. Tab filtering listener
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');

            // Set filter key and render
            activeSubjectFilter = tab.dataset.subject;
            renderMaterials();
        });
    });
});

function renderMaterials() {
    const container = document.getElementById('materials-feed');
    if (!container) return;

    // Load from localStorage
    const allMaterials = storage.getMaterials();

    // Filter list based on selected tab subject code
    const filtered = allMaterials.filter(m => {
        if (activeSubjectFilter === 'semua') return true;
        return m.classCode === activeSubjectFilter;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📂</span>
                <p>Tidak ada materi tersedia untuk kategori ini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(m => `
        <div class="list-item" style="animation: fadeIn 0.3s ease;">
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
