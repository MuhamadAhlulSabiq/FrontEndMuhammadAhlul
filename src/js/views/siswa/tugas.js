import { storage } from '../../../src/js/utils/storage.js';
import { authApi } from '../../../src/js/api/auth.js';

// Assignments Database matching mockup screens
const TUGAS_DATABASE = [
    {
        id: 1,
        title: 'Tugas Matematika - Bilangan Bulat',
        deadline: '25 Mei 2026 23.59',
        status: 'belum', // belum or sudah
        classCode: 'mtk',
        teacher: 'Bu Nina',
        subject: 'Guru Matematika',
        desc: 'Kerjakan soal berikut dan kumpulkan dalam bentuk pdf\n1. Urutkan bilangan berikut dari data yang terkecil hingga yang terbesar: 15, -8, 0, -2, 4, -12\n2. Hasil dari -15x(-4):6!',
        attachmentName: 'Soal_Tugas_Matematika.pdf',
        attachmentSize: '1.2 MB'
    },
    {
        id: 2,
        title: 'Tugas Bahasa Inggris - Matching',
        deadline: '24 Mei 2026 23.59',
        status: 'belum',
        classCode: 'ing',
        teacher: 'Miss Sarah',
        subject: 'Guru Bahasa Inggris',
        desc: 'Match the words in column A with column B and upload the result in PDF format.',
        attachmentName: 'Vocabulary_Matching.pdf',
        attachmentSize: '890 KB'
    },
    {
        id: 3,
        title: 'Tugas Matematika - Pecahan',
        deadline: '30 April 2026 23.59',
        status: 'sudah',
        classCode: 'mtk',
        teacher: 'Bu Nina',
        subject: 'Guru Matematika',
        desc: 'Selesaikan latihan soal pecahan halaman 45 buku paket Matematika.',
        attachmentName: 'Latihan_Pecahan.pdf',
        attachmentSize: '2.1 MB'
    },
    {
        id: 4,
        title: 'Tugas Bahasa Inggris - Coloring',
        deadline: '26 April 2026 23.59',
        status: 'belum',
        classCode: 'ing',
        teacher: 'Miss Sarah',
        subject: 'Guru Bahasa Inggris',
        desc: 'Color the drawings according to the instructions and upload high-res scan/photos.',
        attachmentName: 'Coloring_Sheet.pdf',
        attachmentSize: '4.5 MB'
    }
];

let selectedTask = null;
let currentFilter = 'semua';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize user info display
    const user = storage.getUser();
    if (user) {
        document.getElementById('user-display-name').textContent = user.name || 'Rohmat';
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;
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
            // Reload details as "sudah diserahkan"
            selectedTask.status = 'sudah';
            loadTaskDetails(selectedTask);
            showPanel('detail');
        }
    });

    document.getElementById('btn-success-back-to-list').addEventListener('click', () => {
        renderTugasList();
        showPanel('list');
    });

    // 7. File upload trigger
    const dropzone = document.getElementById('dropzone-area');
    const fileInput = document.getElementById('assignment-file-input');
    const dropzoneText = document.getElementById('dropzone-text');

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            dropzoneText.textContent = `File terpilih: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
            dropzone.style.borderColor = '#10b981'; // Green
        }
    });

    // 8. Submit Form
    const uploadForm = document.getElementById('assignment-upload-form');
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (selectedTask) {
            // Update local state
            selectedTask.status = 'sudah';
            
            // Format current date/time for success screen (e.g. 25 Mei 2026 15.30)
            const now = new Date();
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const timeStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
            
            document.getElementById('success-assignment-name').textContent = selectedTask.title;
            document.getElementById('success-upload-time').textContent = timeStr;

            // Reset upload form visual states
            uploadForm.reset();
            dropzoneText.textContent = 'Klik atau drag file untuk upload (Maks. 10MB)';
            dropzone.style.borderColor = '#cbd5e1';

            showPanel('success');
        }
    });
});

function renderTugasList() {
    const container = document.getElementById('tugas-feed');
    
    // Filter database
    const filtered = TUGAS_DATABASE.filter(t => {
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
            <div class="list-item" data-id="${t.id}">
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
            const task = TUGAS_DATABASE.find(t => t.id === id);
            if (task) {
                selectedTask = task;
                loadTaskDetails(task);
                showPanel('detail');
            }
        });
    });
}

function loadTaskDetails(t) {
    document.getElementById('detail-tugas-title').textContent = t.title;
    document.getElementById('detail-tugas-deadline').textContent = `Deadline: ${t.deadline}`;
    document.getElementById('detail-tugas-desc').textContent = t.desc;
    document.getElementById('detail-attachment-name').textContent = t.attachmentName;
    document.getElementById('detail-attachment-size').textContent = t.attachmentSize;

    // Teacher details
    const teacherImg = document.querySelector('.teacher-avatar');
    teacherImg.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${t.teacher.replace(/\s+/g, '_')}`;
    document.querySelector('.teacher-name').textContent = t.teacher;
    document.querySelector('.teacher-subject').textContent = t.subject;

    // Status badge
    const badge = document.getElementById('detail-tugas-badge');
    badge.className = `badge-status ${t.status}`;
    badge.textContent = t.status === 'belum' ? 'Belum Diserahkan' : 'Sudah Diserahkan';

    // Show/hide submit form based on status
    const uploadForm = document.getElementById('assignment-upload-form');
    if (t.status === 'sudah') {
        uploadForm.style.display = 'none';
        document.querySelector('.upload-dropzone').parentElement.style.display = 'none';
    } else {
        uploadForm.style.display = 'flex';
        document.querySelector('.upload-dropzone').parentElement.style.display = 'block';
    }
}

function showPanel(panelName) {
    const listPanel = document.getElementById('tugas-list-panel');
    const detailPanel = document.getElementById('tugas-detail-panel');
    const successPanel = document.getElementById('tugas-success-panel');

    const pageTitle = document.getElementById('tugas-main-title');
    const pageSubtitle = document.getElementById('tugas-main-subtitle');

    listPanel.style.display = 'none';
    detailPanel.style.display = 'none';
    successPanel.style.display = 'none';

    if (panelName === 'list') {
        listPanel.style.display = 'block';
        pageTitle.textContent = 'Tugas';
        pageSubtitle.textContent = 'Daftar penugasan dan status pengerjaan Anda.';
    } else if (panelName === 'detail') {
        detailPanel.style.display = 'block';
        pageTitle.textContent = 'Detail Tugas';
        pageSubtitle.textContent = 'Informasi deskripsi dan formulir pengumpulan tugas.';
    } else if (panelName === 'success') {
        successPanel.style.display = 'block';
        pageTitle.textContent = 'Pengumpulan Berhasil';
        pageSubtitle.textContent = 'Status konfirmasi pengumpulan berkas jawaban Anda.';
    }
}
