import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  deleteCourse,
} from "../controllers/courseController";
import { authenticateToken } from "../middleware/authMiddleware";
import { body, param } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";

const router = express.Router();

router.post(
  "/",
  [
    authenticateToken,
    body("name").isString().notEmpty(),
    validateRequest,
  ],
  createCourse
);
router.get("/", authenticateToken, getCourses);
router.get(
  "/:id",
  [
    authenticateToken,
    param("id").isInt(),
    validateRequest,
  ],
  getCourseById
);
router.delete(
  "/:id",
  [
    authenticateToken,
    param("id").isInt(),
    validateRequest,
  ],
  deleteCourse
);

export default router;
