/**
 * Simple API Client Wrapper
 * Handles backend calls with a local simulation fallback.
 */
import { CONFIG } from '../config.js';

export const apiClient = {
    async post(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

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
            console.error(`API Request to ${endpoint} failed:`, error);
            throw error;
        }
    }
};
