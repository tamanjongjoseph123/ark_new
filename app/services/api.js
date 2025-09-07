import axios from 'axios';
import { BASE_URL } from '../base_url';

// Create axios instance with base URL
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Add timeout to prevent hanging requests
    timeout: 10000,
});

// Video related endpoints
export const getVideos = async (category = null) => {
    try {
        const url = category ? `/api/videos/by_category/?category=${category}` : '/api/videos/';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching videos${category ? ' for ' + category : ''}:`, error);
        // Return empty array instead of throwing to prevent app crashes
        return [];
    }
};

// Praise and Worship specific endpoints
export const getPraiseVideos = async () => {
    try {
        const response = await api.get('/api/videos/by_category/?category=praise');
        return response.data;
    } catch (error) {
        console.error('Error fetching praise videos:', error);
        return [];
    }
};

export const getWorshipVideos = async () => {
    try {
        const response = await api.get('/api/videos/by_category/?category=worship');
        return response.data;
    } catch (error) {
        console.error('Error fetching worship videos:', error);
        return [];
    }
};

// Inspirational Quotes
export const getQuotes = async () => {
    try {
        const response = await api.get('/api/inspiration-quotes/');
        return response.data;
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return [];
    }
};

// Prayer Requests
export const submitPrayerRequest = async (data) => {
    try {
        const response = await api.post('/api/prayer-requests/', data);
        return response.data;
    } catch (error) {
        console.error('Error submitting prayer request:', error);
        throw error; // Still throw for form submissions as we need to show user feedback
    }
};

// Upcoming Events
export const getEvents = async () => {
    try {
        const response = await api.get('/api/upcoming-events/');
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
};

// Church Projects
export const getProjects = async () => {
    try {
        const response = await api.get('/api/church-projects/');
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
};

// Testimonies
export const getTestimonies = async () => {
    try {
        const response = await api.get('/api/testimonies/');
        return response.data;
    } catch (error) {
        console.error('Error fetching testimonies:', error);
        return [];
    }
};

// Live Stream Channel
export const getLiveStreamChannel = async (channelId = 1) => {
    try {
        // Using a different base URL for this specific API
        const response = await axios.get(`https://tv.kewirsolutions.com/api/channels/${channelId}`, {
            timeout: 10000 // Add timeout to prevent hanging requests
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching live stream channel:', error);
        // Return a default object with empty stream URL to prevent app crashes
        return {
            success: false,
            data: {
                stream_url: ''
            }
        };
    }
};

export default api;