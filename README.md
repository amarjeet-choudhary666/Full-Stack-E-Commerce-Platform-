#  E-Commerce Platform

A full-stack e-commerce platform built with modern technologies, featuring a comprehensive backend API and a responsive frontend application.

## 🏗️ Architecture

This project consists of two main components:

- **Backend**: Node.js/Express API with TypeScript and MongoDB
- **Frontend**: React application with TypeScript and Tailwind CSS

## 📁 Project Structure

```
E-Commerce/
├── backend/                 # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   ├── db/             # Database configuration
│   │   ├── app.ts          # Express app setup
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md           # Backend-specific documentation
├── frontend/                # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context providers
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # App entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md           # Frontend-specific documentation
└── ADMIN_FORMS_GUIDE.md    # Admin forms documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BharatCDX
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run seed  # Seed database with sample data
npm run dev   # Start development server on port 8000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev   # Start development server on port 5173
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

## ✨ Features

### Customer Features
- 🔐 User authentication and registration
- 🛍️ Product browsing with advanced filtering
- 🛒 Shopping cart and wishlist
- 📦 Order management and tracking
- 📍 Multiple address management
- ⭐ Product reviews and ratings
- 📱 Responsive design for all devices

### Admin Features
- 📊 Dashboard with analytics and insights
- 📦 Product and category management
- 👥 Customer management
- 📋 Order processing and status updates
- 🎫 Coupon and discount management
- 📈 Sales reporting

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context + React Query
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Build Tool**: Vite

## 📚 Documentation

- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Admin Forms Guide](./ADMIN_FORMS_GUIDE.md)

## 🔧 Development

### Available Scripts

#### Backend
```bash
cd backend
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run seed     # Seed database
```

#### Frontend
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment Variables

#### Backend (.env)
```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce_platform
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/v1/api
VITE_APP_NAME=ShopEase
VITE_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the individual README files for details.
