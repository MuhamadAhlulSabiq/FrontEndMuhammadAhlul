import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';

let activeStudentId = null;

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

    // Render Submissions Table & Stats
    loadAndRenderSubmissions();

    // Attach Save Grade click listener
    const btnSave = document.getElementById('btn-save-grade');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            saveGradeAndFeedback();
        });
    }
});

function loadAndRenderSubmissions() {
    const container = document.getElementById('submissions-table-body');
    if (!container) return;

    // Load dynamic submissions from storage
    const submissions = storage.getStudentSubmissions();

    // Calculate dynamic stats
    const totalSiswa = 28;
    const sudahCount = submissions.filter(s => s.status === 'Diserahkan').length + 9; // matches 12 default
    const belumCount = totalSiswa - sudahCount; // matches 16 default
    const persentase = Math.round((sudahCount / totalSiswa) * 100);

    const totalEl = document.getElementById('stat-total-siswa');
    const sudahEl = document.getElementById('stat-sudah-diserahkan');
    const belumEl = document.getElementById('stat-belum-diserahkan');
    const persentaseEl = document.getElementById('stat-persentase');

    if (totalEl) totalEl.textContent = totalSiswa;
    if (sudahEl) sudahEl.textContent = sudahCount;
    if (belumEl) belumEl.textContent = belumCount;
    if (persentaseEl) persentaseEl.textContent = `${persentase}%`;

    // Render Table Rows
    container.innerHTML = submissions.map(sub => {
        const badgeClass = sub.status === 'Diserahkan' ? 'status-diserahkan' : 'status-belum';
        const scoreDisplay = sub.score === '-' ? '-' : sub.score;
        const scoreColor = sub.score === '-' ? '#9ca3af' : '#111827';
        
        return `
            <tr data-id="${sub.id}">
                <td>${sub.no}</td>
                <td style="font-weight: 700;">${sub.name}</td>
                <td><span class="${badgeClass}">${sub.status}</span></td>
                <td style="color: #4b5563; font-weight: 600;">${sub.time}</td>
                <td style="font-weight: 800; color: ${scoreColor};">${scoreDisplay}</td>
            </tr>
        `;
    }).join('');

    // Attach click listeners to rows
    container.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', () => {
            const id = parseInt(row.dataset.id);
            openSubmissionDetail(id);
        });
    });
}

function openSubmissionDetail(id) {
    const submissions = storage.getStudentSubmissions();
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    activeStudentId = id;

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

    // Populate Student Data
    const nameEl = document.getElementById('detail-student-name');
    const timeEl = document.getElementById('detail-submission-time');
    const avatarContainer = document.getElementById('detail-student-avatar-container');

    if (nameEl) nameEl.textContent = sub.name;
    if (timeEl) {
        timeEl.textContent = sub.status === 'Diserahkan' 
            ? `Dikumpulkan pada ${sub.time}` 
            : 'Belum menyerahkan tugas';
    }

    // Dynamic Avatar
    if (avatarContainer) {
        avatarContainer.innerHTML = `
            <div class="student-avatar-circle" style="width: 48px; height: 48px; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; font-weight: 800; border: 1.5px solid #2563eb;">
                ${sub.name.charAt(0)}
            </div>
        `;
    }

    // Populate File Attachment Card
    const fileCard = document.getElementById('detail-file-card');
    const fileNotice = document.getElementById('no-file-submission-notice');
    const fileNameEl = document.getElementById('detail-file-name');
    const fileSizeEl = document.getElementById('detail-file-size');

    if (sub.status === 'Diserahkan' && sub.fileName) {
        if (fileCard) fileCard.style.display = 'flex';
        if (fileNotice) fileNotice.style.display = 'none';
        if (fileNameEl) fileNameEl.textContent = sub.fileName;
        if (fileSizeEl) fileSizeEl.textContent = sub.fileSize;
    } else {
        if (fileCard) fileCard.style.display = 'none';
        if (fileNotice) fileNotice.style.display = 'block';
    }

    // Populate Student Note Box
    const noteBox = document.getElementById('detail-student-note');
    const noteNotice = document.getElementById('no-note-submission-notice');

    if (sub.status === 'Diserahkan' && sub.note) {
        if (noteBox) {
            noteBox.style.display = 'block';
            noteBox.textContent = sub.note;
        }
        if (noteNotice) noteNotice.style.display = 'none';
    } else {
        if (noteBox) noteBox.style.display = 'none';
        if (noteNotice) noteNotice.style.display = 'block';
    }

    // Populate Score Inputs
    const gradeInput = document.getElementById('detail-grade-input');
    if (gradeInput) {
        gradeInput.value = sub.score === '-' ? '' : sub.score;
        if (sub.status === 'Belum Diserahkan') {
            gradeInput.disabled = true;
            gradeInput.placeholder = '-';
        } else {
            gradeInput.disabled = false;
            gradeInput.placeholder = 'Tulis';
        }
    }

    // Populate Feedback Inputs
    const feedbackInput = document.getElementById('detail-feedback-input');
    if (feedbackInput) {
        feedbackInput.value = sub.feedback || '';
        if (sub.status === 'Belum Diserahkan') {
            feedbackInput.disabled = true;
            feedbackInput.placeholder = 'Siswa belum mengumpulkan';
        } else {
            feedbackInput.disabled = false;
            feedbackInput.placeholder = 'Tulis feedback untuk siswa.....';
        }
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

    activeStudentId = null;
}

function saveGradeAndFeedback() {
    if (!activeStudentId) return;

    const gradeInput = document.getElementById('detail-grade-input');
    const feedbackInput = document.getElementById('detail-feedback-input');

    const scoreVal = (gradeInput && gradeInput.value.trim()) ? gradeInput.value.trim() : '-';
    const feedbackVal = feedbackInput ? feedbackInput.value.trim() : '';

    // Save to LocalStorage DB
    storage.saveStudentGrade(activeStudentId, scoreVal, feedbackVal);

    // Refresh Submissions List & Stats
    loadAndRenderSubmissions();

    // Navigate Back
    goBackToList();
}
