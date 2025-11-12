import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Use the useRouter hook from expo-router
import axios from 'axios';
import { BASE_URL } from '../base_url';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter(); // Get the router object

    // Helper functions for token management
    const getToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            return token;
        } catch (error) {
            console.error('Error fetching token:', error);
            return null;
        }
    };

    const validateToken = async (token) => {
        try {
            // Use the users endpoint to validate the token
            const response = await axios.get(`${BASE_URL}/api/users/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.status === 200;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    };

    const saveToken = async (token) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            setUserToken(token);
        } catch (error) {
            console.error('Error saving token:', error);
        }
    };

    const removeToken = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
            // Only navigate to login if explicitly called from a logout action
            // Don't redirect automatically when token validation fails
        } catch (error) {
            console.error('Error removing token:', error);
        }
    };

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await getToken();
                if (token) {
                    const isValid = await validateToken(token);
                    if (isValid) {
                        setUserToken(token);
                    } else {
                        // Only remove token if it's invalid, but don't redirect
                        await AsyncStorage.removeItem('userToken');
                    }
                }
            } catch (error) {
                console.error('Error during token check:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkToken();
    }, []);

    return (
        <AuthContext.Provider value={{ userToken, setUserToken: saveToken, removeToken, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
