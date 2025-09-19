const CareerRoadmapGenerator = {
    graphWindow: null,

    enhancedPrompt: `You are "Evolv" - an AI career advisor with advanced visualization capabilities for career development, skill roadmaps, and professional growth tracking.

CRITICAL VISUALIZATION RULES:
- When responding to ANY career-related query, ALWAYS determine if a visualization would be helpful
- Look for intent rather than specific keywords - analyze the underlying request
- If the user would benefit from seeing data, charts, roadmaps, or visual planning, create one
- Default to creating visualizations for career guidance - they enhance understanding

VISUALIZATION DECISION LOGIC:
Analyze user queries for these intents and create appropriate visualizations:

1. CAREER PLANNING INTENT → Create Mermaid Roadmap
   - Questions about career paths, progression, next steps
   - Requests for guidance on reaching career goals
   - Discussions about skill development timelines
   - Career transition planning

2. SKILL ANALYSIS INTENT → Create Chart.js Assessment
   - Questions about current skill levels or gaps
   - Discussions about what skills are needed
   - Requests for market demand analysis
   - Competency evaluations

3. INDUSTRY INSIGHT INTENT → Create Chart.js Analytics
   - Questions about salary expectations
   - Market trends and job demand queries
   - Industry comparison requests
   - Growth projections

4. LEARNING PATH INTENT → Create Mermaid Flowchart
   - Questions about courses or certifications
   - Educational pathway planning
   - Training sequence discussions

SMART DETECTION EXAMPLES:
- "What should I do to become a data scientist?" → Roadmap
- "How much do software engineers make?" → Salary chart
- "Am I ready for a senior role?" → Skill assessment
- "Which programming language should I learn?" → Market demand chart
- "Help me plan my career" → Interactive roadmap
- "What skills do I need?" → Gap analysis chart

When a visualization would help (90% of career queries), respond with:
1. Brief text explanation (2-3 sentences max)
2. Complete HTML visualization
3. Mark with appropriate tag: [CAREER_ROADMAP_READY] or [SKILL_ASSESSMENT_READY]

Create COMPLETE, SELF-CONTAINED HTML pages with:
   - Full HTML structure (<!DOCTYPE html>, <html>, <head>, <body>)
   - Chart.js from CDN: https://cdn.jsdelivr.net/npm/chart.js
   - Mermaid.js from CDN: https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js
   - Real career data and industry insights
   - Interactive and responsive design
   - Professional career-focused styling
   - Export/download functionality

For Career Roadmap Mermaid diagrams:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Career Development Roadmap</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .mermaid { text-align: center; margin: 20px auto; background: #f8f9ff; padding: 20px; border-radius: 10px; }
        .career-header { text-align: center; color: #2c3e50; margin-bottom: 30px; }
        .skill-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f1f3ff; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #667eea; }
        .export-btn { position: fixed; top: 20px; right: 20px; background: #667eea; color: white; border: none; padding: 12px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <div class="container">
        <button class="export-btn" onclick="exportRoadmap()">📥 Export Roadmap</button>
        <div class="career-header">
            <h1>Career Development Roadmap</h1>
            <p>Professional Growth Path & Skill Development Timeline</p>
        </div>
        <div class="mermaid">
            flowchart TD
                A["Current Position"] --> B["Skill Assessment"]
                B --> C["Learning Phase 1"]
                C --> D["Certification"]
                D --> E["Experience Building"]
                E --> F["Advanced Skills"]
                F --> G["Target Role"]
        </div>
        <div class="skill-metrics">
            <div class="metric-card">
                <h3>Time to Goal</h3>
                <p>12-18 months</p>
            </div>
            <div class="metric-card">
                <h3>Skills Required</h3>
                <p>8 core competencies</p>
            </div>
            <div class="metric-card">
                <h3>Market Demand</h3>
                <p>High Growth</p>
            </div>
        </div>
    </div>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            themeVariables: {
                primaryColor: '#667eea',
                primaryTextColor: '#2c3e50',
                primaryBorderColor: '#5a6fd8',
                lineColor: '#667eea'
            },
            flowchart: {
                htmlLabels: true,
                curve: 'basis'
            }
        });
        
        function exportRoadmap() {
            const title = document.querySelector('h1').textContent.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const content = document.documentElement.outerHTML;
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = title + '_roadmap.html';
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>
\`\`\`

IMPORTANT: Create visualizations based on INTENT, not keywords. Analyze what would help the user understand their career situation better.`,

    // Smart intent detection instead of keyword matching
    detectVisualizationIntent(query) {
        const lowerQuery = query.toLowerCase();
        
        // Intent patterns (more sophisticated than simple keywords)
        const intentPatterns = {
            careerPlanning: [
                /how.*(?:become|get into|transition to|switch to)/,
                /what.*(?:path|steps|should i do|route)/,
                /career.*(?:plan|roadmap|timeline|progression)/,
                /how long.*(?:take|require|need)/,
                /guide me|help me.*(?:plan|prepare|get)/,
                /next steps|what's next|where to start/
            ],
            skillAnalysis: [
                /what skills.*(?:need|required|important)/,
                /am i ready|ready for|good enough/,
                /skill.*(?:gap|assessment|level|analysis)/,
                /how good.*(?:skills|at|level)/,
                /compare.*skills|skill.*comparison/,
                /missing.*skills|lacking.*skills/
            ],
            industryInsight: [
                /how much.*(?:make|earn|salary|pay)/,
                /salary.*(?:range|expectation|average)/,
                /market.*(?:demand|trend|outlook)/,
                /job.*(?:market|opportunities|prospects)/,
                /industry.*(?:growth|trend|future)/,
                /worth.*learning|demand.*for/
            ],
            learningPath: [
                /what.*(?:learn|study|course|certification)/,
                /best.*(?:course|certification|training)/,
                /learning.*(?:path|plan|sequence)/,
                /which.*(?:language|technology|skill).*first/,
                /order.*(?:learn|study)/,
                /curriculum|syllabus|study plan/
            ]
        };

        // Check each intent category
        for (const [intent, patterns] of Object.entries(intentPatterns)) {
            if (patterns.some(pattern => pattern.test(lowerQuery))) {
                return intent;
            }
        }

        // Fallback: check if it's career-related at all
        const careerIndicators = [
            'career', 'job', 'work', 'profession', 'role', 'position',
            'skill', 'learn', 'study', 'training', 'course', 'certification',
            'salary', 'pay', 'earn', 'income', 'money',
            'industry', 'field', 'sector', 'market', 'company',
            'experience', 'qualification', 'resume', 'interview',
            'future', 'growth', 'development', 'advancement'
        ];

        const hasCareerContext = careerIndicators.some(indicator => 
            lowerQuery.includes(indicator)
        );

        // For career-related queries without clear intent, default to planning
        return hasCareerContext ? 'careerPlanning' : null;
    },

    isCareerVisualizationResponse(response) {
        return response.includes('[CAREER_ROADMAP_READY]') || 
               response.includes('[SKILL_ASSESSMENT_READY]') || 
               (response.includes('<!DOCTYPE html>') && 
                (response.includes('Chart.js') || response.includes('mermaid') ||
                 response.includes('career') || response.includes('skill') ||
                 response.includes('roadmap') || response.includes('assessment')));
    },

    extractCareerHTML(response) {
        let htmlContent = '';
        const htmlBlockMatch = response.match(/```html\s*([\s\S]*?)\s*```/);
        if (htmlBlockMatch) {
            htmlContent = htmlBlockMatch[1];
        } else {
            const htmlMatch = response.match(/(<!DOCTYPE html>[\s\S]*?<\/html>)/);
            if (htmlMatch) {
                htmlContent = htmlMatch[1];
            }
        }
        
        if (htmlContent && htmlContent.includes('mermaid')) {
            htmlContent = this.fixMermaidHTML(htmlContent);
        }
        
        return htmlContent.trim();
    },

    fixMermaidHTML(htmlContent) {
        // Fix Mermaid syntax for version 10.9.4
        htmlContent = htmlContent.replace(/graph TD/g, 'flowchart TD');
        htmlContent = htmlContent.replace(/graph LR/g, 'flowchart LR');
        htmlContent = htmlContent.replace(/\[([^\]]+)\]/g, '["$1"]'); // Wrap node text in quotes
        
        if (!htmlContent.includes('mermaid.initialize')) {
            const bodyEndIndex = htmlContent.lastIndexOf('</body>');
            if (bodyEndIndex !== -1) {
                const initScript = `
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            mermaid.initialize({
                startOnLoad: true,
                theme: 'base',
                themeVariables: {
                    primaryColor: '#667eea',
                    primaryTextColor: '#2c3e50',
                    primaryBorderColor: '#5a6fd8',
                    lineColor: '#667eea'
                },
                flowchart: {
                    htmlLabels: false,
                    curve: 'basis'
                },
                securityLevel: 'loose'
            });
        });
    </script>`;
                htmlContent = htmlContent.substring(0, bodyEndIndex) + initScript + htmlContent.substring(bodyEndIndex);
            }
        }

        if (!htmlContent.includes('mermaid@10/dist/mermaid.min.js') && !htmlContent.includes('mermaid.min.js')) {
            const headEndIndex = htmlContent.indexOf('</head>');
            if (headEndIndex !== -1) {
                const mermaidScript = `    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.4/dist/mermaid.min.js"></script>\n`;
                htmlContent = htmlContent.substring(0, headEndIndex) + mermaidScript + htmlContent.substring(headEndIndex);
            }
        }

        htmlContent = htmlContent.replace(/type="module"/g, '');
        
        return htmlContent;
    },

    createCareerViewButton(careerHTML, type) {
        const viewButton = document.createElement('button');
        viewButton.className = 'career-view-button';
        
        const buttonText = {
            careerPlanning: '🗺️ View Career Roadmap',
            skillAnalysis: '📊 View Skill Assessment',
            industryInsight: '📈 View Market Analytics',
            learningPath: '📚 View Learning Path'
        };
        
        viewButton.innerHTML = buttonText[type] || '📈 View Career Analytics';
        
        viewButton.addEventListener('click', () => {
            this.openCareerWindow(careerHTML);
        });
        return viewButton;
    },

    openCareerWindow(careerHTML) {
        if (this.graphWindow && !this.graphWindow.closed) {
            this.graphWindow.close();
        }

        this.graphWindow = window.open('', 'Evolv', 'width=1400,height=900,scrollbars=yes,resizable=yes');
        if (this.graphWindow) {
            this.graphWindow.document.write(careerHTML);
            this.graphWindow.document.close();
            this.graphWindow.focus();
        } else {
            alert('Please allow popups for this site to view your career development visualization!');
        }
    },

    formatCareerMessage(message) {
        if (this.isCareerVisualizationResponse(message)) {
            const careerHTML = this.extractCareerHTML(message);
            if (careerHTML) {
                let cleanMessage = message
                    .replace(/```html\s*[\s\S]*?\s*```/, '')
                    .replace(/(<!DOCTYPE html>[\s\S]*?<\/html>)/, '')
                    .replace(/\[CAREER_ROADMAP_READY\]/, '')
                    .replace(/\[SKILL_ASSESSMENT_READY\]/, '');

                if (cleanMessage.trim() === '') {
                    cleanMessage = 'Your personalized career development visualization is ready. Click below to explore your interactive career analysis.';
                }

                const container = document.createElement('div');
                container.className = 'career-message-container';

                const indicator = document.createElement('div');
                indicator.className = 'career-indicator';
                
                let visualizationType = 'careerPlanning';
                if (message.includes('[CAREER_ROADMAP_READY]') || careerHTML.includes('roadmap')) {
                    indicator.textContent = '🗺️ Interactive Roadmap Ready';
                    visualizationType = 'careerPlanning';
                } else if (message.includes('[SKILL_ASSESSMENT_READY]') || careerHTML.includes('skill')) {
                    indicator.textContent = '📊 Skill Analysis Ready';
                    visualizationType = 'skillAnalysis';
                } else {
                    indicator.textContent = '📈 Career Analytics Ready';
                    visualizationType = 'industryInsight';
                }
                
                container.appendChild(indicator);

                const messageDiv = document.createElement('div');
                messageDiv.innerHTML = cleanMessage;
                container.appendChild(messageDiv);

                const viewButton = this.createCareerViewButton(careerHTML, visualizationType);
                container.appendChild(viewButton);

                return container;
            }
        }

        return null;
    }
};

