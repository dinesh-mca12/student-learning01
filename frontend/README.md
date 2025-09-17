# Student Learning Platform - Frontend

A modern, responsive React application for the Student Learning Platform built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **Modern React**: Built with React 19 and TypeScript for type safety
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Authentication**: Complete user authentication system with role-based access
- **Course Management**: Browse, create, and manage courses
- **Assignment System**: Submit assignments and track progress
- **Interactive UI**: Smooth animations with Framer Motion
- **Real-time Updates**: Dynamic updates for better user experience

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16.0.0 or higher)
- **npm** or **yarn** package manager
- **Backend API** (should be running on port 5000)

## 🛠️ Installation & Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the frontend directory by copying from `.env.example`:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_API_TIMEOUT=10000

# Environment
VITE_NODE_ENV=development
```

### 4. Start the development server
```bash
npm run dev
```

The application will start on http://localhost:3000

## 🏗️ Build for Production

To build the application for production:

```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## 📚 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components (Header, Sidebar, etc.)
│   │   └── ui/          # Basic UI components (Button, Input, etc.)
│   ├── context/         # React context providers
│   │   └── AuthContext.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/             # Utility libraries
│   │   └── api.ts       # API client and types
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Courses.tsx
│   │   ├── Assignments.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignUpPage.tsx
│   │   └── Chatbot.tsx
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md           # This file
```

## 🎨 UI Components

### Available Components
- **Button**: Primary, secondary, and outline variants
- **Input**: Text inputs with validation support
- **Card**: Content containers with consistent styling
- **LoadingSpinner**: Loading indicators in various sizes
- **Layout**: Main application layout with sidebar navigation

### Styling
The application uses:
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Lucide React** for consistent icons
- **Custom CSS** for specific component styles

## 🔐 Authentication

The application includes a complete authentication system:

### User Roles
- **Student**: Can enroll in courses, submit assignments, view grades
- **Teacher**: Can create courses, manage assignments, grade submissions

### Features
- User registration with role selection
- Secure login with JWT tokens
- Profile management
- Automatic token refresh
- Route protection based on authentication status

## 📱 Pages & Features

### Dashboard
- Overview of courses, assignments, and upcoming events
- Role-based content (different for students and teachers)
- Quick actions and statistics

### Courses
- Browse available courses
- Course enrollment (students)
- Course creation and management (teachers)
- Detailed course information

### Assignments
- View assigned work (students)
- Create and manage assignments (teachers)
- Assignment submission system
- Grade tracking

### Authentication Pages
- Login page with form validation
- Registration page with role selection
- Profile management

### AI Chatbot
- Interactive learning assistant
- Pre-defined quick questions
- Simulated AI responses (can be extended with real AI)

## 🌐 API Integration

The frontend communicates with the backend API through:

- **Axios**: HTTP client for API requests
- **Type Safety**: Full TypeScript interfaces for API responses
- **Error Handling**: Comprehensive error handling and user feedback
- **Authentication**: Automatic token management and renewal

### API Endpoints Used
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `GET /courses` - Get courses
- `POST /courses` - Create course (teachers)
- `GET /assignments` - Get assignments
- `POST /assignments` - Create assignment (teachers)
- `GET /submissions` - Get submissions
- `POST /submissions` - Create submission (students)

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Network Errors**: Automatic retry and user feedback
- **Validation Errors**: Form validation with clear error messages
- **Authentication Errors**: Automatic logout on token expiration
- **Toast Notifications**: User-friendly success and error messages

## 🧪 Testing the Application

### Manual Testing Workflow

1. **Start the backend** (see backend README)
2. **Start the frontend**: `npm run dev`
3. **Test Registration**:
   - Go to http://localhost:3000
   - Click "Sign Up"
   - Register as both student and teacher
4. **Test Authentication**:
   - Login with created accounts
   - Verify role-based features
5. **Test Core Features**:
   - Create courses (as teacher)
   - Enroll in courses (as student)
   - Create assignments (as teacher)
   - Submit assignments (as student)

### Browser Testing
- **Chrome/Firefox/Safari**: Full compatibility
- **Mobile Responsive**: Test on various screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)

### Adding New Features
1. Create components in appropriate directories
2. Add API functions to `lib/api.ts`
3. Update TypeScript interfaces
4. Add routes to `App.tsx`
5. Test thoroughly

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend is running on port 5000
   - Check `VITE_API_BASE_URL` in `.env`
   - Verify CORS settings in backend

2. **Authentication Issues**
   - Clear browser localStorage
   - Check network tab for API errors
   - Verify JWT token format

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`
   - Verify all imports are correct

4. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for CSS conflicts
   - Verify responsive design classes

### Debugging Tips

1. **Browser DevTools**:
   - Use React Developer Tools extension
   - Check Console for JavaScript errors
   - Monitor Network tab for API calls

2. **State Debugging**:
   - Add console.logs to components
   - Use React DevTools to inspect state
   - Check localStorage for auth tokens

3. **API Debugging**:
   - Use browser Network tab
   - Test API endpoints with Postman
   - Check backend logs

## 🚀 Deployment

### Environment Setup
1. Set production API URL in `.env`
2. Build the application: `npm run build`
3. Deploy the `dist` folder

### Deployment Platforms
- **Vercel**: Easiest deployment with automatic builds
- **Netlify**: Great for static sites with form handling
- **AWS S3 + CloudFront**: Scalable solution
- **GitHub Pages**: Free hosting for public repositories

### Vercel Deployment Example
```bash
npm install -g vercel
vercel --prod
```

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- **Desktop**: Full featured experience
- **Tablet**: Optimized layout with touch support
- **Mobile**: Mobile-first design with drawer navigation

## ♿ Accessibility

The application includes:
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Clear focus indicators

## 🔒 Security Features

- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based requests
- **Secure Storage**: Secure token handling
- **Route Protection**: Authentication-based routing

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
- Check the troubleshooting section
- Review the backend API documentation
- Create an issue in the repository

---

**Happy Learning! 🎓**