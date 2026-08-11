import express, { NextFunction, Request, Response } from "express";
import path from "path";
import multer from "multer";
import UserRoutes from "./routes/users.route";
import ProductRoutes from "./routes/products.route";
import CartRoutes from "./routes/cart.route";
import OrderRoutes from "./routes/order.route";
import AdminRoutes from "./routes/admin.route";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.config";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", UserRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/admin", AdminRoutes);

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
