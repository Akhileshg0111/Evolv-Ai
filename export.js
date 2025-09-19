const EnhancedFeatures = {
    speechSynthesis: window.speechSynthesis,
    currentUtterance: null,
    isPlaying: false,
    currentAudio: null,
    wasPlayingBeforeHidden: false,
    isPaused: false,
    googleTTSApiKey: null,
    voices: [],
    
    init() {
        this.addEnhancedStyles();
        this.setupMutationObserver();
        this.setupGlobalEventListeners();
        this.loadVoices();
        this.loadGoogleTTSConfig();
    },
    
    loadGoogleTTSConfig() {
        this.googleTTSApiKey = 'AIzaSyCNEiD-Qt3YP6-Yp5DNqt1PAyaTW7hB3_4';
    },
    
    loadVoices() {
        const loadVoicesImpl = () => {
            this.voices = this.speechSynthesis.getVoices();
        };
        
        loadVoicesImpl();
        this.speechSynthesis.onvoiceschanged = loadVoicesImpl;
        setTimeout(loadVoicesImpl, 100);
        setTimeout(loadVoicesImpl, 1000);
    },
    
    addEnhancedStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-buttons {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.75rem;
                padding-top: 0.75rem;
                border-top: 1px solid rgba(0, 0, 0, 0.1);
                flex-wrap: wrap;
            }
            
            .enhanced-btn {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.5rem 0.75rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.85rem;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .enhanced-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
            
            .enhanced-btn:active {
                transform: translateY(0);
            }
            
            .enhanced-btn.pdf-btn {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            }
            
            .enhanced-btn.pdf-btn.processing {
                background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
                animation: pulse 2s infinite;
            }
            
            .enhanced-btn.tts-btn {
                background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            }
            
            .enhanced-btn.tts-btn.playing {
                background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
                animation: pulse 2s infinite;
            }
            
            .enhanced-btn.tts-btn.paused {
                background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
            }
            
            .enhanced-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            
           @keyframes fadeSlideIn {
    0% {
        opacity: 0;
        transform: translateY(-20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeSlideOut {
    100% {
        opacity: 0;
        transform: translateY(-20px);
    }
}

.export-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 1rem 1.25rem;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
    color: #fff;
    font-family: 'Segoe UI', Roboto, sans-serif;
    font-size: 15px;
    line-height: 1.4;
    z-index: 9999;
    max-width: 320px;
    min-width: 260px;
    opacity: 0;
    transform: translateY(-20px);
    animation: fadeSlideIn 0.4s ease forwards;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.export-notification .icon {
    font-size: 18px;
    flex-shrink: 0;
}

.export-notification .message {
    flex: 1;
    word-break: break-word;
}

/* Types */
.export-notification.success {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
}
.export-notification.error {
    background: linear-gradient(135deg, #f44336, #b71c1c);
}
.export-notification.warning {
    background: linear-gradient(135deg, #ff9800, #ef6c00);
}
.export-notification.info {
    background: linear-gradient(135deg, #2196f3, #1565c0);
}

/* Fade-out class (for JS animation) */
.export-notification.fade-out {
    animation: fadeSlideOut 0.3s forwards;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
    .export-notification {
        right: 10px;
        left: 10px;
        max-width: none;
    }
}

            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .pdf-capture-container {
                position: absolute;
                top: -10000px;
                left: -10000px;
                width: 794px;
                background: white;
                padding: 40px;
                font-family: 'Arial', sans-serif;
                box-sizing: border-box;
                z-index: -1;
                visibility: hidden;
                opacity: 0;
            }
            
            .pdf-capture-content {
                width: 100%;
                word-wrap: break-word;
                line-height: 1.6;
                font-size: 14px;
                color: #333;
            }
            
            .pdf-capture-header {
                border-bottom: 2px solid #667eea;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .pdf-capture-title {
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 10px;
            }
            
            .pdf-capture-meta {
                font-size: 12px;
                color: #666;
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .pdf-capture-text {
                font-size: 14px;
                line-height: 1.8;
                color: #333;
                white-space: pre-wrap;
                word-break: break-word;
            }
        `;
        document.head.appendChild(style);
    },
    
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList.contains('bot-message')) {
                            this.enhanceBotMessage(node);
                        }
                    });
                }
            });
        });
        
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
            observer.observe(chatBox, {
                childList: true,
                subtree: true
            });
        }
    },
    
    setupGlobalEventListeners() {
        const userInput = document.getElementById('user-input');
        if (userInput) {
            userInput.addEventListener('focus', () => {
                this.stopSpeech();
            });
        }
        

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {

                this.wasPlayingBeforeHidden = this.isPlaying && !this.isPaused;
                

                if (this.currentAudio && !this.currentAudio.paused) {
                    this.currentAudio.pause();
                }
                if (this.speechSynthesis && this.speechSynthesis.speaking && !this.speechSynthesis.paused) {
                    this.speechSynthesis.pause();
                }
            } else {

                if (this.wasPlayingBeforeHidden) {
                    if (this.currentAudio && this.currentAudio.paused) {
                        this.currentAudio.play();
                    }
                    if (this.speechSynthesis && this.speechSynthesis.paused) {
                        this.speechSynthesis.resume();
                    }
                }

                this.wasPlayingBeforeHidden = false;
            }
        });
    },
    
    isWelcomeMessage(messageContent) {
        const text = this.extractCleanText(messageContent).toLowerCase();
        const welcomeKeywords = [
            'welcome', 'hello', 'hi there', 'greetings', 'good morning', 'good afternoon', 
            'good evening', 'how can i help', 'how may i assist', 'what can i do for you',
            'Evolv assistant', 'i am Evolv', 'welcome to Evolv',
        ];
        
        return welcomeKeywords.some(keyword => text.includes(keyword)) && text.length < 200;
    },
    
    enhanceBotMessage(messageElement) {
        if (messageElement.querySelector('.enhanced-buttons')) {
            return;
        }
        
        const messageContent = messageElement.querySelector('.message-content');
        if (!messageContent) return;
        
        if (messageContent.querySelector('.typing-indicator')) {
            return;
        }
        
        if (this.isWelcomeMessage(messageContent)) {
            return;
        }
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'enhanced-buttons';
        
        const pdfBtn = document.createElement('button');
        pdfBtn.className = 'enhanced-btn pdf-btn';

        pdfBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Export PDF
        `;
        pdfBtn.onclick = () => this.exportToPDFSnapshot(messageContent, pdfBtn);
        
        const ttsBtn = document.createElement('button');
        ttsBtn.className = 'enhanced-btn tts-btn';

        ttsBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Listen
        `;
        ttsBtn.onclick = () => this.toggleSpeech(messageContent, ttsBtn);
        
        buttonsContainer.appendChild(pdfBtn);
        buttonsContainer.appendChild(ttsBtn);
        
        messageContent.appendChild(buttonsContainer);
    },
    
    
    extractCleanText(messageContent) {
        const clone = messageContent.cloneNode(true);
        
        const elementsToRemove = clone.querySelectorAll('.enhanced-buttons, .response-meta, .context-indicator');
        elementsToRemove.forEach(element => element.remove());
        
        let text = clone.textContent || clone.innerText || '';
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    },
    
    detectLanguage(text) {
        const langPatterns = {
            'hi': /[\u0900-\u097F]/g,
            'ta': /[\u0B80-\u0BFF]/g,
            'te': /[\u0C00-\u0C7F]/g,
            'ml': /[\u0D00-\u0D7F]/g,
            'kn': /[\u0C80-\u0CFF]/g,
            'gu': /[\u0A80-\u0AFF]/g,
            'pa': /[\u0A00-\u0A7F]/g,
            'bn': /[\u0980-\u09FF]/g,
            'or': /[\u0B00-\u0B7F]/g,
            'ur': /[\u0600-\u06FF]/g,
            'ar': /[\u0600-\u06FF]/g,
            'zh': /[\u4e00-\u9fff]/g,
            'ja': /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g,
            'ko': /[\uac00-\ud7af]/g,
            'th': /[\u0e00-\u0e7f]/g,
            'vi': /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/gi,
            'ru': /[\u0400-\u04FF]/g,
            'fr': /[àâäçéèêëïîôöùûüÿ]/gi,
            'de': /[äöüß]/gi,
            'es': /[ñáéíóúü]/gi,
            'pt': /[ãõáéíóúâêôç]/gi,
            'it': /[àèéìíîòóù]/gi,
        };
        
        let maxMatches = 0;
        let detectedLang = 'en';
        
        for (const [lang, pattern] of Object.entries(langPatterns)) {
            const matches = (text.match(pattern) || []).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedLang = lang;
            }
        }
        
        return detectedLang;
    },
    
    getLanguageName(langCode) {
        const langNames = {
            'hi': 'Hindi',
            'ta': 'Tamil',
            'te': 'Telugu',
            'ml': 'Malayalam',
            'kn': 'Kannada',
            'gu': 'Gujarati',
            'pa': 'Punjabi',
            'bn': 'Bengali',
            'or': 'Odia',
            'ur': 'Urdu',
            'ar': 'Arabic',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'ru': 'Russian',
            'fr': 'French',
            'de': 'German',
            'es': 'Spanish',
            'pt': 'Portuguese',
            'it': 'Italian',
            'en': 'English'
        };
        
        return langNames[langCode] || 'Unknown';
    },
    
    async loadRequiredLibraries() {
        const promises = [];
        
        if (typeof html2canvas === 'undefined') {
            promises.push(new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            }));
        }
        
        if (typeof window.jspdf === 'undefined') {
            promises.push(new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            }));
        }
        
        if (promises.length > 0) {
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    },
    
    createCaptureContainer(messageContent) {

        const existingContainer = document.querySelector('.pdf-capture-container');
        if (existingContainer) {
            existingContainer.remove();
        }
    
        const text = this.extractCleanText(messageContent);
        const detectedLang = this.detectLanguage(text);
        const langName = this.getLanguageName(detectedLang);
    
        // Create outer container
        const container = document.createElement('div');
        container.className = 'pdf-capture-container';
    
        const timestamp = new Date().toLocaleString();
    
        // Clone and clean the message content
        const clonedContent = messageContent.cloneNode(true);
        const buttons = clonedContent.querySelectorAll('.enhanced-buttons');
        buttons.forEach(btn => btn.remove());
    
        // Build capture content
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'pdf-capture-content';
    
        const headerHTML = `
            <div class="pdf-capture-header">
                <div class="pdf-capture-title">Evolv Assistant Response</div>
                <div class="pdf-capture-meta">
                    <span>Generated: ${timestamp}</span>
                    <span>Language: ${langName}</span>
                </div>
            </div>
        `;
    
        contentWrapper.innerHTML = headerHTML;
        contentWrapper.appendChild(clonedContent);
        container.appendChild(contentWrapper);
        document.body.appendChild(container);
    

        const style = document.createElement('style');
        style.textContent = `
            .pdf-capture-container {
                width: 100%;
                max-width: 800px;
                margin: 20px auto;
                background: white;
                padding: 20px;
                border: 1px solid #ccc;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                font-family: Arial, sans-serif;
                overflow: visible;
                break-inside: avoid-page;
                page-break-inside: avoid;
            }
    
            .pdf-capture-header {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #ddd;
                margin-bottom: 10px;
                padding-bottom: 10px;
            }
    
            .pdf-capture-title {
                font-weight: bold;
                font-size: 18px;
            }
    
            .pdf-capture-meta span {
                font-size: 12px;
                color: #555;
                margin-left: 15px;
            }
    
            .pdf-capture-content > * {
                break-inside: avoid;
                page-break-inside: avoid;
                page-break-before: auto;
                page-break-after: auto;
            }
    
            .pdf-capture-content div,
            .pdf-capture-content p,
            .pdf-capture-content pre,
            .pdf-capture-content table {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        `;
        document.head.appendChild(style);
    
        return container;
    }
,    
    
    async exportToPDFSnapshot(messageContent, button) {
        try {
            button.classList.add('processing');
            button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="7.5,4.21 12,6.81 16.5,4.21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="7.5,19.79 7.5,14.6 3,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="21,12 16.5,14.6 16.5,19.79" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="12,6.81 12,12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Processing...
`;
            button.disabled = true;
            
            this.showNotification('Preparing PDF export...', 'info');
            
            await this.loadRequiredLibraries();
            
            const captureContainer = this.createCaptureContainer(messageContent);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNotification('Capturing content...', 'info');
            
            const canvas = await html2canvas(captureContainer, {
                width: 794,
                height: null,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: function(clonedDoc) {
                    const clonedContainer = clonedDoc.querySelector('.pdf-capture-container');
                    if (clonedContainer) {
                        clonedContainer.style.fontFamily = 'Arial, sans-serif';
                        clonedContainer.style.visibility = 'visible';
                        clonedContainer.style.opacity = '1';
                    }
                }
            });
            
            this.showNotification('Generating PDF...', 'info');
            
            const { jsPDF } = window.jspdf;
            const imgData = canvas.toDataURL('image/png');
            
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            let yPosition = 0;
            const pageHeight = 297;
            
            while (yPosition < imgHeight) {
                const remainingHeight = imgHeight - yPosition;
                const currentPageHeight = Math.min(pageHeight, remainingHeight);
                
                const pageCanvas = document.createElement('canvas');
                const pageCtx = pageCanvas.getContext('2d');
                pageCanvas.width = canvas.width;
                pageCanvas.height = (currentPageHeight * canvas.width) / imgWidth;
                
                pageCtx.drawImage(
                    canvas,
                    0, (yPosition * canvas.width) / imgWidth,
                    canvas.width, pageCanvas.height,
                    0, 0,
                    canvas.width, pageCanvas.height
                );
                
                const pageImgData = pageCanvas.toDataURL('image/png');
                
                if (yPosition > 0) {
                    pdf.addPage();
                }
                
                pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, currentPageHeight);
                yPosition += currentPageHeight;
            }
            
            const detectedLang = this.detectLanguage(this.extractCleanText(messageContent));
            const langName = this.getLanguageName(detectedLang);
            const filename = `Evolv_response_${detectedLang}_${Date.now()}.pdf`;
            
            pdf.save(filename);
            
            setTimeout(() => {
                captureContainer.remove();
            }, 100);
            
            this.showNotification(`PDF exported successfully in ${langName}!`, 'success');
            
        } catch (error) {
            this.showNotification('Error exporting PDF. Please try again.', 'error');
        } finally {
            button.classList.remove('processing');
            button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Export PDF
`;
            button.disabled = false;
        }
    },
    
    getGoogleTTSLanguageCode(detectedLang) {
        const langMap = {
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'ml': 'ml-IN',
            'kn': 'kn-IN',
            'gu': 'gu-IN',
            'pa': 'pa-IN',
            'bn': 'bn-IN',
            'or': 'or-IN',
            'ur': 'ur-IN',
            'ar': 'ar-SA',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'th': 'th-TH',
            'vi': 'vi-VN',
            'ru': 'ru-RU',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'es': 'es-ES',
            'pt': 'pt-BR',
            'it': 'it-IT',
            'en': 'en-US'
        };
        
        return langMap[detectedLang] || 'en-US';
    },
    
    getBestVoiceForLanguage(languageCode) {
        if (!this.voices.length) {
            this.loadVoices();
            return null;
        }
        
        const lang = languageCode.split('-')[0];
        
        const voicePriorities = [
            voice => voice.lang === languageCode,
            voice => voice.lang.startsWith(lang) && (voice.name.includes('Neural') || voice.name.includes('Premium')),
            voice => voice.lang.startsWith(lang) && voice.name.includes('Google'),
            voice => voice.lang.startsWith(lang) && voice.name.includes('Microsoft'),
            voice => voice.lang.startsWith(lang),
            voice => voice.lang.startsWith('en') && voice.default,
            voice => voice.lang.startsWith('en'),
        ];
        
        for (const priority of voicePriorities) {
            const voice = this.voices.find(priority);
            if (voice) {
                return voice;
            }
        }
        
        return this.voices[0] || null;
    },
    
    async getGoogleTTSAudio(text, languageCode = 'en-US') {
        if (!this.googleTTSApiKey || this.googleTTSApiKey === 'YOUR_GOOGLE_CLOUD_TTS_API_KEY') {
            throw new Error('Google Cloud TTS API key not configured');
        }
        
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.googleTTSApiKey}`;
        
        const requestBody = {
            input: { text: text },
            voice: {
                languageCode: languageCode,
                ssmlGender: 'NEUTRAL'
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.9,
                pitch: 0.0,
                volumeGainDb: 0.0
            }
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            return data.audioContent;
        } catch (error) {
            throw error;
        }
    },
    playAudioFromBase64(base64Audio) {
        return new Promise((resolve, reject) => {
            try {
                const audioBlob = this.base64ToBlob(base64Audio, 'audio/mp3');
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                

                this.currentAudio = audio;
                
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    resolve();
                };
                
                audio.onerror = (error) => {
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    reject(error);
                };
                
                audio.play().catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    },
    
    base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    },
    
    toggleSpeech(messageContent, button) {
        if (this.isPlaying) {
            if (this.isPaused) {
                this.resumeSpeech(button);
            } else {
                this.pauseSpeech(button);
            }
        } else {
            this.startSpeech(messageContent, button);
        }
    },
    
    pauseSpeech(button) {
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
            this.isPaused = true;
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Resume
            `;
            button.classList.remove('playing');
            button.classList.add('paused');
        } else if (this.speechSynthesis.speaking && !this.speechSynthesis.paused) {
            this.speechSynthesis.pause();
            this.isPaused = true;
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Resume
            `;
            button.classList.remove('playing');
            button.classList.add('paused');
        }
    },
    
    resumeSpeech(button) {
        if (this.currentAudio && this.currentAudio.paused) {
            this.currentAudio.play();
            this.isPaused = false;
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                    <rect x="14" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                </svg>
                Pause
            `;
            button.classList.remove('paused');
            button.classList.add('playing');
        } else if (this.speechSynthesis.paused) {
            this.speechSynthesis.resume();
            this.isPaused = false;
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                    <rect x="14" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                </svg>
                Pause
            `;
            button.classList.remove('paused');
            button.classList.add('playing');
        }
    },
    async startSpeech(messageContent, button) {
        try {
            this.stopSpeech();
            
            const text = this.extractCleanText(messageContent);
            
            if (!text.trim()) {
                this.showNotification('No text to read', 'warning');
                return;
            }
            
            const detectedLang = this.detectLanguage(text);
            const languageCode = this.getGoogleTTSLanguageCode(detectedLang);
            const langName = this.getLanguageName(detectedLang);
            
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                    <rect x="14" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                </svg>
                Pause
            `;
            button.classList.add('playing');
            this.isPlaying = true;
            this.isPaused = false;
            
            if (this.googleTTSApiKey && this.googleTTSApiKey !== 'YOUR_GOOGLE_CLOUD_TTS_API_KEY') {
                try {
                    this.showNotification(`Generating speech in ${langName}...`, 'info');
                    const audioBase64 = await this.getGoogleTTSAudio(text, languageCode);
                    
                    await this.playAudioFromBase64(audioBase64);
                    
                    this.isPlaying = false;
                    this.isPaused = false;
                    button.innerHTML = '🔊 Listen';
                    button.classList.remove('playing', 'paused');
                    
                } catch (error) {
                    this.fallbackToBrowserTTS(text, detectedLang, languageCode, button);
                }
            } else {
                this.fallbackToBrowserTTS(text, detectedLang, languageCode, button);
            }
            
        } catch (error) {
            this.isPlaying = false;
            this.isPaused = false;
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Listen
            `;
            button.classList.remove('playing', 'paused');
            this.showNotification('Text-to-speech failed', 'error');
        }
    },
    
    fallbackToBrowserTTS(text, detectedLang, languageCode, button) {
        try {
            this.currentUtterance = new SpeechSynthesisUtterance(text);
            
            this.currentUtterance.rate = 0.9;
            this.currentUtterance.pitch = 1;
            this.currentUtterance.volume = 0.8;
            this.currentUtterance.lang = languageCode;
            
            const bestVoice = this.getBestVoiceForLanguage(languageCode);
            if (bestVoice) {
                this.currentUtterance.voice = bestVoice;
            }
            
            this.currentUtterance.onstart = () => {
                const langName = this.getLanguageName(detectedLang);
                const voiceName = bestVoice ? bestVoice.name : 'Default';
                this.showNotification(`Reading in ${langName} using ${voiceName}...`, 'info');
            };
            
            this.currentUtterance.onend = () => {
                this.isPlaying = false;
                this.isPaused = false;
                button.innerHTML = '🔊 Listen';
                button.classList.remove('playing', 'paused');
            };
            
            this.currentUtterance.onerror = (event) => {
                this.isPlaying = false;
                this.isPaused = false;
                button.innerHTML = '🔊 Listen';
                button.classList.remove('playing', 'paused');
                this.showNotification('Speech synthesis failed', 'error');
            };
            
            this.speechSynthesis.speak(this.currentUtterance);
            
        } catch (error) {
            this.showNotification('Text-to-speech not available', 'error');
            this.isPlaying = false;
            this.isPaused = false;
            button.innerHTML = '🔊 Listen';
            button.classList.remove('playing', 'paused');
        }
    },
    
    stopSpeech() {

        if (this.speechSynthesis && this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.wasPlayingBeforeHidden = false; 
        
        document.querySelectorAll('.tts-btn').forEach(btn => {
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Listen
            `;
            btn.classList.remove('playing', 'paused');
        });
    },
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'export-notification';
        
        const colors = {
            success: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            error: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            warning: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            info: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    },
    
    setGoogleTTSApiKey(apiKey) {
        this.googleTTSApiKey = apiKey;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            EnhancedFeatures.init();
        }, 1000);
    });
} else {
    setTimeout(() => {
        EnhancedFeatures.init();
        }, 1000);
    }


window.EnhancedFeatures = EnhancedFeatures;

// Enhanced existing bot messages after initialization
setTimeout(() => {
    const existingBotMessages = document.querySelectorAll('.bot-message');
    existingBotMessages.forEach(message => {
        EnhancedFeatures.enhanceBotMessage(message);
    });
}, 2000);


EnhancedFeatures.setGoogleTTSApiKey('AIzaSyCNEiD-Qt3YP6-Yp5DNqt1PAyaTW7hB3_4');

console.log('Enhanced Chatbot Features loaded successfully!');