# 🤖 GenBot — AI Chatbot with Persistent Conversations

A full-stack AI chatbot application featuring real-time streaming responses, a ChatGPT-style interface with conversation history, user authentication, and profile management. Built with the MERN stack and powered by **Llama 3.3 70B** via the Groq API.

🔗 **Live Demo**: [gen-chatbot-three.vercel.app](https://gen-chatbot-three.vercel.app)

---

## ✨ Features

### 🧠 AI Chat
- **Real-time Streaming (SSE)** — AI responses stream token-by-token via Server-Sent Events for a natural typing effect
- **Conversation Context** — Full multi-turn context is sent to the LLM so the AI remembers what you said earlier in the conversation
- **ChatGPT-style Sidebar** — Browse, resume, and create new conversation threads from a persistent sidebar
- **Markdown Rendering** — Bot responses render rich markdown including tables, code blocks with syntax highlighting, and copy-to-clipboard
- **Voice Input** — Speak your messages using the Web Speech API (Chrome/Edge)

### 🔐 Authentication & Security
- **JWT Authentication** — Secure token-based auth with 7-day expiry and auto-logout on expiration
- **Password Hashing** — Bcrypt with salt rounds for secure password storage
- **Input Validation** — Comprehensive server-side validation (email format, password strength, username rules)
- **Protected Routes** — All chat and profile endpoints require valid authentication

### 👤 User Management
- **Profile Dashboard** — View and edit personal details with a tabbed settings interface
- **Password Reset** — Change password with current password verification
- **Account Deletion** — Permanently delete account and all associated data
- **Duplicate Detection** — Prevents duplicate emails, usernames, and phone numbers at signup

### 📜 Conversation History
- **Persistent Storage** — All conversations are saved to MongoDB and grouped by session
- **Search & Filter** — Full-text search across all past conversations
- **Date Grouping** — History organized by Today, Yesterday, Last 7 Days, and Earlier
- **Expandable View** — Click any conversation to expand and review the full chat thread
- **Clear History** — One-click option to wipe all conversation data

### 🎨 UI/UX
- **Glassmorphism Design** — Modern frosted-glass aesthetic with subtle backdrop blur effects
- **Smooth Animations** — Page transitions and micro-interactions powered by Framer Motion
- **Responsive Layout** — Fully responsive with mobile sidebar toggle and adaptive layouts
- **Dark Theme** — Premium dark mode interface with carefully curated color palette
- **Independent Scrolling** — Sidebar and chat area scroll independently (no page-level scroll bleed)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v7, Framer Motion, Axios |
| **Backend** | Node.js, Express 5, Mongoose, JWT, Bcrypt |
| **Database** | MongoDB Atlas |
| **AI Model** | Llama 3.3 70B (via Groq API with OpenAI-compatible SDK) |
| **Streaming** | Server-Sent Events (SSE) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure

```
GenBot/
├── server.js              # Express server entry point with CORS config
├── db.js                  # MongoDB connection handler
├── jwt.js                 # JWT token generation & auth middleware
├── models/
│   ├── user.js            # User schema with bcrypt password hashing
│   └── prompt.js          # Prompt schema with conversationId grouping
├── routes/
│   ├── userRoutes.js      # Auth, profile CRUD, password reset
│   └── promptRoutes.js    # SSE streaming, history, clear endpoints
├── frontend/
│   ├── index.html         # SEO-optimized HTML entry
│   └── src/
│       ├── main.jsx       # React entry with providers
│       ├── App.jsx        # Route definitions & layout
│       ├── api.js         # Axios instance with interceptors
│       ├── index.css      # Global design system & utilities
│       ├── context/
│       │   └── AuthContext.jsx  # Global auth state management
│       ├── components/
│       │   └── Navbar.jsx       # Navigation bar
│       └── pages/
│           ├── Home.jsx         # Landing page
│           ├── Login.jsx        # Login form
│           ├── Signup.jsx       # Registration form
│           ├── Chat.jsx         # Main chat with sidebar
│           ├── History.jsx      # Grouped conversation history
│           └── Profile.jsx      # User settings dashboard
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Groq API key ([console.groq.com](https://console.groq.com))

### 1. Clone the repository
```bash
git clone https://github.com/surendraer/gen_chatbot.git
cd gen_chatbot
```

### 2. Backend setup
```bash
npm install
```

Create a `.env` file in the root directory:
```env
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/genbot
JWT_SECRET=your_jwt_secret_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deployment

### Frontend (Vercel)
1. Connect the GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL` = your Render backend URL
4. Deploy

### Backend (Render)
1. Connect the GitHub repo to Render
2. Set **Root Directory** to ` ` (empty — root of repo)
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `node server.js`
5. Add environment variables: `MONGO_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `ALLOWED_ORIGINS`
6. Deploy

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/user/signup` | Register a new user |
| `POST` | `/user/login` | Login and receive JWT |
| `GET` | `/user/profile` | Get current user profile |
| `PUT` | `/user/profile/update` | Update profile details |
| `POST` | `/user/password/reset` | Change password |
| `DELETE` | `/user/profile/delete` | Delete account permanently |

### Chat (Protected — requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/prompt` | Send prompt & receive SSE stream |
| `GET` | `/prompt/history` | Fetch all conversation history |
| `DELETE` | `/prompt/clear` | Clear all conversation history |

---

## 📸 Screenshots

| Landing Page | Chat Interface |
|:---:|:---:|
| Modern glassmorphism landing | ChatGPT-style sidebar with conversations |

| Conversation History | Profile Settings |
|:---:|:---:|
| Expandable grouped conversations | Tabbed profile with security settings |

---

## 🔑 Key Implementation Details

- **SSE Streaming**: The backend uses `res.write()` with `X-Accel-Buffering: no` headers to bypass Render's reverse proxy buffering, ensuring real-time token delivery
- **Conversation Grouping**: Messages are grouped by `conversationId` (UUID generated client-side) enabling multi-turn context and sidebar navigation
- **Auth Flow**: JWT tokens are stored in `localStorage`, automatically attached via Axios interceptors, and validated server-side on every protected request
- **Responsive Sidebar**: Uses Framer Motion for smooth slide-in/out animation with independent scroll regions for sidebar and chat content

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by [Surendra](https://github.com/surendraer)**
