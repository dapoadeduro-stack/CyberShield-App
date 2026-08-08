# CyberShield Academy 🛡️

A modern, interactive cybersecurity eLearning platform built with React, TypeScript, Tailwind CSS, and Firebase Firestore/Auth.

## 🌟 Key Features

- **Interactive Courses & Learning Paths**: Level-based cybersecurity modules (100 Level through Professional).
- **Course Search & Filtering**: Instantly search courses by title, category, or description.
- **Interactive Quizzes & Scoring**: Test knowledge after completing modules and earn points for correct answers.
- **Gamified Progress Tracking**: Earn points, track completed modules, and climb the student leaderboard.
- **Comprehensive Admin CMS**:
  - Full CRUD operations for Courses and Modules.
  - Interactive Quiz Builder (add/edit multiple choice questions and answers).
  - User Management (promote users to Admin, change student levels, reset progress).
  - Analytics dashboard (level distribution and student performance rankings).
- **Role Toggle**: Seamlessly switch between Student Mode and Admin Mode for testing and administration.
- **Firebase Authentication & Firestore**: Secure Google Sign-In and persistent real-time database sync.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, Motion (Framer Motion)
- **Routing**: React Router v6
- **Backend & Storage**: Firebase Authentication, Cloud Firestore
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cybershield-academy.git
   cd cybershield-academy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   Ensure `firebase-applet-config.json` is configured with your Firebase project credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 📜 License

MIT License
