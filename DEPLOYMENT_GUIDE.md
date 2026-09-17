# 🚀 CodeIt Deployment Guide

This guide explains how to deploy CodeIt to production using **Render** (Backend) and **Vercel** (Frontend).

---

## 📋 Overview

- **Backend**: Deployed on Render (https://render.com)
- **Frontend**: Deployed on Vercel (https://vercel.com)
- **Database**: MongoDB Atlas (Cloud)

---

## 🔧 Environment Variables Setup

### Backend (Render) - Environment Variables

When deploying the backend to Render, you need to set these environment variables:

#### ✅ REQUIRED Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_CONNECT_STRING=<your_mongodb_atlas_connection_string>

# JWT Configuration
JWT_SECRET=<generate_a_secure_random_string>
JWT_EXPIRES_IN=7d

# Google Gemini AI API
GEMINI_API_KEY=<your_gemini_api_key>

# CORS Configuration
FRONTEND_URL=<your_vercel_frontend_url>
```

#### 🔵 OPTIONAL Variables (for enhanced features)

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_CALLBACK_URL=<your_render_backend_url>/api/auth/google/callback

# Code Execution APIs
JDOODLE_CLIENT_ID=<your_jdoodle_client_id>
JDOODLE_CLIENT_SECRET=<your_jdoodle_client_secret>

# Cloudinary (for video uploads)
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

# Redis Configuration (if using Redis)
REDIS_HOST=<your_redis_host>
REDIS_PORT=6379
REDIS_PASSWORD=<your_redis_password>
```

---

### Frontend (Vercel) - Environment Variables

When deploying the frontend to Vercel, you need to set this environment variable:

```env
VITE_API_BASE_URL=<your_render_backend_url>
```

**Example:**
```env
VITE_API_BASE_URL=https://codeit-backend.onrender.com
```

---

## 🎯 Step-by-Step Deployment Instructions

### 1️⃣ Deploy Backend to Render

1. **Sign in to Render**: https://render.com
2. **Create New Web Service**
3. **Connect GitHub Repository**: `tanushreebobade/CodeIt`
4. **Configure Service**:
   - **Name**: `codeit-backend` (or any name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free tier is fine for development

5. **Add Environment Variables** (Click "Environment" tab):
   - Copy all required variables from the list above
   - Replace placeholders with actual values

6. **Deploy**: Click "Create Web Service"

7. **Note Your Backend URL**: Example: `https://codeit-backend.onrender.com`

---

### 2️⃣ Deploy Frontend to Vercel

1. **Sign in to Vercel**: https://vercel.com
2. **Import Project** from GitHub: `tanushreebobade/CodeIt`
3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   - **Variable Name**: `VITE_API_BASE_URL`
   - **Value**: Your Render backend URL (e.g., `https://codeit-backend.onrender.com`)

5. **Deploy**: Click "Deploy"

6. **Note Your Frontend URL**: Example: `https://codeit.vercel.app`

---

### 3️⃣ Update Backend Environment Variable

After deploying the frontend, you need to update the backend:

1. Go back to **Render Dashboard**
2. Open your **Backend Service**
3. Go to **Environment** tab
4. **Update** `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://codeit.vercel.app
   ```
5. **Save Changes** (Render will automatically redeploy)

---

## 🔑 Where to Get API Keys

### MongoDB Atlas (Required)
1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster
3. Go to **Database** → **Connect** → **Connect your application**
4. Copy connection string
5. Replace `<password>` with your database password
6. **Important**: Add `0.0.0.0/0` to IP Access List for production

**Format:**
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/codeit?retryWrites=true&w=majority
```

### Google Gemini API (Required)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key

### JWT Secret (Required)
Generate a secure random string. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Or use any secure random string generator.

### Google OAuth (Optional)
1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-backend-url.onrender.com/api/auth/google/callback`

### JDoodle API (Optional)
1. Sign up: https://www.jdoodle.com/compiler-api
2. Get free tier API credentials
3. Copy Client ID and Client Secret

### Cloudinary (Optional)
1. Sign up: https://cloudinary.com
2. Dashboard will show your:
   - Cloud Name
   - API Key
   - API Secret

---

## 📝 Environment Variables Checklist

### Backend (Render)

**Critical (Must Configure):**
- [ ] `PORT` = 5000
- [ ] `NODE_ENV` = production
- [ ] `DB_CONNECT_STRING` = MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Secure random string
- [ ] `GEMINI_API_KEY` = Google Gemini API key
- [ ] `FRONTEND_URL` = Your Vercel frontend URL

**Optional (For Enhanced Features):**
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_CALLBACK_URL`
- [ ] `JDOODLE_CLIENT_ID`
- [ ] `JDOODLE_CLIENT_SECRET`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

### Frontend (Vercel)

**Critical (Must Configure):**
- [ ] `VITE_API_BASE_URL` = Your Render backend URL

---

## 🔒 Important Security Notes

1. **Never commit `.env` files** to GitHub (already in .gitignore)
2. **Use strong JWT secrets** in production
3. **Whitelist only necessary IPs** in MongoDB Atlas (or use 0.0.0.0/0 for open access)
4. **Enable HTTPS** for both frontend and backend (automatic on Vercel/Render)
5. **Keep API keys secure** and rotate them periodically

---

## 🐛 Troubleshooting

### Backend won't start on Render
- Check environment variables are set correctly
- Verify MongoDB connection string is correct
- Check build logs for errors
- Ensure `DB_CONNECT_STRING` (not `MONGODB_URI`) is set

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` is set in Vercel
- Check CORS settings in backend
- Ensure `FRONTEND_URL` is set correctly in Render
- Check browser console for CORS errors

### Database connection fails
- Verify MongoDB Atlas IP whitelist includes your Render instance
- Check username and password in connection string
- Ensure database user has proper permissions

### AI features not working
- Verify `GEMINI_API_KEY` is set correctly
- Check API key is active and has quota
- Review backend logs for API errors

---

## 📊 Monitoring Your Deployment

### Render (Backend)
- View logs: Dashboard → Your Service → Logs
- Monitor metrics: Dashboard → Your Service → Metrics
- Health checks: Automatic

### Vercel (Frontend)
- View logs: Dashboard → Your Project → Deployments → Logs
- Analytics: Dashboard → Your Project → Analytics
- Performance monitoring: Built-in

---

## 🔄 Updating Your Deployment

### Automatic Deployment
Both Render and Vercel support automatic deployment from GitHub:
- Push changes to your main branch
- Both services will automatically rebuild and deploy

### Manual Deployment
**Render:**
1. Dashboard → Your Service
2. Click "Manual Deploy" → "Deploy latest commit"

**Vercel:**
1. Dashboard → Your Project
2. Click "Redeploy"

---

## 📞 Support

If you encounter issues:
1. Check the logs in Render/Vercel dashboards
2. Verify all environment variables are set correctly
3. Review MongoDB Atlas connection
4. Check API key validity
5. Open an issue on GitHub

---

## ✅ Quick Reference

**Backend URL Format**: `https://your-app-name.onrender.com`
**Frontend URL Format**: `https://your-app-name.vercel.app`

**After Initial Deployment:**
1. Backend deploys → Get backend URL
2. Add backend URL to frontend env vars → Redeploy frontend
3. Add frontend URL to backend env vars → Redeploy backend
4. Test the application

---

**Happy Deploying! 🚀**
