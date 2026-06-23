import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize teacher profile
    const user = storage.getUser();
    if (user) {
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = user.name || 'Bu Nina';
        
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=guru_${user.id || 'nina'}`;
    }

    // Modal elements
    const modal = document.getElementById('modal-announcement');
    const openModalBtn = document.getElementById('btn-tambah-announcement');
    const closeModalBtn = document.getElementById('modal-announcement-close');
    const cancelModalBtn = document.getElementById('btn-cancel-announcement');
    const form = document.getElementById('form-tambah-announcement');

    const openModal = () => {
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
    };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Form submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('announcement-title').value;
            const category = document.getElementById('announcement-category').value;
            const body = document.getElementById('announcement-body').value;

            const categoryClassMap = {
                'Penting': 'penting',
                'Kelas': 'kelas',
                'Umum': 'umum'
            };

            const newAnnouncement = {
                id: Date.now(),
                title: title,
                category: category,
                categoryClass: categoryClassMap[category] || 'umum',
                time: 'Baru saja',
                body: body
            };

            storage.addAnnouncement(newAnnouncement);

            // Add activity log
            storage.addActivity({
                title: `Membuat pengumuman baru: ${title}`,
                time: 'Baru saja',
                type: 'message',
                classCode: 'general'
            });

            closeModal();
            loadAndRenderAnnouncements();
        });
    }

    // Search input
    const searchInput = document.getElementById('search-announcement');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            loadAndRenderAnnouncements();
        });
    }

    // Initial render
    loadAndRenderAnnouncements();
});

function loadAndRenderAnnouncements() {
    const announcements = storage.getAnnouncements();
    const container = document.getElementById('announcements-feed');

    if (!container) return;

    // Filter announcements by search query
    let filtered = announcements;
    if (searchQuery) {
        filtered = filtered.filter(a => 
            a.title.toLowerCase().includes(searchQuery) ||
            a.body.toLowerCase().includes(searchQuery)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Tidak ada pengumuman yang ditemukan.</div>';
        return;
    }

    container.innerHTML = filtered.map(a => `
        <div class="list-item" style="flex-direction: column; align-items: flex-start; gap: 12px; cursor: default;">
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                <span class="badge-tag ${a.categoryClass}">${a.category}</span>
                <span class="item-date">${a.time}</span>
            </div>
            <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: #000000;">${a.title}</h3>
            <p style="margin: 0; font-size: 0.95rem; color: #475569; line-height: 1.6; font-weight: 500;">${a.body}</p>
        </div>
    `).join('');
}
