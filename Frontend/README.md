# TechHub Frontend

The TechHub Frontend is a React + Vite application that delivers the e-commerce user interface for browsing products, managing a cart, and checking out.

## Overview

This frontend app connects to the TechHub backend API, displays products and categories, and manages user interactions such as login, cart updates, and order checkout.

## Technology Stack

- React
- Vite
- Tailwind CSS
- React Router Dom
- Axios

## Application Structure

### Entry Point
- `src/main.jsx` — bootstraps React, wraps the app with `BrowserRouter`, `UserProvider`, and `CartProvider`.

### Main App
- `src/App.jsx` — defines the main routes and renders `Navbar`, `Footer`, and global `Alert`.

### Context Providers
- `src/components/context/UserContext.jsx` — fetches current user, stores auth state, and handles logout.
- `src/components/context/CartContext.jsx` — loads cart items, updates quantities, and triggers toast messages.

### Routes and Pages
- `/` — `Homepage`
- `/signup` — `Signup` page
- `/login` — `Login` page
- `/profile` — `Profile` page
- `/products/category/:category` — `ProductCategoryPage`
- `/cart` — `Cart` page (protected)
- `/checkout` — `CheckoutPage` (protected)
- `/manage-products` — `ProductManage` page (admin only)
- `/manage-orders` — `ManageOrders` page (admin only)

### UI Components
- `Navbar.jsx`
- `Homepage.jsx`
- `Footer.jsx`
- `Alert.jsx`
- `CartToast.jsx`
- `ScrollToTop.jsx`
- `ProtectedRoute.jsx` and `AdminRoute.jsx`

## Key Features

- Category-based product browsing
- Smooth loading and empty-state experiences
- Cart management with add/update/remove actions
- Protected user and admin views
- Centralized alerts and toast notifications

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with the backend API URL:

```env
VITE_API_URL=http://localhost:3000/api
```

3. Start the frontend server:

```bash
npm run dev
```

## Notes

- `axios.defaults.withCredentials = true` is enabled in `UserContext.jsx` so authentication cookies are sent with API requests.
- The frontend relies on the backend for authentication, product data, and cart persistence.
- Admin-only pages are guarded by `AdminRoute` while authenticated user pages use `ProtectedRoute`.
