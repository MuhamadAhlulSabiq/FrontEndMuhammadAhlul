import { storage } from '../utils/storage.js';

export const authApi = {
    /**
     * Mock Login API
     */
    async login({ email, password }) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

        // Determine user based on email domain or keywords
        let role = 'siswa';
        let name = 'Rohmat';
        
        if (email.includes('guru')) {
            role = 'guru';
            name = 'Bu Nina';
        } else if (email.includes('admin')) {
            role = 'admin';
            name = 'Administrator';
        }

        const user = {
            id: 1,
            name: name,
            username: email.split('@')[0],
            email: email,
            role: role,
            class: '5'
        };

        // Write to localStorage
        storage.setToken('mock-student-token-xyz123');
        storage.setRole(role);
        storage.setUser(user);
        
        // Initialize other databases if not initialized
        storage.initDb();

        return { success: true, user };
    },

    /**
     * Mock Logout API
     */
    async logout() {
        storage.clearToken();
        storage.clearRole();
        storage.clearUser();

        // Redirect to login page
        const path = window.location.pathname;
        if (path.includes('/pages/siswa/') || path.includes('/pages/guru/')) {
            window.location.href = '../../login.html';
        } else {
            window.location.href = '/login.html';
        }
    },

    /**
     * Mock Register API
     */
    async register(data) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

        const mockUser = {
            id: Math.floor(Math.random() * 100) + 2,
            name: data.name,
            username: data.email.split('@')[0],
            email: data.email,
            role: 'siswa',
            class: '5'
        };

        // Save registered user state so they can log in
        storage.setUser(mockUser);
        
        return { success: true, user: mockUser };
    }
};
