import { Router } from "express";

import {
  createTask,
  updateTask,
  getAllTasks,
  assignTask,
  deleteTask,
} from "../Controllers/Task.js";

import {
  auth,
  isAdmin,
  isAdminOrManager,
} from "../Middleware/AuthMiddleware.js";

const router = Router();

router.get("/", auth, getAllTasks);
router.post("/create", auth, isAdminOrManager, createTask);
router.put("/:id/status", auth, updateTask);
router.put("/:id/assign", auth, isAdminOrManager, assignTask);
router.delete("/delete/:id", auth, isAdmin, deleteTask);

export default router;