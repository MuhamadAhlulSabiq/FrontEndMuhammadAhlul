import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize mock database seeds if empty
    storage.initDb();

    // Initialize admin profile display
    const user = storage.getUser();
    if (user) {
        const welcomeTitle = document.getElementById('welcome-title');
        if (welcomeTitle) welcomeTitle.textContent = `Halo, ${user.name || 'Administrator'}!`;
        
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = user.name || 'Admin';
        
        const dispRole = document.getElementById('user-display-role');
        if (dispRole) dispRole.textContent = (user.role || 'Admin').toUpperCase();
        
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=admin_${user.id || 'seed'}`;
    }

    // Set up logout binding
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // Load and render stats and system logs
    loadAndRenderDashboard();
});

function loadAndRenderDashboard() {
    const teachers = storage.getTeachers();
    const classes = storage.getClasses();
    const materials = storage.getMaterials();
    const activities = storage.getActivities();

    // Render Stats
    document.getElementById('stat-teachers-count').textContent = teachers.length;
    document.getElementById('stat-students-count').textContent = 15; // mock student count
    document.getElementById('stat-classes-count').textContent = classes.length;
    document.getElementById('stat-materials-count').textContent = materials.length;

    // Render System Logs (based on activities feed)
    const logsContainer = document.getElementById('system-logs');
    if (activities.length === 0) {
        logsContainer.innerHTML = '<div class="empty-state">Tidak ada log aktivitas sistem terbaru.</div>';
    } else {
        // Show up to 4 recent activities as logs
        const recentLogs = activities.slice(0, 4);
        logsContainer.innerHTML = recentLogs.map((act, index) => {
            let badgeClass = 'info';
            let badgeLabel = 'SISTEM';

            if (act.type === 'check') {
                badgeClass = 'success';
                badgeLabel = 'TUGAS';
            } else if (act.type === 'materi') {
                badgeClass = 'success';
                badgeLabel = 'MATERI';
            } else if (act.type === 'message') {
                badgeClass = 'warn';
                badgeLabel = 'DISKUSI';
            }

            return `
                <div class="log-item">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span class="log-badge ${badgeClass}">${badgeLabel}</span>
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a;">${act.title}</h4>
                            <p style="margin: 0; font-size: 0.85rem; color: #64748b;">Event ID: LOG-00${index + 101}</p>
                        </div>
                    </div>
                    <span style="font-size: 0.85rem; color: #64748b; font-weight: 500;">${act.time}</span>
                </div>
            `;
        }).join('');
    }
}
