<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/819279c5-8ccd-4df0-b25b-53edd8974ebe" />🧾 FileSure Referral System

Hey everyone! 👋
This is my FileSure Assignment Project — a full working referral-based web app where users can register, login, see their dashboard, and share their referral links.
It also includes a simple purchase simulation and credits system.

🚀 Live Links

Frontend (Next.js + Tailwind) → https://file-sure-assignment.vercel.app

Backend (Express + MongoDB) → https://filesure-backend.onrender.com

Health Check API → https://filesure-backend.onrender.com/health

🧠 What this project does

✅ Users can register and login
✅ Each user automatically gets a unique referral code
✅ Users can share their referral link like:

https://file-sure-assignment.vercel.app/register?r=YOUR-CODE


✅ When someone uses your referral link to register, it’s recorded in the system
✅ Dashboard shows:

Referred Users

Converted Users

Credits (Balance)

Credits (Lifetime Earned)

✅ There’s also a “Buy Product” option that simulates a purchase API call and updates your data
✅ Secure backend with JWT authentication
✅ Fully deployed with frontend on Vercel and backend on Render

⚙️ Tech Stack Used
Layer	Technology
Frontend	Next.js 14 + Tailwind CSS + TypeScript
Backend	Node.js + Express + TypeScript
Database	MongoDB Atlas
Authentication	JWT (JSON Web Token)
State Management	Zustand
Deployment	Frontend: Vercel → Backend: Render
💻 How to run locally
1️⃣ Clone the repository
git clone https://github.com/TejasChoukale/FileSure-Assignment.git
cd FileSure-Assignment

2️⃣ Backend setup
cd backend
npm install


Create a .env file inside /backend:

MONGO_URL=your_mongo_connection_string
PORT=5000
JWT_SECRET=supersecretkey_change_me
PUBLIC_APP_URL=http://localhost:3001


Then run it:

npm run dev


Your backend should start on http://localhost:5000

3️⃣ Frontend setup
cd ../frontend
npm install


Create a .env.local file inside /frontend:

NEXT_PUBLIC_API=http://localhost:5000


Then start the frontend:

npm run dev


Visit http://localhost:3001
 to use the app.

🧾 Pages Overview
Page	Description
/	Simple welcome page with login link
/login	User login page
/register?r=CODE	Register page with referral link support
/dashboard	User dashboard showing referral stats and purchase form
🔒 Authentication Flow

On login, a JWT token is generated and stored in Zustand store (frontend).

All API routes that require login are protected using middleware.

The dashboard fetches data using the token in headers:

Authorization: Bearer <token>

🧩 Features Implemented
Feature	Status
Register and Login	✅
Unique Referral Code	✅
Referral Link Tracking	✅
Dashboard Stats	✅
Purchase Simulation	✅
Secure API + JWT	✅
CORS fixed between Render & Vercel	✅
Fully Deployed and Working	✅
🧠 Things I learned

How JWT works for user authentication

Connecting frontend and backend using REST APIs

Handling CORS properly between two different domains (Render + Vercel)

Deploying both parts of a full stack app successfully

Debugging TypeScript issues with environment variables

Using Zustand for simple auth state management

📸 Screenshots :-

<img width="1920" height="1080" alt="Screenshot 2025-11-09 111155" src="https://github.com/user-attachments/assets/4c7fae20-a9c9-4c88-b85b-10576a2ea063" />

🧑‍💻 Author

Tejas Choukale
💡 MERN Stack Developer | Learning & Building | Passionate about full-stack apps

🌟 Summary

So yeah — this was my FileSure Assignment Project.
It’s fully functional, deployed, and tested!
It was a great experience building this step by step and debugging the real-time issues in backend–frontend communication.
All parts now work perfectly fine — including referral registration, dashboard updates, and CORS handling between two platforms.
