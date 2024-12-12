import React, { useEffect, useState, useCallback } from 'react';
import { Button, StyleSheet, View, Text, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapPage from './components/map';
import { getAllRuns } from './components/database';
import * as Location from 'expo-location';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const [runs, setRuns] = useState([]);
  const [location, setLocation] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location access.');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });
      fetchTemperature(latitude, longitude);
    };
    requestLocationPermission();
  }, []);

  const fetchTemperature = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`
      );
      const data = await response.json();
      const currentHour = new Date().getHours();
      setTemperature(data.hourly.temperature_2m[currentHour]);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch temperature data.');
    }
  };

  const fetchRuns = async () => {
    try {
      const allRuns = await getAllRuns();
      setRuns(allRuns);
    } catch (error) {
      console.error('Error fetching runs:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRuns();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRuns();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>My Runs</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {runs.length > 0 ? (
          runs.map((run, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardText}>Distance: {run.distance} km</Text>
              <Text style={styles.cardText}>Time: {run.time}</Text>
              <Text style={styles.cardText}>Date: {new Date(run.date).toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No runs recorded yet.</Text>
        )}
      </ScrollView>

      <View style={styles.footerContainer}>
        {location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>Location: {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}</Text>
            <Text style={styles.locationText}>Temperature: {temperature ? `${temperature} °C` : 'Loading...'}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Map')}>
          <Text style={styles.buttonText}>Go to Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Map" component={MapPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginVertical: 20,
  },
  footerContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  locationContainer: {
    marginBottom: 15,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
