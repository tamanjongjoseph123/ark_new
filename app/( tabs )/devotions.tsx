"use client"

import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

interface Devotion {
  id: string // Fixed syntax error by removing extra > character
  date: string
  title: string
  verse: string
  content: string
  author: string
  videoUrl?: string
}

const devotionsData: Devotion[] = [
  {
    id: "1",
    date: "January 15, 2024",
    title: "Walking in Faith",
    verse: "Hebrews 11:1",
    content:
      "Now faith is confidence in what we hope for and assurance about what we do not see. Faith is not just believing in God, but trusting Him completely with our lives, our dreams, and our future. When we walk in faith, we step into the unknown with confidence because we know God is leading us.",
    author: "Appostle John Chi",
    videoUrl: "https://www.youtube.com/watch?v=b9OQRcwAcNQ&pp=ygUIam9obiBjaGk%3D",
  },
  {
    id: "2",
    date: "January 14, 2024",
    title: "God's Unfailing Love",
    verse: "1 John 4:19",
    content:
      "We love because he first loved us. God's love is not conditional on our performance or perfection. His love is constant, unwavering, and eternal. Even when we fail, His love remains. This truth should transform how we see ourselves and how we love others.",
    author: "Appostle John Chi",
  },
  {
    id: "3",
    date: "January 13, 2024",
    title: "Finding Peace in Storms",
    verse: "John 14:27",
    content:
      "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid. In the midst of life's storms, Jesus offers us a peace that surpasses understanding.",
    author: "Appostle John Chi",
    videoUrl: "https://www.youtube.com/watch?v=b9OQRcwAcNQ&pp=ygUIam9obiBjaGk%3D",
  },
]

export default function DevotionsScreen() {
  const router = useRouter() // Add this hook
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const openVideo = (url: string) => {
    // Extract YouTube video ID from URL
    const videoId = url.split("v=")[1]?.split("&")[0]
    if (!videoId) {
      Alert.alert("Error", "Invalid video URL")
      return
    }

    // Navigate to video details screen with params (same as kingdom-leadership)
    router.push({
      pathname: "/video-details",
      params: {
        videoId: videoId,
        title: "Devotional Video",
        youtubeUrl: url,
      },
    })
  }

  const shareDevotional = (devotion: Devotion) => {
    Alert.alert("Share", `Sharing: ${devotion.title}`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Devotions</Text>
        <Text style={styles.headerSubtitle}>Feed your soul with God's word</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {devotionsData.map((devotion) => {
          const isExpanded = expandedCards.has(devotion.id)
          const previewContent = devotion.content.substring(0, 120) + "..."

          return (
            <View key={devotion.id} style={styles.devotionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{devotion.date}</Text>
                <TouchableOpacity onPress={() => shareDevotional(devotion)} style={styles.shareButton}>
                  <Ionicons name="share-outline" size={20} color="#1e67cd" />
                </TouchableOpacity>
              </View>

              <Text style={styles.title}>{devotion.title}</Text>

              <View style={styles.verseContainer}>
                <Ionicons name="book-outline" size={16} color="#1e67cd" />
                <Text style={styles.verse}>{devotion.verse}</Text>
              </View>

              <Text style={styles.content}>{isExpanded ? devotion.content : previewContent}</Text>

              <TouchableOpacity onPress={() => toggleExpanded(devotion.id)} style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>{isExpanded ? "Read Less" : "Read More"}</Text>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#1e67cd" />
              </TouchableOpacity>

              {devotion.videoUrl && (
                <TouchableOpacity style={styles.videoButton} onPress={() => openVideo(devotion.videoUrl!)}>
                  <Ionicons name="play-circle" size={24} color="#fff" />
                  <Text style={styles.videoButtonText}>Watch Video</Text>
                </TouchableOpacity>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.author}>By {devotion.author}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={18} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="bookmark-outline" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    backgroundColor: "#1e67cd",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 5,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  devotionCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  date: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  shareButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  verseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f0f7ff",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1e67cd",
  },
  verse: {
    fontSize: 16,
    color: "#1e67cd",
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 15,
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginBottom: 15,
  },
  readMoreText: {
    color: "#1e67cd",
    fontWeight: "600",
    marginRight: 5,
  },
  videoButton: {
    backgroundColor: "#1e67cd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
  },
  videoButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  author: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
})
