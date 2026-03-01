import { Router } from "express";
import { auth } from "../Middleware/AuthMiddleware.js";
import { getMessages } from "../Controllers/Chat.js";

const router = Router();

router.get("/messages", auth, getMessages);

export default router;