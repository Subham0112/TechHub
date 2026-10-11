import { Router } from "express";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categories.controller";
import adminAuthMiddleware from "../middlewares/adminAuth.middleware";

const router: Router = Router();

router.get("/", getCategories);
router.post("/", adminAuthMiddleware, createCategory);
router.delete("/:id", adminAuthMiddleware, deleteCategory);

export default router;
