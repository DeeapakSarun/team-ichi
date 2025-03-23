import { Accelerometer } from 'expo-sensors';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

class StepService {
  constructor() {
    this.steps = 0;
    this.distance = 0; // Distance in meters
    this.averageStepLength = 0.75; // Average step length in meters
    this.lastUpdate = 0;
    this.threshold = 12; // Lowered threshold for step detection
    this.isTracking = false;
    this.locationPermissionGranted = false;
    this.accelerometerPermissionGranted = false;
    this.locationSubscription = null;
    this.lastLocation = null;
    this.lastLocationUpdate = 0;
    this.minimumMovementThreshold = 1.0; // Minimum movement in meters
    this.isMoving = false;
    this.totalDistanceTraveled = 0; // Total distance from location API
  }

  async requestAccelerometerPermission() {
    try {
      // On iOS, we need to explicitly request motion permissions in some cases
      if (Platform.OS === 'ios') {
        const { status } = await Accelerometer.requestPermissionsAsync();
        if (status === 'granted') {
          this.accelerometerPermissionGranted = true;
          console.log('Accelerometer permission granted');
          return true;
        } else {
          this.accelerometerPermissionGranted = false;
          console.log('Accelerometer permission denied');
          Alert.alert(
            'Motion Sensor Permission',
            'Step counting requires access to your device motion sensors. Without this permission, we cannot count your steps.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } else {
        // On Android, accelerometer permissions are typically granted by default
        const isAvailable = await Accelerometer.isAvailableAsync();
        if (isAvailable) {
          this.accelerometerPermissionGranted = true;
          return true;
        } else {
          Alert.alert(
            'Sensor Not Available',
            'Your device does not have the required sensors for step counting.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
    } catch (error) {
      console.error('Error requesting accelerometer permission:', error);
      return false;
    }
  }

  async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        this.locationPermissionGranted = true;
        console.log('Location permission granted');
        return true;
      } else {
        this.locationPermissionGranted = false;
        console.log('Location permission denied');
        Alert.alert(
          'Location Permission',
          'Location access helps improve step counting accuracy. You can enable it in settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async startTracking(userId) {
    if (this.isTracking) return;

    // Request accelerometer permission first
    const hasAccelerometerPermission = await this.requestAccelerometerPermission();
    if (!hasAccelerometerPermission) {
      console.log('Cannot start step tracking without accelerometer permission');
      return;
    }

    // Request location permission
    await this.requestLocationPermission();

    // Start location tracking if permission granted
    if (this.locationPermissionGranted) {
      await this.startLocationTracking();
    }

    this.isTracking = true;
    
    // Initialize steps and distance from Firebase
    await this.loadInitialData(userId);

    Accelerometer.setUpdateInterval(100); // Update every 100ms

    this.subscription = Accelerometer.addListener(data => {
      const now = Date.now();
      if (now - this.lastUpdate < 250) return; // Minimum time between steps

      const acceleration = Math.sqrt(
        data.x * data.x + 
        data.y * data.y + 
        data.z * data.z
      );

      // Only count steps if:
      // 1. We don't have location permission, OR
      // 2. We have location permission AND we detected movement
      if (acceleration > this.threshold && 
          (!this.locationPermissionGranted || this.isMoving)) {
        this.steps++;
        // Calculate distance based on steps
        this.distance += this.averageStepLength;
        this.lastUpdate = now;
        
        // Only update Firebase occasionally to reduce writes
        if (now - (this.lastFirebaseUpdate || 0) > 5000) {
          this.updateDataInFirebase(userId);
          this.lastFirebaseUpdate = now;
        }
      }
    });
  }

  async startLocationTracking() {
    try {
      // Location.watchPositionAsync returns a Promise that resolves to a subscription object
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1, // minimum distance in meters
          timeInterval: 5000  // check every 5 seconds
        },
        location => {
          const now = Date.now();
          if (this.lastLocation) {
            // Calculate distance moved
            const distance = this.calculateDistance(
              this.lastLocation.coords.latitude,
              this.lastLocation.coords.longitude,
              location.coords.latitude,
              location.coords.longitude
            );
            
            // Update movement state
            this.isMoving = distance > this.minimumMovementThreshold;
            
            // Track total distance if significant movement detected
            if (distance > this.minimumMovementThreshold) {
              this.totalDistanceTraveled += distance;
              // Update our distance value with the more accurate GPS-based measurement
              this.distance = this.totalDistanceTraveled;
              console.log(`Distance moved: ${distance.toFixed(2)}m, Total: ${this.distance.toFixed(2)}m`);
            }
          }
          
          this.lastLocation = location;
          this.lastLocationUpdate = now;
        }
      );
      console.log('Location tracking started successfully');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.locationSubscription = null;
    }
  }

  // Calculate distance between two GPS coordinates using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in meters
    
    return d;
  }

  async loadInitialData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.steps = userData.dailySteps || 0;
        this.distance = userData.dailyDistance || 0;
        this.totalDistanceTraveled = this.distance;
        console.log(`Loaded initial steps: ${this.steps}, distance: ${this.distance.toFixed(2)}m`);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  stopTracking() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    
    if (this.locationSubscription) {
      try {
        this.locationSubscription.remove();
      } catch (error) {
        console.error('Error removing location subscription:', error);
      }
      this.locationSubscription = null;
    }
    
    this.isTracking = false;
    console.log('Step tracking stopped');
  }

  async updateDataInFirebase(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        dailySteps: this.steps,
        dailyDistance: this.distance,
        lastStepUpdate: new Date().toISOString()
      });
      
      console.log(`Updated data in Firebase: ${this.steps} steps, ${this.distance.toFixed(2)}m`);
    } catch (error) {
      console.error('Error updating step data:', error);
    }
  }

  getSteps() {
    return this.steps;
  }

  getDistance() {
    return this.distance;
  }

  // For developer/testing purposes
  manuallySetDistance(distance) {
    this.distance = distance;
    this.totalDistanceTraveled = distance;
  }
}

export const stepService = new StepService(); 