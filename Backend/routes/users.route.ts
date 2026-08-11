import express from "express";
import { Router } from "express";
import {
  registerUser,
  loginUser,
  adminLogin,
  getUserProfile,
  updateProfile,
  logoutUser,
} from "../controllers/users.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { body } from "express-validator";

const router: Router = express.Router();

router.route("/register").post(
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("phone").isLength({ min: 10 }).withMessage("Phone number must be at least 10 digits long"),
  ],
  registerUser
);

router.route("/login").post(
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  loginUser
);

router.route("/admin-login").post(
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  adminLogin
);

router.route("/profile").get(authMiddleware, getUserProfile);
router.route("/profile").put(authMiddleware, updateProfile);

router.route("/logout").post(authMiddleware, logoutUser);

export default router;
