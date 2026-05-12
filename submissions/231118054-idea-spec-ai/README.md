# Nokta Final Submission 231118054: HITL System Integration

This absolute production-ready MVP demonstrates the Nokta Ecosystem enhanced with a **Human-in-the-Loop** expert fallback system, leveraging modern Server-Side decision engines and Client-Side video infrastructure.

---

## Technical Overview
The system isolates functionality precisely to maintain Security, Maintainability, and separation of Concerns (SoC).

### Architecture Map
```text
submissions/231118054/
├── server/                 # Safe API Backend (Express + Stream Node SDK)
│   ├── .env.example
│   ├── index.js            # Queue, Groq routing, Transcript extraction
│   └── package.json
└── app/                    # Scalable Mobile UI (Expo + Stream React Native SDK)
    ├── App.js              # Native Stack Navigation
    ├── app.json         
    └── src/
        ├── screens/        # Separated Interface views (Mascot vs Mentor)
        │   ├── HomeScreen.js
        │   ├── ChatScreen.js
        │   └── MentorDashboard.js
        └── services/       # Decoupled HTTP API layers (Axios)
            └── api.js
```

---

## 1. Environment variables & Setup

### A. Stream Setup
You must have a Stream Video (Stream.io) account. Set up a project and grab the keys.

1. Create `server/.env` based on `server/.env.example`.
```env
PORT=3000
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
GROQ_API_KEY=your_groq_api_key
```

2. The Mobile App relies on `.env` fallback or standard variables for testing. Ensure your Android emulator networking points correctly (`10.0.2.2`).

### B. Backend Initialization (Run this First)
```bash
cd server
npm install
npm run start
```
*This binds your logic router onto `localhost:3000` handling escalating and AI.*

### C. Frontend Initialization 
```bash
cd app
npm install
npx expo start --clear
```

*(Note: Because this utilizes Stream Video native WebRTC capabilities, you must construct an Expo Dev Client (`npm run android` / `npx expo run:android`) if you wish to run the stream perfectly on physical hardware. Pure Expo Go has limited WebRTC backing.)*

---

## 2. The Features Explained (Flow)

### 1. Mascot Escalation (AI Trigger)
The user inputs text in the `ChatScreen`. The prompt shoots to the backend, which forwards it to `Groq` through a custom system wrapper. If the LLM identifies that specialized, non-hallucinated human analysis is needed, it toggles `escalation_needed: true`.

### 2. Escalation Hand-off Queue
The App prompts the User. If they Accept, the backend registers a `pending` escalation ticket. 
On the flip-side, the `MentorDashboard` polls the `/escalations` backend array. 

### 3. Stream Setup & Acceptance
The Mentor hits "Accept" and the ticket turns `accepted`. The backend immediately vends two Video Tokens utilizing the Stream IO Node SDK (one to User, one to Mentor).

### 4. Video UI Render
Both User and Mentor `StreamCall` interfaces mount dynamically. The AI interface freezes dynamically avoiding confusion while Mentor takes over to guide the user.

### 5. Transcript Writeback
Once the call hangs up, the React Native app dials `GET /calls/.../transcript`. The token server calls the Stream `/transcriptions` API, pulling the exact verbal log of the interaction, which then populates directly back into the Nokta User text-log.

---

## 3. Building the APK (Cloud EAS)

Since the local Windows environment lacks a configured Java compilation kit (JDK), the most reliable way to generate the standalone Android APK `app-release.apk` is using the Expo Application Services (EAS) cloud builder.

1. Ensure the Expo CLI is logged in:
```bash
npx expo login
```
2. Trigger the cloud compilation (this will yield an APK link instead of an AAB):
```bash
cd app
eas build -p android --profile preview
```
3. Once the dashboard compilation finishes, download the `.apk` and place it in `submissions/231118054/builds/app-release.apk` for evaluator testing.
