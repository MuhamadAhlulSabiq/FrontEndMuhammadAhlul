import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';

let selectedTask = null;
let currentFilter = 'semua';
let uploadedFileMock = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize mock database
    storage.initDb();

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

    // 3. Render List
    renderTugasList();

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
    document.getElementById('btn-back-to-list').addEventListener('click', () => {
        showPanel('list');
    });

    // 6. Success panel buttons
    document.getElementById('btn-success-view-task').addEventListener('click', () => {
        if (selectedTask) {
            // Re-load details as "sudah diserahkan"
            loadTaskDetails(selectedTask.id);
            showPanel('detail');
        }
    });

    document.getElementById('btn-success-back-to-list').addEventListener('click', () => {
        renderTugasList();
        showPanel('list');
    });

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
        uploadedFileMock = {
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        };
        dropzoneText.textContent = `Berkas terpilih: ${file.name} (${uploadedFileMock.size})`;
        dropzone.style.borderColor = '#10b981'; // Green success border
    }

    // 8. Submit Form
    const uploadForm = document.getElementById('assignment-upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!uploadedFileMock) {
                alert('Silakan pilih berkas jawaban Anda terlebih dahulu!');
                return;
            }

            if (selectedTask) {
                // Format current date/time for success screen
                const now = new Date();
                const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const timeStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
                
                // Update assignment in localStorage
                storage.updateAssignment(selectedTask.id, {
                    status: 'sudah',
                    submittedFile: uploadedFileMock.name,
                    submittedTime: timeStr
                });

                // Add activity log
                storage.addActivity({
                    title: `Berhasil mengumpulkan ${selectedTask.title}`,
                    time: 'Baru saja',
                    type: 'check',
                    classCode: selectedTask.classCode
                });

                // Render success details
                document.getElementById('success-assignment-name').textContent = selectedTask.title;
                document.getElementById('success-upload-time').textContent = timeStr;

                // Reset upload form state
                uploadForm.reset();
                uploadedFileMock = null;
                dropzoneText.textContent = 'Klik atau drag file untuk upload (Maks. 10MB)';
                dropzone.style.borderColor = '#cbd5e1';

                showPanel('success');
            }
        });
    }
});

function renderTugasList() {
    const container = document.getElementById('tugas-feed');
    if (!container) return;
    
    // Load assignments from localStorage
    const assignments = storage.getAssignments();

    // Filter database
    const filtered = assignments.filter(t => {
        if (currentFilter === 'semua') return true;
        return t.status === currentFilter;
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
        const badgeClass = t.status === 'belum' ? 'belum' : 'sudah';
        const badgeLabel = t.status === 'belum' ? 'Belum Diserahkan' : 'Sudah Diserahkan';
        
        return `
            <div class="list-item" data-id="${t.id}" style="animation: fadeIn 0.3s ease;">
                <div class="item-left">
                    <div class="item-icon-box ${t.classCode}">
                        ${t.classCode === 'mtk' ? '✕' : 'En'}
                    </div>
                    <div class="item-details">
                        <h4>${t.title}</h4>
                        <p>Deadline: ${t.deadline}</p>
                    </div>
                </div>
                <div class="item-right">
                    <span class="badge-status ${badgeClass}">${badgeLabel}</span>
                </div>
            </div>
        `;
    }).join('');

    // Attach click listeners to view details
    container.querySelectorAll('.list-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            loadTaskDetails(id);
            showPanel('detail');
        });
    });
}

function loadTaskDetails(taskId) {
    const assignments = storage.getAssignments();
    const t = assignments.find(item => item.id === taskId);
    if (!t) return;

    selectedTask = t;

    document.getElementById('detail-tugas-title').textContent = t.title;
    document.getElementById('detail-tugas-deadline').textContent = `Deadline: ${t.deadline}`;
    document.getElementById('detail-tugas-desc').textContent = t.desc;
    document.getElementById('detail-attachment-name').textContent = t.attachmentName;
    document.getElementById('detail-attachment-size').textContent = t.attachmentSize;

    // Teacher details
    const teacherImg = document.querySelector('.teacher-avatar');
    if (teacherImg) teacherImg.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${t.teacher.replace(/\s+/g, '_')}`;
    
    const teacherName = document.querySelector('.teacher-name');
    if (teacherName) teacherName.textContent = t.teacher;
    
    const teacherSubject = document.querySelector('.teacher-subject');
    if (teacherSubject) teacherSubject.textContent = t.subject;

    // Status badge
    const badge = document.getElementById('detail-tugas-badge');
    if (badge) {
        badge.className = `badge-status ${t.status}`;
        badge.textContent = t.status === 'belum' ? 'Belum Diserahkan' : 'Sudah Diserahkan';
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

    if (t.status === 'sudah') {
        if (uploadForm) uploadForm.style.display = 'none';
        if (uploadTitle) uploadTitle.style.display = 'none';
        
        infoContainer.style.display = 'block';
        infoContainer.innerHTML = `
            <h4 style="margin: 0 0 8px 0; font-weight: 800; font-size: 1.05rem;">✓ Berkas Jawaban Telah Terkirim</h4>
            <p style="margin: 0 0 4px 0; font-size: 0.95rem;"><strong>File:</strong> ${t.submittedFile || 'jawaban.pdf'}</p>
            <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: #047857;"><strong>Dikumpulkan pada:</strong> ${t.submittedTime || 'Tepat Waktu'}</p>
            ${t.nilai !== undefined ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #a7f3d0;">
                    <p style="margin: 0 0 4px 0; font-size: 1.1rem; color: #065f46;"><strong>Nilai Anda: <span style="font-size: 1.3rem; font-weight: 800; color: #059669;">${t.nilai}</span> / 100</strong></p>
                    <p style="margin: 0; font-size: 0.9rem; font-style: italic; color: #047857;"><strong>Catatan Guru:</strong> ${t.feedback || '-'}</p>
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
