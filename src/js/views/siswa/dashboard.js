import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize mock database
    storage.initDb();

    // 1. Initialize user info display
    const user = storage.getUser();
    if (user) {
        const welcomeTitle = document.getElementById('welcome-title');
        if (welcomeTitle) welcomeTitle.textContent = `Halo, ${user.name || 'Rohmat'}!`;
        
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = user.name || 'Rohmat';
        
        const dispRole = document.getElementById('user-display-role');
        if (dispRole) dispRole.textContent = (user.role || 'Siswa').toUpperCase();
        
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;
    }

    // 2. Set up logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // 3. Load dynamic dashboard data from localStorage
    loadAndRenderDashboard();
});

function loadAndRenderDashboard() {
    const classes = storage.getClasses();
    const materials = storage.getMaterials();
    const assignments = storage.getAssignments();
    const announcements = storage.getAnnouncements();

    // Calculate dynamic stats
    const kelasCount = classes.length;
    const materiCount = materials.length;
    const pendingAssignments = assignments.filter(t => t.status === 'belum');
    const tugasCount = pendingAssignments.length;
    const pengumumanCount = announcements.length;

    // Render Stats
    document.getElementById('stat-kelas-count').textContent = kelasCount;
    document.getElementById('stat-materi-count').textContent = materiCount;
    document.getElementById('stat-tugas-count').textContent = tugasCount;
    document.getElementById('stat-pengumuman-count').textContent = pengumumanCount;

    // Render 2 Recent Materials
    const recentMaterials = materials.slice(0, 2);
    const materiContainer = document.getElementById('recent-materials');
    
    if (recentMaterials.length === 0) {
        materiContainer.innerHTML = '<div class="empty-state">Tidak ada materi terbaru.</div>';
    } else {
        materiContainer.innerHTML = recentMaterials.map(m => `
            <div class="list-item" onclick="window.location.href='materi.html'">
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

    // Render 2 Upcoming Assignments
    const upcomingAssignments = pendingAssignments.slice(0, 2);
    const tugasContainer = document.getElementById('upcoming-assignments');
    
    if (upcomingAssignments.length === 0) {
        tugasContainer.innerHTML = '<div class="empty-state">Tidak ada tugas terdekat.</div>';
    } else {
        tugasContainer.innerHTML = upcomingAssignments.map(t => `
            <div class="list-item" onclick="window.location.href='tugas.html'">
                <div class="item-left">
                    <div class="item-icon-box ${t.classCode}">
                        ${t.classCode === 'mtk' ? '✕' : 'En'}
                    </div>
                    <div class="item-details">
                        <h4>${t.title}</h4>
                        <p>Deadline: ${t.deadline}</p>
                    </div>
                </div>
                <div class="item-right">
                    <span class="item-date" style="color: #ef4444; font-weight: 700;">Segera</span>
                </div>
            </div>
        `).join('');
    }
}
