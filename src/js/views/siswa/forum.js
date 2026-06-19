import { storage } from '../../../src/js/utils/storage.js';
import { authApi } from '../../../src/js/api/auth.js';

// Forums Thread Database matching mockup lists
const DISKUSI_DATABASE = [
    {
        id: 1,
        title: 'Pengertian Persamaan Kuadrat',
        subject: 'Matematika - Kelas 5',
        classCode: 'mtk',
        author: 'Bu Nina',
        role: 'Guru Matematika',
        authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guru_nina',
        time: '2 jam yang lalu',
        body: 'Halo semuanya, pada pertemuan ini kita membahas tentang pengertian persamaan kuadrat. Silahkan bertanya jika ada yang belum dipahami.',
        views: 12,
        commentCount: 3,
        isMine: false
    },
    {
        id: 2,
        title: 'Hobbies',
        subject: 'Bahasa Inggris - Kelas 2',
        classCode: 'ing',
        author: 'Miss Sarah',
        role: 'Guru Bahasa Inggris',
        authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guru_sarah',
        time: '1 hari yang lalu',
        body: 'Good morning class! What are your hobbies? Write them down below.',
        views: 10,
        commentCount: 2,
        isMine: false
    },
    {
        id: 3,
        title: 'Tugas Matematika - Pecahan',
        subject: 'Matematika - Kelas 5',
        classCode: 'mtk',
        author: 'Rohmat',
        role: 'Siswa',
        authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_rohmat',
        time: '2 hari yang lalu',
        body: 'Apakah ada yang kesulitan mengerjakan soal pecahan nomor 5?',
        views: 8,
        commentCount: 2,
        isMine: true
    },
    {
        id: 4,
        title: 'Tugas Bahasa Inggris - Coloring',
        subject: 'Bahasa Inggris - Kelas 2',
        classCode: 'ing',
        author: 'Azzahra',
        role: 'Siswa',
        authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_azzahra',
        time: '3 hari yang lalu',
        body: 'Apakah warna daun di halaman 12 boleh bebas?',
        views: 5,
        commentCount: 1,
        isMine: true
    }
];

// Thread Comments Database mapped by Thread ID
const KOMENTAR_DATABASE = {
    1: [
        {
            id: 101,
            author: 'Rohmat',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_rohmat',
            text: 'Terimakasih penjelasannya bu',
            time: '1 jam yang lalu'
        },
        {
            id: 102,
            author: 'Azzahra',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_azzahra',
            text: 'Penerapan persamaan sistem kuadrat apa saja bu?',
            time: '45 menit yang lalu'
        },
        {
            id: 103,
            author: 'Bu Nina',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guru_nina',
            text: 'Melempar bola dan menghitung keuntungan dari waktu ke waktu.',
            time: '30 menit yang lalu'
        }
    ],
    2: [
        {
            id: 201,
            author: 'Azzahra',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_azzahra',
            text: 'My hobby is reading books.',
            time: '20 jam yang lalu'
        },
        {
            id: 202,
            author: 'Rohmat',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_rohmat',
            text: 'I like swimming, Miss!',
            time: '18 jam yang lalu'
        }
    ],
    3: [
        {
            id: 301,
            author: 'Azzahra',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_azzahra',
            text: 'Iya, saya juga agak bingung menyederhanakan pecahannya.',
            time: '1 hari yang lalu'
        },
        {
            id: 302,
            author: 'Bu Nina',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guru_nina',
            text: 'Bagi pembilang dan penyebut dengan FPB mereka, ya.',
            time: '20 jam yang lalu'
        }
    ],
    4: [
        {
            id: 401,
            author: 'Miss Sarah',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guru_sarah',
            text: 'Yes, you can color it green or yellow.',
            time: '2 hari yang lalu'
        }
    ]
};

