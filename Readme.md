# StreamTube 🎥

A **backend video streaming platform** built with **Node.js, Express.js, MongoDB, and JWT authentication**, featuring modular controllers, RESTful APIs, and media handling with **Cloudinary**. The frontend will be built using **Next.js and React**.

---

## 🚀 Features
- 🔐 Authentication & Authorization with JWT  
- 🎬 Video upload, streaming, likes, and comments  
- 📂 Playlists, subscriptions, and dashboard management  
- ☁️ Cloudinary integration for secure media storage  
- 🧩 Modular controllers, models, and middlewares for scalability  
- ⚡ Postman API collection available for testing  

---

## 🛠 Tech Stack
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, Cloudinary  
**Frontend (in progress):** Next.js, React, Tailwind CSS  
**API Testing:** Postman  

---

## 📂 Project Structure
BACKENDCOCPROJECT/
│
├── public/ # Static files
│ └── temp/ # Temporary uploads
│
├── src/
│ ├── controllers/ # Route controllers (video, user, comment, etc.)
│ ├── db/ # Database connection
│ ├── middlewares/ # Auth & file upload middlewares
│ ├── models/ # Mongoose models
│ ├── routes/ # API route definitions
│ ├── utils/ # Utility helpers (Cloudinary, error handlers)
│ ├── app.js # Express app config
│ ├── constants.js # Constants
│ └── index.js # Entry point
│
├── .env # Environment variables
├── .gitignore
├── .prettierignore
└── package.json

## ⚡ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/SatvikSarthak/streamtube.git
cd BACKENDCOCPROJECT
2. Install dependencies
bash
Copy code
npm install
3. Setup environment variables
Create a .env file in the root:

# Server Configuration
PORT=8000
CORS_ORIGIN=*

# Database
MONGO_URI=your_mongodb_connection_string

# JWT / Authentication
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
4. Run the development server
npm run dev
📖 API Documentation
All API endpoints are available in the Postman collection:
👉 Postman Collection Link


📌 Roadmap
 Backend API with controllers & models

 Cloudinary integration for media uploads

 Next.js frontend with video player

 Likes, comments, and playlist UI

 User dashboard and analytics

