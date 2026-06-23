import { authApi } from '../api/auth.js';

/**
 * Initializes the sidebar dynamically in the container with ID 'sidebar-container'.
 * Adds the active class based on the current page's filename.
 */
export function initSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    // Get current filename (e.g. dashboard.html)
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'dashboard.html';

    const menuItems = [
        {
            name: 'Dashboard',
            href: 'dashboard.html',
            icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="9" rx="1"/>
                <rect x="14" y="3" width="7" height="5" rx="1"/>
                <rect x="3" y="16" width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/>
            </svg>`
        },
        {
            name: 'Kelas Saya',
            href: 'kelas.html',
            icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>`
        },
        {
            name: 'Materi',
            href: 'materi.html',
            icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M8 16V8l4 4 4-4v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>`
        },
        {
            name: 'Tugas',
            href: 'tugas.html',
            icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M16 2v4M8 2v4M12 11h4M8 11h2M12 15h4M8 15h2"/>
            </svg>`
        },
        {
            name: 'Forum Diskusi',
            href: 'forum.html',
            icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>`
        },
        {
            name: 'Pengumuman',
            href: 'pengumuman.html',
            icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24">
                <path d="M12 7V3H2v18h20V7H12zm0 12H4V9h8v10zm8 0h-6v-6h6v6zm0-8h-6V9h6v2z"/>
            </svg>`
        },
        {
            name: 'Profil',
            href: 'profil.html',
            icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>`
        }
    ];

    const menuHtml = menuItems.map(item => {
        const isActive = filename === item.href;
        return `
            <a href="${item.href}" class="menu-item ${isActive ? 'active' : ''}">
                ${item.icon}
                <span>${item.name}</span>
            </a>
        `;
    }).join('');

    container.innerHTML = `
        <div class="sidebar-header">
            <svg class="logo-icon-svg" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
            <span class="logo-text">E-Learning<br>Platform</span>
        </div>
        <nav class="sidebar-menu">
            ${menuHtml}
        </nav>
        <div class="sidebar-footer">
            <button id="btn-logout" class="btn-logout">
                <svg style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; margin-right: 8px;" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                <span>Keluar</span>
            </button>
        </div>
    `;

    // Bind logout button click
    const logoutBtn = container.querySelector('#btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await authApi.logout();
        });
    }
}
