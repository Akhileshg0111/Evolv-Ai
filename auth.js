const FirebaseAuthManager = {
    firebaseConfig: {
        apiKey: "AIzaSyBY_nOWhMDs6mVAyVbqDm2TbSnD4WNJYKU",
  authDomain: "evolv-ai-1.firebaseapp.com",
  projectId: "evolv-ai-1",
  storageBucket: "evolv-ai-1.firebasestorage.app",
  messagingSenderId: "1082783020732",
  appId: "1:1082783020732:web:c8e3f7fafbb7f9682242b9"
    },
    
    app: null,
    auth: null,
    user: null,
    isInitialized: false,
    
    init() {
        try {
            this.app = firebase.initializeApp(this.firebaseConfig);
            this.auth = firebase.auth();
            
            this.auth.onAuthStateChanged((user) => {
                this.user = user;
                this.handleAuthStateChange(user);
            });
            
            this.googleProvider = new firebase.auth.GoogleAuthProvider();
            this.googleProvider.addScope('email');
            this.googleProvider.addScope('profile');
            
            this.isInitialized = true;
            console.log('Firebase initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    },
    
    async signInWithGoogle() {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return;
        }
        
        try {
            UIManager.showLoading('Signing in...');
            const result = await this.auth.signInWithPopup(this.googleProvider);
            this.user = result.user;
            console.log('Google sign-in successful:', this.user);
            UIManager.hideLoading();
            return this.user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            UIManager.hideLoading();
            UIManager.showError('Sign-in failed. Please try again.');
            throw error;
        }
    },
    
    async signOut() {
        try {
            UIManager.showLoading('Signing out...');
            await this.auth.signOut();
            this.user = null;
            console.log('User signed out');
            UIManager.hideLoading();
        } catch (error) {
            console.error('Sign-out error:', error);
            UIManager.hideLoading();
            UIManager.showError('Sign-out failed. Please try again.');
            throw error;
        }
    },
    
    handleAuthStateChange(user) {
        if (user) {
            console.log('User authenticated:', user.displayName);
            UIManager.showMainApp();
            UIManager.showUserProfile(user);
            ChatManager.loadUserChats(user.uid);
            AccessControl.enableAIFeatures();
        } else {
            console.log('User not authenticated');
            UIManager.showLoginScreen();
            UIManager.hideUserProfile();
            ChatManager.clearChats();
            AccessControl.disableAIFeatures();
        }
    },
    
    isAuthenticated() {
        return this.user !== null;
    }
};

const AccessControl = {
    
    enableAIFeatures() {
        // Enable all AI-related functionality
        const chatInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const chatBox = document.getElementById('chat-box');
        
        if (chatInput) {
            chatInput.disabled = false;
            chatInput.placeholder = 'Ask your career question...';
        }
        
        if (sendButton) {
            sendButton.disabled = false;
        }
        
        // Remove any overlay that might be blocking the interface
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        console.log('AI features enabled for authenticated user');
    },
    
    disableAIFeatures() {
        // Disable all AI-related functionality
        const chatInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        
        if (chatInput) {
            chatInput.disabled = true;
            chatInput.placeholder = 'Please sign in to use the AI service';
        }
        
        if (sendButton) {
            sendButton.disabled = true;
        }
        
        console.log('AI features disabled - user not authenticated');
    },
    
    checkAuthBeforeAction(action) {
        if (!FirebaseAuthManager.isAuthenticated()) {
            UIManager.showError('Please sign in to use this feature');
            UIManager.showLoginScreen();
            return false;
        }
        return true;
    }
};

const ChatManager = {
    chats: [],
    currentChatId: null,
    maxChats: 50,
    
    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    createNewChat() {
        if (!AccessControl.checkAuthBeforeAction('create chat')) {
            return;
        }
        
        if (window.state && window.state.chatHistory && window.state.chatHistory.length > 0) {
            this.saveCurrentChat();
        }
        
        this.currentChatId = this.generateChatId();
        this.clearCurrentChat();
        
        const newChat = {
            id: this.currentChatId,
            title: 'New Career Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            userId: FirebaseAuthManager.user.uid
        };
        
        this.chats.unshift(newChat);
        this.saveChatsToStorage();
        
        if (typeof displayWelcomeMessage === 'function') {
            setTimeout(displayWelcomeMessage, 300);
        }
        
        console.log('New chat created:', this.currentChatId);
    },
    
    saveCurrentChat() {
        if (!FirebaseAuthManager.isAuthenticated() || !this.currentChatId) {
            return;
        }
        
        if (!window.state || !window.state.chatHistory || window.state.chatHistory.length === 0) {
            return;
        }
        
        const chatIndex = this.chats.findIndex(chat => chat.id === this.currentChatId);
        const chatTitle = this.generateChatTitle(window.state.chatHistory[0].message);
        
        const chatData = {
            id: this.currentChatId,
            title: chatTitle,
            messages: [...window.state.chatHistory],
            conversationHistory: window.state.conversationHistory ? [...window.state.conversationHistory] : [],
            contextMemory: window.state.contextMemory ? [...window.state.contextMemory] : [],
            updatedAt: new Date().toISOString(),
            userId: FirebaseAuthManager.user.uid
        };
        
        if (chatIndex >= 0) {
            this.chats[chatIndex] = { ...this.chats[chatIndex], ...chatData };
        } else {
            chatData.createdAt = new Date().toISOString();
            this.chats.unshift(chatData);
        }
        
        if (this.chats.length > this.maxChats) {
            this.chats = this.chats.slice(0, this.maxChats);
        }
        
        this.saveChatsToStorage();
        console.log('Chat saved:', this.currentChatId);
    },
    
    loadChat(chatId) {
        if (!AccessControl.checkAuthBeforeAction('load chat')) {
            return;
        }
        
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;
        
        if (this.currentChatId && window.state && window.state.chatHistory && window.state.chatHistory.length > 0) {
            this.saveCurrentChat();
        }
        
        this.currentChatId = chatId;
        this.clearCurrentChat();
        
        if (window.state) {
            if (chat.messages) {
                window.state.chatHistory = [...chat.messages];
            }
            if (chat.conversationHistory) {
                window.state.conversationHistory = [...chat.conversationHistory];
            }
            if (chat.contextMemory) {
                window.state.contextMemory = [...chat.contextMemory];
            }
        }
        
        if (typeof restoreChatHistory === 'function') {
            restoreChatHistory();
        } else {
            const chatBox = document.getElementById('chat-box');
            if (chatBox) {
                chatBox.innerHTML = '';
                chat.messages.forEach(item => {
                    if (typeof appendMessage === 'function') {
                        appendMessage('user', item.message);
                        appendMessage('bot', item.response);
                    }
                });
            }
        }
        
        console.log('Chat loaded:', chatId);
    },
    
    deleteChat(chatId) {
        if (!AccessControl.checkAuthBeforeAction('delete chat')) {
            return;
        }
        
        if (confirm('Are you sure you want to delete this chat?')) {
            this.chats = this.chats.filter(chat => chat.id !== chatId);
            
            if (this.currentChatId === chatId) {
                this.currentChatId = null;
                this.clearCurrentChat();
            }
            
            this.saveChatsToStorage();
            
            if (this.chats.length === 0) {
                setTimeout(() => {
                    if (typeof displayWelcomeMessage === 'function') {
                        displayWelcomeMessage();
                    }
                }, 300);
            }
            
            console.log('Chat deleted:', chatId);
        }
    },
    
    clearCurrentChat() {
        if (window.state) {
            window.state.chatHistory = [];
            window.state.conversationHistory = [];
            window.state.contextMemory = [];
            window.state.initialized = false;
        }
        
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
            chatBox.innerHTML = '';
        }
    },
    
    clearChats() {
        this.chats = [];
        this.currentChatId = null;
        this.clearCurrentChat();
        this.saveChatsToStorage();
    },
    
    generateChatTitle(firstMessage) {
        if (!firstMessage) return 'New Career Chat';
        
        const title = firstMessage.length > 40 
            ? firstMessage.substring(0, 40) + '...' 
            : firstMessage;
        
        return title.charAt(0).toUpperCase() + title.slice(1);
    },
    
    loadUserChats(userId) {
        const stored = localStorage.getItem(`career_mentor_chats_${userId}`);
        if (stored) {
            try {
                this.chats = JSON.parse(stored);
                console.log(`Loaded ${this.chats.length} chats for user:`, userId);
            } catch (error) {
                console.error('Error loading chats:', error);
                this.chats = [];
            }
        }
    },
    
    saveChatsToStorage() {
        if (FirebaseAuthManager.user) {
            const userId = FirebaseAuthManager.user.uid;
            localStorage.setItem(`career_mentor_chats_${userId}`, JSON.stringify(this.chats));
        }
    },
    
    exportChat(chatId) {
        if (!AccessControl.checkAuthBeforeAction('export chat')) {
            return;
        }
        
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;
        
        const exportData = {
            title: chat.title,
            createdAt: chat.createdAt,
            messages: chat.messages.map(msg => ({
                question: msg.message,
                answer: msg.response,
                timestamp: msg.timestamp || 'N/A'
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `career-chat-${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        link.click();
        
        console.log('Chat exported:', chatId);
    }
};

const UIManager = {
    
    init() {
        this.injectCSS();
        this.createAuthUI();
        this.createLoginScreen();
        this.createLoadingIndicator();
        this.bindEvents();
    },
    
    injectCSS() {
        const css = `
            /* Login Screen Styles */
           /* Evolv AI Authentication Styles */

.auth-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 35%, #60a5fa 70%, #93c5fd 100%);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    overflow: hidden;
}

.auth-overlay::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
    pointer-events: none;
}

.login-container {
    background: rgba(255, 255, 255, 0.98);
    padding: 45px 40px;
    border-radius: 24px;
    box-shadow: 0 32px 64px rgba(30, 64, 175, 0.2),
                0 16px 32px rgba(59, 130, 246, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.8);
    text-align: center;
    max-width: 440px;
    width: 90%;
    backdrop-filter: blur(20px);
    animation: fadeInScale 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(255, 255, 255, 0.3);
    position: relative;
}

@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
        filter: blur(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
    }
}

.login-header {
    margin-bottom: 35px;
}

.login-title {
    font-size: 36px;
    font-weight: 800;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
}

.login-title::after {
    content: ' AI';
    background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
}

.login-subtitle {
    font-size: 17px;
    color: #64748b;
    line-height: 1.6;
    font-weight: 400;
}

.login-features {
    margin: 35px 0;
    text-align: left;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%);
    padding: 25px;
    border-radius: 16px;
    border: 1px solid rgba(59, 130, 246, 0.1);
}

.feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    color: #475569;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.feature-item:last-child {
    margin-bottom: 0;
}

.feature-item:hover {
    color: #1e40af;
    transform: translateX(4px);
}

.feature-icon {
    margin-right: 15px;
    font-size: 20px;
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.google-signin-btn {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    margin-top: 25px;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3),
                0 3px 12px rgba(30, 64, 175, 0.2);
    position: relative;
    overflow: hidden;
}

.google-signin-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.google-signin-btn:hover::before {
    left: 100%;
}

.google-signin-btn:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4),
                0 6px 20px rgba(30, 64, 175, 0.3);
}

