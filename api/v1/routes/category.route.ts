import { Router } from "express";
import * as authMiddleware from "../../../middlewares/auth.middleware";
import * as controllerCategory from "../controllers/category.controller";

const router = Router();

router.get("/", controllerCategory.getAllCategories);

router.post("/", authMiddleware.verifyToken, controllerCategory.createCategory);

router.get("/:categoryId/detail", controllerCategory.getCategoryById);

router.put("/:categoryId", authMiddleware.verifyToken, controllerCategory.updateCategory);

router.delete("/:categoryId", authMiddleware.verifyToken, controllerCategory.deleteCategory);

router.get("/:categoryId/documents", controllerCategory.getCategoryDocuments);

router.get("/search", controllerCategory.searchCategories);

export const categoryRoute: Router = router;
