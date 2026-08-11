# TechHub Backend

Node.js + Express + **Prisma (PostgreSQL)** REST API for the TechHub e-commerce app
(products, cart, orders, admin analytics). Consumed by the React frontend in `../Frontend`.

## Tech Stack

- Node.js + Express 5 + TypeScript (run with `tsx`)
- Prisma ORM 7 (`prisma-client` generator → `generated/prisma`) with **PostgreSQL** via `@prisma/adapter-pg`
- JWT (httpOnly cookie auth) + bcrypt password hashing
- express-validator, multer (product image uploads), slugify, dotenv

## Setup & Run

```bash
npm install
npx prisma generate        # after schema changes (client → generated/prisma, gitignored)
npx prisma db push         # sync DB schema (dev; no migrations yet)
npm run seed:admin         # create/update the admin user
npm run dev                # tsx watch app.ts
npm run typecheck          # tsc --noEmit
```

### Environment (`.env`)

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/techhub` |
| `JWT_SECRET_KEY` | JWT signing secret |
| `PORT` | default 3000 |
| `ADMIN_NAME/PHONE/EMAIL/PASSWORD/ADDRESS` | values used by `seed:admin` |

## Architecture

```
app.ts                      Express app, static /api/uploads, route mounting
prisma/schema.prisma        Data models (User, Product, Cart/CartItem, Order/OrderItem)
prisma.config.ts            Prisma CLI config (reads DATABASE_URL)
seedAdmin.ts                Seeds/updates the admin user (Prisma)
src/
  config/prisma.ts          PrismaClient singleton with PrismaPg adapter
  controllers/              users, products (+orders), cart, admin (stats via raw SQL)
  middlewares/              auth, adminAuth (JWT), multer (uploads)
  routes/                   users, products, cart, order, admin
  types/express.d.ts        AuthUser type on req.user
  uploads/                  uploaded product images (served at /api/uploads)
```

## API Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/users/register` | – | name, phone, email, password, address |
| POST | `/api/users/login` | – | sets `token` cookie |
| POST | `/api/users/admin-login` | – | requires role `admin` |
| GET/PUT | `/api/users/profile` | user | profile read/update |
| POST | `/api/users/logout` | user | clears cookie |
| GET | `/api/products` | – | `?search=` (name/category/type) |
| POST | `/api/products` | admin | multipart, `image` optional |
| GET | `/api/products/suggestions` | – | `?q=` → name suggestions |
| GET | `/api/products/:slug-:id` | – | single product |
| PUT/DELETE | `/api/products/:id` | admin | delete cascades cart items, nulls order items |
| GET | `/api/products/category/:category` | – | |
| GET | `/api/cart` | user | |
| POST | `/api/cart/add` | user | `{ productId }` (increments qty if present) |
| PATCH | `/api/cart/update` | user | `{ productId, quantity }` (0 removes) |
| DELETE | `/api/cart/remove/:productId` | user | |
| DELETE | `/api/cart/clear` | user | |
| POST/GET | `/api/orders` | user | create order / list own orders (admin: all) |
| GET | `/api/orders/:id` | user | |
| PUT | `/api/orders/:id` | admin | `{ orderStatus?, paymentStatus? }` |
| GET | `/api/admin/stats` | admin | `?days=7\|30\|90` (default 30) |
| GET | `/api/admin/users` | admin | customers + orderCount/totalSpent |

Auth: JWT in httpOnly cookie (`token`) or `Authorization: Bearer <token>`.

## Database Schema Notes

- `User.role` is a String with default `"user"` (values `user`/`admin`)
- `OrderItem.productId` is nullable (`onDelete: SetNull`) — deleting a product keeps order
  history (stats show "Deleted product")
- `CartItem` cascades when a product or cart is deleted; `Cart.userId` is unique (1 cart/user)
- Order/payment statuses are plain strings: `pending|accepted|preparing|on the way|delivered|cancelled`,
  `esewa|khalti|cod`, `paid|unpaid`

## API Compatibility Contract (important)

The frontend expects the old Mongoose shapes. Controllers keep this by:
- returning `_id` (stringified numeric `id`) alongside `id`
- populating `userId` and `order/cart item.productId` as objects
- order `_id` is a string (frontend does `_id.slice(-8)` for display)

## Uploads

Multer writes to `src/uploads/` (shared `uploadDir` export in `src/middlewares/multer.ts`).
`app.ts` serves them at `/api/uploads` from the same dir. DB stores `/uploads/<file>`; the
frontend prefixes the API base.

## Admin Analytics

- `GET /api/admin/stats?days=N` returns `salesByDay` (N daily points, non-cancelled orders)
  and `previousPeriodRevenue` (same window before, for trend comparison)
- Frontend `components/admin/RevenueChart.tsx` renders a dependency-free SVG area/line
  chart with hover tooltips; `AdminDashboard.tsx` has 7D/30D/90D toggle + trend badge

---

## Work History (this project's migration)

1. **MongoDB → PostgreSQL + Prisma** (full rewrite of `src/`):
   - `prisma/schema.prisma`: all models converted to relational schema
   - All controllers/middlewares rewritten from Mongoose to Prisma Client
   - Admin stats/customers use raw SQL (`$queryRaw`) — per-day sales, top products, customers
   - Deleted Mongoose models, `db.config.ts`, and the `mongoose` dependency;
     removed `DB_CONNECTION_STRING` from `.env`
   - Prisma 7 requires the driver adapter: `new PrismaClient({ adapter: new PrismaPg(...) })`
     (see `src/config/prisma.ts`) — `new PrismaClient()` without an adapter will not work
2. **Image upload fix**: files were written to `src/uploads` but served from the non-existent
   root `uploads/` — now both use the same `uploadDir`
3. **Revenue analytics graph**: backend `days` window + previous-period revenue;
   frontend SVG `RevenueChart` with range toggle and trend badge
4. **Data safety rules**: see `AGENTS.md` — never delete user data; test-data cleanup must be
   scoped to the exact rows the current session created (verify with a `findMany`/`count` first)

## Known Gaps

- No Prisma migrations yet — schema is synced with `prisma db push`
- No automated tests; smoke-tested manually (register/login/products/cart/orders/stats)
