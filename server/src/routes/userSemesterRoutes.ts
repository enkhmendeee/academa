import express from "express";
import {
  getUserSemesters,
  addUserSemester,
  updateUserSemester,
  deleteUserSemester,
} from "../controllers/userSemesterController";
import { authenticateToken } from "../middleware/authMiddleware";
import { body, param } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";

const router = express.Router();

// Get all semesters for the current user
router.get("/", authenticateToken, getUserSemesters);

// Add a new semester
router.post(
  "/",
  [
    authenticateToken,
    body("name").isString().notEmpty().trim(),
    validateRequest,
  ],
  addUserSemester
);

// Update a semester
router.patch(
  "/",
  [
    authenticateToken,
    body("oldName").isString().notEmpty().trim(),
    body("newName").isString().notEmpty().trim(),
    validateRequest,
  ],
  updateUserSemester
);

// Delete a semester
router.delete(
  "/:name",
  [
    authenticateToken,
    param("name").isString().notEmpty().trim(),
    validateRequest,
  ],
  deleteUserSemester
);

export default router;
