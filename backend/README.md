# Student Learning Platform - Backend API

A comprehensive RESTful API for the Student Learning Platform built with Express.js and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access (Student/Teacher)
- **Course Management**: Create, update, and manage courses
- **Assignment System**: Assignment creation, submission, and grading
- **User Profiles**: Complete user profile management
- **Security**: Rate limiting, CORS, input validation, and error handling
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas cloud database)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd student-learning01/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory by copying from `.env.example`:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration (Choose one)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/student-learning

# MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-learning

# JWT Configuration
JWT_SECRET=your-very-long-and-secure-jwt-secret-key-here
JWT_EXPIRE=7d

# API Configuration
API_PREFIX=/api/v1

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb/brew/mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 5. Start the server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on http://localhost:5000 (or your configured PORT)

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user profile | Private |
| PUT | `/auth/profile` | Update user profile | Private |

### Course Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/courses` | Get all courses | Public |
| POST | `/courses` | Create new course | Teacher |
| GET | `/courses/:id` | Get course details | Public |
| PUT | `/courses/:id` | Update course | Teacher (owner) |
| DELETE | `/courses/:id` | Delete course | Teacher (owner) |
| POST | `/courses/:id/enroll` | Enroll in course | Student |
| DELETE | `/courses/:id/enroll` | Unenroll from course | Student |

### Assignment Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/assignments` | Get assignments | Private |
| POST | `/assignments` | Create assignment | Teacher |
| GET | `/assignments/:id` | Get assignment details | Private |
| PUT | `/assignments/:id` | Update assignment | Teacher (owner) |
| DELETE | `/assignments/:id` | Delete assignment | Teacher (owner) |

### Submission Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/submissions` | Get submissions | Private |
| POST | `/submissions` | Create/Update submission | Student |
| GET | `/submissions/:id` | Get submission details | Private |
| PUT | `/submissions/:id/grade` | Grade submission | Teacher |

## 🔑 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer your-jwt-token-here'
}
```

## 📝 Request/Response Examples

### Register User
```javascript
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "student"
}
```

### Create Course (Teacher)
```javascript
POST /api/v1/courses
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "title": "Introduction to Programming",
  "description": "Learn the basics of programming with practical examples",
  "courseCode": "CS101",
  "maxStudents": 30
}
```

### Submit Assignment (Student)
```javascript
POST /api/v1/submissions
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "assignmentId": "assignment_id_here",
  "content": "This is my assignment submission...",
  "attachments": []
}
```

## 🚨 Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 🧪 Testing the API

### Using cURL
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User","role":"student"}'
```

### Using Postman
1. Import the API endpoints into Postman
2. Set up environment variables for base URL and token
3. Test each endpoint with proper authentication

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS**: Configured for frontend domain
- **Input Validation**: All inputs are validated and sanitized
- **Password Hashing**: Passwords are hashed using bcryptjs
- **JWT Tokens**: Secure authentication tokens
- **Error Handling**: Prevents information leakage

## 📦 Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── courseController.js  # Course management
│   ├── assignmentController.js
│   └── submissionController.js
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Error handling
│   └── validation.js       # Input validation rules
├── models/
│   ├── User.js            # User model
│   ├── Course.js          # Course model
│   ├── Assignment.js      # Assignment model
│   └── Submission.js      # Submission model
├── routes/
│   ├── auth.js            # Auth routes
│   ├── courses.js         # Course routes
│   ├── assignments.js     # Assignment routes
│   └── submissions.js     # Submission routes
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── server.js             # Main application file
└── README.md             # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **Cannot connect to MongoDB**
   - Check if MongoDB is running locally
   - Verify connection string in `.env`
   - Check firewall settings for MongoDB Atlas

2. **JWT Token errors**
   - Ensure JWT_SECRET is set in `.env`
   - Check token format in Authorization header

3. **CORS errors**
   - Verify FRONTEND_URL in `.env`
   - Check browser console for specific CORS errors

4. **Port already in use**
   - Change PORT in `.env`
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`

### Debugging Tips

1. Check server logs for detailed error messages
2. Use MongoDB Compass to inspect database records
3. Test API endpoints with Postman or cURL
4. Enable development logging by setting `NODE_ENV=development`

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB database
3. Set secure JWT_SECRET
4. Configure proper CORS settings

### Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel**: Serverless deployment
- **DigitalOcean**: VPS deployment
- **AWS**: EC2 or Lambda deployment

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Learning! 🎓**