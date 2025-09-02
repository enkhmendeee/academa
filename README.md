# Academa - Academic Management System

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-orange.svg)](https://www.prisma.io/)

## 📚 Overview

Academa is a comprehensive academic management system designed to help students organize and track their coursework, assignments, and exams across multiple semesters. Built with modern web technologies, it provides an intuitive interface for managing academic responsibilities with powerful visualization and organization features.

## ✨ Key Features

### 🎯 **Semester Management**
- Create and manage multiple academic semesters
- Set default semesters for quick access
- Organize courses and assignments by semester
- Edit and delete semesters with data validation

### 📖 **Course Organization**
- Create courses with custom names and descriptions
- Assign vibrant color coding to courses for visual distinction
- Track course progress with real-time completion statistics
- View course-specific homework and exam lists

### 📝 **Assignment Tracking**
- **Homework Management**: Create, edit, and track homework assignments
- **Exam Scheduling**: Schedule and monitor upcoming exams
- **Status Tracking**: Monitor assignment status (Pending, In Progress, Completed, Overdue)
- **Due Date Management**: Automatic overdue detection and notifications
- **Grade Recording**: Track and record assignment grades

### 📊 **Data Visualization**
- **Pie Charts**: Visualize homework distribution by course
- **Bar Charts**: Track assignment completion status across courses
- **Progress Bars**: Real-time course completion progress
- **Interactive Dashboards**: Comprehensive overview of academic performance

### 🔍 **Advanced Filtering & Sorting**
- Filter assignments by status, course, and semester
- Sort by due date, title, course, status, or grade
- Hide completed assignments for focused workflow
- Real-time search and filtering capabilities

### 👤 **User Management**
- Secure user authentication and authorization
- Personalized user profiles with custom mottos
- Session management with automatic token handling
- Responsive design for all device types

## 🏗️ Technical Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Ant Design** for modern, responsive UI components
- **React Router** for seamless navigation
- **ApexCharts** for interactive data visualizations
- **Axios** for HTTP client with interceptors
- **Context API** for state management

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for type-safe server-side code
- **Prisma ORM** for database management
- **PostgreSQL** for robust data storage
- **JWT** for secure authentication
- **CORS** enabled for cross-origin requests

### Database Schema
- **Users**: Authentication and profile management
- **Courses**: Course information with color coding
- **Homeworks**: Assignment details with status tracking
- **Exams**: Exam scheduling and management
- **UserSemesters**: Semester organization per user

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 13 or higher (Supabase)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/academa.git
   cd academa
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Database Setup (Supabase)**
   ```bash
   # Navigate to server directory
   cd ../server
   
   # Set up your Supabase connection string in .env (examples below)
   # Direct connection (5432):
   # DATABASE_URL=postgresql://USER:PASSWORD@db.YOUR_HASH.supabase.co:5432/postgres?sslmode=require&connect_timeout=15
   # Connection Pooler (6543, recommended for serverless or platforms that limit connections):
   # DATABASE_URL=postgresql://USER:PASSWORD@db.YOUR_HASH.supabase.co:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1&connect_timeout=15
   
   # Run database migrations
   npx prisma migrate dev
   
   # Generate Prisma client
   npx prisma generate
   ```

4. **Environment Configuration**
   
   Create `.env` files in both server and client directories:
   
   **Server (.env)**
   ```env
   # Copy this from Supabase > Project Settings > Database (use pooler if on serverless)
   DATABASE_URL=postgresql://USER:PASSWORD@db.YOUR_HASH.supabase.co:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1&connect_timeout=15
   JWT_SECRET=your_jwt_secret_here
   PORT=3000
   ```
   
   **Client (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:3000/api
   ```

5. **Start the application**
   ```bash
   # Start the server (from server directory)
   npm run dev
   
   # Start the client (from client directory, in a new terminal)
   cd ../client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

## 📱 Usage Guide

### First Time Setup
1. **Register an account** with your email and username
2. **Create your first semester** (e.g., "Fall 2024", "Spring 2025")
3. **Add courses** to your semester with custom colors
4. **Start adding assignments** and exams

### Managing Your Academic Life
1. **Dashboard Overview**: View all your assignments and progress at a glance
2. **Course Management**: Organize courses by semester with visual color coding
3. **Assignment Tracking**: Monitor homework and exam status with real-time updates
4. **Progress Visualization**: Use charts and progress bars to track completion
5. **Filtering & Sorting**: Find specific assignments quickly with advanced filters

## 🎨 Screenshots

### Dashboard Overview
<img width="1717" height="960" alt="Screenshot 2025-08-11 at 2 20 06 PM" src="https://github.com/user-attachments/assets/1c3845b7-671c-473e-ac58-9807a3fc317f" />

### Course Management
<img width="1717" height="960" alt="Screenshot 2025-08-11 at 2 20 23 PM" src="https://github.com/user-attachments/assets/ea0e0d41-77a7-4390-b3da-ceffd93e6c61" />


### Assignment Tracking
<img width="1717" height="960" alt="Screenshot 2025-08-11 at 2 20 37 PM" src="https://github.com/user-attachments/assets/c883e4ba-98fe-4d05-83c6-f175603df5c2" />



## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PATCH /api/auth/profile` - Update user profile

### Courses
- `GET /api/courses` - Get user courses
- `POST /api/courses` - Create new course
- `PATCH /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Homeworks
- `GET /api/homeworks` - Get user homeworks
- `POST /api/homeworks` - Create new homework
- `PATCH /api/homeworks/:id` - Update homework
- `DELETE /api/homeworks/:id` - Delete homework

### Exams
- `GET /api/exams` - Get user exams
- `POST /api/exams` - Create new exam
- `PATCH /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

### Semesters
- `GET /api/semesters` - Get user semesters
- `POST /api/semesters` - Add new semester
- `PATCH /api/semesters` - Update semester
- `DELETE /api/semesters/:name` - Delete semester

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && npm install && npm run build`
3. Set output directory: `client/build`
4. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `cd server && npm install && npx prisma generate`
3. Set start command: `cd server && npm start`
4. Configure environment variables (use your Supabase `DATABASE_URL`, and `JWT_SECRET`)
5. Deploy automatically on push to main branch

## 🛠️ Development

### Project Structure
```academa/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── prisma/             # Database schema and migrations
└── README.md
```

### Available Scripts

**Server**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run migrate     # Run database migrations
```

**Client**
```bash
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
npm run eject       # Eject from Create React App
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ant Design** for the beautiful UI components
- **ApexCharts** for the interactive data visualizations
- **Prisma** for the excellent ORM experience
- **React** team for the amazing framework

## 📞 Support

For support, email nergui.eegii04@gmail.com or create an issue in the GitHub repository.

---

**Built with ❤️ for students everywhere**

