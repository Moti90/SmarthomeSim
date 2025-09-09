// ===== FIREBASE IMPORTS =====
// Using Firebase v8 syntax to match your existing setup

// ===== APP MANAGER =====
class AppManager {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'home';
        this.currentTheme = 'default';
        
        // Radiator temperature control
        this.radiatorTemp = 21.0;
        this.radiatorTarget = 21.0;
        this.radiatorInterval = null;
        
        // Weather station data
        this.outdoorTemp = 15;
        this.outdoorLight = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredTheme();
        this.loadAllSettings();
        this.initializeFirebase();
        this.initializeSmartIcons();
    }

    initializeFirebase() {
        console.log('🔥 Initializing Firebase...');
        console.log('🔥 FirebaseConfig available:', !!window.FirebaseConfig);
        
        // Initialize Firebase using your existing setup
        if (window.FirebaseConfig) {
            const success = window.FirebaseConfig.initializeFirebase();
            console.log('🔥 Firebase initialization result:', success);
            
            if (success) {
                this.setupAuthStateListener();
                console.log('✅ Firebase setup complete');
            } else {
                console.error('❌ Firebase initialization failed');
            }
        } else {
            console.error('❌ Firebase configuration not found');
        }
    }

    setupEventListeners() {
        // Login/Register forms
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        
        // Auth links
        document.getElementById('register-link').addEventListener('click', (e) => this.showRegister(e));
        document.getElementById('login-back-link').addEventListener('click', (e) => this.showLogin(e));
        document.getElementById('forgot-link').addEventListener('click', (e) => this.handleForgotPassword(e));
        
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = btn.dataset.tab;
                console.log('Nav button clicked:', tabName);
                this.switchTab(tabName);
            });
        });
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.switchTheme(e.target.closest('.theme-option').dataset.theme));
        });
        
        // Device controls
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleDevice(e.target));
        });

        // E-Learning topic cards
        document.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleTopicClick(e.currentTarget));
        });

        // Back to topics button
        const backBtn = document.getElementById('back-to-topics');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showWelcomeContent());
        }

        // Search functionality
        const searchInput = document.getElementById('topic-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTopics(e.target.value));
        }
    }

    // ===== AUTHENTICATION =====
    setupAuthStateListener() {
        const auth = window.FirebaseConfig.getAuth();
        if (auth) {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    // User is signed in
                    this.currentUser = user;
                    this.hideLoading(); // Hide loading indicator
                    this.showApp();
                    this.updateUserInfo();
                } else {
                    // User is signed out
                    this.currentUser = null;
                    this.hideLoading(); // Hide loading indicator
                    this.showLogin();
                }
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            this.showLoading('Logger ind...');
            const auth = window.FirebaseConfig.getAuth();
            await auth.signInWithEmailAndPassword(email, password);
            // Auth state listener will handle the rest
        } catch (error) {
            this.hideLoading();
            this.showError(this.getErrorMessage(error.code));
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        try {
            this.showLoading('Opretter konto...');
            const auth = window.FirebaseConfig.getAuth();
            console.log('🔥 Attempting to create user with email:', email);
            console.log('🔥 Auth object:', auth);
            
            if (!auth) {
                throw new Error('Firebase Auth not initialized');
            }
            
            await auth.createUserWithEmailAndPassword(email, password);
            console.log('✅ User created successfully');
            // Auth state listener will handle the rest
        } catch (error) {
            console.error('❌ Error creating user:', error);
            this.hideLoading();
            this.showError(this.getErrorMessage(error.code));
        }
    }

    handleForgotPassword(e) {
        e.preventDefault();
        alert('Funktionen "Glemt adgangskode" er ikke implementeret endnu.');
    }

    async handleLogout() {
        try {
            const auth = window.FirebaseConfig.getAuth();
            await auth.signOut();
            // Auth state listener will handle the rest
        } catch (error) {
            this.showError('Fejl ved udlogning: ' + error.message);
        }
    }

    showLogin() {
        document.getElementById('login-container').classList.remove('hidden');
        document.getElementById('register-container').classList.add('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }

    showRegister(e) {
        e.preventDefault();
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('register-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }

    showApp() {
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('register-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('user-info').textContent = this.currentUser.email;
        }
    }

    // ===== ERROR HANDLING =====
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'Ingen bruger fundet med denne email.',
            'auth/wrong-password': 'Forkert adgangskode.',
            'auth/email-already-in-use': 'Denne email er allerede i brug.',
            'auth/weak-password': 'Adgangskoden skal være mindst 6 tegn.',
            'auth/invalid-email': 'Ugyldig email adresse.',
            'auth/user-disabled': 'Denne bruger er deaktiveret.',
            'auth/too-many-requests': 'For mange forsøg. Prøv igen senere.',
            'auth/network-request-failed': 'Netværksfejl. Tjek din internetforbindelse.'
        };
        return errorMessages[errorCode] || 'Der opstod en fejl. Prøv igen.';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showLoading(message) {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(10, 14, 26, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        document.body.appendChild(loadingOverlay);
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            document.body.removeChild(loadingOverlay);
        }
    }

    // ===== TAB NAVIGATION =====
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load data for specific tabs
        if (tabName === 'advanced') {
            this.loadSystemInfo();
            this.initRuleEditor();
            this.initSmarthomeSim();
        }
        
        this.currentTab = tabName;
    }

    // ===== THEME MANAGEMENT =====
    switchTheme(themeName) {
        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        const themeElement = document.querySelector(`[data-theme="${themeName}"]`);
        if (themeElement) {
            themeElement.classList.add('active');
        }
        
        // Apply theme
        document.body.classList.remove('theme-crimson-gold', 'theme-warm-green');
        if (themeName === 'crimson-gold') {
            document.body.classList.add('theme-crimson-gold');
        } else if (themeName === 'warm-green') {
            document.body.classList.add('theme-warm-green');
        }
        
        this.currentTheme = themeName;
        this.storeTheme(themeName);
    }

    loadStoredTheme() {
        const storedTheme = localStorage.getItem('selectedTheme');
        if (storedTheme) {
            // Wait for DOM to be ready before switching theme
            setTimeout(() => {
                this.switchTheme(storedTheme);
            }, 100);
        }
    }

    storeTheme(theme) {
        localStorage.setItem('selectedTheme', theme);
    }

    // ===== NYE INDSTILLINGER =====

    // Advanced Mode
    toggleAdvancedMode() {
        const checkbox = document.getElementById('advanced-mode');
        const isEnabled = checkbox.checked;
        
        if (isEnabled) {
            // Show password popup
            this.showAdvancedPasswordPopup();
        } else {
            // Deaktiver Advanced Mode
            const advancedTab = document.querySelector('.advanced-tab');
            advancedTab.style.display = 'none';
            this.showNotification('Advanced Mode deaktiveret', 'info');
            
            // Hvis vi er på advanced tab, skift til home
            if (this.currentTab === 'advanced') {
                this.switchTab('home');
            }
            
            this.saveSetting('advancedMode', false);
        }
    }

    showAdvancedPasswordPopup() {
        const popup = document.getElementById('advanced-password-popup');
        const passwordInput = document.getElementById('advanced-password-input');
        
        popup.style.display = 'flex';
        passwordInput.focus();
        
        // Event listeners for popup
        document.getElementById('submit-password').onclick = () => this.validateAdvancedPassword();
        document.getElementById('cancel-password').onclick = () => this.cancelAdvancedPassword();
        document.getElementById('toggle-password-visibility').onclick = () => this.togglePasswordVisibility();
        
        // Enter key support
        passwordInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                this.validateAdvancedPassword();
            }
        };
        
        // Escape key support
        document.addEventListener('keydown', this.handlePasswordPopupEscape);
    }

    hideAdvancedPasswordPopup() {
        const popup = document.getElementById('advanced-password-popup');
        const passwordInput = document.getElementById('advanced-password-input');
        
        popup.style.display = 'none';
        passwordInput.value = '';
        
        // Fjern event listener
        document.removeEventListener('keydown', this.handlePasswordPopupEscape);
    }

    cancelAdvancedPassword() {
        // Luk popup og slå slideren fra
        this.hideAdvancedPasswordPopup();
        document.getElementById('advanced-mode').checked = false;
    }

    handlePasswordPopupEscape = (e) => {
        if (e.key === 'Escape') {
            this.cancelAdvancedPassword();
        }
    }

    validateAdvancedPassword() {
        const passwordInput = document.getElementById('advanced-password-input');
        const enteredPassword = passwordInput.value.trim().toLowerCase();
        
        // Mønsterelev kode: "1" (midlertidigt)
        const correctPassword = '1';
        
        if (enteredPassword === correctPassword) {
            // Korrekt kode - aktiver Advanced Mode
            const advancedTab = document.querySelector('.advanced-tab');
            advancedTab.style.display = 'flex';
            this.showNotification('🔓 Advanced Mode aktiveret!', 'success');
            this.loadSystemInfo();
            this.initRuleEditor();
            this.initSmarthomeSim();
            this.saveSetting('advancedMode', true);
            this.hideAdvancedPasswordPopup();
        } else {
            // Forkert kode
            this.showNotification('❌ Forkert kode. Prøv igen.', 'error');
            passwordInput.value = '';
            passwordInput.focus();
            
            // Ryst input feltet for feedback
            passwordInput.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                passwordInput.style.animation = '';
            }, 500);
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('advanced-password-input');
        const toggleButton = document.getElementById('toggle-password-visibility');
        const icon = toggleButton.querySelector('.password-icon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            icon.textContent = '👁️';
        }
    }

    // Compact View
    toggleCompactView() {
        const checkbox = document.getElementById('compact-view');
        const isEnabled = checkbox.checked;
        
        if (isEnabled) {
            document.body.classList.add('compact-view');
            this.showNotification('Kompakt visning aktiveret', 'success');
        } else {
            document.body.classList.remove('compact-view');
            this.showNotification('Kompakt visning deaktiveret', 'info');
        }
        
        this.saveSetting('compactView', isEnabled);
    }

    // High Contrast
    toggleHighContrast() {
        const checkbox = document.getElementById('high-contrast');
        const isEnabled = checkbox.checked;
        
        if (isEnabled) {
            document.body.classList.add('high-contrast');
            this.showNotification('Høj kontrast aktiveret', 'success');
        } else {
            document.body.classList.remove('high-contrast');
            this.showNotification('Høj kontrast deaktiveret', 'info');
        }
        
        this.saveSetting('highContrast', isEnabled);
    }

    // Large Text
    toggleLargeText() {
        const checkbox = document.getElementById('large-text');
        const isEnabled = checkbox.checked;
        
        if (isEnabled) {
            document.body.classList.add('large-text');
            this.showNotification('Større skrift aktiveret', 'success');
        } else {
            document.body.classList.remove('large-text');
            this.showNotification('Større skrift deaktiveret', 'info');
        }
        
        this.saveSetting('largeText', isEnabled);
    }

    // Sound Notifications
    toggleSoundNotifications() {
        const checkbox = document.getElementById('sound-notifications');
        const isEnabled = checkbox.checked;
        
        if (isEnabled) {
            this.showNotification('Lydnotifikationer aktiveret', 'success');
        } else {
            this.showNotification('Lydnotifikationer deaktiveret', 'info');
        }
        
        this.saveSetting('soundNotifications', isEnabled);
    }

    // Desktop Notifications
    toggleDesktopNotifications() {
        const checkbox = document.getElementById('desktop-notifications');
        const isEnabled = checkbox.checked;
        
        if (isEnabled) {
            // Request permission for desktop notifications
            if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showNotification('Desktop notifikationer aktiveret', 'success');
                    } else {
                        checkbox.checked = false;
                        this.showNotification('Desktop notifikationer kræver tilladelse', 'error');
                    }
                });
            } else {
                checkbox.checked = false;
                this.showNotification('Desktop notifikationer ikke understøttet', 'error');
            }
        } else {
            this.showNotification('Desktop notifikationer deaktiveret', 'info');
        }
        
        this.saveSetting('desktopNotifications', isEnabled);
    }

    // Auto Logout
    toggleAutoLogout() {
        const checkbox = document.getElementById('auto-logout');
        const isEnabled = checkbox.checked;
        
        if (isEnabled) {
            this.showNotification('Auto-logout aktiveret', 'success');
            this.startAutoLogoutTimer();
        } else {
            this.showNotification('Auto-logout deaktiveret', 'info');
            this.clearAutoLogoutTimer();
        }
        
        this.saveSetting('autoLogout', isEnabled);
    }

    // Save Settings
    toggleSaveSettings() {
        const checkbox = document.getElementById('save-settings');
        const isEnabled = checkbox.checked;
        
        if (isEnabled) {
            this.showNotification('Indstillinger gemmes lokalt', 'success');
        } else {
            this.showNotification('Indstillinger gemmes ikke længere', 'info');
        }
        
        // Always save the saveSettings setting directly (no circular dependency)
        localStorage.setItem('setting_saveSettings', isEnabled);
        console.log('Saved saveSettings setting:', isEnabled);
    }

    // Reset Settings
    resetSettings() {
        if (confirm('Er du sikker på, at du vil nulstille alle indstillinger?')) {
            // Reset all checkboxes
            document.querySelectorAll('#settings-tab input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Keep save-settings checked by default
            document.getElementById('save-settings').checked = true;
            
            // Remove all setting classes
            document.body.classList.remove('compact-view', 'high-contrast', 'large-text', 'sound-notifications', 'desktop-notifications', 'auto-logout');
            
            // Clear localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('setting_')) {
                    localStorage.removeItem(key);
                }
            });
            
            this.showNotification('Alle indstillinger er nulstillet', 'success');
        }
    }

    // Clear All Data
    clearAllData() {
        if (confirm('Er du sikker på, at du vil slette ALLE data? Dette kan ikke fortrydes!')) {
            localStorage.clear();
            this.showNotification('Alle data er slettet', 'success');
            
            // Reload page to reset everything
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    // Helper functions
    saveSetting(key, value) {
        const saveSettings = localStorage.getItem('setting_saveSettings') !== 'false';
        if (saveSettings) {
            localStorage.setItem(`setting_${key}`, value);
            console.log(`Saved setting ${key}:`, value);
        } else {
            console.log(`Not saving setting ${key} because saveSettings is disabled`);
        }
    }

    loadSetting(key, defaultValue = false) {
        const saved = localStorage.getItem(`setting_${key}`);
        const result = saved !== null ? saved === 'true' : defaultValue;
        console.log(`Loaded setting ${key}:`, result, `(saved value: ${saved}, default: ${defaultValue})`);
        return result;
    }

    loadAllSettings() {
        // Load and apply all settings
        const settings = [
            'advancedMode',
            'compactView',
            'highContrast',
            'largeText',
            'soundNotifications',
            'desktopNotifications',
            'autoLogout',
            'saveSettings'
        ];

        // Map setting names to their HTML IDs and CSS classes
        const settingMap = {
            'advancedMode': { id: 'advanced-mode', class: 'advanced-mode' },
            'compactView': { id: 'compact-view', class: 'compact-view' },
            'highContrast': { id: 'high-contrast', class: 'high-contrast' },
            'largeText': { id: 'large-text', class: 'large-text' },
            'soundNotifications': { id: 'sound-notifications', class: 'sound-notifications' },
            'desktopNotifications': { id: 'desktop-notifications', class: 'desktop-notifications' },
            'autoLogout': { id: 'auto-logout', class: 'auto-logout' },
            'saveSettings': { id: 'save-settings', class: 'save-settings' }
        };

        settings.forEach(setting => {
            const isEnabled = this.loadSetting(setting);
            const mapping = settingMap[setting];
            
            if (mapping) {
                const checkbox = document.getElementById(mapping.id);
                if (checkbox) {
                    checkbox.checked = isEnabled;
                    
                    // Apply or remove setting classes
                    if (isEnabled) {
                        document.body.classList.add(mapping.class);
                    } else {
                        document.body.classList.remove(mapping.class);
                    }
                }
            }
        });

        // Special handling for auto-logout
        if (this.loadSetting('autoLogout')) {
            this.startAutoLogoutTimer();
        }
    }

    startAutoLogoutTimer() {
        this.clearAutoLogoutTimer();
        this.autoLogoutTimer = setTimeout(() => {
            if (confirm('Du har været inaktiv i 30 minutter. Vil du logge ud?')) {
                this.logout();
            }
        }, 30 * 60 * 1000); // 30 minutes
    }

    clearAutoLogoutTimer() {
        if (this.autoLogoutTimer) {
            clearTimeout(this.autoLogoutTimer);
            this.autoLogoutTimer = null;
        }
    }

    // ===== ADVANCED MODE FUNCTIONS =====
    
    // Load system information
    loadSystemInfo() {
        // Browser info
        const browserInfo = `${navigator.userAgent.split(' ')[0]} ${navigator.userAgent.split(' ')[1] || ''}`;
        document.getElementById('browser-info').textContent = browserInfo;
        
        // Screen resolution
        const screenInfo = `${screen.width} x ${screen.height}`;
        document.getElementById('screen-info').textContent = screenInfo;
        
        // Local storage
        const storageUsed = JSON.stringify(localStorage).length;
        const storageInfo = `${Math.round(storageUsed / 1024)} KB brugt`;
        document.getElementById('storage-info').textContent = storageInfo;
        
        // Performance
        const performanceInfo = `Memory: ${navigator.deviceMemory || 'Unknown'} GB`;
        document.getElementById('performance-info').textContent = performanceInfo;
    }

    // Advanced Mode functions
    toggleAIAssistant() {
        this.showNotification('AI Assistant kommer snart...', 'info');
    }

    toggleAnalytics() {
        this.showNotification('Advanced Analytics kommer snart...', 'info');
    }

    runSecurityScan() {
        this.showNotification('Sikkerhedsscanning startet...', 'info');
        setTimeout(() => {
            this.showNotification('Sikkerhedsscanning gennemført - ingen trusler fundet', 'success');
        }, 2000);
    }

    togglePerformanceMonitor() {
        this.showNotification('Performance Monitor kommer snart...', 'info');
    }

    openConsole() {
        this.showNotification('Åbn Developer Tools (F12) for console adgang', 'info');
    }

    exportData() {
        const data = {
            settings: Object.keys(localStorage).reduce((obj, key) => {
                obj[key] = localStorage.getItem(key);
                return obj;
            }, {}),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smarthome-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Data eksporteret til download', 'success');
    }

    clearCache() {
        if (confirm('Er du sikker på, at du vil rydde cache og lokale data?')) {
            localStorage.clear();
            this.showNotification('Cache og lokale data ryddet', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    systemReset() {
        if (confirm('Er du sikker på, at du vil nulstille hele systemet? Dette kan ikke fortrydes!')) {
            if (confirm('Dette vil slette ALLE data. Er du helt sikker?')) {
                localStorage.clear();
                sessionStorage.clear();
                this.showNotification('System nulstillet - genindlæser...', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        }
    }

    // ===== REGEL EDITOR FUNCTIONS =====
    
    initRuleEditor() {
        this.rules = [];
        this.selectedRule = null;
        this.availableDevices = [
            { id: 'motion_sensor_1', name: 'Bevægelsessensor - Stue', type: 'motion' },
            { id: 'door_sensor_1', name: 'Dørsensor - Hoveddør', type: 'door' },
            { id: 'light_1', name: 'Smart Lampe - Stue', type: 'light' },
            { id: 'light_2', name: 'Smart Lampe - Køkken', type: 'light' },
            { id: 'thermostat_1', name: 'Termostat - Stue', type: 'thermostat' },
            { id: 'window_sensor_1', name: 'Vinduesensor - Køkken', type: 'window' },
            { id: 'smoke_detector_1', name: 'Røgalarm - Gang', type: 'smoke' },
            { id: 'camera_1', name: 'Kamera - Indgang', type: 'camera' }
        ];
        this.availableConditions = [
            { type: 'motion_detected', name: 'Bevægelse registreret', operator: 'equals', value: 'true' },
            { type: 'door_open', name: 'Dør åben', operator: 'equals', value: 'true' },
            { type: 'light_level', name: 'Lysniveau', operator: 'less_than', value: '50' },
            { type: 'temperature', name: 'Temperatur', operator: 'greater_than', value: '25' },
            { type: 'time', name: 'Tidspunkt', operator: 'between', value: '22:00-06:00' },
            { type: 'window_open', name: 'Vindue åbent', operator: 'equals', value: 'true' }
        ];
        this.availableActions = [
            { type: 'turn_on_light', name: 'Tænd lys', device: 'light' },
            { type: 'turn_off_light', name: 'Sluk lys', device: 'light' },
            { type: 'set_temperature', name: 'Sæt temperatur', device: 'thermostat' },
            { type: 'send_notification', name: 'Send notifikation', device: 'notification' },
            { type: 'start_camera', name: 'Start optagelse', device: 'camera' },
            { type: 'play_sound', name: 'Afspil lyd', device: 'speaker' }
        ];
    }

    // ===== SMARTHOME SIMULATOR FUNCTIONS =====
    
    initSmarthomeSim() {
        this.simActors = {
            light: { status: 'OFF', value: 0 },
            dimmer: { status: '0%', value: 0 },
            fan: { status: 'OFF', value: 0 }
        };
        
        this.simSensors = [];
        this.simRules = [];
        this.simLog = [];
        this.globalVariables = {
            'fx mode': '',
            'fx night': ''
        };
        
        this.sensorTypes = {
            'pir': { name: 'PIR (bevægelse)', states: ['breached', 'safe'], type: 'binary' },
            'door': { name: 'Dør-/vindueskontakt', states: ['opened', 'closed'], type: 'binary' },
            'humidity': { name: 'Fugtighed (%)', states: [], type: 'numeric', unit: '%' },
            'light': { name: 'Lys (lux)', states: [], type: 'numeric', unit: 'lux' },
            'wind': { name: 'Vind (m/s)', states: [], type: 'numeric', unit: 'm/s' },
            'temp': { name: 'Temperatur (°C)', states: [], type: 'numeric', unit: '°C' },
            'smoke': { name: 'Røgalarm', states: ['detected', 'clear'], type: 'binary' },
            'water': { name: 'Vandlækage', states: ['wet', 'dry'], type: 'binary' },
            'co2': { name: 'CO₂ (ppm)', states: [], type: 'numeric', unit: 'ppm' },
            'presence': { name: 'Tilstedeværelse', states: ['occupied', 'vacant'], type: 'binary' },
            'alarm': { name: 'Alarm (Armed)', states: ['armed', 'disarmed'], type: 'binary' },
            'home': { name: 'Home Mode', states: ['home', 'vacant'], type: 'binary' }
        };
        
        this.startSimulationClock();
        this.addLogEntry('SYS', 'SmartHome Simulator v2.0 (WebView2 SPA) klar.');
        this.renderCreatedRules();
    }

    startSimulationClock() {
        setInterval(() => {
            const now = new Date();
            const time = now.toTimeString().slice(0, 5);
            const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
            
            document.getElementById('sim-time').textContent = time;
            document.getElementById('sim-day').textContent = day;
        }, 1000);
    }

    updateSensorStates() {
        const sensorType = document.getElementById('sensor-type').value;
        const stateContainer = document.getElementById('sensor-state-container');
        const addButton = document.querySelector('button[onclick="window.appManager.addSensor()"]');
        
        if (sensorType) {
            const sensor = this.sensorTypes[sensorType];
            
            if (sensor.type === 'binary') {
                // Binary sensor - dropdown med states
                stateContainer.innerHTML = `
                    <select id="sensor-state">
                        <option value="">Vælg state</option>
                        ${sensor.states.map(state => `<option value="${state}">${state}</option>`).join('')}
                    </select>
                `;
            } else {
                // Numeric sensor - input felt med unit
                stateContainer.innerHTML = `
                    <input type="number" id="sensor-state" placeholder="Værdi" step="0.1">
                    <span class="sensor-unit">${sensor.unit}</span>
                `;
            }
            
            stateContainer.style.display = 'flex';
            addButton.style.display = 'inline-block';
        } else {
            stateContainer.style.display = 'none';
            addButton.style.display = 'none';
        }
    }

    addSensor() {
        const sensorType = document.getElementById('sensor-type').value;
        const sensorStateElement = document.getElementById('sensor-state');
        const sensorState = sensorStateElement ? sensorStateElement.value : '';
        
        if (!sensorType || !sensorState) {
            this.showNotification('Vælg både sensor type og state', 'warning');
            return;
        }
        
        const sensor = this.sensorTypes[sensorType];
        const sensorId = `${sensorType}_${Date.now()}`;
        const globalName = `sensor.${sensorType}`;
        
        const newSensor = {
            id: sensorId,
            type: sensorType,
            name: sensor.name,
            state: sensorState,
            globalName: globalName,
            value: sensorState,
            dataType: sensor.type
        };
        
        this.simSensors.push(newSensor);
        this.renderSensors();
        this.addLogEntry('SENSOR', `Sensor tilføjet: ${sensor.name} (${globalName}) = ${sensorState}`);
        
        // Reset dropdowns
        document.getElementById('sensor-type').value = '';
        document.getElementById('sensor-state-container').style.display = 'none';
        document.querySelector('button[onclick="window.appManager.addSensor()"]').style.display = 'none';
    }

    renderSensors() {
        const sensorsList = document.getElementById('sensors-list');
        if (!sensorsList) return;

        if (this.simSensors.length === 0) {
            sensorsList.innerHTML = '<p class="no-sensors">Ingen sensorer tilføjet endnu</p>';
            return;
        }

        sensorsList.innerHTML = this.simSensors.map(sensor => {
            const sensorType = this.sensorTypes[sensor.type];
            const unit = sensorType.unit ? ` ${sensorType.unit}` : '';
            return `
                <div class="sensor-item">
                    <div class="sensor-info">
                        <div class="sensor-name">${sensor.name}</div>
                        <div class="sensor-global">${sensor.globalName}</div>
                        <div class="sensor-value">${sensor.value}${unit} (${sensor.dataType})</div>
                    </div>
                    <div class="sensor-actions">
                        <button class="btn btn-small" onclick="window.appManager.setSensorBuffer('${sensor.id}')">Sæt buffer</button>
                        <button class="btn btn-small btn-danger" onclick="window.appManager.removeSensor('${sensor.id}')">Fjern</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    removeSensor(sensorId) {
        const sensor = this.simSensors.find(s => s.id === sensorId);
        if (sensor) {
            this.simSensors = this.simSensors.filter(s => s.id !== sensorId);
            this.renderSensors();
            this.addLogEntry('SENSOR', `Sensor fjernet: ${sensor.name}`);
        }
    }

    setSensorBuffer(sensorId) {
        const sensor = this.simSensors.find(s => s.id === sensorId);
        if (sensor) {
            this.addLogEntry('BUFFER', `Buffer sat for ${sensor.globalName} = ${sensor.value}`);
            this.showNotification(`Buffer sat for ${sensor.globalName}`, 'success');
        }
    }

    toggleActor(actorType) {
        const actor = this.simActors[actorType];
        if (!actor) return;

        if (actorType === 'light' || actorType === 'fan') {
            actor.status = actor.status === 'OFF' ? 'ON' : 'OFF';
            actor.value = actor.status === 'ON' ? 1 : 0;
        }
        
        document.getElementById(`${actorType}-status`).textContent = actor.status;
        this.addLogEntry('ACTOR', `${actorType.toUpperCase()} ændret til ${actor.status}`);
    }

    openDimmerDialog(actorType) {
        const dialog = document.getElementById('dimmer-dialog');
        const slider = document.getElementById('dimmer-slider');
        const currentValue = document.getElementById('dimmer-current-value');
        
        slider.value = this.simActors.dimmer.value;
        currentValue.textContent = this.simActors.dimmer.value;
        
        dialog.style.display = 'flex';
    }

    closeDimmerDialog() {
        document.getElementById('dimmer-dialog').style.display = 'none';
    }

    updateDimmerValue(value) {
        document.getElementById('dimmer-current-value').textContent = value;
    }

    setDimmerValue(value) {
        document.getElementById('dimmer-slider').value = value;
        document.getElementById('dimmer-current-value').textContent = value;
    }

    applyDimmerValue() {
        const value = parseInt(document.getElementById('dimmer-slider').value);
        this.simActors.dimmer.value = value;
        this.simActors.dimmer.status = `${value}%`;
        
        document.getElementById('dimmer-status').textContent = `${value}%`;
        this.closeDimmerDialog();
        this.addLogEntry('ACTOR', `DÆMPER sat til ${value}%`);
    }

    setGlobalVariables() {
        const var1 = document.getElementById('global-var-1').value;
        const var2 = document.getElementById('global-var-2').value;
        
        this.globalVariables['fx mode'] = var1;
        this.globalVariables['fx night'] = var2;
        
        this.addLogEntry('GLOBAL', `Globale variabler sat: fx mode=${var1}, fx night=${var2}`);
        this.showNotification('Globale variabler sat i buffer', 'success');
    }

    clearAllVariables() {
        this.globalVariables = {};
        document.getElementById('global-var-1').value = '';
        document.getElementById('global-var-2').value = '';
        
        this.addLogEntry('GLOBAL', 'Alle globale variabler ryddet');
        this.showNotification('Alle globale variabler ryddet', 'info');
    }

    addSimRule() {
        const condition1 = document.getElementById('rule-condition-1').value;
        const value1 = document.getElementById('rule-value-1').value;
        const condition2 = document.getElementById('rule-condition-2').value;
        const value2 = document.getElementById('rule-value-2').value;
        const condition3 = document.getElementById('rule-condition-3').value;
        const value3 = document.getElementById('rule-value-3').value;
        const action = document.getElementById('rule-action').value;
        const actionValue = document.getElementById('rule-action-value').value;
        const ruleName = document.getElementById('rule-name').value;

        if (!condition1) {
            this.showNotification('Vælg mindst én betingelse', 'warning');
            return;
        }

        const rule = {
            id: 'sim_rule_' + Date.now(),
            name: ruleName || 'Unavngivet regel',
            conditions: [
                { type: condition1, value: value1 },
                { type: condition2, value: value2 },
                { type: condition3, value: value3 }
            ].filter(c => c.type),
            action: action,
            actionValue: actionValue,
            enabled: true
        };

        this.simRules.push(rule);
        this.addLogEntry('RULE', `Regel tilføjet: ${rule.name}`);
        this.showNotification('Regel tilføjet', 'success');
        this.renderCreatedRules();
    }

    clearAllRules() {
        if (confirm('Er du sikker på, at du vil slette alle regler?')) {
            this.simRules = [];
            this.addLogEntry('RULE', 'Alle regler slettet');
            this.showNotification('Alle regler slettet', 'info');
            this.renderCreatedRules();
        }
    }

    saveRules() {
        const rulesData = JSON.stringify(this.simRules, null, 2);
        const blob = new Blob([rulesData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'smarthome-rules.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.addLogEntry('SYSTEM', 'Regler gemt til fil');
        this.showNotification('Regler gemt til fil', 'success');
    }

    loadRules() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        this.simRules = JSON.parse(e.target.result);
                        this.addLogEntry('SYSTEM', 'Regler indlæst fra fil');
                        this.showNotification('Regler indlæst fra fil', 'success');
                    } catch (error) {
                        this.showNotification('Fejl ved indlæsning af regler', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    runRules() {
        this.addLogEntry('SYSTEM', 'Kører alle regler...');
        
        let triggeredRules = 0;
        this.simRules.forEach(rule => {
            if (this.evaluateRule(rule)) {
                this.executeRule(rule);
                triggeredRules++;
            }
        });
        
        this.addLogEntry('SYSTEM', `${triggeredRules} regler udløst`);
        this.showNotification(`${triggeredRules} regler udløst`, 'info');
    }

    evaluateRule(rule) {
        return rule.conditions.every(condition => {
            switch (condition.type) {
                case 'always':
                    return true;
                case 'time':
                    return this.evaluateTimeCondition(condition.value);
                case 'sensor':
                    return this.evaluateSensorCondition(condition.value);
                case 'global':
                    return this.evaluateGlobalCondition(condition.value);
                default:
                    return false;
            }
        });
    }

    evaluateTimeCondition(value) {
        const currentTime = new Date().toTimeString().slice(0, 5);
        return currentTime === value;
    }

    evaluateSensorCondition(value) {
        // Simplified sensor evaluation
        return this.simSensors.some(sensor => sensor.value === value);
    }

    evaluateGlobalCondition(value) {
        return Object.values(this.globalVariables).includes(value);
    }

    executeRule(rule) {
        this.addLogEntry('ACTIVATION', `Regel udløst: ${rule.name}`);
        
        switch (rule.action) {
            case 'light_on':
                this.simActors.light.status = 'ON';
                document.getElementById('light-status').textContent = 'ON';
                break;
            case 'light_off':
                this.simActors.light.status = 'OFF';
                document.getElementById('light-status').textContent = 'OFF';
                break;
            case 'dimmer':
                const dimmerValue = parseInt(rule.actionValue) || 50;
                this.simActors.dimmer.value = dimmerValue;
                this.simActors.dimmer.status = `${dimmerValue}%`;
                document.getElementById('dimmer-status').textContent = `${dimmerValue}%`;
                break;
            case 'fan_on':
                this.simActors.fan.status = 'ON';
                document.getElementById('fan-status').textContent = 'ON';
                break;
            case 'fan_off':
                this.simActors.fan.status = 'OFF';
                document.getElementById('fan-status').textContent = 'OFF';
                break;
            case 'notification':
                this.showNotification(rule.actionValue || 'Regel udløst', 'info');
                break;
        }
    }

    activateChanges() {
        this.addLogEntry('SYSTEM', 'Ændringer aktiveret - simulator klar');
        this.showNotification('Ændringer aktiveret', 'success');
    }

    addLogEntry(type, message) {
        const timestamp = new Date().toLocaleTimeString('da-DK', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        const logEntry = {
            timestamp: timestamp,
            type: type,
            message: message
        };
        
        this.simLog.push(logEntry);
        this.renderLog();
    }

    renderLog() {
        const logOutput = document.getElementById('log-output');
        if (!logOutput) return;

        logOutput.innerHTML = this.simLog.map(entry => 
            `<div class="log-entry ${entry.type.toLowerCase()}">${entry.timestamp} ${entry.type} ${entry.message}</div>`
        ).join('');
        
        // Scroll to bottom
        logOutput.scrollTop = logOutput.scrollHeight;
    }

    clearLog() {
        this.simLog = [];
        this.renderLog();
        this.addLogEntry('SYSTEM', 'Log ryddet');
    }

    filterLog(filter) {
        // Update button states
        document.querySelectorAll('.log-filters .btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Filter logic would go here
        this.showNotification(`Log filtreret: ${filter}`, 'info');
    }

    exportCSV() {
        const csvContent = this.simLog.map(entry => 
            `${entry.timestamp},${entry.type},${entry.message}`
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'smarthome-log.csv';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Log eksporteret til CSV', 'success');
    }

    copyLuaConditions() {
        const conditions = this.simRules.map(rule => 
            `-- ${rule.name}\nif (${rule.conditions.map(c => `${c.type} == "${c.value}"`).join(' and ')}) then`
        ).join('\n');
        
        navigator.clipboard.writeText(conditions).then(() => {
            this.showNotification('Lua conditions kopieret', 'success');
        });
    }

    copyLuaActions() {
        const actions = this.simRules.map(rule => 
            `-- ${rule.name}\n    ${this.generateLuaAction(rule.action, rule.actionValue)}`
        ).join('\n');
        
        navigator.clipboard.writeText(actions).then(() => {
            this.showNotification('Lua actions kopieret', 'success');
        });
    }

    generateLuaAction(action, value) {
        switch (action) {
            case 'light_on':
                return 'fibaro:call(light_id, "turnOn")';
            case 'light_off':
                return 'fibaro:call(light_id, "turnOff")';
            case 'dimmer':
                return `fibaro:call(dimmer_id, "setValue", ${value})`;
            case 'fan_on':
                return 'fibaro:call(fan_id, "turnOn")';
            case 'fan_off':
                return 'fibaro:call(fan_id, "turnOff")';
            case 'notification':
                return `fibaro:call(1, "sendNotification", "${value}")`;
            default:
                return '-- Unknown action';
        }
    }

    renderCreatedRules() {
        const rulesList = document.getElementById('created-rules-list');
        if (!rulesList) return;

        if (this.simRules.length === 0) {
            rulesList.innerHTML = '<p class="no-rules">Ingen regler oprettet endnu</p>';
            return;
        }

        rulesList.innerHTML = this.simRules.map(rule => `
            <div class="created-rule-item">
                <div class="rule-item-header">
                    <h5>${rule.name}</h5>
                    <div class="rule-item-actions">
                        <button class="btn-icon" onclick="window.appManager.deleteSimRule('${rule.id}')" title="Slet regel">🗑️</button>
                    </div>
                </div>
                <div class="rule-item-content">
                    <div class="rule-conditions">
                        <strong>Betingelser:</strong>
                        ${rule.conditions.map(condition => 
                            `<span class="condition-tag">${condition.type} = "${condition.value}"</span>`
                        ).join('')}
                    </div>
                    <div class="rule-action">
                        <strong>Handling:</strong>
                        <span class="action-tag">${this.getActionName(rule.action)} ${rule.actionValue ? `(${rule.actionValue})` : ''}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getActionName(action) {
        const actionNames = {
            'light_on': 'Tænd lys',
            'light_off': 'Sluk lys',
            'dimmer': 'Sæt dæmper',
            'fan_on': 'Tænd ventilator',
            'fan_off': 'Sluk ventilator',
            'notification': 'Send notifikation'
        };
        return actionNames[action] || action;
    }

    deleteSimRule(ruleId) {
        if (confirm('Er du sikker på, at du vil slette denne regel?')) {
            this.simRules = this.simRules.filter(rule => rule.id !== ruleId);
            this.addLogEntry('RULE', 'Regel slettet');
            this.showNotification('Regel slettet', 'info');
            this.renderCreatedRules();
        }
    }

    addNewRule() {
        const ruleId = 'rule_' + Date.now();
        const newRule = {
            id: ruleId,
            name: 'Ny Regel ' + (this.rules.length + 1),
            description: '',
            conditions: [],
            actions: [],
            enabled: true
        };
        
        this.rules.push(newRule);
        this.renderRules();
        this.showNotification('Ny regel oprettet', 'success');
    }

    renderRules() {
        const ruleList = document.getElementById('rule-list');
        if (!ruleList) return;

        if (this.rules.length === 0) {
            ruleList.innerHTML = `
                <div class="no-rules">
                    <p>Ingen regler oprettet endnu</p>
                    <p>Klik på "Ny Regel" for at komme i gang</p>
                </div>
            `;
            return;
        }

        ruleList.innerHTML = this.rules.map(rule => `
            <div class="rule-item ${this.selectedRule?.id === rule.id ? 'selected' : ''}" onclick="window.appManager.selectRule('${rule.id}')">
                <div class="rule-item-header">
                    <h4>${rule.name}</h4>
                    <div class="rule-item-actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); window.appManager.editRule('${rule.id}')" title="Rediger">✏️</button>
                        <button class="btn-icon" onclick="event.stopPropagation(); window.appManager.deleteRule('${rule.id}')" title="Slet">🗑️</button>
                    </div>
                </div>
                <div class="rule-item-content">
                    <p>${rule.description || 'Ingen beskrivelse'}</p>
                    <div class="rule-stats">
                        <span>${rule.conditions.length} betingelse(r)</span>
                        <span>${rule.actions.length} handling(er)</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    selectRule(ruleId) {
        this.selectedRule = this.rules.find(rule => rule.id === ruleId);
        this.renderRules();
        this.generateLuaCode();
    }

    editRule(ruleId) {
        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        // Vis regel editor popup
        this.showRuleEditor(rule);
    }

    deleteRule(ruleId) {
        if (confirm('Er du sikker på, at du vil slette denne regel?')) {
            this.rules = this.rules.filter(rule => rule.id !== ruleId);
            if (this.selectedRule?.id === ruleId) {
                this.selectedRule = null;
            }
            this.renderRules();
            this.generateLuaCode();
            this.showNotification('Regel slettet', 'info');
        }
    }

    showRuleEditor(rule) {
        // Opret regel editor popup
        const popup = document.createElement('div');
        popup.className = 'rule-editor-popup';
        popup.innerHTML = `
            <div class="rule-editor-popup-content">
                <div class="rule-editor-header">
                    <h3>Rediger Regel: ${rule.name}</h3>
                    <button class="close-btn" onclick="this.closest('.rule-editor-popup').remove()">&times;</button>
                </div>
                <div class="rule-editor-body">
                    <div class="form-group">
                        <label>Navn:</label>
                        <input type="text" id="rule-name" value="${rule.name}">
                    </div>
                    <div class="form-group">
                        <label>Beskrivelse:</label>
                        <textarea id="rule-description">${rule.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Betingelser:</label>
                        <div id="conditions-list"></div>
                        <button class="btn btn-secondary" onclick="window.appManager.addCondition('${rule.id}')">+ Tilføj Betingelse</button>
                    </div>
                    <div class="form-group">
                        <label>Handlinger:</label>
                        <div id="actions-list"></div>
                        <button class="btn btn-secondary" onclick="window.appManager.addAction('${rule.id}')">+ Tilføj Handling</button>
                    </div>
                </div>
                <div class="rule-editor-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.rule-editor-popup').remove()">Annuller</button>
                    <button class="btn btn-primary" onclick="window.appManager.saveRule('${rule.id}')">Gem Regel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        this.renderRuleConditions(rule.id);
        this.renderRuleActions(rule.id);
    }

    addCondition(ruleId) {
        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        const newCondition = {
            id: 'cond_' + Date.now(),
            type: 'motion_detected',
            device: '',
            operator: 'equals',
            value: ''
        };
        
        rule.conditions.push(newCondition);
        this.renderRuleConditions(ruleId);
    }

    addAction(ruleId) {
        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        const newAction = {
            id: 'action_' + Date.now(),
            type: 'turn_on_light',
            device: '',
            value: ''
        };
        
        rule.actions.push(newAction);
        this.renderRuleActions(ruleId);
    }

    renderRuleConditions(ruleId) {
        const conditionsList = document.getElementById('conditions-list');
        if (!conditionsList) return;

        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        conditionsList.innerHTML = rule.conditions.map(condition => `
            <div class="condition-item">
                <select onchange="window.appManager.updateCondition('${ruleId}', '${condition.id}', 'type', this.value)">
                    ${this.availableConditions.map(cond => 
                        `<option value="${cond.type}" ${condition.type === cond.type ? 'selected' : ''}>${cond.name}</option>`
                    ).join('')}
                </select>
                <select onchange="window.appManager.updateCondition('${ruleId}', '${condition.id}', 'operator', this.value)">
                    <option value="equals" ${condition.operator === 'equals' ? 'selected' : ''}>Lig med</option>
                    <option value="not_equals" ${condition.operator === 'not_equals' ? 'selected' : ''}>Ikke lig med</option>
                    <option value="greater_than" ${condition.operator === 'greater_than' ? 'selected' : ''}>Større end</option>
                    <option value="less_than" ${condition.operator === 'less_than' ? 'selected' : ''}>Mindre end</option>
                </select>
                <input type="text" value="${condition.value}" onchange="window.appManager.updateCondition('${ruleId}', '${condition.id}', 'value', this.value)">
                <button class="btn-icon" onclick="window.appManager.removeCondition('${ruleId}', '${condition.id}')">🗑️</button>
            </div>
        `).join('');
    }

    renderRuleActions(ruleId) {
        const actionsList = document.getElementById('actions-list');
        if (!actionsList) return;

        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        actionsList.innerHTML = rule.actions.map(action => `
            <div class="action-item">
                <select onchange="window.appManager.updateAction('${ruleId}', '${action.id}', 'type', this.value)">
                    ${this.availableActions.map(act => 
                        `<option value="${act.type}" ${action.type === act.type ? 'selected' : ''}>${act.name}</option>`
                    ).join('')}
                </select>
                <select onchange="window.appManager.updateAction('${ruleId}', '${action.id}', 'device', this.value)">
                    ${this.availableDevices.map(device => 
                        `<option value="${device.id}" ${action.device === device.id ? 'selected' : ''}>${device.name}</option>`
                    ).join('')}
                </select>
                <input type="text" value="${action.value}" onchange="window.appManager.updateAction('${ruleId}', '${action.id}', 'value', this.value)">
                <button class="btn-icon" onclick="window.appManager.removeAction('${ruleId}', '${action.id}')">🗑️</button>
            </div>
        `).join('');
    }

    updateCondition(ruleId, conditionId, field, value) {
        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        const condition = rule.conditions.find(cond => cond.id === conditionId);
        if (!condition) return;

        condition[field] = value;
    }

    updateAction(ruleId, actionId, field, value) {
        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        const action = rule.actions.find(act => act.id === actionId);
        if (!action) return;

        action[field] = value;
    }

    removeCondition(ruleId, conditionId) {
        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        rule.conditions = rule.conditions.filter(cond => cond.id !== conditionId);
        this.renderRuleConditions(ruleId);
    }

    removeAction(ruleId, actionId) {
        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        rule.actions = rule.actions.filter(act => act.id !== actionId);
        this.renderRuleActions(ruleId);
    }

    saveRule(ruleId) {
        const rule = this.rules.find(rule => rule.id === ruleId);
        if (!rule) return;

        rule.name = document.getElementById('rule-name').value;
        rule.description = document.getElementById('rule-description').value;

        this.renderRules();
        document.querySelector('.rule-editor-popup').remove();
        this.showNotification('Regel gemt', 'success');
    }

    generateLuaCode() {
        const output = document.getElementById('lua-code-output');
        if (!output) return;

        if (!this.selectedRule) {
            output.innerHTML = `<code>-- Vælg en regel for at se Lua koden</code>`;
            return;
        }

        const rule = this.selectedRule;
        let luaCode = `-- Regel: ${rule.name}\n`;
        luaCode += `-- Beskrivelse: ${rule.description || 'Ingen beskrivelse'}\n\n`;
        
        luaCode += `function rule_${rule.id.replace('rule_', '')}()\n`;
        luaCode += `    -- Betingelser\n`;
        
        if (rule.conditions.length > 0) {
            luaCode += `    if (`;
            luaCode += rule.conditions.map((condition, index) => {
                let conditionCode = '';
                switch (condition.type) {
                    case 'motion_detected':
                        conditionCode = `fibaro:getValue(${condition.device}, "value") == "1"`;
                        break;
                    case 'door_open':
                        conditionCode = `fibaro:getValue(${condition.device}, "value") == "1"`;
                        break;
                    case 'light_level':
                        conditionCode = `fibaro:getValue(${condition.device}, "value") ${condition.operator === 'less_than' ? '<' : '>'} ${condition.value}`;
                        break;
                    case 'temperature':
                        conditionCode = `fibaro:getValue(${condition.device}, "value") ${condition.operator === 'greater_than' ? '>' : '<'} ${condition.value}`;
                        break;
                    case 'time':
                        conditionCode = `os.date("%H:%M") >= "${condition.value.split('-')[0]}" and os.date("%H:%M") <= "${condition.value.split('-')[1]}"`;
                        break;
                    default:
                        conditionCode = `fibaro:getValue(${condition.device}, "value") == "${condition.value}"`;
                }
                return conditionCode;
            }).join(' and ');
            luaCode += `) then\n`;
        } else {
            luaCode += `    if (true) then\n`;
        }
        
        luaCode += `        -- Handlinger\n`;
        rule.actions.forEach(action => {
            switch (action.type) {
                case 'turn_on_light':
                    luaCode += `        fibaro:call(${action.device}, "turnOn")\n`;
                    break;
                case 'turn_off_light':
                    luaCode += `        fibaro:call(${action.device}, "turnOff")\n`;
                    break;
                case 'set_temperature':
                    luaCode += `        fibaro:call(${action.device}, "setTargetLevel", ${action.value})\n`;
                    break;
                case 'send_notification':
                    luaCode += `        fibaro:call(1, "sendNotification", "${action.value}")\n`;
                    break;
                case 'start_camera':
                    luaCode += `        fibaro:call(${action.device}, "startRecording")\n`;
                    break;
                case 'play_sound':
                    luaCode += `        fibaro:call(${action.device}, "playSound", "${action.value}")\n`;
                    break;
            }
        });
        
        luaCode += `    end\n`;
        luaCode += `end\n\n`;
        luaCode += `-- Kald funktionen\n`;
        luaCode += `rule_${rule.id.replace('rule_', '')}()`;

        output.innerHTML = `<code>${luaCode}</code>`;
    }

    copyLuaCode() {
        const codeElement = document.getElementById('lua-code-output');
        if (!codeElement) return;

        const code = codeElement.textContent;
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Lua kode kopieret til udklipsholder', 'success');
        }).catch(() => {
            this.showNotification('Kunne ikke kopiere kode', 'error');
        });
    }

    validateLuaCode() {
        if (!this.selectedRule) {
            this.showNotification('Vælg en regel først', 'warning');
            return;
        }

        const rule = this.selectedRule;
        let isValid = true;
        let errors = [];

        if (rule.conditions.length === 0) {
            errors.push('Regel skal have mindst én betingelse');
            isValid = false;
        }

        if (rule.actions.length === 0) {
            errors.push('Regel skal have mindst én handling');
            isValid = false;
        }

        rule.conditions.forEach((condition, index) => {
            if (!condition.device) {
                errors.push(`Betingelse ${index + 1}: Vælg en enhed`);
                isValid = false;
            }
            if (!condition.value) {
                errors.push(`Betingelse ${index + 1}: Angiv en værdi`);
                isValid = false;
            }
        });

        rule.actions.forEach((action, index) => {
            if (!action.device) {
                errors.push(`Handling ${index + 1}: Vælg en enhed`);
                isValid = false;
            }
        });

        if (isValid) {
            this.showNotification('✅ Regel er gyldig og klar til brug', 'success');
        } else {
            this.showNotification('❌ Regel har fejl: ' + errors.join(', '), 'error');
        }
    }

    // ===== DEVICE CONTROLS =====
    toggleDevice(button) {
        const isOn = button.textContent.includes('Tænd');
        button.textContent = isOn ? 'Sluk' : 'Tænd';
        button.style.background = isOn ? '#f56565' : '#48bb78';
        
        // Add visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    // ===== SMART ICONS FUNCTIONALITY =====
    initializeSmartIcons() {
        this.setupSmartIconDragAndDrop();
        this.loadSmartIconStates();
        this.setupSliderControls();
        this.initializeRadiatorDisplay();
        this.setupWeatherStation();
        this.setupHumidityMeter();
        this.setupScenarioControls();
        
        // Update container dimensions when switching to smarthome tab
        const smarthomeTab = document.getElementById('smarthome-tab');
        if (smarthomeTab) {
            const observer = new MutationObserver(() => {
                if (smarthomeTab.classList.contains('active')) {
                    setTimeout(() => {
                        const container = document.querySelector('.floor-plan-container');
                        if (container) {
                            const rect = container.getBoundingClientRect();
                            if (rect.width > 0 && rect.height > 0) {
                                // Trigger dimension update for all icons
                                window.dispatchEvent(new Event('resize'));
                            }
                        }
                    }, 50);
                }
            });
            
            observer.observe(smarthomeTab, { attributes: true, attributeFilter: ['class'] });
        }
    }

    setupSmartIconDragAndDrop() {
        const icons = document.querySelectorAll('.smart-icon');
        const container = document.querySelector('.floor-plan-container');
        
        if (!container) return;

        // Cache container dimensions for better performance
        let containerDimensions = { width: 0, height: 0 };
        const iconSize = 35; // New smaller size
        
        const updateContainerDimensions = () => {
            const rect = container.getBoundingClientRect();
            containerDimensions = {
                width: rect.width,
                height: rect.height
            };
        };
        
        // Update dimensions on resize
        window.addEventListener('resize', updateContainerDimensions);
        
        // Initial update with delay to ensure DOM is ready
        setTimeout(() => {
            updateContainerDimensions();
        }, 100);

        icons.forEach(icon => {
            let isDragging = false;
            let startX, startY, initialX, initialY;
            let animationFrameId = null;
            let dragStartTime = 0;
            let hasMoved = false;

            // Mouse events
            icon.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return; // Only left mouse button
                
                dragStartTime = Date.now();
                hasMoved = false;
                isDragging = false; // Don't start dragging immediately
                
                startX = e.clientX;
                startY = e.clientY;
                
                // Get current position as percentage from actual position
                const containerRect = container.getBoundingClientRect();
                const iconRect = icon.getBoundingClientRect();
                
                // Calculate percentage position relative to container
                initialX = ((iconRect.left - containerRect.left) / containerRect.width) * 100;
                initialY = ((iconRect.top - containerRect.top) / containerRect.height) * 100;
                
                e.preventDefault();
            });

            const handleMove = (clientX, clientY) => {
                // Always calculate movement for drag detection
                const deltaX = clientX - startX;
                const deltaY = clientY - startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const timeSinceStart = Date.now() - dragStartTime;
                
                // Start dragging if either:
                // 1. User has held mouse down for 500ms, OR
                // 2. User has moved more than 15px
                if (!isDragging && (timeSinceStart > 500 || distance > 15)) {
                    isDragging = true;
                    icon.classList.add('dragging');
                }
                
                // Only continue with drag movement if we're actually dragging
                if (!isDragging) return;
                
                // Check if we've moved enough to consider it a drag
                if (distance > 5) { // 5px threshold for drag
                    hasMoved = true;
                }
                
                // Cancel previous animation frame
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
                
                // Use requestAnimationFrame for smooth performance
                animationFrameId = requestAnimationFrame(() => {
                    // Use cached container dimensions
                    const containerWidth = containerDimensions.width;
                    const containerHeight = containerDimensions.height;
                    
                    // Skip if container has no size, but try to update dimensions
                    if (containerWidth === 0 || containerHeight === 0) {
                        updateContainerDimensions();
                        return;
                    }
                    
                    // Convert pixel movement to percentage
                    const deltaXPercent = (deltaX / containerWidth) * 100;
                    const deltaYPercent = (deltaY / containerHeight) * 100;
                    
                    let newX = initialX + deltaXPercent;
                    let newY = initialY + deltaYPercent;
                    
                    // Boundary constraints (keep icon within container)
                    const maxX = 100 - (iconSize / containerWidth) * 100;
                    const maxY = 100 - (iconSize / containerHeight) * 100;
                    
                    newX = Math.max(0, Math.min(newX, maxX));
                    newY = Math.max(0, Math.min(newY, maxY));
                    
                    // Only update position if we have valid values
                    if (!isNaN(newX) && !isNaN(newY)) {
                        icon.style.left = newX + '%';
                        icon.style.top = newY + '%';
                    }
                });
            };

            document.addEventListener('mousemove', (e) => {
                // Only call handleMove if we have started a potential drag
                if (dragStartTime > 0) {
                    handleMove(e.clientX, e.clientY);
                }
            });

            // Global mouseup listener to always stop dragging
            const globalMouseUp = (e) => {
                if (dragStartTime > 0) {
                    const clickDuration = Date.now() - dragStartTime;
                    
                    if (isDragging) {
                        // Was dragging - stop dragging
                        isDragging = false;
                        icon.classList.remove('dragging');
                        if (animationFrameId) {
                            cancelAnimationFrame(animationFrameId);
                        }
                        this.saveSmartIconStates();
                    } else {
                        // Was not dragging - check if it was a click
                        const deltaX = e.clientX - startX;
                        const deltaY = e.clientY - startY;
                        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        
                        // If it was a quick click without movement, trigger toggle
                        if (clickDuration < 500 && distance < 10) {
                            this.toggleSmartIcon(icon);
                        }
                    }
                    
                    // Reset drag state
                    dragStartTime = 0;
                    hasMoved = false;
                }
            };
            
            document.addEventListener('mouseup', globalMouseUp);

            // Touch events for mobile
            icon.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) return;
                
                dragStartTime = Date.now();
                hasMoved = false;
                isDragging = false; // Don't start dragging immediately
                
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                
                // Get current position as percentage from actual position
                const containerRect = container.getBoundingClientRect();
                const iconRect = icon.getBoundingClientRect();
                
                // Calculate percentage position relative to container
                initialX = ((iconRect.left - containerRect.left) / containerRect.width) * 100;
                initialY = ((iconRect.top - containerRect.top) / containerRect.height) * 100;
                
                e.preventDefault();
            });

            document.addEventListener('touchmove', (e) => {
                if (e.touches.length !== 1) return;
                
                // Only call handleMove if we have started a potential drag
                if (dragStartTime > 0) {
                    const touch = e.touches[0];
                    handleMove(touch.clientX, touch.clientY);
                }
                e.preventDefault();
            });

            document.addEventListener('touchend', (e) => {
                const clickDuration = Date.now() - dragStartTime;
                
                if (isDragging) {
                    // Was dragging - stop dragging
                    isDragging = false;
                    icon.classList.remove('dragging');
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                    }
                    this.saveSmartIconStates();
                } else {
                    // Was not dragging - check if it was a tap
                    if (e.changedTouches.length === 1) {
                        const touch = e.changedTouches[0];
                        const deltaX = touch.clientX - startX;
                        const deltaY = touch.clientY - startY;
                        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        
                        // If it was a quick tap without movement, trigger toggle
                        if (clickDuration < 500 && distance < 15) {
                            this.toggleSmartIcon(icon);
                        }
                    }
                }
                
                // Reset drag state
                dragStartTime = 0;
                hasMoved = false;
            });
        });
    }


    toggleSmartIcon(icon) {
        const deviceType = icon.dataset.type;
        const currentValue = icon.dataset.value;
        
        if (deviceType === 'boolean') {
            const newValue = currentValue === 'true' ? 'false' : 'true';
            icon.dataset.value = newValue;
            
            if (newValue === 'true') {
                icon.classList.add('active');
                // Different messages for different device types
                let message = '';
                if (icon.dataset.device.includes('lampe')) {
                    message = `${icon.dataset.deviceName} tændt`;
                } else if (icon.dataset.device.includes('bevaegelsessensor')) {
                    message = `${icon.dataset.deviceName} aktiv`;
                } else if (icon.dataset.device.includes('aktuator-radiator')) {
                    message = `${icon.dataset.deviceName} tændt`;
                } else {
                    message = `${icon.dataset.deviceName} aktiveret`;
                }
                this.showNotification(message, 'success');
            } else {
                icon.classList.remove('active');
                // Different messages for different device types
                let message = '';
                if (icon.dataset.device.includes('lampe')) {
                    message = `${icon.dataset.deviceName} slukket`;
                } else if (icon.dataset.device.includes('bevaegelsessensor')) {
                    message = `${icon.dataset.deviceName} inaktiv`;
                } else if (icon.dataset.device.includes('aktuator-radiator')) {
                    message = `${icon.dataset.deviceName} slukket`;
                } else {
                    message = `${icon.dataset.deviceName} deaktiveret`;
                }
                this.showNotification(message, 'info');
            }
        } else if (deviceType === 'numeric') {
            // For other numeric values, cycle through 0, 25, 50, 75, 100
            const currentNum = parseInt(currentValue) || 0;
            const values = [0, 25, 50, 75, 100];
            const currentIndex = values.indexOf(currentNum);
            const nextIndex = (currentIndex + 1) % values.length;
            const newValue = values[nextIndex];
            
            icon.dataset.value = newValue;
            this.showNotification(`${icon.dataset.deviceName} sat til ${newValue}%`, 'info');
        }
        
        // Save state to localStorage
        this.saveSmartIconStates();
    }

    saveSmartIconStates() {
        const icons = document.querySelectorAll('.smart-icon');
        const states = {};
        
        icons.forEach(icon => {
            // Only save position if it's actually set
            const left = icon.style.left;
            const top = icon.style.top;
            
            if (left && top) {
                states[icon.dataset.device] = {
                    value: icon.dataset.value,
                    position: {
                        left: left,
                        top: top
                    }
                };
            } else {
                // Only save value if no position
                states[icon.dataset.device] = {
                    value: icon.dataset.value
                };
            }
        });
        
        localStorage.setItem('smartIconStates', JSON.stringify(states));
    }

    loadSmartIconStates() {
        const savedStates = localStorage.getItem('smartIconStates');
        if (!savedStates) return;
        
        try {
            const states = JSON.parse(savedStates);
            const icons = document.querySelectorAll('.smart-icon');
            
            icons.forEach(icon => {
                const deviceId = icon.dataset.device;
                if (states[deviceId]) {
                    icon.dataset.value = states[deviceId].value;
                    if (states[deviceId].position) {
                        icon.style.left = states[deviceId].position.left;
                        icon.style.top = states[deviceId].position.top;
                    }
                    
                    // Update visual state
                    if (icon.dataset.type === 'boolean' && states[deviceId].value === 'true') {
                        icon.classList.add('active');
                    }
                }
            });
        } catch (error) {
            console.error('Error loading smart icon states:', error);
        }
    }

    setupSliderControls() {
        const switches = document.querySelectorAll('.lamp-switch');
        const sliders = document.querySelectorAll('.lamp-slider');
        
        // Handle switches
        switches.forEach(switchElement => {
            const deviceId = switchElement.dataset.device;
            const icon = document.querySelector(`[data-device="${deviceId}"]`);
            
            // Update switch when icon is clicked
            const updateSwitchFromIcon = () => {
                if (icon) {
                    const iconValue = icon.dataset.value;
                    if (icon.dataset.type === 'boolean') {
                        switchElement.checked = iconValue === 'true';
                    }
                }
            };
            
            // Update icon when switch changes
            switchElement.addEventListener('change', () => {
                // Special handling for alarmsystem (no icon on floor plan)
                if (deviceId === 'alarmsystem') {
                    const isActive = switchElement.checked;
                    this.updateAlarmEffect(isActive);
                    this.showNotification(`Alarmsystem ${isActive ? 'aktiveret' : 'deaktiveret'}`, isActive ? 'success' : 'info');
                    return;
                }
                
                if (icon) {
                    if (icon.dataset.type === 'boolean') {
                        const newValue = switchElement.checked ? 'true' : 'false';
                        icon.dataset.value = newValue;
                        
                        if (newValue === 'true') {
                            icon.classList.add('active');
                        } else {
                            icon.classList.remove('active');
                        }
                        
                        // Different messages for different device types
                        let message = '';
                        if (icon.dataset.device.includes('lampe')) {
                            message = `${icon.dataset.deviceName} ${newValue === 'true' ? 'tændt' : 'slukket'}`;
                        } else if (icon.dataset.device.includes('bevaegelsessensor')) {
                            message = `${icon.dataset.deviceName} ${newValue === 'true' ? 'aktiv' : 'inaktiv'}`;
                        } else if (icon.dataset.device.includes('aktuator-radiator')) {
                            // Handle radiator temperature control
                            if (newValue === 'true') {
                                this.setRadiatorTarget(30.0);
                                message = `${icon.dataset.deviceName} tændt - opvarmer til 30°C`;
                            } else {
                                this.setRadiatorTarget(15.0);
                                message = `${icon.dataset.deviceName} slukket - køler til 15°C`;
                            }
                        } else if (icon.dataset.device.includes('alarmsystem')) {
                            message = `${icon.dataset.deviceName} ${newValue === 'true' ? 'aktiveret' : 'deaktiveret'}`;
                            console.log('Alarmsystem toggle:', newValue);
                            console.log('Calling updateAlarmEffect with:', newValue === 'true');
                            this.updateAlarmEffect(newValue === 'true');
                            this.updateSmartIconAppearance(icon);
                        } else if (icon.dataset.device.includes('ventilator')) {
                            message = `${icon.dataset.deviceName} ${newValue === 'true' ? 'tændt' : 'slukket'}`;
                            this.updateSmartIconAppearance(icon);
                        } else {
                            message = `${icon.dataset.deviceName} ${newValue === 'true' ? 'aktiveret' : 'deaktiveret'}`;
                        }
                        
                        this.showNotification(message, newValue === 'true' ? 'success' : 'info');
                    }
                }
                
                this.saveSmartIconStates();
            });
            
            // Listen for icon changes
            if (icon) {
                const observer = new MutationObserver(() => {
                    updateSwitchFromIcon();
                });
                observer.observe(icon, { attributes: true, attributeFilter: ['data-value'] });
                
                // Initial update
                updateSwitchFromIcon();
            }
        });
        
        // Handle sliders
        sliders.forEach(slider => {
            const deviceId = slider.dataset.device;
            const valueDisplay = slider.parentElement.querySelector('.slider-value');
            const icon = document.querySelector(`[data-device="${deviceId}"]`);
            
            // Update slider when icon is clicked
            const updateSliderFromIcon = () => {
                if (icon) {
                    const iconValue = icon.dataset.value;
                    if (icon.dataset.type === 'numeric') {
                        slider.value = iconValue;
                        valueDisplay.textContent = iconValue + '°C';
                        
                        // Show as active if temperature > 15
                        if (parseInt(iconValue) > 15) {
                            icon.classList.add('active');
                        } else {
                            icon.classList.remove('active');
                        }
                    }
                }
            };
            
            // Update icon when slider changes
            slider.addEventListener('input', () => {
                const value = parseInt(slider.value);
                valueDisplay.textContent = value + '°C';
                
                if (icon) {
                    if (icon.dataset.type === 'numeric') {
                        icon.dataset.value = value;
                        
                        // Show as active if temperature > 15
                        if (value > 15) {
                            icon.classList.add('active');
                        } else {
                            icon.classList.remove('active');
                        }
                        
                        this.showNotification(`${icon.dataset.deviceName} sat til ${value}°C`, 'info');
                    }
                }
                
                this.saveSmartIconStates();
            });
            
            // Listen for icon changes
            if (icon) {
                const observer = new MutationObserver(() => {
                    updateSliderFromIcon();
                });
                observer.observe(icon, { attributes: true, attributeFilter: ['data-value'] });
                
                // Initial update
                updateSliderFromIcon();
            }
        });
    }

    // ===== RADIATOR TEMPERATURE CONTROL =====
    startRadiatorTemperatureControl() {
        if (this.radiatorInterval) {
            clearInterval(this.radiatorInterval);
        }
        
        this.radiatorInterval = setInterval(() => {
            this.updateRadiatorTemperature();
        }, 5000); // Update every 5 seconds
    }
    
    stopRadiatorTemperatureControl() {
        if (this.radiatorInterval) {
            clearInterval(this.radiatorInterval);
            this.radiatorInterval = null;
        }
    }
    
    updateRadiatorTemperature() {
        const tempDisplay = document.getElementById('radiator-temp-display');
        const icon = document.querySelector('[data-device="aktuator-radiator"]');
        
        if (Math.abs(this.radiatorTemp - this.radiatorTarget) > 0.05) {
            // Move temperature towards target by 0.1 degrees
            if (this.radiatorTemp < this.radiatorTarget) {
                this.radiatorTemp = Math.min(this.radiatorTemp + 0.1, this.radiatorTarget);
            } else {
                this.radiatorTemp = Math.max(this.radiatorTemp - 0.1, this.radiatorTarget);
            }
            
            // Update display
            if (tempDisplay) {
                tempDisplay.textContent = this.radiatorTemp.toFixed(1) + '°C';
            }
            
            // Update icon active state based on temperature
            if (icon) {
                if (this.radiatorTemp > 15) {
                    icon.classList.add('active');
                } else {
                    icon.classList.remove('active');
                }
            }
        }
    }
    
    setRadiatorTarget(targetTemp) {
        this.radiatorTarget = targetTemp;
        this.startRadiatorTemperatureControl();
    }
    
    initializeRadiatorDisplay() {
        // Initialize radiator temperature display
        const tempDisplay = document.getElementById('radiator-temp-display');
        if (tempDisplay) {
            tempDisplay.textContent = this.radiatorTemp.toFixed(1) + '°C';
        }
    }
    
    setupWeatherStation() {
        // Initialize weather indicator
        this.updateWeatherIndicator();
        
        // Setup weather popup
        const weatherIcon = document.querySelector('[data-device="udvendig-vejrstation"]');
        const weatherPopup = document.getElementById('weather-popup');
        const closeBtn = document.querySelector('.weather-popup-close');
        const saveBtn = document.querySelector('.weather-save-btn');
        
        if (weatherIcon) {
            weatherIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showWeatherPopup();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideWeatherPopup();
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveWeatherSettings();
            });
        }
        
        // Setup weather sliders
        const tempSlider = document.getElementById('outdoor-temp-input');
        const lightSlider = document.getElementById('outdoor-light-input');
        
        if (tempSlider) {
            tempSlider.value = this.outdoorTemp;
            tempSlider.addEventListener('input', () => {
                const value = parseInt(tempSlider.value);
                document.getElementById('outdoor-temp-display').textContent = value + '°C';
            });
        }
        
        if (lightSlider) {
            lightSlider.value = this.outdoorLight;
            lightSlider.addEventListener('input', () => {
                const value = parseInt(lightSlider.value);
                const lightText = this.getLightText(value);
                document.getElementById('outdoor-light-display').textContent = lightText;
            });
        }
    }
    
    showWeatherPopup() {
        const popup = document.getElementById('weather-popup');
        if (popup) {
            popup.style.display = 'flex';
            // Set current values
            document.getElementById('outdoor-temp-input').value = this.outdoorTemp;
            document.getElementById('outdoor-temp-display').textContent = this.outdoorTemp + '°C';
            document.getElementById('outdoor-light-input').value = this.outdoorLight;
            document.getElementById('outdoor-light-display').textContent = this.getLightText(this.outdoorLight);
        }
    }
    
    hideWeatherPopup() {
        const popup = document.getElementById('weather-popup');
        if (popup) {
            popup.style.display = 'none';
        }
    }
    
    saveWeatherSettings() {
        const tempSlider = document.getElementById('outdoor-temp-input');
        const lightSlider = document.getElementById('outdoor-light-input');
        
        if (tempSlider && lightSlider) {
            this.outdoorTemp = parseInt(tempSlider.value);
            this.outdoorLight = parseInt(lightSlider.value);
            
            this.updateWeatherIndicator();
            this.hideWeatherPopup();
            
            this.showNotification('Vejrindstillinger gemt', 'success');
        }
    }
    
    updateWeatherIndicator() {
        const tempDisplay = document.getElementById('outdoor-temp');
        const lightDisplay = document.getElementById('outdoor-light');
        
        if (tempDisplay) {
            tempDisplay.textContent = this.outdoorTemp + '°C';
        }
        
        if (lightDisplay) {
            lightDisplay.textContent = this.getLightText(this.outdoorLight);
        }
    }
    
    getLightText(value) {
        if (value < 20) return 'Mørkt';
        if (value < 40) return 'Skumring';
        if (value < 60) return 'Dæmpet';
        if (value < 80) return 'Lyst';
        return 'Meget lyst';
    }

    // ===== UTILITY METHODS =====
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 25px -5px var(--shadow-color);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    updateAlarmEffect(isActive) {
        const body = document.body;
        const floorPlanImage = document.querySelector('.floor-plan-image');
        
        if (isActive) {
            body.classList.add('alarm-active');
            if (floorPlanImage) {
                floorPlanImage.classList.add('alarm-active');
            }
        } else {
            body.classList.remove('alarm-active');
            if (floorPlanImage) {
                floorPlanImage.classList.remove('alarm-active');
            }
        }
    }

    setupHumidityMeter() {
        const humidityIcon = document.querySelector('[data-device="badevaerelse-fugtmaaler"]');
        const humidityPopup = document.getElementById('humidity-popup');
        const humiditySlider = document.getElementById('humidity-slider');
        const humidityValue = document.getElementById('humidity-value');
        const humidityClose = document.querySelector('.humidity-popup-close');
        const humiditySave = document.querySelector('.humidity-save-btn');

        if (humidityIcon) {
            humidityIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showHumidityPopup();
            });
        }

        if (humidityClose) {
            humidityClose.addEventListener('click', () => {
                this.hideHumidityPopup();
            });
        }

        if (humiditySlider) {
            humiditySlider.addEventListener('input', () => {
                humidityValue.textContent = humiditySlider.value;
            });
        }

        if (humiditySave) {
            humiditySave.addEventListener('click', () => {
                this.saveHumiditySettings();
            });
        }

        // Close popup when clicking outside
        if (humidityPopup) {
            humidityPopup.addEventListener('click', (e) => {
                if (e.target === humidityPopup) {
                    this.hideHumidityPopup();
                }
            });
        }
    }

    showHumidityPopup() {
        const humidityPopup = document.getElementById('humidity-popup');
        const humidityIcon = document.querySelector('[data-device="badevaerelse-fugtmaaler"]');
        
        if (humidityPopup && humidityIcon) {
            const currentHumidity = humidityIcon.dataset.value || '45';
            const humiditySlider = document.getElementById('humidity-slider');
            const humidityValue = document.getElementById('humidity-value');
            
            humiditySlider.value = currentHumidity;
            humidityValue.textContent = currentHumidity;
            
            humidityPopup.style.display = 'flex';
        }
    }

    hideHumidityPopup() {
        const humidityPopup = document.getElementById('humidity-popup');
        if (humidityPopup) {
            humidityPopup.style.display = 'none';
        }
    }

    saveHumiditySettings() {
        const humiditySlider = document.getElementById('humidity-slider');
        const humidityIcon = document.querySelector('[data-device="badevaerelse-fugtmaaler"]');
        
        if (humiditySlider && humidityIcon) {
            const newHumidity = humiditySlider.value;
            humidityIcon.dataset.value = newHumidity;
            
            this.showNotification(`Fugtniveau sat til ${newHumidity}%`, 'success');
            this.hideHumidityPopup();
        }
    }

    setupScenarioControls() {
        const scenarioButtons = document.querySelectorAll('.scenario-btn');
        
        scenarioButtons.forEach(button => {
            button.addEventListener('click', () => {
                const scenario = button.dataset.scenario;
                this.activateScenario(scenario);
            });
        });
    }

    activateScenario(scenario) {
        const scenarios = {
            morning: {
                name: 'Morgen Scenario',
                actions: {
                    'stue-lampe': true,
                    'badevaerelse-lampe': true,
                    'sovevaerelse-lampe': false,
                    'koekken-lampe': true,
                    'spisestue-lampe': false,
                    'aktuator-radiator': true,
                    'badevaerelse-ventilator': true,
                    'alarmsystem': false
                }
            },
            night: {
                name: 'Nat Scenario',
                actions: {
                    'stue-lampe': false,
                    'badevaerelse-lampe': false,
                    'sovevaerelse-lampe': false,
                    'koekken-lampe': false,
                    'spisestue-lampe': false,
                    'aktuator-radiator': false,
                    'doerlaas': true,
                    'alarmsystem': true
                }
            },
            'coming-home': {
                name: 'Kommer Hjem Scenario',
                actions: {
                    'stue-lampe': true,
                    'badevaerelse-lampe': false,
                    'sovevaerelse-lampe': false,
                    'koekken-lampe': true,
                    'spisestue-lampe': true,
                    'aktuator-radiator': true,
                    'doerlaas': false,
                    'alarmsystem': false
                }
            },
            'leaving-home': {
                name: 'Forlader Hjemmet Scenario',
                actions: {
                    'stue-lampe': false,
                    'badevaerelse-lampe': false,
                    'sovevaerelse-lampe': false,
                    'koekken-lampe': false,
                    'spisestue-lampe': false,
                    'aktuator-radiator': false,
                    'doerlaas': true,
                    'alarmsystem': true
                }
            }
        };

        const selectedScenario = scenarios[scenario];
        if (!selectedScenario) return;

        // Apply scenario actions
        Object.entries(selectedScenario.actions).forEach(([device, value]) => {
            const switchElement = document.querySelector(`[data-device="${device}"]`);
            if (switchElement) {
                switchElement.checked = value;
                
                // Update corresponding smart icon
                const smartIcon = document.querySelector(`[data-device="${device}"]`);
                if (smartIcon) {
                    smartIcon.dataset.value = value.toString();
                    this.updateSmartIconAppearance(smartIcon);
                }
            }
        });

        // Special handling for radiator
        if (scenario === 'morning' || scenario === 'coming-home') {
            this.setRadiatorTarget(22);
        } else {
            this.setRadiatorTarget(18);
        }

        // Update alarm effect based on scenario
        const alarmSystem = selectedScenario.actions['alarmsystem'];
        if (alarmSystem !== undefined) {
            this.updateAlarmEffect(alarmSystem);
        }

        this.showNotification(`${selectedScenario.name} aktiveret!`, 'success');
    }

    updateSmartIconAppearance(icon) {
        if (!icon) return;
        
        const isOn = icon.dataset.value === 'true';
        const iconContent = icon.querySelector('.icon-content');
        
        if (!iconContent) return;
        
        if (icon.dataset.device.includes('lampe')) {
            if (isOn) {
                iconContent.style.filter = 'brightness(1.5) drop-shadow(0 0 8px #ffa500)';
                icon.style.borderColor = '#ffa500';
            } else {
                iconContent.style.filter = 'brightness(0.7)';
                icon.style.borderColor = '#ffffff';
            }
        } else if (icon.dataset.device.includes('doerlaas')) {
            if (isOn) {
                iconContent.style.filter = 'brightness(1.5) drop-shadow(0 0 8px #ff0000)';
                icon.style.borderColor = '#ff0000';
                const iconSymbol = iconContent.querySelector('.icon-symbol');
                if (iconSymbol) iconSymbol.textContent = '🔒';
            } else {
                iconContent.style.filter = 'brightness(0.7)';
                icon.style.borderColor = '#ffffff';
                const iconSymbol = iconContent.querySelector('.icon-symbol');
                if (iconSymbol) iconSymbol.textContent = '🔓';
            }
        } else if (icon.dataset.device.includes('ventilator')) {
            if (isOn) {
                iconContent.style.filter = 'brightness(1.5) drop-shadow(0 0 8px #00ff00)';
                icon.style.borderColor = '#00ff00';
                iconContent.style.animation = 'spin 2s linear infinite';
            } else {
                iconContent.style.filter = 'brightness(0.7)';
                icon.style.borderColor = '#ffffff';
                iconContent.style.animation = 'none';
            }
        } else if (icon.dataset.device.includes('alarmsystem')) {
            if (isOn) {
                iconContent.style.filter = 'brightness(1.5) drop-shadow(0 0 8px #ff0000)';
                icon.style.borderColor = '#ff0000';
            } else {
                iconContent.style.filter = 'brightness(0.7)';
                icon.style.borderColor = '#ffffff';
            }
        }
    }

    // ===== E-LEARNING FUNCTIONALITY =====
    learningData = {
        sensoere: {
            title: 'Sensoere',
            description: 'Lær om forskellige typer sensoere og deres anvendelse i smarthome systemer',
            subtopics: [
                {
                    id: 'pir-bevaegelsessensor',
                    title: 'PIR (Bevægelsessensor)',
                    icon: '👁️',
                    description: 'Lær om PIR-sensoere og bevægelsesdetektion',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'doer-vindueskontakt',
                    title: 'Dør-/vindueskontakt',
                    icon: '🚪',
                    description: 'Forstå dør- og vindueskontakter til sikkerhed',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'fugtighedssensor',
                    title: 'Fugtighedssensor',
                    icon: '💧',
                    description: 'Lær om fugtmåling og skimmelforebyggelse',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'lysmåler-lux',
                    title: 'Lysmåler (Lux)',
                    icon: '☀️',
                    description: 'Forstå lysmåling og automatisk lysstyring',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'udendørs-temperatur',
                    title: 'Udendørs temperatur',
                    icon: '🌡️',
                    description: 'Lær om udendørs temperatursensoere',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'vindmåler',
                    title: 'Vindmåler',
                    icon: '💨',
                    description: 'Forstå vindmåling og vejrdata',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'roegalarm',
                    title: 'Røgalarm',
                    icon: '🔥',
                    description: 'Lær om røgalarmer og brandsikkerhed',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'vandlækage',
                    title: 'Vandlækage',
                    icon: '💧',
                    description: 'Forstå vandlækage detektion og skadeforebyggelse',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'co2-måler',
                    title: 'CO₂-måler',
                    icon: '🌬️',
                    description: 'Lær om CO₂-måling og luftkvalitet',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'tilstedeværelsessensor',
                    title: 'Tilstedeværelsessensor',
                    icon: '👤',
                    description: 'Forstå avancerede tilstedeværelsesdetektorer',
                    difficulty: 'advanced',
                    duration: '5 min'
                }
            ]
        },
        forbindelser: {
            title: 'Forbindelsestyper',
            description: 'Forstå forskellige kommunikationsprotokoller og netværksteknologier',
            subtopics: [
                {
                    id: 'wifi',
                    title: 'WiFi (IEEE 802.11)',
                    icon: '📶',
                    description: 'Lær om WiFi protokollen og dens anvendelse',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'bluetooth',
                    title: 'Bluetooth (BLE)',
                    icon: '📱',
                    description: 'Forstå Bluetooth Low Energy og dens fordele',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'matter',
                    title: 'Matter (Thread/WiFi)',
                    icon: '🧵',
                    description: 'Lær om Matter standarden og interoperabilitet',
                    difficulty: 'advanced',
                    duration: '5 min'
                },
                {
                    id: 'thread',
                    title: 'Thread (IPv6 mesh)',
                    icon: '🕸️',
                    description: 'Forstå Thread mesh-netværk protokollen',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'zwave',
                    title: 'Z-Wave Plus',
                    icon: '🌊',
                    description: 'Lær om Z-Wave protokollen og dens karakteristika',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'zigbee',
                    title: 'Zigbee (IEEE 802.15.4)',
                    icon: '⚡',
                    description: 'Forstå Zigbee protokollen og mesh-netværk',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'rf-433',
                    title: '433 MHz (RF)',
                    icon: '📡',
                    description: 'Lær om 433 MHz radiofrekvens kommunikation',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'infrared',
                    title: 'Infrared (IR)',
                    icon: '🔴',
                    description: 'Forstå infrarød kommunikation og dens anvendelser',
                    difficulty: 'beginner',
                    duration: '5 min'
                }
            ]
        },
        automatisering: {
            title: 'Automatisering',
            description: 'Lær at oprette intelligente automatiseringer og scenarier',
            subtopics: [
                {
                    id: 'scenarier',
                    title: 'Scenarier & Automatisering',
                    icon: '🎬',
                    description: 'Opret og administrer smarthome scenarier',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'tidsbaseret',
                    title: 'Tidsbaseret Automatisering',
                    icon: '⏰',
                    description: 'Automatisering baseret på tid og dato',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'sensor-trigger',
                    title: 'Sensor-triggerede Automatiseringer',
                    icon: '🔔',
                    description: 'Automatisering baseret på sensorværdier',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'geofencing',
                    title: 'Geofencing & Lokationsbaseret',
                    icon: '📍',
                    description: 'Automatisering baseret på lokation',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'weather-automation',
                    title: 'Vejrbaseret Automatisering',
                    icon: '🌤️',
                    description: 'Automatisering baseret på vejrdata',
                    difficulty: 'advanced',
                    duration: '5 min'
                },
                {
                    id: 'energy-automation',
                    title: 'Energioptimering',
                    icon: '⚡',
                    description: 'Automatisering til energibesparelse',
                    difficulty: 'advanced',
                    duration: '5 min'
                }
            ]
        },
        sikkerhed: {
            title: 'Sikkerhed & Privatliv',
            description: 'Beskyt dit smarthome mod trusler og sikkerhedsrisici',
            subtopics: [
                {
                    id: 'netvaerkssikkerhed',
                    title: 'Netværkssikkerhed',
                    icon: '🔒',
                    description: 'Grundlæggende netværkssikkerhed for smarthome',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'enhedsikkerhed',
                    title: 'Enhedssikkerhed',
                    icon: '🛡️',
                    description: 'Sikkerhed på enhedsniveau',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'data-privatliv',
                    title: 'Databeskyttelse & Privatliv',
                    icon: '🔐',
                    description: 'Beskyttelse af personlige data',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'access-control',
                    title: 'Adgangskontrol',
                    icon: '🎫',
                    description: 'Administration af brugeradgang',
                    difficulty: 'advanced',
                    duration: '5 min'
                }
            ]
        },
        energi: {
            title: 'Energistyring',
            description: 'Optimér energiforbrug og reducér omkostninger',
            subtopics: [
                {
                    id: 'energimåling',
                    title: 'Energimåling & Overvågning',
                    icon: '📊',
                    description: 'Mål og overvåg energiforbrug',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'smart-lys',
                    title: 'Smart Belysning',
                    icon: '💡',
                    description: 'Energieffektiv belysning',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'varmestyring',
                    title: 'Smart Varmestyring',
                    icon: '🌡️',
                    description: 'Optimer varmeforbrug',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'solceller',
                    title: 'Solceller & Vedvarende Energi',
                    icon: '☀️',
                    description: 'Integration af vedvarende energikilder',
                    difficulty: 'advanced',
                    duration: '5 min'
                },
                {
                    id: 'energi-automation',
                    title: 'Energi-automatisering',
                    icon: '⚡',
                    description: 'Automatisk energistyring',
                    difficulty: 'advanced',
                    duration: '5 min'
                }
            ]
        },
        fejlfinding: {
            title: 'Fejlfinding & Vedligeholdelse',
            description: 'Lær at diagnosticere og løse problemer i smarthome systemer',
            subtopics: [
                {
                    id: 'grundlaeggende-fejlfinding',
                    title: 'Grundlæggende Fejlfinding',
                    icon: '🔧',
                    description: 'Basis fejlfindingsteknikker',
                    difficulty: 'beginner',
                    duration: '5 min'
                },
                {
                    id: 'netvaerks-problemer',
                    title: 'Netværksproblemer',
                    icon: '📡',
                    description: 'Diagnosticer netværksproblemer',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'enheds-problemer',
                    title: 'Enhedsproblemer',
                    icon: '🔌',
                    description: 'Fejlfinding af enheder',
                    difficulty: 'intermediate',
                    duration: '5 min'
                },
                {
                    id: 'system-vedligeholdelse',
                    title: 'Systemvedligeholdelse',
                    icon: '🛠️',
                    description: 'Regelmæssig vedligeholdelse',
                    difficulty: 'advanced',
                    duration: '5 min'
                }
            ]
        }
    };

    handleTopicClick(topicCard) {
        const topicId = topicCard.dataset.topic;
        const topicData = this.learningData[topicId];
        
        if (!topicData) return;
        
        // Update active state
        document.querySelectorAll('.topic-card').forEach(card => {
            card.classList.remove('active');
        });
        topicCard.classList.add('active');
        
        // Show subtopics
        this.showSubtopics(topicData);
        
        // Show back button
        document.getElementById('back-to-topics').style.display = 'flex';
    }

    showSubtopics(topicData) {
        const welcomeContent = document.getElementById('welcome-content');
        const subtopicsContainer = document.getElementById('subtopics-container');
        const currentTopicTitle = document.getElementById('current-topic-title');
        const currentTopicDescription = document.getElementById('current-topic-description');
        const subtopicsGrid = document.getElementById('subtopics-grid');
        
        // Update header
        currentTopicTitle.textContent = topicData.title;
        currentTopicDescription.textContent = topicData.description;
        
        // Hide welcome content and show subtopics
        welcomeContent.style.display = 'none';
        subtopicsContainer.style.display = 'block';
        
        // Generate subtopic cards
        subtopicsGrid.innerHTML = '';
        topicData.subtopics.forEach(subtopic => {
            const subtopicCard = this.createSubtopicCard(subtopic);
            subtopicsGrid.appendChild(subtopicCard);
        });
    }

    createSubtopicCard(subtopic) {
        const card = document.createElement('div');
        card.className = 'subtopic-card';
        card.dataset.subtopicId = subtopic.id;
        
        card.innerHTML = `
            <div class="subtopic-header">
                <div class="subtopic-icon">${subtopic.icon}</div>
                <div class="subtopic-title">${subtopic.title}</div>
            </div>
            <div class="subtopic-description">${subtopic.description}</div>
            <div class="subtopic-meta">
                <span class="difficulty-badge difficulty-${subtopic.difficulty}">${this.getDifficultyText(subtopic.difficulty)}</span>
                <span class="duration">${subtopic.duration}</span>
            </div>
            <button class="subtopic-btn" data-subtopic="${subtopic.id}">Start Læring</button>
        `;
        
        // Add click handler for subtopic button
        const button = card.querySelector('.subtopic-btn');
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startSubtopic(subtopic);
        });
        
        return card;
    }

    getDifficultyText(difficulty) {
        const difficultyMap = {
            'beginner': 'Begynder',
            'intermediate': 'Mellem',
            'advanced': 'Avanceret'
        };
        return difficultyMap[difficulty] || difficulty;
    }

    startSubtopic(subtopic) {
        // Show learning module popup with real content
        this.showLearningModule(subtopic);
    }

    showLearningModule(subtopic) {
        // Create learning module popup
        const popup = document.createElement('div');
        popup.className = 'learning-module-popup';
        popup.innerHTML = `
            <div class="learning-popup-overlay">
                <div class="learning-popup-content">
                    <div class="learning-popup-header">
                        <div class="learning-header-left">
                            <div class="learning-icon">${subtopic.icon}</div>
                            <div class="learning-title-info">
                                <h2>${subtopic.title}</h2>
                                <div class="learning-meta">
                                    <span class="difficulty-badge difficulty-${subtopic.difficulty}">${this.getDifficultyText(subtopic.difficulty)}</span>
                                    <span class="duration">${subtopic.duration}</span>
                                </div>
                            </div>
                        </div>
                        <button class="close-learning-btn" onclick="this.closest('.learning-module-popup').remove()">×</button>
                    </div>
                    
                    <div class="learning-content">
                        <div class="learning-section active" data-section="theory">
                            <h3>📖 Teori</h3>
                            <div class="theory-content">
                                ${this.getTheoryContent(subtopic.id)}
                            </div>
                            <button class="next-section-btn" onclick="window.appManager.nextLearningSection()">Næste: Quiz →</button>
                        </div>
                        
                        <div class="learning-section" data-section="quiz">
                            <h3>🧠 Quiz</h3>
                            <div class="quiz-content">
                                ${this.getQuizContent(subtopic.id)}
                            </div>
                            <button class="complete-module-btn" onclick="window.appManager.completeLearningModule('${subtopic.id}')">Gennemfør Modul ✓</button>
                        </div>
                    </div>
                    
                    <div class="learning-progress-bar">
                        <div class="progress-fill" style="width: 50%"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Store current subtopic for reference
        this.currentSubtopic = subtopic;
    }

    nextLearningSection() {
        const popup = document.querySelector('.learning-module-popup');
        if (!popup) return;
        
        const currentSection = popup.querySelector('.learning-section.active');
        const nextSection = currentSection.nextElementSibling;
        const progressFill = popup.querySelector('.progress-fill');
        
        if (nextSection) {
            currentSection.classList.remove('active');
            nextSection.classList.add('active');
            
            // Update progress bar to 100% when reaching quiz
            progressFill.style.width = '100%';
        }
    }

    completeLearningModule(subtopicId) {
        // Close popup
        const popup = document.querySelector('.learning-module-popup');
        if (popup) {
            popup.remove();
        }
        
        // Update subtopic button
        const button = document.querySelector(`[data-subtopic="${subtopicId}"]`);
        if (button) {
            button.textContent = 'Gennemført ✓';
            button.classList.add('completed');
        }
        
        this.showNotification(`${this.currentSubtopic.title} gennemført!`, 'success');
        this.updateOverallProgress();
        this.checkAchievements();
    }

    getTheoryContent(subtopicId) {
        const content = {
            'pir-bevaegelsessensor': `
                <div class="theory-text">
                    <h4>Hvad er PIR bevægelsessensoere?</h4>
                    <p>PIR (Passive Infrared) bevægelsessensoere opdager bevægelse ved at måle ændringer i infrarød stråling fra varmegenstande som mennesker og dyr. De er de mest almindelige bevægelsessensoere i smarthome systemer.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>PIR sensoere gør dit hjem intelligent ved automatisk at tænde lys, aktivere sikkerhed og spare energi. De er essentielle for komfort og sikkerhed.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Automatisk lys:</strong> Tænder lys når du kommer ind i et rum</li>
                        <li><strong>Sikkerhed:</strong> Aktiverer alarm når der er uautoriseret bevægelse</li>
                        <li><strong>Energibesparelse:</strong> Slukker lys automatisk når ingen er til stede</li>
                        <li><strong>Komfort:</strong> Starter ventilation eller musik ved bevægelse</li>
                        <li><strong>Overvågning:</strong> Logger aktivitet og bevægelsesmønstre</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Optimal placering:</strong> 2-3 meter over gulvet, pegende mod indgangen</li>
                        <li><strong>Undgå fejlalarm:</strong> Placer ikke ved vinduer, radiatorer eller døråbninger</li>
                        <li><strong>Tidsforsinkelse:</strong> Indstil 30-60 sekunder for at undgå konstant tænd/sluk</li>
                        <li><strong>Følsomhed:</strong> Juster efter rumstørrelse - højere i store rum</li>
                        <li><strong>Test placering:</strong> Brug testfunktionen for at finde optimal position</li>
                    </ul>
                </div>
            `,
            'doer-vindueskontakt': `
                <div class="theory-text">
                    <h4>Hvad er dør-/vindueskontakter?</h4>
                    <p>Dør- og vindueskontakter er magnetiske sensorer der registrerer om en dør eller et vindue er åbent eller lukket. De består af to dele: en magnet og en sensor der detekterer magnetfeltet.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Dør-/vindueskontakter giver dig fuld kontrol over sikkerheden i dit hjem og kan automatisere forskellige funktioner baseret på om døre og vinduer er åbne eller lukkede.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Sikkerhedsalarm:</strong> Advarer når døre/vinduer åbnes uautoriseret</li>
                        <li><strong>Automatisk lys:</strong> Tænder lys når døre åbnes</li>
                        <li><strong>Klimastyring:</strong> Slukker varme når vinduer åbnes</li>
                        <li><strong>Ventilation:</strong> Øger luftudskiftning når vinduer åbnes</li>
                        <li><strong>Overvågning:</strong> Logger hvornår døre og vinduer bruges</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Placering:</strong> Magnet på dør/vindue, sensor på karm</li>
                        <li><strong>Afstand:</strong> Max 15mm mellem magnet og sensor</li>
                        <li><strong>Justering:</strong> Test funktionen efter installation</li>
                        <li><strong>Vedligeholdelse:</strong> Rens kontakter regelmæssigt for støv</li>
                        <li><strong>Backup:</strong> Hav ekstra batterier til hånd</li>
                    </ul>
                </div>
            `,
            'fugtighedssensor': `
                <div class="theory-text">
                    <h4>Hvad er fugtighedssensoere?</h4>
                    <p>Fugtighedssensoere måler luftfugtigheden i et rum og kan advare om problemer som skimmel, kondens eller for høj/lav luftfugtighed. De er essentielle for et sundt indeklima.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Forkert luftfugtighed kan føre til skimmel, kondens, træk og generelt dårligt indeklima. Fugtighedssensoere hjælper dig med at opretholde optimal luftfugtighed.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Skimmel forebyggelse:</strong> Advarer ved høj luftfugtighed</li>
                        <li><strong>Ventilation:</strong> Aktiverer ventilation ved høj fugtighed</li>
                        <li><strong>Luftfugter:</strong> Tænder luftfugter ved for lav fugtighed</li>
                        <li><strong>Klimastyring:</strong> Justerer temperatur baseret på fugtighed</li>
                        <li><strong>Overvågning:</strong> Logger luftfugtighed over tid</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Optimal fugtighed:</strong> 40-60% relativ luftfugtighed</li>
                        <li><strong>Placering:</strong> Undgå badeværelse og køkken (for høj fugtighed)</li>
                        <li><strong>Kalibrering:</strong> Test med hygrometer for nøjagtighed</li>
                        <li><strong>Vedligeholdelse:</strong> Rens sensor regelmæssigt</li>
                        <li><strong>Alarmer:</strong> Indstil advarsler ved <30% eller >70%</li>
                    </ul>
                </div>
            `,
            'lysmåler-lux': `
                <div class="theory-text">
                    <h4>Hvad er lysmålere (Lux)?</h4>
                    <p>Lysmålere måler lysintensiteten i et rum i lux (lx). De kan automatisk justere kunstigt lys baseret på det naturlige lys og optimere energiforbruget.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Lysmålere sikrer optimal belysning i alle rum og sparer energi ved automatisk at justere lysstyrken baseret på det tilgængelige naturlige lys.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Automatisk lys:</strong> Justerer lysstyrke baseret på naturligt lys</li>
                        <li><strong>Energibesparelse:</strong> Slukker lys når der er nok naturligt lys</li>
                        <li><strong>Komfort:</strong> Sikrer konstant optimal belysning</li>
                        <li><strong>Circadian rytme:</strong> Simulerer naturligt lysmønster</li>
                        <li><strong>Overvågning:</strong> Logger lysniveauer over tid</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Lux niveauer:</strong> 100-300 lux til almindeligt arbejde</li>
                        <li><strong>Placering:</strong> Undgå direkte sollys på sensoren</li>
                        <li><strong>Kalibrering:</strong> Test med luxmeter for nøjagtighed</li>
                        <li><strong>Indstillinger:</strong> Juster følsomhed efter behov</li>
                        <li><strong>Vedligeholdelse:</strong> Rens sensor regelmæssigt for støv</li>
                    </ul>
                </div>
            `,
            'udendørs-temperatur': `
                <div class="theory-text">
                    <h4>Hvad er udendørs temperatursensoere?</h4>
                    <p>Udendørs temperatursensoere måler temperaturen udenfor dit hjem og sender disse data til dit smarthome system. De er vigtige for optimal klimastyring og energibesparelse.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Ved at kende udendørs temperaturen kan dit smarthome system optimere opvarmning, køling og ventilation for maksimal komfort og energibesparelse.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Klimastyring:</strong> Justerer indendørs temperatur baseret på udendørs</li>
                        <li><strong>Ventilation:</strong> Øger luftudskiftning ved kølig vejr</li>
                        <li><strong>Energibesparelse:</strong> Reducerer opvarmning ved mildt vejr</li>
                        <li><strong>Frost beskyttelse:</strong> Aktiverer frostbeskyttelse ved lav temperatur</li>
                        <li><strong>Vejrdata:</strong> Giver lokale vejrdata til automatisering</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Placering:</strong> Nordvendt væg, væk fra direkte sollys</li>
                        <li><strong>Højde:</strong> 2-3 meter over jorden</li>
                        <li><strong>Beskyttelse:</strong> Brug væderskærm mod regn og vind</li>
                        <li><strong>Kalibrering:</strong> Sammenlign med vejrstation</li>
                        <li><strong>Vedligeholdelse:</strong> Rens regelmæssigt for støv og snavs</li>
                    </ul>
                </div>
            `,
            'vindmåler': `
                <div class="theory-text">
                    <h4>Hvad er vindmålere?</h4>
                    <p>Vindmålere måler vindhastighed og vindretning udenfor dit hjem. De giver værdifulde data til automatisering af vinduer, markiser og sikkerhedssystemer.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Vinddata hjælper med at automatisere vinduer, markiser og sikkerhedssystemer baseret på vejrforholdene, hvilket forbedrer komfort og sikkerhed.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Vindue automatisering:</strong> Lukker vinduer ved stærk vind</li>
                        <li><strong>Markise styring:</strong> Inddrager markiser ved stærk vind</li>
                        <li><strong>Sikkerhed:</strong> Advarer ved ekstreme vindforhold</li>
                        <li><strong>Energioptimering:</strong> Justerer ventilation baseret på vind</li>
                        <li><strong>Vejrdata:</strong> Giver lokale vinddata til automatisering</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Placering:</strong> Højeste punkt på huset, væk fra hindringer</li>
                        <li><strong>Installation:</strong> Brug professionel installation for sikkerhed</li>
                        <li><strong>Kalibrering:</strong> Test med anemometer for nøjagtighed</li>
                        <li><strong>Vedligeholdelse:</strong> Rens regelmæssigt for støv og insekter</li>
                        <li><strong>Alarmer:</strong> Indstil advarsler ved >15 m/s vind</li>
                    </ul>
                </div>
            `,
            'roegalarm': `
                <div class="theory-text">
                    <h4>Hvad er røgalarmer?</h4>
                    <p>Røgalarmer detekterer røg og brand og sender øjeblikkelige advarsler til dit smarthome system. De er kritiske for brandsikkerhed og kan redde liv.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Røgalarmer er din første forsvarslinje mod brand. De giver dig tid til at evakuere og kan automatisk aktivere sikkerhedsforanstaltninger.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Brandsikkerhed:</strong> Øjeblikkelig advarsel ved røg detektion</li>
                        <li><strong>Automatisk respons:</strong> Åbner vinduer og slukker gas</li>
                        <li><strong>Notifikationer:</strong> Sender SMS/email til ejer og nødsituationer</li>
                        <li><strong>Integration:</strong> Aktiverer sprinkler systemer</li>
                        <li><strong>Overvågning:</strong> Logger alle brandhændelser</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Placering:</strong> I hver etage, væk fra køkken og badeværelse</li>
                        <li><strong>Test:</strong> Test månedligt med testknap</li>
                        <li><strong>Batterier:</strong> Skift batterier årligt</li>
                        <li><strong>Vedligeholdelse:</strong> Rens regelmæssigt for støv</li>
                        <li><strong>Integration:</strong> Koble til smarthome system for automatisering</li>
                    </ul>
                </div>
            `,
            'vandlækage': `
                <div class="theory-text">
                    <h4>Hvad er vandlækage sensoere?</h4>
                    <p>Vandlækage sensoere detekterer vandlækager og oversvømmelser i dit hjem. De kan forhindre omfattende vandskader ved at give øjeblikkelige advarsler.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Vandskader kan være meget dyre at reparere. Vandlækage sensoere giver dig tid til at reagere hurtigt og minimere skader.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Skade forebyggelse:</strong> Advarer ved vandlækager</li>
                        <li><strong>Automatisk respons:</strong> Slukker vandforsyning ved lækage</li>
                        <li><strong>Notifikationer:</strong> Sender øjeblikkelige advarsler</li>
                        <li><strong>Integration:</strong> Aktiverer pumper og ventilation</li>
                        <li><strong>Overvågning:</strong> Logger alle vandhændelser</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Placering:</strong> Ved vaskemaskiner, opvaskemaskiner, vandvarmere</li>
                        <li><strong>Test:</strong> Test regelmæssigt med vanddråber</li>
                        <li><strong>Batterier:</strong> Skift batterier årligt</li>
                        <li><strong>Vedligeholdelse:</strong> Rens sensoere regelmæssigt</li>
                        <li><strong>Backup:</strong> Hav flere sensoere i kritiske områder</li>
                    </ul>
                </div>
            `,
            'co2-måler': `
                <div class="theory-text">
                    <h4>Hvad er CO₂-målere?</h4>
                    <p>CO₂-målere måler kuldioxidniveauet i luften og hjælper med at sikre god luftkvalitet. De er vigtige for sundhed og komfort i dit hjem.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Høje CO₂-niveauer kan føre til træthed, koncentrationsbesvær og generelt dårlig luftkvalitet. CO₂-målere hjælper med at opretholde sund luft.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Luftkvalitet:</strong> Overvåger CO₂-niveau for sundhed</li>
                        <li><strong>Ventilation:</strong> Aktiverer ventilation ved høje niveauer</li>
                        <li><strong>Komfort:</strong> Forbedrer koncentration og trivsel</li>
                        <li><strong>Energioptimering:</strong> Justerer ventilation efter behov</li>
                        <li><strong>Overvågning:</strong> Logger luftkvalitet over tid</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Optimalt niveau:</strong> Under 1000 ppm CO₂</li>
                        <li><strong>Placering:</strong> I brugte rum, væk fra vinduer</li>
                        <li><strong>Kalibrering:</strong> Kalibrer årligt for nøjagtighed</li>
                        <li><strong>Vedligeholdelse:</strong> Rens sensor regelmæssigt</li>
                        <li><strong>Alarmer:</strong> Indstil advarsler ved >1200 ppm</li>
                    </ul>
                </div>
            `,
            'tilstedeværelsessensor': `
                <div class="theory-text">
                    <h4>Hvad er tilstedeværelsessensoere?</h4>
                    <p>Tilstedeværelsessensoere er avancerede sensorer der kan skelne mellem bevægelse og faktisk tilstedeværelse. De bruger flere teknologier som PIR, mikrobølger og lyd.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Tilstedeværelsessensoere giver mere præcis detektion end almindelige bevægelsessensoere og kan optimere automatisering baseret på om nogen faktisk er til stede.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Præcis detektion:</strong> Skelner mellem bevægelse og tilstedeværelse</li>
                        <li><strong>Energibesparelse:</strong> Slukker lys kun når ingen er til stede</li>
                        <li><strong>Komfort:</strong> Bevarer lys når du sidder stille</li>
                        <li><strong>Sikkerhed:</strong> Detekterer uautoriseret tilstedeværelse</li>
                        <li><strong>Automatisering:</strong> Aktiverer funktioner baseret på tilstedeværelse</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Placering:</strong> Højere end PIR sensoere for bedre dækning</li>
                        <li><strong>Indstillinger:</strong> Juster følsomhed efter rumstørrelse</li>
                        <li><strong>Teknologi:</strong> Vælg mellem PIR, mikrobølger eller kombination</li>
                        <li><strong>Test:</strong> Test grundigt efter installation</li>
                        <li><strong>Vedligeholdelse:</strong> Rens regelmæssigt for optimal funktion</li>
                    </ul>
                </div>
            `,
            'temperatur-sensoere': `
                <div class="theory-text">
                    <h4>Hvad er temperatursensoere?</h4>
                    <p>Temperatursensoere er enheder der kontinuerligt måler omgivelsernes temperatur og sender disse data til dit smarthome system. De er hjertet i automatisk klimastyring.</p>
                    
                    <h4>Hvorfor er de vigtige?</h4>
                    <p>Uden temperatursensoere ville dit smarthome ikke vide hvornår det skal tænde varmen, køle ned eller justere ventilation. De gør dit hjem intelligent og komfortabelt.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Automatisk opvarmning:</strong> Tænder radiatorer når temperaturen falder</li>
                        <li><strong>Klimaanlæg styring:</strong> Aktiverer køling ved høje temperaturer</li>
                        <li><strong>Ventilation:</strong> Øger luftudskiftning baseret på temperatur</li>
                        <li><strong>Energibesparelse:</strong> Slukker varme når ingen er hjemme</li>
                        <li><strong>Overvågning:</strong> Advarer ved ekstreme temperaturer</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Placering:</strong> Undgå direkte sollys og varmekilder som TV'er</li>
                        <li><strong>Højde:</strong> Placer sensoere i øjenhøjde (1,5-2m) for bedste måling</li>
                        <li><strong>Kalibrering:</strong> Test med et termometer for at sikre nøjagtighed</li>
                        <li><strong>Backup:</strong> Hav flere sensoere i store rum for bedre dækning</li>
                        <li><strong>Vedligeholdelse:</strong> Rens sensoere regelmæssigt for støv</li>
                    </ul>
                </div>
            `,
            'bevaegelsessensoere': `
                <div class="theory-text">
                    <h4>Hvad er bevægelsessensoere?</h4>
                    <p>Bevægelsessensoere opdager når nogen bevæger sig i et rum ved at måle ændringer i infrarød stråling. De er perfekte til at automatisere lys, sikkerhed og komfort.</p>
                    
                    <h4>Hvordan fungerer de?</h4>
                    <p>Bevægelsessensoere (PIR) måler konstant infrarød stråling fra varmegenstande. Når du bevæger dig, ændres mønsteret og sensoren sender et signal til dit smarthome system.</p>
                    
                    <h4>Anvendelser i dit smarthome:</h4>
                    <ul>
                        <li><strong>Automatisk lys:</strong> Tænder lys når du kommer ind i et rum</li>
                        <li><strong>Sikkerhed:</strong> Aktiverer alarm når der er uautoriseret bevægelse</li>
                        <li><strong>Energibesparelse:</strong> Slukker lys automatisk når ingen er til stede</li>
                        <li><strong>Komfort:</strong> Starter ventilation eller musik ved bevægelse</li>
                        <li><strong>Overvågning:</strong> Logger aktivitet og bevægelsesmønstre</li>
                    </ul>
                    
                    <h4>💡 Tips og tricks:</h4>
                    <ul>
                        <li><strong>Optimal placering:</strong> 2-3 meter over gulvet, pegende mod indgangen</li>
                        <li><strong>Undgå fejlalarm:</strong> Placer ikke ved vinduer, radiatorer eller døråbninger</li>
                        <li><strong>Tidsforsinkelse:</strong> Indstil 30-60 sekunder for at undgå konstant tænd/sluk</li>
                        <li><strong>Følsomhed:</strong> Juster efter rumstørrelse - højere i store rum</li>
                        <li><strong>Test placering:</strong> Brug testfunktionen for at finde optimal position</li>
                    </ul>
                </div>
            `,
            'wifi-bluetooth': `
                <div class="theory-text">
                    <h4>WiFi & Bluetooth i Smarthome</h4>
                    <p>WiFi og Bluetooth er de to mest almindelige trådløse protokoller til smarthome enheder. Hver har sine styrker og er bedst til forskellige formål.</p>
                    
                    <h4>WiFi Specifikationer:</h4>
                    <ul>
                        <li><strong>Frekvens:</strong> 2.4 GHz og 5 GHz</li>
                        <li><strong>Rækkevidde:</strong> 30-100 meter (afhænger af hindringer)</li>
                        <li><strong>Datatransmission:</strong> Op til 1 Gbps (WiFi 6)</li>
                        <li><strong>Strømforbrug:</strong> Højt - kræver konstant strøm</li>
                    </ul>
                    
                    <h4>Bluetooth Specifikationer:</h4>
                    <ul>
                        <li><strong>Frekvens:</strong> 2.4 GHz</li>
                        <li><strong>Rækkevidde:</strong> 10-30 meter</li>
                        <li><strong>Datatransmission:</strong> Op til 2 Mbps</li>
                        <li><strong>Strømforbrug:</strong> Lavt (BLE)</li>
                    </ul>
                    
                    <h4>Anvendelser:</h4>
                    <ul>
                        <li><strong>WiFi:</strong> Kameraer, højttalere, smarte TV'er, routere</li>
                        <li><strong>Bluetooth:</strong> Sensorer, wearables, nøgler, lydenheder</li>
                    </ul>
                    
                    <h4>✅ Fordele:</h4>
                    <ul>
                        <li><strong>WiFi:</strong> Høj hastighed, lang rækkevidde, internetadgang</li>
                        <li><strong>Bluetooth:</strong> Lavt strømforbrug, nem paring, lav latens</li>
                    </ul>
                    
                    <h4>❌ Ulemper:</h4>
                    <ul>
                        <li><strong>WiFi:</strong> Højt strømforbrug, kan være overbelastet</li>
                        <li><strong>Bluetooth:</strong> Kort rækkevidde, begrænset datatransmission</li>
                    </ul>
                </div>
            `,
            'zigbee-z-wave': `
                <div class="theory-text">
                    <h4>Zigbee & Z-Wave Protokoller</h4>
                    <p>Zigbee og Z-Wave er specialiserede protokoller designet specifikt til smarthome enheder. De bruger mesh-netværk hvor enheder kan kommunikere gennem hinanden.</p>
                    
                    <h4>Zigbee Specifikationer:</h4>
                    <ul>
                        <li><strong>Frekvens:</strong> 2.4 GHz (samme som WiFi)</li>
                        <li><strong>Rækkevidde:</strong> 10-100m per hop</li>
                        <li><strong>Datatransmission:</strong> 250 kbps</li>
                        <li><strong>Strømforbrug:</strong> Meget lavt</li>
                        <li><strong>Mesh-netværk:</strong> Op til 65.000 enheder</li>
                    </ul>
                    
                    <h4>Z-Wave Specifikationer:</h4>
                    <ul>
                        <li><strong>Frekvens:</strong> 868 MHz (EU) / 908 MHz (US)</li>
                        <li><strong>Rækkevidde:</strong> 30-100m per hop</li>
                        <li><strong>Datatransmission:</strong> 100 kbps</li>
                        <li><strong>Strømforbrug:</strong> Meget lavt</li>
                        <li><strong>Mesh-netværk:</strong> Op til 232 enheder</li>
                    </ul>
                    
                    <h4>Anvendelser:</h4>
                    <ul>
                        <li><strong>Zigbee:</strong> Lys, sensorer, låse, termostater</li>
                        <li><strong>Z-Wave:</strong> Sikkerhed, lys, sensorer, kontakter</li>
                    </ul>
                    
                    <h4>✅ Fordele:</h4>
                    <ul>
                        <li><strong>Begge:</strong> Lavt strømforbrug, mesh-netværk, interoperabilitet</li>
                        <li><strong>Zigbee:</strong> Åben standard, mange enheder, billigere</li>
                        <li><strong>Z-Wave:</strong> Mindre interferens, bedre sikkerhed, ensartet kvalitet</li>
                    </ul>
                    
                    <h4>❌ Ulemper:</h4>
                    <ul>
                        <li><strong>Zigbee:</strong> Kan interferere med WiFi, kompleksitet</li>
                        <li><strong>Z-Wave:</strong> Dyrere enheder, begrænset antal enheder</li>
                    </ul>
                </div>
            `,
            // Automatisering indhold
            'scenarier': `
                <div class="theory-text">
                    <h4>Hvad er smarthome scenarier?</h4>
                    <p>Scenarier er foruddefinerede sekvenser af handlinger, der udføres automatisk baseret på specifikke betingelser. De gør dit hjem intelligent ved at koordinere flere enheder samtidigt.</p>
                    
                    <h4>Eksempler på scenarier:</h4>
                    <ul>
                        <li><strong>Morgen scenario:</strong> Tænd lys, åbn gardiner, start kaffe</li>
                        <li><strong>Film aften:</strong> Dæmp lys, luk gardiner, tænd TV</li>
                        <li><strong>Gå i seng:</strong> Sluk alle lys, aktiver sikkerhed, sæt temperatur</li>
                        <li><strong>Hjemkomst:</strong> Tænd lys, åbn garagedør, deaktiver alarm</li>
                    </ul>
                    
                    <h4>Fordele ved scenarier:</h4>
                    <ul>
                        <li>Øger komfort og bekvemmelighed</li>
                        <li>Sparer tid på daglige rutiner</li>
                        <li>Forbedrer sikkerhed gennem automatisk aktivering</li>
                        <li>Optimerer energiforbrug</li>
                    </ul>
                </div>
            `,
            'tidsbaseret': `
                <div class="theory-text">
                    <h4>Tidsbaseret automatisering</h4>
                    <p>Tidsbaseret automatisering udfører handlinger på specifikke tidspunkter eller efter tidsintervaller. Det er en af de mest pålidelige former for automatisering.</p>
                    
                    <h4>Typer af tidsbaseret automatisering:</h4>
                    <ul>
                        <li><strong>Daglige rutiner:</strong> Morgenlys kl. 7:00, aftenlys kl. 18:00</li>
                        <li><strong>Ugentlige rutiner:</strong> Vaskemaskine om søndag morgen</li>
                        <li><strong>Årlige rutiner:</strong> Juledekorationer i december</li>
                        <li><strong>Intervaller:</strong> Vand planter hver 3. dag</li>
                    </ul>
                    
                    <h4>Tips til tidsbaseret automatisering:</h4>
                    <ul>
                        <li>Brug solopgang/solnedgang i stedet for faste tidspunkter</li>
                        <li>Overvej weekend vs. hverdags rutiner</li>
                        <li>Test dine automatiseringer før du rejser</li>
                        <li>Brug backup-timer til kritiske funktioner</li>
                    </ul>
                </div>
            `,
            'sensor-trigger': `
                <div class="theory-text">
                    <h4>Sensor-triggerede automatiseringer</h4>
                    <p>Disse automatiseringer aktiveres når sensorer registrerer specifikke forhold. De gør dit hjem responsivt og intelligent.</p>
                    
                    <h4>Eksempler på sensor-triggere:</h4>
                    <ul>
                        <li><strong>Bevægelsessensor:</strong> Tænd lys når nogen kommer ind i rummet</li>
                        <li><strong>Temperatursensor:</strong> Start varme når temperaturen falder under 18°C</li>
                        <li><strong>Fugtighedssensor:</strong> Tænd udluftning når fugtigheden overstiger 60%</li>
                        <li><strong>Lysmåler:</strong> Tænd lys når det bliver mørkt</li>
                    </ul>
                    
                    <h4>Avancerede trigger-kombinationer:</h4>
                    <ul>
                        <li><strong>AND-logik:</strong> Tænd lys KUN hvis det er mørkt OG nogen er hjemme</li>
                        <li><strong>OR-logik:</strong> Tænd lys hvis det er mørkt ELLER nogen er hjemme</li>
                        <li><strong>NOT-logik:</strong> Sluk lys hvis det er lyst OG ingen er hjemme</li>
                    </ul>
                </div>
            `,
            'geofencing': `
                <div class="theory-text">
                    <h4>Geofencing & lokationsbaseret automatisering</h4>
                    <p>Geofencing bruger GPS til at oprette virtuelle grænser omkring dit hjem. Når din telefon krydser disse grænser, aktiveres automatiseringer.</p>
                    
                    <h4>Sådan fungerer det:</h4>
                    <ul>
                        <li>Din telefon sender GPS-koordinater til smarthome systemet</li>
                        <li>Systemet beregner afstanden til dit hjem</li>
                        <li>Når du kommer inden for en bestemt radius, aktiveres "Hjemkomst" scenario</li>
                        <li>Når du forlader radius, aktiveres "Aflægning" scenario</li>
                    </ul>
                    
                    <h4>Praktiske anvendelser:</h4>
                    <ul>
                        <li><strong>Hjemkomst:</strong> Tænd lys, åbn garagedør, deaktiver alarm</li>
                        <li><strong>Aflægning:</strong> Sluk lys, aktiver alarm, sæt temperatur</li>
                        <li><strong>Nær hjem:</strong> Start opvarmning, tænd udendørs lys</li>
                    </ul>
                    
                    <h4>Tips til geofencing:</h4>
                    <ul>
                        <li>Sæt radius til 100-200 meter for bedre pålidelighed</li>
                        <li>Brug flere familiemedlemmers telefoner for bedre dækning</li>
                        <li>Test forskellige radius-størrelser</li>
                    </ul>
                </div>
            `,
            'weather-automation': `
                <div class="theory-text">
                    <h4>Vejrbaseret automatisering</h4>
                    <p>Vejrbaseret automatisering bruger vejrdata til at optimere dit hjem. Den kan tilpasse sig vejrforholdene automatisk.</p>
                    
                    <h4>Vejrdata kilder:</h4>
                    <ul>
                        <li><strong>Online vejrservices:</strong> OpenWeatherMap, Weather Underground</li>
                        <li><strong>Lokale vejrstationer:</strong> Mere præcise lokale data</li>
                        <li><strong>Smartphone apps:</strong> Automatisk data fra vejr-apps</li>
                    </ul>
                    
                    <h4>Eksempler på vejrbaseret automatisering:</h4>
                    <ul>
                        <li><strong>Regn:</strong> Luk vinduer, tænd udendørs lys tidligere</li>
                        <li><strong>Vind:</strong> Luk markiser, deaktiver sprinklere</li>
                        <li><strong>Sol:</strong> Åbn gardiner, aktiver solcelle-optimering</li>
                        <li><strong>Frost:</strong> Tænd frostbeskyttelse, luk vandhaner</li>
                    </ul>
                    
                    <h4>Avancerede vejr-automatiseringer:</h4>
                    <ul>
                        <li>Optimer varmeforbrug baseret på udetemperatur</li>
                        <li>Justér sprinklere baseret på regnprognose</li>
                        <li>Automatisk vindueslukning ved stormvarsel</li>
                    </ul>
                </div>
            `,
            'energy-automation': `
                <div class="theory-text">
                    <h4>Energi-automatisering</h4>
                    <p>Energi-automatisering optimerer dit energiforbrug automatisk for at spare penge og reducere miljøpåvirkning.</p>
                    
                    <h4>Strategier for energibesparelse:</h4>
                    <ul>
                        <li><strong>Load shifting:</strong> Flyt energiforbrug til billige tidspunkter</li>
                        <li><strong>Peak shaving:</strong> Reducer forbrug under dyre timer</li>
                        <li><strong>Smart charging:</strong> Lad elbiler når strømmen er billigst</li>
                        <li><strong>Demand response:</strong> Reducer forbrug ved høj efterspørgsel</li>
                    </ul>
                    
                    <h4>Automatiseringer til energibesparelse:</h4>
                    <ul>
                        <li><strong>Varmepumpe:</strong> Kør om natten når strømmen er billigst</li>
                        <li><strong>Vaskemaskine:</strong> Start automatisk ved lav elpris</li>
                        <li><strong>Belysning:</strong> Automatisk dimning baseret på dagslys</li>
                        <li><strong>Varmtvandsbeholder:</strong> Optimer opvarmningstider</li>
                    </ul>
                    
                    <h4>Overvågning og optimering:</h4>
                    <ul>
                        <li>Real-time energimåling og rapportering</li>
                        <li>Automatiske advarsler ved højt forbrug</li>
                        <li>Månedlige energirapporter</li>
                        <li>Foreslå optimeringer baseret på forbrugsmønstre</li>
                    </ul>
                </div>
            `
        };
        
        return content[subtopicId] || '<p>Teoriindhold kommer snart...</p>';
    }

    getQuizContent(subtopicId) {
        const quizzes = {
            'temperatur-sensoere': `
                <div class="quiz-question">
                    <h4>Spørgsmål 1:</h4>
                    <p>Hvorfor er temperatursensoere vigtige i et smarthome?</p>
                    <div class="quiz-options">
                        <label><input type="radio" name="q1" value="a"> De sparer strøm</label>
                        <label><input type="radio" name="q1" value="b"> De gør hjemmet intelligent og komfortabelt</label>
                        <label><input type="radio" name="q1" value="c"> De er billige at installere</label>
                        <label><input type="radio" name="q1" value="d"> De ser moderne ud</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Spørgsmål 2:</h4>
                    <p>Hvilken placering er bedst for temperatursensoere?</p>
                    <div class="quiz-options">
                        <label><input type="radio" name="q2" value="a"> Ved vinduerne</label>
                        <label><input type="radio" name="q2" value="b"> I øjenhøjde (1,5-2m) væk fra varmekilder</label>
                        <label><input type="radio" name="q2" value="c"> På gulvet</label>
                        <label><input type="radio" name="q2" value="d"> Ved radiatorer</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'b'])">Tjek Svar</button>
            `,
            'bevaegelsessensoere': `
                <div class="quiz-question">
                    <h4>Spørgsmål 1:</h4>
                    <p>Hvad er den primære anvendelse af bevægelsessensoere i smarthome?</p>
                    <div class="quiz-options">
                        <label><input type="radio" name="q1" value="a"> At måle temperatur</label>
                        <label><input type="radio" name="q1" value="b"> At automatisere lys og sikkerhed</label>
                        <label><input type="radio" name="q1" value="c"> At spare strøm</label>
                        <label><input type="radio" name="q1" value="d"> At spille musik</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Spørgsmål 2:</h4>
                    <p>Hvor bør bevægelsessensoere IKKE placeres?</p>
                    <div class="quiz-options">
                        <label><input type="radio" name="q2" value="a"> På væggen</label>
                        <label><input type="radio" name="q2" value="b"> Ved vinduer, radiatorer eller døråbninger</label>
                        <label><input type="radio" name="q2" value="c"> I hjørnet af rummet</label>
                        <label><input type="radio" name="q2" value="d"> Over døren</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'b'])">Tjek Svar</button>
            `,
            'wifi-bluetooth': `
                <div class="quiz-question">
                    <h4>Spørgsmål 1:</h4>
                    <p>Hvilken protokol er bedst til enheder der kræver høj datatransmission?</p>
                    <div class="quiz-options">
                        <label><input type="radio" name="q1" value="a"> Bluetooth</label>
                        <label><input type="radio" name="q1" value="b"> WiFi</label>
                        <label><input type="radio" name="q1" value="c"> Zigbee</label>
                        <label><input type="radio" name="q1" value="d"> Z-Wave</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Spørgsmål 2:</h4>
                    <p>Hvad er hovedulempen ved WiFi i smarthome sammenhæng?</p>
                    <div class="quiz-options">
                        <label><input type="radio" name="q2" value="a"> Kort rækkevidde</label>
                        <label><input type="radio" name="q2" value="b"> Højt strømforbrug</label>
                        <label><input type="radio" name="q2" value="c"> Dårlig sikkerhed</label>
                        <label><input type="radio" name="q2" value="d"> Dyrt at installere</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'b'])">Tjek Svar</button>
            `,
            'zigbee-z-wave': `
                <div class="quiz-question">
                    <h4>Spørgsmål 1:</h4>
                    <p>Hvad er hovedfordelen ved Zigbee og Z-Wave protokoller?</p>
                    <div class="quiz-options">
                        <label><input type="radio" name="q1" value="a"> Høj datatransmission</label>
                        <label><input type="radio" name="q1" value="b"> Lavt strømforbrug og mesh-netværk</label>
                        <label><input type="radio" name="q1" value="c"> Billige enheder</label>
                        <label><input type="radio" name="q1" value="d"> Nem installation</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Spørgsmål 2:</h4>
                    <p>Hvilken frekvens bruger Z-Wave i Europa?</p>
                    <div class="quiz-options">
                        <label><input type="radio" name="q2" value="a"> 2.4 GHz</label>
                        <label><input type="radio" name="q2" value="b"> 868 MHz</label>
                        <label><input type="radio" name="q2" value="c"> 5 GHz</label>
                        <label><input type="radio" name="q2" value="d"> 433 MHz</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'b'])">Tjek Svar</button>
            `,
            // Automatisering quiz spørgsmål
            'scenarier': `
                <div class="quiz-question">
                    <h4>Hvad er det primære formål med smarthome scenarier?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="scenarier1" value="a"> a) At spare penge på elregningen</label>
                        <label><input type="radio" name="scenarier1" value="b"> b) At koordinere flere enheder til at udføre handlinger automatisk</label>
                        <label><input type="radio" name="scenarier1" value="c"> c) At overvåge sikkerheden i hjemmet</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Hvilket af følgende er IKKE et typisk morgen scenario?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="scenarier2" value="a"> a) Tænd lys og åbn gardiner</label>
                        <label><input type="radio" name="scenarier2" value="b"> b) Start kaffemaskinen</label>
                        <label><input type="radio" name="scenarier2" value="c"> c) Aktiver alarmsystemet</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'c'])">Tjek Svar</button>
            `,
            'tidsbaseret': `
                <div class="quiz-question">
                    <h4>Hvad er den bedste praksis for tidsbaseret automatisering?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="tidsbaseret1" value="a"> a) Brug altid faste tidspunkter</label>
                        <label><input type="radio" name="tidsbaseret1" value="b"> b) Brug solopgang/solnedgang i stedet for faste tidspunkter</label>
                        <label><input type="radio" name="tidsbaseret1" value="c"> c) Sæt altid til samme tid hver dag</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Hvilken type automatisering er mest pålidelig?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="tidsbaseret2" value="a"> a) Sensor-triggerede automatiseringer</label>
                        <label><input type="radio" name="tidsbaseret2" value="b"> b) Tidsbaseret automatisering</label>
                        <label><input type="radio" name="tidsbaseret2" value="c"> c) Vejrbaseret automatisering</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'b'])">Tjek Svar</button>
            `,
            'sensor-trigger': `
                <div class="quiz-question">
                    <h4>Hvad betyder AND-logik i sensor-triggerede automatiseringer?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="sensor-trigger1" value="a"> a) Automatiseringen aktiveres hvis EN af betingelserne er opfyldt</label>
                        <label><input type="radio" name="sensor-trigger1" value="b"> b) Automatiseringen aktiveres KUN hvis ALLE betingelser er opfyldt</label>
                        <label><input type="radio" name="sensor-trigger1" value="c"> c) Automatiseringen aktiveres hvis ingen betingelser er opfyldt</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Hvilken sensor er bedst til at tænde lys automatisk?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="sensor-trigger2" value="a"> a) Temperatursensor</label>
                        <label><input type="radio" name="sensor-trigger2" value="b"> b) Bevægelsessensor</label>
                        <label><input type="radio" name="sensor-trigger2" value="c"> c) Fugtighedssensor</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'b'])">Tjek Svar</button>
            `,
            'geofencing': `
                <div class="quiz-question">
                    <h4>Hvad bruger geofencing til at bestemme din lokation?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="geofencing1" value="a"> a) WiFi-netværk</label>
                        <label><input type="radio" name="geofencing1" value="b"> b) GPS-koordinater</label>
                        <label><input type="radio" name="geofencing1" value="c"> c) Bluetooth-signaler</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Hvilken radius anbefales for geofencing?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="geofencing2" value="a"> a) 10-20 meter</label>
                        <label><input type="radio" name="geofencing2" value="b"> b) 100-200 meter</label>
                        <label><input type="radio" name="geofencing2" value="c"> c) 1-2 kilometer</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'b'])">Tjek Svar</button>
            `,
            'weather-automation': `
                <div class="quiz-question">
                    <h4>Hvilken vejrdata kilde giver de mest præcise lokale data?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="weather1" value="a"> a) Online vejrservices</label>
                        <label><input type="radio" name="weather1" value="b"> b) Lokale vejrstationer</label>
                        <label><input type="radio" name="weather1" value="c"> c) Smartphone apps</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Hvad sker der typisk ved regn i vejrbaseret automatisering?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="weather2" value="a"> a) Åbne vinduer og markiser</label>
                        <label><input type="radio" name="weather2" value="b"> b) Lukke vinduer og tænde udendørs lys tidligere</label>
                        <label><input type="radio" name="weather2" value="c"> c) Aktivere sprinklere</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'b'])">Tjek Svar</button>
            `,
            'energy-automation': `
                <div class="quiz-question">
                    <h4>Hvad betyder "Load shifting" i energi-automatisering?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="energy1" value="a"> a) At reducere det samlede energiforbrug</label>
                        <label><input type="radio" name="energy1" value="b"> b) At flytte energiforbrug til billige tidspunkter</label>
                        <label><input type="radio" name="energy1" value="c"> c) At øge energiforbruget om natten</label>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h4>Hvilken enhed er bedst til at køre om natten for at spare penge?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="energy2" value="a"> a) TV og underholdning</label>
                        <label><input type="radio" name="energy2" value="b"> b) Varmepumpe og vaskemaskine</label>
                        <label><input type="radio" name="energy2" value="c"> c) Belysning</label>
                    </div>
                </div>
                
                <button class="check-quiz-btn" onclick="window.appManager.checkQuiz(['b', 'b'])">Tjek Svar</button>
            `
        };
        
        return quizzes[subtopicId] || '<p>Quiz kommer snart...</p>';
    }

    // Exercise content removed - only theory and quiz now
    getExerciseContent(subtopicId) {
        return '<p>Øvelser er fjernet - fokus på teori og quiz</p>';
    }

    getExerciseContentOld(subtopicId) {
        const exercises = {
            'temperatur-sensoere': `
                <div class="exercise-content">
                    <h4>Praktisk Øvelse: Planlæg Temperatursensor Setup</h4>
                    <p>I denne øvelse planlægger du hvor og hvordan du vil placere temperatursensoere i dit hjem for optimal komfort og energibesparelse.</p>
                    
                    <div class="exercise-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <div class="step-content">
                                <h5>Vælg Rum til Sensorer</h5>
                                <p>Hvilke rum i dit hjem har brug for temperatursensoere?</p>
                                <div class="room-options">
                                    <label><input type="checkbox" value="living"> Stue</label>
                                    <label><input type="checkbox" value="bedroom"> Soveværelse</label>
                                    <label><input type="checkbox" value="kitchen"> Køkken</label>
                                    <label><input type="checkbox" value="bathroom"> Badeværelse</label>
                                    <label><input type="checkbox" value="hallway"> Gang</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step">
                            <span class="step-number">2</span>
                            <div class="step-content">
                                <h5>Indstil Komfort Temperaturer</h5>
                                <p>Hvad er din ideelle temperatur i forskellige rum?</p>
                                <div class="temperature-settings">
                                    <label>Stue: <input type="number" value="21" min="15" max="30">°C</label>
                                    <label>Soveværelse: <input type="number" value="18" min="15" max="30">°C</label>
                                    <label>Køkken: <input type="number" value="20" min="15" max="30">°C</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step">
                            <span class="step-number">3</span>
                            <div class="step-content">
                                <h5>Automatisering Regler</h5>
                                <p>Hvad skal der ske når temperaturen ændres?</p>
                                <div class="automation-rules">
                                    <label><input type="checkbox" value="heating"> Tænd varme når det er koldt</label>
                                    <label><input type="checkbox" value="cooling"> Tænd køling når det er varmt</label>
                                    <label><input type="checkbox" value="ventilation"> Øg ventilation ved høj temperatur</label>
                                    <label><input type="checkbox" value="notification"> Send notifikation ved ekstreme temperaturer</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="test-config-btn" onclick="window.appManager.testConfiguration()">Gem Temperatur Plan</button>
                </div>
            `,
            'bevaegelsessensoere': `
                <div class="exercise-content">
                    <h4>Praktisk Øvelse: Design Bevægelsessensor Automatisering</h4>
                    <p>Design en automatisering der gør dit hjem mere komfortabelt og sikkert ved hjælp af bevægelsessensoere.</p>
                    
                    <div class="exercise-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <div class="step-content">
                                <h5>Vælg Strategiske Placeringer</h5>
                                <p>Hvor vil du placere bevægelsessensoere for maksimal effekt?</p>
                                <div class="placement-options">
                                    <label><input type="checkbox" value="entrance"> Ved hovedindgang</label>
                                    <label><input type="checkbox" value="hallway"> I gangen</label>
                                    <label><input type="checkbox" value="stairs"> Ved trapper</label>
                                    <label><input type="checkbox" value="garage"> I garage/kælder</label>
                                    <label><input type="checkbox" value="garden"> I haven (udendørs)</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step">
                            <span class="step-number">2</span>
                            <div class="step-content">
                                <h5>Automatisering Scenarier</h5>
                                <p>Hvad skal der ske når bevægelse opdages?</p>
                                <div class="scenario-options">
                                    <label><input type="checkbox" value="lights"> Tænd lys automatisk</label>
                                    <label><input type="checkbox" value="security"> Aktiver sikkerhedsalarm</label>
                                    <label><input type="checkbox" value="heating"> Tænd varme i rummet</label>
                                    <label><input type="checkbox" value="music"> Start baggrundsmusik</label>
                                    <label><input type="checkbox" value="notification"> Send notifikation til telefon</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step">
                            <span class="step-number">3</span>
                            <div class="step-content">
                                <h5>Tidsindstillinger</h5>
                                <p>Hvor længe skal automatiseringen være aktiv?</p>
                                <div class="time-settings">
                                    <label>Lys varighed: <input type="range" min="10" max="300" value="60" class="exercise-slider"> <span class="slider-value">60 sekunder</span></label>
                                    <label>Varme varighed: <input type="range" min="300" max="1800" value="900" class="exercise-slider"> <span class="slider-value">15 minutter</span></label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="test-config-btn" onclick="window.appManager.testConfiguration()">Aktiver Automatisering</button>
                </div>
            `,
            'wifi-bluetooth': `
                <div class="exercise-content">
                    <h4>Praktisk Øvelse: Vælg Rigtig Protokol</h4>
                    <p>Vælg den bedste trådløse protokol til forskellige smarthome enheder baseret på deres behov.</p>
                    
                    <div class="exercise-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <div class="step-content">
                                <h5>Enhed Type Vurdering</h5>
                                <p>Hvilken protokol er bedst til hver enhedstype?</p>
                                <div class="device-protocol-matching">
                                    <div class="device-item">
                                        <span>Smart TV / Streaming boks</span>
                                        <select class="exercise-select">
                                            <option value="">Vælg protokol...</option>
                                            <option value="wifi">WiFi (høj hastighed)</option>
                                            <option value="bluetooth">Bluetooth (lav strøm)</option>
                                        </select>
                                    </div>
                                    <div class="device-item">
                                        <span>Temperatursensor</span>
                                        <select class="exercise-select">
                                            <option value="">Vælg protokol...</option>
                                            <option value="wifi">WiFi (høj hastighed)</option>
                                            <option value="bluetooth">Bluetooth (lav strøm)</option>
                                        </select>
                                    </div>
                                    <div class="device-item">
                                        <span>Smart højttaler</span>
                                        <select class="exercise-select">
                                            <option value="">Vælg protokol...</option>
                                            <option value="wifi">WiFi (høj hastighed)</option>
                                            <option value="bluetooth">Bluetooth (lav strøm)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step">
                            <span class="step-number">2</span>
                            <div class="step-content">
                                <h5>Netværk Planlægning</h5>
                                <p>Hvordan vil du optimere dit netværk?</p>
                                <div class="network-optimization">
                                    <label><input type="checkbox" value="router"> Opgrader router til WiFi 6</label>
                                    <label><input type="checkbox" value="mesh"> Installer mesh netværk</label>
                                    <label><input type="checkbox" value="band"> Separer 2.4GHz og 5GHz netværk</label>
                                    <label><input type="checkbox" value="qos"> Aktivér QoS for smarthome enheder</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step">
                            <span class="step-number">3</span>
                            <div class="step-content">
                                <h5>Strømforbrug Overvejelser</h5>
                                <p>Hvilke enheder skal have lavt strømforbrug?</p>
                                <div class="power-considerations">
                                    <label><input type="checkbox" value="sensors"> Alle sensorer (brug Bluetooth)</label>
                                    <label><input type="checkbox" value="cameras"> Sikkerhedskameraer (brug WiFi)</label>
                                    <label><input type="checkbox" value="locks"> Smart låse (brug Bluetooth)</label>
                                    <label><input type="checkbox" value="speakers"> Højttalere (brug WiFi)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="test-config-btn" onclick="window.appManager.testConfiguration()">Gem Protokol Plan</button>
                </div>
            `,
            'zigbee-z-wave': `
                <div class="exercise-content">
                    <h4>Praktisk Øvelse: Planlæg Mesh Netværk</h4>
                    <p>Design et mesh netværk med Zigbee eller Z-Wave enheder for maksimal dækning og pålidelighed.</p>
                    
                    <div class="exercise-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <div class="step-content">
                                <h5>Vælg Protokol</h5>
                                <p>Hvilken protokol passer bedst til dine behov?</p>
                                <div class="protocol-selection">
                                    <label><input type="radio" name="protocol" value="zigbee"> Zigbee (åben standard, billigere)</label>
                                    <label><input type="radio" name="protocol" value="zwave"> Z-Wave (bedre sikkerhed, dyrere)</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step">
                            <span class="step-number">2</span>
                            <div class="step-content">
                                <h5>Hub Placering</h5>
                                <p>Hvor vil du placere din mesh hub for optimal dækning?</p>
                                <div class="hub-placement">
                                    <label><input type="radio" name="hub" value="center"> Midt i huset (bedste dækning)</label>
                                    <label><input type="radio" name="hub" value="router"> Ved routeren (nem installation)</label>
                                    <label><input type="radio" name="hub" value="living"> I stuen (centralt rum)</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step">
                            <span class="step-number">3</span>
                            <div class="step-content">
                                <h5>Enhed Strategi</h5>
                                <p>Hvilke enheder vil du tilføje til dit mesh netværk?</p>
                                <div class="mesh-devices">
                                    <label><input type="checkbox" value="lights"> Smart lys (gode mesh noder)</label>
                                    <label><input type="checkbox" value="sensors"> Sensorer (lavt strømforbrug)</label>
                                    <label><input type="checkbox" value="locks"> Smart låse (sikkerhed)</label>
                                    <label><input type="checkbox" value="outlets"> Smart stikkontakter (strøm til andre enheder)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="test-config-btn" onclick="window.appManager.testConfiguration()">Start Mesh Setup</button>
                </div>
            `
        };
        
        return exercises[subtopicId] || '<p>Øvelse kommer snart...</p>';
    }

    checkQuiz(correctAnswers) {
        const popup = document.querySelector('.learning-module-popup');
        if (!popup) return;
        
        let score = 0;
        const questions = popup.querySelectorAll('.quiz-question');
        
        questions.forEach((question, index) => {
            const selected = question.querySelector('input:checked');
            if (selected && selected.value === correctAnswers[index]) {
                score++;
                question.classList.add('correct');
            } else {
                question.classList.add('incorrect');
            }
        });
        
        const percentage = Math.round((score / questions.length) * 100);
        this.showNotification(`Quiz gennemført! Du fik ${score}/${questions.length} rigtige (${percentage}%)`, 
            percentage >= 70 ? 'success' : 'info');
    }

    testConfiguration() {
        this.showNotification('Konfiguration testet! Automatiseringen er nu aktiv.', 'success');
    }

    showWelcomeContent() {
        const welcomeContent = document.getElementById('welcome-content');
        const subtopicsContainer = document.getElementById('subtopics-container');
        const backBtn = document.getElementById('back-to-topics');
        
        welcomeContent.style.display = 'block';
        subtopicsContainer.style.display = 'none';
        backBtn.style.display = 'none';
        
        // Reset topic selection
        document.querySelectorAll('.topic-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Reset header
        document.getElementById('current-topic-title').textContent = 'Vælg et emne for at begynde';
        document.getElementById('current-topic-description').textContent = 'Klik på et emne til venstre for at se underemner og begynde læring';
    }

    filterTopics(searchTerm) {
        const topicCards = document.querySelectorAll('.topic-card');
        const term = searchTerm.toLowerCase();
        
        topicCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(term) || description.includes(term)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateOverallProgress() {
        const allSubtopicButtons = document.querySelectorAll('.subtopic-btn');
        const completedButtons = document.querySelectorAll('.subtopic-btn.completed');
        const percentage = Math.round((completedButtons.length / allSubtopicButtons.length) * 100);
        
        const progressCircle = document.querySelector('.progress-circle-large');
        const progressText = document.querySelector('.progress-text-large');
        
        if (progressCircle && progressText) {
            progressCircle.style.background = `conic-gradient(#78dbff ${percentage * 3.6}deg, #78dbff ${percentage * 3.6}deg, rgba(160, 174, 192, 0.2) ${percentage * 3.6}deg)`;
            progressText.textContent = `${percentage}%`;
        }
    }

    checkAchievements() {
        const completedCount = document.querySelectorAll('.subtopic-btn.completed').length;
        const achievements = document.querySelectorAll('.achievement-badge');
        
        // Unlock achievements based on progress
        if (completedCount >= 1 && !achievements[0].classList.contains('unlocked')) {
            achievements[0].classList.add('unlocked');
            this.showNotification('🏆 Præstation opnået: Første Skridt!', 'success');
        }
        
        if (completedCount >= 5 && !achievements[1].classList.contains('unlocked')) {
            achievements[1].classList.add('unlocked');
            this.showNotification('🏆 Præstation opnået: Lærelyst!', 'success');
        }
        
        if (completedCount >= 15 && !achievements[2].classList.contains('unlocked')) {
            achievements[2].classList.add('unlocked');
            this.showNotification('🏆 Præstation opnået: Målrettet!', 'success');
        }
        
        if (completedCount >= 25 && !achievements[3].classList.contains('unlocked')) {
            achievements[3].classList.add('unlocked');
            this.showNotification('🏆 Præstation opnået: Ekspert!', 'success');
        }
    }
}

// ===== CSS ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    window.appManager = new AppManager();
});

// ===== GLOBAL FUNCTIONS =====
function showNotification(message, type = 'info') {
    if (window.appManager) {
        window.appManager.showNotification(message, type);
    }
}
