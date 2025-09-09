// Firebase Configuration using Environment Variables
// This approach uses environment variables that are set in GitHub Pages

// Function to get environment variable with fallback
function getEnvVar(name, fallback = '') {
  // Try to get from environment (works in GitHub Actions)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || fallback;
  }
  
  // Try to get from window (for client-side)
  if (typeof window !== 'undefined' && window[name]) {
    return window[name];
  }
  
  // Fallback to empty string
  return fallback;
}

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', ''),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', ''),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', ''),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', ''),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', ''),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', ''),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', '')
};

// Check if we have valid config
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

// Rest of your Firebase initialization code...
let app;
let auth;
let db;
let storage;
let functions;
let isFirebaseReady = false;

function initializeFirebase() {
  if (isFirebaseReady) {
    console.log('Firebase already initialized.');
    return true;
  }

  if (!hasValidConfig) {
    console.error('❌ Firebase configuration is missing or invalid');
    console.log('Available environment variables:', {
      apiKey: !!firebaseConfig.apiKey,
      projectId: !!firebaseConfig.projectId,
      authDomain: !!firebaseConfig.authDomain
    });
    return false;
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
