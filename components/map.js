import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Button, Text, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { createRunRecord, initDatabase } from './database'; // Importera databashanteringsfunktionerna

export default function MapPage() {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [region, setRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initiera databasen när appen laddas
  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    let timer;
    if (isTracking && startTime) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTracking, startTime]);

  const startTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required for tracking.');
      return;
    }
    setRouteCoordinates([]);
    setTotalDistance(0);
    setElapsedTime(0);
    setStartTime(Date.now());
    setIsTracking(true);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const newCoordinate = { latitude, longitude };

        // Uppdatera ruttens koordinater
        setRouteCoordinates((prevCoords) => {
          const updatedCoords = [...prevCoords, newCoordinate];

          // Uppdatera total distans i realtid
          if (prevCoords.length > 0) {
            const newDistance = getDistanceBetweenPoints(prevCoords[prevCoords.length - 1], newCoordinate);
            setTotalDistance((prevDistance) => prevDistance + newDistance);
          }

          return updatedCoords;
        });

        // Uppdatera nuvarande position och region för kartan
        setCurrentLocation(newCoordinate);
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    );
  };

  const stopTracking = async () => {
    setIsTracking(false);
    const totalDistanceTraveled = calculateTotalDistance(routeCoordinates);
    setTotalDistance(totalDistanceTraveled);
  
    // Format elapsed time to a human-readable string
    const formattedTime = formatTime(elapsedTime);  // "Xh Xm Xs"
  
    // Save the run with the formatted time string
    try {
      const insertedId = await createRunRecord(totalDistanceTraveled /1000, formattedTime);
      console.log(`Run saved with ID: ${insertedId}`);
    } catch (error) {
      console.error('Error saving run:', error);
    }
  };
  
  const calculateTotalDistance = (coordinates) => {
    let distance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const point1 = coordinates[i - 1];
      const point2 = coordinates[i];
      distance += getDistanceBetweenPoints(point1, point2);
    }
    return distance; // Distance in meters
  };

  const getDistanceBetweenPoints = (point1, point2) => {
    const R = 6371e3; // Earth radius in meters
    const lat1 = (point1.latitude * Math.PI) / 180;
    const lat2 = (point2.latitude * Math.PI) / 180;
    const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {routeCoordinates.length > 0 && (
          <>
            <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="blue" />
            <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]} />
          </>
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <Button title="Start Tracking" onPress={startTracking} />
        ) : (
          <Button title="Stop Tracking" onPress={stopTracking} />
        )}
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Distance: {(totalDistance / 1000).toFixed(2)} km</Text>
        <Text style={styles.statsText}>Time: {formatTime(elapsedTime)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  statsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  statsText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
