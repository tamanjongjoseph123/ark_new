import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  StatusBar,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { BASE_URL } from "./base_url"
import { login as apiLogin } from "./services/api"

export default function SonsApplication() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    occupation: "",
    testimony: "",
    whyJoin: "",
    commitment: "",
  })
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginVisible, setLoginVisible] = useState(false)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    // Validate required fields
    const missing = []
    if (!formData.fullName) missing.push("Full Name")
    if (!formData.email) missing.push("Email")
    if (!formData.phone) missing.push("Phone")
    if (!formData.whyJoin && !formData.testimony) missing.push("Your Interest")
    if (!formData.commitment && !formData.testimony) missing.push("Your Goals")
    if (!username) missing.push("Username")
    if (!password) missing.push("Password")
    if (missing.length) {
      Alert.alert("Missing Information", `Please fill: ${missing.join(", ")}`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/applications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_type: 'sons_of_john_chi',
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phone,
          your_interest: formData.whyJoin || formData.testimony,
          your_goals: formData.commitment || formData.testimony,
          username,
          password,
        })
      });

      const responseData = await response.json()
      
      if (!response.ok) {
        let errorMessage = "Failed to submit application"
        if (responseData) {
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

      // Show success message and open login modal with pre-filled credentials
      Alert.alert(
        "Application Submitted!", 
        "Your application has been received. You can log in while your application is being reviewed.",
        [
          {
            text: "Log In Now",
            onPress: () => {
              setLoginUsername(username)
              setLoginPassword(password)
              setLoginVisible(true)
            }
          },
          { text: "OK" }
        ]
      )
      
      // Clear form but keep username for login
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        occupation: "",
        testimony: "",
        whyJoin: "",
        commitment: "",
      })
      setPassword("")
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>


      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <LinearGradient colors={["#2E4057", "#385780"]} style={styles.welcomeGradient}>
              <Ionicons name="heart" size={40} color="#FFF" />
              <Text style={styles.welcomeTitle}>Become A Son of John Chi</Text>
              <Text style={styles.welcomeText}>
                Become a Son of John Chi and join a community dedicated to spiritual growth, fellowship, and serving
                God's purpose.
              </Text>
            </LinearGradient>
          </View>

          {/* Application Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(value) => handleInputChange("fullName", value)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your address"
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.textInput}
                placeholder="MM/DD/YYYY"
                value={formData.dateOfBirth}
                onChangeText={(value) => handleInputChange("dateOfBirth", value)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Occupation</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your occupation"
                value={formData.occupation}
                onChangeText={(value) => handleInputChange("occupation", value)}
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.sectionTitle}>Your Story</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Testimony</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Share your testimony or why you want to join (optional)"
                value={formData.testimony}
                onChangeText={(value) => {
                  handleInputChange("testimony", value)
                  // Auto-fill whyJoin and commitment if they're empty
                  if (!formData.whyJoin) handleInputChange("whyJoin", value)
                  if (!formData.commitment) handleInputChange("commitment", value)
                }}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Why do you want to join Sons of John Chi? *
                {!formData.whyJoin && !formData.testimony && (
                  <Text style={{color: 'red'}}> (Required)</Text>
                )}
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Share your reasons for joining"
                value={formData.whyJoin}
                onChangeText={(value) => handleInputChange("whyJoin", value)}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                What are your spiritual goals? *
                {!formData.commitment && !formData.testimony && (
                  <Text style={{color: 'red'}}> (Required)</Text>
                )}
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Share your spiritual goals and commitments"
                value={formData.commitment}
                onChangeText={(value) => handleInputChange("commitment", value)}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Create Username *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Create Password *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Create a strong password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.submitGradient}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Application</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => {
                setLoginUsername(username || "")
                setLoginPassword(password || "")
                setLoginVisible(true)
              }}
            >
              <LinearGradient colors={["#2E4057", "#385780"]} style={styles.loginGradient}>
                <Text style={styles.loginButtonText}>Already have an account? Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              * Required fields. Your application will be reviewed by our leadership team.
            </Text>

            {/* Login Modal */}
            <Modal 
              visible={loginVisible} 
              transparent 
              animationType="slide"
              onRequestClose={() => setLoginVisible(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Login to Sons of John Chi</Text>
                  
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
                      <Text style={[styles.modalButtonText, {color: '#333'}]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalPrimary]}
                      disabled={loginLoading}
                      onPress={async () => {
                        if (!loginUsername || !loginPassword) {
                          Alert.alert("Error", "Please enter both username and password")
                          return
                        }

                        try {
                          setLoginLoading(true)
                          const res = await apiLogin({
                            username: loginUsername.trim(),
                            password: loginPassword,
                          })

                          // Handle successful login
                          setLoginVisible(false)

                          // Show success message and redirect to courses
                          Alert.alert(
                            "Login Successful!", 
                            "You have successfully logged in to your Sons of John Chi account.",
                            [
                              {
                                text: "Continue",
                                onPress: () => {
                                  router.push('/courses')
                                },
                              },
                            ]
                          )

                          // Clear login form
                          setLoginUsername("")
                          setLoginPassword("")
                        } catch (error) {
                          console.error("Login error:", error)
                          let errorMessage = "Login failed. Please try again."

                          // Handle different error formats
                          if (error.response) {
                            const { data, status } = error.response
                            if (status === 401) {
                              errorMessage = "Invalid username or password. Please try again."
                            } else if (data.detail) {
                              errorMessage = data.detail
                            } else if (data.error) {
                              errorMessage = data.error
                            } else if (typeof data === 'string') {
                              errorMessage = data
                            } else if (typeof data === 'object') {
                              errorMessage = Object.values(data).flat().join('\n')
                            }
                          } else if (error.message) {
                            errorMessage = error.message
                          }

                          Alert.alert("Login Failed", errorMessage)
                        } finally {
                          setLoginLoading(false)
                        }
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: StatusBar.currentHeight, // Add padding for status bar
  },
  header: {
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 5,
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    paddingTop: 0, // Remove any top padding from scroll view
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra padding at the bottom of the content
  },
  welcomeSection: {
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  welcomeGradient: {
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
  },
  formContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 60, // Extra padding to account for tab bar
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E4057",
    marginBottom: 20,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E4057",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loginButton: {
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 12,
    color: "#666",
    marginTop: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E4057',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancel: {
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  modalPrimary: {
    backgroundColor: '#1e67cd',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
