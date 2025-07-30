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
    body("name").isString().notEmpty(),
    validateRequest,
  ],
  createCourse
);
router.get("/", authenticateToken, getCourses);
router.get(
  "/:id",
  [
    param("id").isInt(),
    validateRequest,
    authenticateToken,
  ],
  getCourseById
);
router.delete(
  "/:id",
  [
    param("id").isInt(),
    validateRequest,
    authenticateToken,
  ],
  deleteCourse
);

export default router;
