"use client"

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  SafeAreaView,
  Image,
  Modal,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import Carousel from "../carousel"
import { LinearGradient } from "expo-linear-gradient"
import WebView from "react-native-webview"
import useData from "../hooks/useData"

export default function Index() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("home")
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const { isLoading, data } = useData()

  const handleVideoPress = (video) => {
    // console.log('Video clicked:', video);
    // console.log('YouTube URL:', video.youtube_url);

    if (video.youtube_url) {
      try {
        console.log("Processing YouTube URL:", video.youtube_url)
        let videoId

        // Handle youtu.be format
        if (video.youtube_url.includes("youtu.be/")) {
          videoId = video.youtube_url.split("youtu.be/")[1]?.split("?")[0]
        }
        // Handle youtube.com format
        else if (video.youtube_url.includes("youtube.com")) {
          videoId = video.youtube_url.split("v=")[1]?.split("&")[0]
        }

        console.log("Extracted video ID:", videoId)

        if (videoId) {
          console.log("Navigating to video details with:", {
            videoId,
            title: video.title,
            youtubeUrl: video.youtube_url,
          })

          router.push({
            pathname: "/video-details",
            params: {
              videoId,
              title: video.title,
              youtubeUrl: video.youtube_url,
            },
          })
        } else {
          console.error("Invalid video ID extracted from URL")
          Alert.alert("Error", "Invalid YouTube video URL")
        }
      } catch (error) {
        console.error("Error processing video URL:", error)
        Alert.alert("Error", "Could not process video URL")
      }
    } else {
      console.error("No YouTube URL found in video object")
      Alert.alert("Error", "No video URL available")
    }
  }

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const renderVideoSection = (title, data, category) => (
    <View style={styles.sermonsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => router.push(`/${category}`)} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={16} color="#D8C9AE" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sermonsScroll}>
        {data.map((item) => {
          const videoId = getYouTubeId(item.youtube_url)
          const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null

          return (
            <TouchableOpacity key={item.id} style={styles.sermonCard} onPress={() => handleVideoPress(item)}>
              <View style={styles.thumbnailContainer}>
                {thumbnailUrl ? (
                  <Image source={{ uri: thumbnailUrl }} style={styles.sermonThumbnail} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="videocam-outline" size={40} color="#999" />
                    <Text style={styles.placeholderText}>No Thumbnail Available</Text>
                  </View>
                )}
                <LinearGradient colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]} style={styles.thumbnailOverlay}>
                  <View style={styles.playButton}>
                    <Ionicons name="play-circle" size={50} color="#FFF" />
                  </View>
                </LinearGradient>
              </View>
              <View style={styles.sermonInfo}>
                <Text style={styles.sermonTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(item.youtube_url)}>
                  <Text style={styles.watchFullVideo}>Click here to Watch Full Video</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )

  const DrawerWithHeader = ({ children }) => {
    // Simple cross-platform header component
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/ark-of-god.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        {children}
      </View>
    )
  }

  const handleWatchSermon = async (youtubeUrl) => {
    try {
      const supported = await Linking.canOpenURL(youtubeUrl)

      if (supported) {
        await Linking.openURL(youtubeUrl)
      } else {
        Alert.alert("Error", "Cannot open YouTube video. Please make sure you have YouTube installed.")
      }
    } catch (error) {
      console.error("Error opening YouTube link:", error)
      Alert.alert("Error", "Something went wrong while opening the video")
    }
  }

  const handleWatchLive = () => {
    // Update with actual live stream URL
    const liveStreamUrl = "https://www.johnchi.org/ark-of-god-tv-live"
    Linking.openURL(liveStreamUrl)
  }

  const handleWatchVideo = async (videoUrl) => {
    try {
      const supported = await Linking.canOpenURL(videoUrl)
      if (supported) {
        await Linking.openURL(videoUrl)
      } else {
        Alert.alert("Error", "Cannot open YouTube video. Please make sure you have YouTube installed.")
      }
    } catch (error) {
      console.error("Error opening YouTube link:", error)
      Alert.alert("Error", "Something went wrong while opening the video")
    }
  }

  return (
    <>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <DrawerWithHeader>
        <SafeAreaView style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <Carousel />

            {/* Quick Access Section */}
            <View style={styles.quickAccessContainer}>
              <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push("/live")}>
                <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.quickAccessGradient}>
                  <View style={styles.liveContainer}>
                    <Text style={styles.liveHeaderText}>LIVE</Text>
                    <View style={styles.liveIndicatorContainer}>
                      <View style={styles.livePulse} />
                      <View style={styles.liveDot} />
                      <Text style={[styles.liveText, { color: "#FF3B30" }]}>click to watch live</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push("/giving")}>
                <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.quickAccessGradient}>
                  <Ionicons name="gift" size={24} color="#FFF" />
                  <Text style={styles.quickAccessText}>Way to Give</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push("/praise-and-worship")}>
                <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.quickAccessGradient}>
                  <Ionicons name="musical-notes" size={24} color="#FFF" />
                  <Text style={styles.quickAccessText}>Praise & Worship</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push("/bible")}>
                <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.quickAccessGradient}>
                  <Ionicons name="book" size={24} color="#FFF" />
                  <Text style={styles.quickAccessText}>The Bible</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Video Sections */}
            {renderVideoSection("PROPHECY", data.prophecies, "prophecies")}
            {renderVideoSection("CRUSADES", data.crusades, "crusades")}
            {renderVideoSection("TESTIMONIES", data.testimonies, "testimonies")}
            {renderVideoSection("HEALINGS", data.healings, "healings")}
            {renderVideoSection("PRAYERS FOR VIEWERS", data.prayers, "prayers_for_viewers")}
            {renderVideoSection("SERMONS", data.massPrayers, "sermons")}
            {renderVideoSection("DELIVERANCE", data.deliverance, "deliverance")}
            {renderVideoSection("CHARITIES", data.charities, "charities")}

            {/* Quotes Section */}
            <View style={styles.quotesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Inspirational Quotes</Text>
                <TouchableOpacity onPress={() => router.push("/quotes")} style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="arrow-forward" size={16} color="#D8C9AE" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quotesScroll}>
                {data.quotes.map((quote) => (
                  <View key={quote.id} style={styles.quoteCard}>
                    <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.quoteGradient}>
                      <View style={styles.quoteIconContainer}>
                        <Image source={require("../../assets/images/pastorr.jpg")} style={styles.pastorImage} />
                      </View>
                      <Text style={styles.quoteText}>"{quote.quote}"</Text>
                      <Text style={styles.quoteAuthor}>- Apostle John Chi</Text>
                      <Text style={styles.quoteDate}>{new Date(quote.created_at).toLocaleDateString()}</Text>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Prayer Request Section */}
            <TouchableOpacity style={styles.prayerSection} onPress={() => router.push("/prayer-request")}>
              <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.prayerGradient}>
                <Ionicons name="heart" size={40} color="#FFF" />
                <Text style={styles.prayerTitle}>Join Our Prayer Room</Text>
                <Text style={styles.prayerSubtitle}>
                  Join our prayer room to connect with others in faith, share your prayer requests, and experience the
                  power of collective prayer.
                </Text>
                <View style={styles.prayerButton}>
                  <Text style={styles.prayerButtonText}>Join</Text>
                  <Ionicons name="arrow-forward" size={20} color="#385780" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Testimony Submission Section */}
            <TouchableOpacity
              style={[styles.prayerSection, styles.testimonySection]}
              onPress={() => router.push("/submit-testimony")}
            >
              <LinearGradient colors={["#1E3A8A", "#2563EB"]} style={styles.prayerGradient}>
                <Ionicons name="megaphone" size={40} color="#FFF" />
                <Text style={styles.prayerTitle}>Share Your Testimony</Text>
                <Text style={styles.prayerSubtitle}>
                  Has God done something amazing in your life? Share your story through text or video to encourage
                  others.
                </Text>
                <View style={styles.prayerButton}>
                  <Text style={styles.prayerButtonText}>Submit Your Testimony</Text>
                  <Ionicons name="arrow-forward" size={20} color="#1E3A8A" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Partner Lounge Section */}
            <View style={styles.partnerLoungeContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>PARTNER'S PORTAL</Text>
                <TouchableOpacity onPress={() => router.push("/lounge")} style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="arrow-forward" size={16} color="#D8C9AE" />
                </TouchableOpacity>
              </View>

              <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.partnerCard}>
                <View style={styles.partnerContent}>
                  <Ionicons name="diamond" size={40} color="#FFF" />
                  <Text style={styles.partnerTitle}>Exclusive Partner Access</Text>
                  <Text style={styles.partnerDescription}>
                    Join our partnership program to access exclusive content, special events, and direct communication
                    channels.
                  </Text>
                  <TouchableOpacity style={styles.partnerButton} onPress={() => router.push("/lounge")}>
                    <Text style={styles.partnerButtonText}>Enter Partner's Portal</Text>
                    <Ionicons name="arrow-forward" size={20} color="#385780" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Mentorship Section */}
            <TouchableOpacity onPress={()=> router.push("/mentorship")} style={styles.partnerContainer}>
              <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.partnerCard}>
                <View style={styles.partnerContent}>
                  <Ionicons name="school" size={40} color="#FFF" />
                  <Text style={styles.partnerTitle}>Mentorship Program</Text>
                  <Text style={styles.partnerDescription}>
                    Connect with experienced spiritual mentors for personal growth, guidance, and one-on-one
                    discipleship sessions.
                  </Text>
                  <TouchableOpacity style={styles.partnerButton} onPress={() => router.push("/mentorship")}>
                    <Text style={styles.partnerButtonText}>Join Our MentorShip</Text>
                    <Ionicons name="arrow-forward" size={20} color="#385780" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Events Section */}
            <View style={styles.eventsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <TouchableOpacity onPress={() => router.push("/events")} style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="arrow-forward" size={16} color="#D8C9AE" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
                {data.events.map((event) => (
                  <TouchableOpacity   onPress={() => router.push("/events")} key={event.id} style={styles.eventCard}>
                    <View style={styles.eventImageContainer}>
                      <Image
                        source={{ uri: event.image }}
                        style={styles.eventImage}
                        resizeMode="cover"
                        onError={(e) => console.log("Image loading error:", e.nativeEvent.error)}
                      />
                      {!event.image && (
                        <View style={styles.placeholderContainer}>
                          <Ionicons name="image-outline" size={40} color="#999" />
                          <Text style={styles.placeholderText}>No Image Available</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDate}>{new Date(event.event_date).toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity >
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false)
            }}
          >
            <View style={styles.modalContainer}>
              <WebView
                source={{ uri: selectedVideo }}
                style={styles.video}
                allowsFullscreenVideo
                javaScriptEnabled={true}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false)
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </SafeAreaView>
      </DrawerWithHeader>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollView: {
    flex: 1,
  },
  quickAccessContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 15,
    marginTop: -20,
    zIndex: 1,
  },
  quickAccessItem: {
    width: "48%",
    height: 90,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 15,
  },
  quickAccessGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  quickAccessText: {
    color: "#FFF",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  sermonsContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
    letterSpacing: 0.5,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D8C9AE",
  },
  sermonsScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  sermonCard: {
    width: 280,
    marginRight: 20,
    backgroundColor: "#FFF",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(216,201,174,0.1)",
  },
  thumbnailContainer: {
    height: 180,
    position: "relative",
  },
  sermonThumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(216,201,174,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sermonInfo: {
    padding: 16,
    backgroundColor: "#FFF",
  },
  sermonTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    lineHeight: 24,
  },
  sermonMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sermonDate: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  sermonSpeaker: {
    fontSize: 14,
    color: "#D8C9AE",
    marginLeft: 6,
    fontWeight: "600",
  },
  prayerSection: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(216,201,174,0.2)",
  },
  prayerGradient: {
    padding: 25,
    alignItems: "center",
    backgroundColor: "#2E4057",
  },
  prayerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 10,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  prayerSubtitle: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
    opacity: 0.9,
  },
  prayerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  prayerButtonText: {
    color: "#385780",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 10,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 4,
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
  activeNavText: {
    color: "#D8C9AE",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#000000",
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#385780",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  headerLogo: {
    width: 500,
    height: 40,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  drawerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  drawerItem: {
    fontSize: 18,
    paddingVertical: 10,
  },
  eventsContainer: {
    padding: 20,
    marginBottom: 20,
  },
  eventsScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  eventsScrollContent: {
    alignItems: "center",
  },
  eventCard: {
    width: 270,
    marginRight: 20,
    borderRadius: 15,
    backgroundColor: "#FFF",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  eventImageContainer: {
    width: "100%",
    height: 150,
    overflow: "hidden",
    backgroundColor: "#f0f0f0", // Light gray background to show the container
    justifyContent: "center",
    alignItems: "center",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    color: "#999",
    fontSize: 12,
  },
  eventInfo: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
  },
  contentSection: {
    padding: 15,
    marginBottom: 20,
  },
  boxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  boxItem: {
    width: "48%",
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFF",
    elevation: 3,
  },
  boxThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  videoInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  watchFullVideo: {
    fontSize: 16,
    color: "#B8860B",
    textAlign: "center",
    fontWeight: "600",
    paddingVertical: 8,
    textDecorationLine: "underline",
  },
  liveContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 5,
  },
  liveIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  livePulse: {
    position: "absolute",
    backgroundColor: "#FF3B30",
    width: 12,
    height: 12,
    borderRadius: 6,
    left: -15,
    opacity: 0.5,
    transform: [{ scale: 1.5 }],
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
    marginRight: 6,
  },
  liveText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  liveIcon: {
    marginBottom: 4,
  },
  liveTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  liveSubtitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 2,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  video: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 5,
    zIndex: 1,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  watchFullButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  quotesContainer: {
    padding: 20,
    marginBottom: 20,
  },
  quotesScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  quoteCard: {
    width: 300,
    height: "auto",
    minHeight: 200,
    marginRight: 20,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quoteGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  quoteIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    marginBottom: 15,
    marginTop: 10,
  },
  pastorImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  quoteText: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 15,
    lineHeight: 22,
    fontStyle: "italic",
    paddingHorizontal: 10,
    flexShrink: 1,
  },
  quoteAuthor: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "700",
    marginBottom: 5,
    marginTop: "auto",
  },
  quoteDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  partnerLoungeContainer: {
    padding: 20,
    marginBottom: 20,
  },
  partnerCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  partnerContent: {
    padding: 25,
    alignItems: "center",
  },
  partnerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 15,
    marginBottom: 12,
    textAlign: "center",
  },
  partnerDescription: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
    opacity: 0.9,
  },
  partnerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  partnerButtonText: {
    color: "#385780",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 10,
  },
  liveHeaderText: {
    color: "#FF3B30",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: "rgba(255, 59, 48, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  partnerContainer: {
    padding: 20,
    marginBottom: 20,
  },
})
