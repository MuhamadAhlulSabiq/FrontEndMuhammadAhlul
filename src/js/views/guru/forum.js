import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';

let activeTab = 'semua';
let selectedThread = null;
let replyingToCommentId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize mock database
    storage.initDb();

    // Initialize teacher profile display
    const user = storage.getUser();
    if (user) {
        let displayName = user.name || 'Bu Nina';
        let cleanName = displayName.replace(/^Bu\s+/, '');
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = cleanName;
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
            setReplyMode(null);
            renderForumList();
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

                if (replyingToCommentId) {
                    newComment.parentId = Number(replyingToCommentId);
                }

                storage.addComment(selectedThread.id, newComment);

                // Add activity log
                storage.addActivity({
                    title: `Membalas diskusi "${selectedThread.title}"`,
                    time: 'Baru saja',
                    type: 'message',
                    classCode: selectedThread.classCode
                });

                commentText.value = '';
                setReplyMode(null);
                renderCommentsList(selectedThread.id);
            }
        });
    }
});

function getThreadIcon(t) {
    if (t.title.includes('Tugas') || t.title.includes('Pecahan')) {
        return `
            <div class="item-icon-box notebook-icon-theme">
                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            </div>
        `;
    } else if (t.classCode === 'mtk') {
        return `
            <div class="item-icon-box math-icon-theme">
                √x
            </div>
        `;
    } else if (t.classCode === 'ing') {
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

    const threads = storage.getThreads();
    const filtered = threads.filter(t => {
        if (activeTab === 'semua') return true;
        return t.isMine === true || t.author === 'Bu Nina';
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Belum ada diskusi kelas.</div>';
        return;
    }

    container.innerHTML = filtered.map(t => `
        <div class="list-item" data-id="${t.id}" style="animation: fadeIn 0.3s ease;">
            <div class="item-left">
                ${getThreadIcon(t)}
                <div class="item-details">
                    <h4 style="font-weight: 800; color: #111827; margin: 0 0 6px 0;">${t.title}</h4>
                    <div style="display: flex; align-items: center; gap: 16px; font-size: 0.88rem; color: #888888; font-weight: 600;">
                        <span>${t.subject}</span>
                        <span style="display: inline-flex; align-items: center; gap: 4px;">
                            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                            ${t.views}
                        </span>
                        <span style="display: inline-flex; align-items: center; gap: 4px;">
                            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            ${t.commentCount}
                        </span>
                    </div>
                </div>
            </div>
            <div class="item-right">
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
                t.views += 1;
                loadThreadDetails(t);
            }
        });
    });
}

function loadThreadDetails(t) {
    const titleEl = document.getElementById('detail-post-title');
    const subjectEl = document.getElementById('detail-post-subject');
    const bodyEl = document.getElementById('detail-post-body');
    const timeEl = document.getElementById('detail-post-time');
    const authorDisplayEl = document.getElementById('detail-author-display');
    const avatarContainer = document.getElementById('detail-author-avatar-container');

    if (titleEl) titleEl.textContent = t.title;
    if (subjectEl) subjectEl.textContent = t.subject;
    if (bodyEl) bodyEl.textContent = t.body;
    if (timeEl) timeEl.textContent = `Dibuat ${t.time}`;
    if (authorDisplayEl) authorDisplayEl.textContent = `${t.author} (${t.role})`;

    // Custom avatar initial circle
    if (avatarContainer) {
        avatarContainer.innerHTML = `
            <div class="student-avatar-circle" style="width: 44px; height: 44px; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; border: 1.5px solid #2563eb;">
                ${t.author.charAt(0)}
            </div>
        `;
    }

    setReplyMode(null);
    renderCommentsList(t.id);
    showPanel('detail');
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

function renderCommentsList(threadId) {
    const commentsList = storage.getComments(threadId);
    const container = document.getElementById('comments-list-box');
    const commentsHeader = document.getElementById('comments-count-header');

    // Total count including nested replies
    const totalComments = commentsList.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);

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
        // Parent Comment HTML
        const useImgAvatar = c.avatar && (c.avatar.startsWith('http') || c.avatar.startsWith('/'));
        const avatarHtml = useImgAvatar
            ? `<img class="comment-avatar-img" src="${c.avatar}" alt="Avatar">`
            : `<div class="comment-avatar-circle" style="width: 38px; height: 38px; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 800;">${c.author.charAt(0)}</div>`;

        html += `
            <div class="comment-item-custom" style="animation: fadeIn 0.3s ease;">
                ${avatarHtml}
                <div class="comment-details-box">
                    <div class="comment-author-row">
                        <span class="comment-author-name" style="font-weight: 800; color: #111827;">${c.author}</span>
                        <span class="comment-post-time" style="font-size: 0.88rem; color: #888888; font-weight: 500;">${c.time}</span>
                    </div>
                    <p class="comment-text-content" style="font-size: 0.95rem; color: #4b5563; font-weight: 500; line-height: 1.5; margin: 0 0 10px 0;">${c.text}</p>
                    <div class="comment-actions-bar" style="display: flex; gap: 8px; align-items: center;">
                        <span class="comment-action-reply" data-id="${c.id}" data-author="${c.author}" style="color: #0d52cd; font-weight: 700; font-size: 0.88rem; cursor: pointer;">Balas</span>
                        <span class="comment-action-divider" style="color: #cbd5e1; font-size: 0.88rem;">&bull;</span>
                        <span class="comment-action-delete" data-id="${c.id}" style="color: #ef4444; font-weight: 700; font-size: 0.88rem; cursor: pointer;">Hapus</span>
                    </div>
                </div>
            </div>
        `;

        // Nested Replies HTML
        if (c.replies && c.replies.length > 0) {
            c.replies.forEach(r => {
                const replyUseImgAvatar = r.avatar && (r.avatar.startsWith('http') || r.avatar.startsWith('/'));
                const replyAvatarHtml = replyUseImgAvatar
                    ? `<img class="comment-avatar-img" src="${r.avatar}" alt="Avatar">`
                    : `<div class="comment-avatar-circle" style="width: 30px; height: 30px; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;">${r.author.charAt(0)}</div>`;

                html += `
                    <div class="comment-reply-nested" style="animation: fadeIn 0.3s ease;">
                        ${replyAvatarHtml}
                        <div class="comment-details-box">
                            <div class="comment-author-row">
                                <span class="comment-author-name" style="font-weight: 800; color: #111827;">${r.author}</span>
                                <span class="comment-post-time" style="font-size: 0.88rem; color: #888888; font-weight: 500;">${r.time}</span>
                            </div>
                            <p class="comment-text-content" style="font-size: 0.95rem; color: #4b5563; font-weight: 500; line-height: 1.5; margin: 0 0 10px 0;">${r.text}</p>
                            <div class="comment-actions-bar" style="display: flex; gap: 8px; align-items: center;">
                                <span class="comment-action-delete" data-parent-id="${c.id}" data-reply-id="${r.id}" style="color: #ef4444; font-weight: 700; font-size: 0.88rem; cursor: pointer;">Hapus</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    });

    container.innerHTML = html;

    // Bind Balas clicks
    container.querySelectorAll('.comment-action-reply').forEach(btn => {
        btn.addEventListener('click', () => {
            const commentId = btn.dataset.id;
            const commentAuthor = btn.dataset.author;
            setReplyMode(commentId, commentAuthor);
        });
    });

    // Bind Hapus clicks
    container.querySelectorAll('.comment-action-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const parentId = btn.dataset.parentId;
            const replyId = btn.dataset.replyId;
            const commentId = btn.dataset.id;

            if (confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
                if (replyId) {
                    storage.deleteComment(threadId, parentId, replyId);
                } else {
                    storage.deleteComment(threadId, commentId);
                }
                // Reload comments
                renderCommentsList(threadId);
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
        // Hide top bar title and subtitle to align back link correctly
        if (pageTitle) pageTitle.textContent = 'Detail Diskusi';
        if (pageSubtitle) pageSubtitle.style.display = 'none';
    }
}
