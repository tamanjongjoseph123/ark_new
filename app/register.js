import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from './Contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CountryPicker from 'react-native-country-picker-modal';
import { BASE_URL } from './base_url';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [contact, setContact] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [callingCode, setCallingCode] = useState('1');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUserToken } = useContext(AuthContext);

  const handleRegister = async () => {
    // Normalize input data
    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCountry = country.toLowerCase().trim();
    const normalizedContact = contact.replace(/\s+/g, '');

    // Frontend validation
    if (!normalizedUsername || !normalizedEmail || !normalizedCountry || !normalizedContact || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = '/api/users/';
      const registerUrl = new URL(endpoint, BASE_URL).toString();

      const response = await axios.post(registerUrl, {
        username: normalizedUsername,
        email: normalizedEmail,
        password,
        country: normalizedCountry,
        contact: `+${callingCode}${normalizedContact}`
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      Alert.alert(
        'Success', 
        'Registration successful! Please login with your credentials.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } catch (error) {
      console.log('Registration error:', error.response?.data || error.message);
      
      let errorMessage = 'Registration failed. Please check your information and try again.';
      
      if (error.response?.data) {
        if (error.response.data.username?.includes('already exists')) {
          errorMessage = 'Username already exists. Please choose a different username.';
        } else if (error.response.data.email?.includes('already exists')) {
          errorMessage = 'Email already exists. Please use a different email address.';
        } else if (error.response.data.email?.includes('valid')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.response.data.password) {
          errorMessage = 'Password must be at least 4 characters long.';
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          const errorMessages = Object.entries(error.response.data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorMessage = errorMessages || errorMessage;
        }
      }

      Alert.alert(
        'Registration Error',
        errorMessage,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCountry(country.name);
    setCallingCode(country.callingCode[0]);
    setCountryPickerVisible(false);
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
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitle}>Join our community</Text>

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
            <Ionicons name="mail-outline" size={24} color="#FFD700" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={styles.countryContainer}
            onPress={() => setCountryPickerVisible(true)}
          >
            <Ionicons name="globe-outline" size={24} color="#FFD700" style={styles.inputIcon} />
            <Text style={styles.countryText}>{country || 'Select Country'}</Text>
            <Ionicons name="chevron-down" size={24} color="#FFD700" />
          </TouchableOpacity>

          <View style={styles.phoneContainer}>
            <TouchableOpacity 
              style={styles.countryCodeContainer}
              onPress={() => setCountryPickerVisible(true)}
            >
              <Text style={styles.countryCodeText}>+{callingCode}</Text>
            </TouchableOpacity>
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone Number"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={contact}
                onChangeText={setContact}
              />
            </View>
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

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#FFD700" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color="#FFD700" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.disabledButton]}
            onPress={handleRegister}
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
                <Text style={styles.registerButtonText}>Sign Up</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CountryPicker
        withFilter
        withFlag
        withCallingCode
        withEmoji
        onSelect={onSelectCountry}
        countryCode={countryCode}
        visible={countryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
      />
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
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
  },
  countryText: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  countryCodeContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
    marginRight: 10,
    minWidth: 80,
  },
  countryCodeText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
  },
  phoneInput: {
    color: '#FFF',
    fontSize: 16,
  },
  registerButton: {
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
  registerButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
});
