import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

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

async function loadAndRenderDashboard() {
    try {
        // Fetch stats & lists in parallel
        const [classesRes, materialsRes, assignmentsRes, announcementsRes] = await Promise.all([
            apiClient.get('/kelas'),
            apiClient.get('/materi'),
            apiClient.get('/tugas'),
            apiClient.get('/pengumuman')
        ]);

        // Extract total counts (backend uses pagination, so counts are in meta.total)
        const classCount = classesRes.meta ? classesRes.meta.total : (classesRes.data ? classesRes.data.length : 0);
        const materialCount = materialsRes.meta ? materialsRes.meta.total : (materialsRes.data ? materialsRes.data.length : 0);
        const assignmentCount = assignmentsRes.data ? assignmentsRes.data.length : 0;
        const announcementCount = announcementsRes.meta ? announcementsRes.meta.total : (announcementsRes.data ? announcementsRes.data.length : 0);

        // Render stats count to DOM
        document.getElementById('stat-kelas-count').textContent = classCount;
        document.getElementById('stat-materi-count').textContent = materialCount;
        document.getElementById('stat-tugas-count').textContent = assignmentCount;
        document.getElementById('stat-announcement-count').textContent = announcementCount;

        // Render Classes Grid (Kelas Saya)
        const classes = classesRes.data || [];
        renderClassesGrid(classes);

        // Render Tugas Terbaru (Recent Tasks - slice top 2)
        const assignments = assignmentsRes.data || [];
        renderRecentTasks(assignments.slice(0, 2));

        // Render Pengumpulan Terbaru (Recent Submissions)
        await loadAndRenderRecentSubmissions(assignments);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Render error states to DOM containers
        document.getElementById('classes-grid-container').innerHTML = 
            '<div class="loading-state" style="color: #ef4444;">Gagal memuat daftar kelas dari server.</div>';
        document.getElementById('recent-tasks-container').innerHTML = 
            '<div class="loading-state" style="color: #ef4444;">Gagal memuat tugas terbaru.</div>';
        document.getElementById('recent-submissions-container').innerHTML = 
            '<div class="loading-state" style="color: #ef4444;">Gagal memuat pengumpulan terbaru.</div>';
    }
}

function renderClassesGrid(classes) {
    const classesContainer = document.getElementById('classes-grid-container');
    if (!classes || classes.length === 0) {
        classesContainer.innerHTML = '<div class="loading-state">Tidak ada kelas yang diampu.</div>';
        return;
    }

    const illustrations = ['puzzle', 'math', 'beaker', 'desk'];
    classesContainer.innerHTML = classes.map((c, index) => {
        let svgMarkup = '';
        const illustration = illustrations[index % 4];

        // Illustration matching mockup (puzzle, math, beaker, desk)
        if (illustration === 'puzzle') {
            svgMarkup = `
                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11.75 5.5H8.5a2 2 0 0 0-2 2v3.25a2.25 2.25 0 0 1-2.25 2.25h0a2.25 2.25 0 0 1 2.25 2.25v3.25a2 2 0 0 0 2 2h3.25a2.25 2.25 0 0 1 2.25 2.25v0a2.25 2.25 0 0 1 2.25-2.25h3.25a2 2 0 0 0 2-2v-3.25A2.25 2.25 0 0 1 20.25 13h0A2.25 2.25 0 0 1 18 10.75V7.5a2 2 0 0 0-2-2h-3.25a2.25 2.25 0 0 1-2.25-2.25v0a2.25 2.25 0 0 1-2.25 2.25Z" fill="#eff6ff"/>
                </svg>
            `;
        } else if (illustration === 'math') {
            svgMarkup = `
                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="4" fill="#dbeafe" stroke="#3b82f6"/>
                    <line x1="8" y1="9" x2="12" y2="9" stroke="#3b82f6" stroke-width="2"/>
                    <line x1="10" y1="7" x2="10" y2="11" stroke="#3b82f6" stroke-width="2"/>
                    <line x1="7" y1="14" x2="11" y2="18" stroke="#3b82f6" stroke-width="2"/>
                    <line x1="11" y1="14" x2="7" y2="18" stroke="#3b82f6" stroke-width="2"/>
                    <line x1="14" y1="9" x2="18" y2="9" stroke="#3b82f6" stroke-width="2"/>
                    <line x1="14" y1="15" x2="18" y2="15" stroke="#3b82f6" stroke-width="2"/>
                    <line x1="14" y1="17" x2="18" y2="17" stroke="#3b82f6" stroke-width="2"/>
                </svg>
            `;
        } else if (illustration === 'beaker') {
            svgMarkup = `
                <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 3h12" />
                    <path d="M14 3v6l6 9A2 2 0 0 1 18 21H6a2 2 0 0 1-2-2l6-9V3" fill="#e0f2fe"/>
                    <path d="M6.5 15h11" stroke="#0ea5e9" stroke-width="2" />
                    <path d="M5.5 18l1.5-2.25h10l1.5 2.25a1 1 0 0 1-1 1.25H6.5a1 1 0 0 1-1-1.25z" fill="#0ea5e9" opacity="0.6"/>
                </svg>
            `;
        } else {
            svgMarkup = `
                <svg viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 18V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12" fill="#fef9c3"/>
                    <path d="M4 10h16"/>
                    <path d="M8 10v8M16 10v8"/>
                    <circle cx="12" cy="7" r="1.5" fill="#ca8a04"/>
                </svg>
            `;
        }

        const gradeLabel = `Kelas ${c.tingkat || ''} ${c.jurusan || ''}`;

        return `
            <div class="class-card" onclick="window.location.href='kelas.html?id=${c.id}'">
                <div class="class-info-col">
                    <span class="class-subject-title">${c.nama_kelas}</span>
                    <span class="class-grade-label">${gradeLabel}</span>
                    <span class="class-student-count">${c.jumlah_siswa || 0} siswa</span>
                </div>
                <div class="class-illustration-icon">
                    ${svgMarkup}
                </div>
            </div>
        `;
    }).join('');
}

