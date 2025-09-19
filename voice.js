const VoiceInputWithGemini = {
    recognition: null,
    isListening: false,
    isSupported: false,
    voiceButton: null,
    voiceIndicator: null,
    languageDropdown: null,
    selectedLanguage: 'en',
    
    GEMINI_API_KEY: 'AIzaSyAJ5cAvR_-I_4E8TfHvpLQe-jDYDLtopg4',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent',
    
    targetLanguages: {
        'en': 'English',
        'hi': 'Hindi',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'bn': 'Bengali',
        'ta': 'Tamil',
        'te': 'Telugu',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi',
        'ur': 'Urdu'
    },
    
    init() {
        setTimeout(() => {
            this.checkSupport();
            this.createVoiceButton();
            this.createLanguageDropdown();
            this.setupRecognition();
            this.injectVoiceCSS();
        }, 1000);
    },
    
    checkSupport() {
        this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        if (!this.isSupported) {
            console.warn('Speech recognition not supported in this browser');
        }
    },
    
    createVoiceButton() {
        const sendBtn = document.querySelector('button[type="submit"], #send-btn, button');
        const textarea = document.querySelector('textarea');
        
        if (!sendBtn || !textarea) {
            console.error('Send button or textarea not found');
            return;
        }
        
        this.voiceButton = document.createElement('button');
        this.voiceButton.type = 'button';
        this.voiceButton.id = 'voice-input-btn';
        this.voiceButton.className = 'voice-input-btn';
        this.voiceButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
        `;
        this.voiceButton.title = 'Voice Input with Auto-Translation (Click to select language)';
        
        sendBtn.parentNode.insertBefore(this.voiceButton, sendBtn);
        
        const currentPadding = window.getComputedStyle(textarea).paddingRight;
        const newPadding = '6rem';
        textarea.style.paddingRight = newPadding;
        
        this.voiceIndicator = document.createElement('div');
        this.voiceIndicator.className = 'voice-status-indicator';
        this.voiceIndicator.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Ready to listen...
        `;
        document.body.appendChild(this.voiceIndicator);
        
        this.voiceButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.isListening) {
                this.stopListening();
            } else {
                this.showLanguageDropdown();
            }
        });
        
        if (!this.isSupported) {
            this.voiceButton.disabled = true;
            this.voiceButton.title = 'Voice input not supported in this browser';
            this.voiceButton.style.opacity = '0.5';
        }
    },
    
    createLanguageDropdown() {
        this.languageDropdown = document.createElement('div');
        this.languageDropdown.className = 'language-dropdown';
        this.languageDropdown.style.display = 'none';
        
        const header = document.createElement('div');
        header.className = 'dropdown-header';
        header.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M13 8H7"/>
                <path d="M17 12H7"/>
                <path d="M11 16H7"/>
            </svg>
            Select Language to Speak
        `;
        this.languageDropdown.appendChild(header);
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'language-options';
        
        Object.entries(this.targetLanguages).forEach(([code, name]) => {
            const option = document.createElement('div');
            option.className = 'language-option';
            option.dataset.langCode = code;
            
            const flags = {
                'en': '<span class="flag">🇺🇸</span>',
                'hi': '<span class="flag">🇮🇳</span>',
                'es': '<span class="flag">🇪🇸</span>',
                'fr': '<span class="flag">🇫🇷</span>',
                'de': '<span class="flag">🇩🇪</span>',
                'it': '<span class="flag">🇮🇹</span>',
                'pt': '<span class="flag">🇵🇹</span>',
                'ru': '<span class="flag">🇷🇺</span>',
                'zh': '<span class="flag">🇨🇳</span>',
                'ja': '<span class="flag">🇯🇵</span>',
                'ko': '<span class="flag">🇰🇷</span>',
                'ar': '<span class="flag">🇸🇦</span>',
                'bn': '<span class="flag">🇧🇩</span>',
                'ta': '<span class="flag">🇮🇳</span>',
                'te': '<span class="flag">🇮🇳</span>',
                'mr': '<span class="flag">🇮🇳</span>',
                'gu': '<span class="flag">🇮🇳</span>',
                'kn': '<span class="flag">🇮🇳</span>',
                'ml': '<span class="flag">🇮🇳</span>',
                'pa': '<span class="flag">🇮🇳</span>',
                'ur': '<span class="flag">🇵🇰</span>'
            };
            
            const flag = flags[code] || '<span class="flag">🌐</span>';
            option.innerHTML = `${flag} ${name}`;
            
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectLanguage(code, name);
            });
            
            optionsContainer.appendChild(option);
        });
        
        this.languageDropdown.appendChild(optionsContainer);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'dropdown-close';
        closeBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        `;
        closeBtn.title = 'Close';
        closeBtn.addEventListener('click', () => this.hideLanguageDropdown());
        this.languageDropdown.appendChild(closeBtn);
        
        document.body.appendChild(this.languageDropdown);
        
        document.addEventListener('click', (e) => {
            if (!this.languageDropdown.contains(e.target) && 
                !this.voiceButton.contains(e.target)) {
                this.hideLanguageDropdown();
            }
        });
    },
    
    showLanguageDropdown() {
        if (!this.languageDropdown) return;
        
        const rect = this.voiceButton.getBoundingClientRect();
        this.languageDropdown.style.position = 'fixed';
        this.languageDropdown.style.top = `${rect.bottom + 10}px`;
        this.languageDropdown.style.left = `${rect.left}px`;
        this.languageDropdown.style.display = 'block';
        this.languageDropdown.classList.add('show');
        
        setTimeout(() => {
            const dropdownRect = this.languageDropdown.getBoundingClientRect();
            if (dropdownRect.right > window.innerWidth) {
                this.languageDropdown.style.left = `${window.innerWidth - dropdownRect.width - 20}px`;
            }
            if (dropdownRect.bottom > window.innerHeight) {
                this.languageDropdown.style.top = `${rect.top - dropdownRect.height - 10}px`;
            }
        }, 10);
    },
    
    hideLanguageDropdown() {
        if (!this.languageDropdown) return;
        
        this.languageDropdown.classList.remove('show');
        setTimeout(() => {
            this.languageDropdown.style.display = 'none';
        }, 300);
    },
    
    selectLanguage(code, name) {
        this.selectedLanguage = code;
        this.hideLanguageDropdown();
        
        const flags = {
            'en': '🇺🇸',
            'hi': '🇮🇳',
            'es': '🇪🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪',
            'it': '🇮🇹',
            'pt': '🇵🇹',
            'ru': '🇷🇺',
            'zh': '🇨🇳',
            'ja': '🇯🇵',
            'ko': '🇰🇷',
            'ar': '🇸🇦',
            'bn': '🇧🇩',
            'ta': '🇮🇳',
            'te': '🇮🇳',
            'mr': '🇮🇳',
            'gu': '🇮🇳',
            'kn': '🇮🇳',
            'ml': '🇮🇳',
            'pa': '🇮🇳',
            'ur': '🇵🇰'
        };
        
        const flag = flags[code] || '🌐';
        this.voiceButton.title = `Voice Input (${name}) - Click to speak`;
        
        this.showVoiceIndicator(`${flag} ${name} selected. Starting to listen...`);
        
        setTimeout(() => {
            this.startListening();
        }, 1000);
    },
    
    setupRecognition() {
        if (!this.isSupported) return;
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceButton();
            this.showVoiceIndicator(`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                Listening...
            `);
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (interimTranscript) {
                this.voiceIndicator.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                    "${interimTranscript.trim()}"
                `;
            }
            
            if (finalTranscript) {
                this.processVoiceInput(finalTranscript.trim());
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButton();
            this.hideVoiceIndicator();
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceButton();
            this.showErrorMessage(event.error);
        };
    },
    
    async processVoiceInput(transcript) {
        const userInput = document.querySelector('textarea');
        if (!userInput) return;
        
        try {
            this.showVoiceIndicator(`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Processing and translating...
            `);
            
            const targetLang = this.selectedLanguage;
            const targetLanguageName = this.targetLanguages[targetLang] || 'English';
            
            if (targetLang === 'en') {
                userInput.value = transcript;
                this.resizeInput(userInput);
                this.showVoiceIndicator(`
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Text captured successfully!
                `);
                setTimeout(() => this.hideVoiceIndicator(), 2000);
                return;
            }
            
            const translatedText = await this.translateWithGemini(transcript, targetLanguageName);
            
            if (translatedText) {
                userInput.value = translatedText;
                this.resizeInput(userInput);
                this.showVoiceIndicator(`
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Translated to ${targetLanguageName}
                `);
                setTimeout(() => this.hideVoiceIndicator(), 2000);
            } else {
                userInput.value = transcript;
                this.resizeInput(userInput);
                this.showVoiceIndicator(`
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    Translation failed, using original text
                `);
                setTimeout(() => this.hideVoiceIndicator(), 3000);
            }
            
        } catch (error) {
            console.error('Error processing voice input:', error);
            userInput.value = transcript;
            this.resizeInput(userInput);
            this.showErrorMessage('translation_error');
        }
    },
    
    async translateWithGemini(text, targetLanguage) {
        try {
            const prompt = `Detect the language of the following text and translate it to ${targetLanguage}. If the text is already in ${targetLanguage}, return it as-is. Only return the translated text, no explanations:

Text: "${text}"`;
            
            const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text.trim();
            }
            
            return null;
            
        } catch (error) {
            console.error('Gemini translation error:', error);
            return null;
        }
    },
    
    resizeInput(input) {
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
        input.focus();
    },
    
    startListening() {
        if (!this.isSupported || this.isListening) return;
        
        if (this.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            this.showErrorMessage('api_key_missing');
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.showErrorMessage('start_error');
        }
    },
    
    stopListening() {
        if (!this.isSupported || !this.isListening) return;
        
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
        }
    },
    
    updateVoiceButton() {
        if (!this.voiceButton) return;
        
        if (this.isListening) {
            this.voiceButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
            `;
            this.voiceButton.title = 'Stop voice input';
            this.voiceButton.classList.add('listening');
        } else {
            this.voiceButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
            `;
            const langName = this.targetLanguages[this.selectedLanguage] || 'English';
            this.voiceButton.title = `Voice Input (${langName}) - Click to select language`;
            this.voiceButton.classList.remove('listening');
        }
    },
    
    showVoiceIndicator(message) {
        if (this.voiceIndicator) {
            this.voiceIndicator.innerHTML = message;
            this.voiceIndicator.style.display = 'block';
            this.voiceIndicator.classList.add('active');
            this.voiceIndicator.classList.remove('error');
        }
    },
    
    hideVoiceIndicator() {
        if (this.voiceIndicator) {
            this.voiceIndicator.style.display = 'none';
            this.voiceIndicator.classList.remove('active', 'error');
        }
    },
    
    showErrorMessage(errorType) {
        const errorMessages = {
            'no-speech': 'No speech detected. Please speak clearly.',
            'audio-capture': 'Microphone access failed. Please check permissions.',
            'not-allowed': 'Microphone access denied. Please enable microphone permissions.',
            'network': 'Network error. Please check your connection.',
            'start_error': 'Could not start voice input. Please try again.',
            'aborted': 'Voice input was cancelled.',
            'translation_error': 'Translation failed. Original text used.',
            'api_key_missing': 'Please set your Gemini API key in the code.'
        };
        
        const message = errorMessages[errorType] || 'Voice input error. Please try again.';
        
        if (this.voiceIndicator) {
            this.voiceIndicator.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                ${message}
            `;
            this.voiceIndicator.style.display = 'block';
            this.voiceIndicator.classList.add('error');
            this.voiceIndicator.classList.remove('active');
            
            setTimeout(() => {
                this.hideVoiceIndicator();
            }, 4000);
        }
    },
    
    injectVoiceCSS() {
        const voiceCSS = `
        .voice-input-btn {
            position: absolute;
            right: 55px;
            top: 50%;
            transform: translateY(-50%);
            width: 36px;
            height: 36px;
            background: var(--gradient-primary);
            border: none;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-sm);
            z-index: 10;
        }
        
        .voice-input-btn:hover:not(:disabled) {
            background: var(--gradient-primary);
            transform: translateY(-50%) scale(1.05);
            box-shadow: var(--shadow-md);
        }
        
        .voice-input-btn:active {
            transform: translateY(-50%) scale(0.95);
        }
        
        .voice-input-btn:focus {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
        }
        
        .voice-input-btn.listening {
            background: #ff5722;
            animation: voicePulse 1.5s infinite;
        }
        
        .voice-input-btn.listening::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: voiceShimmer 2s infinite;
            border-radius: 50%;
        }
        
        .voice-input-btn:disabled {
            background: var(--bg-tertiary);
            color: var(--text-muted);
            cursor: not-allowed;
            transform: translateY(-50%);
            box-shadow: none;
        }
        
        .language-dropdown {
            position: fixed;
            background: var(--bg-primary);
            border-radius: 1rem;
            box-shadow: var(--shadow-xl);
            border: 1px solid var(--border-light);
            z-index: 10001;
            min-width: 250px;
            max-width: 300px;
            max-height: 400px;
            overflow: hidden;
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .language-dropdown.show {
            transform: scale(1);
            opacity: 1;
        }
        
        .dropdown-header {
            background: var(--gradient-primary);
            color: white;
            padding: 1rem 1.25rem;
            font-weight: 600;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
            position: relative;
        }
        
        .dropdown-close {
            position: absolute;
            top: 0.75rem;
            right: 1rem;
            background: none;
            border: none;
            color: white;
            font-size: 1.125rem;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 50%;
            transition: background 0.2s;
            width: auto;
            height: auto;
            transform: none;
        }
        
        .dropdown-close:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .language-options {
            max-height: 300px;
            overflow-y: auto;
            padding: 0.5rem 0;
        }
        
        .language-option {
            padding: 0.75rem 1.25rem;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            border-bottom: 1px solid var(--border-light);
            color: var(--text-primary);
        }
        
        .language-option:last-child {
            border-bottom: none;
        }
        
        .language-option:hover {
            background: var(--bg-secondary);
            transform: translateX(5px);
        }
        
        .language-option:active {
            background: var(--bg-tertiary);
        }
        
        .language-option .flag {
            font-size: 1.2em;
            width: 20px;
            text-align: center;
        }
        
        .voice-status-indicator {
            position: fixed;
            top: 1.25rem;
            right: 1.25rem;
            background: var(--gradient-primary);
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 1.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 10000;
            box-shadow: var(--shadow-lg);
            border: 1px solid rgba(255,255,255,0.1);
            display: none;
            max-width: 350px;
            word-wrap: break-word;
            text-align: center;
            align-items: center;
            gap: 0.5rem;
        }
        
        .voice-status-indicator.active {
            animation: voiceIndicatorPulse 2s infinite;
        }
        
        .voice-status-indicator.error {
            background: #f44336;
            animation: voiceErrorShake 0.5s;
        }
        
        .language-options::-webkit-scrollbar {
            width: 6px;
        }
        
        .language-options::-webkit-scrollbar-track {
            background: var(--bg-secondary);
        }
        
        
        .language-options::-webkit-scrollbar-thumb {
            background: var(--border-primary);
            border-radius: 3px;
        }
        
        .language-options::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
        }
        
        /* Animations */
        @keyframes voicePulse {
            0% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-50%) scale(1.05); }
            100% { transform: translateY(-50%) scale(1); }
        }
        
        @keyframes voiceShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        @keyframes voiceIndicatorPulse {
            0%, 100% {
                transform: scale(1);
                box-shadow: var(--shadow-lg);
            }
            50% {
                transform: scale(1.02);
                box-shadow: var(--shadow-xl);
            }
        }
        
        @keyframes voiceErrorShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .voice-input-btn {
                width: 36px; /* Keep consistent with main design */
                height: 36px;
                font-size: 0.875rem;
                right: 50px;
            }
            
            .voice-status-indicator {
                top: 1rem;
                right: 1rem;
                left: 1rem;
                font-size: 0.75rem;
                padding: 0.625rem 1rem;
                border-radius: 1.25rem;
            }
            
            .language-dropdown {
                min-width: 200px;
                max-width: 250px;
                left: 1rem !important;
                right: 1rem !important;
                width: auto !important;
            }
            
            .language-option {
                padding: 0.625rem 1rem;
                font-size: 0.8125rem;
            }
        }
        
        @media (max-width: 480px) {
            .voice-input-btn {
                width: 32px;
                height: 32px;
                font-size: 0.75rem;
                right: 45px;
            }
            
            .voice-status-indicator {
                font-size: 0.6875rem;
                padding: 0.5rem 0.75rem;
            }
            
            .language-dropdown {
                min-width: 180px;
                max-width: 220px;
            }
            
            .language-option {
                padding: 0.5rem 0.75rem;
                font-size: 0.75rem;
            }
        }
        `;
        
        const style = document.createElement('style');
        style.textContent = voiceCSS;
        document.head.appendChild(style);
    }
};


function setupVoiceKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {

        if (e.ctrlKey && e.shiftKey && e.key === 'V') {
            e.preventDefault();
            if (VoiceInputWithGemini.isListening) {
                VoiceInputWithGemini.stopListening();
            } else {
                VoiceInputWithGemini.showLanguageDropdown();
            }
        }
    });
}


function initializeVoiceWithGemini() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            VoiceInputWithGemini.init();
            setupVoiceKeyboardShortcut();
        });
    } else {
        VoiceInputWithGemini.init();
        setupVoiceKeyboardShortcut();
    }
}


initializeVoiceWithGemini();


window.VoiceInputWithGemini = VoiceInputWithGemini;


window.setGeminiApiKey = function(apiKey) {
    VoiceInputWithGemini.GEMINI_API_KEY = apiKey;
    console.log('Gemini API key updated');
};