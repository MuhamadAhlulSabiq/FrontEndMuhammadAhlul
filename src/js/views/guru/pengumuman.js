import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

let searchQuery = '';
let globalClasses = [];

document.addEventListener('DOMContentLoaded', async () => {
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

    // Load classes to populate dropdown list in modal
    try {
        const resKelas = await apiClient.get('/kelas');
        globalClasses = resKelas.data || [];
        const classSelect = document.getElementById('announcement-class');
        if (classSelect) {
            classSelect.innerHTML = '<option value="">Pilih Kelas</option>' + 
                globalClasses.map(c => `<option value="${c.id}">${c.nama_kelas}</option>`).join('');
        }
    } catch (e) {
        console.error('Gagal mengambil daftar kelas untuk pengumuman:', e);
    }

    // Modal elements
    const modal = document.getElementById('modal-announcement');
    const openModalBtn = document.getElementById('btn-tambah-announcement');
    const closeModalBtn = document.getElementById('modal-announcement-close');
    const cancelModalBtn = document.getElementById('btn-cancel-announcement');
    const form = document.getElementById('form-tambah-announcement');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('btn-submit-announcement');

    const categorySelect = document.getElementById('announcement-category');
    const groupClassSelect = document.getElementById('group-announcement-class');
    const classSelect = document.getElementById('announcement-class');

    // Show/hide class select based on category selection
    if (categorySelect && groupClassSelect) {
        categorySelect.addEventListener('change', () => {
            if (categorySelect.value === 'Kelas') {
                groupClassSelect.style.display = 'block';
                classSelect.setAttribute('required', 'true');
            } else {
                groupClassSelect.style.display = 'none';
                classSelect.removeAttribute('required');
                classSelect.value = '';
            }
        });
    }

    const openModal = async (mode = 'create', id = null) => {
        if (mode === 'edit' && id) {
            try {
                const res = await apiClient.get('/pengumuman');
                const list = res.data || [];
                const a = list.find(item => item.id === Number(id));
                if (a) {
                    document.getElementById('announcement-id').value = a.id;
                    document.getElementById('announcement-title').value = a.judul;
                    document.getElementById('announcement-body').value = a.isi;

                    if (a.kelas_id) {
                        categorySelect.value = 'Kelas';
                        groupClassSelect.style.display = 'block';
                        classSelect.value = a.kelas_id;
                        classSelect.setAttribute('required', 'true');
                    } else if (a.judul.includes('[PENTING]')) {
                        categorySelect.value = 'Penting';
                        groupClassSelect.style.display = 'none';
                        classSelect.value = '';
                        classSelect.removeAttribute('required');
                    } else {
                        categorySelect.value = 'Umum';
                        groupClassSelect.style.display = 'none';
                        classSelect.value = '';
                        classSelect.removeAttribute('required');
                    }

                    if (modalTitle) modalTitle.textContent = 'Edit Pengumuman';
                    if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';
                    modal.style.display = 'flex';
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            document.getElementById('announcement-id').value = '';
            form.reset();
            if (groupClassSelect) groupClassSelect.style.display = 'none';
            if (classSelect) {
                classSelect.removeAttribute('required');
                classSelect.value = '';
            }
            if (modalTitle) modalTitle.textContent = 'Buat Pengumuman Baru';
            if (submitBtn) submitBtn.textContent = 'Publikasikan';
            modal.style.display = 'flex';
        }
    };

    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
        if (groupClassSelect) groupClassSelect.style.display = 'none';
    };

    if (openModalBtn) openModalBtn.addEventListener('click', () => openModal('create'));
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('announcement-id').value;
            let title = document.getElementById('announcement-title').value.trim();
            const category = categorySelect.value;
            const body = document.getElementById('announcement-body').value.trim();
            const kelasId = classSelect.value;

            // Determine if category maps to a kelas_id or is general (null)
            let targetKelasId = (category === 'Kelas' && kelasId) ? parseInt(kelasId) : null;

            // If category is Penting, prepend tag to title
            if (category === 'Penting' && !title.includes('[PENTING]')) {
                title = `[PENTING] ${title}`;
            }

            try {
                if (id) {
                    // Edit mode
                    await apiClient.put(`/pengumuman/${id}`, {
                        judul: title,
                        isi: body,
                        kelas_id: targetKelasId
                    });
                    alert('Pengumuman berhasil diperbarui!');
                } else {
                    // Create mode
                    await apiClient.post('/pengumuman', {
                        judul: title,
                        isi: body,
                        kelas_id: targetKelasId
                    });
                    alert('Pengumuman berhasil dipublikasikan!');
                }

                closeModal();
                loadAndRenderAnnouncements();
            } catch (err) {
                console.error(err);
                let msg = err.message;
                if (err.errors) {
                    msg = Object.values(err.errors).flat().join('\n');
                }
                alert(`Gagal menyimpan pengumuman:\n${msg}`);
            }
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
    window.confirmDeleteAnnouncement = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
            try {
                await apiClient.delete(`/pengumuman/${id}`);
                alert('Pengumuman berhasil dihapus!');
                loadAndRenderAnnouncements();
            } catch (err) {
                console.error(err);
                alert(`Gagal menghapus pengumuman: ${err.message}`);
            }
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

async function loadAndRenderAnnouncements() {
    const container = document.getElementById('announcements-feed');
    if (!container) return;

    try {
        const response = await apiClient.get('/pengumuman');
        const announcements = response.data || [];

        // Filter announcements by search query
        let filtered = announcements;
        if (searchQuery) {
            filtered = filtered.filter(a => 
                (a.judul && a.judul.toLowerCase().includes(searchQuery)) ||
                (a.isi && a.isi.toLowerCase().includes(searchQuery))
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">Tidak ada pengumuman yang ditemukan.</div>';
            return;
        }

        container.innerHTML = filtered.map(a => {
            const hasKelas = a.kelas !== null && a.kelas !== undefined;
            const categoryLabel = hasKelas ? `Kelas ${a.kelas.nama_kelas}` : (a.judul.includes('[PENTING]') ? 'Penting' : 'Umum');
            const categoryClass = a.judul.includes('[PENTING]') ? 'penting' : (hasKelas ? 'kelas' : 'umum');

            const iconHtml = getAnnouncementIcon(categoryClass);

            const formattedTime = a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Baru saja';

            return `
                <div class="announcement-card" style="animation: fadeIn 0.3s ease;">
                    ${iconHtml}
                    <div class="announcement-details">
                        <span class="announcement-category ${categoryClass}">${categoryLabel}</span>
                        <h3 class="announcement-title">${a.judul}</h3>
                        <p class="announcement-body-text">${a.isi}</p>
                        <div class="announcement-actions">
                            <span class="action-btn-link edit" onclick="window.openEditModal(${a.id})">Edit</span>
                            <span class="action-btn-divider">|</span>
                            <span class="action-btn-link delete" onclick="window.confirmDeleteAnnouncement(${a.id})">Hapus</span>
                        </div>
                    </div>
                    <div class="announcement-date-box">${formattedTime}</div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Gagal mengambil pengumuman:', err);
        container.innerHTML = '<div class="empty-state">Gagal memuat pengumuman dari server.</div>';
    }
}
