# 🧠 YaadBuddy AI (याद दोस्त)
> *"You live your life. I'll remember it."*

**YaadBuddy AI** is a voice-first, highly intelligent personal memory companion and strict daily routine coach. Built with a full-stack architecture, YaadBuddy captures your daily activities, study hours, expenses, workouts, and meetings by voice, saves them datewise, retrieves them instantly on demand, and keeps you disciplined with proactive habit reminders and strict routine audits.

---

## 🌟 Executive Summary & Key Highlights

* **Voice-First Memory Vault:** Speak naturally in English, Hindi, or Hinglish (e.g., *"I solved 5 Java problems at 9:30 AM"* or *"कल मैंने शाम 5 बजे 1 घंटा जिम किया"*). The AI automatically categorizes and timestamps the record to today or yesterday.
* **Strict Coach Mode (टोकने वाला मोड):**
  * **6:00 AM Wakeup Loop:** AI persistently nudges the user (*"Are you still sleeping, Shubham? Wake up, morning has arrived!"*) until the user replies *"Good morning AI"*.
  * **Late Wakeup Check:** If the user wakes up at 7:00 AM instead of 6:00 AM, the AI lovingly scolds them for missing their morning walk.
  * **Proactive Study & Routine Reminders:** If the user historically studies or codes between 9:00 AM and 1:00 PM but hasn't logged it today, the AI proactively warns them during the day (*"Shubham, you consistently study around this time, but haven't recorded your session yet! For your future, start now!"*).
  * **10:00 PM Bedtime Routine:** If 10:00 PM arrives without a good night check-in, the AI gently prompts the user to rest on time.
* **Dual-Engine Speech Architecture:**
  * **Zero Network Error STT:** Employs HTML5 `MediaRecorder` + server-side **Groq Whisper (`whisper-large-v3-turbo`)** as an automatic failover to Chrome's `webkitSpeechRecognition`, eliminating the dreaded `SpeechRecognition error: network`.
  * **Studio-Quality Audio:** Supports server-side **ElevenLabs Multilingual v2** voice streaming with native browser `SpeechSynthesis` failover.
* **Hybrid Intelligent Processing:**
  * Fast zero-latency local rule parser handles standard memory extraction, daily audits, and routine checklists with 100% uptime and 0 token cost.
  * Server-side **Groq Llama-3.3-70B** is engaged on-demand for nuanced conversational queries without exposing API credentials to the browser client.
* **1-Click Interactive Demo Showcase Bar:** Preloaded with 3 days of rich historical memories (Coding, Study, Fitness, Expenses, Meetings) and 1-click evaluation buttons.
* **Full-Width Windows & Mobile Responsive UI:** Dynamic 2-column layout on wide desktop screens (eliminating empty side borders) that gracefully collapses into a thumb-friendly single-column layout on smartphones.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YaadBuddy AI Frontend                    │
│          (React 19 + TypeScript + Tailwind CSS + Vite)      │
└──────────────┬───────────────────────────────▲──────────────┘
               │                               │
               │ HTTP Proxy /api/*             │ Server-Sent Responses
               ▼                               │ & Audio Streams
┌──────────────────────────────────────────────┴──────────────┐
│                 YaadBuddy Express Backend                   │
│                     (Node.js on Port 5000)                  │
├─────────────────┬───────────────────────────┬───────────────┤
│  /api/memories  │     /api/transcribe       │   /api/chat   │
│  (CRUD Vault)   │     (Groq Whisper v3)     │ (Groq Llama)  │
└────────┬────────┴─────────────┬─────────────┴───────┬───────┘
         ▼                      ▼                     ▼
┌─────────────────┐   ┌───────────────────┐   ┌───────────────┐
│  memories.json  │   │  Groq Cloud APIs  │   │  ElevenLabs   │
│  (Data Store)   │   │  (Whisper Large)  │   │  (TTS Stream) │
└─────────────────┘   └───────────────────┘   └───────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation & Execution

1. **Clone & Install Dependencies:**
   ```bash
   cd AI_Coder
   npm install
   ```

2. **Configure Environment Variables (Optional):**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   GROQ_API_KEY=your_groq_api_key_here          # Optional: For server-side Llama-3 & Whisper
   ELEVENLABS_API_KEY=your_elevenlabs_key_here  # Optional: For studio-grade multilingual voice
   ```

3. **Start Full-Stack Application (Concurrent Backend + Frontend):**
   ```bash
   npm run dev
   ```
   * **Backend Server:** `http://localhost:5000`
   * **Frontend Client:** `http://localhost:5173`
   * **Mobile Network Access:** `http://<your-local-ip>:5173`

4. **Production Build:**
   ```bash
   npm run build
   ```

---

## 📱 Features Walkthrough

### 1. Dual Mode Operations
* **Mode 1 — Hear Me (Add Activities):**
  * Say: *"I solved 5 Java problems at 9:30 AM"*
  * Say: *"Yesterday at 5:00 PM I worked out in the gym"*
  * Say: *"Had lunch with Rahul at 1:15 PM and spent 250 rupees"*
  * The AI immediately logs the date, time slot, description, and category.
* **Mode 2 — Remember (Datewise Memory Recall):**
  * Ask: *"What did I do yesterday?"*
  * Ask: *"What did I do on November 2?"*
  * The AI queries the stored vault and recites the exact activities without fabricating history.

### 2. Strict Tokne Wala Mode (Strict Coach)
* **6:00 AM Morning Walk & Wakeup Routine:** Checks whether you woke up at 6:00 AM or 7:00 AM.
* **Daily Schedule Check (6 AM to 6 PM):** Audits morning walk, 9:00 AM coding, 1:00 PM lunch, and 5:00 PM fitness session.
* **Midday Padhai / Study Check:** If your usual 9 AM - 1 PM study window passes without an entry, the AI reminds you to start immediately.
* **10:00 PM Good Night Check:** If you haven't checked in by 10 PM, the AI nudges: *"Shubham, your voice is sweet but you haven't answered! I am heading to sleep now, you should sleep on time too!"*

### 3. AI Habit Analyzer
* Automatically detects repeated multi-day streaks across your records (e.g. 3-day Coding streak, Workout streak).
* Displays streak badges and personalized insights on the main dashboard.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite |
| **Backend** | Node.js, Express, Multer, Cors, Dotenv, Concurrently |
| **Speech-to-Text (STT)** | HTML5 MediaRecorder + Groq Whisper (`whisper-large-v3-turbo`) + Web Speech API |
| **Text-to-Speech (TTS)** | ElevenLabs (`eleven_multilingual_v2`) + Browser SpeechSynthesis (`hi-IN`, `en-IN`, `en-US`) |
| **Reasoning Engine** | Groq Llama-3.3-70B Versatile + YaadBuddy Deterministic Rule Parser |
| **Data Persistence** | Server-side JSON storage (`server/data/memories.json`) & LocalStorage Vault |

---

## 🏆 Project Engineering & Design Credits

* **Core Architecture, Backend Engineering, Memory Logic & Routine Engine:**
  * Designed and Developed by **Shubham**.
* **UI/UX Design Inspiration & AI Assistant Persona:**
  * Assisted by **Claude, Antigravity, and ChatGPT** to deliver a sleek, modern, voice-first product aesthetic.

---

## 📄 License
This project is open-source under the MIT License.
