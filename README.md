
# Evolv : AI-Powered Career & Skills Advisor

A personalized AI-powered platform that provides career guidance, skills analysis, roadmap generation, coding practice, and resume building to help professionals accelerate their career growth.

## Features

- **AI Career Advisor**: Personalized career guidance with detailed roadmaps and skill assessments
- **Smart Resume Builder**: ATS-optimized resume creation with AI suggestions
- **AI Code Compiler**: Interactive coding practice with intelligent feedback and explanations
- **Skills Analytics**: Progress tracking and personalized learning recommendations
- **Visual Roadmaps**: Descriptive and visual flowchart roadmap generation
- **Question Generation**: AI-powered coding questions for practice

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **AI/ML**: Google Gemini API
- **Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **Package Manager**: npm

## Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- npm
- A Google Cloud Platform account
- Firebase CLI

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Akhileshg0111/Evolv-Ai.git
   cd evolv-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Firebase CLI globally**
   ```bash
   npm install -g firebase-tools
   ```

## Firebase Setup

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Initialize Firebase in your project**
   ```bash
   firebase init
   ```
   
   Select the following services:
   - Firestore (Database)
   - Hosting
   - Authentication

3. **Configure Firebase**
   - Select your Firebase project or create a new one
   - Use default Firestore rules for now
   - Set `public` directory as your hosting directory
   - Configure as single-page application: No

## Google Gemini API Setup

1. Go to google cloud console 
2. Create a new API key
3. Add your API key to your project configuration

## firebase Configuration

Embeed the firebase config directly into the code:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Development

1. **Start local development server**
   ```bash
   firebase serve
   ```
   
   Or use a simple HTTP server:
   ```bash
   npx http-server
   ```

2. **Access the application**
   - Open your browser and navigate to `http://localhost:5000` (Firebase) or `http://localhost:8080` (http-server)

## Deployment

1. **Build your project** (if you have a build process)
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy
   ```

3. **Deploy only hosting**
   ```bash
   firebase deploy --only hosting
   ```

## Firebase Services Configuration

### Firestore Database
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Authentication
Enable the following sign-in methods in Firebase Console:
- Google

## Project Structure

```
evolv-ai/
├── public/
│   ├── index.html          
│   ├── main.html           
│   ├── resume.html
│   ├── code-editor.html
│   ├── js/
│   │   ├── auth.js     
│   │   ├── charts.js   
│   │   ├── copy.js  
│   │   └── export.js
│   │   └── sidebar.js
│   │   └── voice.js         
├── firebase.json           
├── .firebaserc            
└── package.json           
```

## Available Scripts

- `firebase serve` - Start local development server
- `firebase deploy` - Deploy to Firebase Hosting
- `firebase deploy --only hosting` - Deploy only hosting
- `firebase deploy --only firestore` - Deploy only Firestore rules

## Features Implementation

### Career Roadmap Generation
- Integrates with Google Gemini API for AI-powered roadmap creation
- Supports both descriptive and visual flowchart formats

### Resume Builder
- ptimization features
- Real-time AI suggestions and scoring

### Code Compiler
- Interactive coding environment
- AI-powered generating and debugging help
- Automatic question generation for practice

