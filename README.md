# Student Learning Platform

A comprehensive full-stack learning management system built with Node.js/Express/MongoDB backend and React frontend. This platform provides course management, assignment submission, team collaboration, and AI-powered learning assistance.

## 🚀 Features

### For Students
- **Course Enrollment** - Browse and enroll in available courses
- **Assignment Management** - View assignments and submit work
- **AI Learning Assistant** - Get help with studies through intelligent chatbot
- **Team Collaboration** - Join teams and work on group projects
- **Progress Tracking** - Monitor learning progress and achievements

### For Teachers
- **Course Creation** - Create and manage comprehensive courses
- **Assignment Distribution** - Create assignments with flexible grading options
- **Student Analytics** - Track student progress and engagement
- **Team Management** - Oversee team formation and projects
- **AI Analytics** - Access chatbot interaction insights

### Platform Features
- **JWT Authentication** - Secure user authentication and authorization
- **Role-based Access** - Different interfaces for students and teachers
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Notifications** - Instant feedback and updates
- **Dark Theme UI** - Modern, professional interface design

## 🏗️ Architecture

This is a monorepo containing both frontend and backend applications:

```
student-learning01/
├── backend/                 # Node.js/Express/MongoDB API
│   ├── controllers/         # Request handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication & validation
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/           # API services
│   └── package.json
└── README.md              # This file
```

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs, CORS, rate limiting
- **File Upload:** Multer support

### Frontend
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Routing:** React Router DOM
- **Notifications:** React Hot Toast
- **Build Tool:** Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB 6 or higher
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/dinesh-mca12/student-learning01.git
cd student-learning01
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## 📚 Documentation

### Backend Documentation
See [backend/README.md](backend/README.md) for:
- API endpoint documentation
- Database schema details
- Authentication flow
- Deployment instructions
- Troubleshooting guide

### Frontend Documentation
See [frontend/README.md](frontend/README.md) for:
- Component architecture
- State management
- UI/UX guidelines
- Build and deployment
- Development best practices

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/student-learning
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:3000
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user
- `GET /api/users/logout` - Logout user

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course (Teacher)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course (Student)

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment (Teacher)
- `POST /api/assignments/:id/submit` - Submit assignment (Student)

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `POST /api/teams/:id/join` - Join team

### Chatbot
- `GET /api/chatbot/conversation` - Get conversation
- `POST /api/chatbot/message` - Send message to AI

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Docker Deployment
```bash
# Build backend
docker build -t student-learning-backend ./backend

# Build frontend
docker build -t student-learning-frontend ./frontend

# Run with docker-compose
docker-compose up -d
```

### Cloud Deployment Options
- **Backend:** Heroku, Railway, DigitalOcean App Platform
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Database:** MongoDB Atlas, AWS DocumentDB

## 👥 User Roles

### Student Account
- Register with email and password
- Role automatically set to "student"
- Access to course enrollment and assignment submission
- AI chatbot assistance for learning

### Teacher Account
- Register with email and password
- Select "teacher" role during registration
- Full course and assignment management capabilities
- Analytics and student progress tracking

### Demo Credentials
Create any account during development or use these sample credentials:
- **Student:** student@example.com / password123
- **Teacher:** teacher@example.com / password123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
1. Check the documentation in `/backend/README.md` and `/frontend/README.md`
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join our community discussions

### Common Issues
- **MongoDB Connection:** Ensure MongoDB is running and accessible
- **CORS Errors:** Check backend CORS configuration
- **Authentication Issues:** Verify JWT secret configuration
- **Build Failures:** Ensure all dependencies are installed

## 🎖️ Acknowledgments

- React community for excellent documentation and tools
- Express.js team for the robust backend framework
- MongoDB for the flexible database solution
- All contributors who helped build this platform

## 🚧 Roadmap

### Version 1.1
- [ ] Real-time notifications with WebSockets
- [ ] Advanced file upload and management
- [ ] Video call integration for live classes
- [ ] Mobile responsive improvements

### Version 1.2
- [ ] Advanced analytics dashboard
- [ ] Plagiarism detection for assignments
- [ ] Grade book with advanced features
- [ ] Calendar integration

### Version 2.0
- [ ] Mobile application (React Native)
- [ ] Advanced AI features with machine learning
- [ ] Multi-language support
- [ ] Advanced collaboration tools

---

**Built with ❤️ for the learning community**