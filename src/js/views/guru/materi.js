import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

let activeSubject = 'semua';
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
    const modal = document.getElementById('modal-materi');
    const openModalBtn = document.getElementById('btn-tambah-materi');
    const closeModalBtn = document.getElementById('modal-materi-close');
    const cancelModalBtn = document.getElementById('btn-cancel-materi');
    const form = document.getElementById('form-tambah-materi');

    // Open Modal
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    // Close Modal helper
    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Form Submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('materi-title').value;
            const classCode = document.getElementById('materi-class').value;
            const docType = document.getElementById('materi-type').value;
            
            const classNameMap = {
                'mtk': 'Matematika - Kelas 5',
                'ing': 'Bahasa Inggris - Kelas 2'
            };

            const newMaterial = {
                id: Date.now(),
                title: title,
                subject: classNameMap[classCode] || 'Materi Umum',
                time: 'Baru saja',
                classCode: classCode,
                docType: docType
            };

            // Save to localStorage
            storage.addMaterial(newMaterial);

            // Add activity log
            storage.addActivity({
                title: `Mengunggah materi baru: ${title}`,
                time: 'Baru saja',
                type: 'materi',
                classCode: classCode
            });

            closeModal();
            loadAndRenderMaterials();
        });
    }

    // Tab buttons filtering
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeSubject = tab.dataset.subject;
            loadAndRenderMaterials();
        });
    });

    // Search input
    const searchInput = document.getElementById('search-materi');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            loadAndRenderMaterials();
        });
    }

    // Initial render
    loadAndRenderMaterials();
});

function loadAndRenderMaterials() {
    const materials = storage.getMaterials();
    const container = document.getElementById('materials-feed');

    if (!container) return;

    // Filter materials by tab
    let filtered = materials;
    if (activeSubject !== 'semua') {
        filtered = filtered.filter(m => m.classCode === activeSubject);
    }

    // Filter materials by search query
    if (searchQuery) {
        filtered = filtered.filter(m => 
            m.title.toLowerCase().includes(searchQuery) ||
            m.subject.toLowerCase().includes(searchQuery)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Tidak ada materi yang ditemukan.</div>';
        return;
    }

    container.innerHTML = filtered.map(m => `
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
