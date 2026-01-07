# SmartLearn - MERN Application

The main web application for the SmartLearn platform, built with MongoDB, Express, React, and Node.js.

## 📁 Structure

```
SmartLearn/
├── backend/          # Express.js API server
│   ├── controllers/  # Request handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── middleware/   # Auth & error handling
│   ├── config/       # Database configuration
│   └── utils/        # Helper functions
└── Frontend/         # React application
    ├── src/
    │   ├── api/      # Axios configuration
    │   ├── components/ # Reusable components
    │   ├── context/  # React Context (Auth)
    │   ├── pages/    # Page components
    │   └── assets/   # Static files
    └── public/       # Public assets
```

## 🚀 Getting Started

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/smartlearn
JWT_SECRET=your_secret_key_here
PORT=3000
AI_CHATBOT_URL=http://localhost:5001
AI_EXERCISE_URL=http://localhost:5002
```

3. **Start server:**
```bash
npm start
# Server runs on http://localhost:3000
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd Frontend
npm install
```

2. **Configure environment:**
Create `Frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

3. **Start development server:**
```bash
npm run dev
# App runs on http://localhost:5173
```

## 🔑 Key Features

### Authentication
- JWT-based authentication
- Protected routes
- Role-based access (unified user role)
- Profile management with photo upload

### Courses
- Browse all courses
- Course details with exercises
- Enrollment system
- Course reviews and ratings

### Exercise System
- AI-generated exercises
- Submission tracking
- Automatic grading with SymPy
- Feedback system

### AI Integration
- RAG-based chatbot tutor
- Exercise generation API
- Answer validation
- Personalized recommendations

## 📡 API Overview

### Base URL
```
http://localhost:3000
```

### Authentication Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |

### Course Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | Get all courses |
| POST | `/courses` | Create course |
| GET | `/courses/:id` | Get course by ID |
| PUT | `/courses/:id` | Update course |
| DELETE | `/courses/:id` | Delete course |
| POST | `/courses/:id/review` | Add review |

### Exercise Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exercises` | Get all exercises |
| POST | `/exercises` | Create exercise |
| GET | `/exercises/:id` | Get exercise |
| POST | `/exercises/:id/submit` | Submit answer |

### AI Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Chat with AI tutor |
| POST | `/ai/generate-exercises` | Generate exercises |
| POST | `/ai/validate-answer` | Validate math answer |

See individual service READMEs for detailed documentation.

## 🗄️ Database Models

### User
- Username, email, password (hashed)
- Courses (enrolled/created)
- Profile reference

### UserProfile
- Personal info (name, bio, phone, DOB)
- Address information
- Learning preferences
- Profile photo

### Course
- Title, description, level
- Professor reference
- Exercises array
- Reviews and ratings
- Students count

### Exercise
- Question, answer, difficulty
- Course reference
- Type (multiple choice, open-ended)
- Points

### Submission
- Student reference
- Exercise reference
- Answer, feedback
- Score, graded status

### Enrollment
- User and course references
- Progress tracking
- Completion status

### ChatSession
- User reference
- Messages array
- Context preservation

## 🛠️ Development

### Backend Scripts
```bash
npm start          # Start server
npm run dev        # Start with nodemon
npm test           # Run tests
```

### Frontend Scripts
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🎨 Frontend Components

### Core Components
- `Navbar` - Navigation with auth state
- `ProtectedRoute` - Route guard for authenticated users
- `CourseCard` - Course display card

### Pages
- `Home` - Landing page
- `Login/Register` - Authentication
- `Courses` - Course listing
- `CourseDetails` - Course information
- `Profile` - User profile management
- `ExerciseGenerator` - AI exercise generation
- `Chatbot` - AI tutor interface
- `MyEnrollments` - User's courses
- `ProfessorCourses` - Course management
- `StudentSubmissions` - Review submissions

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend generates JWT token
3. Token stored in localStorage
4. Axios interceptor adds token to requests
5. Backend middleware validates token
6. Protected routes accessible

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd Frontend
npm test
```

## 📦 Dependencies

### Backend Main Dependencies
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT auth
- bcryptjs - Password hashing
- cors - CORS middleware
- axios - HTTP client

### Frontend Main Dependencies
- react - UI library
- react-router-dom - Routing
- axios - HTTP client
- vite - Build tool

## 🐛 Common Issues

### Backend won't start
- Check MongoDB is running
- Verify `.env` configuration
- Check port 3000 is available

### Frontend can't connect
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Clear browser localStorage

### Authentication errors
- Check JWT_SECRET is set
- Clear browser localStorage
- Verify token format

## 📚 Additional Resources

- [Backend README](backend/README.md)
- [Frontend README](Frontend/README.md)
- [Main Project README](../README.md)

## 🤝 Contributing

1. Follow existing code style
2. Write tests for new features
3. Update documentation
4. Submit PR with description

## 📄 License

MIT License
