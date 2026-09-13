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
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js
* npm
* MongoDB / MongoDB Atlas
* Git

### Clone the Repository

```bash
git clone https://github.com/tanushreebobade/CodeIt.git
cd CodeIt
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file in the backend:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

For the frontend:

```env
VITE_API_BASE_URL=http://localhost:5000
```

> Never commit API keys, database credentials, or `.env` files to GitHub.

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
