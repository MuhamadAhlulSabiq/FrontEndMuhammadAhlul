/**
 * Role-Based Route Guard (Student Guard)
 * Runs synchronously in <head> to prevent rendering unauthorized page elements.
 */
(function () {
    const token = localStorage.getItem('elearning_token');
    const role = localStorage.getItem('elearning_role');
    const path = window.location.pathname;

    let isAuthorized = true;

    if (path.includes('/pages/siswa/')) {
        if (!token || role !== 'siswa') {
            isAuthorized = false;
        }
    } else if (path.includes('/pages/guru/')) {
        if (!token || role !== 'guru') {
            isAuthorized = false;
        }
    } else if (path.includes('/pages/admin/')) {
        if (!token || role !== 'admin') {
            isAuthorized = false;
        }
    }

    if (!isAuthorized) {
        console.warn('Unauthorized access. Redirecting to login...');
        if (path.includes('/pages/siswa/') || path.includes('/pages/guru/') || path.includes('/pages/admin/')) {
            window.location.href = '../../login.html';
        } else {
            window.location.href = '/login.html';
        }
    }
})();
