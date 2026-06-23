import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize teacher profile
    const user = storage.getUser();
    if (user) {
        let displayName = user.name || 'Bu Nina';
        let cleanName = displayName.replace(/^Bu\s+/, '');

        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = cleanName;
    }

    // Modal elements
    const modal = document.getElementById('modal-kelas');
    const openModalBtn = document.getElementById('btn-tambah-kelas');
    const closeModalBtn = document.getElementById('modal-kelas-close');
    const cancelModalBtn = document.getElementById('btn-cancel-kelas');
    const form = document.getElementById('form-tambah-kelas');

    const openModal = () => {
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
    };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Helper to generate a random 8-character class code: 4 letters + 4 numbers (e.g. ABCD1234)
    function generateClassCode() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        for (let i = 0; i < 4; i++) {
            code += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return code;
    }

    // Helper to extract grade number from className or dateClass input text (defaults to Kelas 5)
    function extractGrade(className, dateClass) {
        const match = (className + ' ' + dateClass).match(/(?:kelas|grade|kls)?\s*([1-6])/i);
        return match ? 'Kelas ' + match[1] : 'Kelas 5';
    }

    // Form submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const className = document.getElementById('kelas-name').value.trim();
            const desc = document.getElementById('kelas-desc').value.trim();
            const subject = document.getElementById('kelas-subject').value.trim();
            const dateClass = document.getElementById('kelas-date').value.trim();
            const academicYear = document.getElementById('kelas-academic-year').value.trim();

            // Automatically generate random code (e.g., "ABCD1234")
            const generatedCode = generateClassCode();

            // Extract grade level (e.g., "Kelas 5")
            const grade = extractGrade(className, dateClass);

            // Generate a random student count (20 to 30) for mock data realism
            const studentsCount = Math.floor(Math.random() * 11) + 20;

            // Generate internal slug code
            const code = subject.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || 'kls-' + Date.now().toString().slice(-4);

            const newClass = {
                id: Date.now(),
                title: subject, // Mata Pelajaran (first column)
                className: className, // Nama Kelas
                desc: desc,
                grade: grade, // e.g. "Kelas 5"
                code: code,
                displayCode: generatedCode, // e.g. "ABCD1234"
                academicYear: academicYear,
                dateClass: dateClass,
                teacher: user ? user.name : 'Bu Nina',
                subject: 'Guru ' + subject,
                illustration: 'desk',
                studentsCount: studentsCount
            };

            storage.addClass(newClass);

            // Add activity log
            storage.addActivity({
                title: `Membuat kelas baru: ${className}`,
                time: 'Baru saja',
                type: 'materi',
                classCode: code
            });

            closeModal();
            loadAndRenderClasses();
        });
    }

    // Initial render
    loadAndRenderClasses();
});

function loadAndRenderClasses() {
    const classes = storage.getClasses();
    const container = document.getElementById('classes-table-body');

    if (!container) return;

    if (!classes || classes.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="empty-state">Belum ada kelas yang diampu.</td></tr>';
        return;
    }

    container.innerHTML = classes.map(c => {
        // Clean grade format: extract digits (e.g. "Kelas 2" -> "2")
        const gradeNumber = c.grade ? c.grade.replace(/\D/g, '') : '';
        const roomCode = c.displayCode || c.code.toUpperCase();

        return `
            <tr>
                <td style="font-weight: 700; text-align: center;">${c.title}</td>
                <td>${gradeNumber}</td>
                <td style="font-family: monospace; font-weight: 700; color: #4b5563;">${roomCode}</td>
                <td>${c.studentsCount || 0}</td>
            </tr>
        `;
    }).join('');
}
