
---

# 📄 `chatbot-backend/README.md`

```markdown
# AI Chatbot - Backend

This is the backend for the AI Chatbot.  
It handles authentication, chat management, and AI replies via OpenRouter.

## Features
- User registration and login with JWT
- Protected routes with middleware
- Create, fetch, and delete chat sessions
- AI replies integrated with OpenRouter
- MongoDB persistence for users and chats
- Secure password hashing with bcrypt

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT (authentication)
- Bcrypt (password hashing)
- Axios (API calls)

## Setup
1. Install dependencies:
   ```bash
   npm install
2. Add a .env.local file:
NEXT_PUBLIC_API_URL=http://localhost:5000
3. Run locally:
npm run dev
4. Build:
npm run build
npm start


