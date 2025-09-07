import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PartnerLoungeScreen() {
  const router = useRouter();

  const partnerContent = [
    {
      id: 1,
      title: "Monthly Partner Meeting",
      date: "Last Sunday of every month",
      type: "Live Stream",
      icon: "videocam",
    },
    {
      id: 2,
      title: "Special Prayer Sessions",
      date: "Every Wednesday",
      type: "Interactive",
      icon: "people",
    },
    {
      id: 3,
      title: "Exclusive Teachings",
      date: "Updated Weekly",
      type: "Video Content",
      icon: "play-circle",
    },
    {
      id: 4,
      title: "Partner Testimonies",
      date: "Updated Daily",
      type: "Community",
      icon: "heart",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.scrollView}>
        {/* Welcome Banner */}
        <LinearGradient
          colors={['#1e67cd', '#1e67cd']}
          style={styles.welcomeBanner}
        >
          <Ionicons name="diamond" size={50} color="#FFF" />
          <Text style={styles.welcomeTitle}>Welcome, Partner!</Text>
          <Text style={styles.welcomeText}>
            Thank you for being a valued partner in the ministry.
          </Text>
        </LinearGradient>

        {/* Partner Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Partner Benefits</Text>
          <View style={styles.benefitsGrid}>
            {partnerContent.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.benefitCard}
                onPress={() => {/* Handle navigation */}}
              >
                <LinearGradient
                  colors={['#1e67cd', '#1e67cd']}
                  style={styles.benefitGradient}
                >
                  <Ionicons name={item.icon} size={30} color="#FFF" />
                  <Text style={styles.benefitTitle}>{item.title}</Text>
                  <Text style={styles.benefitDate}>{item.date}</Text>
                  <Text style={styles.benefitType}>{item.type}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Partner Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Partner Resources</Text>
          <TouchableOpacity style={styles.resourceCard}>
            <LinearGradient
              colors={['#1e67cd', '#1e67cd']}
              style={styles.resourceContent}
            >
              <Ionicons name="book" size={24} color="#FFF" />
              <Text style={styles.resourceTitle}>Monthly Partner Letter</Text>
              <Text style={styles.resourceDescription}>
                Access your personalized monthly letter from Pastor John Chi
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Apply Partner Button - Positioned with proper spacing */}
        <View style={styles.applyButtonContainer}>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => Linking.openURL('https://www.johnchi.org/partnership')}
          >
            <LinearGradient
              colors={['#1e67cd', '#1e67cd']}
              style={styles.applyGradient}
            >
              <Ionicons name="diamond" size={24} color="#FFF" />
              <Text style={styles.applyButtonText}>Apply to become a Partner</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 64, 87, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 16,
    color: '#2E4057',
  },
  scrollView: {
    flex: 1,
  },
  welcomeBanner: {
    padding: 30,
    alignItems: 'center',
    margin: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 15,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.95,
    letterSpacing: 0.5,
  },
  benefitsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E4057',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: '47%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    backgroundColor: '#FFF',
  },
  benefitGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  benefitDate: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.95,
    marginBottom: 4,
    fontWeight: '500',
  },
  benefitType: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.95,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  resourcesSection: {
    padding: 16,
    marginBottom: 20,
  },
  resourceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    backgroundColor: '#FFF',
    marginTop: 8,
  },
  resourceContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.95,
    flex: 2,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  applyButtonContainer: {
    padding: 16,
    marginTop: 20,  // Space from the content above
    marginBottom: 40,  // Comfortable space at the bottom
  },
  applyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});