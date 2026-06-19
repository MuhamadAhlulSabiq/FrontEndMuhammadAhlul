/**
 * Application Configuration
 */

export const CONFIG = {
    // Replace with backend API URL (e.g., http://localhost:8000/api or deployment URL)
    API_BASE_URL: 'http://127.0.0.1:8000/api',
    APP_NAME: 'E-Learning Platform',
    ROLES: {
        SISWA: 'siswa',
        GURU: 'guru',
        ADMIN: 'admin'
    },
    DEFAULT_REDIRECTS: {
        siswa: '/pages/siswa/dashboard.html',
        guru: '/pages/guru/dashboard.html',
        admin: '/pages/admin/dashboard.html'
    }
};
