// Firebase Configuration for Smart Home Simulator
// This file contains Firebase initialization and service configuration

// Firebase configuration object
// Your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCdXnszAUJfkC5uyv9n-kVE2Whv_0vZfLk",
  authDomain: "ibi-simulator-f6ebe.firebaseapp.com",
  projectId: "ibi-simulator-f6ebe",
  storageBucket: "ibi-simulator-f6ebe.firebasestorage.app",
  messagingSenderId: "929875729041",
  appId: "1:929875729041:web:d53f21685b20d63fb73d30",
  measurementId: "G-YR3XWP3RVH"
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let functions;

// Initialize Firebase services
function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not loaded. Please include Firebase scripts.');
      return false;
    }

    // Initialize Firebase app
    app = firebase.initializeApp(firebaseConfig);
    
    // Initialize services
    auth = firebase.auth(app);
    db = firebase.firestore(app);
    storage = firebase.storage(app);
    functions = firebase.functions(app);

    // Configure Firestore settings for better online compatibility
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // Online deployment - configure Firestore with merge to avoid warnings
      console.log('🌐 Online deployment - configuring Firestore for better compatibility');
      db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        ignoreUndefinedProperties: true
      }, { merge: true });
    }

    // Enable Firestore offline persistence with better warning handling
    db.enablePersistence()
      .then(() => {
        console.log('✅ Firestore offline persistence enabled');
      })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('⚠️ The current browser does not support persistence.');
        } else if (err.message.includes('newer version')) {
          console.warn('⚠️ Firestore SDK version mismatch. Clearing old data...');
          // Clear IndexedDB to resolve version conflicts
          if ('indexedDB' in window) {
            indexedDB.deleteDatabase('firestore');
            console.log('🗑️ Cleared old Firestore data');
          }
        } else {
          console.warn('⚠️ Could not enable persistence:', err.message);
        }
      });

    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
}

// Get Firebase service instances
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

// Check if Firebase is ready
function isFirebaseReady() {
  return app && auth && db;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeFirebase,
    getAuth,
    getFirestore,
    getStorage,
    getFunctions,
    isFirebaseReady
  };
}

// For browser usage, make functions globally available
if (typeof window !== 'undefined') {
  window.FirebaseConfig = {
    initializeFirebase,
    getAuth,
    getFirestore,
    getStorage,
    getFunctions,
    isFirebaseReady
  };
}
