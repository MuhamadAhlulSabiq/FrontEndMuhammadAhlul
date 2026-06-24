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

    // Initialize mock database seeds if empty (Now disabled/empty)
    initDb() {
        // No dummy data seeded
    },

    // Classes Actions
    getClasses() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES)) || [];
    },
    addClass(classObj) {
        const classes = this.getClasses();
        classes.push(classObj);
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    },

    // Materials Actions
    getMaterials() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS)) || [];
    },
    addMaterial(materialObj) {
        const materials = this.getMaterials();
        materials.unshift(materialObj);
        localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    },

    // Assignments Actions
    getAssignments() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) || [];
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
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_THREADS)) || [];
    },
    addThread(threadObj) {
        const threads = this.getThreads();
        threads.unshift(threadObj);
        localStorage.setItem(STORAGE_KEYS.FORUM_THREADS, JSON.stringify(threads));
    },

    // Comments Actions
    getComments(threadId) {
        const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_COMMENTS)) || {};
        return comments[threadId] || [];
    },
    addComment(threadId, commentObj) {
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
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];
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
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASS_ACTIVITIES)) || [];
    },
    addActivity(activityObj) {
        const activities = this.getActivities();
        activities.unshift(activityObj);
        localStorage.setItem(STORAGE_KEYS.CLASS_ACTIVITIES, JSON.stringify(activities));
    },

    // Teachers Actions
    getTeachers() {
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
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
    },
    updateSettings(settingsObj) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsObj));
    },

    // Submissions Actions
    getSubmissions() {
        return JSON.parse(localStorage.getItem('elearning_submissions')) || [];
    },
    addSubmission(sub) {
        const subs = this.getSubmissions();
        subs.unshift(sub);
        localStorage.setItem('elearning_submissions', JSON.stringify(subs));
    },

    // Student Submissions/Grading Actions
    getStudentSubmissions() {
        return JSON.parse(localStorage.getItem('elearning_pengumpulan_tugas')) || [];
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
