# Student Learning Platform - Frontend

A modern React-based frontend application for the Student Learning Platform, featuring a responsive dark-themed UI with course management, assignments, team collaboration, and AI chatbot functionality.

## 🚀 Features

- **Modern React UI** - Built with React 18 and modern JavaScript
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Dark Theme** - Professional dark theme with beautiful gradients
- **Smooth Animations** - Framer Motion animations for enhanced UX
- **Real-time Notifications** - Toast notifications for user feedback
- **JWT Authentication** - Secure token-based authentication with the backend
- **Course Management** - Browse, create, and manage courses
- **Assignment System** - View, create, and submit assignments
- **AI Chatbot** - Interactive learning assistant
- **Team Collaboration** - Team features (placeholder for future implementation)

## 🛠️ Technology Stack

- **Framework:** React 18
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Date Handling:** date-fns

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Backend API** running on port 5000 (see backend README)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.js       # Custom button component
│   │   │   ├── Card.js         # Card layout component
│   │   │   ├── Input.js        # Form input component
│   │   │   ├── Modal.js        # Modal dialog component
│   │   │   └── LoadingSpinner.js # Loading indicator
│   │   ├── Login.js         # Authentication component
│   │   ├── Dashboard.js     # Main dashboard page
│   │   ├── Course.js        # Course management page
│   │   ├── Assignment.js    # Assignment management page
│   │   └── Chatbot.js       # AI chatbot interface
│   ├── context/             # React context providers
│   │   └── AuthContext.js      # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.js          # Authentication hook
│   ├── lib/                 # Utility libraries
│   │   └── api.js              # API service layer
│   ├── App.js               # Main application component
│   ├── index.js             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── README.md               # This file
```

## 🔌 API Integration

The frontend communicates with the backend API through a centralized service layer (`src/lib/api.js`):

### Authentication APIs
- User registration and login
- Profile management
- Password updates
- Session management

### Course APIs
- Browse and search courses
- Create and manage courses (teachers)
- Enroll in courses (students)
- Course statistics

### Assignment APIs
- View assignments by course or user
- Create assignments (teachers)
- Submit assignments (students)
- Assignment analytics

### Team APIs
- Create and join teams
- Project and task management
- Team collaboration features

### Chatbot APIs
- Conversation management
- Message sending and receiving
- Feedback and reactions
- Conversation history

## 🎨 Design System

### Color Palette
- **Primary:** Blue shades for actions and links
- **Secondary:** Gray shades for backgrounds and text
- **Accent:** Purple/Pink gradients for highlights
- **Status Colors:** Green (success), Red (error), Yellow (warning)

### Typography
- **Headings:** Bold weights with proper hierarchy
- **Body Text:** Regular weight with good readability
- **Code/IDs:** Monospace font for technical elements

### Components
All UI components follow a consistent design pattern:
- **Cards:** Elevated surfaces with rounded corners
- **Buttons:** Multiple variants (primary, secondary, outline, danger)
- **Inputs:** Consistent styling with focus states
- **Modals:** Centered overlays with backdrop blur

## 🚦 User Roles & Features

### Students
- **Authentication:** Register/login with student role
- **Dashboard:** View enrolled courses and assignments
- **Courses:** Browse and enroll in available courses
- **Assignments:** View and submit assignments
- **Chatbot:** Get help from AI learning assistant
- **Teams:** Join teams and collaborate (coming soon)

### Teachers
- **Authentication:** Register/login with teacher role
- **Dashboard:** Overview of created courses and assignments
- **Courses:** Create, edit, and manage courses
- **Assignments:** Create assignments and view submissions
- **Analytics:** Track student progress and engagement
- **Chatbot:** Access to advanced analytics (admin features)

## 🔐 Authentication Flow

1. **Login/Registration:** Users can create accounts or sign in
2. **Token Storage:** JWT tokens stored in localStorage
3. **Route Protection:** Private routes require authentication
4. **Auto-Logout:** Automatic logout on token expiration
5. **Session Persistence:** Login state persists across browser sessions

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop:** Full sidebar navigation and grid layouts
- **Tablet:** Responsive navigation and adapted layouts
- **Mobile:** Mobile-optimized navigation and single-column layouts

## 🎯 Key Features Guide

### Dashboard
- **Quick Stats:** Overview of courses, assignments, and progress
- **Navigation:** Sidebar navigation to all major sections
- **Quick Actions:** Role-based action buttons
- **Recent Activity:** Timeline of recent events (coming soon)

### Course Management
- **Browse Courses:** Search and filter available courses
- **Course Cards:** Rich course information with instructor details
- **Enrollment:** One-click course enrollment for students
- **Course Creation:** Full course creation form for teachers

### Assignment System
- **Assignment List:** Filter by course, status, and due date
- **Assignment Details:** Comprehensive assignment information
- **Submission:** Text-based submission with file upload support
- **Due Date Tracking:** Visual indicators for assignment status

### AI Chatbot
- **Natural Conversation:** Free-form chat with AI assistant
- **Quick Questions:** Predefined questions for common topics
- **Feedback System:** Rate AI responses for improvement
- **Context Awareness:** AI understands student/teacher context

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Error**
```
Error: Network Error or CORS issues
```
**Solution:** Ensure backend is running on port 5000 and CORS is configured.

**2. Authentication Issues**
```
Error: 401 Unauthorized
```
**Solution:** Check if JWT token is valid or log in again.

**3. Build Errors**
```
Error: Module not found
```
**Solution:** Run `npm install` to ensure all dependencies are installed.

**4. Styling Issues**
```
CSS not loading or Tailwind classes not working
```
**Solution:** Check if PostCSS and Tailwind are properly configured.

### Development Tips

1. **Use React DevTools:**
   Install the React Developer Tools browser extension for debugging.

2. **Check Network Tab:**
   Monitor API calls in browser DevTools Network tab.

3. **Console Logging:**
   Add console.log statements to debug component state and props.

4. **Hot Reloading:**
   Vite provides fast hot reloading during development.

## 🚀 Building for Production

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Checklist
- [ ] Set production API URL in environment variables
- [ ] Build the application for production
- [ ] Test all functionality in production build
- [ ] Configure proper HTTPS and security headers
- [ ] Set up proper error logging and monitoring

## 🌐 Deployment Options

### Static Hosting (Netlify, Vercel)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Traditional Hosting
1. Build the application: `npm run build`
2. Upload the `dist` folder to your web server
3. Configure server to serve index.html for all routes

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name (optional)
- `VITE_APP_VERSION` - Application version (optional)

### Vite Configuration
The `vite.config.js` file includes:
- React plugin configuration
- Proxy setup for API calls during development
- Build optimization settings

### Tailwind Configuration
The `tailwind.config.js` file includes:
- Custom color palette
- Extended spacing and sizing
- Custom animations and transitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

### Code Style Guidelines
- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Add PropTypes or TypeScript for type checking
- Write clean, readable code with proper comments

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check this README and troubleshooting section
2. Review the browser console for error messages
3. Check the Network tab for API call failures
4. Ensure the backend is running and accessible
5. Create an issue with detailed error information

## 🚀 Future Enhancements

- **Real-time Updates:** WebSocket integration for live updates
- **File Upload:** Complete file upload system for assignments
- **Video Calls:** Integrated video calling for live classes
- **Mobile App:** React Native mobile application
- **Offline Support:** PWA features for offline functionality
- **Advanced Analytics:** Detailed learning analytics dashboard

---

**Happy Learning! 🎓✨**