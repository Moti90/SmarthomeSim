// Firebase Configuration for Client-side Environment Variables
// This approach uses a separate config file that's not committed to Git

// Try to load config from a separate file
let firebaseConfig = null;

// Function to load config dynamically
async function loadFirebaseConfig() {
  try {
    // Try to fetch config from a separate endpoint or file
    const response = await fetch('/api/firebase-config');
    if (response.ok) {
      firebaseConfig = await response.json();
      return true;
    }
  } catch (error) {
    console.log('Could not load config from API endpoint');
  }
  
  // Fallback: try to load from a local file (not in Git)
  try {
    const response = await fetch('./firebase-config-local.json');
    if (response.ok) {
      firebaseConfig = await response.json();
      return true;
    }
  } catch (error) {
    console.log('Could not load local config file');
  }
  
  // Final fallback: use placeholder values
  firebaseConfig = {
    apiKey: "PLACEHOLDER_API_KEY",
    authDomain: "placeholder-project.firebaseapp.com",
    projectId: "placeholder-project",
    storageBucket: "placeholder-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:placeholder",
    measurementId: "G-PLACEHOLDER"
  };
  
  console.warn('⚠️ Using placeholder Firebase config - app will not work properly');
  return false;
}

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let functions;
let isFirebaseReady = false;

// Function to initialize Firebase
async function initializeFirebase() {
  if (isFirebaseReady) {
    console.log('Firebase already initialized.');
    return true;
  }

  // Load config first
  const configLoaded = await loadFirebaseConfig();
  
  if (!configLoaded) {
    console.error('❌ Could not load Firebase configuration');
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
