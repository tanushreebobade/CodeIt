# ✅ CodeIt Setup Checklist

Use this checklist to complete your setup!

## Installation Status

✅ **Dependencies Installed**
- [x] Backend dependencies (172 packages)
- [x] Frontend dependencies (221 packages)
- [x] Environment files created

## Configuration Needed

### 🔴 CRITICAL - Required to Run

- [ ] **MongoDB Connection** (MONGODB_URI in backend/.env)
  - Sign up at: https://www.mongodb.com/cloud/atlas
  - Create a free cluster
  - Get connection string
  - Update `backend/.env` line 6

- [ ] **Gemini API Key** (GEMINI_API_KEY in backend/.env)
  - Visit: https://makersuite.google.com/app/apikey
  - Create API key
  - Update `backend/.env` line 14

### 🟡 OPTIONAL - Enhanced Features

- [ ] **Google OAuth** (for social login)
  - Console: https://console.cloud.google.com/
  - Uncomment and fill OAuth lines in `backend/.env`

- [ ] **JDoodle API** (for code execution)
  - Sign up: https://www.jdoodle.com/compiler-api
  - Uncomment and fill JDoodle lines in `backend/.env`

- [ ] **Cloudinary** (for video uploads)
  - Sign up: https://cloudinary.com/
  - Uncomment and fill Cloudinary lines in `backend/.env`

- [ ] **Redis** (for caching)
  - Install Redis for Windows
  - Uncomment and configure Redis lines in `backend/.env`

## Running the Application

### After Configuration:

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\namas\Downloads\CodeIt-main\CodeIt-main\backend"
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\namas\Downloads\CodeIt-main\CodeIt-main\frontend"
npm run dev
```

## Testing Checklist

- [ ] Backend starts without errors (port 5000)
- [ ] Frontend starts without errors (port 5173)
- [ ] Can access http://localhost:5173 in browser
- [ ] Can register a new user
- [ ] Can log in
- [ ] Can view problems list
- [ ] AI tutor works (requires Gemini API key)

## Next Steps

- [ ] Read the codebase structure
- [ ] Check existing issues on GitHub
- [ ] Set up Git remote to the repository
- [ ] Create a feature branch for your work
- [ ] Review contribution guidelines

## Helpful Commands

### Check what's running on a port:
```powershell
netstat -ano | findstr :5000
```

### Kill a process by PID:
```powershell
taskkill /PID <PID> /F
```

### Clear npm cache if issues:
```powershell
npm cache clean --force
```

### Fix vulnerabilities (optional):
```powershell
npm audit fix
```

## Project Files Created for You

- ✅ `SETUP_GUIDE.md` - Detailed setup instructions
- ✅ `QUICKSTART.md` - 5-minute quick start
- ✅ `SETUP_CHECKLIST.md` - This file
- ✅ `backend/.env` - Backend configuration (needs your API keys)
- ✅ `frontend/.env` - Frontend configuration (ready to use)
- ✅ `backend/.env.example` - Template for reference
- ✅ `frontend/.env.example` - Template for reference

## Current Status

**Location:** `c:\Users\namas\Downloads\CodeIt-main\CodeIt-main`

**What's Done:**
- ✅ Node.js v22.15.1 detected
- ✅ npm v10.9.2 detected
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ✅ Environment files created

**What You Need to Do:**
1. Get MongoDB Atlas connection string
2. Get Google Gemini API key
3. Update `backend/.env` with these values
4. Run both servers
5. Start coding! 🚀

---

**Need Help?** Check the other guide files or open an issue on GitHub!
