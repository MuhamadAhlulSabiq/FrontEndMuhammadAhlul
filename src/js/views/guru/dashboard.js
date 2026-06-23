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
        let displayName = user.name || 'Bu Nina';
        // Strip "Bu" prefix to display "Nina" as shown in figma mockup
        let cleanName = displayName.replace(/^Bu\s+/, '');

        const welcomeTitle = document.getElementById('welcome-title');
        if (welcomeTitle) welcomeTitle.textContent = `Halo, ${cleanName}! 👋`;

        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = cleanName;

        const dispRole = document.getElementById('user-display-role');
        if (dispRole) dispRole.textContent = 'Guru';
    }

    // Load and render teacher stats, classes and activities
    loadAndRenderDashboard();
});

function loadAndRenderDashboard() {
    const classes = storage.getClasses();
    const materials = storage.getMaterials();
    const assignments = storage.getAssignments();
    const announcements = storage.getAnnouncements();
    const submissions = storage.getSubmissions();

    // 1. Render stats counts
    const classCount = classes.length;
    const materialCount = materials.length;
    const assignmentCount = assignments.length;
    const announcementCount = announcements.length;

    document.getElementById('stat-kelas-count').textContent = classCount;
    document.getElementById('stat-materi-count').textContent = materialCount;
    document.getElementById('stat-tugas-count').textContent = assignmentCount;
    document.getElementById('stat-announcement-count').textContent = announcementCount;

    // 2. Render Classes Grid (Kelas Saya)
    const classesContainer = document.getElementById('classes-grid-container');
    if (!classes || classes.length === 0) {
        classesContainer.innerHTML = '<div class="loading-state">Tidak ada kelas yang diampu.</div>';
    } else {
        classesContainer.innerHTML = classes.map(c => {
            let svgMarkup = '';

            // Illustration matching mockup (puzzle, math, beaker, desk)
            if (c.illustration === 'puzzle') {
                svgMarkup = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11.75 5.5H8.5a2 2 0 0 0-2 2v3.25a2.25 2.25 0 0 1-2.25 2.25h0a2.25 2.25 0 0 1 2.25 2.25v3.25a2 2 0 0 0 2 2h3.25a2.25 2.25 0 0 1 2.25 2.25v0a2.25 2.25 0 0 1 2.25-2.25h3.25a2 2 0 0 0 2-2v-3.25A2.25 2.25 0 0 1 20.25 13h0A2.25 2.25 0 0 1 18 10.75V7.5a2 2 0 0 0-2-2h-3.25a2.25 2.25 0 0 1-2.25-2.25v0a2.25 2.25 0 0 1-2.25 2.25Z" fill="#eff6ff"/>
                    </svg>
                `;
            } else if (c.illustration === 'math') {
                svgMarkup = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="4" fill="#dbeafe" stroke="#3b82f6"/>
                        <!-- plus -->
                        <line x1="8" y1="9" x2="12" y2="9" stroke="#3b82f6" stroke-width="2"/>
                        <line x1="10" y1="7" x2="10" y2="11" stroke="#3b82f6" stroke-width="2"/>
                        <!-- multiply -->
                        <line x1="7" y1="14" x2="11" y2="18" stroke="#3b82f6" stroke-width="2"/>
                        <line x1="11" y1="14" x2="7" y2="18" stroke="#3b82f6" stroke-width="2"/>
                        <!-- minus -->
                        <line x1="14" y1="9" x2="18" y2="9" stroke="#3b82f6" stroke-width="2"/>
                        <!-- divide / equals -->
                        <line x1="14" y1="15" x2="18" y2="15" stroke="#3b82f6" stroke-width="2"/>
                        <line x1="14" y1="17" x2="18" y2="17" stroke="#3b82f6" stroke-width="2"/>
                    </svg>
                `;
            } else if (c.illustration === 'beaker') {
                svgMarkup = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 3h12" />
                        <path d="M14 3v6l6 9A2 2 0 0 1 18 21H6a2 2 0 0 1-2-2l6-9V3" fill="#e0f2fe"/>
                        <path d="M6.5 15h11" stroke="#0ea5e9" stroke-width="2" />
                        <path d="M5.5 18l1.5-2.25h10l1.5 2.25a1 1 0 0 1-1 1.25H6.5a1 1 0 0 1-1-1.25z" fill="#0ea5e9" opacity="0.6"/>
                    </svg>
                `;
            } else { // desk or chair
                svgMarkup = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 18V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12" fill="#fef9c3"/>
                        <path d="M4 10h16"/>
                        <path d="M8 10v8M16 10v8"/>
                        <circle cx="12" cy="7" r="1.5" fill="#ca8a04"/>
                    </svg>
                `;
            }

            return `
                <div class="class-card" onclick="window.location.href='kelas.html?code=${c.code}'">
                    <div class="class-info-col">
                        <span class="class-subject-title">${c.title}</span>
                        <span class="class-grade-label">${c.grade || 'Kelas'}</span>
                        <span class="class-student-count">${c.studentsCount || 0} siswa</span>
                    </div>
                    <div class="class-illustration-icon">
                        ${svgMarkup}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 3. Render Tugas Terbaru
    const tasksContainer = document.getElementById('recent-tasks-container');
    if (!assignments || assignments.length === 0) {
        tasksContainer.innerHTML = '<div class="loading-state">Tidak ada tugas terbaru.</div>';
    } else {
        // Take the first 2 assignments to match figma
        const recentAssignments = assignments.slice(0, 2);
        tasksContainer.innerHTML = recentAssignments.map(task => {
            let iconBgClass = 'math-icon-bg';
            let svgIcon = '';

            if (task.classCode === 'ing') {
                iconBgClass = 'english-icon-bg';
                svgIcon = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                `;
            } else if (task.classCode === 'mtk') {
                iconBgClass = 'math-icon-bg';
                svgIcon = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                `;
            } else if (task.classCode === 'ipa') {
                iconBgClass = 'science-icon-bg';
                svgIcon = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 3h12M14 3v6l6 9A2 2 0 0 1 18 21H6a2 2 0 0 1-2-2l6-9V3"/>
                    </svg>
                `;
            } else { // pkn
                iconBgClass = 'pkn-icon-bg';
                svgIcon = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                `;
            }

            return `
                <div class="recent-list-item" onclick="window.location.href='tugas.html?id=${task.id}'" style="cursor: pointer;">
                    <div class="recent-item-left">
                        <div class="recent-icon-square ${iconBgClass}">
                            ${svgIcon}
                        </div>
                        <div class="recent-item-details">
                            <span class="recent-item-title">${task.title}</span>
                            <span class="recent-item-subtitle">${task.desc || 'Tugas Baru'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 4. Render Pengumpulan Terbaru
    const submissionsContainer = document.getElementById('recent-submissions-container');
    if (!submissions || submissions.length === 0) {
        submissionsContainer.innerHTML = '<div class="loading-state">Tidak ada pengumpulan tugas terbaru.</div>';
    } else {
        // Take the first 2 submissions to match figma
        const recentSubmissions = submissions.slice(0, 2);
        submissionsContainer.innerHTML = recentSubmissions.map(sub => {
            return `
                <div class="recent-list-item" onclick="window.location.href='tugas.html'" style="cursor: pointer;">
                    <div class="recent-item-left">
                        <img src="${sub.studentAvatar}" alt="${sub.studentName}" class="recent-student-avatar">
                        <div class="recent-item-details">
                            <span class="recent-item-title">${sub.studentName}</span>
                            <span class="recent-item-subtitle">${sub.taskTitle || 'Tugas Siswa'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}
