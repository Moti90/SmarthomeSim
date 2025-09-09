// ===== FIREBASE IMPORTS =====
// Using Firebase v8 syntax to match your existing setup

// ===== APP MANAGER =====
class AppManager {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'home';
        this.currentTheme = 'default';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredTheme();
        this.initializeFirebase();
        this.initializeSmartIcons();
    }

    initializeFirebase() {
        // Initialize Firebase using your existing setup
        if (window.FirebaseConfig) {
            window.FirebaseConfig.initializeFirebase();
            this.setupAuthStateListener();
        } else {
            console.error('Firebase configuration not found');
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
            btn.addEventListener('click', (e) => this.switchTab(e.target.closest('.nav-btn').dataset.tab));
        });
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.switchTheme(e.target.closest('.theme-option').dataset.theme));
        });
        
        // Device controls
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleDevice(e.target));
        });
    }

    // ===== AUTHENTICATION =====
    setupAuthStateListener() {
        const auth = window.FirebaseConfig.getAuth();
        if (auth) {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    // User is signed in
                    this.currentUser = user;
                    this.showApp();
                    this.updateUserInfo();
                } else {
                    // User is signed out
                    this.currentUser = null;
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
            await auth.createUserWithEmailAndPassword(email, password);
            // Auth state listener will handle the rest
        } catch (error) {
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
        
        this.currentTab = tabName;
    }

    // ===== THEME MANAGEMENT =====
    switchTheme(themeName) {
        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        // Apply theme
        document.body.classList.remove('theme-army');
        if (themeName === 'army') {
            document.body.classList.add('theme-army');
        }
        
        this.currentTheme = themeName;
        this.storeTheme(themeName);
    }

    loadStoredTheme() {
        const storedTheme = localStorage.getItem('selectedTheme');
        if (storedTheme) {
            this.switchTheme(storedTheme);
        }
    }

    storeTheme(theme) {
        localStorage.setItem('selectedTheme', theme);
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
                } else if (icon.dataset.device.includes('vindue')) {
                    message = `${icon.dataset.deviceName} åbent`;
                } else if (icon.dataset.device.includes('doerlaas')) {
                    message = `${icon.dataset.deviceName} låst`;
                } else if (icon.dataset.device.includes('bevaegelsessensor')) {
                    message = `${icon.dataset.deviceName} aktiv`;
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
                } else if (icon.dataset.device.includes('vindue')) {
                    message = `${icon.dataset.deviceName} lukket`;
                } else if (icon.dataset.device.includes('doerlaas')) {
                    message = `${icon.dataset.deviceName} ulåst`;
                } else if (icon.dataset.device.includes('bevaegelsessensor')) {
                    message = `${icon.dataset.deviceName} inaktiv`;
                } else {
                    message = `${icon.dataset.deviceName} deaktiveret`;
                }
                this.showNotification(message, 'info');
            }
        } else if (deviceType === 'numeric') {
            // For numeric values, cycle through 0, 25, 50, 75, 100
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
                        } else if (icon.dataset.device.includes('vindue')) {
                            message = `${icon.dataset.deviceName} ${newValue === 'true' ? 'åbent' : 'lukket'}`;
                        } else if (icon.dataset.device.includes('doerlaas')) {
                            message = `${icon.dataset.deviceName} ${newValue === 'true' ? 'låst' : 'ulåst'}`;
                        } else if (icon.dataset.device.includes('bevaegelsessensor')) {
                            message = `${icon.dataset.deviceName} ${newValue === 'true' ? 'aktiv' : 'inaktiv'}`;
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
