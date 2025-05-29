MedWell 360 – All-in-One AI-Powered Health Platform

MedWell 360 is a secure, AI-powered health dashboard and document management system designed to help users manage medical data efficiently. With features like prescription digitization, health metrics tracking, intelligent reminders, and Firebase-secured authentication, MedCare empowers users to stay on top of their health with ease.

🚀 Features
- 🔐 User Authentication: Secure login/register with Firebase Authentication.
- 📁 Document Vault: Upload, view, and categorize medical documents by date and type.
- 🤖 Prescription OCR: Digitize handwritten prescriptions and extract medicine names using AI (Groq API).
- 🤖 Pill Identifier : Upload a photo of a pill cover and get information about it
- 📊 Health Dashboard: Interactive metrics for heart rate, weight, sleep, and more.
- 📝 Reminders: Create and manage health-related tasks and medication reminders.
- 📊Health life and wellness : Takes many records like heart rate , sleep hours, weight , sugar and provide dynamic grapghs of it.
- 🧠 Nutrition Guide : Ai guide suggests waht to eat and what not.
- 🌗 Dark Mode: Toggle between light and dark themes for accessibility.
- 🧠 AI Enhancements: Misspelling correction and name suggestions for extracted medicines.

🧱 Tech Stack
Frontend:
- React.js + Tailwind CSS
- Firebase Auth
- ShadCN UI
- Framer Motion

Backend:
- Node.js + Express
- MongoDB with Mongoose
- OCR & AI via Groq API

Other Tools:
- Firebase Hosting (optional)
- JWT (if custom auth added)
- React Router for navigation

📦 Project Structure
MedCare/
├── client/
│   ├── components/
│   ├── pages/
│   └── utils/
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── middleware/
└── README.md

🛠️ Setup Instructions

Prerequisites
- Node.js v18+
- MongoDB Atlas or Local Instance
- Firebase Project
- Groq API key (for prescription OCR)

Installation
# Clone the repo
git clone https://github.com/yourusername/medcare.git

cd medcare

# Install backend dependencies
cd server
npm install

# Setup environment variables in server/.env
MONGO_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_api_key

# Start backend
npm run dev

# Install frontend dependencies
cd ../client

npm install

# Start frontend
npm run dev

Environment Variables (Frontend)

Create .env in /client with:

VITE_FIREBASE_API_KEY=your_key

VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain

VITE_FIREBASE_PROJECT_ID=your_project_id

📸 Screenshots
You can view some of the pages of my website here :https://drive.google.com/file/d/1gJa44O9xnn0zWbV3biTQC9CREAToD9BB/view?usp=sharing

Demo Video Link : https://youtu.be/j9AqkZjkVes

🧪 Future Enhancements
- Multi-user sharing of health documents
- Doctor/Clinic login portal
- Push notifications for reminders
- Analytics: trends and predictive health metrics
- PDF export of health reports

🧑‍💻 Contributors
- Open to contributors! Submit PRs or issues.


Built with ❤️ to simplify healthcare management.