.google-signin-btn:active {
    transform: translateY(-1px);
    transition: transform 0.1s;
}

.google-icon {
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #3b82f6;
    font-size: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Top Auth Container Styles */
.auth-container {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 1000;
    display: flex;
    gap: 12px;
    align-items: center;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.98);
    padding: 10px 16px;
    border-radius: 20px;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15),
                0 4px 16px rgba(30, 64, 175, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
}

.user-profile:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2),
                0 6px 20px rgba(30, 64, 175, 0.15);
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
}

.user-email {
    font-size: 11px;
    color: #64748b;
    line-height: 1.2;
    font-weight: 500;
}

.sign-out-btn {
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    color: white;
    font-size: 12px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.sign-out-btn:hover {
    background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.3);
}

/* Mobile Profile Dropdown */
.profile-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 12px;
    margin-top: 8px;
    min-width: 180px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.profile-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.profile-dropdown .sign-out-btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 13px;
    margin: 0;
}

/* Loading Indicator */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(30, 64, 175, 0.6);
    backdrop-filter: blur(8px);
    z-index: 15000;
    display: none;
    align-items: center;
    justify-content: center;
}

.loading-content {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 20px 50px rgba(30, 64, 175, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.spinner {
    border: 4px solid rgba(59, 130, 246, 0.2);
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-text {
    color: #475569;
    font-size: 16px;
    font-weight: 600;
}

/* Error Message */
.error-message {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 16px;
    z-index: 20000;
    display: none;
    animation: slideDownError 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-weight: 600;
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes slideDownError {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-30px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
    }
}

/* Success Message */
.success-message {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 16px;
    z-index: 20000;
    display: none;
    animation: slideDownSuccess 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-weight: 600;
    box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes slideDownSuccess {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-30px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .auth-overlay {
        padding: 20px;
    }
    
    .auth-container {
        top: 16px;
        right: 16px;
    }
    
    .login-container {
        padding: 35px 25px;
        margin: 0;
        max-width: none;
        width: 100%;
    }
    
    .login-title {
        font-size: 28px;
    }
    
    .login-subtitle {
        font-size: 15px;
    }
    
    /* Mobile-specific user profile styles */
    .user-profile {
        padding: 12px;
    }
    
    .user-profile .user-info {
        display: none; /* Hide user info on mobile */
    }
    
    .user-profile > .sign-out-btn {
        display: none; /* Hide only the inline sign-out button on mobile */
    }
    
    /* Show sign-out button inside dropdown */
    .profile-dropdown .sign-out-btn {
        display: block !important;
    }
    
    .user-avatar {
        width: 40px;
        height: 40px;
    }
    
    .google-signin-btn {
        padding: 18px 32px;
        font-size: 15px;
    }
    
    .login-features {
        padding: 20px;
    }
    
    .feature-item {
        font-size: 14px;
        margin-bottom: 16px;
    }
}

@media (max-width: 480px) {
    .login-container {
        padding: 30px 20px;
    }
    
    .login-title {
        font-size: 24px;
    }
    
    .auth-container {
        top: 12px;
        right: 12px;
    }
    
    .user-profile {
        padding: 10px;
    }
    
    .user-avatar {
        width: 36px;
        height: 36px;
    }
}

/* Hide main app when not authenticated */
.app-hidden {
    display: none !important;
}

/* Additional modern touches */
.login-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 197, 253, 0.3));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
}

/* Floating animation for decorative elements */
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

.login-header::before {
    content: '🚀';
    display: block;
    font-size: 48px;
    margin-bottom: 16px;
    animation: float 3s ease-in-out infinite;
}
        `;
        
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    },
    
    createLoginScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'auth-overlay';
        overlay.id = 'auth-overlay';
        
        overlay.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <h1 class="login-title">Evolv</h1>
                    <p class="login-subtitle">Your personal AI career advisor powered by advanced AI technology</p>
                </div>
                
                <div class="login-features">
                    <div class="feature-item">
                        <span class="feature-icon">💼</span>
                        <span>Personalized career guidance</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📊</span>
                        <span>Industry insights and trends</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🎯</span>
                        <span>Skills development recommendations</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">💬</span>
                        <span>24/7 AI-powered conversations</span>
                    </div>
                </div>
                
                <button class="google-signin-btn" id="login-google-btn">
                    <div class="google-icon">G</div>
                    Continue with Google
                </button>
                
                <p style="margin-top: 20px; font-size: 12px; color: #888;">
                    Secure authentication • Your data is protected
                </p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    },
    
    createAuthUI() {
        const authContainer = document.createElement('div');
        authContainer.className = 'auth-container';
        authContainer.id = 'auth-container';
        authContainer.style.display = 'none'; // Initially hidden
        
        document.body.appendChild(authContainer);
    },
    
    createLoadingIndicator() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.id = 'loading-overlay';
        
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p id="loading-text">Loading...</p>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
        
        // Create error message element
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.id = 'error-message';
        document.body.appendChild(errorMessage);
    },
    
    showLoginScreen() {
        const overlay = document.getElementById('auth-overlay');
        const authContainer = document.getElementById('auth-container');
        
        if (overlay) {
            overlay.style.display = 'flex';
        }
        
        if (authContainer) {
            authContainer.style.display = 'none';
        }
        
        // Hide main app content
        this.hideMainApp();
        
        console.log('Login screen shown');
    },
    
    showMainApp() {
        const overlay = document.getElementById('auth-overlay');
        const authContainer = document.getElementById('auth-container');
        
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        if (authContainer) {
            authContainer.style.display = 'flex';
        }
        
        // Show main app content
        const mainElements = ['chat-container', 'chat-box', 'input-container', 'user-input', 'send-button'];
        mainElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('app-hidden');
                element.style.display = '';
            }
        });
        
        console.log('Main app shown');
    },
    
    hideMainApp() {
        // Hide main app content
        const mainElements = ['chat-container', 'chat-box', 'input-container'];
        mainElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('app-hidden');
            }
        });
    },
    
    showUserProfile(user) {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        // Check if we're on mobile
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile layout: Just avatar with dropdown
            authContainer.innerHTML = `
                <div class="user-profile" id="user-profile-btn">
                    <img src="${user.photoURL || 'https://via.placeholder.com/40'}" 
                         alt="${user.displayName || 'User'}" 
                         class="user-avatar"
                         onerror="this.src='https://via.placeholder.com/40'">
                    <div class="profile-dropdown" id="profile-dropdown">
                        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px;">
                            <div class="user-name">${user.displayName || 'User'}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                        <button class="sign-out-btn" id="sign-out-btn">
                            Sign Out
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Desktop layout: Full profile with inline sign-out button
            authContainer.innerHTML = `
                <div class="user-profile">
                    <img src="${user.photoURL || 'https://via.placeholder.com/32'}" 
                         alt="${user.displayName || 'User'}" 
                         class="user-avatar"
                         onerror="this.src='https://via.placeholder.com/32'">
                    <div class="user-info">
                        <div class="user-name">${user.displayName || 'User'}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                    <button class="sign-out-btn" id="sign-out-btn">
                        Sign Out
                    </button>
                </div>
            `;
        }
        
        // Bind events
        this.bindProfileEvents();
    },
    
    bindProfileEvents() {
        const signOutBtn = document.getElementById('sign-out-btn');
        const profileBtn = document.getElementById('user-profile-btn');
        const dropdown = document.getElementById('profile-dropdown');
        
        // Sign out functionality
        if (signOutBtn) {
            signOutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Hide dropdown if on mobile
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
                
                FirebaseAuthManager.signOut();
            });
        }
        
        // Mobile dropdown functionality
        if (profileBtn && dropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!profileBtn.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
            
            // Prevent dropdown from closing when clicking inside it
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    },
    
    hideUserProfile() {
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
            authContainer.style.display = 'none';
        }
    },
    
    showLoading(text = 'Loading...') {
        const loadingOverlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        if (loadingText) {
            loadingText.textContent = text;
        }
    },
    
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    },
    
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    },
    
    bindEvents() {
        // Bind login button event
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'login-google-btn') {
                e.preventDefault();
                FirebaseAuthManager.signInWithGoogle();
            }
        });
        
        // Handle window resize to update profile layout
        window.addEventListener('resize', () => {
            if (FirebaseAuthManager.user) {
                this.showUserProfile(FirebaseAuthManager.user);
            }
        });
    }
};

