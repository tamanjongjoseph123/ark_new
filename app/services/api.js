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
        // Try with both parameter names to ensure compatibility
        let url = videoId ? `/api/comments/?video_id=${encodeURIComponent(videoId)}` : '/api/comments/';
        let response = await api.get(url);
        
        // If no results, try with the alternative parameter name
        if ((!response.data || response.data.length === 0) && videoId) {
            const altUrl = `/api/comments/?video=${encodeURIComponent(videoId)}`;
            const altResponse = await api.get(altUrl);
            if (altResponse.data && altResponse.data.length > 0) {
                return altResponse.data;
            }
        }
        
        return response.data || [];
    } catch (error) {
        console.error('Error fetching comments:', error);
        console.error('Error details:', error.response?.data || error.message);
        return [];
    }
};

export const postComment = async ({ token, video, text, parent = null }) => {
    try {
        const headers = token ? { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {};
        
        const payload = {
            video: video,  // Changed back to 'video' to match API expectations
            text: text,
            parent_id: parent
        };
        
        console.log('Final payload being sent:', JSON.stringify(payload, null, 2));
        
        console.log('Posting comment with payload:', payload); // Debug log
        
        const response = await api.post('/api/comments/', payload, { 
            headers,
            validateStatus: () => true // This will prevent axios from throwing on 400/500
        });
        
        if (response.status >= 400) {
            console.error('API Error Response:', response.data);
            throw new Error(response.data?.message || 'Failed to post comment');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error posting comment:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        throw error;
    }
};

export const postReply = async ({ token, commentId, text, videoId }) => {
    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        const payload = {
            text: text,
            video: videoId  // Using 'video' as the field name to match API expectations
        };
        
        console.log('Posting reply with payload:', JSON.stringify(payload, null, 2));  // Better formatted debug log
        
        const response = await api.post(
            `/api/comments/${commentId}/reply/`, 
            payload,
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error('Error posting reply:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        throw error;
    }
};

export const getReplies = async (commentId, token) => {
    try {
        const response = await api.get(
            `/api/comments/${commentId}/replies/`,
            token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching replies:', error);
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