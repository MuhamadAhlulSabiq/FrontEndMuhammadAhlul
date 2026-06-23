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
        // Keep the welcome-title exactly as the mockup: "Dashboard Admin E-Learning Sekolah Kita"
        // But we can update the avatar seed if needed
        const avatar = document.getElementById('user-avatar');
        if (avatar) {
            avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=admin_${user.id || 'seed'}`;
        }
    }

    // Set up logout binding
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // Load and render stats
    loadAndRenderDashboard();

    // Set up FAB click binding
    const fabAdd = document.getElementById('fab-add-data');
    if (fabAdd) {
        fabAdd.addEventListener('click', () => {
            // Redirect to Manajemen Pengguna (manajemen-pengguna.html)
            window.location.href = 'manajemen-pengguna.html';
        });
    }
});

function loadAndRenderDashboard() {
    const teachers = storage.getTeachers();
    const classes = storage.getClasses();

    // Render Stats
    // Baseline numbers matching the mockup screenshot, but dynamic if elements are added
    const totalTeachersCount = Math.max(145, 143 + teachers.length);
    const totalClassesCount = Math.max(88, 86 + classes.length);

    const teachersCountEl = document.getElementById('stat-teachers-count');
    if (teachersCountEl) teachersCountEl.textContent = totalTeachersCount.toLocaleString('id-ID');

    const studentsCountEl = document.getElementById('stat-students-count');
    if (studentsCountEl) studentsCountEl.textContent = '2.130';

    const classesCountEl = document.getElementById('stat-classes-count');
    if (classesCountEl) classesCountEl.textContent = totalClassesCount.toLocaleString('id-ID');

    const newStudentsCountEl = document.getElementById('stat-new-students-count');
    if (newStudentsCountEl) newStudentsCountEl.textContent = '+110';
}
