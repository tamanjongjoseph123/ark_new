import React, { useContext, useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View, Text, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './Contexts/AuthContext';
import { router, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from './base_url';

export default function Login() {
    const { setUserToken } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const route = useRouter()
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        try {
            // Normalize input data
            const normalizedUsername = username.toLowerCase().trim();
            const normalizedPassword = password.trim();

            if (!normalizedUsername || !normalizedPassword) {
                Alert.alert('Error', 'Please enter both username and password');
                return;
            }

            setIsLoading(true);
            const endpoint = '/api/login/';
            const loginUrl = new URL(endpoint, BASE_URL).toString();
            
            const response = await axios.post(loginUrl, {
                username: normalizedUsername,
                password: normalizedPassword,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            // Clear old tokens first
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('refreshToken');
            
            // Save the new tokens
            await AsyncStorage.setItem('userToken', response.data.token);
            await AsyncStorage.setItem('refreshToken', response.data.refresh);
            
            // Update the AuthContext with new token
            setUserToken(response.data.token);
            
            // Navigate to home after successful login
            router.push('/');
        } catch (error) {
            console.log('Login error:', error.response?.data || error.message);
            
            let errorMessage = 'Login failed. Please check your credentials and try again.';
            
            if (error.response?.data) {
                if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.non_field_errors) {
                    errorMessage = error.response.data.non_field_errors[0];
                }
            }

            Alert.alert(
                'Login Failed',
                errorMessage,
                [{ text: 'OK' }],
                { cancelable: true }
            );
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
    
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/ark-of-god.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={24} color="#FFD700" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#666"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#FFD700" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={24}
                color="#FFD700"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 100,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 30,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
