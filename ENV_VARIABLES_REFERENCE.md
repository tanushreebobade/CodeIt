# 🔑 Environment Variables Quick Reference

## For Project Owner/Maintainer

---

## 🖥️ Backend (Render) Environment Variables

Copy and paste these into Render's Environment Variables section:

```env
PORT=5000
NODE_ENV=production
DB_CONNECT_STRING=mongodb+srv://<username>:<password>@cluster.mongodb.net/codeit?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-change-this
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=https://code-it-u5da.vercel.app
```

### ⚠️ IMPORTANT: Replace These Values

1. **DB_CONNECT_STRING**: Your MongoDB Atlas connection string
   - Get from: https://cloud.mongodb.com
   - Navigate: Database → Connect → Connect your application
   
2. **JWT_SECRET**: Generate a secure random string
   - Run this in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Or use any secure random string (min 32 characters)

3. **GEMINI_API_KEY**: Your Google Gemini API key
   - Get from: https://makersuite.google.com/app/apikey

4. **FRONTEND_URL**: Your Vercel deployment URL
   - Update with your actual Vercel URL
   - Currently: `https://code-it-u5da.vercel.app`

---

## 🌐 Frontend (Vercel) Environment Variable

Add this in Vercel's Environment Variables section:

```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com
```

### ⚠️ IMPORTANT: Replace This Value

- **VITE_API_BASE_URL**: Your Render backend URL
  - Get this after deploying backend to Render
  - Format: `https://your-app-name.onrender.com`
  - Example: `https://codeit-backend.onrender.com`

---

## 📝 Step-by-Step for Render

1. Go to: https://dashboard.render.com
2. Select your backend service
3. Click "Environment" tab
4. For each variable above:
   - Click "Add Environment Variable"
   - Enter Key (e.g., `PORT`)
   - Enter Value (e.g., `5000`)
   - Click "Save"
5. Click "Save Changes" at the bottom
6. Service will automatically redeploy

---

## 📝 Step-by-Step for Vercel

1. Go to: https://vercel.com/dashboard
2. Select your frontend project
3. Go to "Settings" → "Environment Variables"
4. Add variable:
   - Key: `VITE_API_BASE_URL`
   - Value: Your Render backend URL
   - Environment: Select "Production", "Preview", and "Development"
5. Click "Save"
6. Go to "Deployments" tab
7. Click "Redeploy" on the latest deployment

---

## 🔄 Deployment Order

1. **First**: Deploy Backend to Render
   - Use temporary `FRONTEND_URL` (can be updated later)
   - Note the backend URL you get

2. **Second**: Deploy Frontend to Vercel
   - Use the backend URL from step 1
   - Note the frontend URL you get

3. **Finally**: Update Backend on Render
   - Update `FRONTEND_URL` with the Vercel URL from step 2
   - Save changes (auto-redeploys)

---

## ⚠️ Common Mistakes to Avoid

1. ❌ Using `MONGODB_URI` → ✅ Use `DB_CONNECT_STRING`
2. ❌ Forgetting to replace `<password>` in MongoDB connection string
3. ❌ Using `http://` → ✅ Use `https://` for production URLs
4. ❌ Adding trailing slash to URLs → ✅ No trailing slash
5. ❌ Not updating `FRONTEND_URL` after deploying frontend

---

## 🧪 Testing Your Deployment

After setting up all environment variables:

1. **Check Backend Health**:
   - Visit: `https://your-backend-url.onrender.com`
   - Should show some response (not error)

2. **Check Frontend**:
   - Visit: `https://your-frontend-url.vercel.app`
   - Should load the homepage

3. **Test Full Flow**:
   - Register a new user
   - Login
   - View problems
   - Submit a solution

---

## 📞 If Something Goes Wrong

### Backend Issues
- Check Render logs: Dashboard → Your Service → Logs
- Look for MongoDB connection errors
- Verify all environment variables are set

### Frontend Issues
- Check Vercel deployment logs
- Open browser console (F12)
- Look for API connection errors
- Verify `VITE_API_BASE_URL` is correct

### CORS Errors
- Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
- No trailing slashes
- Use `https://` not `http://`

---

## 🎯 Quick Checklist

### Before Deploying Backend:
- [ ] MongoDB Atlas cluster created
- [ ] Database connection string ready
- [ ] JWT secret generated
- [ ] Gemini API key obtained

### Before Deploying Frontend:
- [ ] Backend deployed and URL noted
- [ ] Backend URL ready to add to Vercel

### After Both Deployed:
- [ ] Frontend URL added to backend `FRONTEND_URL`
- [ ] Backend redeployed
- [ ] Tested registration and login
- [ ] Tested viewing problems
- [ ] AI features tested (if Gemini key added)

---

**Need more help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
