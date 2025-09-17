# Student Learning Platform - Backend API

A comprehensive Node.js + Express + MongoDB REST API for a student learning management system.

## 🚀 Features

- **User Authentication**: JWT-based auth with role separation (students/teachers)
- **Course Management**: Full CRUD operations for courses with enrollment system
- **Assignment System**: Create, submit, and grade assignments
- **Team/Channel Discussions**: Group communication features
- **AI Chatbot**: Intelligent learning assistant with conversation storage
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Comprehensive error handling with detailed responses

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer (configured for Cloudinary)
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
backend/
├── controllers/          # Route handlers and business logic
├── middleware/          # Authentication, error handling, validation
├── models/             # MongoDB schemas and models
├── routes/             # API route definitions
├── utils/              # Helper functions and utilities
├── server.js           # Main application entry point
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or cloud instance like MongoDB Atlas)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/dinesh-mca12/student-learning01.git
cd student-learning01/backend

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Required Environment Variables:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/student-learning
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. Use URI: `mongodb://localhost:27017/student-learning`

#### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 4. Run the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### 5. Verify Installation

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Student Learning Platform API is running!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/profile` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/password` | Change password | Private |

### Course Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/courses` | List all courses | Public |
| POST | `/api/courses` | Create course | Teacher |
| GET | `/api/courses/:id` | Get course details | Public |
| PUT | `/api/courses/:id` | Update course | Course Teacher |
| DELETE | `/api/courses/:id` | Delete course | Course Teacher |
| POST | `/api/courses/:id/enroll` | Enroll in course | Student |
| DELETE | `/api/courses/:id/enroll` | Unenroll from course | Student |

### Assignment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/assignments` | List assignments | Private |
| POST | `/api/assignments` | Create assignment | Teacher |
| GET | `/api/assignments/:id` | Get assignment | Private |
| PUT | `/api/assignments/:id` | Update assignment | Teacher |
| DELETE | `/api/assignments/:id` | Delete assignment | Teacher |
| POST | `/api/assignments/:id/submit` | Submit assignment | Student |

### Chatbot Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/chatbot/ask` | Ask question | Private |
| GET | `/api/chatbot/conversations` | Get chat history | Private |

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📝 Example Usage

### Register a new teacher

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "teacher"
  }'
```

### Create a course

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Introduction to Web Development",
    "description": "Learn HTML, CSS, and JavaScript basics",
    "code": "WEB101",
    "difficulty": "beginner"
  }'
```

## 🚀 Deployment

### Deploy to Render

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Connect Repository**: Link your GitHub repository

3. **Configure Service**:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18 or higher

4. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-production-jwt-secret
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

5. **Deploy**: Render will automatically deploy on git push

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 🧪 Testing

```bash
# Run all tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevent API abuse
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Secure error responses

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running or check Atlas connection string

#### 2. JWT Token Issues
```
Error: Invalid or expired token
```
**Solution**: Check JWT_SECRET in .env file and token expiration

#### 3. Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Change PORT in .env or kill process using port 5000

#### 4. CORS Issues
```
Error: Access to fetch blocked by CORS policy
```
**Solution**: Update FRONTEND_URL in .env to match your frontend domain

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for hackathon success!**