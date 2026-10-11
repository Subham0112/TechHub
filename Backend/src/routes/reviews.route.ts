import express from "express";
import { Router } from "express";
import {
  getProductReviews,
  getSiteReviews,
  createReview,
  getReviews,
  updateReviewStatus,
  deleteReview,
} from "../controllers/reviews.controller";
import authMiddleware from "../middlewares/auth.middleware";
import optionalAuthMiddleware from "../middlewares/optionalAuth.middleware";
import adminAuthMiddleware from "../middlewares/adminAuth.middleware";

const router: Router = express.Router();

router.get("/product/:productId", optionalAuthMiddleware, getProductReviews);
router.get("/site", optionalAuthMiddleware, getSiteReviews);
router.post("/", authMiddleware, createReview);
router.get("/", adminAuthMiddleware, getReviews);
router.patch("/:id", adminAuthMiddleware, updateReviewStatus);
router.delete("/:id", adminAuthMiddleware, deleteReview);

export default router;
