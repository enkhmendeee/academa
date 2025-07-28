import express from "express";
import {
  getHomeworks,
  getHomework,
  createHomework,
  updateHomework,
  deleteHomework,
} from "../controllers/homework.controller";
import { authenticateToken } from "../middleware/authMiddleware";
const router = express.Router();

router.use(authenticateToken);

router.get("/", getHomeworks);
router.post("/", createHomework);
router.patch("/:id", updateHomework);
router.delete("/:id", deleteHomework);

export default router;
