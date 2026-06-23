import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

let activeClassLevel = 'semua';
let selectedTask = null;
let selectedStudent = null;

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

    // Modal elements for adding assignments
    const modal = document.getElementById('modal-tugas');
    const openModalBtn = document.getElementById('btn-tambah-tugas');
    const closeModalBtn = document.getElementById('modal-tugas-close');
    const cancelModalBtn = document.getElementById('btn-cancel-tugas');
    const form = document.getElementById('form-tambah-tugas');

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

    // Create new task submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('tugas-title').value;
            const classCode = document.getElementById('tugas-class').value;
            const deadline = document.getElementById('tugas-deadline').value;
            const desc = document.getElementById('tugas-desc').value;
            const attachment = document.getElementById('tugas-attachment').value || 'Soal_Tugas.pdf';

            const classNameMap = {
                'mtk': 'Matematika',
                'ing': 'Bahasa Inggris',
                'ipa': 'Ilmu Pengetahuan Alam',
                'pkn': 'Kewarganegaraan'
            };

            const classLevelMap = {
                'mtk': '5',
                'ing': '2',
                'ipa': '4',
                'pkn': '1'
            };

            const newAssignment = {
                id: Date.now(),
                title: title,
                deadline: deadline,
                status: 'belum',
                classCode: classCode,
                classLevel: classLevelMap[classCode] || '5',
                teacher: user ? user.name : 'Bu Nina',
                subject: classNameMap[classCode] || 'Mata Pelajaran',
                desc: desc,
                attachmentName: attachment,
                attachmentSize: '1.2 MB'
            };

            storage.addAssignment(newAssignment);

            // Add activity log
            storage.addActivity({
                title: `Membuat tugas baru: ${title}`,
                time: 'Baru saja',
                type: 'check',
                classCode: classCode
            });

            closeModal();
            loadAndRenderAssignments();
        });
    }

    // Dropdown change filtering
    const filterKelas = document.getElementById('filter-kelas');
    if (filterKelas) {
        filterKelas.addEventListener('change', (e) => {
            activeClassLevel = e.target.value;
            loadAndRenderAssignments();
        });
    }

    // Back to list link
    const backBtn = document.getElementById('btn-back-to-list');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showPanel('list');
            loadAndRenderAssignments();
        });
    }

    // Initial render
    loadAndRenderAssignments();
});

