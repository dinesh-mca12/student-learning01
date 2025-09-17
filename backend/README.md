# Student Learning Platform - Backend API

A comprehensive Node.js/Express/MongoDB backend API for the Student Learning Platform, providing authentication, course management, assignments, team collaboration, and AI chatbot functionality.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Course Management** - Create, update, and manage courses with materials and syllabus
- **Assignment System** - Full assignment lifecycle with submissions and grading
- **Team Collaboration** - Team creation, project management, and task tracking
- **AI Chatbot** - Intelligent learning assistant with conversation management
- **File Upload** - Secure file handling for assignments and materials
- **Real-time Analytics** - Comprehensive stats and insights for teachers

## 🛠️ Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs, CORS, rate limiting
- **File Upload:** Multer
- **Email:** Nodemailer (optional)

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/student-learning

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5000000
FILE_UPLOAD_PATH=./uploads

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 4. Run the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── controllers/           # Request handlers and business logic
│   ├── userController.js     # User authentication & profile management
│   ├── courseController.js   # Course CRUD operations
│   ├── assignmentController.js # Assignment management
│   ├── teamController.js     # Team collaboration features
│   └── chatbotController.js  # AI chatbot functionality
├── models/               # MongoDB schemas and models
│   ├── User.js              # User model with authentication
│   ├── Course.js            # Course model with enrollment
│   ├── Assignment.js        # Assignment model with submissions
│   ├── Team.js              # Team model with projects
│   └── Chatbot.js           # Chatbot conversation model
├── routes/               # API route definitions
│   ├── userRoutes.js        # User authentication routes
│   ├── courseRoutes.js      # Course management routes
│   ├── assignmentRoutes.js  # Assignment routes
│   ├── teamRoutes.js        # Team collaboration routes
│   └── chatbotRoutes.js     # Chatbot interaction routes
├── middleware/           # Custom middleware functions
│   └── authMiddleware.js    # Authentication & authorization
├── uploads/              # File upload directory
├── .env.example          # Environment variables template
├── server.js             # Main application entry point
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/logout` - User logout
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course (Teacher)
- `PUT /api/courses/:id` - Update course (Teacher)
- `DELETE /api/courses/:id` - Delete course (Teacher)
- `POST /api/courses/:id/enroll` - Enroll in course (Student)

### Assignments
- `GET /api/assignments` - List assignments
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments` - Create assignment (Teacher)
- `PUT /api/assignments/:id` - Update assignment (Teacher)
- `DELETE /api/assignments/:id` - Delete assignment (Teacher)
- `POST /api/assignments/:id/submit` - Submit assignment (Student)

### Teams
- `GET /api/teams` - List teams
- `GET /api/teams/:id` - Get team details
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/join` - Join team
- `POST /api/teams/:id/leave` - Leave team

### Chatbot
- `GET /api/chatbot/conversation` - Get or create conversation
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/history` - Get conversation history
- `POST /api/chatbot/feedback` - Submit feedback

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### User Roles
- **Student** - Can enroll in courses, submit assignments, join teams, use chatbot
- **Teacher** - Can create courses, manage assignments, view analytics, moderate teams

## 🔒 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Configured for frontend domain
- **Input Validation** - Mongoose schema validation
- **Error Handling** - Comprehensive error responses

## 📊 Database Schema

### User Model
- Email, password, full name, role
- Profile information and preferences
- Email verification and password reset tokens

### Course Model
- Title, description, course code
- Teacher assignment and enrollment management
- Materials, syllabus, and grading configuration

### Assignment Model
- Course association and due dates
- Submission settings and grading rubrics
- File upload support and plagiarism detection

### Team Model
- Course-based team creation
- Project and task management
- Member roles and permissions

### Chatbot Model
- Conversation history and context
- Message analytics and feedback
- User preferences and settings

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running and accessible at the configured URI.

**2. JWT Secret Error**
```bash
Error: JWT_SECRET is required
```
**Solution:** Set a strong JWT_SECRET in your .env file (at least 32 characters).

**3. Port Already in Use**
```bash
Error: listen EADDRINUSE :::5000
```
**Solution:** Change the PORT in .env or kill the process using the port.

**4. File Upload Permission Error**
```bash
Error: EACCES: permission denied, mkdir 'uploads'
```
**Solution:** Ensure write permissions for the uploads directory.

### Development Tips

1. **Use nodemon for development:**
   ```bash
   npm install -g nodemon
   nodemon server.js
   ```

2. **Enable debug logging:**
   ```bash
   DEBUG=app:* npm run dev
   ```

3. **Test API endpoints:**
   Use tools like Postman, Insomnia, or curl to test endpoints.

4. **Database GUI:**
   Use MongoDB Compass for visual database management.

## 🚀 Deployment

### Local Production Build
```bash
NODE_ENV=production npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Cloud Deployment

**MongoDB Atlas Setup:**
1. Create cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Update MONGODB_URI in production environment
3. Whitelist your server's IP address

**Environment Variables for Production:**
- Set NODE_ENV=production
- Use strong, unique JWT_SECRET
- Configure proper CORS origins
- Set up email service credentials

## 📝 API Documentation

For detailed API documentation with request/response examples, visit:
- Development: `http://localhost:5000/api/health`
- Swagger/OpenAPI documentation (if implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check this README and troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed error information
4. Include your environment details (Node.js version, OS, etc.)

---

**Happy Coding! 🎓✨**