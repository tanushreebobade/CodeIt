# CodeIt - Local Setup Guide

Welcome to CodeIt! This guide will help you set up the project on your Windows machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - Option 1: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud - Recommended)
  - OR Option 2: [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Local)
- **Git** - [Download](https://git-scm.com/)
- **Redis** (Optional) - [Redis for Windows](https://github.com/tporadowski/redis/releases)

### Verify Installation

```powershell
node --version
npm --version
git --version
```

---

## 🚀 Step-by-Step Setup

### 1️⃣ Clone the Repository (if not already done)

```powershell
git clone https://github.com/tanushreebobade/CodeIt.git
cd CodeIt
```

Since you already have the project, you're in: `c:\Users\namas\Downloads\CodeIt-main\CodeIt-main`

---

### 2️⃣ Backend Setup

#### Navigate to Backend Directory

```powershell
cd backend
```

#### Install Dependencies

```powershell
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` folder with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Google Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Code Execution APIs (Optional - for running code)
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret

# Cloudinary Configuration (Optional - for video uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

#### Get Required API Keys

1. **MongoDB Atlas** (Required):
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account and cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

2. **Google Gemini API** (Required for AI features):
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Copy and paste into `.env`

3. **JDoodle API** (Optional - for code execution):
   - Sign up at [JDoodle](https://www.jdoodle.com/compiler-api)
   - Get your Client ID and Secret

4. **Google OAuth** (Optional):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project and OAuth credentials

#### Start the Backend Server

```powershell
npm run dev
```

You should see: `Server running on port 5000` ✅

---

### 3️⃣ Frontend Setup

#### Open a New Terminal and Navigate to Frontend

```powershell
cd c:\Users\namas\Downloads\CodeIt-main\CodeIt-main\frontend
```

#### Install Dependencies

```powershell
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:5000
```

#### Start the Frontend Development Server

```powershell
npm run dev
```

The frontend will be available at: **http://localhost:5173** 🎉

---

## 🧪 Testing the Setup

1. Open your browser and go to `http://localhost:5173`
2. You should see the CodeIt homepage
3. Try registering a new account
4. Browse coding problems
5. Test the AI tutor feature

---

## 🐛 Common Issues & Troubleshooting

### Backend won't start
- **Error:** `MONGODB_URI is not defined`
  - ✅ Make sure `.env` file exists in the `backend` folder
  - ✅ Check that MongoDB connection string is correct

### Frontend can't connect to backend
- **Error:** Network errors or CORS issues
  - ✅ Ensure backend is running on port 5000
  - ✅ Check `VITE_API_BASE_URL` in frontend `.env`
  - ✅ Verify CORS is configured correctly in backend

### Port already in use
- **Error:** `Port 5000 is already in use`
  ```powershell
  # Find what's using the port
  netstat -ano | findstr :5000
  # Kill the process (replace PID with actual process ID)
  taskkill /PID <PID> /F
  ```

### Redis connection errors
- Redis is optional. If you see Redis errors but don't need it:
  - Comment out Redis-related code in `backend/src/config/redis.js`
  - Or install Redis for Windows

### Dependencies installation fails
```powershell
# Clear npm cache
npm cache clean --force
# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
# Reinstall
npm install
```

---

## 📁 Project Structure Overview

```
CodeIt/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Redis configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation, etc.
│   │   └── index.js        # Entry point
│   ├── data/               # JSON data storage
│   ├── .env                # Environment variables (create this)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   └── App.jsx         # Main app component
│   ├── .env                # Environment variables (create this)
│   └── package.json
│
└── README.md
```

---

## 🎯 Next Steps

1. ✅ Complete the setup following this guide
2. 📖 Explore the codebase
3. 🐛 Try fixing an issue or adding a feature
4. 🌿 Create a new branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. 💾 Commit and push your changes
6. 🔀 Create a pull request

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Need Help?

- Check existing issues on GitHub
- Reach out to the project maintainer
- Review the main README.md for additional information

---

**Happy Coding! 🚀**
