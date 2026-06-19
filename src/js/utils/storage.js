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
    CLASS_ACTIVITIES: 'elearning_class_activities'
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
                    title: 'Matematika',
                    code: 'mtk',
                    teacher: 'Bu Nina',
                    subject: 'Guru Matematika',
                    illustration: 'chart'
                },
                {
                    id: 2,
                    title: 'Bahasa Inggris',
                    code: 'ing',
                    teacher: 'Miss Sarah',
                    subject: 'Guru Bahasa Inggris',
                    illustration: 'board'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(defaultClasses));
        }

        // Seed Materials
        if (!localStorage.getItem(STORAGE_KEYS.MATERIALS)) {
            const defaultMaterials = [
                {
                    id: 1,
                    title: 'Sistem Persamaan Kuadrat',
                    subject: 'Matematika - Kelas 5',
                    time: '2 hari yang lalu',
                    classCode: 'mtk',
                    docType: 'PDF'
                },
                {
                    id: 2,
                    title: 'Hobbies',
                    subject: 'Bahasa Inggris - Kelas 2',
                    time: '3 hari yang lalu',
                    classCode: 'ing',
                    docType: 'PPT'
                },
                {
                    id: 3,
                    title: 'Pecahan',
                    subject: 'Matematika - Kelas 5',
                    time: '4 hari yang lalu',
                    classCode: 'mtk',
                    docType: 'PDF'
                },
                {
                    id: 4,
                    title: 'My Family',
                    subject: 'Bahasa Inggris - Kelas 2',
                    time: '5 hari yang lalu',
                    classCode: 'ing',
                    docType: 'PPT'
                },
                {
                    id: 5,
                    title: 'Bilangan Bulat',
                    subject: 'Matematika - Kelas 5',
                    time: '6 hari yang lalu',
                    classCode: 'mtk',
                    docType: 'PDF'
                },
                {
                    id: 6,
                    title: 'Numbers & Colors',
                    subject: 'Bahasa Inggris - Kelas 2',
                    time: '1 minggu yang lalu',
                    classCode: 'ing',
                    docType: 'PDF'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(defaultMaterials));
        }

        // Seed Assignments
        if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
            const defaultAssignments = [
                {
                    id: 1,
                    title: 'Tugas Matematika - Bilangan Bulat',
                    deadline: '25 Mei 2026 23.59',
                    status: 'belum',
                    classCode: 'mtk',
                    teacher: 'Bu Nina',
                    subject: 'Guru Matematika',
                    desc: 'Kerjakan soal berikut dan kumpulkan dalam bentuk pdf:\n1. Urutkan bilangan berikut dari data yang terkecil hingga yang terbesar: 15, -8, 0, -2, 4, -12\n2. Hasil dari -15x(-4):6!',
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
                    attachmentSize: '2.1 MB',
                    submittedFile: 'Jawaban_Pecahan_Rohmat.pdf',
                    submittedTime: '28 April 2026 14.15'
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
            localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(defaultAssignments));
        }

        // Seed Forum Threads
        if (!localStorage.getItem(STORAGE_KEYS.FORUM_THREADS)) {
            const defaultThreads = [
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
            localStorage.setItem(STORAGE_KEYS.FORUM_COMMENTS, JSON.stringify(defaultComments));
        }

        // Seed Announcements
        if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
            const defaultAnnouncements = [
                {
                    id: 1,
                    title: 'Libur Semester Genap',
                    category: 'Penting',
                    categoryClass: 'penting',
                    time: '1 hari yang lalu',
                    body: 'Diberitahukan kepada seluruh siswa bahwa libur semester genap akan dimulai pada tanggal 22 Juni hingga 6 Juli 2026. Selamat berlibur!'
                },
                {
                    id: 2,
                    title: 'Jadwal Ujian Tengah Semester',
                    category: 'Penting',
                    categoryClass: 'penting',
                    time: '3 hari yang lalu',
                    body: 'Ujian Tengah Semester genap akan diselenggarakan secara online mulai tanggal 11 Mei 2026. Jadwal lengkap dapat diunduh di dashboard kelas.'
                },
                {
                    id: 3,
                    title: 'Tugas Bahasa Inggris Ditunda',
                    category: 'Kelas',
                    categoryClass: 'kelas',
                    time: '4 hari yang lalu',
                    body: 'Pengumpulan tugas matching Bahasa Inggris diundur menjadi tanggal 25 Mei 2026 jam 23.59. Silakan persiapkan berkas Anda sebaik-baiknya.'
                },
                {
                    id: 4,
                    title: 'Pembagian Rapor Semester Ganjil',
                    category: 'Umum',
                    categoryClass: 'umum',
                    time: '1 minggu yang lalu',
                    body: 'Pembagian rapor semester ganjil akan dilaksanakan secara tatap muka pada hari Jumat ini di kelas masing-masing. Harap hadir bersama orang tua.'
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

    // Assignments Actions
    getAssignments() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS));
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
        comments[threadId].push(commentObj);
        localStorage.setItem(STORAGE_KEYS.FORUM_COMMENTS, JSON.stringify(comments));

        // Update comment count on thread
        const threads = this.getThreads();
        const updatedThreads = threads.map(t => {
            if (t.id === Number(threadId)) {
                t.commentCount = comments[threadId].length;
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

    // Classroom Activities Actions
    getActivities() {
        this.initDb();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASS_ACTIVITIES));
    },
    addActivity(activityObj) {
        const activities = this.getActivities();
        activities.unshift(activityObj);
        localStorage.setItem(STORAGE_KEYS.CLASS_ACTIVITIES, JSON.stringify(activities));
    }
};
