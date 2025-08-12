import { Router } from "express";

import * as authMiddleware from "../../../middlewares/auth.middleware";
import * as controllerRole from "../controllers/role.controller";

const router = Router();

router.get("/", controllerRole.getAllRoles);
router.post("/", authMiddleware.verifyToken, controllerRole.createRole);
router.delete("/:role", authMiddleware.verifyToken, controllerRole.deleteRole);

export const roleRoute: Router = router;