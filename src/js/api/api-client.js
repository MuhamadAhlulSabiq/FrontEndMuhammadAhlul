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
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn(`Fetch to ${endpoint} failed. Simulating local fallback...`, error);
            
            // Local simulation fallback
            if (endpoint === '/register' || endpoint === '/login') {
                return { success: true, message: 'Simulated registration/login success.' };
            }
            
            throw error;
        }
    }
};
