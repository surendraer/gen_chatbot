# 🤖 GenBot — Minimalist AI Chatbot

A lightweight full-stack AI chatbot application featuring real-time streaming responses, a sidebar thread manager, user authentication, and profile editing. Built with a high-contrast editorial look and powered by **Llama 3.3 70B** on Groq.

🔗 **Demo Link**: [gen-chatbot-three.vercel.app](https://gen-chatbot-three.vercel.app)

---

## ⚙️ Core Architecture & "Why this Stack?"

This project follows specific technology design choices optimized for speed, simplicity, and visual focus:

### ⚡ Why Groq + Llama 3.3?
- **Speed Over Everything**: Groq's LPU (Language Processing Unit) delivers inference speeds exceeding 250 tokens per second. We query the `llama-3.3-70b-versatile` model to provide fast responses.

### 📡 Why Server-Sent Events (SSE)?
- **Low-Overhead Streaming**: Rather than polling or maintaining full duplex WebSockets, we utilize Server-Sent Events (via Express and standard `fetch` body readers). This provides an easy, unidirectional flow that streams tokens directly into the client.

### 🍃 Why MongoDB?
- **Flexible Document Model**: Conversation histories are grouped under unique thread UUIDs. MongoDB's document structure easily stores nested, heterogeneous schema logs without requiring strict table joins.

### 🎨 Why the Nike Minimal Aesthetic?
- **Contrast Focus**: Following high-end digital editorial design specs, the interface relies on true black/white colors, `9999px` pills, and flat container grids. This design ensures that user content takes absolute priority.

---

## 📁 Repository Map

```
GenBot/
├── server.js              # Express server with CORS config
├── db.js                  # MongoDB Mongoose connection
├── jwt.js                 # JWT auth middleware
├── models/
│   ├── user.js            # User model (name, username, email, mobile, password)
│   └── prompt.js          # Dialogue history (textPrompt, textAnswer, conversationId)
├── routes/
│   ├── userRoutes.js      # Auth check, signup, profile endpoints
│   └── promptRoutes.js    # Streaming completions and history routes
└── frontend/              # Client (Vite + React 18)
    ├── src/
    │   ├── main.jsx       # App entry
    │   ├── App.jsx        # Routing configuration
    │   ├── api.js         # Centralized Axios configs
    │   ├── index.css      # Core Nike typography tokens & Dark Mode switches
    │   ├── context/       # Authentication context loading
    │   ├── components/    # Reusable layouts (Navbar)
    │   └── pages/         # View panels (Home, Chat, History, Settings)
    └── vercel.json        # Single-page-app route rewrite routing rules
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas cluster URL
- Groq API Key ([console.groq.com](https://console.groq.com))

### 2. Backend Setup
Run in root folder:
```bash
npm install
```

Create a root `.env` file:
```env
MONGO_URL=mongodb+srv://<user>:<pwd>@cluster.mongodb.net/database
JWT_SECRET=your_jwt_signature_secret_key
GROQ_API_KEY=gsk_your_groq_api_token
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
Run in `frontend` folder:
```bash
npm install
```

Create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3000
```

Start client:
```bash
npm run dev
```

---

## 📡 Key API Routes

- `POST /user/signup` — Registers user (validates username uniqueness, mobile structure, and password strengths).
- `GET /user/check-username/:username` — Performs live availability audits.
- `POST /prompt` — Initiates an SSE text stream for prompts.
- `GET /prompt/history` — Retreives past dialogue listings.
