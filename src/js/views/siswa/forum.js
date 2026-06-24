import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

let activeTab = 'semua';
let selectedThread = null;
let currentUser = null;
let globalThreads = [];
let globalSubjects = [];
let globalClasses = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Sidebar
    initSidebar();

    // 1. Initialize user info display
    currentUser = storage.getUser();
    if (currentUser) {
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = currentUser.name || 'Rohmat';

        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${currentUser.id || 'seed'}`;
    }

    // 2. Set up logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // Load initial data (mapel, kelas, threads)
    await loadInitialData();

    // 3. Tab filtering listener
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;
            renderForumList();
        });
    });

    // 4. Switch to Create Panel
    const createDiscussionBtn = document.getElementById('btn-create-discussion');
    if (createDiscussionBtn) {
        createDiscussionBtn.addEventListener('click', () => {
            showPanel('create');
        });
    }

    // 5. Cancel creation listeners
    const cancelCreateTop = document.getElementById('btn-cancel-create-top');
    if (cancelCreateTop) {
        cancelCreateTop.addEventListener('click', () => {
            showPanel('list');
        });
    }
    const cancelCreate = document.getElementById('btn-cancel-create');
    if (cancelCreate) {
        cancelCreate.addEventListener('click', () => {
            showPanel('list');
        });
    }

    // 6. Back to List from details
    const backToForumBtn = document.getElementById('btn-back-to-forum');
    if (backToForumBtn) {
        backToForumBtn.addEventListener('click', async () => {
            await loadAndRefreshFeed();
            showPanel('list');
        });
    }

    // 7. Handle Create Discussion Form Submit
    const createForm = document.getElementById('create-discussion-form');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('discussion-title').value.trim();
            const mapelId = parseInt(document.getElementById('discussion-subject').value);
            const body = document.getElementById('discussion-body').value.trim();

            try {
                const response = await apiClient.post('/forum', {
                    judul: title,
                    konten: body,
                    mapel_id: mapelId
                });

                if (response.success) {
                    alert('Topik diskusi baru berhasil dipublikasikan!');
                    createForm.reset();
                    await loadAndRefreshFeed();
                    showPanel('list');
                } else {
                    alert('Gagal membuat diskusi: ' + (response.message || 'Error tidak diketahui'));
                }
            } catch (err) {
                console.error(err);
                alert('Gagal menghubungi server untuk membuat diskusi.');
            }
        });
    }

    // 8. Handle Submit Comment Form
    const commentForm = document.getElementById('comment-post-form');
    const commentText = document.getElementById('comment-input-text');

    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const textVal = commentText.value.trim();
            if (textVal && selectedThread) {
                try {
                    const response = await apiClient.post(`/forum/${selectedThread.id}/komentar`, {
                        konten: textVal
                    });

                    if (response.success) {
                        commentText.value = '';
                        await loadThreadDetails(selectedThread.id);
                    } else {
                        alert('Gagal mengirim komentar: ' + (response.message || 'Error tidak diketahui'));
                    }
                } catch (err) {
                    console.error(err);
                    alert('Gagal memposting komentar ke server.');
                }
            }
        });
    }
});

async function loadInitialData() {
    try {
        const [mapelRes, classesRes] = await Promise.all([
            apiClient.get('/mapel'),
            apiClient.get('/kelas')
        ]);

        if (mapelRes.success) globalSubjects = mapelRes.data || [];
        if (classesRes.success) globalClasses = classesRes.data || [];

        populateFormDropdowns();
        await loadAndRefreshFeed();

    } catch (err) {
        console.error('Error loading initial data:', err);
    }
}

function populateFormDropdowns() {
    const subjectSelect = document.getElementById('discussion-subject');
    const classSelect = document.getElementById('discussion-class');

    // Populate Subjects
    if (subjectSelect && globalSubjects.length > 0) {
        subjectSelect.innerHTML = '<option value="" disabled selected>-- Pilih Pelajaran --</option>' +
            globalSubjects.map(s => `<option value="${s.id}">${s.nama_mapel}</option>`).join('');
    }

    // Populate Classes
    if (classSelect && globalClasses.length > 0) {
        classSelect.innerHTML = '<option value="" disabled selected>-- Pilih Kelas --</option>' +
            globalClasses.map(c => `<option value="${c.id}">${c.nama_kelas}</option>`).join('');
    }
}

async function loadAndRefreshFeed() {
    const container = document.getElementById('forum-feed');
    if (!container) return;

    try {
        const response = await apiClient.get('/forum');
        if (response.success && response.data) {
            globalThreads = response.data;
            renderForumList();
        } else {
            container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal memuat feed forum.</div>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal memuat diskusi.</div>';
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

function formatTimeAgo(dateString) {
    if (!dateString) return 'Baru saja';
    const dateObj = new Date(dateString);
    const now = new Date();
    const diffMs = now - dateObj;

    if (isNaN(dateObj.getTime()) || diffMs < 0) return 'Baru saja';

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

function renderForumList() {
    const container = document.getElementById('forum-feed');
    if (!container) return;

    // Filter list
    const filtered = globalThreads.filter(d => {
        if (activeTab === 'semua') return true;
        // isMine: check if author ID matches current student ID
        return d.user_id === currentUser.id;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">💬</span>
                <p>Belum ada diskusi.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(d => {
        const subjectTitle = d.mapel ? d.mapel.nama_mapel : 'Diskusi';
        const classCode = getClassCode(subjectTitle);
        const timeStr = formatTimeAgo(d.created_at);
        const commentCount = d.jumlah_komentar ?? 0;

        return `
            <div class="list-item" data-id="${d.id}" style="animation: fadeIn 0.3s ease;">
                <div class="item-left">
                    <div class="item-icon-box ${classCode}" style="display: flex; align-items: center; justify-content: center; font-weight: 800;">
                        ${classCode === 'mtk' ? '✕' : (classCode === 'ing' ? 'En' : (classCode === 'ipa' ? 'Sci' : 'Pkn'))}
                    </div>
                    <div class="item-details">
                        <h4 style="font-weight: 700; color: #111827;">${d.judul}</h4>
                        <p style="color: #64748b; font-size: 0.85rem; margin-top: 2px;">${subjectTitle}</p>
                    </div>
                </div>
                <div class="item-right">
                    <span style="font-size: 0.9rem; color: #888888; font-weight: 600; display: flex; gap: 12px; margin-right: 12px;">
                        <span>💬 ${commentCount}</span>
                    </span>
                    <span class="item-date">${timeStr}</span>
                </div>
            </div>
        `;
    }).join('');

    // Attach click events
    container.querySelectorAll('.list-item').forEach(item => {
        item.addEventListener('click', async () => {
            const id = parseInt(item.dataset.id);
            await loadThreadDetails(id);
            showPanel('detail');
        });
    });
}

async function loadThreadDetails(threadId) {
    try {
        const response = await apiClient.get(`/forum/${threadId}`);
        if (response.success && response.data) {
            const t = response.data;
            selectedThread = t;

            const subjectTitle = t.mapel ? t.mapel.nama_mapel : 'Diskusi';
            const authorName = t.pembuat ? t.pembuat.nama : 'Anonymous';
            const authorRole = t.pembuat ? (t.pembuat.role === 'guru' ? 'Guru' : 'Siswa') : 'Pengguna';
            const timeStr = formatTimeAgo(t.created_at);

            document.getElementById('detail-forum-title').textContent = t.judul;
            document.getElementById('detail-forum-subject').textContent = `${subjectTitle}`;

            document.getElementById('detail-forum-author-avatar').src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${authorRole.toLowerCase()}_${t.user_id || 'seed'}`;
            document.getElementById('detail-forum-author-name').textContent = authorName;
            document.getElementById('detail-forum-author-role').textContent = authorRole;
            document.getElementById('detail-forum-time').textContent = timeStr;
            document.getElementById('detail-forum-body').textContent = t.konten;

            renderCommentsFeed(t.komentar || []);
        }
    } catch (err) {
        console.error(err);
        alert('Gagal memuat detail diskusi.');
    }
}

