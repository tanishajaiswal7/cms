# Complaint Management System (CMS)

A full-stack web application for managing complaints and service providers. The system allows users to register, file complaints, track their status, and enables administrators to manage complaints, service providers, and view analytics.

## 📚 Docs Index

- Main project guide: [README.md](./README.md)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Security](#security)
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
└── README.md
```

## 🚀 Backend Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Cloud or Local)
- Twilio account (for WhatsApp notifications)
- Stripe account (for payments)

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file using `.env.example` as reference:
```bash
cp .env.example .env
```

4. Update `.env` with your actual credentials:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cms_db
JWT_SECRET=your-long-random-secret-key
REFRESH_SECRET=your-long-random-refresh-secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

5. Start development server:
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
- Node.js (v18 or higher recommended)

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file using `.env.example` as reference:
```bash
cp .env.example .env
```

4. Update `.env` with development credentials:
```
VITE_BACKEND_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

5. For production, create `.env.production`:
```
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

6. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (Vite default port)

### Build for Production
```bash
npm run build
npm run preview
```

This generates optimized production build in the `dist/` directory.

## 🌍 Production Deployment

### Pre-Deployment Checklist

1. **Environment Security**
   - ✅ Never commit `.env` files to git
   - ✅ Use `.env.example` as reference
   - ✅ Rotate all credentials in production
   - ✅ Use secure secret management (AWS Secrets Manager, Azure Key Vault)

2. **Production Configuration**
   - ✅ Set `NODE_ENV=production`
   - ✅ Configure `CORS_ORIGINS` with your actual domain
   - ✅ Use `https://` for all URLs
   - ✅ Enable Stripe live keys (not test)

3. **Database**
   - ✅ Use MongoDB Atlas (cloud) for production
   - ✅ Enable IP whitelisting
   - ✅ Set up regular backups

### Deploy to Cloud Platforms

#### **Heroku / Render / Railway**
1. Connect GitHub repository
2. Set environment variables in platform dashboard
3. Deploy automatically on git push

#### **AWS / Azure / DigitalOcean**
1. Use Docker deployment (see Docker Deployment section)
2. Set up CI/CD pipeline
3. Configure domain and SSL/TLS

#### **Vercel (Frontend Only)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🐳 Docker Deployment

### Prerequisites
- Docker installed and running
- Docker Compose (v1.29+)

### Build and Run with Docker

1. Create production `.env` file in `backend/` directory

2. Build images:
```bash
docker-compose build
```

3. Start services:
```bash
docker-compose up -d
```

4. View logs:
```bash
docker-compose logs -f
```

5. Stop services:
```bash
docker-compose down
```

### Docker Services Configuration

**Backend Service**
- Port: 5000
- Health Check: Every 30 seconds
- Restart: Unless stopped
- Resource Limits: 1 CPU, 512MB RAM

**Frontend Service**
- Port: 80 (HTTP)
- Health Check: Every 30 seconds
- Restart: Unless stopped
- Resource Limits: 0.5 CPU, 256MB RAM

### Production Docker Deployment

For hosting environments:

```bash
# Build with specific tag
docker build -t cms-backend:1.0 ./backend
docker build -t cms-frontend:1.0 ./frontend

# Push to registry (e.g., Docker Hub)
docker push username/cms-backend:1.0
docker push username/cms-frontend:1.0

# Deploy using docker-compose.yml
docker-compose up -d
```

### Health Check Endpoints
- Backend: `http://localhost:5000/api/health/stripe`
- Frontend: `http://localhost/health`

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

### Backend Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | Yes | development or production |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `REFRESH_SECRET` | Yes | Refresh token secret (min 32 chars) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret API key (sk_*) |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (pk_*) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (whsec_*) |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio authentication token |
| `TWILIO_PHONE_NUMBER` | Yes | Phone number for Twilio (international format) |
| `EMAIL_USER` | Yes | Email address for sending emails |
| `EMAIL_PASS` | Yes | Email service password/app token |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins (production URLs) |
| `MAX_FILE_SIZE` | No | Max upload size in bytes (default: 5242880 = 5MB) |

### Frontend Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | Yes | Backend API base URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (pk_*) |

## 🔒 Security

### Implemented Security Features

✅ **Authentication & Authorization**
- JWT-based authentication with access & refresh tokens
- Role-based access control (admin/resident)
- Protected routes with middleware validation
- Secure password hashing with bcryptjs

✅ **Rate Limiting**
- Auth endpoints: 10 requests/15 minutes
- API endpoints: 100 requests/15 minutes
- Payment endpoints: 30 requests/15 minutes
- Profile updates: 15 requests/15 minutes

✅ **File Upload Security**
- Image file types only (JPEG, PNG, GIF)
- Max file size: 5MB
- Filename sanitization to prevent directory traversal
- Stored in isolated uploads directory

✅ **CORS Protection**
- Configurable allowed origins
- Credentials enabled for authenticated requests
- Methods: GET, POST, PUT, DELETE, OPTIONS

✅ **Error Handling**
- Generic error messages in production (no stack traces)
- Detailed logs for debugging in development
- Structured error responses

✅ **Data Protection**
- HTTPS/TLS in production (enforced)
- No sensitive data in logs or client-side code
- Environment variables for all secrets

✅ **Database Security**
- MongoDB connection retry logic
- Timeout handling
- Connection pooling

### Security Best Practices

1. **Never commit credentials** - Use `.env.example` only
2. **Rotate secrets regularly** - Especially after deployment
3. **Use HTTPS in production** - Always
4. **Enable MFA** - For admin/sensitive accounts
5. **Monitor logs** - Set up logging to external service
6. **Regular updates** - Keep dependencies up to date
7. **API rate limiting** - Prevent abuse
8. **Input validation** - Server-side validation on all endpoints

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

## 📝 Notes & Additional Information

### Project Structure
- Each functionality has separate files in `controllers/`, `models/`, and `routes/`
- Passwords are hashed using bcryptjs before storage
- WhatsApp notifications sent via Twilio API
- Rate limiting applied to prevent abuse and DDoS attacks
- CORS configured for multiple frontend domains
- Morgan logs HTTP requests (combined format in production)
- Error handling middleware manages exceptions globally
- File uploads stored in `backend/uploads/` with size limits

### Production Optimizations
- ✅ Morgan logging configured for production
- ✅ Database connection with retry logic (5 attempts)
- ✅ Docker health checks for both services
- ✅ Nginx configuration with gzip compression
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Resource limits in docker-compose
- ✅ Non-root user in backend Docker container
- ✅ SPA routing support for React Router
- ✅ Static asset caching (1 year)
- ✅ All console.log statements removed

### Monitoring & Maintenance

**Recommended Tools:**
- Sentry for error tracking
- Datadog or New Relic for performance monitoring
- MongoDB Atlas monitoring for database
- CloudFlare or similar for CDN & DDoS protection

**Log Locations:**
- Backend: `STDOUT` (view with `docker-compose logs`)
- Frontend: Browser console (development only)

### Troubleshooting

**Backend won't start:**
- Check `MONGO_URI` is correct
- Verify all environment variables are set
- Check port 5000 isn't in use

**Frontend API calls failing:**
- Verify `VITE_BACKEND_URL` is correct
- Check CORS_ORIGINS in backend .env
- Ensure backend is running

**Docker issues:**
- Run `docker-compose logs` for detailed errors
- Clear containers: `docker-compose down -v`
- Rebuild: `docker-compose build --no-cache`

### Support
For issues or questions, create a GitHub issue or contact the development team.