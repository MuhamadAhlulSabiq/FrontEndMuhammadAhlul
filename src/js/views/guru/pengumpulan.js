import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';
import { CONFIG } from '../../config.js';

let activeSubmission = null;
let globalSubmissions = [];
let tugasId = null;

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

    // Get tugas_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    tugasId = urlParams.get('tugas_id');

    if (!tugasId) {
        // Show task selector wrapper
        const wrapper = document.getElementById('task-selector-wrapper');
        if (wrapper) wrapper.style.display = 'block';

        // Load tasks list to populate selector dropdown
        await loadTasksForSelector();
        
        // Show guide in table body
        const container = document.getElementById('submissions-table-body');
        if (container) {
            container.innerHTML = '<tr><td colspan="5" class="empty-state">Silakan pilih tugas terlebih dahulu dari menu di atas.</td></tr>';
        }
        
        updateStatsDom(0, 0, 0, 0);
    } else {
        // Render Submissions Table & Stats directly
        await loadAndRenderSubmissions();
    }

    // Attach Save Grade click listener
    const btnSave = document.getElementById('btn-save-grade');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            saveGradeAndFeedback();
        });
    }
});

async function loadTasksForSelector() {
    const selectDropdown = document.getElementById('task-select-dropdown');
    if (!selectDropdown) return;

    try {
        const response = await apiClient.get('/tugas');
        if (response.success && response.data) {
            const tasks = response.data;
            if (tasks.length === 0) {
                selectDropdown.innerHTML = '<option value="" disabled selected>Tidak ada tugas yang tersedia</option>';
                return;
            }

            selectDropdown.innerHTML = '<option value="" disabled selected>-- Pilih Tugas --</option>' + 
                tasks.map(t => `<option value="${t.id}">${t.judul} (${t.kelas ? t.kelas.nama_kelas : 'Kelas'})</option>`).join('');

            selectDropdown.addEventListener('change', async (e) => {
                tugasId = e.target.value;
                
                // Show loading indicator
                const container = document.getElementById('submissions-table-body');
                if (container) {
                    container.innerHTML = '<tr><td colspan="5" class="loading-state">Memuat data pengumpulan...</td></tr>';
                }
                
                await loadAndRenderSubmissions();
            });
        }
    } catch (err) {
        console.error('Error fetching tasks for selector:', err);
    }
}

function updateStatsDom(totalSiswa, sudahCount, belumCount, persentase) {
    const totalEl = document.getElementById('stat-total-siswa');
    const sudahEl = document.getElementById('stat-sudah-diserahkan');
    const belumEl = document.getElementById('stat-belum-diserahkan');
    const persentaseEl = document.getElementById('stat-persentase');

    if (totalEl) totalEl.textContent = totalSiswa;
    if (sudahEl) sudahEl.textContent = sudahCount;
    if (belumEl) belumEl.textContent = belumCount;
    if (persentaseEl) persentaseEl.textContent = `${persentase}%`;
}

