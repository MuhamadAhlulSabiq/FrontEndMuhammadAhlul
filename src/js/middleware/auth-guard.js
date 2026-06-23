/**
 * Role-Based Route Guard (Student Guard)
 * Runs synchronously in <head> to prevent rendering unauthorized page elements.
 */
(function () {
    const token = localStorage.getItem('elearning_token');
    const role = localStorage.getItem('elearning_role');

    // Protect all pages under /pages/siswa/*
    if (!token || role !== 'siswa') {
        console.warn('Unauthorized access. Redirecting to login...');
        
        // Find relative path to root folder login.html
        const path = window.location.pathname;
        if (path.includes('/pages/siswa/')) {
            window.location.href = '../../login.html';
        } else {
            window.location.href = '/login.html';
        }
    }
})();
