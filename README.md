# Student Learning Platform

A comprehensive learning management system built with modern web technologies, designed for hackathon submission. This platform supports both students and teachers with course management, assignment submission, and interactive learning features.

## 🚀 Project Structure

```
student-learning01/
├── backend/                 # Express.js API server with MongoDB
│   ├── controllers/         # API route controllers
│   ├── models/             # MongoDB data models
│   ├── routes/             # Express routes
│   ├── middleware/         # Custom middleware
│   ├── config/             # Database configuration
│   ├── server.js           # Main server entry point
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend setup instructions
├── frontend/               # React frontend application
│   ├── src/                # React source code
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # API client and utilities
│   │   └── context/        # React context providers
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend setup instructions
└── README.md               # This file
```

## 🎯 Features

### For Students
- **Course Enrollment**: Browse and enroll in available courses
- **Assignment Submission**: Submit assignments with rich text content
- **Progress Tracking**: View grades and assignment status
- **Interactive Dashboard**: Overview of courses and upcoming deadlines
- **AI Chatbot**: Get help with learning questions

### For Teachers
- **Course Management**: Create and manage courses
- **Assignment Creation**: Create assignments with due dates and grading
- **Student Management**: View enrolled students and submissions
- **Grade Management**: Grade assignments and provide feedback
- **Analytics Dashboard**: Track course and student performance

### Technical Features
- **Authentication**: Secure JWT-based authentication with role separation
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Dynamic UI updates for better user experience
- **Type Safety**: Full TypeScript implementation for both frontend and backend
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion

## 🛠️ Quick Start

### Prerequisites
- **Node.js** 16.0.0 or higher
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-learning01
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection and JWT secret
npm start
```

The backend will run on http://localhost:5000

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed (default points to localhost:5000)
npm run dev
```

The frontend will run on http://localhost:3000

### 4. Start Using the Platform
1. Open http://localhost:3000
2. Sign up as a teacher or student
3. Teachers can create courses and assignments
4. Students can enroll in courses and submit assignments

## 📚 Detailed Setup Instructions

For detailed setup instructions, troubleshooting, and API documentation, see:
- [Backend README](./backend/README.md) - Complete backend setup and API documentation
- [Frontend README](./frontend/README.md) - Frontend setup and development guide

## 🔧 Development

### Running in Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Building for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **RESTful API**: Clean API design with consistent responses
- **Authentication**: JWT tokens with role-based access control
- **Database**: MongoDB with Mongoose ODM for data modeling
- **Validation**: Input validation and sanitization
- **Security**: CORS, rate limiting, and security headers

### Frontend (React + TypeScript + Vite)
- **Modern React**: Hooks, context, and functional components
- **TypeScript**: Full type safety and better developer experience
- **Styling**: Tailwind CSS for utility-first styling
- **Animations**: Framer Motion for smooth interactions
- **State Management**: React Context for global state

### API Integration
- **Type-safe API**: TypeScript interfaces for all API responses
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Smooth loading indicators throughout the app
- **Authentication**: Automatic token management and renewal

## 🚦 Testing

### Backend Testing
```bash
cd backend
# API endpoints can be tested with:
curl http://localhost:5000/health
```

### Frontend Testing
```bash
cd frontend
npm run build  # Verify build works
npm run preview  # Test production build
```

## 🚀 Deployment

### Backend Deployment
- **Heroku**: Easy deployment with MongoDB Atlas
- **DigitalOcean**: VPS deployment
- **AWS**: EC2 or Lambda deployment

### Frontend Deployment  
- **Vercel**: Automatic deployment from Git
- **Netlify**: JAMstack deployment
- **AWS S3 + CloudFront**: Scalable static hosting

### Environment Variables
Make sure to set production environment variables:
- Backend: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`
- Frontend: `VITE_API_BASE_URL` pointing to your backend URL

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check MongoDB connection
   - Verify .env file exists and has correct values
   - Ensure port 5000 is available

2. **Frontend build fails**
   - Check that backend API types are correct
   - Verify all imports are valid
   - Run `npm install` to ensure dependencies are installed

3. **API connection issues**
   - Verify backend is running on port 5000
   - Check CORS settings in backend
   - Ensure frontend .env points to correct backend URL

4. **Authentication issues**
   - Clear browser localStorage
   - Check JWT_SECRET is set in backend
   - Verify token format in API requests

### Getting Help

- Check the individual README files in `/backend` and `/frontend` directories
- Review the API documentation in the backend README
- Look at browser console for JavaScript errors
- Check backend logs for API errors

## 🎓 Educational Use

This project is designed to be beginner-friendly and can be used as:
- **Learning Resource**: Study modern web development practices
- **Template**: Base for building similar applications  
- **Teaching Tool**: Demonstrate full-stack development concepts
- **Portfolio Project**: Showcase development skills

## 🏆 Hackathon Features

Built specifically for hackathon submission with:
- **Complete Full-Stack Solution**: Both frontend and backend
- **Modern Technology Stack**: Latest web development practices
- **Comprehensive Documentation**: Easy for judges to understand and run
- **Working Demo**: Fully functional application
- **Scalable Architecture**: Ready for future enhancements

---

**Happy Learning! 🎓**

Made with ❤️ for the hackathon community