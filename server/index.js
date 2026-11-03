import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Storage directory setup
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MEMORIES_FILE = path.join(DATA_DIR, 'memories.json');
const ROUTINE_FILE = path.join(DATA_DIR, 'routine.json');

// Multer memory storage for audio transcription uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Initial Sample 3-Day Demo Records
const INITIAL_DEMO_RECORDS = [
  // Today (2026-11-03)
  { id: 'rec-today-1', date: '2026-11-03', time: '06:00 AM', description: '6:00 AM subah uthke 45 minute morning walk aur yoga kiya', category: 'Morning', tags: ['walk', 'yoga', 'routine'] },
  { id: 'rec-today-2', date: '2026-11-03', time: '09:30 AM', description: 'Solved 5 complex Java multithreading questions & studied Spring Boot', category: 'Coding', tags: ['java', 'dsa', 'study'] },
  { id: 'rec-today-3', date: '2026-11-03', time: '01:15 PM', description: 'Met Rahul for lunch at Food Court, spent ₹250 on thali', category: 'Expense', tags: ['food', 'lunch', 'friends'] },
  { id: 'rec-today-4', date: '2026-11-03', time: '03:45 PM', description: 'Client meeting with Rohit about UI design system', category: 'Meeting', tags: ['work', 'client', 'design'] },

  // Yesterday (2026-11-02)
  { id: 'rec-yest-1', date: '2026-11-02', time: '06:00 AM', description: 'Subah 6 baje utha aur 5km brisk run kiya park me', category: 'Morning', tags: ['running', 'fitness'] },
  { id: 'rec-yest-2', date: '2026-11-02', time: '10:00 AM', description: 'Revised React Hooks, Virtual DOM and optimized render cycle', category: 'Coding', tags: ['react', 'frontend', 'study'] },
  { id: 'rec-yest-3', date: '2026-11-02', time: '01:30 PM', description: 'Ate home food and read tech blogs on AI agents', category: 'Food', tags: ['lunch', 'reading'] },
  { id: 'rec-yest-4', date: '2026-11-02', time: '05:30 PM', description: 'Chest and triceps intense workout in gym for 60 mins', category: 'Fitness', tags: ['gym', 'workout'] },
  { id: 'rec-yest-5', date: '2026-11-02', time: '08:00 PM', description: 'Bought weekly groceries from Supermarket, spent ₹780 on UPI', category: 'Expense', tags: ['shopping', 'groceries'] },

  // Nov 1 (2026-11-01)
  { id: 'rec-nov1-1', date: '2026-11-01', time: '06:30 AM', description: 'Morning breathing exercises and light stretching', category: 'Morning', tags: ['wellness', 'stretch'] },
  { id: 'rec-nov1-2', date: '2026-11-01', time: '11:00 AM', description: 'Solved 4 Binary Search Tree & Dynamic Programming problems', category: 'Coding', tags: ['dsa', 'algorithms'] },
  { id: 'rec-nov1-3', date: '2026-11-01', time: '02:00 PM', description: 'Team sync call on Zoom to discuss project sprint', category: 'Meeting', tags: ['work', 'sprint'] },
  { id: 'rec-nov1-4', date: '2026-11-01', time: '05:15 PM', description: 'Leg workout and cardio sprint in the gym', category: 'Fitness', tags: ['gym', 'legday'] },
  { id: 'rec-nov1-5', date: '2026-11-01', time: '09:00 PM', description: 'Read Atomic Habits chapter 4 before sleeping', category: 'Study', tags: ['reading', 'habits'] },
];

const INITIAL_ROUTINE = [
  { id: 'r1', timeSlot: '06:00 AM - 07:00 AM', title: '6:00 AM — Subah Uthna & Morning Walk', category: 'Morning', completed: true },
  { id: 'r2', timeSlot: '09:00 AM - 01:00 PM', title: '9:00 AM to 1:00 PM — Coding & Problem Solving', category: 'Coding', completed: true },
  { id: 'r3', timeSlot: '01:00 PM - 02:00 PM', title: '1:00 PM — Lunch & Rest Break', category: 'Food', completed: true },
  { id: 'r4', timeSlot: '05:00 PM - 06:00 PM', title: '5:00 PM — Evening Workout / Gym', category: 'Fitness', completed: false },
  { id: 'r5', timeSlot: '09:00 PM - 10:00 PM', title: '9:00 PM — Daily Review & Log', category: 'Review', completed: false },
];

