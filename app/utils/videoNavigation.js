import { Alert } from "react-native";

/**
 * Extracts a YouTube video ID from any standard URL.
 */
function getYouTubeId(url) {
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1]?.split("?")[0];
  }
  if (url.includes("youtube.com")) {
    return url.split("v=")[1]?.split("&")[0];
  }
  return null;
}

/**
 * Returns a function that, given a `video` object,
 * will push to `/video-details` with the correct params.
 *
 * @param {import('expo-router').Router} router
 */
export default  function createVideoPressHandler(router) {
  return (video) => {
    if (!video?.youtube_url) {
      Alert.alert("Error", "No video URL available");
      return;
    }

    let videoId = getYouTubeId(video.youtube_url);
    if (!videoId) {
      Alert.alert("Error", "Invalid YouTube video URL");
      console.error("Invalid ID for URL:", video.youtube_url);
      return;
    }

    router.push({
      pathname: "/video-details",
      params: {
        videoId,
        title: video.title,
        youtubeUrl: video.youtube_url,
      },
    });
  };
}
