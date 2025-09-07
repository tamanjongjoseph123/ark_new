import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getVideos, getQuotes, getEvents, getProjects } from '../services/api';

const useData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    prophecies: [],
    crusades: [],
    testimonies: [],
    healings: [],
    prayers: [],
    massPrayers: [],
    deliverance: [],
    charities: [],
    quotes: [],
    events: [],
    projects: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          prophecies,
          crusades,
          testimonies,
          healings,
          prayers,
          massPrayers,
          deliverance,
          charities,
          quotes,
          events,
          projects
        ] = await Promise.all([
          getVideos('prophecy'),
          getVideos('crusades'),
          getVideos('testimonies'),
          getVideos('healings'),
          getVideos('prayers'),
          getVideos('mass_prayers'),
          getVideos('deliverance'),
          getVideos('charities'),
          getQuotes(),
          getEvents(),
          getProjects()
        ]);

        // Sort and get the two most recent items for each category
        const sortByDate = (a, b) => new Date(b.created_at) - new Date(a.created_at);
        
        setData({
          prophecies: prophecies.sort(sortByDate).slice(0, 5),
          crusades: crusades.sort(sortByDate).slice(0, 5),
          testimonies: testimonies.sort(sortByDate).slice(0, 5),
          healings: healings.sort(sortByDate).slice(0, 5),
          prayers: prayers.sort(sortByDate).slice(0, 5),
          massPrayers: massPrayers.sort(sortByDate).slice(0, 5),
          deliverance: deliverance.sort(sortByDate).slice(0, 5),
          charities: charities.sort(sortByDate).slice(0, 5),
          quotes: quotes.sort(sortByDate).slice(0, 5),
          events: events.sort(sortByDate).slice(0, 5),
          projects: projects.sort(sortByDate).slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { isLoading, data };
};

export default useData; 