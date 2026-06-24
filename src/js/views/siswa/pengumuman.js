import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

let globalAnnouncements = [];

document.addEventListener('DOMContentLoaded', async () => {
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

    // 3. Load announcements
    await loadAnnouncements();

    // 4. Real-time search filter
    const searchInput = document.getElementById('search-announcement');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderAnnouncementsFeed();
        });
    }
});

async function loadAnnouncements() {
    const container = document.getElementById('announcements-feed');
    if (!container) return;

    try {
        const response = await apiClient.get('/pengumuman');
        if (response.success && response.data) {
            globalAnnouncements = response.data;
            renderAnnouncementsFeed();
        } else {
            container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal memuat pengumuman.</div>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal menghubungkan ke server pengumuman.</div>';
    }
}

function renderAnnouncementsFeed() {
    const container = document.getElementById('announcements-feed');
    if (!container) return;
    
    // Get search query
    const searchInput = document.getElementById('search-announcement');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filter
    const filtered = globalAnnouncements.filter(p => 
        (p.judul && p.judul.toLowerCase().includes(query)) || 
        (p.isi && p.isi.toLowerCase().includes(query))
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
        const hasKelas = p.kelas !== null && p.kelas !== undefined;
        const isPenting = p.judul && p.judul.includes('[PENTING]');
        const categoryLabel = hasKelas ? `Kelas ${p.kelas.nama_kelas}` : (isPenting ? 'Penting' : 'Umum');
        const categoryClass = isPenting ? 'penting' : (hasKelas ? 'kelas' : 'umum');

        // Icon mapping based on category
        let icon = '📢';
        if (categoryClass === 'kelas') icon = '📘';
        if (categoryClass === 'umum') icon = '📅';

        // Format Date
        const formattedTime = p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Baru saja';

        return `
            <div class="list-item" style="align-items: flex-start; cursor: default; animation: fadeIn 0.3s ease;">
                <div class="item-left" style="align-items: flex-start;">
                    <div class="item-icon-box general" style="font-size: 1.35rem; width: 44px; height: 44px; margin-top: 4px; display: flex; align-items: center; justify-content: center;">
                        ${icon}
                    </div>
                    <div class="item-details">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
                            <span class="badge-tag ${categoryClass}">${categoryLabel}</span>
                            <h4 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #111827;">${p.judul}</h4>
                        </div>
                        <p style="color: #64748b; line-height: 1.5; font-size: 0.95rem; font-weight: 500; max-width: 700px;">${p.isi}</p>
                    </div>
                </div>
                <div class="item-right">
                    <span class="item-date" style="font-size: 0.85rem; color: #888888;">
                        ${formattedTime}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}
