/**
 * Local Storage Helper & Client-Side Database Utility
 */

const STORAGE_KEYS = {
    TOKEN: 'elearning_token',
    ROLE: 'elearning_role',
    USER: 'elearning_user',
    CLASSES: 'elearning_classes',
    MATERIALS: 'elearning_materials',
    ASSIGNMENTS: 'elearning_assignments',
    FORUM_THREADS: 'elearning_forum_threads',
    FORUM_COMMENTS: 'elearning_forum_comments',
    ANNOUNCEMENTS: 'elearning_announcements',
    CLASS_ACTIVITIES: 'elearning_class_activities',
    TEACHERS: 'elearning_teachers',
    SETTINGS: 'elearning_settings',
    SUBMISSIONS: 'elearning_submissions'
};

export const storage = {
    // Auth Token
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    },
    setToken(token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },
    clearToken() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    },

    // Auth Role
    getRole() {
        return localStorage.getItem(STORAGE_KEYS.ROLE);
    },
    setRole(role) {
        localStorage.setItem(STORAGE_KEYS.ROLE, role);
    },
    clearRole() {
        localStorage.removeItem(STORAGE_KEYS.ROLE);
    },

    // Auth User
    getUser() {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },
    setUser(user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },
    clearUser() {
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    // Initialize mock database seeds if empty
    initDb() {
        // Database version migration check to force re-seed
        const DB_VERSION_KEY = 'elearning_db_version';
        const CURRENT_VERSION = 'v12';
        if (localStorage.getItem(DB_VERSION_KEY) !== CURRENT_VERSION) {
            localStorage.removeItem(STORAGE_KEYS.CLASSES);
            localStorage.removeItem(STORAGE_KEYS.MATERIALS);
            localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
            localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
            localStorage.removeItem(STORAGE_KEYS.FORUM_THREADS);
            localStorage.removeItem(STORAGE_KEYS.FORUM_COMMENTS);
            localStorage.removeItem('elearning_submissions');
            localStorage.removeItem('elearning_pengumpulan_tugas');
            localStorage.setItem(DB_VERSION_KEY, CURRENT_VERSION);
        }

        // Seed user if not logged in
        if (!this.getUser()) {
            this.setUser({
                id: 1,
                name: 'Rohmat',
                username: 'rohmat',
                email: 'rohmat@gmail.com',
                class: '5',
                role: 'siswa'
            });
            this.setToken('mock-student-token-xyz123');
            this.setRole('siswa');
        }

        // Seed Classes
        if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
            const defaultClasses = [
                {
                    id: 1,
                    title: 'Bahasa Inggris',
                    grade: 'Kelas 2',
                    code: 'ing',
                    displayCode: 'BI0X1024',
                    teacher: 'Bu Nina',
                    subject: 'Guru Bahasa Inggris',
                    illustration: 'puzzle',
                    studentsCount: 28
                },
                {
                    id: 2,
                    title: 'Matematika',
                    grade: 'Kelas 5',
                    code: 'mtk',
                    displayCode: 'F1509321',
                    teacher: 'Bu Nina',
                    subject: 'Guru Matematika',
                    illustration: 'math',
                    studentsCount: 25
                },
                {
                    id: 3,
                    title: 'Ilmu Pengetahuan Alam',
                    grade: 'Kelas 4',
                    code: 'ipa',
                    displayCode: 'KIMX2357',
                    teacher: 'Bu Nina',
                    subject: 'Guru IPA',
                    illustration: 'beaker',
                    studentsCount: 27
                },
                {
                    id: 4,
                    title: 'Kewarganegaraan',
                    grade: 'Kelas 1',
                    code: 'pkn',
                    displayCode: 'MTCK0971',
                    teacher: 'Bu Nina',
                    subject: 'Guru PKN',
                    illustration: 'desk',
                    studentsCount: 24
                }
            ];
            localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(defaultClasses));
        }

        // Seed Materials
        if (!localStorage.getItem(STORAGE_KEYS.MATERIALS)) {
            const defaultMaterials = [
                { id: 1, title: 'Sistem Persamaan Kuadrat', subject: 'Matematika - Kelas 5', time: '15 Mei 2026', classCode: 'mtk', docType: 'PDF' },
                { id: 2, title: 'Hobbies', subject: 'Bahasa Inggris - Kelas 2', time: '14 Mei 2026', classCode: 'ing', docType: 'PPT' },
                { id: 3, title: 'Alat Indra Manusia', subject: 'Ilmu Pengetahuan Alam - Kelas 4', time: '13 Mei 2026', classCode: 'ipa', docType: 'PDF' },
                { id: 4, title: 'Pancasila', subject: 'Kewarganegaraan - Kelas 1', time: '12 Mei 2026', classCode: 'pkn', docType: 'PPT' },
                { id: 5, title: 'Persamaan Linear', subject: 'Matematika - Kelas 5', time: '11 Mei 2026', classCode: 'mtk', docType: 'PDF' },
                { id: 6, title: 'Pecahan', subject: 'Matematika - Kelas 5', time: '10 Mei 2026', classCode: 'mtk', docType: 'PDF' },
                { id: 7, title: 'Bilangan Bulat', subject: 'Matematika - Kelas 5', time: '09 Mei 2026', classCode: 'mtk', docType: 'PDF' },
                { id: 8, title: 'My Family', subject: 'Bahasa Inggris - Kelas 2', time: '08 Mei 2026', classCode: 'ing', docType: 'PPT' },
                { id: 9, title: 'Numbers & Colors', subject: 'Bahasa Inggris - Kelas 2', time: '07 Mei 2026', classCode: 'ing', docType: 'PDF' },
                { id: 10, title: 'Ekosistem', subject: 'Ilmu Pengetahuan Alam - Kelas 4', time: '06 Mei 2026', classCode: 'ipa', docType: 'PDF' }
            ];
            localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(defaultMaterials));
        }

        // Seed Assignments
        if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
            const defaultAssignments = [
                {
                    id: 1,
                    title: 'Bilangan Bulat',
                    deadline: '25 Mei 2026',
                    status: 'belum',
                    classCode: 'mtk',
                    classLevel: '5',
                    teacher: 'Bu Nina',
                    subject: 'Matematika',
                    desc: 'Kerjakan soal latihan bilangan bulat di buku cetak halaman 20.'
                },
                {
                    id: 2,
                    title: 'Matching',
                    deadline: '28 Mei 2026',
                    status: 'belum',
                    classCode: 'ing',
                    classLevel: '2',
                    teacher: 'Bu Nina',
                    subject: 'Bahasa Inggris',
                    desc: 'Cocokkan kosakata hewan dengan gambarnya.'
                },
                {
                    id: 3,
                    title: 'Fungsi tubuh',
                    deadline: '30 Mei 2026',
                    status: 'belum',
                    classCode: 'ipa',
                    classLevel: '4',
                    teacher: 'Bu Nina',
                    subject: 'Ilmu Pengetahuan Alam',
                    desc: 'Jelaskan fungsi organ pernapasan manusia.'
                },
                {
                    id: 4,
                    title: 'Manfaat Pancasila',
                    deadline: '03 Juni 2026',
                    status: 'belum',
                    classCode: 'pkn',
                    classLevel: '1',
                    teacher: 'Bu Nina',
                    subject: 'Kewarganegaraan',
                    desc: 'Sebutkan 3 contoh pengamalan sila pertama Pancasila.'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(defaultAssignments));
        }

        // Seed Forum Threads
        if (!localStorage.getItem(STORAGE_KEYS.FORUM_THREADS)) {
            const defaultThreads = [
                {
                    id: 1,
                    title: 'Pengertian Sistem Kuadrat',
                    subject: 'Matematika - Kelas 5',
                    classCode: 'mtk',
                    author: 'Nina',
                    role: 'Guru',
                    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guru_nina',
                    time: '2 jam yang lalu',
                    body: 'Halo semua, pada pertemuan kali ini kita membahas tentang pengertian\nsistem persamaan kuadrat.\nSilahkan bertanya jika ada yang belum dipahami ya.',
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
                    isMine: false
                }
            ];
            localStorage.setItem(STORAGE_KEYS.FORUM_THREADS, JSON.stringify(defaultThreads));
        }

        // Seed Forum Comments
        if (!localStorage.getItem(STORAGE_KEYS.FORUM_COMMENTS)) {
            const defaultComments = {
                1: [
                    {
                        id: 101,
                        author: 'Rohmat',
                        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_rohmat',
                        text: 'Apa syarat utama agar sebuah persamaan dapat dikategorikan sebagai persamaan kuadrat?',
                        time: '2 jam yang lalu',
                        replies: [
                            {
                                id: 1011,
                                author: 'Bu Nina',
                                avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guru_nina',
                                text: 'Syarat utamanya adalah pangkat tertinggi dari variabelnya harus dua, Rohmat.',
                                time: '1 jam yang lalu'
                            }
                        ]
                    },
                    {
                        id: 102,
                        author: 'Azzahra',
                        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_azzahra',
                        text: 'Bagaimana bentuk umum penulisan sistem persamaan kuadrat dalam ilmu aljabar?',
                        time: '2 jam yang lalu',
                        replies: []
                    }
                ],
                2: [
                    {
                        id: 201,
                        author: 'Azzahra',
                        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_azzahra',
                        text: 'My hobby is reading books.',
                        time: '20 jam yang lalu',
                        replies: []
                    },
                    {
                        id: 202,
                        author: 'Rohmat',
                        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_rohmat',
                        text: 'I like swimming, Miss!',
                        time: '18 jam yang lalu',
                        replies: []
                    }
                ],
                3: [
                    {
                        id: 301,
                        author: 'Azzahra',
                        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_azzahra',
                        text: 'Iya, saya juga agak bingung menyederhanakan pecahannya.',
                        time: '1 hari yang lalu',
                        replies: []
                    },
                    {
                        id: 302,
                        author: 'Bu Nina',
                        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guru_nina',
                        text: 'Bagi pembilang dan penyebut dengan FPB mereka, ya.',
                        time: '20 jam yang lalu',
                        replies: []
                    }
                ],
                4: [
                    {
                        id: 401,
                        author: 'Miss Sarah',
                        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guru_sarah',
                        text: 'Yes, you can color it green or yellow.',
                        time: '2 hari yang lalu',
                        replies: []
                    }
                ]
            };
            localStorage.setItem(STORAGE_KEYS.FORUM_COMMENTS, JSON.stringify(defaultComments));
        }

        // Seed Announcements
        if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
            const defaultAnnouncements = [
                {
                    id: 1,
                    title: 'Libur Hari Raya Idul Fitri 1445 H',
                    category: 'Penting',
                    categoryClass: 'penting',
                    time: '20 Juni 2026 10.30',
                    body: 'Diberitahukan kepada seluruh siswa bahwa libur hari raya Idul Fitri 1445 H akan dimulai pada tanggal 17 Juni 2026...'
                },
                {
                    id: 2,
                    title: 'Perubahan Jadwal Pelajaran Kelas 5',
                    category: 'Kelas',
                    categoryClass: 'kelas',
                    time: '18 Juni 2026 08.15',
                    body: 'Sehubungan dengan adanya kegiatan sekolah, berikut perubahan jadwal pelajaran untuk kelas 5....'
                },
                {
                    id: 3,
                    title: 'Pengumuman Penerimaan Raport',
                    category: 'Umum',
                    categoryClass: 'umum',
                    time: '17 Juni 2026 14.20',
                    body: 'Pengambilan raport semester genap akan dilaksanakan pada tanggal 2 Agustus 2026 di ruang kelas masing-masing dan......'
                },
                {
                    id: 4,
                    title: 'Pengumpulan Tugas Proyek',
                    category: 'Kelas',
                    categoryClass: 'kelas',
                    time: '15 Juni 2026 11.45',
                    body: 'Jangan lupa untuk mengumpulkan tugas sebelum batas waktu yang telah ditentukan.....'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(defaultAnnouncements));
        }

        // Seed Classroom Activities
        if (!localStorage.getItem(STORAGE_KEYS.CLASS_ACTIVITIES)) {
            const defaultActivities = [
                {
                    title: 'Tugas Matematika dikumpulkan',
                    time: '1 hari yang lalu',
                    type: 'check',
                    classCode: 'mtk'
                },
                {
                    title: 'Diskusi baru di Bahasa Inggris',
                    time: '2 hari yang lalu',
                    type: 'message',
                    classCode: 'ing'
                },
                {
                    title: 'Materi Trigonometri',
                    time: '3 hari yang lalu',
                    type: 'math',
                    classCode: 'mtk'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.CLASS_ACTIVITIES, JSON.stringify(defaultActivities));
        }

        // Seed Teachers
        if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
            const defaultTeachers = [
                {
                    id: 1,
                    name: 'Bu Nina',
                    username: 'nina',
                    email: 'nina@guru.com',
                    phone: '081234567890',
                    subject: 'Matematika'
                },
                {
                    id: 2,
                    name: 'Miss Sarah',
                    username: 'sarah',
                    email: 'sarah@guru.com',
                    phone: '081298765432',
                    subject: 'Bahasa Inggris'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(defaultTeachers));
        }

        // Seed Settings
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            const defaultSettings = {
                appName: 'E-Learning Platform',
                schoolName: 'SD N 1 Cerdas Mulia',
                academicYear: '2026/2027',
                semester: 'Ganjil',
                status: 'active'
            };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        }

        // Seed Submissions
        if (!localStorage.getItem('elearning_submissions')) {
            const defaultSubmissions = [
                {
                    id: 1,
                    studentName: 'Rohmat',
                    taskTitle: 'Tugas Bilangan Bulat',
                    time: 'Baru saja',
                    studentAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_rohmat'
                },
                {
                    id: 2,
                    studentName: 'Azzahra',
                    taskTitle: 'Tugas Matching',
                    time: '2 jam yang lalu',
                    studentAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_azzahra'
                }
            ];
            localStorage.setItem('elearning_submissions', JSON.stringify(defaultSubmissions));
        }
    },

    // Classes Actions
    getClasses() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES));
    },
    addClass(classObj) {
        const classes = this.getClasses();
        classes.push(classObj);
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    },

    // Materials Actions
    getMaterials() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS));
    },
    addMaterial(materialObj) {
        const materials = this.getMaterials();
        materials.unshift(materialObj);
        localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    },

    // Assignments Actions
    getAssignments() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS));
    },
    addAssignment(assignmentObj) {
        const assignments = this.getAssignments();
        assignments.unshift(assignmentObj);
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    },
    updateAssignment(id, updateData) {
        const assignments = this.getAssignments();
        const updated = assignments.map(a => {
            if (a.id === id) {
                return { ...a, ...updateData };
            }
            return a;
        });
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
    },

    // Forum Threads Actions
    getThreads() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_THREADS));
    },
    addThread(threadObj) {
        const threads = this.getThreads();
        threads.unshift(threadObj);
        localStorage.setItem(STORAGE_KEYS.FORUM_THREADS, JSON.stringify(threads));
    },

    // Comments Actions
    getComments(threadId) {
        this.initDb();
        const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_COMMENTS)) || {};
        return comments[threadId] || [];
    },
    addComment(threadId, commentObj) {
        this.initDb();
        const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_COMMENTS)) || {};
        if (!comments[threadId]) {
            comments[threadId] = [];
        }
        
        if (commentObj.parentId) {
            const parent = comments[threadId].find(c => c.id === Number(commentObj.parentId));
            if (parent) {
                if (!parent.replies) parent.replies = [];
                parent.replies.push(commentObj);
            } else {
                comments[threadId].push(commentObj);
            }
        } else {
            if (!commentObj.replies) commentObj.replies = [];
            comments[threadId].push(commentObj);
        }

        localStorage.setItem(STORAGE_KEYS.FORUM_COMMENTS, JSON.stringify(comments));

        // Update comment count on thread
        const threads = this.getThreads();
        const totalComments = comments[threadId].reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
        const updatedThreads = threads.map(t => {
            if (t.id === Number(threadId)) {
                t.commentCount = totalComments;
            }
            return t;
        });
        localStorage.setItem(STORAGE_KEYS.FORUM_THREADS, JSON.stringify(updatedThreads));
    },
    deleteComment(threadId, commentId, replyId) {
        this.initDb();
        const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_COMMENTS)) || {};
        if (!comments[threadId]) return;

        if (replyId) {
            // Delete nested reply
            const parent = comments[threadId].find(c => c.id === Number(commentId));
            if (parent && parent.replies) {
                parent.replies = parent.replies.filter(r => r.id !== Number(replyId));
            }
        } else {
            // Delete parent comment
            comments[threadId] = comments[threadId].filter(c => c.id !== Number(commentId));
        }

        localStorage.setItem(STORAGE_KEYS.FORUM_COMMENTS, JSON.stringify(comments));

        // Update comment count on thread
        const threads = this.getThreads();
        const totalComments = comments[threadId].reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
        const updatedThreads = threads.map(t => {
            if (t.id === Number(threadId)) {
                t.commentCount = totalComments;
            }
            return t;
        });
        localStorage.setItem(STORAGE_KEYS.FORUM_THREADS, JSON.stringify(updatedThreads));
    },

    // Announcements Actions
    getAnnouncements() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS));
    },
    addAnnouncement(announcementObj) {
        const announcements = this.getAnnouncements();
        announcements.unshift(announcementObj);
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    },
    updateAnnouncement(id, updatedObj) {
        const announcements = this.getAnnouncements();
        const updated = announcements.map(a => {
            if (a.id === Number(id)) {
                return { ...a, ...updatedObj };
            }
            return a;
        });
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    },
    deleteAnnouncement(id) {
        const announcements = this.getAnnouncements();
        const filtered = announcements.filter(a => a.id !== Number(id));
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    },

    // Classroom Activities Actions
    getActivities() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASS_ACTIVITIES));
    },
    addActivity(activityObj) {
        const activities = this.getActivities();
        activities.unshift(activityObj);
        localStorage.setItem(STORAGE_KEYS.CLASS_ACTIVITIES, JSON.stringify(activities));
    },

    // Teachers Actions
    getTeachers() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS)) || [];
    },
    addTeacher(teacherObj) {
        const teachers = this.getTeachers();
        teachers.unshift(teacherObj);
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    },
    deleteTeacher(id) {
        const teachers = this.getTeachers();
        const filtered = teachers.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(filtered));
    },

    // Settings Actions
    getSettings() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
    },
    updateSettings(settingsObj) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsObj));
    },

    // Submissions Actions
    getSubmissions() {
        this.initDb();
        return JSON.parse(localStorage.getItem('elearning_submissions')) || [];
    },
    addSubmission(sub) {
        const subs = this.getSubmissions();
        subs.unshift(sub);
        localStorage.setItem('elearning_submissions', JSON.stringify(subs));
    },

    // Student Submissions/Grading Actions
    getStudentSubmissions() {
        this.initDb();
        const data = localStorage.getItem('elearning_pengumpulan_tugas');
        if (!data) {
            const defaultSubmissions = [
                { 
                    id: 1, 
                    no: 1, 
                    name: 'Rohmat', 
                    status: 'Diserahkan', 
                    time: '17 Mei 2026, 10.30', 
                    score: '85',
                    fileName: 'Jawaban_Rohmat.pdf',
                    fileSize: '2.4 MB',
                    note: 'Mohon maaf terlambat mengumpulkan, sebelumnya saya mengalami kendala jaringan',
                    feedback: ''
                },
                { 
                    id: 2, 
                    no: 2, 
                    name: 'Azzahra', 
                    status: 'Diserahkan', 
                    time: '17 Mei 2026, 09.45', 
                    score: '-',
                    fileName: 'Jawaban_Azzahra.pdf',
                    fileSize: '1.8 MB',
                    note: 'Tugas sudah selesai saya kerjakan, terima kasih bu.',
                    feedback: ''
                },
                { 
                    id: 3, 
                    no: 3, 
                    name: 'Prabowo', 
                    status: 'Diserahkan', 
                    time: '17 Mei 2026, 07.30', 
                    score: '90',
                    fileName: 'Tugas_Prabowo.pdf',
                    fileSize: '3.1 MB',
                    note: 'Semoga nilainya memuaskan bu.',
                    feedback: 'Bagus sekali pekerjaannya!'
                },
                { 
                    id: 4, 
                    no: 4, 
                    name: 'Sabiq', 
                    status: 'Belum Diserahkan', 
                    time: '-', 
                    score: '-',
                    fileName: '',
                    fileSize: '',
                    note: '',
                    feedback: ''
                }
            ];
            localStorage.setItem('elearning_pengumpulan_tugas', JSON.stringify(defaultSubmissions));
            return defaultSubmissions;
        }
        return JSON.parse(data);
    },
    saveStudentGrade(id, score, feedback) {
        const subs = this.getStudentSubmissions();
        const updated = subs.map(s => {
            if (s.id === id) {
                return { ...s, score: score, feedback: feedback };
            }
            return s;
        });
        localStorage.setItem('elearning_pengumpulan_tugas', JSON.stringify(updated));
    }
};
