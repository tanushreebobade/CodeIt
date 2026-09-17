# CodeIt 🚀

> AI-powered coding platform for DSA practice preparation.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://code-it-u5da.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge\&logo=github)](https://github.com/tanushreebobade/CodeIt)

---

## 📌 Overview

**CodeIt** is a full-stack coding platform designed to help developers practice Data Structures & Algorithms and prepare for technical interviews.

It combines an interactive coding environment with **AI-powered assistance and video-based solutions** to provide a complete learning experience.

---

## ✨ Key Features

### 💻 Online Coding Environment

* In-browser code editor
* Run and submit solutions
* Multiple programming language support
* Real-time coding experience

### 🧩 DSA Problem Practice

* Curated coding problems
* Easy, Medium & Hard difficulty levels
* Topic-based problem organization
* Interview-focused practice

### 🎥 Video Solutions

* Video explanations for coding problems
* Step-by-step solution walkthroughs
* Approach and intuition
* Helpful for learning and revision

### 🤖 AI Tutor

* Problem explanation
* Intelligent hints
* Approach guidance
* Code debugging
* Complexity analysis
* AI-powered learning assistance

### 🔐 Authentication

* User registration and login
* OAuth authentication
* Protected user functionality
* Secure API communication

### 📊 Progress Tracking

* Problem-solving history
* Practice progress
* Difficulty-based tracking
* Consistent coding practice

---

## 🏗️ Architecture

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │    Frontend      │
                 │  React + Vite    │
                 └────────┬─────────┘
                          │
                       REST API
                          │
                          ▼
                 ┌──────────────────┐
                 │     Backend      │
                 │ Node.js + Express│
                 └───────┬────┬─────┘
                         │    │
              ┌──────────┘    └──────────┐
              ▼                          ▼
       ┌──────────────┐          ┌──────────────┐
       │   MongoDB    │          │  Gemini AI   │
       └──────────────┘          └──────────────┘
```

---

## 🛠️ Tech Stack

**Frontend**

* React
* Vite
* Tailwind CSS
* JavaScript

**Backend**

* Node.js
* Express.js
* REST API

**Database**

* MongoDB
* MongoDB Atlas

**AI & Authentication**

* Google Gemini API
* OAuth

**Tools & Deployment**

* Git
* GitHub
* Vercel
* Postman
* VS Code

---

## 📂 Project Structure

```text
CodeIt/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/        # env, database, seeds
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/  # MongoDB with JSON-file fallback
│   │   ├── routes/
│   │   ├── services/      # auth, execution engine, submissions, leaderboard
│   │   └── index.js
│   ├── scripts/createAdmin.js
│   └── data/              # local JSON fallback store
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 📚 Setup Documentation

We have comprehensive setup guides for different needs:

- **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed local development setup
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step checklist
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[ENV_VARIABLES_REFERENCE.md](./ENV_VARIABLES_REFERENCE.md)** - Environment variables quick reference

### Prerequisites

* Node.js (v18 or higher)
* npm
* MongoDB / MongoDB Atlas
* Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/tanushreebobade/CodeIt.git
cd CodeIt

# Backend setup
cd backend
npm install
# Configure .env file (see SETUP_GUIDE.md)
npm run dev

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

**For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/codeit   # or your MongoDB Atlas URI
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key             # optional, enables the AI Tutor
FRONTEND_URL=http://localhost:5173
```

Optional: `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` (OAuth), `REDIS_HOST` (token revocation),
`ONLINE_COMPILER_API_KEY` (remote execution fallback), `FREE_RUN_ATTEMPTS` / `FREE_SUBMIT_ATTEMPTS`.

If MongoDB is unreachable the backend automatically falls back to a JSON store in `backend/data/`.

For the frontend (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:5000
```

> Never commit API keys, database credentials, or `.env` files to GitHub.

---

## ⚙️ Code Execution

Submissions run with the compilers installed on the server: `g++` (C++), `python`, `javac`/`java` and `node`.
Install whichever you want to support and they are detected automatically (see `GET /health`).
Problems use LeetCode-style `class Solution` templates; the execution drivers parse stdin into the
method arguments and print the return value, so users only implement the method.

---

## 🛡️ Creating an Admin

Admins can author problems from **Admin Studio** (`/admin`). Create the first admin with:

```bash
cd backend
npm run create-admin -- admin@example.com yourStrongPassword
```

or set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env` and the account is created on startup.

---

## 🌍 Deployment

* **Frontend:** Vercel
* **Database:** MongoDB Atlas
* **Backend:** Render 

🌐 **Live Application:** https://code-it-u5da.vercel.app/

---

## 🔮 Future Enhancements

* Personalized DSA roadmap
* Daily coding streaks
* Coding contests
* Advanced analytics
* Mock interview mode
* Personalized problem recommendations

---

## 👩‍💻 Author

**Tanushree Bobade**

B.Tech Computer Science Engineering

Interested in **Software Engineering, DSA, Full-Stack Development & AI-powered applications.**

**GitHub:** https://github.com/tanushreebobade

---

## ⭐ Support

If you find CodeIt useful, consider giving the repository a ⭐.

<p align="center">
  Built with ❤️ by Tanushree Bobade
</p>
