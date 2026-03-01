import { Router } from "express";

import {
  auth,
  isAdminOrManager,
  isAdmin,
} from "../Middleware/AuthMiddleware.js";

import {
  createTeam,
  getTeamDetails,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  getAllTeamsOfProject,
} from "../Controllers/Team.js";

const router = Router();

router.post("/create", auth, isAdmin, createTeam);

router.get("/project/:projectId", auth, getAllTeamsOfProject);

router.get("/:teamId", auth, getTeamDetails);

router.put("/:id", auth, isAdmin, updateTeam);

router.delete("/:id", auth, isAdmin, deleteTeam);

router.post("/:id/members", auth, isAdminOrManager, addMember);

router.delete("/:id/members/:memberId", auth, isAdminOrManager, removeMember);

export default router;