import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

let activeClassLevel = 'semua';
let selectedTask = null;
let selectedStudent = null;
let globalClasses = [];
let globalTasks = [];

document.addEventListener('DOMContentLoaded', async () => {
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

    // Load classes dynamically to fill selects
    try {
        const resKelas = await apiClient.get('/kelas');
        globalClasses = resKelas.data || [];
        
        // Populate filter kelas dropdown
        const filterSelect = document.getElementById('filter-kelas');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="semua">Pilih Kelas</option>' + 
                globalClasses.map(c => `<option value="${c.id}">${c.nama_kelas}</option>`).join('');
        }

        // Populate modal create tugas class dropdown
        const classSelect = document.getElementById('tugas-class');
        if (classSelect) {
            classSelect.innerHTML = '<option value="">Pilih Kelas</option>' +
                globalClasses.map(c => `<option value="${c.id}">${c.nama_kelas} (${c.jurusan || 'Umum'})</option>`).join('');
        }
    } catch (err) {
        console.error('Gagal mengambil kelas:', err);
    }

    // Modal elements for adding assignments
    const modal = document.getElementById('modal-tugas');
    const openModalBtn = document.getElementById('btn-tambah-tugas');
    const closeModalBtn = document.getElementById('modal-tugas-close');
    const cancelModalBtn = document.getElementById('btn-cancel-tugas');
    const form = document.getElementById('form-tambah-tugas');
    const fileInput = document.getElementById('tugas-file');
    const uploadLabel = document.getElementById('upload-label');

    // File input label update
    if (fileInput && uploadLabel) {
        fileInput.addEventListener('change', (e) => {
            if (fileInput.files[0]) {
                uploadLabel.textContent = `Terpilih: ${fileInput.files[0].name}`;
            } else {
                uploadLabel.textContent = 'Klik disini untuk mengupload materi';
            }
        });
    }

    const openModal = () => {
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
        if (uploadLabel) uploadLabel.textContent = 'Klik disini untuk mengupload materi';
    };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Create new task submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('tugas-title').value.trim();
            const classId = document.getElementById('tugas-class').value;
            const deadline = document.getElementById('tugas-deadline').value;
            const desc = document.getElementById('tugas-desc').value.trim();

            try {
                // If a file is uploaded, we use FormData
                if (fileInput && fileInput.files[0]) {
                    const formData = new FormData();
                    formData.append('judul', title);
                    formData.append('kelas_id', classId);
                    formData.append('deadline', deadline);
                    formData.append('deskripsi', desc);
                    formData.append('file_tugas', fileInput.files[0]);

                    const response = await fetch('http://127.0.0.1:8000/api/tugas', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${storage.getToken()}`,
                            'Accept': 'application/json'
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        throw new Error(errData.message || 'Gagal menyimpan tugas.');
                    }
                } else {
                    // Send standard JSON
                    await apiClient.post('/tugas', {
                        judul: title,
                        kelas_id: classId,
                        deadline: deadline,
                        deskripsi: desc
                    });
                }

                alert('Tugas baru berhasil dibuat!');
                closeModal();
                loadAndRenderAssignments();
            } catch (err) {
                console.error(err);
                alert(`Gagal membuat tugas: ${err.message}`);
            }
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

async function loadAndRenderAssignments() {
    const container = document.getElementById('assignments-table-body');
    if (!container) return;

    try {
        const response = await apiClient.get('/tugas');
        globalTasks = response.data || [];

        // Filter assignments by class
        let filtered = globalTasks;
        if (activeClassLevel !== 'semua') {
            filtered = filtered.filter(a => String(a.kelas_id) === activeClassLevel);
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
            const subjectLabel = t.kelas?.jurusan || 'Umum';
            const className = t.kelas?.nama_kelas || '-';
            const formattedTime = t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            }) : '-';

            return `
                <tr data-id="${t.id}" style="cursor: pointer;">
                    <td style="font-weight: 700;">${subjectLabel}</td>
                    <td style="font-weight: 800; color: #111827;">${t.judul}</td>
                    <td style="font-weight: 700;">${className}</td>
                    <td style="color: #4b5563; font-weight: 600;">${formattedTime}</td>
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
    } catch (err) {
        console.error('Gagal mengambil daftar tugas:', err);
        container.innerHTML = '<tr><td colspan="4" class="loading-state">Gagal memuat tugas dari server.</td></tr>';
    }
}

async function loadAssignmentDetails(taskId) {
    const t = globalTasks.find(item => item.id === taskId);
    if (!t) return;

    selectedTask = t;
    selectedStudent = null; // reset selected student

    document.getElementById('detail-tugas-title').textContent = t.judul;
    
    const formattedDeadline = t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '';
    document.getElementById('detail-tugas-deadline').textContent = `Deadline: ${formattedDeadline}`;
    document.getElementById('detail-tugas-desc').textContent = t.deskripsi || '-';

    // Render student submissions
    const subContainer = document.getElementById('submissions-container');
    const gradingFormContainer = document.getElementById('grading-form-container');

    // Default grading panel state
    gradingFormContainer.innerHTML = `
        <div class="empty-state" style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 32px;">
            Pilih siswa di sebelah kiri untuk mulai menilai.
        </div>
    `;

    try {
        const responseSub = await apiClient.get(`/pengumpulan/${taskId}`);
        const submissions = responseSub.data || [];

        if (submissions.length === 0) {
            subContainer.innerHTML = '<div class="empty-state">Belum ada siswa di kelas ini.</div>';
            return;
        }

        subContainer.innerHTML = submissions.map(sub => {
            const hasSubmitted = sub.id !== null;
            const isGraded = sub.nilai !== null && sub.nilai !== undefined;
            let badgeHtml = '';

            if (hasSubmitted) {
                badgeHtml = `<span class="grading-badge ${isGraded ? 'graded' : 'pending'}">${isGraded ? `Nilai: ${sub.nilai}` : 'Perlu Nilai'}</span>`;
            } else {
                badgeHtml = `<span class="grading-badge" style="background-color: #f1f5f9; color: #64748b;">Belum Kumpul</span>`;
            }

            const studentName = sub.siswa?.nama || 'Siswa';
            const formattedTime = sub.dikumpul_pada ? new Date(sub.dikumpul_pada).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Belum mengumpulkan';

            return `
                <div class="submission-card" data-siswa-id="${sub.siswa_id}" data-submission-id="${sub.id || ''}" style="cursor: pointer; margin-bottom: 12px; padding: 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <div class="student-info" style="display: flex; align-items: center; gap: 12px;">
                        <div class="student-avatar-circle" style="width: 38px; height: 38px; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 800;">
                            ${studentName.charAt(0)}
                        </div>
                        <div>
                            <span class="student-name" style="font-weight: 800; color: #111827; display: block;">${studentName}</span>
                            <p class="submit-time" style="font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0;">${formattedTime}</p>
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
                const sId = parseInt(card.dataset.siswaId);
                const subObj = submissions.find(s => s.siswa_id === sId);

                subContainer.querySelectorAll('.submission-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                selectedStudent = subObj;
                renderGradingPanel(subObj);
            });
        });

    } catch (err) {
        console.error('Gagal mengambil detail pengumpulan:', err);
        subContainer.innerHTML = '<div class="empty-state">Gagal memuat pengumpulan dari server.</div>';
    }

    showPanel('detail');
}

function renderGradingPanel(sub) {
    const container = document.getElementById('grading-form-container');
    if (!sub) return;

    const hasSubmitted = sub.id !== null;

    if (!hasSubmitted) {
        container.innerHTML = `
            <div class="grading-panel" style="background-color: white; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 24px;">
                <div class="grading-header" style="margin-bottom: 20px;">
                    <h4 style="color: #dc2626; margin: 0; font-size: 1.15rem; font-weight: 800;">Siswa Belum Mengumpulkan</h4>
                    <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #64748b;">Tugas untuk: <strong>${sub.siswa?.nama}</strong></p>
                </div>
                <p style="color: #64748b; font-size: 0.95rem; line-height: 1.6;">Siswa ini belum mengumpulkan jawaban tugas ini sehingga nilai belum dapat dimasukkan.</p>
            </div>
        `;
        return;
    }

    const isGraded = sub.nilai !== null && sub.nilai !== undefined;
    const fileUrl = sub.file_path ? (sub.file_path.startsWith('http') ? sub.file_path : `http://127.0.0.1:8000/storage/${sub.file_path}`) : '#';

    container.innerHTML = `
        <div class="grading-panel" style="background-color: white; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <div class="grading-header" style="margin-bottom: 20px;">
                <h4 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #111827;">Menilai: ${sub.siswa?.nama}</h4>
                <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #64748b;">Tugas: ${selectedTask.judul}</p>
            </div>
            
            <div style="margin-bottom: 24px;">
                <label class="form-label" style="font-weight: 700; color: #4b5563; font-size: 0.9rem; display: block; margin-bottom: 8px;">Berkas Jawaban Siswa</label>
                <a href="${fileUrl}" target="_blank" class="grading-file-link" style="display: inline-flex; align-items: center; gap: 8px; color: #2563eb; font-weight: 700; text-decoration: none; padding: 8px 12px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #dbeafe;">
                    <!-- Document Icon -->
                    <svg style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2;" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    ${sub.file_name || 'Buka Lampiran'}
                </a>
            </div>
 
            <form id="form-penilaian">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label" for="grade-input" style="font-weight: 700; color: #4b5563; font-size: 0.9rem; display: block; margin-bottom: 6px;">Nilai Angka (0 - 100)</label>
                    <input class="form-input" type="number" id="grade-input" min="0" max="100" placeholder="Masukkan nilai" value="${isGraded ? sub.nilai : ''}" required style="width: 100%; padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 8px;">
                </div>
 
                <div class="form-group" style="margin-bottom: 24px;">
                    <label class="form-label" for="feedback-input" style="font-weight: 700; color: #4b5563; font-size: 0.9rem; display: block; margin-bottom: 6px;">Catatan / Umpan Balik Guru</label>
                    <textarea class="form-textarea" id="feedback-input" placeholder="Tulis catatan evaluasi Anda disini..." style="width: 100%; padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; height: 100px;">${sub.catatan_guru || ''}</textarea>
                </div>
 
                <div>
                    <button type="submit" class="btn-guru" style="width: 100%; background-color: #0b57d0; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        ${isGraded ? 'Perbarui Nilai' : 'Simpan Nilai'}
                    </button>
                </div>
            </form>
        </div>
    `;

    // Form grading submit handler
    const gradeForm = document.getElementById('form-penilaian');
    gradeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const score = parseInt(document.getElementById('grade-input').value);
        const feedback = document.getElementById('feedback-input').value.trim();

        try {
            await apiClient.put(`/pengumpulan/${sub.id}/nilai`, {
                nilai: score,
                catatan_guru: feedback
            });

            alert(`Nilai untuk ${sub.siswa?.nama} berhasil disimpan!`);

            // Reload details screen
            loadAssignmentDetails(selectedTask.id);
        } catch (err) {
            console.error(err);
            alert(`Gagal menyimpan nilai: ${err.message}`);
        }
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
