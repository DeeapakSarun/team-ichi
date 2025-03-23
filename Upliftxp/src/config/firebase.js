import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDn7FZoLrn1snqijre4V2zZQcJpsq5fbN4",
  authDomain: "upliftxp-79a29.firebaseapp.com",
  projectId: "upliftxp-79a29",
  storageBucket: "upliftxp-79a29.appspot.com",
  messagingSenderId: "575141690961",
  appId: "1:575141690961:web:73dec01879773500094270"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app); 