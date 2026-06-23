import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Load and render active settings
    loadSettings();

    // Settings form submit handler
    const form = document.getElementById('form-settings');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const appName = document.getElementById('settings-app-name').value.trim();
            const schoolName = document.getElementById('settings-school-name').value.trim();
            const academicYear = document.getElementById('settings-academic-year').value.trim();
            const semester = document.getElementById('settings-semester').value;
            const status = document.getElementById('settings-status').value;

            const updatedSettings = {
                appName,
                schoolName,
                academicYear,
                semester,
                status
            };

            // Save to localStorage
            storage.updateSettings(updatedSettings);

            // Add activity log
            storage.addActivity({
                title: `Memperbarui konfigurasi sistem platform`,
                time: 'Baru saja',
                type: 'system',
                classCode: 'general'
            });

            alert('Pengaturan sistem berhasil disimpan!');
            loadSettings();
        });
    }
});

function loadSettings() {
    const settings = storage.getSettings();
    
    if (settings) {
        document.getElementById('settings-app-name').value = settings.appName || 'E-Learning Platform';
        document.getElementById('settings-school-name').value = settings.schoolName || 'SD N 1 Cerdas Mulia';
        document.getElementById('settings-academic-year').value = settings.academicYear || '2026/2027';
        document.getElementById('settings-semester').value = settings.semester || 'Ganjil';
        document.getElementById('settings-status').value = settings.status || 'active';
    }
}
