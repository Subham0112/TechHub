import express from "express";
import { Router } from "express";
import { getStats, getCustomers } from "../controllers/admin.controller";
import adminAuthMiddleware from "../middlewares/adminAuth.middleware";

const router: Router = express.Router();

router.use(adminAuthMiddleware);

router.route("/stats").get(getStats);
router.route("/users").get(getCustomers);

export default router;
