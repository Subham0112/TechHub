import express, { NextFunction, Request, Response } from "express";
import multer from "multer";
import UserRoutes from "./src/routes/users.route";
import ProductRoutes from "./src/routes/products.route";
import CartRoutes from "./src/routes/cart.route";
import OrderRoutes from "./src/routes/order.route";
import AdminRoutes from "./src/routes/admin.route";
import cookieParser from "cookie-parser";
import cors from "cors";
import { uploadDir } from "./src/middlewares/multer";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/uploads", express.static(uploadDir));

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
