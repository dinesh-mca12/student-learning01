# Student Learning Platform - Frontend

A modern, responsive React frontend for the Student Learning Management System.

## 🚀 Features

- **Modern UI/UX**: Clean, dark-themed interface with smooth animations
- **Role-Based Access**: Different interfaces for students and teachers
- **Course Management**: Browse, enroll, and manage courses
- **Assignment System**: Submit assignments and view grades
- **Interactive Chatbot**: AI-powered learning assistant
- **Team Collaboration**: Join teams and participate in discussions
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live data updates and notifications

## 🛠 Tech Stack

- **Framework**: React 19+ with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for modern, responsive design
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for beautiful icons
- **HTTP Client**: Axios for API communication
- **Form Handling**: React Hook Form with Yup validation
- **Notifications**: React Hot Toast for user feedback
- **Routing**: React Router DOM for navigation

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # Base UI components (Button, Input, etc.)
│   │   └── layout/     # Layout components (Header, Sidebar)
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React Context providers
│   ├── lib/            # Utilities and API client
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md           # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Backend API** running (see backend README)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/dinesh-mca12/student-learning01.git
cd student-learning01/frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Environment Variables:**

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Optional: Analytics, error tracking, etc.
VITE_ANALYTICS_ID=your-analytics-id
```

### 3. Development Server

```bash
# Start development server
npm run dev

# Server will start at http://localhost:5173
```

### 4. Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 🎨 UI Components

The application uses a comprehensive design system with reusable components:

### Base Components
- **Button**: Multiple variants (primary, outline, ghost)
- **Input**: Form inputs with validation states
- **Card**: Content containers with hover effects
- **Modal**: Overlay dialogs for forms and confirmations
- **LoadingSpinner**: Loading indicators

### Layout Components
- **Layout**: Main application layout wrapper
- **Sidebar**: Navigation sidebar with role-based menu items
- **Header**: Top navigation bar

## 🔐 Authentication Flow

1. **Registration**: Users select role (student/teacher) and create account
2. **Login**: Email/password authentication with JWT tokens
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Role-Based UI**: Different interfaces based on user role

## 📱 Pages Overview

### Public Pages
- **Login**: User authentication
- **Sign Up**: New user registration

### Student Pages
- **Dashboard**: Overview of courses, assignments, and schedule
- **Courses**: Browse and enroll in available courses
- **Assignments**: View and submit assignments
- **Chatbot**: AI learning assistant
- **Teams**: Join study groups and collaborate

### Teacher Pages
- **Dashboard**: Teaching overview and analytics
- **Courses**: Create and manage courses
- **Assignments**: Create assignments and grade submissions
- **Students**: View enrolled students and progress

### Shared Pages
- **Course Detail**: Individual course information
- **Profile Settings**: Update user profile and preferences

## 🤖 Chatbot Features

The integrated AI chatbot provides:
- **Course Help**: Information about course content and materials
- **Assignment Guidance**: Help with assignment submission and requirements
- **Study Tips**: Personalized learning strategies
- **Technical Support**: Troubleshooting and technical assistance
- **General Questions**: Academic and platform-related queries

## 🎯 Key Features by Role

### For Students
- 📚 Browse and enroll in courses
- 📝 Submit assignments and track grades
- 👥 Join study groups and teams
- 💬 Get help from AI chatbot
- 📅 View academic calendar and deadlines
- 🎥 Access live class links

### For Teachers
- ➕ Create and manage courses
- 📋 Create assignments and grade submissions
- 👨‍🎓 View student progress and analytics
- 📊 Generate reports and insights
- 💬 Interact with students through discussions
- 🎥 Schedule and manage live classes

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   # Login to Vercel
   vercel login

   # Deploy
   vercel

   # Follow the prompts to configure deployment
   ```

3. **Configure Environment Variables**:
   - Go to Vercel Dashboard
   - Navigate to your project settings
   - Add environment variables:
     ```
     VITE_API_URL=https://your-backend-api.render.com/api
     ```

4. **Automatic Deployment**:
   - Connect GitHub repository for automatic deployments
   - Every push to main branch will trigger deployment

### Deploy to Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Upload `dist` folder to Netlify
   - Or connect GitHub repository for automatic deployment

3. **Configure redirects** (create `public/_redirects`):
   ```
   /*    /index.html   200
   ```

### Deploy to GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

## 🛠 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to customize the color scheme:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/layout/Sidebar.tsx`

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1280px+)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🐛 Troubleshooting

### Common Issues

#### 1. API Connection Error
```
Error: Network Error
```
**Solution**: Check if backend is running and `VITE_API_URL` is correct

#### 2. Build Failures
```
Error: Failed to resolve import
```
**Solution**: Clear node_modules and reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 3. Environment Variables Not Loading
```
Error: import.meta.env.VITE_API_URL is undefined
```
**Solution**: Ensure .env file exists and variables start with `VITE_`

#### 4. TypeScript Errors
```
Error: Property 'x' does not exist on type 'y'
```
**Solution**: Check type definitions and update interfaces

### Debug Mode

Enable React DevTools for debugging:
```bash
# Install React DevTools browser extension
# Set environment to development
VITE_NODE_ENV=development npm run dev
```

## 🔧 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ Internet Explorer (not supported)

## 📊 Performance

The application is optimized for performance:
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with lazy loading
- **Bundle Size**: Optimized production builds
- **Caching**: Efficient browser caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create Pull Request

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please:
1. Check this README and troubleshooting section
2. Open an issue on GitHub
3. Contact the development team

---

**Built with ❤️ for the future of education!**