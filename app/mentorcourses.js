"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, StatusBar, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")

export default function KingdomLeadership() {
  const router = useRouter()
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)

  // Language options with their corresponding stream URLs
  const languages = [
    { name: "English", code: "en", streamUrl: "https://www.youtube.com/embed/-VJKbieTmKA" },
    { name: "French", code: "fr", streamUrl: "https://www.youtube.com/embed/-VJKbieTmKA" },
    { name: "Chinese", code: "zh", streamUrl: "https://www.youtube.com/embed/-VJKbieTmKA" },
    { name: "Spanish", code: "es", streamUrl: "https://www.youtube.com/embed/-VJKbieTmKA" },
    { name: "German", code: "de", streamUrl: "https://www.youtube.com/embed/-VJKbieTmKA" },
  ]

  const currentStreamUrl = languages.find((lang) => lang.name === selectedLanguage)?.streamUrl || languages[0].streamUrl

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name)
    setShowLanguageModal(false)
  }

  const handleVideoSelect = (video) => {
    // Extract YouTube video ID from URL
    const videoId = video.videoUrl.split("v=")[1]?.split("&")[0] || "-VJKbieTmKA"

    // Navigate to video details instead of showing modal
    router.push({
      pathname: "/video-details-two",
      params: {
        videoId: videoId,
        title: video.title,
        youtubeUrl: video.videoUrl,
      },
    })
  }

  const handleModuleSelect = (module) => {
    setSelectedModule(module)
  }

  const handleBackToModules = () => {
    setSelectedModule(null)
  }

  const modules = [
    {
      id: 1,
      name: "Servant Leadership",
      description: "Learn the biblical principles of leading through service and humility",
      thumbnail: "https://img.youtube.com/vi/C4GvseNapRw/maxresdefault.jpg",
      videoCount: 6,
      level: "Beginner to Intermediate",
    },
    {
      id: 2,
      name: "Vision Casting",
      description: "Master the art of communicating God's vision and inspiring others",
      thumbnail: "https://img.youtube.com/vi/tcM6N9iHzdM/maxresdefault.jpg",
      videoCount: 8,
      level: "Intermediate to Advanced",
    },
    {
      id: 3,
      name: "Team Building",
      description: "Build and lead effective ministry teams with Kingdom principles",
      thumbnail: "https://img.youtube.com/vi/xUoOg3fs-mo/maxresdefault.jpg",
      videoCount: 7,
      level: "All Levels",
    },
    {
      id: 4,
      name: "Conflict Resolution",
      description: "Navigate difficult situations with wisdom and grace",
      thumbnail: "https://img.youtube.com/vi/b9OQRcwAcNQ/maxresdefault.jpg",
      videoCount: 5,
      level: "Intermediate to Advanced",
    },
    {
      id: 5,
      name: "Strategic Planning",
      description: "Develop long-term strategies aligned with Kingdom purposes",
      thumbnail: "https://img.youtube.com/vi/C4GvseNapRw/maxresdefault.jpg",
      videoCount: 9,
      level: "Advanced",
    },
    {
      id: 6,
      name: "Mentoring & Discipleship",
      description: "Equip and empower the next generation of leaders",
      thumbnail: "https://img.youtube.com/vi/tcM6N9iHzdM/maxresdefault.jpg",
      videoCount: 10,
      level: "All Levels",
    },
  ]

  const getVideosForModule = (moduleId) => {
    const videoUrlsPool = [
      "https://www.youtube.com/watch?v=C4GvseNapRw&pp=ygUIam9obiBjaGk%3D",
      "https://www.youtube.com/watch?v=tcM6N9iHzdM&pp=ygUIam9obiBjaGk%3D",
      "https://www.youtube.com/watch?v=xUoOg3fs-mo&list=PLcyyL4LFGjy0T0yN5glD9HCfZuz7_7SU4",
      "https://www.youtube.com/watch?v=b9OQRcwAcNQ&pp=ygUIam9obiBjaGk%3D",
    ]

    const videoIds = ["C4GvseNapRw", "tcM6N9iHzdM", "xUoOg3fs-mo", "b9OQRcwAcNQ"]

    const videoTemplates = [
      {
        id: `${moduleId}_1`,
        title: `${modules.find((m) => m.id === moduleId)?.name} - Introduction`,
        description: "Foundation and overview of key concepts",
        duration: "45 min",
        level: "Beginner",
        videoUrl: videoUrlsPool[0],
        thumbnail: `https://img.youtube.com/vi/${videoIds[0]}/maxresdefault.jpg`,
      },
      {
        id: `${moduleId}_2`,
        title: `${modules.find((m) => m.id === moduleId)?.name} - Core Principles`,
        description: "Essential principles and practical applications",
        duration: "52 min",
        level: "Intermediate",
        videoUrl: videoUrlsPool[1],
        thumbnail: `https://img.youtube.com/vi/${videoIds[1]}/maxresdefault.jpg`,
      },
      {
        id: `${moduleId}_3`,
        title: `${modules.find((m) => m.id === moduleId)?.name} - Advanced Techniques`,
        description: "Advanced strategies and real-world implementation",
        duration: "58 min",
        level: "Advanced",
        videoUrl: videoUrlsPool[2],
        thumbnail: `https://img.youtube.com/vi/${videoIds[2]}/maxresdefault.jpg`,
      },
      {
        id: `${moduleId}_4`,
        title: `${modules.find((m) => m.id === moduleId)?.name} - Case Studies`,
        description: "Real examples and practical scenarios",
        duration: "40 min",
        level: "Intermediate",
        videoUrl: videoUrlsPool[3],
        thumbnail: `https://img.youtube.com/vi/${videoIds[3]}/maxresdefault.jpg`,
      },
      {
        id: `${moduleId}_5`,
        title: `${modules.find((m) => m.id === moduleId)?.name} - Q&A Session`,
        description: "Common questions and expert answers",
        duration: "35 min",
        level: "All Levels",
        videoUrl: videoUrlsPool[0], // Cycle back to first video
        thumbnail: `https://img.youtube.com/vi/${videoIds[0]}/maxresdefault.jpg`,
      },
    ]

    const module = modules.find((m) => m.id === moduleId)
    if (module) {
      return videoTemplates.slice(0, Math.min(module.videoCount, videoTemplates.length))
    }
    return videoTemplates
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#3498DB" barStyle="light-content" />


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!selectedModule ? (
          // Show Modules
          <>
        

            {/* Modules Grid */}
            <View style={styles.modulesContainer}>
              {modules.map((module) => (
                <TouchableOpacity key={module.id} style={styles.moduleCard} onPress={() => handleModuleSelect(module)}>
                  <Image source={{ uri: module.thumbnail }} style={styles.moduleThumbnail} resizeMode="cover" />
                  <View style={styles.moduleInfoContainer}>
                    <Text style={styles.moduleName}>{module.name}</Text>
                    <Text style={styles.moduleDescription} numberOfLines={3}>
                      {module.description}
                    </Text>
                    <View style={styles.moduleMeta}>
                      <View style={styles.moduleMetaItem}>
                        <Ionicons name="videocam" size={16} color="#3498DB" />
                        <Text style={styles.moduleMetaText}>{module.videoCount} videos</Text>
                      </View>
                      <View style={styles.moduleMetaItem}>
                        <Ionicons name="trending-up" size={16} color="#3498DB" />
                        <Text style={styles.moduleMetaText}>{module.level}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          // Show Videos for Selected Module
          <>
            {/* Module Header */}
            <View style={styles.moduleHeader}>
              <Image
                source={{ uri: selectedModule.thumbnail }}
                style={styles.moduleHeaderThumbnail}
                resizeMode="cover"
              />
              <LinearGradient colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]} style={styles.moduleHeaderOverlay}>
                <Text style={styles.moduleHeaderTitle}>{selectedModule.name}</Text>
                <Text style={styles.moduleHeaderDescription}>{selectedModule.description}</Text>
                <View style={styles.moduleHeaderMeta}>
                  <Text style={styles.moduleHeaderMetaText}>{selectedModule.videoCount} videos</Text>
                  <Text style={styles.moduleHeaderMetaText}>•</Text>
                  <Text style={styles.moduleHeaderMetaText}>{selectedModule.level}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Videos List */}
            <View style={styles.videosContainer}>
              <Text style={styles.videosSectionTitle}> Videos</Text>
              {getVideosForModule(selectedModule.id).map((video) => (
                <TouchableOpacity key={video.id} style={styles.videoCard} onPress={() => handleVideoSelect(video)}>
                  <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} resizeMode="cover" />
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <Text style={styles.videoDescription} numberOfLines={2}>
                      {video.description}
                    </Text>
                    <View style={styles.videoMeta}>
                      <View style={styles.videoMetaItem}>
                        <Ionicons name="time" size={14} color="#666" />
                        <Text style={styles.videoMetaText}>{video.duration}</Text>
                      </View>
                      <View style={styles.videoMetaItem}>
                        <Ionicons name="trending-up" size={14} color="#666" />
                        <Text style={styles.videoMetaText}>{video.level}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.videoPlayButton}>
                    <Ionicons name="play-circle" size={40} color="#3498DB" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLanguageModal(false)}>
          <View style={styles.languageModal}>
            <Text style={styles.languageModalTitle}>Select Language</Text>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[styles.languageOption, selectedLanguage === language.name && styles.languageOptionSelected]}
                onPress={() => handleLanguageSelect(language)}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    selectedLanguage === language.name && styles.languageOptionTextSelected,
                  ]}
                >
                  {language.name}
                </Text>
                {selectedLanguage === language.name && <Ionicons name="checkmark" size={20} color="#3498DB" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
  },
  headerRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  liveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
    marginRight: 6,
    shadowColor: "#FF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  liveText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    alignItems: "center",
    textAlign: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 10,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 24,
  },
  modulesContainer: {
    padding: 20,
  },
  moduleCard: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
  },
  moduleThumbnail: {
    width: "100%",
    height: 200,
  },
  moduleInfoContainer: {
    padding: 15,
    backgroundColor: "#FFF",
  },
  moduleName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 12,
    lineHeight: 20,
  },
  moduleMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moduleMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  moduleMetaText: {
    fontSize: 12,
    color: "#666",
  },
  moduleHeader: {
    height: 250,
    width: "100%",
    position: "relative",
    marginBottom: 20,
  },
  moduleHeaderThumbnail: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  moduleHeaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: "flex-end",
  },
  moduleHeaderTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 5,
  },
  moduleHeaderDescription: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 10,
  },
  moduleHeaderMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  moduleHeaderMetaText: {
    fontSize: 14,
    color: "#FFF",
    marginHorizontal: 5,
  },
  videosContainer: {
    padding: 20,
  },
  videosSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 15,
  },
  videoCard: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  videoThumbnail: {
    width: 100,
    height: 70,
    borderRadius: 8,
  },
  videoInfo: {
    flex: 1,
    padding: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 5,
  },
  videoDescription: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 10,
  },
  videoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  videoMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  videoMetaText: {
    fontSize: 13,
    color: "#666",
  },
  videoPlayButton: {
    padding: 10,
  },

  // Language Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  languageModal: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 300,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#F8F9FA",
  },
  languageOptionSelected: {
    backgroundColor: "#EBF3FD",
    borderWidth: 1,
    borderColor: "#3498DB",
  },
  languageOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  languageOptionTextSelected: {
    color: "#3498DB",
    fontWeight: "600",
  },
})
