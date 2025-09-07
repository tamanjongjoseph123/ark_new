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
            router.push('/login');
        } catch (error) {
            console.error('Error removing token:', error);
        }
    };

    useEffect(() => {
        const checkToken = async () => {
            const token = await getToken();
            if (token) {
                const isValid = await validateToken(token);
                if (!isValid) {
                    await removeToken();
                    return;
                }
                setUserToken(token);
            }
            setIsLoading(false);
        };
        checkToken();
    }, []);

    useEffect(() => {
        if (userToken) {
            // Redirect to the desired page once the token is set
            router.push('/'); // Use router.push from expo-router
        }
    }, [userToken]); // Runs when userToken changes

    return (
        <AuthContext.Provider value={{ userToken, setUserToken: saveToken, removeToken, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
