import { CONFIG } from '../config.js';
import { storage } from '../utils/storage.js';

async function request(endpoint, method, data = null) {
    const headers = {
        'Accept': 'application/json'
    };

    // Ambil token dari local storage dan lampirkan jika ada
    const token = storage.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `HTTP Error: ${response.status}`;
            const err = new Error(errorMessage);
            err.status = response.status;
            err.errors = errorData.errors;
            throw err;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request ${method} ${endpoint} failed:`, error);
        throw error;
    }
}

export const apiClient = {
    get(endpoint) { return request(endpoint, 'GET'); },
    post(endpoint, data) { return request(endpoint, 'POST', data); },
    put(endpoint, data) { return request(endpoint, 'PUT', data); },
    delete(endpoint) { return request(endpoint, 'DELETE'); }
};
