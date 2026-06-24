import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';
import { CONFIG } from '../../config.js';

let activeTab = 'semua';
let selectedThread = null;
let replyingToCommentId = null;
let currentUser = null;
let globalThreads = [];
let globalSubjects = [];
let globalClasses = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize teacher profile display
    currentUser = storage.getUser();
    if (currentUser) {
        let displayName = currentUser.name || 'Bu Nina';
        let cleanName = displayName.replace(/^Bu\s+/, '');
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = cleanName;
    }

    // Load initial data (mapel, kelas, threads)
    await loadInitialData();

    // Tab filtering
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;
            renderForumList();
        });
    });

    // Create discussion panel triggers
    const createDiscussionBtn = document.getElementById('btn-create-discussion');
    if (createDiscussionBtn) {
        createDiscussionBtn.addEventListener('click', () => {
            showPanel('create');
        });
    }

    const cancelCreateTop = document.getElementById('btn-cancel-create-top');
    if (cancelCreateTop) {
        cancelCreateTop.addEventListener('click', () => {
            showPanel('list');
        });
    }

    const cancelCreateBottom = document.getElementById('btn-cancel-create-bottom');
    if (cancelCreateBottom) {
        cancelCreateBottom.addEventListener('click', () => {
            showPanel('list');
        });
    }

    // Back to list from detail
    const backBtn = document.getElementById('btn-back-to-list');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            setReplyMode(null);
            loadAndRefreshFeed();
            showPanel('list');
        });
    }

    // Cancel reply indicator trigger
    const cancelReplyBtn = document.getElementById('btn-cancel-reply');
    if (cancelReplyBtn) {
        cancelReplyBtn.addEventListener('click', () => {
            setReplyMode(null);
        });
    }

    // Create Thread submit handler
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
                    alert('Gagal mempublikasikan diskusi: ' + (response.message || 'Error tidak diketahui'));
                }
            } catch (err) {
                console.error(err);
                if (err.errors) {
                    const errMsg = Object.values(err.errors).flat().join('\n');
                    alert(`Gagal mempublikasikan diskusi:\n${errMsg}`);
                } else {
                    alert('Gagal menghubungi server untuk mempublikasikan diskusi.');
                }
            }
        });
    }

    // Post comment submit handler
    const commentForm = document.getElementById('comment-post-form');
    const commentTextInput = document.getElementById('comment-text-input');

    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = commentTextInput.value.trim();
            if (val && selectedThread) {
                try {
                    const response = await apiClient.post(`/forum/${selectedThread.id}/komentar`, {
                        konten: val,
                        parent_id: replyingToCommentId ? parseInt(replyingToCommentId) : null
                    });

                    if (response.success) {
                        commentTextInput.value = '';
                        setReplyMode(null);
                        
                        // Fetch fresh comments list
                        await loadThreadDetails(selectedThread.id);
                    } else {
                        alert('Gagal mengirim tanggapan: ' + (response.message || 'Error tidak diketahui'));
                    }
                } catch (err) {
                    console.error(err);
                    alert('Gagal mengirim tanggapan ke server.');
                }
            }
        });
    }
});

async function loadInitialData() {
    try {
        // Fetch mapel, kelas, and threads in parallel
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
            container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal mengambil data diskusi.</div>';
        }
    } catch (err) {
        console.error('Error fetching forum feed:', err);
        container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal memuat feed diskusi. Pastikan server backend menyala.</div>';
    }
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

function getThreadIcon(t) {
    const title = t.judul.toLowerCase();
    const code = t.mapel && t.mapel.nama_mapel ? t.mapel.nama_mapel.toLowerCase() : '';

    if (title.includes('tugas') || title.includes('pecahan')) {
        return `
            <div class="item-icon-box notebook-icon-theme">
                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
            </div>
        `;
    } else if (code.includes('matematika') || code.includes('mtk')) {
        return `
            <div class="item-icon-box math-icon-theme">
                √x
            </div>
        `;
    } else if (code.includes('inggris') || code.includes('english')) {
        return `
            <div class="item-icon-box english-icon-theme">
                En
            </div>
        `;
    } else {
        return `
            <div class="item-icon-box default-icon-theme">
                ?
            </div>
        `;
    }
}

