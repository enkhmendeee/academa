import express from "express";
import {
  getHomeworks,
  getHomework,
  createHomework,
  updateHomework,
  deleteHomework,
} from "../controllers/homework.controller";
import { authenticateToken } from "../middleware/authMiddleware";
import { body, param } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";
const router = express.Router();

router.use(authenticateToken);

router.get("/", getHomeworks);
router.get(
  "/:id",
  [
    param("id").isInt(),
    validateRequest,
  ],
  getHomework
);
router.post(
  "/",
  [
    body("title").isString().notEmpty(),
    body("dueDate").isISO8601(),
    body("courseId").isInt(),
    body("semester").optional().isString(),
    // Optionally: body("status").isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"]),
    validateRequest,
  ],
  createHomework
);
router.patch(
  "/:id",
  [
    param("id").isInt(),
    body("title").optional().isString(),
    body("dueDate").optional().isISO8601(),
    body("status").optional().isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"]),
    body("semester").optional().isString(),
    validateRequest,
  ],
  updateHomework
);
router.delete(
  "/:id",
  [
    param("id").isInt(),
    validateRequest,
  ],
  deleteHomework
);

export default router;
