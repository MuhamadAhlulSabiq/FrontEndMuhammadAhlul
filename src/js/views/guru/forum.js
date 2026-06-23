import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';

let activeTab = 'semua';
let selectedThread = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize mock database
    storage.initDb();

    // Initialize teacher profile display
    const user = storage.getUser();
    if (user) {
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = user.name || 'Bu Nina';
        
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=guru_${user.id || 'nina'}`;
    }

    // Render list
    renderForumList();

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
            renderForumList();
            showPanel('list');
        });
    }

    // Create Thread submit handler
    const createForm = document.getElementById('create-discussion-form');
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('discussion-title').value;
            const subjCode = document.getElementById('discussion-subject').value;
            const classLevel = document.getElementById('discussion-class').value;
            const body = document.getElementById('discussion-body').value;

            const subjectLabel = subjCode === 'mtk' ? 'Matematika' : 'Bahasa Inggris';
            const teacherName = user ? user.name : 'Bu Nina';
            const teacherId = user ? user.id : 'nina';

            const newThread = {
                id: Date.now(),
                title: title,
                subject: `${subjectLabel} - Kelas ${classLevel}`,
                classCode: subjCode,
                author: teacherName,
                role: 'Guru',
                authorAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=guru_${teacherId}`,
                time: 'Baru saja',
                body: body,
                views: 0,
                commentCount: 0,
                isMine: true
            };

            storage.addThread(newThread);

            // Add activity log
            storage.addActivity({
                title: `Membuat diskusi baru: "${title}"`,
                time: 'Baru saja',
                type: 'message',
                classCode: subjCode
            });

            createForm.reset();
            renderForumList();
            showPanel('list');
        });
    }

    // Post comment submit handler
    const commentForm = document.getElementById('comment-post-form');
    const commentText = document.getElementById('comment-text-input');

    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = commentText.value.trim();
            if (val && selectedThread) {
                const teacherName = user ? user.name : 'Bu Nina';
                const teacherId = user ? user.id : 'nina';

                const newComment = {
                    id: Date.now(),
                    author: teacherName,
                    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=guru_${teacherId}`,
                    text: val,
                    time: 'Baru saja'
                };

                storage.addComment(selectedThread.id, newComment);

                // Add activity log
                storage.addActivity({
                    title: `Membalas diskusi "${selectedThread.title}"`,
                    time: 'Baru saja',
                    type: 'message',
                    classCode: selectedThread.classCode
                });

                commentText.value = '';
                renderCommentsList(selectedThread.id);
            }
        });
    }
});

function renderForumList() {
    const container = document.getElementById('forum-feed');
    if (!container) return;

    const threads = storage.getThreads();
    const filtered = threads.filter(t => {
        if (activeTab === 'semua') return true;
        // Diskusi saya check (matches author Bu Nina / isMine)
        return t.isMine === true || t.author === 'Bu Nina';
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Belum ada diskusi kelas.</div>';
        return;
    }

    container.innerHTML = filtered.map(t => `
        <div class="list-item" data-id="${t.id}" style="animation: fadeIn 0.3s ease;">
            <div class="item-left">
                <div class="item-icon-box ${t.classCode}">
                    ${t.classCode === 'mtk' ? '✕' : 'En'}
                </div>
                <div class="item-details">
                    <h4>${t.title}</h4>
                    <p>${t.subject} | Ditulis oleh: ${t.author}</p>
                </div>
            </div>
            <div class="item-right">
                <span style="font-size: 0.9rem; color: #888888; font-weight: 600; display: flex; gap: 12px;">
                    <span>👁 ${t.views}</span>
                    <span>💬 ${t.commentCount}</span>
                </span>
                <span class="item-date">${t.time}</span>
            </div>
        </div>
    `).join('');

    // Attach click events
    container.querySelectorAll('.list-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const t = threads.find(thread => thread.id === id);
            if (t) {
                selectedThread = t;
                // Increment views locally
                t.views += 1;
                loadThreadDetails(t);
            }
        });
    });
}

function loadThreadDetails(t) {
    document.getElementById('detail-post-title').textContent = t.title;
    document.getElementById('detail-post-body').textContent = t.body;
    document.getElementById('detail-post-time').textContent = t.time;

    document.getElementById('detail-author-avatar').src = t.authorAvatar;
    document.getElementById('detail-author-name').textContent = t.author;
    document.getElementById('detail-author-role').textContent = t.role.toUpperCase();

    renderCommentsList(t.id);
    showPanel('detail');
}

function renderCommentsList(threadId) {
    const commentsList = storage.getComments(threadId);
    const container = document.getElementById('comments-list-box');

    if (!container) return;

    if (commentsList.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 10px;">Belum ada tanggapan. Jadilah yang pertama menjawab.</div>';
        return;
    }

    container.innerHTML = commentsList.map(c => `
        <div class="comment-item" style="animation: fadeIn 0.3s ease;">
            <img src="${c.avatar}" alt="User Avatar" class="avatar" style="width: 36px; height: 36px;">
            <div class="comment-bubble-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span class="comment-author">${c.author}</span>
                    <span class="comment-time">${c.time}</span>
                </div>
                <p class="comment-text">${c.text}</p>
            </div>
        </div>
    `).join('');
}

function showPanel(panelName) {
    const listPanel = document.getElementById('forum-list-panel');
    const createPanel = document.getElementById('forum-create-panel');
    const detailPanel = document.getElementById('forum-detail-panel');

    const pageTitle = document.getElementById('forum-main-title');
    const pageSubtitle = document.getElementById('forum-main-subtitle');

    listPanel.style.display = 'none';
    createPanel.style.display = 'none';
    detailPanel.style.display = 'none';

    if (panelName === 'list') {
        listPanel.style.display = 'block';
        pageTitle.textContent = 'Forum Diskusi';
        pageSubtitle.textContent = 'Kelola dan berpartisipasi dalam diskusi kelas bersama siswa.';
    } else if (panelName === 'create') {
        createPanel.style.display = 'block';
        pageTitle.textContent = 'Buat Diskusi Baru';
        pageSubtitle.textContent = 'Mulai topik pembahasan baru di kelas.';
    } else if (panelName === 'detail') {
        detailPanel.style.display = 'block';
        pageTitle.textContent = 'Detail Diskusi';
        pageSubtitle.textContent = 'Bahas materi pembelajaran bersama siswa.';
    }
}