// Enhanced message handling with authentication check
function createSecureMessageHandler() {
    // Store original handleSendMessage if it exists
    const originalHandleSendMessage = window.handleSendMessage;
    
    // Create new secure message handler
    window.handleSendMessage = async function(...args) {
        // Check authentication before processing
        if (!AccessControl.checkAuthBeforeAction('send message')) {
            return;
        }
        
        // Call original handler if it exists
        if (typeof originalHandleSendMessage === 'function') {
            await originalHandleSendMessage.apply(this, args);
        }
        
        // Auto-save chat after message
        if (FirebaseAuthManager.user) {
            setTimeout(() => {
                ChatManager.saveCurrentChat();
            }, 1000);
        }
    };
}

// Auto-save functionality
let autoSaveInterval;

function startAutoSave() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    
    autoSaveInterval = setInterval(() => {
        if (FirebaseAuthManager.user && window.state && window.state.chatHistory && window.state.chatHistory.length > 0) {
            ChatManager.saveCurrentChat();
        }
    }, 30000); // Save every 30 seconds
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Enhanced initialization
function initializeExtension() {
    if (typeof firebase === 'undefined') {
        console.log('Firebase not loaded yet, retrying...');
        setTimeout(initializeExtension, 1000);
        return;
    }
    
    try {
        console.log('Initializing CareerMentor Extension...');
        
        // Initialize managers
        FirebaseAuthManager.init();
        UIManager.init();
        
        // Set up secure message handling
        createSecureMessageHandler();
        
        // Start auto-save
        startAutoSave();
        
        // Initially disable AI features until user is authenticated
        AccessControl.disableAIFeatures();
        
        console.log('CareerMentor Extension initialized successfully');
    } catch (error) {
        console.error('Error initializing CareerMentor Extension:', error);
        UIManager.showError('Failed to initialize the application. Please refresh the page.');
    }
}