function renderRecentTasks(recentAssignments) {
    const tasksContainer = document.getElementById('recent-tasks-container');
    if (!recentAssignments || recentAssignments.length === 0) {
        tasksContainer.innerHTML = '<div class="loading-state">Tidak ada tugas terbaru.</div>';
        return;
    }

    function getClassCode(className) {
        if (!className) return 'pkn';
        const name = className.toLowerCase();
        if (name.includes('ing') || name.includes('english')) return 'ing';
        if (name.includes('mat') || name.includes('mtk')) return 'mtk';
        if (name.includes('ipa') || name.includes('sains') || name.includes('fis') || name.includes('kim') || name.includes('bio')) return 'ipa';
        return 'pkn';
    }

    tasksContainer.innerHTML = recentAssignments.map(task => {
        const className = task.kelas ? task.kelas.nama_kelas : 'Kelas';
        const classCode = getClassCode(className);
        
        let iconBgClass = 'math-icon-bg';
        let svgIcon = '';

        if (classCode === 'ing') {
            iconBgClass = 'english-icon-bg';
            svgIcon = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
            `;
        } else if (classCode === 'mtk') {
            iconBgClass = 'math-icon-bg';
            svgIcon = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
            `;
        } else if (classCode === 'ipa') {
            iconBgClass = 'science-icon-bg';
            svgIcon = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 3h12M14 3v6l6 9A2 2 0 0 1 18 21H6a2 2 0 0 1-2-2l6-9V3"/>
                </svg>
            `;
        } else {
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
                        <span class="recent-item-title">${task.judul}</span>
                        <span class="recent-item-subtitle">${task.deskripsi || 'Tugas Baru'} - ${className}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadAndRenderRecentSubmissions(assignments) {
    const submissionsContainer = document.getElementById('recent-submissions-container');
    if (!assignments || assignments.length === 0) {
        submissionsContainer.innerHTML = '<div class="loading-state">Tidak ada pengumpulan tugas terbaru.</div>';
        return;
    }

    try {
        // Fetch submissions for all tasks in parallel
        const submissionsPromises = assignments.map(task => 
            apiClient.get(`/pengumpulan/${task.id}`)
                .then(res => {
                    if (res.success && res.data) {
                        // Filter out empty submissions (id is null means not submitted)
                        return res.data
                            .filter(sub => sub.id !== null && sub.dikumpul_pada !== null)
                            .map(sub => ({
                                ...sub,
                                taskTitle: task.judul
                            }));
                    }
                    return [];
                })
                .catch(err => {
                    console.error(`Failed to fetch submissions for task ${task.id}:`, err);
                    return [];
                })
        );

        const results = await Promise.all(submissionsPromises);
        const allSubmitted = results.flat();

        if (allSubmitted.length === 0) {
            submissionsContainer.innerHTML = '<div class="loading-state">Tidak ada pengumpulan tugas terbaru.</div>';
            return;
        }

        // Sort by dikumpul_pada descending
        allSubmitted.sort((a, b) => new Date(b.dikumpul_pada) - new Date(a.dikumpul_pada));

        // Take top 2
        const recentSubmissions = allSubmitted.slice(0, 2);

        // Map submissions to HTML
        submissionsContainer.innerHTML = recentSubmissions.map(sub => {
            const studentName = sub.siswa ? sub.siswa.nama : 'Siswa';
            
            // Silhouette avatar inside a styled container matching figma
            const avatarHtml = `
                <div class="recent-student-avatar" style="display: flex; align-items: center; justify-content: center; background-color: #f3f4f6; color: #9ca3af;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
            `;

            return `
                <div class="recent-list-item" onclick="window.location.href='pengumpulan.html?tugas_id=${sub.tugas_id}'" style="cursor: pointer;">
                    <div class="recent-item-left">
                        ${avatarHtml}
                        <div class="recent-item-details">
                            <span class="recent-item-title">${studentName}</span>
                            <span class="recent-item-subtitle">${sub.taskTitle || 'Tugas Siswa'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading submissions:', error);
        submissionsContainer.innerHTML = '<div class="loading-state text-red-500">Gagal memuat pengumpulan terbaru.</div>';
    }
}
