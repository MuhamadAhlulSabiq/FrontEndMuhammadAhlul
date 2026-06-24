import { storage } from '../utils/storage.js';
import { apiClient } from './api-client.js';

export const authApi = {
    /**
     * Real Login API
     */
    async login({ email, password }) {
        const response = await apiClient.post('/login', {
            login: email,
            password: password
        });

        if (response.success && response.data) {
            const { token, user } = response.data;

            // Write to localStorage
            storage.setToken(token);
            storage.setRole(user.role);
            storage.setUser({
                id: user.id,
                name: user.nama,
                username: user.username,
                email: user.email,
                role: user.role
            });

            // Initialize other databases if not initialized
            storage.initDb();

            return { success: true, user };
        }
        throw new Error(response.message || 'Login gagal.');
    },

    /**
     * Real Logout API
     */
    async logout() {
        storage.clearToken();
        storage.clearRole();
        storage.clearUser();

        // Redirect to login page
        if (path.includes('/pages/siswa/') || path.includes('/pages/guru/') || path.includes('/pages/admin/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'login.html';
        }
    },

    /**
     * Real Register API
     */
    async register(data) {
        const response = await apiClient.post('/register', data);
        return response;
    }
};
