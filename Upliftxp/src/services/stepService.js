import { Accelerometer } from 'expo-sensors';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

class StepService {
  constructor() {
    this.steps = 0;
    this.lastUpdate = 0;
    this.threshold = 15; // Acceleration threshold for step detection
    this.isTracking = false;
  }

  startTracking(userId) {
    if (this.isTracking) return;

    this.isTracking = true;
    this.steps = 0;
    this.lastUpdate = Date.now();

    Accelerometer.setUpdateInterval(100); // Update every 100ms

    this.subscription = Accelerometer.addListener(data => {
      const now = Date.now();
      if (now - this.lastUpdate < 250) return; // Minimum time between steps

      const acceleration = Math.sqrt(
        data.x * data.x + 
        data.y * data.y + 
        data.z * data.z
      );

      if (acceleration > this.threshold) {
        this.steps++;
        this.lastUpdate = now;
        this.updateStepsInFirebase(userId);
      }
    });
  }

  stopTracking() {
    if (this.subscription) {
      this.subscription.remove();
      this.isTracking = false;
    }
  }

  async updateStepsInFirebase(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentSteps = userDoc.data().dailySteps || 0;
        await updateDoc(userRef, {
          dailySteps: currentSteps + 1,
          lastStepUpdate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating steps:', error);
    }
  }

  getSteps() {
    return this.steps;
  }
}

export const stepService = new StepService(); 