function renderForumList() {
    const container = document.getElementById('forum-feed');
    if (!container) return;

    const filtered = globalThreads.filter(t => {
        if (activeTab === 'semua') return true;
        
        // Tab "Saya" checks if current teacher is the creator of the thread
        const creatorId = t.pembuat ? t.pembuat.id : null;
        const myId = currentUser ? currentUser.id : null;
        return creatorId === myId;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Belum ada diskusi kelas.</div>';
        return;
    }

    container.innerHTML = filtered.map(t => {
        const title = t.judul;
        const subjectLabel = t.mapel ? t.mapel.nama_mapel : 'Materi Umum';
        const viewsCount = t.jumlah_dilihat || 0;
        const commentCount = t.jumlah_komentar || 0;
        const timeAgo = formatTimeAgo(t.created_at);

        return `
            <div class="list-item" data-id="${t.id}" style="animation: fadeIn 0.3s ease;">
                <div class="item-left">
                    ${getThreadIcon(t)}
                    <div class="item-details">
                        <h4 style="font-weight: 800; color: #111827; margin: 0 0 6px 0;">${title}</h4>
                        <div style="display: flex; align-items: center; gap: 16px; font-size: 0.88rem; color: #888888; font-weight: 600;">
                            <span>${subjectLabel}</span>
                            <span style="display: inline-flex; align-items: center; gap: 4px;">
                                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                                ${viewsCount}
                            </span>
                            <span style="display: inline-flex; align-items: center; gap: 4px;">
                                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                ${commentCount}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="item-right">
                    <span class="item-date">${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');

    // Attach click events to feed items
    container.querySelectorAll('.list-item').forEach(item => {
        item.addEventListener('click', async () => {
            const id = parseInt(item.dataset.id);
            await loadThreadDetails(id);
        });
    });
}

async function loadThreadDetails(id) {
    try {
        const response = await apiClient.get(`/forum/${id}`);
        if (response.success && response.data) {
            selectedThread = response.data;
            
            const titleEl = document.getElementById('detail-post-title');
            const subjectEl = document.getElementById('detail-post-subject');
            const bodyEl = document.getElementById('detail-post-body');
            const timeEl = document.getElementById('detail-post-time');
            const authorDisplayEl = document.getElementById('detail-author-display');
            const avatarContainer = document.getElementById('detail-author-avatar-container');

            const authorName = selectedThread.pembuat ? selectedThread.pembuat.nama : 'User';
            const authorRole = selectedThread.pembuat ? selectedThread.pembuat.role : 'User';
            const subjectLabel = selectedThread.mapel ? selectedThread.mapel.nama_mapel : 'Materi Umum';
            const timeAgo = formatTimeAgo(selectedThread.created_at);

            if (titleEl) titleEl.textContent = selectedThread.judul;
            if (subjectEl) subjectEl.textContent = subjectLabel;
            if (bodyEl) bodyEl.textContent = selectedThread.konten;
            if (timeEl) timeEl.textContent = `Dibuat ${timeAgo}`;
            if (authorDisplayEl) authorDisplayEl.textContent = `${authorName} (${authorRole})`;

            // Custom avatar initial circle
            if (avatarContainer) {
                avatarContainer.innerHTML = `
                    <div class="student-avatar-circle" style="width: 44px; height: 44px; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; border: 1.5px solid #2563eb;">
                        ${authorName.charAt(0).toUpperCase()}
                    </div>
                `;
            }

            setReplyMode(null);
            renderCommentsList(selectedThread.komentar || []);
            showPanel('detail');
        }
    } catch (err) {
        console.error('Error fetching thread details:', err);
        alert('Gagal mengambil detail diskusi dari server.');
    }
}

function setReplyMode(commentId, commentAuthor) {
    const indicator = document.getElementById('reply-indicator');
    const targetName = document.getElementById('reply-target-name');
    const commentInput = document.getElementById('comment-text-input');

    if (commentId) {
        replyingToCommentId = commentId;
        if (targetName) targetName.textContent = commentAuthor;
        if (indicator) indicator.style.display = 'flex';
        if (commentInput) {
            commentInput.placeholder = `Membalas ${commentAuthor}...`;
            commentInput.focus();
        }
    } else {
        replyingToCommentId = null;
        if (indicator) indicator.style.display = 'none';
        if (commentInput) {
            commentInput.placeholder = 'Tulis komentar.....';
        }
    }
}

function renderCommentsList(commentsList) {
    const container = document.getElementById('comments-list-box');
    const commentsHeader = document.getElementById('comments-count-header');

    if (!commentsList) commentsList = [];

    // Total count including nested replies
    const totalComments = commentsList.reduce((acc, c) => acc + 1 + (c.balasan ? c.balasan.length : 0), 0);

    if (commentsHeader) {
        commentsHeader.textContent = `${totalComments} Komentar`;
    }

    if (!container) return;

    if (commentsList.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 10px; border-top: 1.5px solid #e5e7eb; border-bottom: 1.5px solid #e5e7eb;">Belum ada tanggapan.</div>';
        return;
    }

    let html = '';
    commentsList.forEach(c => {
        const parentAuthor = c.penulis ? c.penulis.nama : 'User';
        const parentTime = formatTimeAgo(c.created_at);
        const isParentDeletable = currentUser && c.penulis && (c.penulis.id === currentUser.id || currentUser.role === 'admin');

        const parentAvatarHtml = `<div class="comment-avatar-circle" style="width: 38px; height: 38px; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem;">${parentAuthor.charAt(0).toUpperCase()}</div>`;

        html += `
            <div class="comment-item-custom" style="animation: fadeIn 0.3s ease;">
                ${parentAvatarHtml}
                <div class="comment-details-box">
                    <div class="comment-author-row">
                        <span class="comment-author-name" style="font-weight: 800; color: #111827;">${parentAuthor}</span>
                        <span class="comment-post-time" style="font-size: 0.88rem; color: #888888; font-weight: 500;">${parentTime}</span>
                    </div>
                    <p class="comment-text-content" style="font-size: 0.95rem; color: #4b5563; font-weight: 500; line-height: 1.5; margin: 0 0 10px 0;">${c.konten}</p>
                    <div class="comment-actions-bar" style="display: flex; gap: 8px; align-items: center;">
                        <span class="comment-action-reply" data-id="${c.id}" data-author="${parentAuthor}" style="color: #0d52cd; font-weight: 700; font-size: 0.88rem; cursor: pointer;">Balas</span>
                        ${isParentDeletable ? `
                            <span class="comment-action-divider" style="color: #cbd5e1; font-size: 0.88rem;">&bull;</span>
                            <span class="comment-action-delete" data-id="${c.id}" style="color: #ef4444; font-weight: 700; font-size: 0.88rem; cursor: pointer;">Hapus</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Nested Replies
        if (c.balasan && c.balasan.length > 0) {
            c.balasan.forEach(r => {
                const replyAuthor = r.penulis ? r.penulis.nama : 'User';
                const replyTime = formatTimeAgo(r.created_at);
                const isReplyDeletable = currentUser && r.penulis && (r.penulis.id === currentUser.id || currentUser.role === 'admin');

                const replyAvatarHtml = `<div class="comment-avatar-circle" style="width: 30px; height: 30px; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">${replyAuthor.charAt(0).toUpperCase()}</div>`;

                html += `
                    <div class="comment-reply-nested" style="animation: fadeIn 0.3s ease;">
                        ${replyAvatarHtml}
                        <div class="comment-details-box">
                            <div class="comment-author-row">
                                <span class="comment-author-name" style="font-weight: 800; color: #111827;">${replyAuthor}</span>
                                <span class="comment-post-time" style="font-size: 0.88rem; color: #888888; font-weight: 500;">${replyTime}</span>
                            </div>
                            <p class="comment-text-content" style="font-size: 0.95rem; color: #4b5563; font-weight: 500; line-height: 1.5; margin: 0 0 10px 0;">${r.konten}</p>
                            <div class="comment-actions-bar" style="display: flex; gap: 8px; align-items: center;">
                                ${isReplyDeletable ? `
                                    <span class="comment-action-delete" data-id="${r.id}" style="color: #ef4444; font-weight: 700; font-size: 0.88rem; cursor: pointer;">Hapus</span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    });

    container.innerHTML = html;

    // Bind Balas click event
    container.querySelectorAll('.comment-action-reply').forEach(btn => {
        btn.addEventListener('click', () => {
            const commentId = btn.dataset.id;
            const commentAuthor = btn.dataset.author;
            setReplyMode(commentId, commentAuthor);
        });
    });

    // Bind Hapus click event
    container.querySelectorAll('.comment-action-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const commentId = parseInt(btn.dataset.id);

            if (confirm('Apakah Anda yakin ingin menghapus tanggapan ini?')) {
                try {
                    const response = await apiClient.delete(`/komentar/${commentId}`);
                    if (response.success) {
                        // Refresh details
                        await loadThreadDetails(selectedThread.id);
                    } else {
                        alert('Gagal menghapus komentar: ' + (response.message || 'Error tidak diketahui'));
                    }
                } catch (err) {
                    console.error('Error deleting comment:', err);
                    alert('Gagal menghubungi server untuk menghapus komentar.');
                }
            }
        });
    });
}

function showPanel(panelName) {
    const listPanel = document.getElementById('forum-list-panel');
    const createPanel = document.getElementById('forum-create-panel');
    const detailPanel = document.getElementById('forum-detail-panel');

    const pageTitle = document.getElementById('forum-main-title');
    const pageSubtitle = document.getElementById('forum-main-subtitle');

    if (listPanel) listPanel.style.display = 'none';
    if (createPanel) createPanel.style.display = 'none';
    if (detailPanel) detailPanel.style.display = 'none';

    if (panelName === 'list') {
        if (listPanel) listPanel.style.display = 'block';
        if (pageTitle) {
            pageTitle.style.display = 'block';
            pageTitle.textContent = 'Forum Diskusi';
        }
        if (pageSubtitle) {
            pageSubtitle.style.display = 'block';
            pageSubtitle.textContent = 'Kelola dan berpartisipasi dalam diskusi kelas bersama siswa.';
        }
    } else if (panelName === 'create') {
        if (createPanel) createPanel.style.display = 'block';
        if (pageTitle) {
            pageTitle.style.display = 'block';
            pageTitle.textContent = 'Buat Diskusi Baru';
        }
        if (pageSubtitle) {
            pageSubtitle.style.display = 'block';
            pageSubtitle.textContent = 'Mulai topik pembahasan baru di kelas.';
        }
    } else if (panelName === 'detail') {
        if (detailPanel) detailPanel.style.display = 'block';
        if (pageTitle) pageTitle.textContent = 'Detail Diskusi';
        if (pageSubtitle) pageSubtitle.style.display = 'none';
    }
}
