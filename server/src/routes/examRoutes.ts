import express from "express";
import { body, param } from "express-validator";
import {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} from "../controllers/examController";
import { authenticateToken } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getExams);

router.get(
  "/:id",
  [param("id").isInt(), validateRequest],
  getExam
);

router.post(
  "/",
  [
    body("title").isString().notEmpty(),
    body("examDate").isISO8601(),
    body("courseId").isInt(),
    body("description").optional().isString(),
    body("semester").optional().isString(),
    body("examType").optional().isString(),
    body("location").optional().isString(),
    body("duration").optional().isInt(),
    validateRequest,
  ],
  createExam
);

router.patch(
  "/:id",
  [
    param("id").isInt(),
    body("title").optional().isString().notEmpty(),
    body("examDate").optional().isISO8601(),
    body("courseId").optional().isInt(),
    body("description").optional().isString(),
    body("semester").optional().isString(),
    body("examType").optional().isString(),
    body("location").optional().isString(),
    body("duration").optional().isInt(),
    body("status").optional().isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"]),
    body("grade").optional().isInt({ min: 0, max: 100 }),
    validateRequest,
  ],
  updateExam
);

router.delete(
  "/:id",
  [param("id").isInt(), validateRequest],
  deleteExam
);

export default router;
