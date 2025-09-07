"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { BASE_URL } from "./base_url"

export default function MentorshipScreen() {
  const navigation = useNavigation()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [interests, setInterests] = useState("")
  const [goals, setGoals] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!fullName || !email || !phone || !interests || !goals) {
      Alert.alert("Error", "Please fill all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/mentorship-application/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, interests, goals }),
      })

      if (!response.ok) throw new Error("Failed to submit application")

      Alert.alert("Success", "Your application has been submitted successfully!")
      setFullName("")
      setEmail("")
      setPhone("")
      setInterests("")
      setGoals("")
    } catch (err) {
      Alert.alert("Error", err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <Text style={styles.footerNote}>
        * Required fields. Your application will be reviewed by our mentorship team.
      </Text>

      {/* ✅ Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => navigation.navigate("mentorcourses")}
      >
        <LinearGradient colors={["#1e67cd", "#4a90e2"]} style={styles.nextGradient}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F8F8F8",
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
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 25,
    overflow: "hidden",
    alignSelf: "center",
    width: "70%",
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
})
