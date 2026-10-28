import express, { NextFunction, Request, Response } from "express";
import multer from "multer";
import UserRoutes from "./src/routes/users.route";
import ProductRoutes from "./src/routes/products.route";
import CartRoutes from "./src/routes/cart.route";
import OrderRoutes from "./src/routes/order.route";
import AdminRoutes from "./src/routes/admin.route";
import OfferRoutes from "./src/routes/offers.route";
import ReviewRoutes from "./src/routes/reviews.route";
import ContactRoutes from "./src/routes/contact.route";
import CategoryRoutes from "./src/routes/categories.route";
import cookieParser from "cookie-parser";
import cors from "cors";
import { uploadDir } from "./src/middlewares/multer";

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/uploads", express.static(uploadDir));

app.use("/api/users", UserRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/offers", OfferRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/contact", ContactRoutes);
app.use("/api/categories", CategoryRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError || err.message?.includes("Only image files")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

app.get("/", (req: Request, res: Response) => {
  res.send("This is TechHub: An ecommerce website for gadgets and mobile accessories.");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
