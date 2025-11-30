import axios from 'axios';

// Read the environment variable, fallback to localhost for development
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create an Axios instance
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important for cookies/sessions
});

export default api;
