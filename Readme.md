# streamtube 🎥

A **video streaming platform** built with **Node.js, Express.js, MongoDB, and JWT authentication**, featuring modular controllers, RESTful APIs, and media handling with **Cloudinary**. The frontend will be built using **Next.js and React**.

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

```streamtube/
│
├── public/ # Static files
│ └── temp/ # Temporary uploads for files/images
│
├── src/
│ ├── controllers/ # Route controllers (video, user, comment, etc.)
│ ├── db/ # Database connection (like MongoDB config)
│ ├── middlewares/ # Auth, file upload, and other middleware
│ ├── models/ # Mongoose models/schemas
│ ├── routes/ # API route definitions and endpoints
│ ├── utils/ # Utility helpers: Cloudinary, error handlers
│ ├── app.js # Express app configuration
│ ├── constants.js # App-wide constants
│ └── index.js # Entry point for server start
│
├── .env # Environment variables (credentials, config)
├── .gitignore # Files/folders ignored in git
├── .prettierignore # Files/folders ignored for Prettier formatting
└── package.json # Project dependencies and scripts
```
## ⚡ Getting Started

### 1. Clone the repo
git clone https://github.com/SatvikSarthak/streamtube.git
cd streamtube

2. Install dependencies
npm install
3. Setup environment variables
Create a .env file in the root:
```
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
```
4. Run the development server
npm run dev


📖 API Documentation
All API endpoints are available in the Postman collection:
    [Link](https://www.postman.com/satviksarthak17/workspace/satvik-s-project-apis)



📌 Roadmap
 Backend API with controllers & models

 Cloudinary integration for media uploads

 Next.js frontend with video player

 Likes, comments, and playlist UI

 User dashboard and analytics