// Helper: Read / Write JSON
function getMemories() {
  try {
    if (fs.existsSync(MEMORIES_FILE)) {
      const data = fs.readFileSync(MEMORIES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading memories file:', e);
  }
  // Initialize file
  fs.writeFileSync(MEMORIES_FILE, JSON.stringify(INITIAL_DEMO_RECORDS, null, 2));
  return INITIAL_DEMO_RECORDS;
}

function saveMemories(records) {
  try {
    fs.writeFileSync(MEMORIES_FILE, JSON.stringify(records, null, 2));
  } catch (e) {
    console.error('Error saving memories:', e);
  }
}

function getRoutine() {
  try {
    if (fs.existsSync(ROUTINE_FILE)) {
      const data = fs.readFileSync(ROUTINE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading routine file:', e);
  }
  fs.writeFileSync(ROUTINE_FILE, JSON.stringify(INITIAL_ROUTINE, null, 2));
  return INITIAL_ROUTINE;
}

function saveRoutine(routine) {
  try {
    fs.writeFileSync(ROUTINE_FILE, JSON.stringify(routine, null, 2));
  } catch (e) {
    console.error('Error saving routine:', e);
  }
}

// ---------------------- ROUTES ---------------------- //

// 1. Health & Configuration Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    groqConfigured: !!(process.env.GROQ_API_KEY || req.headers['x-groq-key']),
    elevenLabsConfigured: !!(process.env.ELEVENLABS_API_KEY || req.headers['x-elevenlabs-key']),
    version: '2.0.0'
  });
});

