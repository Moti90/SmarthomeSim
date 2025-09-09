// Firebase Configuration for Smart Home Simulator
// This file contains Firebase initialization and service configuration

// Firebase configuration object - SECURE VERSION
// Note: In production, these should be environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCdXnszAUJfkC5uyv9n-kVE2Whv_0vZfLk",
  authDomain: "ibi-simulator-f6ebe.firebaseapp.com",
  projectId: "ibi-simulator-f6ebe",
  storageBucket: "ibi-simulator-f6ebe.firebasestorage.app",
  messagingSenderId: "929875729041",
  appId: "1:929875729041:web:d53f21685b20d63fb73d30",
  measurementId: "G-YR3XWP3RVH"
};

// Check if running on GitHub Pages
const isGitHubPages = window.location.hostname === 'mot90.github.io';

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let functions;
let isFirebaseReady = false;

// Function to initialize Firebase
function initializeFirebase() {
  if (isFirebaseReady) {
    console.log('Firebase already initialized.');
    return true;
  }

  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Please include Firebase scripts.');
    return false;
  }

  // Initialize Firebase app
  app = firebase.initializeApp(firebaseConfig);
  console.log('🔥 Firebase app initialized:', app);
  
  // Initialize services
  auth = firebase.auth(app); // Reverted to v8 syntax
  db = firebase.firestore(app); // Reverted to v8 syntax
  storage = firebase.storage(app); // Reverted to v8 syntax
  functions = firebase.functions(app); // Reverted to v8 syntax
  
  console.log('🔥 Firebase services initialized:', { auth, db, storage, functions });

  // Configure Firestore settings FIRST (before any other operations)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Online deployment - configure Firestore with merge to avoid warnings
    console.log('🌐 Online deployment - configuring Firestore for better compatibility');
    db.settings({
      cacheSizeBytes: firebase.firestore.CACHE_UNLIMITED,
      ignoreUndefinedProperties: true
    });
  }

  // Enable Firestore offline persistence AFTER settings are configured
  enableFirestorePersistence(db);

  console.log('Firebase initialized successfully');
  isFirebaseReady = true;
  return true;
}

// Function to enable Firestore offline persistence
function enableFirestorePersistence(db) {
  if (db && typeof db.enablePersistence === 'function') {
    db.enablePersistence({
      synchronizeTabs: true
    }).then(() => {
      console.log('✅ Firestore offline persistence enabled');
    }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ The current browser does not support all features required for persistence');
      } else {
        console.error('❌ Error enabling Firestore persistence:', err);
      }
    });
  } else {
    console.warn('⚠️ Firestore persistence not available');
  }
}

// Function to get Firebase services
function getAuth() {
  return auth;
}

function getFirestore() {
  return db;
}

function getStorage() {
  return storage;
}

function getFunctions() {
  return functions;
}

function getApp() {
  return app;
}

// Function to check if Firebase is ready
function isFirebaseInitialized() {
  return isFirebaseReady;
}

// Export functions for use in other scripts
window.FirebaseConfig = {
  initializeFirebase,
  getAuth,
  getFirestore,
  getStorage,
  getFunctions,
  getApp,
  isFirebaseInitialized
};

// Auto-initialize Firebase when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
  initializeFirebase();
}
