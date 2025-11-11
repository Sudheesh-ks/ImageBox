# 🖼️ ImageBox

**ImageBox** is a full-stack web application that allows users to upload, manage, and share their images easily and securely.  
It provides authentication, and cloud-based storage — all inside a modern and responsive UI.

---

## 🚀 Features

- 🔐 **User Authentication** – Register and log in securely using JWT-based access tokens.
- ☁️ **Cloud Image Uploads** – Images are stored on **Cloudinary** for fast and reliable access.
- 🗂️ **Image Management** – Upload, view, and delete images from your personal dashboard.
- 🧠 **Repository Pattern Architecture** – Clean and modular backend structure for better scalability.

---

## 🧰 Tech Stack

### Frontend
- **React + TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **Axios**

### Backend
- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose**
- **Cloudinary**
- **Nodemailer**
- **JWT Authentication**

---

## 🏗️ Architecture Overview

The backend follows a **Repository Pattern**, organizing code into:
- **Controllers** – Handle requests and responses.
- **Services** – Contain business logic.
- **Repositories** – Interact with the database.

This keeps the codebase **clean, modular, and easy to maintain**.

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Sudheesh-ks/ImageBox.git
cd ImageBox

Install Dependencies
For backend:
cd backend
npm install

For frontend:
cd ../frontend
npm install

Add Environment Variables

Create a .env file inside the backend folder:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173

4. Run the App
Start backend:
npm run dev

Start frontend:
npm run dev
