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
export const getEvents = async (status = 'upcoming') => {
    try {
        const response = await api.get(`/api/upcoming-events/?event_status=${status}`);
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
        const response = await api.post('/api/auth/login/', { username, password });
        
        // Store tokens if needed
        if (response.data.access) {
            // You can store tokens in AsyncStorage or your state management here
            // await AsyncStorage.setItem('authToken', response.data.access);
            // await AsyncStorage.setItem('refreshToken', response.data.refresh);
        }
        
        // Return the full response including user and application status
        return response.data;
    } catch (error) {
        console.error('Login failed:', error?.response?.data || error?.message);
        
        // If it's already a custom error we created, just rethrow it
        if (error.status && error.data) {
            throw error;
        }
        
        // Handle specific HTTP status codes and error messages from the server
        if (error.response) {
            const { data, status } = error.response;
            let errorMessage = 'Login failed. Please try again.';
            let errorToThrow = new Error(errorMessage);
            
            // Attach status and data to the error object
            errorToThrow.status = status;
            errorToThrow.data = data;
            
            // Try to get the most specific error message
            if (data) {
                // Check for common error fields
                const possibleErrorFields = ['error', 'detail', 'message', 'non_field_errors'];
                
                for (const field of possibleErrorFields) {
                    if (data[field]) {
                        if (Array.isArray(data[field])) {
                            errorMessage = data[field][0]; // Take first error if it's an array
                        } else if (typeof data[field] === 'string') {
                            errorMessage = data[field];
                        } else if (typeof data[field] === 'object') {
                            // Handle nested error objects
                            const nestedErrors = Object.values(data[field]).flat();
                            errorMessage = nestedErrors.join(' ');
                        }
                        break;
                    }
                }
                
                // If we didn't find a specific message, try to stringify the data
                if (errorMessage === 'Login failed. Please try again.') {
                    try {
                        const stringified = JSON.stringify(data);
                        if (stringified !== '{}') {
                            errorMessage = stringified;
                        }
                    } catch (e) {
                        console.error('Error stringifying error data:', e);
                    }
                }
            }
            
            // For 401, use a more user-friendly message
            if (status === 401) {
                errorMessage = 'Invalid username or password. Please try again.';
            }
            
            // Update the error message
            errorToThrow.message = errorMessage;
            throw errorToThrow;
        }
        
        // For network errors or other unhandled errors
        const genericError = new Error(error.message || 'Unable to connect to the server. Please check your internet connection and try again.');
        genericError.status = error.response?.status || 0;
        genericError.data = error.response?.data;
        throw genericError;
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