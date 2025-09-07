"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { submitPrayerRequest } from "./services/api"

export default function PrayerRequest() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [prayerRequest, setPrayerRequest] = useState("")
  const [isConfidential, setIsConfidential] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!country.trim()) {
      newErrors.country = "Country is required"
    }

    if (!prayerRequest.trim()) {
      newErrors.prayerRequest = "Prayer request is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields correctly")
      return
    }

    try {
      setIsLoading(true)
      const requestData = {
        name,
        email,
        phone_number: phone,
        country,
        request: prayerRequest,
        is_confidential: isConfidential,
      }

      await submitPrayerRequest(requestData)

      Alert.alert("Thank You", "Your prayer request has been submitted. Our prayer team will be praying for you.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      console.error("Error submitting prayer request:", error)
      Alert.alert("Error", "Failed to submit your prayer request. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderError = (fieldName) => {
    if (errors[fieldName]) {
      return <Text style={styles.errorText}>{errors[fieldName]}</Text>
    }
    return null
  }

  return (
    <SafeAreaView style={styles.container}>
  

      <ScrollView style={styles.content}>
        <View style={styles.prayerCallBox}>
          <View style={styles.callHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            {/* <TouchableOpacity style={styles.joinCallButton}>
              <Ionicons name="headset" size={20} color="#FFF" />
              <Text style={styles.joinCallText}>Join Prayer</Text>
            </TouchableOpacity> */}
          </View>

          <View style={styles.callContent}>
            <Ionicons name="radio" size={24} color="#1e67cd" />
            <Text style={styles.callTitle}>Ongoing Prayer Room</Text>
            <Text style={styles.prayerTopic}>Current Topic: "Healing and Restoration"</Text>
            <Text style={styles.participantCount}>12 people praying together</Text>
          </View>

          <View style={styles.audioWave}>
            <View style={[styles.waveBar, { height: 8 }]} />
            <View style={[styles.waveBar, { height: 16 }]} />
            <View style={[styles.waveBar, { height: 12 }]} />
            <View style={[styles.waveBar, { height: 20 }]} />
            <View style={[styles.waveBar, { height: 6 }]} />
            <View style={[styles.waveBar, { height: 14 }]} />
            <View style={[styles.waveBar, { height: 18 }]} />
            <View style={[styles.waveBar, { height: 10 }]} />
          </View>
        </View>

        <View style={styles.introSection}>
          <Ionicons name="create" size={40} color="#1e67cd" />
          <Text style={styles.introTitle}>Submit Your Prayer Request</Text>
          <Text style={styles.introText}>
            Share your prayer needs with our community. Your request will be included in our prayer sessions.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(text) => {
                setName(text)
                setErrors({ ...errors, name: null })
              }}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
            {renderError("name")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setErrors({ ...errors, email: null })
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            {renderError("email")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={(text) => {
                setPhone(text)
                setErrors({ ...errors, phone: null })
              }}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            {renderError("phone")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Country <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.country && styles.inputError]}
              value={country}
              onChangeText={(text) => {
                setCountry(text)
                setErrors({ ...errors, country: null })
              }}
              placeholder="Enter your country"
              placeholderTextColor="#999"
            />
            {renderError("country")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Your Prayer Request <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.prayerRequest && styles.inputError]}
              value={prayerRequest}
              onChangeText={(text) => {
                setPrayerRequest(text)
                setErrors({ ...errors, prayerRequest: null })
              }}
              placeholder="Share your prayer request here..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
            {renderError("prayerRequest")}
          </View>

          <TouchableOpacity style={styles.confidentialButton} onPress={() => setIsConfidential(!isConfidential)}>
            <View style={[styles.checkbox, isConfidential && styles.checkboxChecked]}>
              {isConfidential && <Ionicons name="checkmark" size={16} color="#FFF" />}
            </View>
            <Text style={styles.confidentialText}>Keep my request confidential</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Prayer Request</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            * Required fields. Your prayer request will be shared with our prayer team who will faithfully pray for your
            needs.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#1e67cd",
    padding: 20,
    paddingTop: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  introSection: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e67cd",
    marginTop: 15,
    marginBottom: 10,
  },
  introText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#1e67cd",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  confidentialButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#1e67cd",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1e67cd",
    borderColor: "#1e67cd",
  },
  confidentialText: {
    fontSize: 16,
    color: "#1e67cd",
  },
  submitButton: {
    backgroundColor: "#1e67cd",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  required: {
    color: "#FF3B30",
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 5,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  prayerCallBox: {
    backgroundColor: "#FFF",
    margin: 15,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1e67cd",
  },
  callHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFF",
    marginRight: 6,
  },
  liveText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  joinCallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e67cd",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinCallText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  callContent: {
    alignItems: "center",
    marginBottom: 15,
  },
  callTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e67cd",
    marginTop: 8,
    marginBottom: 4,
  },
  prayerTopic: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  participantCount: {
    fontSize: 14,
    color: "#666",
  },
  audioWave: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 24,
  },
  waveBar: {
    width: 3,
    backgroundColor: "#1e67cd",
    marginHorizontal: 1,
    borderRadius: 2,
    opacity: 0.7,
  },
})