function loadAndRenderAssignments() {
    const assignments = storage.getAssignments();
    const container = document.getElementById('assignments-table-body');

    if (!container) return;

    // Filter assignments by class level
    let filtered = assignments;
    if (activeClassLevel !== 'semua') {
        filtered = filtered.filter(a => String(a.classLevel) === activeClassLevel);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="4" class="loading-state">Tidak ada tugas kelas saat ini.</td>
            </tr>
        `;
        return;
    }

    container.innerHTML = filtered.map(t => {
        return `
            <tr data-id="${t.id}">
                <td style="font-weight: 700;">${t.subject || 'Mata Pelajaran'}</td>
                <td style="font-weight: 800; color: #111827;">${t.title}</td>
                <td style="font-weight: 700;">${t.classLevel || '-'}</td>
                <td style="color: #4b5563; font-weight: 600;">${t.deadline}</td>
            </tr>
        `;
    }).join('');

    // Click assignment detail
    container.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', () => {
            const id = parseInt(row.dataset.id);
            loadAssignmentDetails(id);
        });
    });
}

function loadAssignmentDetails(taskId) {
    const assignments = storage.getAssignments();
    const t = assignments.find(item => item.id === taskId);
    if (!t) return;

    selectedTask = t;
    selectedStudent = null; // reset selected student

    document.getElementById('detail-tugas-title').textContent = t.title;
    document.getElementById('detail-tugas-deadline').textContent = `Deadline: ${t.deadline}`;
    document.getElementById('detail-tugas-desc').textContent = t.desc;

    // Render student submissions
    const subContainer = document.getElementById('submissions-container');
    const gradingFormContainer = document.getElementById('grading-form-container');

    // Default grading panel state
    gradingFormContainer.innerHTML = `
        <div class="empty-state" style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 32px;">
            Pilih siswa di sebelah kiri untuk mulai menilai.
        </div>
    `;

    // Mock submissions logic
    const submissions = [];
    if (t.status === 'sudah' || t.submittedFile || t.id === 1) { // Seed Rohmat for math assignment
        submissions.push({
            studentName: 'Rohmat',
            studentId: 1,
            submittedFile: t.submittedFile || 'Jawaban_BilanganBulat_Rohmat.pdf',
            submittedTime: t.submittedTime || '17 Mei 2026 10.30',
            nilai: t.nilai,
            feedback: t.feedback,
            status: 'sudah'
        });
    }

    // Add Azzahra as not submitted
    submissions.push({
        studentName: 'Azzahra',
        studentId: 2,
        submittedFile: null,
        submittedTime: null,
        status: 'belum'
    });

    subContainer.innerHTML = submissions.map(sub => {
        const isGraded = sub.nilai !== undefined;
        let badgeHtml = '';

        if (sub.status === 'sudah') {
            badgeHtml = `<span class="grading-badge ${isGraded ? 'graded' : 'pending'}">${isGraded ? `Nilai: ${sub.nilai}` : 'Perlu Nilai'}</span>`;
        } else {
            badgeHtml = `<span class="grading-badge" style="background-color: #f1f5f9; color: #64748b;">Belum Kumpul</span>`;
        }

        return `
            <div class="submission-card" data-student-id="${sub.studentId}">
                <div class="student-info">
                    <img class="student-avatar" src="https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${sub.studentName.toLowerCase()}" alt="Avatar">
                    <div>
                        <span class="student-name">${sub.studentName}</span>
                        <p class="submit-time">${sub.status === 'sudah' ? `Kumpul: ${sub.submittedTime}` : 'Belum mengumpulkan'}</p>
                    </div>
                </div>
                <div>
                    ${badgeHtml}
                </div>
            </div>
        `;
    }).join('');

    // Attach click listener to submissions cards
    subContainer.querySelectorAll('.submission-card').forEach(card => {
        card.addEventListener('click', () => {
            const sId = parseInt(card.dataset.studentId);
            const subObj = submissions.find(s => s.studentId === sId);
            
            subContainer.querySelectorAll('.submission-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            selectedStudent = subObj;
            renderGradingPanel(subObj);
        });
    });

    showPanel('detail');
}

function renderGradingPanel(sub) {
    const container = document.getElementById('grading-form-container');
    if (!sub) return;

    if (sub.status === 'belum') {
        container.innerHTML = `
            <div class="grading-panel">
                <div class="grading-header">
                    <h4 style="color: #dc2626;">Siswa Belum Mengumpulkan</h4>
                    <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #64748b;">Tugas untuk: <strong>${sub.studentName}</strong></p>
                </div>
                <p style="color: #64748b; font-size: 0.95rem; line-height: 1.6;">Siswa ini belum mengumpulkan jawaban tugas ini sehingga nilai belum dapat dimasukkan.</p>
            </div>
        `;
        return;
    }

    const isGraded = sub.nilai !== undefined;

    container.innerHTML = `
        <div class="grading-panel">
            <div class="grading-header">
                <h4>Menilai: ${sub.studentName}</h4>
                <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #64748b;">Tugas: ${selectedTask.title}</p>
            </div>
            
            <div style="margin-bottom: 24px;">
                <label class="form-label">Berkas Jawaban Siswa</label>
                <a href="#" class="grading-file-link" id="btn-download-jawaban">
                    <!-- Document Icon -->
                    <svg style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2;" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    ${sub.submittedFile}
                </a>
            </div>

            <form id="form-penilaian">
                <div class="form-group">
                    <label class="form-label" for="grade-input">Nilai Angka (0 - 100)</label>
                    <input class="form-input" type="number" id="grade-input" min="0" max="100" placeholder="Masukkan nilai" value="${isGraded ? sub.nilai : ''}" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="feedback-input">Catatan / Umpan Balik Guru</label>
                    <textarea class="form-textarea" id="feedback-input" placeholder="Tulis catatan evaluasi Anda disini...">${isGraded ? sub.feedback : ''}</textarea>
                </div>

                <div style="margin-top: 24px;">
                    <button type="submit" class="btn-guru" style="width: 100%;">
                        ${isGraded ? 'Perbarui Nilai' : 'Simpan Nilai'}
                    </button>
                </div>
            </form>
        </div>
    `;

    // Download mock handler
    document.getElementById('btn-download-jawaban').addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Mengunduh berkas jawaban: ${sub.submittedFile}`);
    });

    // Form grading submit handler
    const gradeForm = document.getElementById('form-penilaian');
    gradeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const score = parseInt(document.getElementById('grade-input').value);
        const feedback = document.getElementById('feedback-input').value;

        // Save grade to localStorage (updates the assignment object)
        storage.updateAssignment(selectedTask.id, {
            nilai: score,
            feedback: feedback
        });

        // Add activity log
        storage.addActivity({
            title: `Menilai tugas ${selectedTask.title} siswa ${sub.studentName} dengan nilai ${score}`,
            time: 'Baru saja',
            type: 'check',
            classCode: selectedTask.classCode
        });

        alert(`Nilai ${score} untuk ${sub.studentName} berhasil disimpan!`);

        // Reload details screen
        loadAssignmentDetails(selectedTask.id);
    });
}

function showPanel(panelName) {
    const listPanel = document.getElementById('tugas-list-panel');
    const detailPanel = document.getElementById('tugas-detail-panel');

    if (panelName === 'list') {
        listPanel.style.display = 'block';
        detailPanel.style.display = 'none';
        document.getElementById('tugas-main-title').textContent = 'Daftar Tugas';
        document.getElementById('tugas-main-subtitle').textContent = 'Semua Tugas yang telah Anda buat.';
    } else {
        listPanel.style.display = 'none';
        detailPanel.style.display = 'block';
        document.getElementById('tugas-main-title').textContent = 'Detail Tugas';
        document.getElementById('tugas-main-subtitle').textContent = 'Lihat daftar pengumpulan siswa dan berikan penilaian.';
    }
}
