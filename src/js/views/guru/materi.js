import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

let activeSubject = 'semua';

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
    const modal = document.getElementById('modal-materi');
    const openModalBtn = document.getElementById('btn-tambah-materi');
    const closeModalBtn = document.getElementById('modal-materi-close');
    const cancelModalBtn = document.getElementById('btn-cancel-materi');
    const form = document.getElementById('form-tambah-materi');
    const fileInput = document.getElementById('materi-file');
    const fileUploadText = document.getElementById('file-upload-text');

    // Open Modal
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    // Close Modal helper
    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
        if (fileUploadText) {
            fileUploadText.textContent = 'Klik disini untuk mengupload materi';
        }
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Bind file input change to display selected filename
    if (fileInput && fileUploadText) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileUploadText.textContent = `File terpilih: ${file.name}`;
            } else {
                fileUploadText.textContent = 'Klik disini untuk mengupload materi';
            }
        });
    }

    // Populate filter dropdown and form select dropdown dynamically
    populateClassDropdowns();

    // Helper to get formatted Indonesian date (e.g. 23 Juni 2026)
    function getFormattedIndonesianDate() {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const today = new Date();
        return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    }

    // Form Submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const classCode = document.getElementById('materi-class').value;
            const title = document.getElementById('materi-title').value.trim();
            const desc = document.getElementById('materi-desc').value.trim();
            
            // Extract document format from filename extension, default to PDF
            let docType = 'PDF';
            if (fileInput && fileInput.files && fileInput.files[0]) {
                const filename = fileInput.files[0].name;
                const ext = filename.split('.').pop().toUpperCase();
                if (['PDF', 'PPT', 'PPTX', 'DOC', 'DOCX'].includes(ext)) {
                    docType = ext.startsWith('PPT') ? 'PPT' : (ext.startsWith('DOC') ? 'DOC' : 'PDF');
                }
            }

            const classes = storage.getClasses();
            const selectedClass = classes.find(c => c.code === classCode);
            const subjectLabel = selectedClass ? `${selectedClass.title} - ${selectedClass.grade}` : 'Materi Umum';

            const newMaterial = {
                id: Date.now(),
                title: title,
                description: desc,
                subject: subjectLabel,
                time: getFormattedIndonesianDate(),
                classCode: classCode,
                docType: docType
            };

            // Save to localStorage
            storage.addMaterial(newMaterial);

            // Add activity log
            storage.addActivity({
                title: `Mengunggah materi baru: ${title}`,
                time: 'Baru saja',
                type: 'materi',
                classCode: classCode
            });

            closeModal();
            loadAndRenderMaterials();
        });
    }

    // Filter selection handler
    const filterSelect = document.getElementById('filter-class-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            activeSubject = e.target.value;
            loadAndRenderMaterials();
        });
    }

    // Initial render
    loadAndRenderMaterials();
});

function populateClassDropdowns() {
    const classes = storage.getClasses();
    const filterSelect = document.getElementById('filter-class-select');
    const formSelect = document.getElementById('materi-class');

    if (!classes || classes.length === 0) return;

    // 1. Populate Filter select dropdown
    const filterOptions = classes.map(c => `
        <option value="${c.code}">${c.title} (${c.grade})</option>
    `).join('');
    if (filterSelect) {
        filterSelect.innerHTML = `<option value="semua">Pilih Kelas</option>` + filterOptions;
    }

    // 2. Populate Modal Form select dropdown
    const formOptions = classes.map(c => `
        <option value="${c.code}">${c.title} - ${c.grade}</option>
    `).join('');
    if (formSelect) {
        formSelect.innerHTML = `<option value="" disabled selected>Pilih Kelas</option>` + formOptions;
    }
}

function loadAndRenderMaterials() {
    const materials = storage.getMaterials();
    const classes = storage.getClasses();
    const container = document.getElementById('materi-table-body');

    if (!container) return;

    // Filter materials by selected dropdown class
    let filtered = materials;
    if (activeSubject !== 'semua') {
        filtered = filtered.filter(m => m.classCode === activeSubject);
    }

    if (!filtered || filtered.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="empty-state">Tidak ada materi yang ditemukan.</td></tr>';
        return;
    }

    container.innerHTML = filtered.map(m => {
        // Find subject name and grade dynamically from class database
        const classObj = classes.find(c => c.code === m.classCode);
        const subjectTitle = classObj ? classObj.title : (m.subject ? m.subject.split(' - ')[0] : 'Materi Umum');
        const gradeNumber = classObj ? classObj.grade.replace(/\D/g, '') : (m.subject ? m.subject.replace(/\D/g, '') : '5');

        return `
            <tr>
                <td style="font-weight: 700;">${subjectTitle}</td>
                <td style="text-align: center;">${m.title}</td>
                <td>${gradeNumber}</td>
                <td style="color: #4b5563; font-weight: 600;">${m.time}</td>
            </tr>
        `;
    }).join('');
}