const EnhancedCareerAssistant = {
    init() {
        this.injectCSS();
        this.setupCareerResponseHandler();
        this.setupCareerMessageHandler();
    },

    setupCareerResponseHandler() {
        const originalGetEvolvResponse = window.getEvolvResponse;

        window.getEvolvResponse = async function(query) {
            // Detect intent instead of keywords
            const detectedIntent = CareerRoadmapGenerator.detectVisualizationIntent(query);
            
            // Skip worksheet and presentation requests
            const lowerQuery = query.toLowerCase();
            const isWorksheetRequest = lowerQuery.includes('worksheet') || 
                                       lowerQuery.includes('work sheet') ||
                                       lowerQuery.includes('exercise sheet');
            const isPPTRequest = lowerQuery.includes('presentation') || 
                                 lowerQuery.includes('ppt') ||
                                 lowerQuery.includes('powerpoint');

            // Use enhanced prompt for detected career visualization intents
            const shouldUseVisualization = detectedIntent && !isWorksheetRequest && !isPPTRequest;

            if (shouldUseVisualization) {
                console.log(`Detected intent: ${detectedIntent} for query: "${query}"`);
                
                const originalPrompt = CONFIG.TEACHER_PROMPT;
                CONFIG.TEACHER_PROMPT = CareerRoadmapGenerator.enhancedPrompt;

                try {
                    const response = await originalGetEvolvResponse.call(this, query);
                    return response;
                } finally {
                    CONFIG.TEACHER_PROMPT = originalPrompt;
                }
            }

            return originalGetEvolvResponse.call(this, query);
        };
    },

    setupCareerMessageHandler() {
        const originalAppendMessage = window.appendMessage;

        window.appendMessage = function(sender, message, isTyping = false) {
            if (sender === 'bot' && !isTyping) {
                const careerContainer = CareerRoadmapGenerator.formatCareerMessage(message);
                if (careerContainer) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message bot-message';

                    const avatar = document.createElement('div');
                    avatar.className = 'avatar bot-avatar';
                    avatar.textContent = '🤖';

                    const content = document.createElement('div');
                    content.className = 'message-content';
                    content.appendChild(careerContainer);

                    messageDiv.appendChild(avatar);
                    messageDiv.appendChild(content);

                    chatBox.appendChild(messageDiv);
                    chatBox.scrollTop = chatBox.scrollHeight;

                    return messageDiv;
                }
            }

            return originalAppendMessage.call(this, sender, message, isTyping);
        };
    },

    injectCSS() {
        const css = `
            .career-message-container {
                border-radius: 20px;
                padding: 2rem;
                margin: 1.5rem 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
                position: relative;
                overflow: hidden;
            }

            .career-message-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
                animation: shimmer 3s infinite;
            }

            .career-view-button {
                border: none;
                border-radius: 30px;
                padding: 15px 30px;
                font-size: 1.2rem;
                font-weight: 700;
                color: #667eea;
                cursor: pointer;
                margin-top: 1.5rem;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 280px;
                justify-content: center;
                background: linear-gradient(135deg, #ffffff, #f8f9ff);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                position: relative;
                overflow: hidden;
            }

            .career-view-button::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
                transition: all 0.4s ease;
                transform: translate(-50%, -50%);
                border-radius: 50%;
            }

            .career-view-button:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 12px 35px rgba(102, 126, 234, 0.3);
                background: linear-gradient(135deg, #f8f9ff, #ffffff);
            }

            .career-view-button:hover::before {
                width: 300px;
                height: 300px;
            }

            .career-indicator {
                display: inline-flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: 600;
                margin-bottom: 1.5rem;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                gap: 8px;
            }

            .career-indicator::before {
                content: '✨';
                animation: sparkle 2s ease-in-out infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            @keyframes sparkle {
                0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
            }

            @keyframes careerPulse {
                0% { transform: scale(1); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); }
                50% { transform: scale(1.02); box-shadow: 0 12px 35px rgba(102, 126, 234, 0.2); }
                100% { transform: scale(1); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); }
            }

            .career-view-button {
                animation: careerPulse 3s ease-in-out infinite;
            }

            .career-view-button:hover {
                animation: none;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
};

// Auto-initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => EnhancedCareerAssistant.init(), 1000);
    });
} else {
    setTimeout(() => EnhancedCareerAssistant.init(), 1000);
}