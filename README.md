# **Running Tracker App**

## **Project Description**
The Running Tracker App is a React Native application designed to help users track their running activities, manage training sessions, and view fitness progress. It features real-time GPS tracking, exercise management, and weather updates for a seamless fitness experience.

---

## **Features**

### **Run Tracking**
- Tracks your run with real-time GPS.
- Calculates distance, time, and shows your route on the map.

### **Training Sessions**
- Allows creating training sessions and adding exercises with repetitions, sets, and weights.

### **Weather Updates**
- Fetches the current temperature for your location.

### **Interactive UI**
- View past runs, add exercises, and navigate between pages easily.

### **Local Storage**
- Saves all data in an SQLite database for offline access.

---

## **Installation**

### 1. Clone the Repository
```bash
git clone https://github.com/Victor19941221/running-tracker-app.git
cd running-tracker-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
expo start
```

### 4. Run the App
- Scan the QR code in the terminal with the Expo Go app.
- Or use an emulator (Android Studio/Xcode).

---

## **Usage**

### **Home Screen**
- Displays a list of recorded runs:
  - Distance, time, and date.
- Pull to refresh the list.

### **Map Page**
- Start/stop tracking with the provided button.
- View your route in real time.
- Distance and time update dynamically.
- Saves the session to the database when tracking stops.

---

## **Project Structure**
```plaintext
src/
├── components/
│   ├── database.js        # SQLite database operations
│   ├── map.js             # Map and GPS tracking logic
│   ├── trainingSession.js # Training session management
├── App.js                 # Main entry point
```

---

## **Database Schema**

### **`trainingsessions`**
- **id (INTEGER)**: Unique ID for the session.
- **distance (REAL)**: Distance covered in kilometers.
- **time (TEXT)**: Elapsed time in human-readable format (e.g., Xh Xm Xs).
- **date (TEXT)**: Date and time of the session (ISO format).

---

## **APIs Used**

### **Open-Meteo Weather API**
- Fetches hourly temperature data.
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Parameters**: `latitude`, `longitude`, `hourly=temperature_2m`.

---

## **Key Functions**

### **Start Tracking a Run**
Initializes GPS tracking and updates the route coordinates dynamically.

```javascript
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
      setRouteCoordinates((prevCoords) => [...prevCoords, { latitude, longitude }]);
    }
  );
};
```

### **Stop Tracking a Run**
Stops GPS tracking, calculates the total distance, and saves the run data to the database.

```javascript
const stopTracking = async () => {
  setIsTracking(false);
  const totalDistanceTraveled = calculateTotalDistance(routeCoordinates);
  setTotalDistance(totalDistanceTraveled);

  const formattedTime = formatTime(elapsedTime);

  try {
    const insertedId = await createRunRecord(totalDistanceTraveled / 1000, formattedTime);
    console.log(`Run saved with ID: ${insertedId}`);
  } catch (error) {
    console.error('Error saving run:', error);
  }
};
```

### **Calculate Distance Between Points**
Calculates the distance between two GPS coordinates.

```javascript
const getDistanceBetweenPoints = (point1, point2) => {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;
  const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};
```

---

## **Third-Party Libraries**
- **expo-location**: For GPS and location tracking.
- **react-native-maps**: For displaying maps and drawing routes.
- **expo-sqlite**: For managing the SQLite database.
- **@react-navigation/native**: For navigation between screens.
- **open-meteo**: For fetching weather data.

---

## **Project Images**

[Running Tracker App Screenshot 1](https://imgur.com/a/CdLn86z)

[Running Tracker App Screenshot 2](https://imgur.com/a/Yd3RlTE)

