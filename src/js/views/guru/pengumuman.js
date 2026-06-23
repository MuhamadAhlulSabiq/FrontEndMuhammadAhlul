import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize teacher profile
    const user = storage.getUser();
    if (user) {
        let displayName = user.name || 'Bu Nina';
        let cleanName = displayName.replace(/^Bu\s+/, '');
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = cleanName;
    }

    // Modal elements
    const modal = document.getElementById('modal-announcement');
    const openModalBtn = document.getElementById('btn-tambah-announcement');
    const closeModalBtn = document.getElementById('modal-announcement-close');
    const cancelModalBtn = document.getElementById('btn-cancel-announcement');
    const form = document.getElementById('form-tambah-announcement');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('btn-submit-announcement');

    const openModal = (mode = 'create', id = null) => {
        if (mode === 'edit' && id) {
            const announcements = storage.getAnnouncements();
            const a = announcements.find(item => item.id === Number(id));
            if (a) {
                document.getElementById('announcement-id').value = a.id;
                document.getElementById('announcement-title').value = a.title;
                document.getElementById('announcement-category').value = a.category;
                document.getElementById('announcement-body').value = a.body;

                if (modalTitle) modalTitle.textContent = 'Edit Pengumuman';
                if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';
                modal.style.display = 'flex';
            }
        } else {
            document.getElementById('announcement-id').value = '';
            form.reset();
            if (modalTitle) modalTitle.textContent = 'Buat Pengumuman Baru';
            if (submitBtn) submitBtn.textContent = 'Publikasikan';
            modal.style.display = 'flex';
        }
    };

    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
    };

    if (openModalBtn) openModalBtn.addEventListener('click', () => openModal('create'));
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Form submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const id = document.getElementById('announcement-id').value;
            const title = document.getElementById('announcement-title').value;
            const category = document.getElementById('announcement-category').value;
            const body = document.getElementById('announcement-body').value;

            const categoryClassMap = {
                'Penting': 'penting',
                'Kelas': 'kelas',
                'Umum': 'umum'
            };

            const now = new Date();
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
            const formattedTime = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
            const timeString = `${formattedDate}\n${formattedTime}`;

            if (id) {
                // Edit mode
                const updatedObj = {
                    title: title,
                    category: category,
                    categoryClass: categoryClassMap[category] || 'umum',
                    body: body
                };
                storage.updateAnnouncement(id, updatedObj);

                storage.addActivity({
                    title: `Mengubah pengumuman: "${title}"`,
                    time: 'Baru saja',
                    type: 'message',
                    classCode: 'general'
                });
            } else {
                // Create mode
                const newAnnouncement = {
                    id: Date.now(),
                    title: title,
                    category: category,
                    categoryClass: categoryClassMap[category] || 'umum',
                    time: timeString,
                    body: body
                };
                storage.addAnnouncement(newAnnouncement);

                storage.addActivity({
                    title: `Membuat pengumuman baru: "${title}"`,
                    time: 'Baru saja',
                    type: 'message',
                    classCode: 'general'
                });
            }

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

    // Helper function to bind actions in parent container
    window.openEditModal = (id) => openModal('edit', id);
    window.confirmDeleteAnnouncement = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
            storage.deleteAnnouncement(id);
            loadAndRenderAnnouncements();
        }
    };
});

function getAnnouncementIcon(categoryClass) {
    if (categoryClass === 'penting') {
        // Megaphone Icon
        return `
            <div class="announcement-icon-box penting">
                <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
            </div>
        `;
    } else if (categoryClass === 'kelas') {
        // Bookmark/ribbon Icon
        return `
            <div class="announcement-icon-box kelas">
                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
        `;
    } else {
        // Calendar/Umum Icon
        return `
            <div class="announcement-icon-box umum">
                <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <line x1="12" y1="14" x2="12" y2="18"></line>
                    <line x1="10" y1="16" x2="14" y2="16"></line>
                </svg>
            </div>
        `;
    }
}

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

    container.innerHTML = filtered.map(a => {
        const iconHtml = getAnnouncementIcon(a.categoryClass);
        return `
            <div class="announcement-card" style="animation: fadeIn 0.3s ease;">
                ${iconHtml}
                <div class="announcement-details">
                    <span class="announcement-category ${a.categoryClass}">${a.category}</span>
                    <h3 class="announcement-title">${a.title}</h3>
                    <p class="announcement-body-text">${a.body}</p>
                    <div class="announcement-actions">
                        <span class="action-btn-link edit" onclick="window.openEditModal(${a.id})">Edit</span>
                        <span class="action-btn-divider">|</span>
                        <span class="action-btn-link delete" onclick="window.confirmDeleteAnnouncement(${a.id})">Hapus</span>
                    </div>
                </div>
                <div class="announcement-date-box">${a.time}</div>
            </div>
        `;
    }).join('');
}
