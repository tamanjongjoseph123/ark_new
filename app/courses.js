"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, StatusBar, Image, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { listCourses, listModules, listCourseVideos } from "./services/api"
import { BASE_URL } from "./base_url"

const { width } = Dimensions.get("window")

export default function KingdomLeadership() {
  const router = useRouter()
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [videos, setVideos] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingModules, setLoadingModules] = useState(false)
  const [loadingVideos, setLoadingVideos] = useState(false)

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
    // Extract YouTube video ID from URL (robust, no static fallback)
    const src = video.youtube_url || video.videoUrl || ""
    const videoId = youTubeId(src)

    // Navigate to video details instead of showing modal
    router.push({
      pathname: "/video-details-two",
      params: {
        videoId: videoId || "",
        title: video.name || video.title,
        youtubeUrl: src,
        courseVideoId: String(video.id || ""),
      },
    })
  }

  const handleCourseSelect = (course) => {
    setSelectedCourse(course)
    setSelectedModule(null)
    setVideos([])
    setLoadingModules(true)
    listModules(course.id)
      .then((mods) => {
        if (!Array.isArray(mods)) mods = []
        // compute counts lazily (optional)
        return Promise.all(
          mods.map(async (m) => {
            try {
              const vids = await listCourseVideos(m.id)
              return { ...m, videoCount: Array.isArray(vids) ? vids.length : 0 }
            } catch {
              return { ...m, videoCount: 0 }
            }
          })
        )
      })
      .then((withCounts) => setModules(withCounts || []))
      .finally(() => setLoadingModules(false))
  }

  const handleModuleSelect = (module) => {
    setSelectedModule(module)
    setLoadingVideos(true)
    listCourseVideos(module.id)
      .then((data) => {
        setVideos(Array.isArray(data) ? data : [])
      })
      .finally(() => setLoadingVideos(false))
  }

  const handleBackToModules = () => {
    setSelectedModule(null)
    setVideos([])
  }

  const handleBackToCourses = () => {
    setSelectedModule(null)
    setModules([])
    setSelectedCourse(null)
  }

  // Helpers
  const toImageUrl = (url) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`
  }

  const youTubeId = (url = "") => {
    if (!url) return null
    try {
      // Handle full URL with v= param
      const vParam = url.split("v=")[1]?.split("&")[0]
      if (vParam) return vParam
      // Handle youtu.be short links
      const short = url.match(/youtu\.be\/([\w-]{6,})/)
      if (short?.[1]) return short[1]
      // Handle embed URLs
      const embed = url.match(/embed\/([\w-]{6,})/)
      if (embed?.[1]) return embed[1]
      // Handle shorts
      const shorts = url.match(/shorts\/([\w-]{6,})/)
      if (shorts?.[1]) return shorts[1]
      return null
    } catch {
      return null
    }
  }

  // Fetch Sons of John Chi courses -> start at courses view
  const loadMentorship = async () => {
    let mounted = true
    setLoadingCourses(true)
    try {
      let list = await listCourses("sons_of_john_chi")
      if (!mounted) return
      if (!Array.isArray(list) || list.length === 0) {
        const allCourses = await listCourses(null)
        list = (allCourses || []).filter(
          (c) => typeof c?.category === "string" && c.category.toLowerCase() === "sons_of_john_chi"
        )
      }
      setCourses(Array.isArray(list) ? list : [])
      // Ensure we start at courses view
      setSelectedCourse(null)
      setModules([])
      setSelectedModule(null)
    } finally {
      setLoadingCourses(false)
    }
    return () => {
      mounted = false
    }
  }

  useEffect(() => {
    loadMentorship()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#3498DB" barStyle="light-content" />


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!selectedCourse ? (
          <>
            {loadingCourses && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#3498DB" />
                <Text style={styles.loadingText}>Loading Sons of John Chi courses...</Text>
              </View>
            )}
            {!loadingCourses && courses.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>No Sons of John Chi courses found</Text>
                <Text style={styles.emptySubtitle}>Pull to refresh or tap retry below.</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadMentorship}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            {!loadingCourses && (
              <>
                <LinearGradient colors={["#3498DB", "#2980B9"]} style={styles.welcomeSection}>
                  <Ionicons name="school" size={32} color="#FFF" />
                  <Text style={styles.welcomeTitle}>Welcome to Sons of John Chi</Text>
                  <Text style={styles.welcomeSubtitle}>
                    {courses.length > 0 ? 'Explore our courses' : 'No courses available at the moment'}
                  </Text>
                </LinearGradient>
                
                {/* Live Stream Button - Always Visible */}
                <TouchableOpacity 
                  style={[styles.liveButton, { marginTop: 10 }]}
                  onPress={() => router.push("/livestreaming")}
                >
                  <LinearGradient
                    colors={["#FF416C", "#FF4B2B"]}
                    style={styles.liveButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="radio" size={20} color="white" style={styles.liveIcon} />
                    <Text style={styles.liveButtonText}>Watch Live Stream</Text>
                    <View style={styles.liveBadge}>
                      <View style={styles.livePulse} />
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
            {/* Courses Grid */}
            <View style={styles.modulesContainer}>
              {courses.map((course) => (
                <TouchableOpacity key={course.id} style={styles.moduleCard} onPress={() => handleCourseSelect(course)}>
                  <Image source={{ uri: toImageUrl(course.image) }} style={styles.moduleThumbnail} resizeMode="cover" />
                  <View style={styles.moduleInfoContainer}>
                    <Text style={styles.moduleName}>{course.name}</Text>
                    <Text style={styles.moduleDescription} numberOfLines={3}>
                      {course.description}
                    </Text>
                    <View style={styles.moduleMeta}>
                      <View style={styles.moduleMetaItem}>
                        <Ionicons name="albums" size={16} color="#3498DB" />
                        <Text style={styles.moduleMetaText}>Course</Text>
                      </View>
                      <View style={styles.moduleMetaItem}>
                        <Ionicons name="pricetag" size={16} color="#3498DB" />
                        <Text style={styles.moduleMetaText}>{course.category}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : !selectedModule ? (
          // Show Modules for selected course
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
              <TouchableOpacity onPress={handleBackToCourses} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="arrow-back" size={20} color="#3498DB" />
                <Text style={{ marginLeft: 6, color: '#3498DB', fontWeight: '600' }}>Back to Courses</Text>
              </TouchableOpacity>
              <Text style={{ marginTop: 10, fontSize: 20, fontWeight: '700', color: '#2C3E50' }}>{selectedCourse?.name}</Text>
            </View>

            {loadingModules && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#3498DB" />
                <Text style={styles.loadingText}>Loading modules...</Text>
              </View>
            )}
            {!loadingModules && modules.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>No modules found</Text>
                <Text style={styles.emptySubtitle}>Try another course or retry below.</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => handleCourseSelect(selectedCourse)}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Modules Grid */}
            <View style={styles.modulesContainer}>
              {modules.map((module) => (
                <TouchableOpacity key={module.id} style={styles.moduleCard} onPress={() => handleModuleSelect(module)}>
                  <Image source={{ uri: toImageUrl(module.image) }} style={styles.moduleThumbnail} resizeMode="cover" />
                  <View style={styles.moduleInfoContainer}>
                    <Text style={styles.moduleName}>{module.name}</Text>
                    <Text style={styles.moduleDescription} numberOfLines={3}>
                      {module.description}
                    </Text>
                    <View style={styles.moduleMeta}>
                      <View style={styles.moduleMetaItem}>
                        <Ionicons name="videocam" size={16} color="#3498DB" />
                        <Text style={styles.moduleMetaText}>{module.videoCount ?? 0} videos</Text>
                      </View>
                      <View style={styles.moduleMetaItem}>
                        <Ionicons name="trending-up" size={16} color="#3498DB" />
                        <Text style={styles.moduleMetaText}>{module.level || "All Levels"}</Text>
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
                source={{ uri: toImageUrl(selectedModule.image) }}
                style={styles.moduleHeaderThumbnail}
                resizeMode="cover"
              />
              <LinearGradient colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]} style={styles.moduleHeaderOverlay}>
                <Text style={styles.moduleHeaderTitle}>{selectedModule.name}</Text>
                <Text style={styles.moduleHeaderDescription}>{selectedModule.description}</Text>
                <View style={styles.moduleHeaderMeta}>
                  <Text style={styles.moduleHeaderMetaText}>{selectedModule.videoCount ?? videos.length} videos</Text>
                  <Text style={styles.moduleHeaderMetaText}>•</Text>
                  <Text style={styles.moduleHeaderMetaText}>{selectedModule.level || "All Levels"}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Videos List */}
            <View style={styles.videosContainer}>
              <Text style={styles.videosSectionTitle}> Videos</Text>
              {loadingVideos ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color="#3498DB" />
                  <Text style={styles.loadingText}>Loading videos...</Text>
                </View>
              ) : (
                videos.map((video) => {
                  const id = youTubeId(video.youtube_url || "")
                  const ytThumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
                  const apiThumb = (video.thumbnail || video.thumbnail_url || video.image)
                    ? toImageUrl(video.thumbnail || video.thumbnail_url || video.image)
                    : null
                  const thumb = apiThumb || ytThumb
                  return (
                    <TouchableOpacity key={video.id} style={styles.videoCard} onPress={() => handleVideoSelect(video)}>
                      {thumb ? (
                        <Image source={{ uri: thumb }} style={styles.videoThumbnail} resizeMode="cover" />
                      ) : (
                        <View style={[styles.videoThumbnail, { backgroundColor: '#eee', alignItems:'center', justifyContent:'center' }]}>
                          <Ionicons name="videocam" size={24} color="#999" />
                        </View>
                      )}
                      <View style={styles.videoInfo}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                          {video.name}
                        </Text>
                        <Text style={styles.videoDescription} numberOfLines={2}>
                          {video.description}
                        </Text>
                        <View style={styles.videoMeta}>
                          <View style={styles.videoMetaItem}>
                            <Ionicons name="time" size={14} color="#666" />
                            <Text style={styles.videoMetaText}>Video</Text>
                          </View>
                          <View style={styles.videoMetaItem}>
                            <Ionicons name="trending-up" size={14} color="#666" />
                            <Text style={styles.videoMetaText}>All Levels</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.videoPlayButton}>
                        <Ionicons name="play-circle" size={40} color="#3498DB" />
                      </View>
                    </TouchableOpacity>
                  )
                })
              )}
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
    paddingTop: StatusBar.currentHeight, // Add padding for status bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10, // Reduced from 50 to 10 since we're using StatusBar.currentHeight
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
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  liveButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIcon: {
    marginRight: 10,
  },
  liveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 4,
  },
  liveBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.9,
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
  loadingWrap: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  emptyWrap: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#7F8C8D",
    marginBottom: 12,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#3498DB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "600",
  },
  welcomeSection: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  welcomeTitle: {
    width: "100%",
    marginBottom: 10,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
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
