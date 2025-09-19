
(function() {
    'use strict';
    
    const CopyButtonEnhancement = {
        init() {
            this.addCopyButtonStyles();
            this.enhanceExistingMessages();
            this.setupCopyObserver();
        },
        
        addCopyButtonStyles() {
            const style = document.createElement('style');
            style.id = 'copy-button-styles';
            style.textContent = `
                .enhanced-btn.copy-btn {
                    background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
                    position: relative;
                    overflow: hidden;
                }
                
                .enhanced-btn.copy-btn:hover {
                    background: linear-gradient(135deg, #ab47bc 0%, #7986cb 100%);
                }
                
                .enhanced-btn.copy-btn.copied {
                    background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
                    animation: copySuccess 0.3s ease;
                }
                
                @keyframes copySuccess {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .copy-btn-ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                }
                
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            

            if (!document.getElementById('copy-button-styles')) {
                document.head.appendChild(style);
            }
        },
        
        createCopyButton() {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'enhanced-btn copy-btn';
            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Copy
            `;
            
            return copyBtn;
        },
        
        addRippleEffect(button, event) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.className = 'copy-btn-ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        },
        
        async copyToClipboard(text, button, event) {
            try {

                this.addRippleEffect(button, event);
                

                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {

                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    textArea.style.pointerEvents = 'none';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }
                

                const originalHTML = button.innerHTML;
                button.classList.add('copied');
                button.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Copied!
                `;
                

                if (window.EnhancedFeatures && typeof window.EnhancedFeatures.showNotification === 'function') {
                    window.EnhancedFeatures.showNotification('Response copied to clipboard!', 'success');
                }
                

                setTimeout(() => {
                    button.classList.remove('copied');
                    button.innerHTML = originalHTML;
                }, 2000);
                
            } catch (err) {
                console.error('Failed to copy text: ', err);
                

                if (window.EnhancedFeatures && typeof window.EnhancedFeatures.showNotification === 'function') {
                    window.EnhancedFeatures.showNotification('Failed to copy text. Please try again.', 'error');
                }
                

                const originalHTML = button.innerHTML;
                button.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Error
                `;
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                }, 2000);
            }
        },
        
        extractCleanText(messageContent) {

            if (window.EnhancedFeatures && typeof window.EnhancedFeatures.extractCleanText === 'function') {
                return window.EnhancedFeatures.extractCleanText(messageContent);
            }
            

            const clone = messageContent.cloneNode(true);
            const elementsToRemove = clone.querySelectorAll('.enhanced-buttons, .response-meta, .context-indicator');
            elementsToRemove.forEach(element => element.remove());
            
            let text = clone.textContent || clone.innerText || '';
            text = text.replace(/\s+/g, ' ').trim();
            
            return text;
        },
        
        addCopyButtonToMessage(messageElement) {
            const buttonsContainer = messageElement.querySelector('.enhanced-buttons');
            if (!buttonsContainer) return;
            

            if (buttonsContainer.querySelector('.copy-btn')) return;
            
            const messageContent = messageElement.querySelector('.message-content');
            if (!messageContent) return;
            
            const copyBtn = this.createCopyButton();
            copyBtn.onclick = (event) => {
                const text = this.extractCleanText(messageContent);
                if (text.trim()) {
                    this.copyToClipboard(text, copyBtn, event);
                } else {
                    if (window.EnhancedFeatures && typeof window.EnhancedFeatures.showNotification === 'function') {
                        window.EnhancedFeatures.showNotification('No text to copy', 'warning');
                    }
                }
            };
            

            const ttsBtn = buttonsContainer.querySelector('.tts-btn');
            if (ttsBtn && ttsBtn.nextSibling) {
                buttonsContainer.insertBefore(copyBtn, ttsBtn.nextSibling);
            } else {
                buttonsContainer.appendChild(copyBtn);
            }
        },
        
        enhanceExistingMessages() {
            const botMessages = document.querySelectorAll('.bot-message');
            botMessages.forEach(message => {
                this.addCopyButtonToMessage(message);
            });
        },
        
        setupCopyObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) {

                                if (node.classList && node.classList.contains('bot-message')) {

                                    setTimeout(() => {
                                        this.addCopyButtonToMessage(node);
                                    }, 100);
                                }
                                

                                if (node.classList && node.classList.contains('enhanced-buttons')) {
                                    setTimeout(() => {
                                        const botMessage = node.closest('.bot-message');
                                        if (botMessage) {
                                            this.addCopyButtonToMessage(botMessage);
                                        }
                                    }, 50);
                                }
                                

                                const enhancedButtons = node.querySelectorAll && node.querySelectorAll('.enhanced-buttons');
                                if (enhancedButtons) {
                                    enhancedButtons.forEach(buttonContainer => {
                                        setTimeout(() => {
                                            const botMessage = buttonContainer.closest('.bot-message');
                                            if (botMessage) {
                                                this.addCopyButtonToMessage(botMessage);
                                            }
                                        }, 50);
                                    });
                                }
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
            

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };
    

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {

            setTimeout(() => {
                CopyButtonEnhancement.init();
            }, 1500);
        });
    } else {

        setTimeout(() => {
            CopyButtonEnhancement.init();
        }, 1500);
    }
    
    window.CopyButtonEnhancement = CopyButtonEnhancement;
    
    console.log('Copy Button Enhancement loaded successfully!');
})();
