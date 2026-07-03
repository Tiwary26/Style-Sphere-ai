# StyleSphere AI – Smart Virtual Wardrobe & Fashion Assistant

StyleSphere AI is a production-ready, full-stack MERN application that solves the real-world problem of wardrobe management. It enables users to digitize their closet, organize garments, receive weather-informed outfit recommendations, schedule laundry cycles, track closet value and Cost-Per-Wear analytics, pack for trips, and share style inspirations with a community feed.

This project features a glassmorphic dashboard interface, responsive styling, and an AI Stylist assistant integrated with the **Google Gemini API** (using `@google/generative-ai`) and keyless live weather metrics (via **Open-Meteo API**).

---

## 🚀 Key Features

* **Authentication Module:** Complete JWT security, Google Authentication mock, user streak trackers, and milestones badge awards.
* **Wardrobe Manager:** Grid gallery with filters (category, color, season, occasion), QR code generator tags, multiple image uploads, and PDF catalog exports.
* **Outfit Planner & Roulette:** Visual grid creation and an **Outfit Roulette** matching algorithm integrating live weather and user occasion/mood variables.
* **AI Fashion Chatbot:** Stylist consultant utilizing the Google Gemini API (with a robust rule-based complementary color coordination fallback).
* **Laundry Workflow Tracker:** Visual board columns showing clean/dirty states (Dirty ➔ Washing ➔ Drying ➔ Ironing ➔ Clean) with Socket.IO notifications.
* **Travel Packing Assistant:** Automatically generates packing check-sheets based on trip parameters and links them back to clean items in your closet.
* **Budget & Wishlist:** Budget trackers with shopping lists and price valuation summaries.
* **Closet Analytics:** Detailed charts demonstrating category layouts, color radar plots, and **Cost-Per-Wear** (Price / times worn) metrics.
* **Community Feed:** Instagram-style sharing feed with comments, likes, and taggings.
* **Admin Dashboard Panel:** Operational panel for auditing user registries and global system aggregates.

---

## 🛠️ Technology Stack

* **Frontend:** React.js (Vite), Tailwind CSS, React Router, Axios, Context API, Framer Motion, Chart.js, Socket.IO Client, React Toastify, QrCode.react, jsPDF.
* **Backend:** Node.js, Express.js, Socket.IO, Mongoose, Multer, Cloudinary, `@google/generative-ai`.
* **Database:** MongoDB (MongoDB Atlas ready).

---

## 📂 Project Architecture

```text
style-sphere-ai/
├── client/              # React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/  # Navigation, Cards, Skeletons
│   │   ├── context/     # Auth, Theme, Socket.IO
│   │   ├── layouts/     # Protected layout frames
│   │   ├── pages/       # Dashboard, Wardrobe, AI Stylist, etc.
│   │   ├── services/    # Axios instance configurator
│   │   └── App.jsx      # Router mount
└── server/              # Express Backend Engine
    ├── src/
    │   ├── config/      # DB, Cloudinary connection
    │   ├── controllers/ # REST controllers
    │   ├── models/      # Mongoose schemas
    │   ├── routes/      # Endpoint routers
    │   └── services/    # Gemini AI, weather mapping, Socket.IO
    └── server.js        # Main entry point
```

---

## ⚙️ Quick Start Setup

### Prerequisites
* Node.js (v18+)
* MongoDB (Atlas account or local installation)

### 1. Configuration Setup
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/stylesphere
JWT_SECRET=supersecretkeyforstylesphereai12345
JWT_EXPIRE=7d

# Gemini API configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary credentials (optional, falls back to local storage)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NODE_ENV=development
```

### 2. Seeding Sample Data
Run the database seed script to populate a default user (`alex@stylesphere.com` / `password123`) and 8 wardrobe items:
```bash
# In server/ directory
node src/utils/seed.js
```

### 3. Launch the Backend Server
```bash
# In server/ directory
npm run dev
```
The server will boot on `http://localhost:5000`.

### 4. Launch the Frontend
```bash
# In client/ directory
npm run dev
```
Vite will serve the client on `http://localhost:3000`. Open it in your browser, log in with `alex@stylesphere.com` / `password123` and explore!
