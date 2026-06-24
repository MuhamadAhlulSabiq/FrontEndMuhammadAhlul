import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';
import { CONFIG } from '../../config.js';

let selectedTask = null;
let currentFilter = 'semua';
let uploadedFileReal = null;
let globalTasks = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Sidebar
    initSidebar();

    // 1. Initialize user info display
    const user = storage.getUser();
    if (user) {
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = user.name || 'Rohmat';
        
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;
    }

    // 2. Set up logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // 3. Load tasks from API
    await loadAssignments();

    // 4. Tab filtering
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.status;
            renderTugasList();
        });
    });

    // 5. Back to List button
    const backBtn = document.getElementById('btn-back-to-list');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showPanel('list');
            loadAssignments(); // reload list on back
        });
    }

    // 6. Success panel buttons
    const viewTaskBtn = document.getElementById('btn-success-view-task');
    if (viewTaskBtn) {
        viewTaskBtn.addEventListener('click', async () => {
            if (selectedTask) {
                // Re-fetch and show details as "sudah diserahkan"
                await loadAssignments();
                const refreshed = globalTasks.find(item => item.id === selectedTask.id);
                if (refreshed) {
                    loadTaskDetails(refreshed);
                    showPanel('detail');
                }
            }
        });
    }

    const backListBtn = document.getElementById('btn-success-back-to-list');
    if (backListBtn) {
        backListBtn.addEventListener('click', () => {
            loadAssignments();
            showPanel('list');
        });
    }

    // 7. File upload trigger & Drag-and-Drop Dropzone
    const dropzone = document.getElementById('dropzone-area');
    const fileInput = document.getElementById('assignment-file-input');
    const dropzoneText = document.getElementById('dropzone-text');

    if (dropzone && fileInput) {
        // Trigger file selection on click
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });

        // Dragover effect
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#1552C6';
            dropzone.style.backgroundColor = 'rgba(21, 82, 198, 0.05)';
        });

        // Dragleave effect
        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = '#cbd5e1';
            dropzone.style.backgroundColor = 'transparent';
        });

        // Drop file
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#10b981'; // Green on success
            dropzone.style.backgroundColor = 'transparent';

            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                fileInput.files = e.dataTransfer.files; // Set input files
                handleSelectedFile(file);
            }
        });

        // Normal file input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                handleSelectedFile(file);
            }
        });
    }

    function handleSelectedFile(file) {
        uploadedFileReal = file;
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        if (dropzoneText) {
            dropzoneText.textContent = `Berkas terpilih: ${file.name} (${fileSizeMB} MB)`;
        }
        if (dropzone) {
            dropzone.style.borderColor = '#10b981';
        }
    }

    // 8. Submit Form (Real upload to API)
    const uploadForm = document.getElementById('assignment-upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!uploadedFileReal) {
                alert('Silakan pilih berkas jawaban Anda terlebih dahulu!');
                return;
            }

            if (selectedTask) {
                const formData = new FormData();
                formData.append('file_jawaban', uploadedFileReal);

                try {
                    const response = await fetch(`${CONFIG.API_BASE_URL}/tugas/${selectedTask.id}/kumpul`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${storage.getToken()}`,
                            'Accept': 'application/json'
                        },
                        body: formData
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        // Format current date/time for success screen
                        const now = new Date();
                        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                        const timeStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
                        
                        document.getElementById('success-assignment-name').textContent = selectedTask.judul;
                        document.getElementById('success-upload-time').textContent = timeStr;

                        // Reset upload form state
                        uploadForm.reset();
                        uploadedFileReal = null;
                        if (dropzoneText) dropzoneText.textContent = 'Klik atau drag file untuk upload (Maks. 10MB)';
                        if (dropzone) dropzone.style.borderColor = '#cbd5e1';

                        showPanel('success');
                    } else {
                        alert('Gagal mengumpulkan tugas: ' + (result.message || 'Error tidak diketahui'));
                    }
                } catch (err) {
                    console.error(err);
                    alert('Gagal menghubungi server untuk mengumpulkan tugas.');
                }
            }
        });
    }

    // 9. If query param ?id=X exists, open details panel directly
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    if (queryId) {
        const taskId = parseInt(queryId);
        // Wait until loadAssignments completes
        await loadAssignments();
        const t = globalTasks.find(item => item.id === taskId);
        if (t) {
            loadTaskDetails(t);
            showPanel('detail');
        }
    }
});

async function loadAssignments() {
    const container = document.getElementById('tugas-feed');
    if (!container) return;

    try {
        const response = await apiClient.get('/tugas');
        if (response.success && response.data) {
            globalTasks = response.data;
            renderTugasList();
        } else {
            container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal memuat tugas dari server.</div>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal memuat daftar tugas. Pastikan server backend menyala.</div>';
    }
}

function getClassCode(subjectName) {
    if (!subjectName) return 'pkn';
    const name = subjectName.toLowerCase();
    if (name.includes('ing') || name.includes('english')) return 'ing';
    if (name.includes('mat') || name.includes('mtk') || name.includes('hitung')) return 'mtk';
    if (name.includes('ipa') || name.includes('sains') || name.includes('fis') || name.includes('kim') || name.includes('bio')) return 'ipa';
    return 'pkn';
}

function renderTugasList() {
    const container = document.getElementById('tugas-feed');
    if (!container) return;
    
    // Filter database
    const filtered = globalTasks.filter(t => {
        const hasSubmitted = t.pengumpulan && t.pengumpulan.length > 0;
        const status = hasSubmitted ? 'sudah' : 'belum';
        
        if (currentFilter === 'semua') return true;
        return status === currentFilter;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📝</span>
                <p>Tidak ada tugas untuk kategori ini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(t => {
        const hasSubmitted = t.pengumpulan && t.pengumpulan.length > 0;
        const statusClass = hasSubmitted ? 'sudah' : 'belum';
        const badgeLabel = hasSubmitted ? 'Sudah Diserahkan' : 'Belum Diserahkan';
        const className = t.kelas ? t.kelas.nama_kelas : 'Tugas';
        const classCode = getClassCode(className);
        
        const deadlineDate = t.deadline ? new Date(t.deadline) : null;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const deadlineStr = deadlineDate && !isNaN(deadlineDate.getTime())
            ? `${deadlineDate.getDate()} ${months[deadlineDate.getMonth()]} ${deadlineDate.getFullYear()}`
            : '-';

        return `
            <div class="list-item" data-id="${t.id}" style="animation: fadeIn 0.3s ease;">
                <div class="item-left">
                    <div class="item-icon-box ${classCode}" style="display: flex; align-items: center; justify-content: center; font-weight: 800;">
                        ${classCode === 'mtk' ? '✕' : (classCode === 'ing' ? 'En' : (classCode === 'ipa' ? 'Sci' : 'Pkn'))}
                    </div>
                    <div class="item-details">
                        <h4 style="font-weight: 700; color: #111827;">${t.judul}</h4>
                        <p style="color: #64748b; font-size: 0.85rem; margin-top: 2px;">Deadline: ${deadlineStr} - ${className}</p>
                    </div>
                </div>
                <div class="item-right">
                    <span class="badge-status ${statusClass}">${badgeLabel}</span>
                </div>
            </div>
        `;
    }).join('');

    // Attach click listeners to view details
    container.querySelectorAll('.list-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const tObj = globalTasks.find(item => item.id === id);
            if (tObj) {
                loadTaskDetails(tObj);
                showPanel('detail');
            }
        });
    });
}

function loadTaskDetails(t) {
    selectedTask = t;

    document.getElementById('detail-tugas-title').textContent = t.judul;
    
    const deadlineDate = t.deadline ? new Date(t.deadline) : null;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const deadlineStr = deadlineDate && !isNaN(deadlineDate.getTime())
        ? `${deadlineDate.getDate()} ${months[deadlineDate.getMonth()]} ${deadlineDate.getFullYear()}, ${String(deadlineDate.getHours()).padStart(2, '0')}.${String(deadlineDate.getMinutes()).padStart(2, '0')}`
        : '-';

    document.getElementById('detail-tugas-deadline').textContent = `Deadline: ${deadlineStr}`;
    document.getElementById('detail-tugas-desc').textContent = t.deskripsi || 'Tidak ada deskripsi tambahan.';

    // Task attachment download link (if uploaded by teacher)
    const attachmentBox = document.getElementById('detail-attachment-name');
    const attachmentSize = document.getElementById('detail-attachment-size');
    const attachmentCard = document.querySelector('.lampiran-card');

    if (t.attachment_path) {
        if (attachmentCard) {
            attachmentCard.style.display = 'flex';
            attachmentCard.style.cursor = 'pointer';
            attachmentCard.onclick = () => {
                window.open(`${CONFIG.API_BASE_URL.replace('/api', '')}/storage/${t.attachment_path}`, '_blank');
            };
        }
        if (attachmentBox) attachmentBox.textContent = t.attachment_name || 'Berkas Lampiran Tugas.pdf';
        if (attachmentSize) attachmentSize.textContent = 'Buka/Unduh Lampiran';
    } else {
        if (attachmentCard) attachmentCard.style.display = 'none';
    }

    // Teacher details
    const teacherName = t.guru ? t.guru.nama : 'Guru Pengampu';
    const teacherImg = document.querySelector('.teacher-avatar');
    if (teacherImg) {
        teacherImg.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=guru_${t.guru_id || 'seed'}`;
    }
    
    const teacherNameEl = document.querySelector('.teacher-name');
    if (teacherNameEl) teacherNameEl.textContent = teacherName;
    
    const teacherSubjectEl = document.querySelector('.teacher-subject');
    if (teacherSubjectEl) {
        teacherSubjectEl.textContent = t.kelas ? t.kelas.jurusan || 'Mata Pelajaran' : 'Umum';
    }

    // Check submission status
    const hasSubmitted = t.pengumpulan && t.pengumpulan.length > 0;
    const submission = hasSubmitted ? t.pengumpulan[0] : null;

    // Status badge
    const badge = document.getElementById('detail-tugas-badge');
    if (badge) {
        badge.className = `badge-status ${hasSubmitted ? 'sudah' : 'belum'}`;
        badge.textContent = hasSubmitted ? 'Sudah Diserahkan' : 'Belum Diserahkan';
    }

    // Show/hide submit form based on status
    const uploadForm = document.getElementById('assignment-upload-form');
    const uploadTitle = document.querySelector('.upload-dropzone') ? document.querySelector('.upload-dropzone').parentElement : null;
    
    // Check if there is an existing submitted file details container
    let infoContainer = document.getElementById('detail-submitted-info');
    if (!infoContainer) {
        infoContainer = document.createElement('div');
        infoContainer.id = 'detail-submitted-info';
        infoContainer.style.marginTop = '24px';
        infoContainer.style.padding = '20px';
        infoContainer.style.backgroundColor = '#ecfdf5';
        infoContainer.style.border = '1px solid #a7f3d0';
        infoContainer.style.borderRadius = '12px';
        infoContainer.style.color = '#065f46';
        
        const descSection = document.getElementById('detail-tugas-desc');
        if (descSection && descSection.parentElement) {
            descSection.parentElement.appendChild(infoContainer);
        }
    }

    if (hasSubmitted && submission) {
        if (uploadForm) uploadForm.style.display = 'none';
        if (uploadTitle) uploadTitle.style.display = 'none';
        
        // Format Submission Date
        let submitTimeStr = '-';
        if (submission.dikumpul_pada) {
            const submitDate = new Date(submission.dikumpul_pada);
            submitTimeStr = isNaN(submitDate.getTime()) ? '-' : `${submitDate.getDate()} ${months[submitDate.getMonth()]} ${submitDate.getFullYear()}, ${String(submitDate.getHours()).padStart(2, '0')}.${String(submitDate.getMinutes()).padStart(2, '0')}`;
        }

        infoContainer.style.display = 'block';
        infoContainer.innerHTML = `
            <h4 style="margin: 0 0 8px 0; font-weight: 800; font-size: 1.05rem;">✓ Berkas Jawaban Telah Terkirim</h4>
            <p style="margin: 0 0 4px 0; font-size: 0.95rem;"><strong>File:</strong> ${submission.file_name || 'jawaban.pdf'}</p>
            <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: #047857;"><strong>Dikumpulkan pada:</strong> ${submitTimeStr}</p>
            ${submission.nilai !== null && submission.nilai !== undefined ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #a7f3d0;">
                    <p style="margin: 0 0 4px 0; font-size: 1.1rem; color: #065f46;"><strong>Nilai Anda: <span style="font-size: 1.3rem; font-weight: 800; color: #059669;">${submission.nilai}</span> / 100</strong></p>
                    <p style="margin: 0; font-size: 0.9rem; font-style: italic; color: #047857;"><strong>Catatan Guru:</strong> ${submission.catatan_guru || '-'}</p>
                </div>
            ` : `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #a7f3d0; color: #047857; font-size: 0.9rem; font-style: italic;">
                    Menunggu penilaian dari guru.
                </div>
            `}
        `;
    } else {
        if (uploadForm) uploadForm.style.display = 'flex';
        if (uploadTitle) uploadTitle.style.display = 'block';
        infoContainer.style.display = 'none';
    }
}

function showPanel(panelName) {
    const listPanel = document.getElementById('tugas-list-panel');
    const detailPanel = document.getElementById('tugas-detail-panel');
    const successPanel = document.getElementById('tugas-success-panel');

    const pageTitle = document.getElementById('tugas-main-title');
    const pageSubtitle = document.getElementById('tugas-main-subtitle');

    if (listPanel) listPanel.style.display = 'none';
    if (detailPanel) detailPanel.style.display = 'none';
    if (successPanel) successPanel.style.display = 'none';

    if (panelName === 'list') {
        if (listPanel) listPanel.style.display = 'block';
        if (pageTitle) pageTitle.textContent = 'Tugas';
        if (pageSubtitle) pageSubtitle.textContent = 'Daftar penugasan dan status pengerjaan Anda.';
    } else if (panelName === 'detail') {
        if (detailPanel) detailPanel.style.display = 'block';
        if (pageTitle) pageTitle.textContent = 'Detail Tugas';
        if (pageSubtitle) pageSubtitle.textContent = 'Informasi deskripsi dan formulir pengumpulan tugas.';
    } else if (panelName === 'success') {
        if (successPanel) successPanel.style.display = 'block';
        if (pageTitle) pageTitle.textContent = 'Pengumpulan Berhasil';
        if (pageSubtitle) pageSubtitle.textContent = 'Status konfirmasi pengumpulan berkas jawaban Anda.';
    }
}
