import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  web: {
    apiKey: 'AIzaSyBsz7TEqPDtZdxFk3eTSvo11Q8YRQDVU4w',
    appId: '1:130497814341:web:83569103a69c0b9fc8282c',
    messagingSenderId: '130497814341',
    projectId: 'menu-mentor-prod',
    authDomain: 'menu-mentor-prod.firebaseapp.com',
    storageBucket: 'menu-mentor-prod.firebasestorage.app',
    measurementId: 'G-2WQKQX1RW2',
  },
  android: {
    apiKey: 'AIzaSyA5DSCyL4gHAAVkrrTy-Ty1_K3VecTiq0E',
    appId: '1:130497814341:android:776076ecb482da47c8282c',
    messagingSenderId: '130497814341',
    projectId: 'menu-mentor-prod',
    storageBucket: 'menu-mentor-prod.firebasestorage.app',
  },
  ios: {
    apiKey: 'AIzaSyAa2l_-SBwPcxPVO4tiPc5Du6C1wcDk81o',
    appId: '1:130497814341:ios:da70362be61c6473c8282c',
    messagingSenderId: '130497814341',
    projectId: 'menu-mentor-prod',
    storageBucket: 'menu-mentor-prod.firebasestorage.app',
    iosClientId: '130497814341-s06m1ikgim60ctmffpi6j44ldsl7look.apps.googleusercontent.com',
    iosBundleId: 'com.example.menuMentorApp',
  },
};

// Get the appropriate config based on platform
const getFirebaseConfig = () => {
  if (Platform.OS === 'web') {
    return firebaseConfig.web;
  } else if (Platform.OS === 'ios') {
    return firebaseConfig.ios;
  } else if (Platform.OS === 'android') {
    return firebaseConfig.android;
  }
  return firebaseConfig.web; // Default fallback
};

// Initialize Firebase
const app = initializeApp(getFirebaseConfig());

// Initialize Auth with persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
  // Set persistence for web
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting persistence:', error);
  });
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1');

export { app, auth, db, storage, functions };