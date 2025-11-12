"use client"

import React, { useState, useContext } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from 'expo-router';
import { BASE_URL } from "./base_url"
import { login as apiLogin } from "./services/api"
import { AuthContext } from "./Contexts/AuthContext"

export default function MentorshipScreen() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [interests, setInterests] = useState("")
  const [goals, setGoals] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginVisible, setLoginVisible] = useState(false)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const { setUserToken } = useContext(AuthContext)

  const handleLogin = async (username, password) => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password")
      return false;
    }

    try {
      const data = await apiLogin({
        username,
        password,
      });

      if (data.access) {
        // Store the token in context
        await setUserToken(data.access);
        
        // Close the login modal
        setLoginVisible(false);
        
        // Clear form
        setLoginUsername("");
        setLoginPassword("");
        
        // Navigate to mentor courses
        router.replace('/mentorcourses');
        return true;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error.response?.data?.detail || "Invalid username or password"
      );
      return false;
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !phone || !interests || !goals || !username || !password) {
      Alert.alert("Error", "Please fill all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/applications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_type: "mentorship",
          full_name: fullName,
          email,
          phone_number: phone,
          your_interest: interests,
          your_goals: goals,
          username,
          password,
        }),
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        let errorMessage = "Failed to submit application"
        if (responseData) {
          // Handle different error response formats
          if (typeof responseData === 'string') {
            errorMessage = responseData
          } else if (responseData.username) {
            errorMessage = `Username: ${responseData.username.join(', ')}`
          } else if (responseData.email) {
            errorMessage = `Email: ${responseData.email.join(', ')}`
          } else if (responseData.detail) {
            errorMessage = responseData.detail
          } else {
            errorMessage = JSON.stringify(responseData)
          }
        }
        throw new Error(errorMessage)
      }

      // Show success message and log in automatically with the new credentials
      const loginSuccess = await handleLogin(username, password);
      if (!loginSuccess) {
        // If auto-login fails, show the login modal with pre-filled credentials
        Alert.alert(
          "Application Submitted!", 
          "Your application has been received. Please log in with your new credentials.",
          [
            {
              text: "Log In Now",
              onPress: () => {
                setLoginUsername(username);
                setLoginPassword(password);
                setLoginVisible(true);
              }
            },
            { text: "OK" }
          ]
        );
      }
      
      // Clear form
      setFullName("")
      setEmail("")
      setPhone("")
      setInterests("")
      setGoals("")
      setPassword("")
      // Don't clear username to make it easier for login
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to submit application. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Mentorship Application</Text>
          <Text style={styles.subtitle}>Fill in your details to apply for mentorship</Text>

          {/* Full Name */}
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="Email *"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Phone */}
          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Interests */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your Interests *"
            multiline
            numberOfLines={3}
            value={interests}
            onChangeText={setInterests}
          />

          {/* Goals */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your Goals *"
            multiline
            numberOfLines={3}
            value={goals}
            onChangeText={setGoals}
          />

          {/* Username */}
          <TextInput
            style={styles.input}
            placeholder="Desired Username *"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          {/* Password */}
          <TextInput
            style={styles.input}
            placeholder="Password *"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ["#ccc", "#999"] : ["#1e67cd", "#4a90e2"]}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="send"
                    size={20}
                    color="white"
                    style={styles.submitIcon}
                  />
                  <Text style={styles.submitButtonText}>Submit Application</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginButtonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                setLoginUsername(username || "")
                setLoginPassword(password || "")
                setLoginVisible(true)
              }}
            >
              <LinearGradient 
                colors={["#1e67cd", "#4a90e2"]} 
                style={styles.loginGradient}
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}}
              >
                <Text style={styles.loginButtonText}>Login</Text>
                <Ionicons name="log-in" size={20} color="white" style={styles.loginIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            * Required fields. Your application will be reviewed by our mentorship team.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={loginVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLoginVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Login</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Username"
              autoCapitalize="none"
              value={loginUsername}
              onChangeText={setLoginUsername}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              secureTextEntry
              value={loginPassword}
              onChangeText={setLoginPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  if (loginLoading) return
                  setLoginVisible(false)
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimary]}
                disabled={loginLoading}
                onPress={async () => {
                  setLoginLoading(true);
                  await handleLogin(loginUsername, loginPassword);
                }}
              >
                {loginLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.loginButtonContent}>
                    <Ionicons name="log-in" size={18} color="white" style={styles.loginIcon} />
                    <Text style={styles.modalButtonText}>Login</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30, // Add some padding at the bottom
  },
  loginButtonContainer: {
    marginTop: 15,
    marginBottom: 20,
    width: '100%',
  },
  loginButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  loginGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e67cd",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 25,
    overflow: "hidden",
    alignSelf: "center",
    width: "100%",
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitIcon: {
    marginRight: 8,
  },
  footerNote: {
    marginTop: 15,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  nextButton: {
    borderRadius: 25,
    overflow: "hidden",
    width: "100%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e67cd",
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalCancel: {
    backgroundColor: "#999",
  },
  modalPrimary: {
    backgroundColor: "#1e67cd",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: 'center',
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginIcon: {
    marginRight: 8,
  },
})
