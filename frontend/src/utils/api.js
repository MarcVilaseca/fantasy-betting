import axios from 'axios';

// Detectar URL del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
});

// 1. APOSTES
export const bets = {
    getAll: async () => {
        try {
            const response = await api.get('/bets');
            return response.data;
        } catch (error) {
            console.error("Error bets:", error);
            return [];
        }
    },
    create: async (data) => {
        const response = await api.post('/bets', data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/bets/${id}`);
        return id;
    }
};

// 2. PARTITS
export const matches = {
    getAll: async () => {
        try {
            const response = await api.get('/matches');
            return response.data;
        } catch (error) {
            console.error("Error matches:", error);
            return [];
        }
    },
    create: async (data) => {
        const response = await api.post('/matches', data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/matches/${id}`);
        return id;
    }
};

// 3. USUARIS
export const users = {
    getAll: async () => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            console.error("Error users:", error);
            return [];
        }
    },
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            return response.data;
        } catch (error) {
            return null;
        }
    }
};

// 4. FANTASY (El que fallava ara)
export const fantasy = {
    getClassification: async () => {
        try {
            const response = await api.get('/fantasy/classification');
            return response.data;
        } catch (error) {
            console.error("Error fantasy:", error);
            return [];
        }
    },
    updatePoints: async () => {
        try {
            const response = await api.post('/fantasy/calculate');
            return response.data;
        } catch (error) {
            console.error("Error calculating points:", error);
            throw error;
        }
    }
};

// 5. AUTH (Per prevenir el proper error)
export const auth = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    }
};

export default api;
