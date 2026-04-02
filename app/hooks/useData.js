import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getVideos, getQuotes, getEvents, getProjects } from '../services/api';

const useData = () => {
  // Synchronously initialize state with preloaded data if available
  const [isLoading, setIsLoading] = useState(!global.__PRELOADED_DATA__);
  const [data, setData] = useState(() => {
    if (global.__PRELOADED_DATA__) {
      return global.__PRELOADED_DATA__;
    }
    return {
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
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      // If we initialized with preloaded data, just clear the cache and skip fetch
      if (global.__PRELOADED_DATA__) {
        global.__PRELOADED_DATA__ = null;
        return;
      }

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

        // Extract results array in case of paginated responses
        const extractArray = (res) => Array.isArray(res) ? res : (res?.results || []);

        // Sort and get the two most recent items for each category
        const sortByDate = (a, b) => new Date(b.created_at) - new Date(a.created_at);
        
        setData({
          prophecies: extractArray(prophecies).sort(sortByDate).slice(0, 5),
          crusades: extractArray(crusades).sort(sortByDate).slice(0, 5),
          testimonies: extractArray(testimonies).sort(sortByDate).slice(0, 5),
          healings: extractArray(healings).sort(sortByDate).slice(0, 5),
          prayers: extractArray(prayers).sort(sortByDate).slice(0, 5),
          massPrayers: extractArray(massPrayers).sort(sortByDate).slice(0, 5),
          deliverance: extractArray(deliverance).sort(sortByDate).slice(0, 5),
          charities: extractArray(charities).sort(sortByDate).slice(0, 5),
          quotes: extractArray(quotes).sort(sortByDate).slice(0, 5),
          events: extractArray(events).sort(sortByDate).slice(0, 5),
          projects: extractArray(projects).sort(sortByDate).slice(0, 5)
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