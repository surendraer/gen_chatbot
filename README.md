# 🤖 GenBot Full-Stack AI Chat Application

GenBot is a complete, production-ready full-stack application that leverages **Google Gemini 2.0 Flash** to provide users with a secure, lightning-fast, and deeply engaging conversational AI experience.

### 🌟 Live Demo
**[Launch GenBot in your browser!](https://gen-chatbot-three.vercel.app/)**

---

## 🚀 Features

### Frontend (React + Vite)
- **Stunning UI/UX:** A custom-built, glassmorphic design system using pure CSS (`backdrop-filter`) without bloated dependency frameworks.
- **Fluid Micro-animations:** Uses `framer-motion` for buttery smooth layout transitions, bouncing button taps, and a beautiful chat bubble fade-in effect.
- **Secure Authentication:** JWT tokens are securely stored in the browser and automatically attached to protected API requests via Axios interceptors.
- **Responsive Design:** Completely mobile-ready interface.
- **Conversation History:** A fully paginated dashboard with real-time search functionality.
- **Account Management:** Users can safely update their profile details, reset long encrypted passwords, and permanently delete their accounts.

### Backend (Node.js + Express)
- **Robust Security:** Implements `bcrypt` for password hashing and `cors` strictly locked down to the frontend domain origin.
- **Protected Routes:** `jwt` middleware secures all private endpoints.
- **AI Integration:** Direct hooks into the latest `@google/genai` Node SDK for flawless prompt streaming.
- **MongoDB Database:** Efficiently stores `Users` and their deeply referenced `Prompts` history via Mongoose object modeling.

---

## 🛠️ Technology Stack
| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Framer Motion, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt, CORS |
| **Database** | MongoDB Atlas, Mongoose |
| **AI Output** | Google Gemini (2.0 Flash) SDK |
| **Hosting** | Vercel (Frontend), Render (Backend) |

---

## 📡 API Endpoints Summary

### Auth & User (`/user`)
- `POST /signup` - Register a new user
- `POST /login` - Authenticate an existing user
- `GET /profile` - Fetch current user information
- `PUT /profile/update` - Modify user details safely (strips password modifications)
- `POST /password/reset` - Safely change encrypted password
- `DELETE /profile/delete` - Permanently wipe the user

### AI Prompts (`/prompt`)
- `POST /` - Send a text query string to Gemini 2.0 Flash & store the response to history
- `GET /history` - Fetch chronological arrays of past conversations

---

## 💻 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/gen_chatbot.git
cd gen_chatbot
```

### 2. Backend Setup
```bash
npm install
```
Create a `.env` file in the root directory:
```env
MONGO_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_string
GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal session and navigate into the `frontend` directory.
```bash
cd frontend
npm install
```
Start the local Vite preview server:
```bash
npm run dev
```
*(The local frontend automatically handles CORS headers securely with the local backend).*

---

## 🛡️ License
This project is licensed under the MIT License.
