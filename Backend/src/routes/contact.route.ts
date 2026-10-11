import { Router } from "express";
import {
  createContactMessage,
  getContactMessages,
  markContactMessage,
  deleteContactMessage,
} from "../controllers/contact.controller";
import adminAuthMiddleware from "../middlewares/adminAuth.middleware";

const router: Router = Router();

router.post("/", createContactMessage);
router.get("/", adminAuthMiddleware, getContactMessages);
router.patch("/:id/read", adminAuthMiddleware, markContactMessage);
router.delete("/:id", adminAuthMiddleware, deleteContactMessage);

export default router;