// 2. Transcribe Audio (Groq Whisper / Whisper Large v3)
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const groqKey = req.headers['x-groq-key'] || process.env.GROQ_API_KEY;
    const language = req.body.language || 'hi';

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!groqKey) {
      return res.status(400).json({ 
        error: 'Groq API Key is not configured on server or in headers.', 
        fallbackRequired: true 
      });
    }

    // Build form-data for Groq Whisper
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' });
    formData.append('file', blob, 'recording.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('temperature', '0.0');
    if (language === 'hi') {
      formData.append('language', 'hi');
      formData.append('prompt', 'नमस्ते, मैंने आज 9 बजे कोडिंग की, लंच किया, जिम गया, पैसे खर्च किए।');
    } else if (language === 'en') {
      formData.append('language', 'en');
    }

    const whisperResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`
      },
      body: formData
    });

    if (!whisperResponse.ok) {
      const errText = await whisperResponse.text();
      console.error('Groq Whisper error response:', errText);
      return res.status(whisperResponse.status).json({ error: 'Whisper transcription failed', details: errText });
    }

    const data = await whisperResponse.json();
    res.json({ text: data.text });
  } catch (error) {
    console.error('Transcription exception:', error);
    res.status(500).json({ error: error.message || 'Server error during transcription' });
  }
});

// 3. AI Chat & Intelligent Processing (Groq Llama-3.3-70B)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'hi', userName = 'Shubham', strictCoachMode = true, pastRecords = [] } = req.body;
    const groqKey = req.headers['x-groq-key'] || process.env.GROQ_API_KEY;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!groqKey) {
      // Fallback rule-based response
      return res.json({ 
        speech: language === 'hi' 
          ? `नमस्ते ${userName}! मैंने आपका संदेश नोट कर लिया है: "${message}"`
          : `Hello ${userName}! Recorded your message: "${message}"`,
        source: 'local_rule'
      });
    }

    const systemPrompt = `You are YaadBuddy AI (याद दोस्त), a friendly, highly intelligent, voice-first personal memory assistant and strict routine coach for ${userName}.
Language Mode: ${language === 'hi' ? 'Pure natural Hindi (Devanagari script)' : language === 'en' ? 'English' : 'Natural conversational Hinglish'}.
Strict Tokne Wala Mode: ${strictCoachMode ? 'ACTIVE (Punctuality coach - scold if late or skipped task, encourage if on time)' : 'OFF'}.

PAST SAVED MEMORIES OF USER:
${JSON.stringify(pastRecords.slice(-15), null, 2)}

CORE INSTRUCTIONS:
1. Speak directly to ${userName} in 1 to 2 conversational, punchy sentences suitable for text-to-speech.
2. If user shares an activity ("Maine 9 baje..."), confirm with enthusiasm.
3. If user asks what they did on a date, ONLY report actual facts from the saved memories above. NEVER invent or hallucinate past activities.
4. If user wakes up late or skips routine in Strict Coach Mode, lovingly scold them to get back on track.
5. Do NOT include markdown bold stars (**), bullet points, or complex symbols because the text will be spoken out loud. Keep numbers and currency natural (e.g. 250 rupaye).`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.6,
        max_tokens: 250
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq chat error:', errText);
      return res.json({
        speech: language === 'hi'
          ? `नमस्ते ${userName}! मैंने आपकी बात समझ ली: "${message}". रिकॉर्ड सेव हो गया है!`
          : `Got it ${userName}! Noted: "${message}". Saved!`,
        source: 'fallback'
      });
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content || 'Okay, noted!';
    res.json({ speech: reply.trim(), source: 'groq' });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. ElevenLabs Voice Synthesis (Server-side TTS)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'hi' } = req.body;
    const elevenLabsKey = req.headers['x-elevenlabs-key'] || process.env.ELEVENLABS_API_KEY;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!elevenLabsKey) {
      return res.status(400).json({ error: 'ElevenLabs key not configured', fallbackToBrowser: true });
    }

    // Default expressive voice (Rachel or multilingual voice)
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; 

    const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.85,
          style: 0.35,
          use_speaker_boost: true
        }
      })
    });

    if (!elevenResponse.ok) {
      const errText = await elevenResponse.text();
      console.error('ElevenLabs TTS error:', errText);
      return res.status(elevenResponse.status).json({ error: 'ElevenLabs TTS failed', fallbackToBrowser: true });
    }

    // Stream audio buffer back to client
    const audioBuffer = await elevenResponse.arrayBuffer();
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength
    });
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message, fallbackToBrowser: true });
  }
});

// 5. Memory CRUD Endpoints
app.get('/api/memories', (req, res) => {
  const records = getMemories();
  res.json({ records });
});

app.post('/api/memories', (req, res) => {
  const { date, time, description, category, tags = [] } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const currentRecords = getMemories();
  const newRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    date: date || new Date().toISOString().split('T')[0],
    time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: description.trim(),
    category: category || 'General',
    tags
  };

  const updated = [newRecord, ...currentRecords];
  saveMemories(updated);
  res.status(201).json({ record: newRecord, records: updated });
});

app.delete('/api/memories/:id', (req, res) => {
  const { id } = req.params;
  const currentRecords = getMemories();
  const filtered = currentRecords.filter(r => r.id !== id);
  saveMemories(filtered);
  res.json({ success: true, records: filtered });
});

app.post('/api/memories/reset-demo', (req, res) => {
  saveMemories(INITIAL_DEMO_RECORDS);
  res.json({ success: true, records: INITIAL_DEMO_RECORDS });
});

// 6. Routine Endpoints
app.get('/api/routine', (req, res) => {
  res.json({ routine: getRoutine() });
});

app.post('/api/routine/toggle', (req, res) => {
  const { id } = req.body;
  const routine = getRoutine();
  const updated = routine.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
  saveRoutine(updated);
  res.json({ routine: updated });
});

app.post('/api/routine/update-time', (req, res) => {
  const { id, newTimeSlot } = req.body;
  const routine = getRoutine();
  const updated = routine.map(r => r.id === id ? { ...r, timeSlot: newTimeSlot } : r);
  saveRoutine(updated);
  res.json({ routine: updated });
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 YaadBuddy Backend Server running on port ${PORT}`);
  console.log(`🔊 Endpoints: /api/chat, /api/transcribe, /api/tts, /api/memories`);
  console.log(`===============================================`);
});