function renderCommentsFeed(commentsList) {
    const countTitle = document.getElementById('comments-count-title');
    if (countTitle) countTitle.textContent = `${commentsList.length} Komentar`;

    const commentsContainer = document.getElementById('comments-list-feed');
    if (!commentsContainer) return;

    if (commentsList.length === 0) {
        commentsContainer.innerHTML = `
            <div class="empty-state" style="padding: 20px;">
                <p>Belum ada komentar. Jadilah yang pertama membalas!</p>
            </div>
        `;
        return;
    }

    commentsContainer.innerHTML = commentsList.map(c => {
        const authorName = c.penulis ? c.penulis.nama : 'Anonymous';
        const authorRole = c.penulis ? (c.penulis.role === 'guru' ? 'Guru' : 'Siswa') : 'Siswa';
        const timeStr = formatTimeAgo(c.created_at);

        return `
            <div class="comment-item" style="animation: fadeIn 0.25s ease;">
                <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=${authorRole.toLowerCase()}_${c.user_id || 'seed'}" alt="${authorName}" class="teacher-avatar">
                <div class="comment-bubble-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="comment-author">${authorName}</span>
                            <span class="badge" style="background-color: ${authorRole === 'Guru' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(21, 82, 198, 0.1)'}; color: ${authorRole === 'Guru' ? '#ef4444' : '#1552C6'}; font-weight: 800; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px;">${authorRole}</span>
                        </div>
                        <span class="comment-time">${timeStr}</span>
                    </div>
                    <p class="comment-text">${c.konten}</p>
                </div>
            </div>
        `;
    }).join('');
}

function showPanel(panelName) {
    const listPanel = document.getElementById('forum-list-panel');
    const createPanel = document.getElementById('forum-create-panel');
    const detailPanel = document.getElementById('forum-detail-panel');

    if (listPanel) listPanel.style.display = 'none';
    if (createPanel) createPanel.style.display = 'none';
    if (detailPanel) detailPanel.style.display = 'none';

    if (panelName === 'list') {
        if (listPanel) listPanel.style.display = 'block';
    } else if (panelName === 'create') {
        if (createPanel) createPanel.style.display = 'block';
    } else if (panelName === 'detail') {
        if (detailPanel) detailPanel.style.display = 'block';
    }
}
