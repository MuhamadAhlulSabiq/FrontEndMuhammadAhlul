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

    const role = localStorage.getItem('elearning_role') || 'siswa';
    let menuItems = [];

    if (role === 'guru') {
        menuItems = [
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
                name: 'Kelas',
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
                name: 'Pengumpulan Tugas',
                href: 'pengumpulan.html',
                icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
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
    } else if (role === 'admin') {
        menuItems = [
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
                name: 'Manajemen Pengguna',
                href: 'manajemen-pengguna.html',
                icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    <path d="M21 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>`
            },
            {
                name: 'Pengaturan',
                href: 'pengaturan.html',
                icon: `<svg class="menu-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>`
            }
        ];
    } else {
        menuItems = [
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
    }

    const menuHtml = menuItems.map(item => {
        const isActive = filename === item.href;
        return `
            <a href="${item.href}" class="menu-item ${isActive ? 'active' : ''}">
                ${item.icon}
                <span>${item.name}</span>
            </a>
        `;
    }).join('');

    if (role === 'admin') {
        const user = JSON.parse(localStorage.getItem('elearning_user') || '{}');
        const nama = user.name || 'Admin Utama';
        const email = user.email || 'admin@sekolahkita.id';
        const initials = nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';

        container.innerHTML = `
            <div class="sidebar-header admin-header">
                <div class="logo-badge-container">
                    <svg class="logo-badge-svg" viewBox="0 0 24 24">
                        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                    </svg>
                </div>
                <div class="logo-text-container">
                    <span class="logo-title">Sekolah Kita</span>
                    <span class="logo-subtitle">E-Learning Admin</span>
                </div>
            </div>
            <nav class="sidebar-menu">
                ${menuHtml}
            </nav>
            <div class="sidebar-footer" style="display: flex; flex-direction: column; gap: 14px;">
                <div class="admin-footer" id="admin-profile-footer" style="border-top: none; padding-top: 0;">
                    <div class="admin-avatar-initials">${initials}</div>
                    <div class="admin-profile-details">
                        <span class="admin-profile-name">${nama}</span>
                        <span class="admin-profile-email">${email}</span>
                    </div>
                </div>
                <button id="btn-logout" class="btn-logout">
                    <svg style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; margin-right: 8px;" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    <span>Keluar</span>
                </button>
            </div>
        `;
    } else {
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
    }

    // Bind logout button click
    const logoutBtn = container.querySelector('#btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
                await authApi.logout();
            }
        });
    }
}
