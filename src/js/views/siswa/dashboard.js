import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

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

    // 3. Load dynamic dashboard data from API
    loadAndRenderDashboard();
});

async function loadAndRenderDashboard() {
    try {
        // Fetch stats in parallel
        const [classesRes, materialsRes, assignmentsRes, announcementsRes] = await Promise.all([
            apiClient.get('/kelas'),
            apiClient.get('/materi'),
            apiClient.get('/tugas'),
            apiClient.get('/pengumuman')
        ]);

        const classes = classesRes.data || [];
        const materials = materialsRes.data || [];
        const assignments = assignmentsRes.data || [];
        const announcements = announcementsRes.data || [];

        // Calculate pending assignments (where current student has not submitted yet)
        const pendingAssignments = assignments.filter(t => !t.pengumpulan || t.pengumpulan.length === 0);

        // Stats count
        const kelasCount = classes.length;
        const materiCount = materials.length;
        const tugasCount = pendingAssignments.length;
        const pengumumanCount = announcements.length;

        // Render Stats
        document.getElementById('stat-kelas-count').textContent = kelasCount;
        document.getElementById('stat-materi-count').textContent = materiCount;
        document.getElementById('stat-tugas-count').textContent = tugasCount;
        document.getElementById('stat-pengumuman-count').textContent = pengumumanCount;

        // Render 2 Recent Materials
        renderRecentMaterials(materials.slice(0, 2));

        // Render 2 Upcoming Assignments
        renderUpcomingAssignments(pendingAssignments.slice(0, 2));

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        document.getElementById('recent-materials').innerHTML = 
            '<div class="empty-state" style="color: #ef4444;">Gagal memuat materi terbaru dari server.</div>';
        document.getElementById('upcoming-assignments').innerHTML = 
            '<div class="empty-state" style="color: #ef4444;">Gagal memuat tugas terdekat dari server.</div>';
    }
}

function getClassCode(subjectName) {
    if (!subjectName) return 'pkn';
    const name = subjectName.toLowerCase();
    if (name.includes('ing') || name.includes('english')) return 'ing';
    if (name.includes('mat') || name.includes('mtk') || name.includes('hitung')) return 'mtk';
    if (name.includes('ipa') || name.includes('sains') || name.includes('fis') || name.includes('kim') || name.includes('bio')) return 'ipa';
    return 'pkn';
}

function renderRecentMaterials(recentMaterials) {
    const materiContainer = document.getElementById('recent-materials');
    if (!materiContainer) return;

    if (recentMaterials.length === 0) {
        materiContainer.innerHTML = '<div class="empty-state">Tidak ada materi terbaru.</div>';
        return;
    }

    materiContainer.innerHTML = recentMaterials.map(m => {
        const subjectName = m.mapel ? m.mapel.nama_mapel : 'Materi';
        const classCode = getClassCode(subjectName);
        const docType = m.tipe === 'gambar' ? 'Gambar' : 'PDF';

        // Format Date
        const dateObj = new Date(m.created_at);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const timeStr = isNaN(dateObj.getTime()) ? '-' : `${dateObj.getDate()} ${months[dateObj.getMonth()]}`;

        return `
            <div class="list-item" onclick="window.open('${m.file_url || '#'}', '_blank')" style="cursor: pointer;">
                <div class="item-left">
                    <div class="item-icon-box ${classCode}" style="display: flex; align-items: center; justify-content: center; font-weight: 800;">
                        ${classCode === 'mtk' ? '✕' : (classCode === 'ing' ? 'En' : (classCode === 'ipa' ? 'Sci' : 'Pkn'))}
                    </div>
                    <div class="item-details">
                        <h4 style="font-weight: 700; color: #111827;">${m.judul}</h4>
                        <p style="color: #64748b; font-size: 0.85rem; margin-top: 2px;">${subjectName}</p>
                    </div>
                </div>
                <div class="item-right">
                    <span class="badge-doc ${docType.toLowerCase()}">${docType}</span>
                    <span class="item-date" style="font-size: 0.85rem; color: #888888;">${timeStr}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderUpcomingAssignments(upcomingAssignments) {
    const tugasContainer = document.getElementById('upcoming-assignments');
    if (!tugasContainer) return;

    if (upcomingAssignments.length === 0) {
        tugasContainer.innerHTML = '<div class="empty-state">Tidak ada tugas terdekat.</div>';
        return;
    }

    tugasContainer.innerHTML = upcomingAssignments.map(t => {
        const subjectName = t.kelas ? t.kelas.nama_kelas : 'Tugas';
        const classCode = getClassCode(subjectName);

        // Format Deadline Date
        const deadlineDate = t.deadline ? new Date(t.deadline) : null;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const deadlineStr = deadlineDate && !isNaN(deadlineDate.getTime())
            ? `${deadlineDate.getDate()} ${months[deadlineDate.getMonth()]} ${deadlineDate.getFullYear()}, ${String(deadlineDate.getHours()).padStart(2, '0')}.${String(deadlineDate.getMinutes()).padStart(2, '0')}`
            : '-';

        return `
            <div class="list-item" onclick="window.location.href='tugas.html?id=${t.id}'" style="cursor: pointer;">
                <div class="item-left">
                    <div class="item-icon-box ${classCode}" style="display: flex; align-items: center; justify-content: center; font-weight: 800;">
                        ${classCode === 'mtk' ? '✕' : (classCode === 'ing' ? 'En' : (classCode === 'ipa' ? 'Sci' : 'Pkn'))}
                    </div>
                    <div class="item-details">
                        <h4 style="font-weight: 700; color: #111827;">${t.judul}</h4>
                        <p style="color: #64748b; font-size: 0.85rem; margin-top: 2px;">Deadline: ${deadlineStr}</p>
                    </div>
                </div>
                <div class="item-right">
                    <span class="item-date" style="color: #ef4444; font-weight: 700; font-size: 0.85rem;">Segera</span>
                </div>
            </div>
        `;
    }).join('');
}
