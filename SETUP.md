# Student Learning Platform - Setup Quick Start

## Prerequisites Check

Before running the application, ensure you have:

1. **Node.js** (v16+): `node --version`
2. **MongoDB** (local or Atlas connection string)
3. **Git**: For cloning the repository

## Quick Demo Setup

### 1. Start MongoDB (if running locally)
```bash
# Install MongoDB Community Edition if not installed
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com

# Start MongoDB service
sudo systemctl start mongod  # Ubuntu
brew services start mongodb-community  # macOS
```

### 2. Clone and Setup
```bash
git clone https://github.com/dinesh-mca12/student-learning01.git
cd student-learning01
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Edit .env file:
# - Set MONGODB_URI (use local: mongodb://localhost:27017/student-learning)
# - Set JWT_SECRET to any random string

npm start
# ✅ Backend runs on http://localhost:5000
```

### 4. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
cp .env.example .env

# Edit .env file:
# - Set VITE_API_URL=http://localhost:5000/api

npm run dev
# ✅ Frontend runs on http://localhost:5173
```

### 5. Test the System

#### Create Demo Users
```bash
# Teacher Account
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Demo Teacher",
    "email": "teacher@demo.com", 
    "password": "password123",
    "role": "teacher"
  }'

# Student Account  
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Demo Student",
    "email": "student@demo.com",
    "password": "password123", 
    "role": "student"
  }'
```

#### Demo Workflow
1. **Visit** http://localhost:5173
2. **Login** as teacher@demo.com / password123
3. **Create Course** → "Introduction to Web Development"
4. **Create Assignment** → Due next week
5. **Logout** and login as student@demo.com
6. **Enroll** in the course
7. **Submit** the assignment
8. **Try Chatbot** → Ask "How do I submit assignments?"

## Production Deployment

### Backend → Render
1. Connect GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: Production secret key
   - `FRONTEND_URL`: Your frontend domain

### Frontend → Vercel
```bash
npm install -g vercel
cd frontend
vercel
# Set VITE_API_URL to your Render backend URL
```

## Troubleshooting

### MongoDB Connection Error
- **Local**: Ensure MongoDB service is running
- **Atlas**: Check connection string format and network access

### Port Already in Use
```bash
# Kill process on port 5000 or 5173
sudo lsof -ti:5000 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

### CORS Issues
- Ensure FRONTEND_URL in backend .env matches your frontend domain
- Check VITE_API_URL in frontend .env points to correct backend

## Features Demonstrated

✅ **Authentication**: Role-based JWT authentication  
✅ **Course Management**: Create, browse, enroll in courses  
✅ **Assignment System**: Create assignments, submit work, grade submissions  
✅ **AI Chatbot**: Interactive learning assistant  
✅ **Responsive UI**: Modern React interface with animations  
✅ **Security**: Input validation, error handling, rate limiting  
✅ **API Documentation**: RESTful endpoints with clear responses  

## Technology Stack

**Backend**: Node.js + Express + MongoDB + JWT  
**Frontend**: React + TypeScript + Tailwind CSS + Vite  
**Authentication**: JSON Web Tokens  
**Database**: MongoDB with Mongoose ODM  
**Deployment**: Render (backend) + Vercel (frontend)  

---

**🎓 Ready for hackathon demo! Full-featured learning platform with modern tech stack.**