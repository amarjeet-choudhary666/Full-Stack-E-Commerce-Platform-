# ShopEase Frontend

A modern, responsive e-commerce frontend built with React, TypeScript, and Tailwind CSS.

## Features

### 🛍️ **Customer Features**
- **Product Browsing**: Browse products with advanced filtering and search
- **Shopping Cart**: Add, remove, and manage cart items
- **Wishlist**: Save favorite products for later
- **User Authentication**: Secure login/register with email verification
- **Order Management**: Place orders and track order status
- **Address Management**: Multiple shipping addresses
- **Product Reviews**: Rate and review products
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### 👨‍💼 **Admin Features**
- **Dashboard**: Overview of sales, orders, and analytics
- **Product Management**: Add, edit, and manage products
- **Category Management**: Organize products into categories
- **Order Management**: Process and track customer orders
- **Customer Management**: View customer information and orders
- **Analytics**: Sales reports and business insights

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API + React Query
- **Forms**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── layout/       # Layout components (Header, Footer)
│   │   ├── home/         # Home page components
│   │   └── ui/           # Basic UI components (Button, Input, etc.)
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── WishlistContext.tsx
│   ├── lib/              # Utility libraries
│   │   ├── api.ts        # API client and endpoints
│   │   ├── auth.ts       # Authentication utilities
│   │   └── utils.ts      # Helper functions
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   └── Home.tsx      # Home page
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on port 8000

### 1. Clone and Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/v1/api
VITE_APP_NAME=ShopEase
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Features Implementation

### Authentication System
- JWT-based authentication with automatic token refresh
- Protected routes with role-based access control
- Persistent login state with localStorage and cookies
- Email verification and password reset functionality

### Shopping Cart
- Real-time cart updates across the application
- Persistent cart for logged-in users
- Automatic price synchronization
- Stock validation before adding items

### Product Management
- Advanced product filtering and search
- Image galleries with zoom functionality
- Product variants and specifications
- Stock availability indicators

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Optimized for all screen sizes
- Touch-friendly interface for mobile devices
- Progressive Web App (PWA) ready

### Performance Optimizations
- Code splitting with React.lazy()
- Image lazy loading
- API response caching with React Query
- Optimized bundle size with tree shaking

## API Integration

The frontend integrates with the backend API through:

- **Axios HTTP Client**: Configured with interceptors for authentication
- **React Query**: For data fetching, caching, and synchronization
- **Error Handling**: Centralized error handling with toast notifications
- **Loading States**: Loading indicators for better UX

### API Endpoints Used

- **Authentication**: `/users/*` - Login, register, profile management
- **Products**: `/products/*` - Product CRUD operations
- **Categories**: `/categories/*` - Category management
- **Cart**: `/cart/*` - Shopping cart operations
- **Orders**: `/orders/*` - Order management
- **Wishlist**: `/wishlist/*` - Wishlist operations
- **Admin**: `/admin/*` - Admin dashboard and analytics

## State Management

### Context Providers
- **AuthContext**: User authentication state
- **CartContext**: Shopping cart state and operations
- **WishlistContext**: Wishlist state and operations

### React Query
- Server state management
- Automatic background refetching
- Optimistic updates
- Error retry logic

## Styling & UI

### Tailwind CSS
- Utility-first CSS framework
- Custom design system with consistent spacing and colors
- Responsive design utilities
- Dark mode support (ready for implementation)

### Component Library
- Reusable UI components (Button, Input, Modal, etc.)
- Consistent design patterns
- Accessibility-compliant components
- Loading states and error handling

## Security Features

- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Token-based authentication
- **Secure Storage**: Sensitive data stored securely
- **Route Protection**: Private routes with authentication checks

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions
- Component composition over inheritance

### Best Practices
- Functional components with hooks
- Custom hooks for reusable logic
- Error boundaries for error handling
- Accessibility considerations (ARIA labels, keyboard navigation)

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
```

## Environment Variables

Required environment variables:

```env
VITE_API_BASE_URL=http://localhost:8000/v1/api  # Backend API URL
VITE_APP_NAME=ShopEase                          # App name
VITE_APP_VERSION=1.0.0                          # App version
```

Optional environment variables:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id     # Google OAuth
VITE_FACEBOOK_APP_ID=your_facebook_app_id       # Facebook OAuth
VITE_GA_TRACKING_ID=your_google_analytics_id    # Google Analytics
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@shopease.com or create an issue in the repository.