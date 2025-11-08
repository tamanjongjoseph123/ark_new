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

// Devotions
export const listDevotions = async (params = {}) => {
    try {
        const query = new URLSearchParams();
        if (params.content_type) query.append('content_type', params.content_type);
        if (params.date) query.append('date', params.date);
        if (params.today) query.append('today', String(params.today));
        const url = `/api/devotions/${query.toString() ? `?${query.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error listing devotions:', error);
        throw error;
    }
};

export const getTodayDevotion = async () => {
    try {
        const response = await api.get('/api/devotions/today/');
        return response.data;
    } catch (error) {
        if (error?.response?.status === 404) return null;
        console.error('Error fetching today\'s devotion:', error);
        throw error;
    }
};

export const getDevotion = async (id) => {
    try {
        const response = await api.get(`/api/devotions/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching devotion:', error);
        throw error;
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

// Courses API
export const listCourses = async (category = null) => {
    try {
        const url = category ? `/api/courses/?category=${encodeURIComponent(category)}` : '/api/courses/';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
};

export const listModules = async (courseId = null) => {
    try {
        const url = courseId ? `/api/modules/?course=${encodeURIComponent(courseId)}` : '/api/modules/';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching modules:', error);
        return [];
    }
};

export const listCourseVideos = async (moduleId = null) => {
    try {
        const url = moduleId ? `/api/course-videos/?module=${encodeURIComponent(moduleId)}` : '/api/course-videos/';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching course videos:', error);
        return [];
    }
};

// Single Course Video
export const getCourseVideo = async (id) => {
    try {
        const response = await api.get(`/api/course-videos/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching course video details:', error);
        throw error;
    }
};

// Comments
export const listComments = async (videoId) => {
    try {
        const url = videoId ? `/api/comments/?video=${encodeURIComponent(videoId)}` : '/api/comments/';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
};

export const postComment = async ({ token, video, text, parent = null }) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.post('/api/comments/', { video, parent, text }, { headers });
        return response.data;
    } catch (error) {
        console.error('Error posting comment:', error);
        throw error;
    }
};

// Auth
export const login = async ({ username, password }) => {
    try {
        const response = await api.post('/api/applications/login/', { username, password });
        // Store tokens if needed
        if (response.data.access) {
            // You can store tokens in AsyncStorage or your state management here
            // await AsyncStorage.setItem('authToken', response.data.access);
            // await AsyncStorage.setItem('refreshToken', response.data.refresh);
        }
        return response.data; // { access, refresh, user, application_type }
    } catch (error) {
        console.error('Login failed:', error?.response?.data || error?.message);
        throw error;
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