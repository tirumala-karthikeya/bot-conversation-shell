
# Chatbot Dashboard Backend

This is the backend service for the Chatbot Dashboard application. It provides API endpoints for managing chatbots and handling chat functionality.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update database connection details and other settings

3. Set up PostgreSQL database:
   ```sql
   CREATE DATABASE chatbot_dashboard;
   ```

4. Run development server:
   ```
   npm run dev
   ```

## API Endpoints

### Chatbots

- `GET /api/chatbots` - Get all chatbots
- `GET /api/chatbots/:id` - Get chatbot by ID
- `POST /api/chatbots` - Create a new chatbot
- `PUT /api/chatbots/:id` - Update a chatbot
- `DELETE /api/chatbots/:id` - Delete a chatbot

### Chat

- `POST /api/chatbots/:id/chat` - Send a chat message to a chatbot

## Development

### Build for production:
```
npm run build
```

### Run in production:
```
npm start
```
