# Complaint Management System (CMS)

A full-stack web application for managing complaints and service providers. The system allows users to register, file complaints, track their status, and enables administrators to manage complaints, service providers, and view analytics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Usage](#usage)

## ✨ Features

### User Features
- **User Registration & Authentication** - Secure registration and JWT-based authentication
- **Password Management** - Forgot password functionality with email verification
- **Complaint Filing** - Create and submit complaints with images
- **Complaint Tracking** - View complaint status and history
- **Profile Management** - Update user profile information

### Admin Features
- **Complaint Management** - View, filter, and manage user complaints
- **Service Provider Management** - Manage service providers and assign to complaints
- **Analytics Dashboard** - View complaint statistics and trends
- **User Management** - Monitor and manage registered users
- **WhatsApp Notifications** - Send updates via WhatsApp using Twilio

### Security Features
- **JWT Authentication** - Secure token-based authentication with access & refresh tokens
- **Password Hashing** - bcryptjs for secure password storage
- **Rate Limiting** - Prevent abuse with rate limiting middleware
- **CORS Protection** - Cross-origin request handling
- **Input Validation** - Server-side validation for all inputs

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5.2.1)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Encryption**: bcryptjs, bcrypt
- **File Upload**: Multer
- **SMS/WhatsApp**: Twilio
- **Email**: Nodemailer
- **Logging**: Morgan
- **Rate Limiting**: express-rate-limit
- **Other**: CORS, Cookie Parser, dotenv

### Frontend
- **Framework**: React (v19.2.0)
- **Build Tool**: Vite (v7.2.4)
- **Routing**: React Router DOM (v7.11.0)
- **HTTP Client**: Axios
- **Charts**: Chart.js, Recharts
- **Notifications**: React Hot Toast
- **Linting**: ESLint
- **Styling**: CSS

## 📁 Project Structure

```
CMS/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── multer.js             # File upload configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── complaintController.js # Complaint management
│   │   ├── userController.js     # User management
│   │   ├── serviceProviderController.js
│   │   └── analyticsController.js # Analytics data
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── errorHandler.js       # Error handling
│   │   └── rateLimiter.js        # Rate limiting
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Complaint.js          # Complaint schema
│   │   └── ServiceProvider.js    # Service provider schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── userRoutes.js
│   │   ├── serviceProviderRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   └── whatsapp.js           # Twilio WhatsApp integration
│   ├── uploads/                  # File storage directory
│   ├── index.js                  # Server entry point
│   ├── package.json
│   └── .env                      # Environment variables
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # API client setup
│   │   ├── components/
│   │   │   ├── Navbar/           # Navigation component
│   │   │   └── ProtectedRoute/   # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication state
│   │   ├── pages/
│   │   │   ├── Register/
│   │   │   ├── Login/
│   │   │   ├── ForgotPassword/
│   │   │   ├── Dashboard/        # User dashboard
│   │   │   ├── Profile/
│   │   │   ├── Complaints/       # Complaints page
│   │   │   ├── AdminPanel/       # Admin dashboard
│   │   │   ├── AdminHome/
│   │   │   ├── AdminProviders/   # Provider management
│   │   │   └── AdminAnalytics/   # Analytics view
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── Readme.md
```

## 🚀 Backend Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Twilio account (for WhatsApp)

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```
PORT=5000
MONGODB_URI=mongodb://your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=development

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=your-twilio-whatsapp-number

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

4. Start development server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

The server will run on `http://localhost:5000`

## 🎨 Frontend Setup

### Prerequisites
- Node.js (v14 or higher)

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API endpoint in `src/api/axios.js` if needed

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (Vite default port)

### Build for Production
```bash
npm run build
```

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh JWT token
- `POST /logout` - Logout user

### Complaints (`/api/complaints`)
- `GET /` - Get all complaints (Admin)
- `GET /:id` - Get complaint by ID
- `POST /` - Create new complaint
- `PUT /:id` - Update complaint status
- `DELETE /:id` - Delete complaint

### Users (`/api/users`)
- `GET /` - Get all users (Admin)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `DELETE /:id` - Delete user

### Service Providers (`/api/providers`)
- `GET /` - Get all service providers
- `POST /` - Create service provider
- `PUT /:id` - Update service provider
- `DELETE /:id` - Delete service provider

### Analytics (`/api/analytics`)
- `GET /stats` - Get complaint statistics
- `GET /trends` - Get complaint trends

## 🔐 Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `REFRESH_SECRET` - Refresh token secret
- `NODE_ENV` - Environment (development/production)
- `TWILIO_ACCOUNT_SID` - Twilio account ID
- `TWILIO_AUTH_TOKEN` - Twilio authentication token
- `TWILIO_WHATSAPP_NUMBER` - Twilio WhatsApp number
- `EMAIL_USER` - Email service username
- `EMAIL_PASSWORD` - Email service password

## 💻 Usage

### User Workflow
1. Register a new account
2. Login with credentials
3. File a complaint with details and images
4. View complaint status on dashboard
5. Receive WhatsApp notifications on updates

### Admin Workflow
1. Login as admin
2. View all complaints and manage status
3. Assign service providers to complaints
4. Monitor user complaints and analytics
5. Manage service providers

## 🔒 Authentication Flow

1. User registers or logs in
2. Server generates access token (15 minutes) and refresh token (7 days)
3. Tokens stored in cookies
4. Protected routes verified via JWT middleware
5. Refresh token used to get new access token when expired

## 📝 Notes

- Each functionality has a separate file in controllers, models, and routes
- Passwords are hashed using bcryptjs before storage
- WhatsApp notifications sent via Twilio API
- Rate limiting applied to prevent abuse
- CORS configured for frontend domain
- Morgan logs all HTTP requests
- Error handling middleware manages exceptions globally