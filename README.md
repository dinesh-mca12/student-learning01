# 🎓 Student Learning Platform

A comprehensive, modern learning management system built for hackathon success! This full-stack application provides everything needed for online education with separate interfaces for students and teachers.

## 🚀 Live Demo

- **Frontend**: [Coming Soon - Deploy to Vercel]
- **Backend API**: [Coming Soon - Deploy to Render]
- **API Documentation**: [Coming Soon - Swagger/Postman]

## ✨ Key Features

### 👨‍🎓 For Students
- 📚 Browse and enroll in courses
- 📝 Submit assignments and track progress
- 👥 Join study groups and collaborate
- 🤖 Get help from AI learning assistant
- 📅 View academic calendar and live class links
- 💬 Participate in team discussions

### 👩‍🏫 For Teachers
- ➕ Create and manage courses
- 📋 Design assignments and grade submissions
- 👨‍🎓 Track student progress and analytics
- 🎥 Schedule live classes
- 💬 Moderate team discussions
- 📊 Generate academic reports

### 🔧 Technical Features
- 🔐 Secure JWT authentication
- 🎨 Modern, responsive UI/UX
- 📱 Mobile-friendly design
- 🚀 Fast performance with caching
- 🛡️ Security best practices
- 📈 Scalable architecture

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Express-validator

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## 📁 Project Structure

```
student-learning01/
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Route handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, validation, errors
│   └── utils/            # Helper functions
├── frontend/               # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/         # API client and utilities
│   └── public/          # Static assets
└── README.md              # This file
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/dinesh-mca12/student-learning01.git
cd student-learning01
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start backend server
npm start
# Server runs on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies  
npm install

# Configure environment
cp .env.example .env
# Edit .env to point to your backend API

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Create Test Users

**Teacher Account:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Teacher",
    "email": "teacher@example.com",
    "password": "password123",
    "role": "teacher"
  }'
```

**Student Account:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Student", 
    "email": "student@example.com",
    "password": "password123",
    "role": "student"
  }'
```

## 📚 API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/auth/profile` | GET | Get user profile |

### Courses  
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | GET | List all courses |
| `/api/courses` | POST | Create course (teacher) |
| `/api/courses/:id` | GET | Get course details |
| `/api/courses/:id/enroll` | POST | Enroll in course (student) |

### Assignments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/assignments` | GET | List assignments |
| `/api/assignments` | POST | Create assignment (teacher) |
| `/api/assignments/:id/submit` | POST | Submit assignment (student) |

### Chatbot
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chatbot/ask` | POST | Ask AI assistant |
| `/api/chatbot/conversations` | GET | Get chat history |

## 🚀 Deployment Guide

### Deploy Backend to Render

1. **Create Render Account**: [render.com](https://render.com)

2. **Create Web Service**:
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your-atlas-connection-string
     JWT_SECRET=your-production-secret
     FRONTEND_URL=https://your-frontend.vercel.app
     ```

### Deploy Frontend to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.render.com/api
   ```

### Alternative: Deploy to Railway/Netlify

See individual README files in `/backend` and `/frontend` for detailed deployment instructions.

## 🎯 Usage Examples

### Teacher Workflow
1. **Register** as teacher → **Login**
2. **Create Course** → Set title, description, difficulty
3. **Create Assignment** → Set due date, instructions
4. **View Submissions** → Grade and provide feedback
5. **Monitor Progress** → Check student analytics

### Student Workflow  
1. **Register** as student → **Login**
2. **Browse Courses** → Enroll in interesting courses
3. **View Assignments** → Submit work before deadlines
4. **Ask Chatbot** → Get help with studies
5. **Join Teams** → Collaborate with peers

## 🤖 AI Chatbot Features

The integrated learning assistant helps with:
- **Course Questions**: Information about materials and content
- **Assignment Help**: Guidance on submission requirements
- **Study Strategies**: Personalized learning tips
- **Technical Support**: Platform troubleshooting
- **General Academic**: Broad educational guidance

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for secure storage
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Cross-origin security
- **Input Validation**: Sanitize all user inputs
- **Error Handling**: Secure error responses
- **Environment Variables**: Sensitive data protection

## 📱 Mobile & Responsive

The platform works seamlessly across all devices:
- 📱 **Mobile**: Optimized touch interface
- 💻 **Tablet**: Adaptive layout
- 🖥️ **Desktop**: Full feature experience

## 🧪 Testing & Quality

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing  
```bash
cd frontend
npm run test
```

### API Testing
Use the provided Postman collection or test with curl:
```bash
# Health check
curl http://localhost:5000/api/health

# List courses
curl http://localhost:5000/api/courses
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **CORS Errors**
   - Verify FRONTEND_URL in backend .env
   - Check VITE_API_URL in frontend .env

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token storage in browser

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

## 📊 Performance Optimizations

- **Database Indexing**: Optimized MongoDB queries
- **Code Splitting**: Lazy-loaded React components  
- **Caching**: Browser and API caching strategies
- **Bundle Optimization**: Minimized JavaScript bundles
- **Image Optimization**: Responsive image loading

## 🤝 Contributing

We welcome contributions! Please see individual README files for detailed guidelines.

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests if applicable
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Ready

This project is specifically designed for hackathon success:

✅ **Complete Feature Set**: All major LMS features implemented  
✅ **Modern Tech Stack**: Latest technologies and best practices  
✅ **Comprehensive Documentation**: Easy setup and deployment  
✅ **Responsive Design**: Works on all devices  
✅ **Security First**: Production-ready security measures  
✅ **Deployment Ready**: One-click deployment guides  
✅ **Demo Data**: Sample courses and content for presentations  

## 📞 Support & Contact

- **GitHub Issues**: For bugs and feature requests
- **Email**: [Your contact email]
- **Documentation**: Check README files in `/backend` and `/frontend`

---

**Made with ❤️ for the future of education! 🎓**

*Ready to revolutionize online learning? Clone, deploy, and demo! 🚀*