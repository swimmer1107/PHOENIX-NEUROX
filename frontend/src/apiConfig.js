/**
 * API Configuration
 * 
 * In development, we use localhost:8000.
 * In production (Vercel), we use the environment variable VITE_API_BASE_URL.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default API_BASE_URL;
