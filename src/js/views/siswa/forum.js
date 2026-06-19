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

    // 3. Render initial list
    renderForumList();

    // 4. Tab filtering listener
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;
            renderForumList();
        });
    });

    // 5. Switch to Create Panel
    const createDiscussionBtn = document.getElementById('btn-create-discussion');
    if (createDiscussionBtn) {
        createDiscussionBtn.addEventListener('click', () => {
            showPanel('create');
        });
    }

    // 6. Cancel creation listeners
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

    // 7. Back to List from details
    const backToForumBtn = document.getElementById('btn-back-to-forum');
    if (backToForumBtn) {
        backToForumBtn.addEventListener('click', () => {
            renderForumList();
            showPanel('list');
        });
    }

    // 8. Handle Create Discussion Form Submit
    const createForm = document.getElementById('create-discussion-form');
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('discussion-title').value;
            const subjCode = document.getElementById('discussion-subject').value;
            const classLevel = document.getElementById('discussion-class').value;
            const body = document.getElementById('discussion-body').value;

            const subjectLabel = subjCode === 'mtk' ? 'Matematika' : 'Bahasa Inggris';
            const currentStudentName = user ? user.name : 'Rohmat';
            const studentId = user ? user.id : '1';

            // Add to localStorage
            const threads = storage.getThreads();
            const newThread = {
                id: threads.length + 1,
                title: title,
                subject: `${subjectLabel} - Kelas ${classLevel}`,
                classCode: subjCode,
                author: currentStudentName,
                role: 'Siswa',
                authorAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${studentId}`,
                time: 'Baru saja',
                body: body,
                views: 0,
                commentCount: 0,
                isMine: true
            };

            storage.addThread(newThread);

            // Add activity log
            storage.addActivity({
                title: `Membuat diskusi "${title}"`,
                time: 'Baru saja',
                type: 'message',
                classCode: subjCode
            });

            createForm.reset();
            renderForumList();
            showPanel('list');
        });
    }

    // 9. Handle Submit Comment Form
    const commentForm = document.getElementById('comment-post-form');
    const commentText = document.getElementById('comment-input-text');

    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const textVal = commentText.value.trim();
            if (textVal && selectedThread) {
                const currentStudentName = user ? user.name : 'Rohmat';
                const studentId = user ? user.id : '1';
                
                const newComment = {
                    id: Math.floor(Math.random() * 1000) + 500,
                    author: currentStudentName,
                    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${studentId}`,
                    text: textVal,
                    time: 'Baru saja'
                };

                // Save to comments database in localStorage
                storage.addComment(selectedThread.id, newComment);
                
                // Add activity log
                storage.addActivity({
                    title: `Membalas diskusi "${selectedThread.title}"`,
                    time: 'Baru saja',
                    type: 'message',
                    classCode: selectedThread.classCode
                });

                // Update comments count on local selected object
                selectedThread.commentCount += 1;

                commentText.value = '';
                renderCommentsFeed(selectedThread.id);
            }
        });
    }
});

function renderForumList() {
    const container = document.getElementById('forum-feed');
    if (!container) return;
    
    // Load threads from localStorage
    const threads = storage.getThreads();

    // Filter list
    const filtered = threads.filter(d => {
        if (activeTab === 'semua') return true;
        return d.isMine === true;
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

    container.innerHTML = filtered.map(d => `
        <div class="list-item" data-id="${d.id}" style="animation: fadeIn 0.3s ease;">
            <div class="item-left">
                <div class="item-icon-box ${d.classCode}">
                    ${d.classCode === 'mtk' ? '✕' : 'En'}
                </div>
                <div class="item-details">
                    <h4>${d.title}</h4>
                    <p>${d.subject}</p>
                </div>
            </div>
            <div class="item-right">
                <span style="font-size: 0.9rem; color: #888888; font-weight: 600; display: flex; gap: 12px;">
                    <span>👁 ${d.views}</span>
                    <span>💬 ${d.commentCount}</span>
                </span>
                <span class="item-date">${d.time}</span>
            </div>
        </div>
    `).join('');

    // Attach click events
    container.querySelectorAll('.list-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const thread = threads.find(d => d.id === id);
            if (thread) {
                selectedThread = thread;
                loadThreadDetails(thread);
                showPanel('detail');
            }
        });
    });
}

function loadThreadDetails(t) {
    document.getElementById('detail-forum-title').textContent = t.title;
    document.getElementById('detail-forum-subject').textContent = t.subject;
    
    document.getElementById('detail-forum-author-avatar').src = t.authorAvatar;
    document.getElementById('detail-forum-author-name').textContent = t.author;
    document.getElementById('detail-forum-author-role').textContent = t.role;
    document.getElementById('detail-forum-time').textContent = t.time;
    document.getElementById('detail-forum-body').textContent = t.body;

    renderCommentsFeed(t.id);
}

function renderCommentsFeed(threadId) {
    const commentsList = storage.getComments(threadId);
    
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

    commentsContainer.innerHTML = commentsList.map(c => `
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

    if (listPanel) listPanel.style.display = 'none';
    if (createPanel) createPanel.style.display = 'none';
    if (detailPanel) detailPanel.style.display = 'none';

    if (panelName === 'list') {
        if (listPanel) listPanel.style.display = 'block';
        if (pageTitle) pageTitle.textContent = 'Forum Diskusi';
        if (pageSubtitle) pageSubtitle.textContent = 'Diskusikan materi kelas bersama pengajar dan teman sekelas Anda.';
    } else if (panelName === 'create') {
        if (createPanel) createPanel.style.display = 'block';
        if (pageTitle) pageTitle.textContent = 'Buat Diskusi';
        if (pageSubtitle) pageSubtitle.textContent = 'Tanyakan hal yang membingungkan seputar materi Anda.';
    } else if (panelName === 'detail') {
        if (detailPanel) detailPanel.style.display = 'block';
        if (pageTitle) pageTitle.textContent = 'Detail Diskusi';
        if (pageSubtitle) pageSubtitle.textContent = 'Bahas topik pembelajaran secara mendalam.';
    }
}
