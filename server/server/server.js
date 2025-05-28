// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const Groq = require('groq-sdk');

const prescriptionRoutes = require('./routes/prescriptions');
const medicineRoutes = require('./routes/medicines');
const documentRoutes = require('./routes/documentRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/UserSetup');
const remindersRoutes = require("./routes/reminders");
const User = require('./models/UserProfile'); // User model
const Reminder = require('./models/Reminder');
const vitalSignRoutes = require('./routes/vitalSigns');
const symptomRoutes = require('./routes/symptoms');
const activityRoutes = require('./routes/activities');
const sleepRoutes = require('./routes/sleeps');
const meditationRoutes = require('./routes/MeditationRoutes');


dotenv.config();
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => console.error('❌ MongoDB connection error:', err));

app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/reminders", remindersRoutes);

app.get('/api/user/profile', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST/PUT user profile (create or update)
app.post('/api/user/profile', async (req, res) => {
  const { userId, name, email, age, gender, heartRate, sleepHours, activeHours, weight } = req.body;
  if (!userId || !name || !email) {
    return res.status(400).json({ message: 'userId, name, and email are required for profile setup' });
  }

  try {
    // Find and update if exists, otherwise create new
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { name, email, age, gender, heartRate, sleepHours, activeHours, weight },
      { new: true, upsert: true, setDefaultsOnInsert: true } // `new: true` returns the updated document, `upsert: true` creates if not found
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error saving user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT route for updating specific metrics (already handled by POST with upsert, but keeping for clarity if specific PUT is preferred)
app.put('/api/user/profile', async (req, res) => {
  const { userId } = req.query; // Get userId from query for PUT
  if (!userId) {
    return res.status(400).json({ message: 'userId is required for updating profile' });
  }

  const updates = req.body; // Body contains the fields to update

  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: updates }, // Use $set to update only specified fields
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User profile not found for update' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Reminder Routes
// GET all reminders for a specific userId
app.get('/api/reminders', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }
  try {
    const reminders = await Reminder.find({ userId }).sort({ dueDate: 1 }); // Sort by due date
    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST a new reminder
app.post('/api/reminders', async (req, res) => {
  const { userId, title, description, dueDate } = req.body;
  if (!userId || !title || !dueDate) {
    return res.status(400).json({ message: 'userId, title, and dueDate are required' });
  }
  try {
    const newReminder = new Reminder({ userId, title, description, dueDate });
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    console.error('Error adding reminder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
app.get('/', (req, res) => {
    res.send('AI Symptom Checker Node.js Backend is running!');
});

// Symptom identification route
app.post('/api/symptom-checker/identify', async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ message: "Please provide symptoms as an array." });
        }

        const symptomsStr = symptoms.join(', ');
        const prompt = `Given the following symptoms: '${symptomsStr}'. As a highly knowledgeable medical AI, list the most probable diseases or conditions, and provide a brief explanation for each. Also, suggest if professional medical attention is advised. Always preface your response with 'Based on the symptoms provided, here are some possible conditions:'`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            model: "llama3-8b-8192", // You can choose other Groq models
            temperature: 0.7,
            max_tokens: 1024,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "No relevant information found.";
        res.json({ result: aiResponse });

    } catch (error) {
        console.error('Error during symptom identification:', error);
        res.status(500).json({ message: "Internal server error during symptom identification.", error: error.message });
    }
});

// Chatbot route
app.post('/api/chat', async (req, res) => {
    try {
        const { message, chatHistory } = req.body; // chatHistory from frontend is an array of {role, message}

        if (!message) {
            return res.status(400).json({ message: "No message provided." });
        }

        // Prepare messages for Groq, including history
        const messagesForGroq = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant', // Groq uses 'assistant' for AI role
            content: msg.content || msg.message // Ensure content field is used, fallback to message
        }));
        
        // Add a system message to guide the AI's persona
        // Only add if not already present in history
        if (!messagesForGroq.some(msg => msg.role === 'system')) {
            messagesForGroq.unshift({
                role: "system",
                content: "You are a helpful and knowledgeable health assistant. Provide concise and accurate information related to general health and symptoms. Do not provide medical diagnoses or replace professional medical advice. Always recommend consulting a doctor for definitive diagnosis and treatment."
            });
        }

        messagesForGroq.push({ role: "user", content: message });

        const chatCompletion = await groq.chat.completions.create({
            messages: messagesForGroq,
            model: "llama3-8b-8192", // Consider 'llama3-70b-8192' for more nuanced conversations
            temperature: 0.7,
            max_tokens: 100,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't get a response.";
        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error during chat:', error);
        res.status(500).json({ message: "Internal server error during chat.", error: error.message });
    }
});
app.use('/api/documents', documentRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('Health Document Manager API is running!');
});
app.use('/api/vitalsigns', vitalSignRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/lifestyle/activity', activityRoutes);
app.use('/api/lifestyle/sleep', sleepRoutes);
app.use('/api/meditation', meditationRoutes); // All meditation routes will be prefixed with /api/meditation

// Basic root route
app.get('/', (req, res) => {
  res.send('Mindfulness App Backend is running!');
});


const PORT = process.env.REACT_APP_BACKEND_PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

