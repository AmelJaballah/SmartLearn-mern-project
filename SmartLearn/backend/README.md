# SmartLearn Backend API

Complete MERN stack backend with JWT authentication, CRUD operations, and AI service placeholders.

## Features

- ✅ **JWT Authentication** - Secure token-based auth with role-based access control
- ✅ **7 Entity Models** - User, Course, Exercise, Submission, ChatSession, Message, SentimentLog
- ✅ **Full CRUD Operations** - Complete REST API for all entities
- ✅ **Role-Based Authorization** - Student, Professor, Admin roles
- ✅ **AI Service Placeholders** - Ready for AI chatbot, RAG, and analytics integration

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env` file:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/smartlearn
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 3. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

### 4. Run Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Private |
| PUT | `/api/users/:id` | Update user | Private |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Courses

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/courses` | Get all courses | Public |
| GET | `/api/courses/:id` | Get course by ID | Public |
| POST | `/api/courses` | Create course | Professor |
| PUT | `/api/courses/:id` | Update course | Professor |
| DELETE | `/api/courses/:id` | Delete course | Professor |
| POST | `/api/courses/:id/enroll` | Enroll in course | Student |

### Exercises

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/exercises` | Get all exercises | Private |
| GET | `/api/exercises/:id` | Get exercise by ID | Private |
| POST | `/api/exercises` | Create exercise | Professor |
| PUT | `/api/exercises/:id` | Update exercise | Professor |
| DELETE | `/api/exercises/:id` | Delete exercise | Professor |

### Submissions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/submissions` | Get submissions | Private |
| GET | `/api/submissions/:id` | Get submission by ID | Private |
| POST | `/api/submissions` | Submit exercise | Student |
| PUT | `/api/submissions/:id` | Grade submission | Professor |
| DELETE | `/api/submissions/:id` | Delete submission | Admin |

### Chat Sessions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/chat-sessions` | Get user's sessions | Private |
| GET | `/api/chat-sessions/:id` | Get session by ID | Private |
| POST | `/api/chat-sessions` | Create session | Private |
| PUT | `/api/chat-sessions/:id` | Update session | Private |
| DELETE | `/api/chat-sessions/:id` | Delete session | Private |

### Messages

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/messages?chatSessionId=xxx` | Get messages | Private |
| GET | `/api/messages/:id` | Get message by ID | Private |
| POST | `/api/messages` | Create message | Private |
| DELETE | `/api/messages/:id` | Delete message | Private |

### Sentiment Logs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/sentiment-logs` | Get sentiment logs | Private |
| GET | `/api/sentiment-logs/:id` | Get log by ID | Private |
| POST | `/api/sentiment-logs` | Create log | Private |
| DELETE | `/api/sentiment-logs/:id` | Delete log | Admin |
| GET | `/api/sentiment-logs/analytics/:userId` | Get analytics | Professor |

## Testing with cURL

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Course (Professor)

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Mathematics",
    "description": "Learn the fundamentals of mathematics"
  }'
```

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── models/
│   ├── User.js              # User schema
│   ├── Course.js            # Course schema
│   ├── Exercise.js          # Exercise schema
│   ├── Submission.js        # Submission schema
│   ├── ChatSession.js       # Chat session schema
│   ├── Message.js           # Message schema
│   └── SentimentLog.js      # Sentiment log schema
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── userController.js    # User CRUD
│   ├── courseController.js  # Course CRUD
│   ├── exerciseController.js
│   ├── submissionController.js
│   ├── chatSessionController.js
│   ├── messageController.js
│   └── sentimentLogController.js
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── userRoutes.js        # User endpoints
│   ├── courseRoutes.js      # Course endpoints
│   └── ...                  # Other route files
├── middleware/
│   ├── auth.js              # JWT verification
│   └── errorHandler.js      # Error handling
├── services/
│   ├── authService.js       # Auth utilities
│   ├── aiService.js         # AI chatbot (placeholder)
│   ├── ragService.js        # RAG system (placeholder)
│   └── analyticsService.js  # Analytics (placeholder)
├── .env                     # Environment variables
├── .env.example             # Environment template
├── server.js                # Entry point
└── package.json
```

## User Roles

- **Student**: Can enroll in courses, submit exercises, use chatbot
- **Professor**: Can create courses and exercises, grade submissions
- **Admin**: Full access to all resources

## Next Steps

### AI Integration

1. **AI Chatbot** - Integrate OpenAI/Google AI in `services/aiService.js`
2. **RAG System** - Connect vector database in `services/ragService.js`
3. **Sentiment Analysis** - Add real sentiment analysis API

### Frontend

Create React frontend with:
- React Router for navigation
- JWT token storage in localStorage
- Protected routes
- API integration with axios/fetch

## License

MIT
