import { Router } from "express";
import {
  createProject,
  updateProject,
  getProject,
  deleteProject,
  getSingleProject,
} from "../Controllers/Project.js";

import {
  auth,
  isAdmin,
  isAdminOrManager,
} from "../Middleware/AuthMiddleware.js";

const router = Router();

router.get("/", auth, getProject);
router.post("/create", auth, isAdminOrManager, createProject);
router.put("/update/:id", auth, isAdminOrManager, updateProject);
router.get("/:id", auth, getSingleProject);
router.delete("/delete/:id", auth, isAdmin, deleteProject);

export default router;