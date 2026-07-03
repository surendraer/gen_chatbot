<!-- Production Launch v1.0.0 - Optimized AI Chatbot -->
# 🤖 GenBot — My Personal AI Chatbot

I built GenBot, a lightweight full-stack AI chatbot application. It features real-time streaming responses, a clean sidebar conversation manager, secure user authentication, profile editing, and verification. I designed it using a premium, high-contrast visual layout inspired by high-end design systems.

---

## ⚙️ Why I Chose this Stack

I chose these specific technologies to make my app fast, responsive, and clean:

* **Groq + Llama 3.3 70B**: I query the `llama-3.3-70b-versatile` model via Groq's high-speed inference engine. This gives me response speeds exceeding 250 words per second.
* **Server-Sent Events (SSE)**: I chose SSE because it allows my backend to stream replies token-by-token directly to my client, without the heavy overhead of WebSockets.
* **MongoDB Atlas**: I store conversation histories in MongoDB. Its flexible document model allows me to group threads by unique session UUIDs without complex relational tables.
* **Typographic Design System**: I selected a high-contrast layout utilizing only pure black and white surfaces, which makes reading bot responses highly legible.

---

## ⚡ My Optimizations & Performance Tuning

I implemented several custom optimizations to ensure high speed and visual stability:

1. **Compound Database Indexing**: I added a compound index on `{ userId: 1, conversationId: 1 }` in my database. This allows MongoDB to search and sort user chat threads instantly, bypassing slow full-database table scans.
2. **CORS Preflight Caching**: I configured my server's CORS rules to cache preflight validation requests (`maxAge: 86400`). This saves client-side network round-trips for every API request, reducing loading lag.
3. **Debounced Username Checks**: On the signup page, I debounced the input box validation by 500ms. This prevents spamming my database with lookups on every single key stroke.
4. **Stateful SSE Chunk Buffer**: I patched the client's network stream reader. It retains incomplete TCP network fragments and merges them before running `JSON.parse()`, resolving rendering crashes.
5. **DNS Outbound Server Overrides**: I bypassed local resolver timeouts on Windows by setting custom public resolver addresses (`8.8.8.8` / `1.1.1.1`) inside my MongoDB connection code, preventing DB connection errors.

---

## 🚀 How to Run My Project

### 1. Root Setup & Backend
Run in my root folder to install dependencies:
```bash
npm install
```

Create a root `.env` file containing:
```env
MONGO_URL=mongodb+srv://<user>:<pwd>@cluster.mongodb.net/database
JWT_SECRET=my_jwt_token_signature_secret
GROQ_API_KEY=gsk_my_groq_api_token
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173

# Email Verification (Brevo / Gmail SMTP)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-login-email
EMAIL_PASS=your-smtp-password-or-app-key
EMAIL_FROM_NAME=GenBot
```

Start my server:
```bash
npm run dev
```

### 2. Frontend Client
Run in the `frontend` folder:
```bash
npm install
```

Create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3000
```

Start my React client:
```bash
npm run dev
```

---

## 📡 My Main API Routes

* `POST /user/signup` — Registers a new account and sends email verification OTP.
* `POST /user/verify-otp` — Validates email verification OTP code.
* `POST /user/resend-otp` — Regenerates verification OTP with cooldown timer.
* `GET /user/check-username/:username` — My live check endpoint to verify username availability.
* `POST /prompt` — My SSE prompt endpoint that streams responses token-by-token.
* `GET /prompt/history` — Retreives conversation history.