async function loadAndRenderSubmissions() {
    const container = document.getElementById('submissions-table-body');
    if (!container) return;

    try {
        const response = await apiClient.get(`/pengumpulan/${tugasId}`);
        
        if (response.success && response.data) {
            globalSubmissions = response.data;

            // Calculate dynamic stats
            const totalSiswa = globalSubmissions.length;
            const sudahCount = globalSubmissions.filter(s => s.id !== null).length;
            const belumCount = totalSiswa - sudahCount;
            const persentase = totalSiswa > 0 ? Math.round((sudahCount / totalSiswa) * 100) : 0;

            updateStatsDom(totalSiswa, sudahCount, belumCount, persentase);

            if (totalSiswa === 0) {
                container.innerHTML = '<tr><td colspan="5" class="empty-state">Tidak ada siswa yang terdaftar di kelas tugas ini.</td></tr>';
                return;
            }

            // Render Table Rows
            container.innerHTML = globalSubmissions.map((sub, index) => {
                const studentName = sub.siswa ? sub.siswa.nama : 'Siswa';
                const statusLabel = sub.id !== null ? 'Diserahkan' : 'Belum Diserahkan';
                const badgeClass = sub.id !== null ? 'status-diserahkan' : 'status-belum';
                const scoreDisplay = sub.nilai !== null ? sub.nilai : '-';
                const scoreColor = sub.nilai !== null ? '#111827' : '#9ca3af';

                // Format Date
                let formattedTime = '-';
                if (sub.dikumpul_pada) {
                    const dateObj = new Date(sub.dikumpul_pada);
                    const months = [
                        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                    ];
                    formattedTime = isNaN(dateObj.getTime()) ? '-' : `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}, ${String(dateObj.getHours()).padStart(2, '0')}.${String(dateObj.getMinutes()).padStart(2, '0')}`;
                }

                const identifier = sub.siswa_id;

                return `
                    <tr data-siswa-id="${identifier}">
                        <td>${index + 1}</td>
                        <td style="font-weight: 700;">${studentName}</td>
                        <td><span class="${badgeClass}">${statusLabel}</span></td>
                        <td style="color: #4b5563; font-weight: 600;">${formattedTime}</td>
                        <td style="font-weight: 800; color: ${scoreColor};">${scoreDisplay}</td>
                    </tr>
                `;
            }).join('');

            // Attach click listeners to rows
            container.querySelectorAll('tr').forEach(row => {
                row.addEventListener('click', () => {
                    const sId = parseInt(row.dataset.siswaId);
                    const sub = globalSubmissions.find(s => s.siswa_id === sId);
                    if (sub) {
                        openSubmissionDetail(sub);
                    }
                });
            });
        } else {
            container.innerHTML = '<tr><td colspan="5" class="empty-state" style="color: #ef4444;">Gagal mengambil data pengumpulan.</td></tr>';
        }
    } catch (err) {
        console.error('Error fetching submissions:', err);
        container.innerHTML = '<tr><td colspan="5" class="empty-state" style="color: #ef4444;">Gagal memuat data pengumpulan. Pastikan server backend menyala.</td></tr>';
    }
}

function openSubmissionDetail(sub) {
    activeSubmission = sub;

    // Toggle panels
    const listPanel = document.getElementById('pengumpulan-list-panel');
    const detailPanel = document.getElementById('pengumpulan-detail-panel');
    if (listPanel) listPanel.style.display = 'none';
    if (detailPanel) detailPanel.style.display = 'block';

    // Update Header Welcome Text to Detail mode
    const mainTitle = document.getElementById('page-main-title');
    const mainSubtitle = document.getElementById('page-main-subtitle');
    if (mainTitle) {
        mainTitle.innerHTML = `<button id="btn-back-to-list" class="back-arrow-btn">&larr;</button> Detail Pengumpulan`;

        // Attach back button click
        const btnBack = document.getElementById('btn-back-to-list');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                goBackToList();
            });
        }
    }
    if (mainSubtitle) {
        mainSubtitle.style.display = 'none';
    }

    const studentName = sub.siswa ? sub.siswa.nama : 'Siswa';

    // Populate Student Data
    const nameEl = document.getElementById('detail-student-name');
    const timeEl = document.getElementById('detail-submission-time');
    const avatarContainer = document.getElementById('detail-student-avatar-container');

    if (nameEl) nameEl.textContent = studentName;
    
    // Format Date
    let formattedTime = '';
    if (sub.dikumpul_pada) {
        const dateObj = new Date(sub.dikumpul_pada);
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        formattedTime = isNaN(dateObj.getTime()) ? '' : `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}, ${String(dateObj.getHours()).padStart(2, '0')}.${String(dateObj.getMinutes()).padStart(2, '0')}`;
    }

    if (timeEl) {
        timeEl.textContent = sub.id !== null
            ? `Dikumpulkan pada ${formattedTime}`
            : 'Belum menyerahkan tugas';
    }

    // Dynamic Avatar using student's first initial
    if (avatarContainer) {
        avatarContainer.innerHTML = `
            <div class="student-avatar-circle" style="width: 48px; height: 48px; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; font-weight: 800; border: 1.5px solid #2563eb;">
                ${studentName.charAt(0).toUpperCase()}
            </div>
        `;
    }

    // Populate File Attachment Card
    const fileCard = document.getElementById('detail-file-card');
    const fileNotice = document.getElementById('no-file-submission-notice');
    const fileNameEl = document.getElementById('detail-file-name');
    const fileSizeEl = document.getElementById('detail-file-size');

    if (sub.id !== null && sub.file_path) {
        if (fileCard) {
            fileCard.style.display = 'flex';
            fileCard.style.cursor = 'pointer';
            fileCard.onclick = () => {
                window.open(`${CONFIG.API_BASE_URL.replace('/api', '')}/storage/${sub.file_path}`, '_blank');
            };
        }
        if (fileNotice) fileNotice.style.display = 'none';
        if (fileNameEl) fileNameEl.textContent = sub.file_name || 'Lihat file jawaban';
        
        if (fileSizeEl) fileSizeEl.textContent = 'Buka Berkas PDF/Gambar';
    } else {
        if (fileCard) fileCard.style.display = 'none';
        if (fileNotice) fileNotice.style.display = 'block';
    }

    // Database doesn't have student note column, so show "no note" notice
    const noteBox = document.getElementById('detail-student-note');
    const noteNotice = document.getElementById('no-note-submission-notice');
    if (noteBox) noteBox.style.display = 'none';
    if (noteNotice) noteNotice.style.display = 'block';

    // Populate Score Inputs
    const gradeInput = document.getElementById('detail-grade-input');
    if (gradeInput) {
        gradeInput.value = sub.nilai !== null ? sub.nilai : '';
        gradeInput.disabled = false;
        gradeInput.placeholder = 'Tulis';
    }

    // Populate Feedback Inputs
    const feedbackInput = document.getElementById('detail-feedback-input');
    if (feedbackInput) {
        feedbackInput.value = sub.catatan_guru || '';
        feedbackInput.disabled = false;
        feedbackInput.placeholder = 'Tulis feedback untuk siswa.....';
    }
}