let activeTab = 'semua';
let selectedThread = null;

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
    document.getElementById('btn-create-discussion').addEventListener('click', () => {
        showPanel('create');
    });

    // 6. Cancel creation listeners
    document.getElementById('btn-cancel-create-top').addEventListener('click', () => {
        showPanel('list');
    });
    document.getElementById('btn-cancel-create').addEventListener('click', () => {
        showPanel('list');
    });

    // 7. Back to List from details
    document.getElementById('btn-back-to-forum').addEventListener('click', () => {
        renderForumList();
        showPanel('list');
    });

    // 8. Handle Create Discussion Form Submit
    const createForm = document.getElementById('create-discussion-form');
    createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('discussion-title').value;
        const subjCode = document.getElementById('discussion-subject').value;
        const classLevel = document.getElementById('discussion-class').value;
        const body = document.getElementById('discussion-body').value;

        const subjectLabel = subjCode === 'mtk' ? 'Matematika' : 'Bahasa Inggris';
        const currentStudentName = user ? user.name : 'Rohmat';

        // Add to local database
        const newThread = {
            id: DISKUSI_DATABASE.length + 1,
            title: title,
            subject: `${subjectLabel} - Kelas ${classLevel}`,
            classCode: subjCode,
            author: currentStudentName,
            role: 'Siswa',
            authorAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user ? user.id : '1'}`,
            time: 'Baru saja',
            body: body,
            views: 0,
            commentCount: 0,
            isMine: true
        };

        DISKUSI_DATABASE.unshift(newThread);
        KOMENTAR_DATABASE[newThread.id] = [];

        createForm.reset();
        renderForumList();
        showPanel('list');
    });

    // 9. Handle Submit Comment Form
    const commentForm = document.getElementById('comment-post-form');
    const commentText = document.getElementById('comment-input-text');

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textVal = commentText.value.trim();
        if (textVal && selectedThread) {
            const currentStudentName = user ? user.name : 'Rohmat';
            const newComment = {
                id: Math.floor(Math.random() * 1000) + 500,
                author: currentStudentName,
                avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user ? user.id : '1'}`,
                text: textVal,
                time: 'Baru saja'
            };

            // Save to comments db
            if (!KOMENTAR_DATABASE[selectedThread.id]) {
                KOMENTAR_DATABASE[selectedThread.id] = [];
            }
            KOMENTAR_DATABASE[selectedThread.id].push(newComment);
            
            // Update comments count on database
            selectedThread.commentCount = KOMENTAR_DATABASE[selectedThread.id].length;

            commentText.value = '';
            renderCommentsFeed(selectedThread.id);
        }
    });
});

function renderForumList() {
    const container = document.getElementById('forum-feed');
    
    // Filter list
    const filtered = DISKUSI_DATABASE.filter(d => {
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
        <div class="list-item" data-id="${d.id}">
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
            const thread = DISKUSI_DATABASE.find(d => d.id === id);
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
    const commentsList = KOMENTAR_DATABASE[threadId] || [];
    const countTitle = document.getElementById('comments-count-title');
    countTitle.textContent = `${commentsList.length} Komentar`;

    const commentsContainer = document.getElementById('comments-list-feed');
    if (commentsList.length === 0) {
        commentsContainer.innerHTML = `
            <div class="empty-state" style="padding: 20px;">
                <p>Belum ada komentar. Jadilah yang pertama membalas!</p>
            </div>
        `;
        return;
    }

    commentsContainer.innerHTML = commentsList.map(c => `
        <div class="comment-item">
            <img src="${c.avatar}" alt="User Avatar" class="avatar" style="width: 36px; height: 36px;">
            <div class="comment-bubble-content">
                <div style="display: flex; justify-content: space-between; align-items: center;">
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
        pageSubtitle.textContent = 'Diskusikan materi kelas bersama pengajar dan teman sekelas Anda.';
    } else if (panelName === 'create') {
        createPanel.style.display = 'block';
        pageTitle.textContent = 'Buat Diskusi';
        pageSubtitle.textContent = 'Tanyakan hal yang membingungkan seputar materi Anda.';
    } else if (panelName === 'detail') {
        detailPanel.style.display = 'block';
        pageTitle.textContent = 'Detail Diskusi';
        pageSubtitle.textContent = 'Bahas topik pembelajaran secara mendalam.';
    }
}
