import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize mock database seeds if empty
    storage.initDb();

    // Initialize teacher profile display
    const user = storage.getUser();
    if (user) {
        const welcomeTitle = document.getElementById('welcome-title');
        if (welcomeTitle) welcomeTitle.textContent = `Halo, ${user.name || 'Bu Nina'}!`;
        
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = user.name || 'Bu Nina';
        
        const dispRole = document.getElementById('user-display-role');
        if (dispRole) dispRole.textContent = (user.role || 'Guru').toUpperCase();
        
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=guru_${user.id || 'nina'}`;
    }

    // Set up logout binding (just in case)
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // Load and render teacher stats and activities
    loadAndRenderDashboard();
});

function loadAndRenderDashboard() {
    const classes = storage.getClasses();
    const materials = storage.getMaterials();
    const assignments = storage.getAssignments();
    const activities = storage.getActivities();

    // Filter math subjects (Bu Nina) for stats accuracy
    const kelasCount = classes.filter(c => c.teacher === 'Bu Nina').length || 1;
    const totalSiswa = 15; // mock total siswa
    const materiCount = materials.filter(m => m.classCode === 'mtk').length;
    const tugasCount = assignments.filter(t => t.classCode === 'mtk').length;

    // Render Stats
    document.getElementById('stat-kelas-count').textContent = kelasCount;
    document.getElementById('stat-siswa-count').textContent = totalSiswa;
    document.getElementById('stat-materi-count').textContent = materiCount;
    document.getElementById('stat-tugas-count').textContent = tugasCount;

    // Render recent class activities
    const activityContainer = document.getElementById('class-activities');
    if (activities.length === 0) {
        activityContainer.innerHTML = '<div class="empty-state">Tidak ada aktivitas kelas terbaru.</div>';
    } else {
        // Show up to 4 recent activities
        const recentActivities = activities.slice(0, 4);
        activityContainer.innerHTML = recentActivities.map(act => {
            let badgeClass = 'materi';
            let badgeLabel = 'Materi';
            if (act.type === 'check') {
                badgeClass = 'tugas';
                badgeLabel = 'Tugas';
            } else if (act.type === 'message') {
                badgeClass = 'pengumuman';
                badgeLabel = 'Diskusi';
            }

            return `
                <div class="activity-item">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span class="activity-badge ${badgeClass}">${badgeLabel}</span>
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #000000;">${act.title}</h4>
                            <p style="margin: 0; font-size: 0.85rem; color: #888888;">Kelas: ${act.classCode === 'mtk' ? 'Matematika' : 'Bahasa Inggris'}</p>
                        </div>
                    </div>
                    <span style="font-size: 0.85rem; color: #888888; font-weight: 500;">${act.time}</span>
                </div>
            `;
        }).join('');
    }
}
