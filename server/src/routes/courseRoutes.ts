import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  deleteCourse,
  updateCourse,
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
    body("semester").optional().isString(),
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
router.patch(
  "/:id",
  [
    authenticateToken,
    param("id").isInt(),
    body("name").optional().isString().notEmpty(),
    body("description").optional().isString(),
    body("semester").optional().isString(),
    body("color").optional().isString(),
    validateRequest,
  ],
  updateCourse
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
