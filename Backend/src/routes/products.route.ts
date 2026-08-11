import express from "express";
import { Router } from "express";
import {
  getAllProducts,
  createProduct,
  getProductSuggestions,
  getProductById,
  updateProduct,
  getProductsByCategory,
  deleteProduct,
} from "../controllers/products.controller";
import upload from "../middlewares/multer";
import adminAuthMiddleware from "../middlewares/adminAuth.middleware";
import { body } from "express-validator";

const router: Router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(
    adminAuthMiddleware,
    upload.single("image"),
    [
      body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
      body("price").isNumeric().withMessage("Price must be a number"),
      body("description").isLength({ min: 10 }).withMessage("Description must be at least 10 characters long"),
      body("category").isIn(["mobile-accessories", "gadgets"]).withMessage("Invalid category"),
      body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
    ],
    createProduct
  );

router.route("/:slug-:id").get(getProductById);

router
  .route("/:id")
  .put(
    adminAuthMiddleware,
    upload.single("image"),
    [
      body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
      body("price").isNumeric().withMessage("Price must be a number"),
      body("description").isLength({ min: 10 }).withMessage("Description must be at least 10 characters long"),
      body("category").isIn(["mobile-accessories", "gadgets"]).withMessage("Invalid category"),
      body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
    ],
    updateProduct
  );

router.route("/:id").delete(adminAuthMiddleware, deleteProduct);
router.get("/suggestions", getProductSuggestions);
router.route("/category/:category").get(getProductsByCategory);

export default router;
