(function() {
    'use strict';
    
    const NAV_CONFIG = {
        items: [
            {
                id: 'Code-Editor',
                icon: '🎯',
                title: 'Code Editor',
                url: 'code-editor.html',
                description: 'write,learn,Debug code'
            },
            {
                id: 'Resume Builder',
                icon: '📊',
                title: 'Resume Builder',
                url: 'resume.html',
                description: 'Buld your personalised Resume'
            },
            /*{
                id: 'job-market',
                icon: '🔍',
                title: 'Job Opportunities',
                url: 'https://www.linkedin.com/jobs/',
                description: 'Find your next career move'
            },
            {
                id: 'learning-paths',
                icon: '🚀',
                title: 'Learning Hub',
                url: 'https://www.edx.org/',
                description: 'Accelerate your growth'
            },
            {
                id: 'salary-insights',
                icon: '💎',
                title: 'Compensation Data',
                url: 'https://www.glassdoor.com/Salaries/index.htm',
                description: 'Know your market value'
            },
            {
                id: 'networking',
                icon: '🌟',
                title: 'Professional Circle',
                url: 'https://www.linkedin.com/',
                description: 'Expand your network'
            }*/
        ]
    };
    
    const sidebarStyles = `
        :root {
            --gradient-primary: linear-gradient(135deg, #2563eb, #3b82f6);
            --gradient-accent: linear-gradient(135deg, #7c3aed, #a855f7);
            --gradient-hover: linear-gradient(135deg, #1d4ed8, #2563eb);
            --glass-bg: rgba(255, 255, 255, 0.95);
            --glass-border: rgba(37, 99, 235, 0.2);
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --text-muted: #9ca3af;
            --floating-shadow: 0 20px 40px rgba(37, 99, 235, 0.15);
            --neon-glow: 0 0 30px rgba(37, 99, 235, 0.3);
            --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            --hover-scale: 1.02;
        }
        
        .sidebar-toggle {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1001;
            width: 60px;
            height: 60px;
            background: var(--gradient-primary);
            border: none;
            border-radius: 20px;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: var(--floating-shadow);
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(15px);
            font-weight: 700;
            border: 3px solid rgba(255, 255, 255, 0.4);
        }
        
        .sidebar-toggle:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: var(--floating-shadow), var(--neon-glow);
            background: var(--gradient-hover);
            border-radius: 24px;
        }
        
        .sidebar-toggle:active {
            transform: translateY(-2px) scale(1.02);
            border-radius: 20px;
        }
        
        .sidebar-toggle.active {
            opacity: 0;
            visibility: hidden;
            transform: translateY(-4px) scale(0.8);
        }
        
        .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: var(--transition);
        }
        
        .sidebar-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 380px;
            height: 100vh;
            background: var(--glass-bg);
            backdrop-filter: blur(25px);
            border-right: 3px solid var(--glass-border);
            z-index: 1000;
            transform: translateX(-100%);
            transition: var(--transition);
            overflow: hidden;
            box-shadow: var(--floating-shadow);
        }
        
        .sidebar.active {
            transform: translateX(0);
        }
        
        .sidebar-close {
            position: absolute;
            top: 25px;
            right: 25px;
            width: 44px;
            height: 44px;
            background: rgba(239, 68, 68, 0.12);
            border: 2px solid rgba(239, 68, 68, 0.3);
            border-radius: 16px;
            color: #ef4444;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            font-weight: bold;
            transition: var(--transition);
            z-index: 10;
        }
        
        .sidebar-close:hover {
            background: rgba(239, 68, 68, 0.25);
            border-color: rgba(239, 68, 68, 0.6);
            transform: rotate(180deg) scale(1.1);
            box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
            border-radius: 20px;
        }
        
        .sidebar-close:active {
            transform: rotate(180deg) scale(1.05);
            border-radius: 16px;
        }
        
        .sidebar-header {
            padding: 4rem 2.5rem 3rem;
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
            border-bottom: 3px solid var(--glass-border);
            position: relative;
            overflow: hidden;
        }
        
        .sidebar-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.08) 0%, transparent 50%);
        }
        
        .sidebar-title {
            font-size: 2rem;
            font-weight: 900;
            color: var(--text-primary);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 1rem;
            letter-spacing: -0.03em;
            position: relative;
            z-index: 2;
        }
        
        .sidebar-subtitle {
            font-size: 1.1rem;
            color: var(--text-secondary);
            margin: 1rem 0 0 0;
            font-weight: 600;
            opacity: 0.9;
            position: relative;
            z-index: 2;
        }
        
        .sidebar-content {
            padding: 2.5rem 0;
            overflow-y: auto;
            height: calc(100vh - 280px);
        }
        
        .sidebar-content::-webkit-scrollbar {
            width: 8px;
        }
        
        .sidebar-content::-webkit-scrollbar-track {
            background: rgba(37, 99, 235, 0.05);
            border-radius: 4px;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb {
            background: rgba(37, 99, 235, 0.3);
            border-radius: 4px;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb:hover {
            background: rgba(37, 99, 235, 0.5);
        }
        
        .nav-section {
            margin-bottom: 2.5rem;
        }
        
        .nav-section-title {
            font-size: 0.9rem;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 0 2.5rem;
            margin-bottom: 1.5rem;
            position: relative;
        }
        
        .nav-section-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 2.5rem;
            width: 40px;
            height: 3px;
            background: var(--gradient-primary);
            border-radius: 2px;
        }
        
        .nav-item {
            display: flex;
            align-items: center;
            padding: 1.5rem 2.5rem;
            color: var(--text-primary);
            text-decoration: none;
            transition: var(--transition);
            border: none;
            background: none;
            width: 100%;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            margin: 0.5rem 0;
            border-radius: 0 25px 25px 0;
        }
        
        .nav-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 6px;
            height: 100%;
            background: var(--gradient-primary);
            transform: translateX(-100%);
            transition: var(--transition);
        }
        
        .nav-item::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.03) 100%);
            opacity: 0;
            transition: var(--transition);
        }
        
        .nav-item:hover {
            background: rgba(37, 99, 235, 0.08);
            transform: translateX(15px) scale(var(--hover-scale));
            box-shadow: 0 12px 35px rgba(37, 99, 235, 0.15);
        }
        
        .nav-item:hover::before {
            transform: translateX(0);
        }
        
        .nav-item:hover::after {
            opacity: 1;
        }
        
        .nav-item:active {
            transform: translateX(10px) scale(0.98);
        }
        
        .nav-item-icon {
            font-size: 1.8rem;
            margin-right: 1.5rem;
            min-width: 40px;
            text-align: center;
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.1));
            transition: var(--transition);
        }
        
        .nav-item:hover .nav-item-icon {
            transform: scale(1.2) rotate(10deg);
            filter: drop-shadow(0 6px 12px rgba(37, 99, 235, 0.3));
        }
        
        .nav-item-content {
            flex: 1;
        }
        
        .nav-item-title {
            font-size: 1.1rem;
            font-weight: 700;
            margin: 0;
            color: var(--text-primary);
            letter-spacing: -0.01em;
        }
        
        .nav-item-description {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0.4rem 0 0 0;
            opacity: 0.9;
            line-height: 1.4;
        }
        
        .nav-item-arrow {
            font-size: 1.2rem;
            color: var(--text-muted);
            opacity: 0;
            transition: var(--transition);
            font-weight: bold;
        }
        
        .nav-item:hover .nav-item-arrow {
            opacity: 1;
            transform: translateX(8px) rotate(-20deg);
            color: #2563eb;
        }
        
        .sidebar-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 2rem 2.5rem;
            background: linear-gradient(to top, var(--glass-bg) 0%, rgba(255, 255, 255, 0.6) 100%);
            border-top: 3px solid var(--glass-border);
            text-align: center;
        }
        
        .sidebar-footer-text {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin: 0;
            font-weight: 600;
        }
        
        .sidebar-branding {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .sidebar-branding-icon {
            font-size: 1.2rem;
            filter: drop-shadow(0 2px 4px rgba(37, 99, 235, 0.2));
        }
        
        @media (max-width: 768px) {
            .sidebar {
                width: 350px;
            }
            
            .sidebar-toggle {
                width: 55px;
                height: 55px;
                top: 15px;
                left: 15px;
            }
            
            .nav-item {
                padding: 1.25rem 2rem;
            }
            
            .sidebar-header {
                padding: 3.5rem 2rem 2.5rem;
            }
        }
        
        @media (max-width: 480px) {
            .sidebar {
                width: 100%;
                max-width: 320px;
            }
        }
        
        @keyframes slideInStagger {
            from {
                opacity: 0;
                transform: translateX(-40px) translateY(15px);
            }
            to {
                opacity: 1;
                transform: translateX(0) translateY(0);
            }
        }
        
        @keyframes pulseGlow {
            0%, 100% {
                box-shadow: var(--floating-shadow);
            }
            50% {
                box-shadow: var(--floating-shadow), var(--neon-glow);
            }
        }
        
        .nav-item {
            animation: slideInStagger 0.6s ease-out;
        }
        
        .nav-item:nth-child(1) { animation-delay: 0.1s; }
        .nav-item:nth-child(2) { animation-delay: 0.2s; }
        .nav-item:nth-child(3) { animation-delay: 0.3s; }
        .nav-item:nth-child(4) { animation-delay: 0.4s; }
        .nav-item:nth-child(5) { animation-delay: 0.5s; }
        .nav-item:nth-child(6) { animation-delay: 0.6s; }
        
        .sidebar-toggle.pulse {
            animation: pulseGlow 2s ease-in-out infinite;
        }
        
        .sidebar.active .nav-item {
            animation: slideInStagger 0.6s ease-out;
        }
    `;
    
    const STORAGE_KEY = 'EvolvHubSidebar';
    
    function saveState(state) {
        try {
            const data = {
                isOpen: state,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save sidebar state');
        }
    }
    
    function loadState() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                const isRecent = Date.now() - parsed.timestamp < 86400000;
                return isRecent ? parsed.isOpen : false;
            }
        } catch (e) {
            console.warn('Could not load sidebar state');
        }
        return false;
    }
    
    function initializeSidebar() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = sidebarStyles;
        document.head.appendChild(styleSheet);
        
        createSidebarElements();
        setupSidebarEventListeners();
        
        const savedState = loadState();
        if (savedState) {
            setTimeout(() => openSidebar(false), 300);
        }
        
        setTimeout(() => {
            if (window.sidebarElements?.toggle && !window.sidebarElements.sidebar.classList.contains('active')) {
                window.sidebarElements.toggle.classList.add('pulse');
            }
        }, 2000);
    }
    
    function createSidebarElements() {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'sidebar-toggle';
        toggleButton.innerHTML = '☰';
        toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
        
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        
        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'sidebar-close';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close navigation menu');
        
        const sidebarHeader = document.createElement('div');
        sidebarHeader.className = 'sidebar-header';
        sidebarHeader.innerHTML = `
            <h2 class="sidebar-title">🚀 Evolv Hub</h2>
            <p class="sidebar-subtitle">Navigate your professional journey</p>
        `;
        
        const sidebarContent = document.createElement('div');
        sidebarContent.className = 'sidebar-content';
        
        const navSection = document.createElement('div');
        navSection.className = 'nav-section';
        navSection.innerHTML = `<div class="nav-section-title">Quick Access</div>`;
        
        NAV_CONFIG.items.forEach((item, index) => {
            const navItem = document.createElement('button');
            navItem.className = 'nav-item';
            navItem.style.animationDelay = `${0.1 + index * 0.1}s`;
            navItem.innerHTML = `
                <span class="nav-item-icon">${item.icon}</span>
                <div class="nav-item-content">
                    <div class="nav-item-title">${item.title}</div>
                    <div class="nav-item-description">${item.description}</div>
                </div>
                <span class="nav-item-arrow">→</span>
            `;
            
            navItem.addEventListener('click', () => {
                window.open(item.url, '_blank', 'noopener,noreferrer');
            });
            
            navSection.appendChild(navItem);
        });
        
        sidebarContent.appendChild(navSection);
        
        const sidebarFooter = document.createElement('div');
        sidebarFooter.className = 'sidebar-footer';
        sidebarFooter.innerHTML = `
            <p class="sidebar-footer-text">Powered by Evolv AI</p>
            <div class="sidebar-branding">
                <span class="sidebar-branding-icon">⚡</span>
                <span>Enhanced Professional Tools</span>
            </div>
        `;
        
        sidebar.appendChild(closeButton);
        sidebar.appendChild(sidebarHeader);
        sidebar.appendChild(sidebarContent);
        sidebar.appendChild(sidebarFooter);
        
        document.body.appendChild(toggleButton);
        document.body.appendChild(overlay);
        document.body.appendChild(sidebar);
        
        window.sidebarElements = {
            toggle: toggleButton,
            overlay: overlay,
            sidebar: sidebar,
            close: closeButton
        };
    }
    
    function setupSidebarEventListeners() {
        const { toggle, overlay, sidebar, close } = window.sidebarElements;
        
        toggle.addEventListener('click', () => {
            const isActive = sidebar.classList.contains('active');
            if (isActive) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
        
        close.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                closeSidebar();
            }
        });
        
        sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        window.addEventListener('beforeunload', () => {
            const isOpen = sidebar.classList.contains('active');
            saveState(isOpen);
        });
        
        let inactivityTimer;
        
        function resetInactivityTimer() {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (toggle && !sidebar.classList.contains('active')) {
                    toggle.classList.add('pulse');
                }
            }, 30000);
        }
        
        document.addEventListener('mousemove', resetInactivityTimer);
        document.addEventListener('keypress', resetInactivityTimer);
        document.addEventListener('scroll', resetInactivityTimer);
        
        resetInactivityTimer();
    }
    
    function openSidebar(saveToStorage = true) {
        const { toggle, overlay, sidebar } = window.sidebarElements;
        
        toggle.classList.remove('pulse');
        toggle.classList.add('active');
        overlay.classList.add('active');
        sidebar.classList.add('active');
        
        document.body.style.overflow = 'hidden';
        
        if (saveToStorage) {
            saveState(true);
        }
    }
    
    function closeSidebar() {
        const { toggle, overlay, sidebar } = window.sidebarElements;
        
        toggle.classList.remove('active');
        overlay.classList.remove('active');
        sidebar.classList.remove('active');
        
        document.body.style.overflow = '';
        
        saveState(false);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSidebar);
    } else {
        initializeSidebar();
    }
    
    window.sidebarControls = {
        open: openSidebar,
        close: closeSidebar,
        toggle: () => {
            const sidebar = window.sidebarElements?.sidebar;
            if (sidebar?.classList.contains('active')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        },
        isOpen: () => {
            return window.sidebarElements?.sidebar?.classList.contains('active') || false;
        }
    };
    
})();