import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';

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

    // 3. Initial Render
    renderAnnouncementsFeed();

    // 4. Real-time search filter
    const searchInput = document.getElementById('search-announcement');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderAnnouncementsFeed();
        });
    }
});

function renderAnnouncementsFeed() {
    const container = document.getElementById('announcements-feed');
    if (!container) return;

    // Load from localStorage
    const announcements = storage.getAnnouncements();
    
    // Get search query
    const searchInput = document.getElementById('search-announcement');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filter
    const filtered = announcements.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.body.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔍</span>
                <p>Pengumuman tidak ditemukan.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(p => {
        // Icon mapping based on category
        let icon = '📢';
        if (p.categoryClass === 'kelas') icon = '📘';
        if (p.categoryClass === 'umum') icon = '📅';

        return `
            <div class="list-item" style="align-items: flex-start; cursor: default; animation: fadeIn 0.3s ease;">
                <div class="item-left" style="align-items: flex-start;">
                    <div class="item-icon-box general" style="font-size: 1.35rem; width: 44px; height: 44px; margin-top: 4px;">
                        ${icon}
                    </div>
                    <div class="item-details">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
                            <span class="badge-tag ${p.categoryClass}">${p.category}</span>
                            <h4 style="margin: 0; font-size: 1.15rem; font-weight: 800;">${p.title}</h4>
                        </div>
                        <p style="color: #64748b; line-height: 1.5; font-size: 0.95rem; font-weight: 500; max-width: 700px;">${p.body}</p>
                    </div>
                </div>
                <div class="item-right">
                    <span class="item-date" style="font-size: 0.85rem; color: #888888;">
                        ${p.time}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}
