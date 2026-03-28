# Gemini Project API Documentation

## Overview
This project is a Node.js backend for a prompt/answer application using Express, MongoDB, and Google Gemini AI. It supports user authentication, prompt submission, and prompt history.

## Base URL
```
http://localhost:3000/
```

## Authentication
- JWT-based authentication is required for most endpoints.
- Obtain a token via `/user/login` and include it in the `Authorization` header as `Bearer <token>`.

## Endpoints

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
- **Response:** Success or error message, token on success.

#### Login
- **POST** `/user/login`
- **Body:**
  ```json
  {
    "userName": "string",
    "password": "string"
  }
  ```
- **Response:** Success or error message, token on success.

#### Profile
- **GET** `/user/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** User profile data.

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
- **Response:** AI-generated answer.

#### Prompt History
- **GET** `/prompt/history`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** List of previous prompts and answers for the user.

## Error Handling
- All endpoints return JSON with `success`, `message`, and (if applicable) `data` fields.

## Environment Variables
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT
- `GEMINI_API_KEY`: Google Gemini API key

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
