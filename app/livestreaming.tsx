"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

interface Comment {
  id: string
  username: string
  message: string
  timestamp: string
  isVerified?: boolean
}

const LiveStreamScreen = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      username: "Pastor John",
      message: "Welcome everyone to our live service! God bless you all.",
      timestamp: "2 min ago",
      isVerified: true,
    },
    {
      id: "2",
      username: "Sarah M.",
      message: "Praise the Lord! So blessed to be here.",
      timestamp: "1 min ago",
    },
    {
      id: "3",
      username: "David K.",
      message: "Amen! Thank you for this wonderful message.",
      timestamp: "30 sec ago",
    },
    {
      id: "4",
      username: "Grace L.",
      message: "Praying for everyone watching today 🙏",
      timestamp: "15 sec ago",
    },
    {
      id: "5",
      username: "Michael R.",
      message: "God is good all the time!",
      timestamp: "5 sec ago",
    },
  ])

  const [newComment, setNewComment] = useState("")
  const [isLive, setIsLive] = useState(true)
  const [viewerCount, setViewerCount] = useState(247)
  const scrollViewRef = useRef<ScrollView>(null)

  // Simulate new comments coming in
  useEffect(() => {
    const interval = setInterval(() => {
      const sampleComments = [
        "Hallelujah!",
        "God bless this ministry",
        "Amen to that!",
        "Praying with you all",
        "Thank you Pastor",
        "Glory to God!",
      ]

      const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)]
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        username: `User${Math.floor(Math.random() * 1000)}`,
        message: randomComment,
        timestamp: "now",
      }

      setComments((prev) => [...prev, newCommentObj])
      setViewerCount((prev) => prev + Math.floor(Math.random() * 3) - 1)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }, [comments])

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        username: "You",
        message: newComment.trim(),
        timestamp: "now",
      }
      setComments((prev) => [...prev, comment])
      setNewComment("")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <LinearGradient colors={["#1e67cd", "#4f83e0"]} style={styles.header}>
          <View style={styles.headerContent}>
          
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Sons of John Chi</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
                <Text style={styles.viewerCount}>{viewerCount} watching</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Video Player Area */}
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <LinearGradient
              colors={["rgba(30, 103, 205, 0.1)", "rgba(79, 131, 224, 0.1)"]}
              style={styles.videoGradient}
            >
              <Ionicons name="play-circle" size={80} color="#1e67cd" />
              <Text style={styles.videoText}>Live Stream</Text>
            </LinearGradient>
          </View>

          {/* Video Controls Overlay */}
          <View style={styles.videoControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="volume-high" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="expand" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Live Chat</Text>
            <Text style={styles.commentsCount}>{comments.length} messages</Text>
          </View>

          <ScrollView ref={scrollViewRef} style={styles.commentsContainer} showsVerticalScrollIndicator={false}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUsername}>
                    {comment.username}
                    {comment.isVerified && (
                      <Ionicons name="checkmark-circle" size={14} color="#1e67cd" style={styles.verifiedIcon} />
                    )}
                  </Text>
                  <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                </View>
                <Text style={styles.commentMessage}>{comment.message}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.sendButton, newComment.trim() ? styles.sendButtonActive : null]}
              onPress={handleSendComment}
              disabled={!newComment.trim()}
            >
              <Ionicons name="send" size={20} color={newComment.trim() ? "#ffffff" : "#9ca3af"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    marginRight: 8,
  },
  viewerCount: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
  },
  shareButton: {
    padding: 5,
  },
  videoContainer: {
    height: height * 0.35,
    backgroundColor: "#000000",
    position: "relative",
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  videoText: {
    fontSize: 16,
    color: "#1e67cd",
    marginTop: 10,
    fontWeight: "600",
  },
  videoControls: {
    position: "absolute",
    bottom: 15,
    right: 15,
    flexDirection: "row",
  },
  controlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  commentsSection: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
  },
  commentsCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentItem: {
    backgroundColor: "#ffffff",
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e67cd",
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#6b7280",
  },
  commentMessage: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 80,
    fontSize: 14,
    color: "#374151",
    backgroundColor: "#f8fafc",
  },
  sendButton: {
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#1e67cd",
  },
})

export default LiveStreamScreen
