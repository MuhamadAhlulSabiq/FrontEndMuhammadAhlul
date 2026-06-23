import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Modal elements
    const modal = document.getElementById('modal-guru');
    const openModalBtn = document.getElementById('btn-tambah-guru');
    const closeModalBtn = document.getElementById('modal-guru-close');
    const cancelModalBtn = document.getElementById('btn-cancel-guru');
    const form = document.getElementById('form-tambah-guru');

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

    // Form submit - Tambah Guru
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('guru-name').value.trim();
            const username = document.getElementById('guru-username').value.trim();
            const email = document.getElementById('guru-email').value.trim();
            const phone = document.getElementById('guru-phone').value.trim();
            const subject = document.getElementById('guru-subject').value.trim();

            const newTeacher = {
                id: Date.now(),
                name: name,
                username: username,
                email: email,
                phone: phone,
                subject: subject
            };

            storage.addTeacher(newTeacher);

            // Add activity log
            storage.addActivity({
                title: `Menambahkan pengajar baru: ${name} (${subject})`,
                time: 'Baru saja',
                type: 'materi',
                classCode: 'general'
            });

            closeModal();
            loadAndRenderTeachers();
        });
    }

    // Search input
    const searchInput = document.getElementById('search-guru');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            loadAndRenderTeachers();
        });
    }

    // Initial render
    loadAndRenderTeachers();
});

function loadAndRenderTeachers() {
    const teachers = storage.getTeachers();
    const container = document.getElementById('teachers-list-feed');

    if (!container) return;

    // Filter teachers by search query
    let filtered = teachers;
    if (searchQuery) {
        filtered = filtered.filter(t => 
            t.name.toLowerCase().includes(searchQuery) ||
            t.subject.toLowerCase().includes(searchQuery) ||
            t.email.toLowerCase().includes(searchQuery)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">Tidak ada data guru yang ditemukan.</td>
            </tr>
        `;
        return;
    }

    container.innerHTML = filtered.map(t => `
        <tr>
            <td>
                <div class="teacher-meta-info">
                    <img class="teacher-avatar" src="https://api.dicebear.com/7.x/adventurer/svg?seed=guru_${t.id}" alt="Avatar">
                    <span class="teacher-name-txt">${t.name}</span>
                </div>
            </td>
            <td>@${t.username}</td>
            <td>${t.email}</td>
            <td>${t.phone || '-'}</td>
            <td><span class="subject-tag">${t.subject}</span></td>
            <td style="text-align: right;">
                <button class="btn-icon delete" data-id="${t.id}" title="Hapus Guru">
                    <!-- Trash icon SVG -->
                    <svg style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2;" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    // Attach click listeners to delete buttons
    container.querySelectorAll('.btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const teacherObj = teachers.find(t => t.id === id);
            
            if (confirm(`Apakah Anda yakin ingin menghapus data pengajar ${teacherObj ? teacherObj.name : ''}?`)) {
                storage.deleteTeacher(id);

                // Add activity log
                storage.addActivity({
                    title: `Menghapus pengajar: ${teacherObj ? teacherObj.name : 'Guru'}`,
                    time: 'Baru saja',
                    type: 'system',
                    classCode: 'general'
                });

                loadAndRenderTeachers();
            }
        });
    });
}
