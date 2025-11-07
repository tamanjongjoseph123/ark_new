"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { BASE_URL } from "./base_url"

export default function Events() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registrationData, setRegistrationData] = useState({
    name: "",
    country: "",
    phone: "",
  })
  const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming' | 'past'

  useEffect(() => {
    fetchEvents(activeTab)
  }, [activeTab])

  const toImageUrl = (url) => {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) return url
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const fetchEvents = async (status = 'upcoming') => {
    try {
      const response = await fetch(`${BASE_URL}/api/upcoming-events/`)
      if (!response.ok) throw new Error("Failed to fetch events")
      let data = await response.json()
      if (status === 'upcoming') {
        data = data.filter((e) => (e.event_status || '').toLowerCase() === 'upcoming')
        // soonest first
        data.sort((a,b) => new Date(a.event_date) - new Date(b.event_date))
      } else {
        data = data.filter((e) => (e.event_status || '').toLowerCase() === 'past')
        // most recent past first
        data.sort((a,b) => new Date(b.event_date) - new Date(a.event_date))
      }
      // normalize image
      data = data.map(e => ({ ...e, image: toImageUrl(e.image) }))
      setEvents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const openRegistrationModal = (event) => {
    setSelectedEvent(event)
    setModalVisible(true)
  }

  const closeRegistrationModal = () => {
    setModalVisible(false)
    setSelectedEvent(null)
    setRegistrationData({ name: "", country: "", phone: "" })
  }

  const handleRegistration = async () => {
    if (!registrationData.name || !registrationData.country || !registrationData.phone) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      Alert.alert(
        "Registration Successful!",
        `You have successfully registered for "${selectedEvent?.title}". We'll contact you soon.`,
        [{ text: "OK", onPress: closeRegistrationModal }]
      )
    } catch (err) {
      Alert.alert("Error", "Failed to register. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e67cd" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => { setIsLoading(true); fetchEvents(activeTab); }}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'upcoming' && styles.tabItemActive]}
          onPress={() => { setIsLoading(true); setActiveTab('upcoming') }}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'past' && styles.tabItemActive]}
          onPress={() => { setIsLoading(true); setActiveTab('past') }}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>Past</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 24 }}>
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab === 'upcoming' ? 'upcoming' : 'past'} events at the moment.</Text>
          </View>
        ) : (
          events.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <Image source={{ uri: event.image }} style={styles.eventImage} resizeMode="cover" />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.event_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <TouchableOpacity style={styles.registerButton} onPress={() => openRegistrationModal(event)}>
                  <LinearGradient colors={["#1e67cd", "#4a90e2"]} style={styles.registerButtonGradient}>
                    <Ionicons name="calendar-outline" size={20} color="#FFF" />
                    <Text style={styles.registerButtonText}>Register for Event</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Centered Modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={closeRegistrationModal}>
        <View style={styles.centeredOverlay}>
          <View style={styles.centeredModal}>
            <TouchableOpacity style={styles.closeButtonTop} onPress={closeRegistrationModal}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Register for {selectedEvent?.title}</Text>

            <TextInput
              style={styles.formInput}
              placeholder="Full Name"
              value={registrationData.name}
              onChangeText={(text) => setRegistrationData({ ...registrationData, name: text })}
            />

            <TextInput
              style={styles.formInput}
              placeholder="Country"
              value={registrationData.country}
              onChangeText={(text) => setRegistrationData({ ...registrationData, country: text })}
            />

            <TextInput
              style={styles.formInput}
              placeholder="Phone Number"
              value={registrationData.phone}
              onChangeText={(text) => setRegistrationData({ ...registrationData, phone: text })}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.confirmButton} onPress={handleRegistration}>
              <LinearGradient colors={["#1e67cd", "#4a90e2"]} style={styles.confirmButtonGradient}>
                <Text style={styles.confirmButtonText}>Register Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", marginBottom: 10 },
  retryButton: {
    backgroundColor: "#1e67cd",
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: { color: "#FFF", fontWeight: "600" },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e5ea',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#e9f2ff',
    borderColor: '#1e67cd',
  },
  tabText: {
    color: '#5b6b7a',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1e67cd',
  },

  scrollView: { flex: 1, padding: 16 },
  emptyContainer: { alignItems: "center", padding: 20 },
  emptyText: { color: "#666" },

  eventCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
  },
  eventImage: { width: "100%", height: 200 },
  eventInfo: { padding: 16 },
  eventTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  eventDescription: { color: "#666", marginBottom: 8 },
  eventDate: { color: "#1e67cd", marginBottom: 12, fontWeight: "600" },
  registerButton: { borderRadius: 12, overflow: "hidden" },
  registerButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  registerButtonText: { color: "#FFF", fontWeight: "600" },

  // Center modal
  centeredOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredModal: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  closeButtonTop: {
    alignSelf: "flex-end",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  formInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  confirmButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  confirmButtonGradient: { padding: 12, alignItems: "center" },
  confirmButtonText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
})
