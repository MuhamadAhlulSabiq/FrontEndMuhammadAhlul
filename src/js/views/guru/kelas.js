import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

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
    const modal = document.getElementById('modal-kelas');
    const openModalBtn = document.getElementById('btn-tambah-kelas');
    const closeModalBtn = document.getElementById('modal-kelas-close');
    const cancelModalBtn = document.getElementById('btn-cancel-kelas');
    const form = document.getElementById('form-tambah-kelas');

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

            const title = document.getElementById('kelas-title').value;
            const code = document.getElementById('kelas-code').value.toLowerCase().trim();
            const subject = document.getElementById('kelas-subject').value;
            const illustration = document.getElementById('kelas-illustration').value;

            const newClass = {
                id: Date.now(),
                title: title,
                code: code,
                teacher: user ? user.name : 'Bu Nina',
                subject: subject,
                illustration: illustration
            };

            storage.addClass(newClass);

            // Add activity log
            storage.addActivity({
                title: `Membuat kelas baru: ${title}`,
                time: 'Baru saja',
                type: 'materi',
                classCode: code
            });

            closeModal();
            loadAndRenderClasses();
        });
    }

    // Initial render
    loadAndRenderClasses();
});

function loadAndRenderClasses() {
    const classes = storage.getClasses();
    const container = document.getElementById('class-grid-container');

    if (!container) return;

    if (classes.length === 0) {
        container.innerHTML = '<div class="empty-state">Belum ada kelas yang diampu.</div>';
        return;
    }

    container.innerHTML = classes.map(c => {
        let illustrationSvg = '';

        if (c.illustration === 'chart') {
            illustrationSvg = `
                <svg viewBox="0 0 200 120" width="100%" height="100%">
                    <rect x="20" y="80" width="16" height="30" fill="#a7f3d0" rx="2"/>
                    <rect x="44" y="65" width="16" height="45" fill="#6ee7b7" rx="2"/>
                    <rect x="68" y="50" width="16" height="60" fill="#34d399" rx="2"/>
                    <rect x="92" y="35" width="16" height="75" fill="#10b981" rx="2"/>
                    <rect x="116" y="20" width="16" height="90" fill="#059669" rx="2"/>
                    <rect x="140" y="5" width="16" height="105" fill="#065f46" rx="2"/>
                    <path d="M22 90 L 52 70 L 82 55 L 112 30 L 148 10" fill="none" stroke="#059669" stroke-width="4" stroke-linecap="round"/>
                    <path d="M138 10 L 148 10 L 148 20" fill="none" stroke="#059669" stroke-width="4" stroke-linecap="round"/>
                </svg>
            `;
        } else if (c.illustration === 'board') {
            illustrationSvg = `
                <svg viewBox="0 0 200 120" width="100%" height="100%">
                    <rect x="10" y="10" width="180" height="90" fill="#065f46" rx="6" stroke="#047857" stroke-width="6"/>
                    <rect x="70" y="100" width="60" height="15" fill="#a1a1aa" rx="2"/>
                    <text x="30" y="55" fill="#ffffff" font-size="16" font-family="Inter" font-weight="bold">ABC English Class</text>
                    <line x1="20" y1="85" x2="180" y2="85" stroke="#047857" stroke-width="2"/>
                </svg>
            `;
        } else if (c.illustration === 'lab') {
            illustrationSvg = `
                <svg viewBox="0 0 200 120" width="100%" height="100%">
                    <path d="M70 100 L 90 40 L 90 20 L 110 20 L 110 40 L 130 100 Z" fill="none" stroke="#10b981" stroke-width="4" stroke-linejoin="round"/>
                    <path d="M75 90 L 125 90" fill="none" stroke="#059669" stroke-width="4"/>
                    <circle cx="100" cy="70" r="10" fill="#34d399"/>
                    <line x1="85" y1="40" x2="115" y2="40" stroke="#10b981" stroke-width="2"/>
                </svg>
            `;
        } else {
            illustrationSvg = `
                <svg viewBox="0 0 200 120" width="100%" height="100%">
                    <rect x="40" y="20" width="120" height="80" fill="#ffffff" rx="6" stroke="#10b981" stroke-width="4"/>
                    <line x1="100" y1="20" x2="100" y2="100" stroke="#10b981" stroke-width="2"/>
                    <circle cx="70" cy="60" r="15" fill="#a7f3d0"/>
                    <circle cx="130" cy="60" r="15" fill="#d1fae5"/>
                </svg>
            `;
        }

        return `
            <div class="class-card">
                <div class="class-card-header">
                    <h3 class="class-card-title">${c.title}</h3>
                    <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #888888; font-weight: 500;">Guru: ${c.teacher} | Kode: ${c.code.toUpperCase()}</p>
                </div>
                <div class="class-card-illustration">
                    ${illustrationSvg}
                </div>
            </div>
        `;
    }).join('');
}
