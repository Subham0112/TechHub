import express from "express";
import { Router } from "express";
import {
  getOffers,
  getActiveOffers,
  createOffer,
  updateOffer,
  toggleOffer,
  deleteOffer,
} from "../controllers/offers.controller";
import adminAuthMiddleware from "../middlewares/adminAuth.middleware";

const router: Router = express.Router();

router.get("/active", getActiveOffers);
router.get("/", adminAuthMiddleware, getOffers);
router.post("/", adminAuthMiddleware, createOffer);
router.put("/:id", adminAuthMiddleware, updateOffer);
router.patch("/:id/toggle", adminAuthMiddleware, toggleOffer);
router.delete("/:id", adminAuthMiddleware, deleteOffer);

export default router;
