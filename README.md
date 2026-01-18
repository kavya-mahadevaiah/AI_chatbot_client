# AI Chatbot — Client (Next.js)

A modern AI chatbot UI built with **Next.js/React** that supports **multiple chat sessions**, smooth UX states, and secure auth flows.

## Demo
- Live: <ADD_YOUR_VERCEL_URL>
- Backend API: <ADD_YOUR_RENDER_URL>
- Server repo: <LINK_TO_AI_CHATBOT_SERVER>

## Features
- Multi-chat sessions (create/switch/delete)
- Auth-ready UI (JWT-based flow)
- Clean chat UX: loading, error, empty states
- Responsive layout + polished styling (Tailwind)
- Message history rendering and session navigation

## Tech Stack
- Next.js, React
- Tailwind CSS
- Axios


## Environment Variables
- Create .env.local:
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

## Notes

- This repo is the frontend UI.
- The backend handles OpenRouter calls + message persistence:
  - <LINK_TO_AI_CHATBOT_SERVER>

## Roadmap

- Streaming responses (token-by-token)
- Chat search + message export
- Better error analytics + retries

## Getting Started (Local)
```bash
# 1) Install
npm install

# 2) Setup env
cp .env.example .env.local

# 3) Run
npm run dev

