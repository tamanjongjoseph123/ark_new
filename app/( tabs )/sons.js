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

const router = useRouter()
export default function SonsApplication() {
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }


  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = ["fullName", "email", "phone", "testimony", "whyJoin"]
    const missingFields = requiredFields.filter((field) => !formData[field].trim())

    if (missingFields.length > 0) {
      Alert.alert("Missing Information", "Please fill in all required fields.")
      return
    }

    Alert.alert(
      "Application Submitted",
      "Thank you for your application to become a Son of John Chi. We will review your application and get back to you soon.",
      [{ text: "OK" }],
    )
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

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.submitGradient}>
                <Ionicons name="send" size={20} color="#FFF" style={styles.submitIcon} />
                <Text style={styles.submitText}>Submit Application</Text>
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
