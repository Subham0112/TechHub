# TechHub Backend

The TechHub Backend is a Node.js + Express API service that supports user authentication, product management, cart operations, and order management.

## Overview

This backend provides the server-side logic and database access for the TechHub e-commerce app. It exposes REST API endpoints consumed by the React frontend.

## Technology Stack

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- express-validator for request validation
- cookie-parser for parsing cookies
- cors for cross-origin requests

## Architecture

### Entry Point
- `app.js` — configures Express, connects to MongoDB, enables middleware, and mounts routes.

### Configuration
- `config/db.config.js` — contains MongoDB connection logic.

### Routes
- `routes/users.route.js` — user registration, login, profile, and logout
- `routes/products.route.js` — product listing, create, update, and category filtering
- `routes/cart.route.js` — cart CRUD operations
- `routes/order.route.js` — order creation and retrieval

### Controllers
- `controllers/users.controller.js` — authentication and profile management
- `controllers/products.controller.js` — product and order business logic
- `controllers/cart.controller.js` — add/update/remove items from cart

### Models
- `models/users.model.js` — user schema and fields
- `models/products.model.js` — product schema
- `models/cart.model.js` — cart item schema
- `models/productOrder.model.js` — order schema

### Middleware
- `middlewares/auth.middleware.js` — protects routes by verifying JWTs from cookies or `Authorization` headers.

## API Endpoints

### Users
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/profile`
- `POST /api/users/logout`

### Products
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:slug-:id`
- `PUT /api/products/:id`
- `GET /api/products/category/:category`

### Cart
- `GET /api/cart`
- `POST /api/cart/add`
- `PATCH /api/cart/update`
- `DELETE /api/cart/remove/:productId`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with values such as:

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET_KEY=<your_jwt_secret>
PORT=3000
```

3. Start the server:

```bash
node app.js
```

Or use nodemon during development:

```bash
npx nodemon app.js
```

## Notes

- CORS is enabled with credentials, so the frontend can send authenticated requests.
- Authentication is enforced on cart, order, and profile endpoints.
- The backend is the primary data source for product listing, cart state, and order processing.
