import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Giving() {
  const router = useRouter();

  const handleDonatePress = (title) => {
    if (title === 'Projects') {
      router.push('/projects');
    } else {
      Linking.openURL('https://www.johnchi.org/donations');
    }
  };

  const givingOptions = [
    {
      id: 1,
      title: 'Tithes',
      icon: 'cash',
      description: 'Support the ministry with your tithes',
      gradient: ['#1e67cd', '#1e67cd']
    },
    {
      id: 2,
      title: 'Offerings',
      icon: 'gift',
      description: 'Give your offerings to support God\'s work',
      gradient: ['#1e67cd', '#1e67cd']
    },
    {
      id: 3,
      title: 'Partnership',
      icon: 'people',
      description: 'Become a ministry partner',
      gradient: ['#1e67cd', '#1e67cd']
    },
    {
      id: 4,
      title: 'Projects',
      icon: 'build',
      description: 'Support ongoing ministry projects',
      gradient: ['#1e67cd', '#1e67cd']
    }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F8F8', '#E8E8E8']}
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Way to Give</Text>
          <Text style={styles.headerSubtitle}>Support the Vision</Text>
        </View>

        <View style={styles.optionsContainer}>
          {givingOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleDonatePress(option.title)}
            >
              <LinearGradient
                colors={option.gradient}
                style={styles.optionGradient}
              >
                <Ionicons name={option.icon} size={40} color="#FFF" />
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Your giving supports the ministry's vision to reach the world with God's power
          </Text>
          <TouchableOpacity
            style={styles.donateButton}
            onPress={handleDonatePress}
          >
            <Text style={styles.donateButtonText}>Donate Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  optionCard: {
    width: '48%',
    height: 180,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 15,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e67cd',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  donateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
}); 