function goBackToList() {
    // Reset panels
    const listPanel = document.getElementById('pengumpulan-list-panel');
    const detailPanel = document.getElementById('pengumpulan-detail-panel');
    if (listPanel) listPanel.style.display = 'block';
    if (detailPanel) detailPanel.style.display = 'none';

    // Reset Title/Subtitle
    const mainTitle = document.getElementById('page-main-title');
    const mainSubtitle = document.getElementById('page-main-subtitle');
    if (mainTitle) {
        mainTitle.textContent = 'Pengumpulan Tugas';
    }
    if (mainSubtitle) {
        mainSubtitle.style.display = 'block';
    }

    activeSubmission = null;
}

async function saveGradeAndFeedback() {
    if (!activeSubmission) return;

    const gradeInput = document.getElementById('detail-grade-input');
    const feedbackInput = document.getElementById('detail-feedback-input');

    const scoreVal = gradeInput && gradeInput.value.trim() !== '' ? parseInt(gradeInput.value.trim()) : null;
    const feedbackVal = feedbackInput ? feedbackInput.value.trim() : '';

    if (scoreVal !== null && (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100)) {
        alert('Masukkan nilai yang valid antara 0 sampai 100.');
        return;
    }

    // ID is 0/placeholder if not submitted yet, otherwise use sub.id
    const submissionId = activeSubmission.id !== null ? activeSubmission.id : 0;

    const payload = {
        nilai: scoreVal,
        catatan_guru: feedbackVal
    };

    // If grading a student who has not submitted yet, send student/task IDs to create record
    if (activeSubmission.id === null) {
        payload.siswa_id = activeSubmission.siswa_id;
        payload.tugas_id = activeSubmission.tugas_id;
    }

    try {
        const response = await apiClient.put(`/pengumpulan/${submissionId}/nilai`, payload);

        if (response.success) {
            alert('Nilai berhasil disimpan!');
            goBackToList();
            await loadAndRenderSubmissions();
        } else {
            alert('Gagal menyimpan nilai: ' + (response.message || 'Error tidak diketahui'));
        }
    } catch (err) {
        console.error(err);
        if (err.errors) {
            const errMsg = Object.values(err.errors).flat().join('\n');
            alert(`Gagal menyimpan nilai:\n${errMsg}`);
        } else {
            alert('Gagal menghubungi server untuk menyimpan nilai.');
        }
    }
}
