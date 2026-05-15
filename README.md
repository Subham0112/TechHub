# TechHub

TechHub is a full-stack e-commerce application designed for selling gadgets and mobile accessories. It combines a React + Vite frontend with a Node.js + Express backend and MongoDB data storage.

## Project Overview

The application supports:
- User registration, login, logout, and profile retrieval
- Browsing products by category
- Adding, updating, and removing items from the shopping cart
- Creating and managing orders
- Admin pages for product and order management
- Authenticated API access with JWT + cookies

## Architecture

### Frontend

The frontend is built with:
- React
- Vite
- Tailwind CSS
- React Router Dom
- Axios

It uses context providers for global state:
- `UserContext` handles authentication state, current user profile, and logout behavior
- `CartContext` manages cart contents, quantity updates, and user toast notifications

Routes are defined in `src/App.jsx` and include:
- `/` — Home page
- `/signup` — Signup page
- `/login` — Login page
- `/profile` — User profile page
- `/products/category/:category` — Category-based product listing
- `/cart` — Protected cart page
- `/checkout` — Protected checkout page
- `/manage-products` — Admin-only product management
- `/manage-orders` — Admin-only order management

### Backend

The backend is built with:
- Node.js
- Express
- MongoDB / Mongoose
- JWT for authentication
- bcrypt for password hashing
- cookie-parser for cookie handling
- express-validator for request validation
- CORS with credentials enabled

Key backend structure:
- `app.js` — main server entry point
- `config/db.config.js` — MongoDB connection setup
- `routes/` — API route definitions
- `controllers/` — business logic for users, products, cart, and orders
- `models/` — Mongoose schemas and models
- `middlewares/auth.middleware.js` — protects authenticated routes with JWT

## Folder Structure

```
TechHub/
  Backend/
    app.js
    package.json
    config/
      db.config.js
    controllers/
      cart.controller.js
      products.controller.js
      users.controller.js
    middlewares/
      auth.middleware.js
    models/
      cart.model.js
      productOrder.model.js
      products.model.js
      users.model.js
    routes/
      cart.route.js
      order.route.js
      products.route.js
      users.route.js

  Frontend/
    package.json
    src/
      App.jsx
      main.jsx
      index.css
      components/
        Navbar.jsx
        Homepage.jsx
        Footer.jsx
        Alert.jsx
        CartToast.jsx
        ScrollToTop.jsx
        Auth/ProtectedRoute.jsx
        Auth/AdminRoute.jsx
        context/CartContext.jsx
        context/UserContext.jsx
        pages/
          Cart.jsx
          CheckoutPage.jsx
          Login.jsx
          Signup.jsx
          ProfilePage.jsx
          ProductCategoryPage.jsx
          ProductManage.jsx
          ManageOrders.jsx
```

## API Endpoints

### User routes
- `POST /api/users/register` — Register new user
- `POST /api/users/login` — Login
- `GET /api/users/profile` — Get authenticated user profile
- `POST /api/users/logout` — Logout current user

### Product routes
- `GET /api/products` — Fetch all products
- `POST /api/products` — Create a new product
- `GET /api/products/:slug-:id` — Get product details by slug and ID
- `PUT /api/products/:id` — Update a product
- `GET /api/products/category/:category` — Get products by category

### Cart routes
- `GET /api/cart` — Get current user cart
- `POST /api/cart/add` — Add item to cart
- `PATCH /api/cart/update` — Update cart item quantity
- `DELETE /api/cart/remove/:productId` — Remove an item from cart

### Order routes
- `POST /api/orders` — Create a new order
- `GET /api/orders` — Get orders for current user
- `GET /api/orders/:id` — Get order details by ID
- `PUT /api/orders/:id` — Update order status

## Key Features

- Responsive product listing and category browsing
- Card-based UI for product display and product details
- Auth-protected pages for cart and checkout
- Admin routes for product and order management
- Context-driven state for user and cart data
- Smooth page transitions and visual feedback via alerts/toasts

## Setup Instructions

### Backend

1. Open terminal in `Backend/`
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with values such as:

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET_KEY=<your_jwt_secret>
PORT=3000
```

4. Start the server:

```bash
node app.js
```

If using `nodemon`, install it globally or run:

```bash
npx nodemon app.js
```

### Frontend

1. Open terminal in `Frontend/`
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the API URL:

```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the frontend app:

```bash
npm run dev
```

## Notes

- The frontend uses `axios` with `withCredentials` enabled so authentication cookies are sent to the backend.
- The auth middleware checks both `Authorization` headers and cookies to support flexible login flows.
- Product category filtering is implemented using the backend route `GET /api/products/category/:category`.
- Admin-only pages are protected on the frontend via `AdminRoute`, while authenticated user routes use `ProtectedRoute`.

## Summary

TechHub is a complete e-commerce stack that connects React UI, client state management, and a secure Express API backed by MongoDB. It is ideal for learning full-stack patterns such as authentication, cart management, REST APIs, and admin workflows.
