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

// Check if running on GitHub Pages
const isGitHubPages = window.location.hostname === 'mot90.github.io';

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let functions;

// Enhanced Firestore persistence handler
function enableFirestorePersistence(db) {
  // First, try to clear any existing incompatible data
  const clearIncompatibleData = () => {
    return new Promise((resolve) => {
      if ('indexedDB' in window) {
        // Clear all Firestore-related databases
        const databases = ['firestore', 'firestore-main', 'firestore-owner'];
        let clearedCount = 0;
        
        databases.forEach(dbName => {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onsuccess = () => {
            console.log(`🗑️ Cleared ${dbName} database`);
            clearedCount++;
            if (clearedCount === databases.length) {
              resolve();
            }
          };
          deleteReq.onerror = () => {
            console.log(`⚠️ Could not clear ${dbName} database`);
            clearedCount++;
            if (clearedCount === databases.length) {
              resolve();
            }
          };
        });
      } else {
        resolve();
      }
    });
  };

  // Try to enable persistence with retry logic
  const tryEnablePersistence = async (retryCount = 0) => {
    try {
      await db.enablePersistence({
        synchronizeTabs: false // Disable tab synchronization to avoid conflicts
      });
      console.log('✅ Firestore offline persistence enabled successfully');
      return true;
    } catch (err) {
      console.warn(`⚠️ Persistence attempt ${retryCount + 1} failed:`, err.message);
      
      if (err.code === 'failed-precondition') {
        if (err.message.includes('newer version') || err.message.includes('incompatible')) {
          console.log('🔄 SDK version mismatch detected, clearing old data...');
          await clearIncompatibleData();
          
          // For SDK version mismatch, we need to refresh the page
          // because Firestore has already been initialized
          if (retryCount === 0) {
            console.log('🔄 Data cleared. Please refresh the page to complete the setup.');
            console.log('💡 Tip: The page will automatically retry persistence on next load');
            return false;
          }
        } else if (err.message.includes('Multiple tabs')) {
          console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
          console.log('💡 Tip: Close other tabs with this app to enable offline persistence');
        } else if (err.message.includes('already been started')) {
          console.warn('⚠️ Firestore already started. Persistence must be enabled before other operations.');
          console.log('💡 Tip: This usually happens after a retry. Persistence will work on next page load.');
        } else {
          console.warn('⚠️ Failed precondition:', err.message);
        }
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ The current browser does not support offline persistence.');
        console.log('💡 Tip: Try using Chrome, Firefox, or Safari for better offline support');
      } else {
        console.warn('⚠️ Could not enable persistence:', err.message);
      }
      
      return false;
    }
  };

  // Start the persistence setup
  tryEnablePersistence();
}

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
    console.log('🔥 Firebase app initialized:', app);
    
    // Initialize services
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    functions = firebase.functions();
    
    console.log('🔥 Firebase services initialized:', { auth, db, storage, functions });

    // Configure Firestore settings FIRST (before any other operations)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // Online deployment - configure Firestore with merge to avoid warnings
      console.log('🌐 Online deployment - configuring Firestore for better compatibility');
      db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        ignoreUndefinedProperties: true
      });
    }

    // Enable Firestore offline persistence AFTER settings are configured
    enableFirestorePersistence(db);

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

// Manual cleanup function for troubleshooting
function clearFirestoreData() {
  return new Promise((resolve) => {
    if ('indexedDB' in window) {
      const databases = ['firestore', 'firestore-main', 'firestore-owner'];
      let clearedCount = 0;
      
      databases.forEach(dbName => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onsuccess = () => {
          console.log(`🗑️ Manually cleared ${dbName} database`);
          clearedCount++;
          if (clearedCount === databases.length) {
            console.log('✅ All Firestore data cleared. Refresh the page to reinitialize.');
            resolve();
          }
        };
        deleteReq.onerror = () => {
          console.log(`⚠️ Could not clear ${dbName} database`);
          clearedCount++;
          if (clearedCount === databases.length) {
            resolve();
          }
        };
      });
    } else {
      console.log('⚠️ IndexedDB not available');
      resolve();
    }
  });
}

// For browser usage, make functions globally available
if (typeof window !== 'undefined') {
  window.FirebaseConfig = {
    initializeFirebase,
    getAuth,
    getFirestore,
    getStorage,
    getFunctions,
    isFirebaseReady,
    clearFirestoreData
  };
}
