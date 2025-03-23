import React, { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

// StepCounter component
const StepCounter = ({ onStepCountUpdate }) => {
  // Declare refs inside the functional component
  const stepCountRef = useRef(0);  // Ref to store step count value
  const lastY = useRef(0);         // Ref for last Y-axis value
  const lastTimestamp = useRef(0); // Ref for last timestamp
  const isCounting = useRef(false); // Ref to track if counting is in progress
  const subscriptionRef = useRef(null); // Ref to store accelerometer listener

  useEffect(() => {
    // Function to subscribe to accelerometer data
    const subscribeToAccelerometer = async () => {
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (isAvailable) {
        subscriptionRef.current = Accelerometer.addListener(({ y }) => {
          const threshold = 0.15;  // Threshold for detecting step
          const timestamp = Date.now();

          // Detect significant movement (step)
          if (
            Math.abs(y - lastY.current) > threshold &&
            !isCounting.current &&
            (timestamp - lastTimestamp.current) > 600
          ) {
            isCounting.current = true;
            lastY.current = y;
            lastTimestamp.current = timestamp;

            stepCountRef.current++; // Increment step count
            onStepCountUpdate(stepCountRef.current); // Update the parent component with the new step count

            // Reset counting state after 1 second
            setTimeout(() => {
              isCounting.current = false;
            }, 1000);
          }
        });
      }
    };

    // Subscribe to the accelerometer sensor
    subscribeToAccelerometer();

    // Cleanup on component unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [onStepCountUpdate]); // Run the effect whenever onStepCountUpdate changes

  return null; // No UI elements, just accelerometer logic
};

export { StepCounter };
