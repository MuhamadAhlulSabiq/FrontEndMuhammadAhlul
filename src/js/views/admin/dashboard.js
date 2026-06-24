import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize mock database seeds if empty
    storage.initDb();

    // Initialize admin profile display
    const user = storage.getUser();
    if (user) {
        // Keep the welcome-title exactly as the mockup: "Dashboard Admin E-Learning Sekolah Kita"
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

async function loadAndRenderDashboard() {
    try {
        // 1. Ambil data Guru secara riil
        const responseGuru = await apiClient.get('/admin?role=guru');
        const totalGuru = responseGuru.meta?.total || responseGuru.data?.length || 0;

        // 2. Ambil data Siswa secara riil
        const responseSiswa = await apiClient.get('/admin?role=siswa');
        const totalSiswa = responseSiswa.meta?.total || responseSiswa.data?.length || 0;

        // 3. Ambil data Kelas (Kursus) secara riil
        const responseKelas = await apiClient.get('/kelas');
        const totalKelas = responseKelas.data?.length || 0;

        // Render Stats ke DOM
        const teachersCountEl = document.getElementById('stat-teachers-count');
        if (teachersCountEl) teachersCountEl.textContent = totalGuru.toLocaleString('id-ID');

        const studentsCountEl = document.getElementById('stat-students-count');
        if (studentsCountEl) studentsCountEl.textContent = totalSiswa.toLocaleString('id-ID');

        const classesCountEl = document.getElementById('stat-classes-count');
        if (classesCountEl) classesCountEl.textContent = totalKelas.toLocaleString('id-ID');

        const newStudentsCountEl = document.getElementById('stat-new-students-count');
        if (newStudentsCountEl) newStudentsCountEl.textContent = '+0'; // Bisa disesuaikan nanti

    } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
    }
}
