# 📘 EduQueryGen

EduQueryGen is an AI-powered quiz question generator for educators.  
It allows teachers to **upload PDF chapters** and automatically generates **MCQs and True/False questions** using Google Gemini API.  

## 🚀 Features
- 📂 Upload chapter PDFs  
- 🧠 Extracts **keywords & concepts** using Gemini  
- ❓ Generates **MCQs & True/False questions** from chapter  
- 🎚️ Control **number of questions & difficulty**  
- 🎨 Clean frontend built with **React + Tailwind**  
- ⚡ Backend powered by **Express (Node.js + TypeScript)**  
- 🔑 Secure **API key handling via `.env`**  

---

## 📂 Project Structure

EduQueryGen/
├── client/              # React frontend (with Tailwind)
│   ├── src/
│   └── package.json
│
├── server/              # Express backend
│   ├── routes.ts
│   ├── services/
│   │   └── gemini.ts
│   └── index.ts
│
├── package.json         # Root package.json (backend + scripts)
├── .env                 # Environment variables (API keys)
├── README.md


---

## ⚙️ Installation & Setup


git clone https://github.com/your-username/EduQueryGen.git
cd EduQueryGen

## Install root dependencies (if any)
npm install

## Install client dependencies
cd client
npm install

## Install server dependencies
cd ../server
npm install

## Start backend (inside server folder)
npm run dev

## Start frontend (inside client folder)
npm start


