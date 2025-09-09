// Firebase Configuration Template
// Copy this file to firebase-config.js and add your actual Firebase config

// Firebase configuration object
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};

// Check if running on GitHub Pages
const isGitHubPages = window.location.hostname === 'your-username.github.io';

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
  auth = firebase.auth(app);
  db = firebase.firestore(app);
  storage = firebase.storage(app);
  functions = firebase.functions(app);
  
  console.log('🔥 Firebase services initialized:', { auth, db, storage, functions });

  // Configure Firestore settings
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log('🌐 Online deployment - configuring Firestore');
    db.settings({
      cacheSizeBytes: firebase.firestore.CACHE_UNLIMITED,
      ignoreUndefinedProperties: true
    });
  }

  // Enable Firestore offline persistence
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
