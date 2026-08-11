import express from "express";
import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/products.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminAuthMiddleware from "../middlewares/adminAuth.middleware";

const router: Router = express.Router();

router.route("/").post(authMiddleware, createOrder).get(authMiddleware, getOrders);
router.route("/:id").get(authMiddleware, getOrderById).put(adminAuthMiddleware, updateOrderStatus);

export default router;
