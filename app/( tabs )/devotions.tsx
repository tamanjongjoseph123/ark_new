"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useFocusEffect } from "expo-router"
import { listDevotions, getTodayDevotion } from "../services/api"
import { registerForPushNotifications, registerDeviceToken } from "../utils/notifications"
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-modules-core';
import { useNewDevotion } from "../context/NewDevotionContext";

type ApiDevotion = {
  id: number
  title: string
  content_type: "text" | "video"
  description: string
  text_content: string | null
  youtube_url: string | null
  devotion_date: string
  created_at: string
  thumbnail_url: string | null
}

export default function DevotionsScreen() {
  const router = useRouter() // Add this hook
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [today, setToday] = useState<ApiDevotion | null>(null)
  const [devotions, setDevotions] = useState<ApiDevotion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();
  const { setHasNewDevotion } = useNewDevotion();

  const youTubeId = (url: string = "") => {
    try {
      const vParam = url.split("v=")[1]?.split("&")[0]
      if (vParam) return vParam
      const short = url.match(/youtu\.be\/([\w-]{6,})/)
      if (short?.[1]) return short[1]
      const embed = url.match(/embed\/([\w-]{6,})/)
      if (embed?.[1]) return embed[1]
      const shorts = url.match(/shorts\/([\w-]{6,})/)
      if (shorts?.[1]) return shorts[1]
      return null
    } catch {
      return null
    }
  }

  const isValidDate = (s?: string | null) => {
    if (!s) return false
    const d = new Date(s)
    return !isNaN(d.getTime())
  }

  const toDateLabel = (s?: string | null) => {
    if (!isValidDate(s)) return ''
    return new Date(s as string).toDateString()
  }

  const loadDevotions = async () => {
    setLoading(true)
    setError(null)
    try {
      const [todayItem, list] = await Promise.all([
        getTodayDevotion().catch(() => null),
        listDevotions().catch(() => []),
      ])
      setToday(todayItem)
      // Avoid duplicate if today is also included in list
      const filtered = Array.isArray(list)
        ? list.filter((d: ApiDevotion) => (todayItem ? d.id !== todayItem.id : true))
        : []
      setDevotions(filtered)
    } catch (e) {
      setError("Failed to load devotions")
    } finally {
      setLoading(false)
    }
  }

  // Set up notification listeners and badge state
  useEffect(() => {
    console.log('DevotionsScreen: Component mounted, loading devotions...');
    loadDevotions();
    
    const registerAndSubscribe = async () => {
      try {
        console.log('DevotionsScreen: Requesting push notification permissions...');
        const token = await registerForPushNotifications();
        
        if (token) {
          console.log('DevotionsScreen: Received push token, registering with server...');
          try {
            const result = await registerDeviceToken(token);
            console.log('DevotionsScreen: Device token registration result:', result);
          } catch (regError) {
            console.error('DevotionsScreen: Failed to register device token:', regError);
          }
        } else {
          console.log('No push token received. User may have denied permissions.');
        }
        
        // Listen for incoming notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          const { data, title, body } = notification.request.content;
          console.log('=== DEVOTIONS SCREEN: NOTIFICATION RECEIVED ===');
          console.log('Title:', title);
          console.log('Body:', body);
          console.log('Data:', JSON.stringify(data, null, 2));
          
          if (data?.type === 'new_devotion') {
            console.log('DevotionsScreen: New devotion notification received, refreshing devotions...');
            console.log('Devotion data:', JSON.stringify(data, null, 2));
            setHasNewDevotion(true);
            loadDevotions();
          } else {
            console.log('DevotionsScreen: Received non-devotion notification or missing type');
          }
        });
        
        // Listen for notification taps
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          const { data, title, body } = response.notification.request.content;
          console.log('=== DEVOTIONS SCREEN: NOTIFICATION TAPPED ===');
          console.log('Title:', title);
          console.log('Body:', body);
          console.log('Data:', JSON.stringify(data, null, 2));
          
          if (data?.type === 'new_devotion') {
            console.log('DevotionsScreen: User tapped new devotion notification, refreshing devotions...');
            console.log('Devotion data:', JSON.stringify(data, null, 2));
            setHasNewDevotion(false);
            loadDevotions();
          } else {
            console.log('DevotionsScreen: Tapped notification is not a devotion notification');
          }
        });
        
      } catch (error) {
        console.error('DevotionsScreen: Error in notification setup:', error);
      } finally {
        console.log('DevotionsScreen: Notification setup completed');
      }
    };
    
    registerAndSubscribe();
    
    return () => {
      console.log('DevotionsScreen: Cleaning up notification listeners...');
      if (notificationListener.current) {
        console.log('DevotionsScreen: Removing notification listener');
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        console.log('DevotionsScreen: Removing response listener');
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
  
  // Clear the badge when the devotions tab is focused
  useFocusEffect(
    useCallback(() => {
      setHasNewDevotion(false);
      
      return () => {
        // Optional cleanup
      };
    }, [setHasNewDevotion])
  );

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const openVideo = (url: string) => {
    const videoId = youTubeId(url || "")
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

  // Prefer API-provided thumbnail; fallback to YouTube derived URL
  const videoThumb = (youtube_url?: string | null, apiThumb?: string | null) => {
    if (apiThumb) return apiThumb
    const id = youTubeId(youtube_url || "")
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : undefined
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
        {loading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1e67cd" />
            <Text style={{ marginTop: 8, color: '#666' }}>Loading devotions...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#c00' }}>{error}</Text>
            <TouchableOpacity onPress={loadDevotions} style={[styles.videoButton, { marginTop: 10 }]}> 
              <Text style={styles.videoButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && today && isValidDate(today.devotion_date) && (
          <View style={[styles.devotionCard, { borderLeftWidth: 4, borderLeftColor: '#1e67cd' }]}>
            <View style={styles.cardHeader}>
              {isValidDate(today.devotion_date) ? (
                <Text style={styles.date}>{toDateLabel(today.devotion_date)}</Text>
              ) : (
                <View />
              )}
              <TouchableOpacity onPress={() => shareDevotional({
                id: String(today.id),
                date: today.devotion_date,
                title: today.title,
                verse: '', content: today.description, author: ''
              })} style={styles.shareButton}>
                <Ionicons name="share-outline" size={20} color="#1e67cd" />
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>{today.title}</Text>
            {today.content_type === 'text' && (
              <Text style={styles.content}>{today.text_content || today.description}</Text>
            )}
            {today.content_type === 'video' && today.youtube_url && (
              <>
                {videoThumb(today.youtube_url, today.thumbnail_url) && (
                  <Image source={{ uri: videoThumb(today.youtube_url, today.thumbnail_url) }} style={styles.videoThumbnail} resizeMode="cover" />
                )}
                <TouchableOpacity style={styles.videoButton} onPress={() => openVideo(today.youtube_url!)}>
                  <Ionicons name="play-circle" size={24} color="#fff" />
                  <Text style={styles.videoButtonText}>Watch Video</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {!loading && !error && !today && devotions.length === 0 && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#333', fontSize: 16, fontWeight: '600', marginBottom: 6 }}>No devotions available</Text>
            <Text style={{ color: '#666', textAlign: 'center', marginBottom: 12 }}>Please check back later or tap retry.</Text>
            <TouchableOpacity onPress={loadDevotions} style={styles.videoButton}>
              <Text style={styles.videoButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && devotions.map((d) => {
          const isExpanded = expandedCards.has(d.id)
          const fullText = d.text_content || d.description || ""
          const preview = fullText.length > 120 ? fullText.substring(0, 120) + "..." : fullText
          return (
            <View key={d.id} style={styles.devotionCard}>
              <View style={styles.cardHeader}>
                {isValidDate(d.devotion_date) && (
                  <Text style={styles.date}>{toDateLabel(d.devotion_date)}</Text>
                )}
                <TouchableOpacity onPress={() => shareDevotional({ id: String(d.id), date: d.devotion_date, title: d.title, verse: '', content: fullText, author: '' })} style={styles.shareButton}>
                  <Ionicons name="share-outline" size={20} color="#1e67cd" />
                </TouchableOpacity>
              </View>
              <Text style={styles.title}>{d.title}</Text>
              {d.content_type === 'text' ? (
                <>
                  <Text style={styles.content}>{isExpanded ? fullText : preview}</Text>
                  {fullText.length > 120 && (
                    <TouchableOpacity onPress={() => toggleExpanded(d.id)} style={styles.readMoreButton}>
                      <Text style={styles.readMoreText}>{isExpanded ? "Read Less" : "Read More"}</Text>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#1e67cd" />
                    </TouchableOpacity>
                  )}
                </>
              ) : d.youtube_url ? (
                <>
                  {videoThumb(d.youtube_url, d.thumbnail_url) && (
                    <Image source={{ uri: videoThumb(d.youtube_url, d.thumbnail_url) }} style={styles.videoThumbnail} resizeMode="cover" />
                  )}
                  <TouchableOpacity style={styles.videoButton} onPress={() => openVideo(d.youtube_url!)}>
                    <Ionicons name="play-circle" size={24} color="#fff" />
                    <Text style={styles.videoButtonText}>Watch Video</Text>
                  </TouchableOpacity>
                </>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.author}>Daily Devotion</Text>
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
  videoThumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#eaeaea",
  },
})
