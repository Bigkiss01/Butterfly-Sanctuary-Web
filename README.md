# Butterfly Sanctuary Web Application

A beautiful, multilingual web application for exploring butterfly species at the Merlin Beach Butterfly Sanctuary. Features an elegant gallery interface, detailed species information, and an admin dashboard for content management.

## ✨ Features

### 🦋 Visitor Features
- **Butterfly Gallery**: Browse beautiful butterfly species with high-quality images
- **Species Details**: View detailed information including scientific names, habitat, wingspan, lifespan, and fun facts
- **Rarity System**: Visual star-based rarity indicators for each species
- **Multi-language Support**: Available in 7 languages (English, Thai, Chinese, Russian, Japanese, Korean, Arabic)
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Dark Mode**: Elegant dark theme for comfortable viewing

### 👨‍💼 Admin Features
- **Admin Dashboard**: Comprehensive management interface
- **Butterfly Management**: Add, edit, and delete butterfly species
- **Image Sorting**: Drag-and-drop image organization
- **Feedback Management**: View and export visitor feedback
- **PDF/Excel Export**: Generate reports in multiple formats
- **User Authentication**: Secure Firebase-based authentication

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage, Hosting)
- **Internationalization**: i18next
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Bigkiss01/Butterfly-Sanctuary-Web.git
cd Butterfly-Sanctuary-Web
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**

Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🗂️ Project Structure

```
butterfly-sanctuary/
├── public/              # Static assets
├── src/
│   ├── admin/          # Admin dashboard components
│   ├── components/     # Shared React components
│   ├── context/        # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── locales/        # Translation files (7 languages)
│   ├── util/           # Utility functions
│   ├── __tests__/      # Unit tests
│   ├── firebase.js     # Firebase configuration
│   └── main.jsx        # Application entry point
├── Sorted_Butterflies/ # Butterfly images organized by species
├── firebase.json       # Firebase hosting config
├── firestore.rules     # Firestore security rules
└── package.json
```

## 🌐 Supported Languages

| Language | Code |
|----------|------|
| English  | en   |
| Thai     | th   |
| Chinese  | zh   |
| Russian  | ru   |
| Japanese | ja   |
| Korean   | ko   |
| Arabic   | ar   |

## 🔒 Security

- Firebase Authentication for admin access
- Firestore security rules for data protection
- Environment variables for sensitive configuration
- No hardcoded API keys in source code

## 🚀 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests once
npm run test:run
```

## 📄 License

This project was developed for the Merlin Beach Butterfly Sanctuary.

---

**Built with ❤️ for butterfly conservation and education**
