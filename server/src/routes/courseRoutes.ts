import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  deleteCourse,
} from "../controllers/courseController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateToken, createCourse);
router.get("/", authenticateToken, getCourses);
router.get("/:id", authenticateToken, getCourseById);
router.delete("/:id", authenticateToken, deleteCourse);

export default router;
