// App.js
import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';


const { width } = Dimensions.get('window');

const CarouselComponent = () => {
  const carouselItems = [

    {
      id: 6,
      type: 'local',
      image: require('../assets/images/event_10.jpg')  
    },
    {
      id: 7,
      type: 'local',
      image: require('../assets/images/event_two.jpg')  
    },
    {
      id: 7,
      type: 'local',
      image: require('../assets/images/event_three.jpg')  
    },
    {
      id: 7,
      type: 'local',
      image: require('../assets/images/event_four.jpg')  
    },
    {
      id: 7,
      type: 'local',
      image: require('../assets/images/event_11.jpg')  
    },
    {
      id: 7,
      type: 'local',
      image: require('../assets/images/event_six.jpg')  
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image
          source={item.type === 'local' ? item.image : { uri: item.image }}
          style={styles.image}
          resizeMode="contain"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.gradient}
        >
          <View style={styles.titleContainer}>
            {/* <Text style={styles.mainTitle}>Ark of God's Covenant</Text>
            <Text style={styles.subTitle}>Ministry</Text> */}
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pointsContainer}>
        <View style={styles.leftPoint} />
        <View style={styles.rightPoint} />
      </View>
      <View style={styles.carouselWrapper}>
        <Carousel
          loop
          width={width}
          height={250}
          autoPlay={true}
          data={carouselItems}
          scrollAnimationDuration={1000}
          renderItem={renderItem}
          autoPlayInterval={3000}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    position: 'relative',
  },

 
  leftPoint: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    left: -20,
    top: 10,
  },
  rightPoint: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    right: -20,
    top: 10,
  },
  carouselWrapper: {
    overflow: 'hidden',
    marginTop: -10,
  
  },
  slide: {
    width: width,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    paddingTop: 60,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 24,
    color: '#D8C9AE',
    marginTop: 5,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    letterSpacing: 2,
  }
});

export default CarouselComponent;
