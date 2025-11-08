"use client"

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
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { BASE_URL } from "../base_url"

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
      const payload = {
        application_type: "sons_of_john_chi",
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone,
        your_interest: formData.whyJoin || formData.testimony,
        your_goals: formData.commitment || formData.testimony,
        username,
        password,
      }
      const res = await fetch(`${BASE_URL}/api/applications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        let msg = 'Failed to submit application'
        try { const err = await res.json(); msg = typeof err === 'string' ? err : JSON.stringify(err) } catch {}
        throw new Error(msg)
      }
      Alert.alert('Success', 'Application submitted! You can now log in while pending review.')
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
      setUsername("")
      setPassword("")
    } catch (e) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="people" size={32} color="#FFF" />
          <Text style={styles.headerTitle}>Sons of John Chi</Text>
          <Text style={styles.headerSubtitle}>Application Form</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

            <Text style={styles.sectionTitle}>Spiritual Journey</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Testimony *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Share your testimony and relationship with Christ"
                value={formData.testimony}
                onChangeText={(value) => handleInputChange("testimony", value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Why do you want to join? *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Explain why you want to become a Son of John Chi"
                value={formData.whyJoin}
                onChangeText={(value) => handleInputChange("whyJoin", value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Commitment</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your commitment"
                value={formData.commitment}
                onChangeText={(value) => handleInputChange("commitment", value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>

            {/* Account Credentials */}
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Desired Username *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Choose a username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter a password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
              <LinearGradient colors={loading ? ["#9bbcf0", "#9bbcf0"] : ["#1e67cd", "#1e67cd"]} style={styles.submitGradient}>
                {loading ? (
                  <Text style={styles.submitText}>Submitting...</Text>
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#FFF" style={styles.submitIcon} />
                    <Text style={styles.submitText}>Submit Application</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=> router.push("/payment")}  style={styles.nextButton}>
              <LinearGradient colors={["#2E4057", "#385780"]} style={styles.nextGradient}>
                <Text style={styles.nextText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.nextIcon} />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              * Required fields. Your application will be reviewed by our leadership team.
            </Text>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 10,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 5,
    opacity: 0.9,
  },
  welcomeSection: {
    margin: 20,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeGradient: {
    padding: 25,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 15,
    marginBottom: 10,
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
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  submitButton: {
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  submitIcon: {
    marginRight: 10,
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 30,
  },
  nextButton: {
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  nextText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  nextIcon: {
    marginLeft: 10,
  },
})
