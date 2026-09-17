# ⚡ Quick Start Guide

## 🎯 Get CodeIt Running in 5 Minutes

### Step 1: Check Prerequisites
```powershell
node --version  # Should be v18+
npm --version   # Should be 9+
```

### Step 2: Setup Backend
```powershell
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in the required values:
```powershell
Copy-Item .env.example .env
```

**Minimum required in `.env`:**
- `MONGODB_URI` - local MongoDB (`mongodb://127.0.0.1:27017/codeit`) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- `JWT_SECRET` - Any random string (e.g., `my-super-secret-jwt-key-12345`)
- `GEMINI_API_KEY` - Optional, enables the AI Tutor. Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

**Code execution** uses the compilers on your machine (`g++`, `python`, `java`, `node`). Install the ones you need.

**Admin account** (to create problems): `npm run create-admin -- admin@example.com yourpassword`

### Step 3: Setup Frontend
```powershell
cd ../frontend
npm install
```

Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

### Step 4: Start Both Servers

**Terminal 1 (Backend):**
```powershell
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

### Step 5: Open Your Browser
Navigate to: **http://localhost:5173** 🎉

---

## 🔑 Getting API Keys (Free)

### MongoDB Atlas (Required)
1. Visit https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

### Google Gemini API (Required for AI features)
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the API key

### JWT Secret (Required)
Just use any random string, for example:
```
JWT_SECRET=codeit-secret-key-2024-abc123xyz
```

---

## ✅ Verify Setup

- Backend should log: `Server listening on http://localhost:5000` and `Code execution available for: ...`
- `http://localhost:5000/health` shows database / execution / AI status
- Frontend should open at: `http://localhost:5173`
- Try registering a new user
- Try viewing a coding problem

---

## 🚨 Troubleshooting

### "Cannot find module" errors
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Port 5000 already in use
Change `PORT=5000` to `PORT=5001` in backend `.env`
And update frontend `.env` to `VITE_API_BASE_URL=http://localhost:5001`

### MongoDB connection fails
- Check your MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Verify username and password in connection string
- Ensure you replaced `<password>` with actual password

---

**Need detailed setup?** Check `SETUP_GUIDE.md`
