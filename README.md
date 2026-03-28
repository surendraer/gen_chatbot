# GemBot Project – Full Documentation

## Overview
GemBot is a Node.js backend application that allows users to register, authenticate, and interact with a Google Gemini AI model. Users can submit prompts, receive AI-generated answers, and view their prompt history. The project uses Express.js, MongoDB (via Mongoose), JWT authentication, and Google Gemini AI API.

---

## Features Implemented

### 1. User Registration
- **Endpoint:** `POST /user/signup`
- **Description:** Allows new users to register by providing name, username, email, mobile, password, and age.
- **Validation:**
  - Name: 2-50 characters
  - Username: 3-20 characters, alphanumeric/underscore
  - Email: Valid format, unique
  - Mobile: 10 digits, unique
  - Password: Min 8 chars, includes uppercase, lowercase, number, special character
  - Age: 13-120
- **Security:** Passwords are hashed using bcrypt before saving.
- **Response:** Success message, JWT token, and public user data.

### 2. User Login
- **Endpoint:** `POST /user/login`
- **Description:** Authenticates users using username and password.
- **Validation:** Checks credentials, compares hashed password.
- **Response:** Success message, JWT token, and public user data.

### 3. JWT Authentication Middleware
- **Description:** Protects routes by verifying JWT tokens in the `Authorization` header.
- **How it helps:** Ensures only authenticated users can access protected endpoints (like prompt submission/history).

### 4. User Profile
- **Endpoint:** `GET /user/profile`
- **Description:** Returns the authenticated user's profile data.
- **How it helps:** Allows users to view their own information securely.

### 5. Submit Prompt & Get AI Answer
- **Endpoint:** `POST /prompt/`
- **Description:** Authenticated users can submit a prompt. The backend sends it to Google Gemini AI and returns the answer.
- **How it helps:** Provides AI-powered responses to user queries.
- **Data Saved:** Each prompt and its answer are saved in the database, linked to the user.

### 6. Prompt History
- **Endpoint:** `GET /prompt/history`
- **Description:** Authenticated users can view all their previous prompts and answers.
- **How it helps:** Users can review their past interactions with the AI.

### 7. Secure Environment Variable Management
- **Description:** Uses dotenv to manage sensitive configuration (DB URL, JWT secret, Gemini API key).
- **How it helps:** Keeps secrets out of code and version control.

### 8. Error Handling
- **Description:** All routes return clear JSON error messages and status codes for invalid input, authentication errors, and server issues.
- **How it helps:** Improves user experience and debugging.

---

## API Endpoints

### User
#### Register
- **POST** `/user/signup`
- **Body:**
  ```json
  {
    "name": "string",
    "userName": "string",
    "email": "string",
    "mobile": "string",
    "password": "string",
    "age": number
  }
  ```
- **Response:**
  - `success`: true/false
  - `message`: string
  - `data`: { response: user, token: JWT }

#### Login
- **POST** `/user/login`
- **Body:**
  ```json
  {
    "userName": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `success`: true/false
  - `message`: string
  - `data`: { response: user, token: JWT }

#### Profile
- **GET** `/user/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - `success`: true/false
  - `message`: string
  - `data`: { response: user }

### Prompt
#### Submit Prompt
- **POST** `/prompt/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "prompt": "string"
  }
  ```
- **Response:**
  - `success`: true/false
  - `message`: string
  - `data`: { answer: string }

#### Prompt History
- **GET** `/prompt/history`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - `success`: true/false
  - `data`: [ { textPrompt, textAnswer, userId, _id, ... } ]

---

## Models

### User
- name: String
- userName: String (unique)
- age: Number
- email: String (unique)
- mobile: String (unique)
- password: String (hashed)

### Prompt
- textPrompt: String
- textAnswer: String
- userId: ObjectId (ref: User)

---

## Environment Variables
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT
- `GEMINI_API_KEY`: Google Gemini API key

---

## How Each Feature Helps
- **Authentication & Security:** Ensures only authorized users can access/submit prompts.
- **Prompt History:** Users can track and review their AI interactions.
- **Validation & Error Handling:** Prevents bad data and helps users understand issues.
- **Password Hashing:** Protects user credentials.
- **Environment Management:** Keeps sensitive data secure.

---

## Future Work
1. Password reset/forgot password functionality
2. User profile update and delete endpoints
3. Admin features for user and prompt management
4. Use Joi or express-validator for input validation
5. Add rate limiting and security middleware (helmet, cors)
6. Build a frontend or provide a Postman collection
7. Add unit and integration tests
8. Prompt pagination/filtering
9. Email verification on registration

---

## Getting Started
1. Clone the repo and run `npm install`.
2. Set up a `.env` file with the required variables.
3. Start MongoDB and run `node server.js`.
4. Use Postman or similar tool to interact with the API.

---

For any questions or contributions, please contact the project maintainer.