// Enhanced cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (FirebaseAuthManager.user && window.state && window.state.chatHistory && window.state.chatHistory.length > 0) {
        ChatManager.saveCurrentChat();
    }
    
    stopAutoSave();
});

// Enhanced visibility change handling
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Save when tab becomes hidden
        if (FirebaseAuthManager.user && window.state && window.state.chatHistory && window.state.chatHistory.length > 0) {
            ChatManager.saveCurrentChat();
        }
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

// Global API exposure
window.CareerMentorExtension = {
    FirebaseAuthManager,
    ChatManager,
    UIManager,
    AccessControl,
    
    // Public methods for external integration
    isAuthenticated: () => FirebaseAuthManager.isAuthenticated(),
    getCurrentUser: () => FirebaseAuthManager.user,
    signIn: () => FirebaseAuthManager.signInWithGoogle(),
    signOut: () => FirebaseAuthManager.signOut(),
    createNewChat: () => ChatManager.createNewChat(),
    saveCurrentChat: () => ChatManager.saveCurrentChat(),
    
    // Event hooks for custom integration
    onAuthStateChanged: (callback) => {
        const originalHandler = FirebaseAuthManager.handleAuthStateChange;
        FirebaseAuthManager.handleAuthStateChange = (user) => {
            originalHandler.call(FirebaseAuthManager, user);
            if (typeof callback === 'function') {
                callback(user);
            }
        };
    }
};