"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userSemesterController_1 = require("../controllers/userSemesterController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router();
// Get all semesters for the current user
router.get("/", authMiddleware_1.authenticateToken, userSemesterController_1.getUserSemesters);
// Add a new semester
router.post("/", [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.body)("name").isString().notEmpty().trim(),
    validateRequest_1.validateRequest,
], userSemesterController_1.addUserSemester);
// Update a semester
router.patch("/", [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.body)("oldName").isString().notEmpty().trim(),
    (0, express_validator_1.body)("newName").isString().notEmpty().trim(),
    validateRequest_1.validateRequest,
], userSemesterController_1.updateUserSemester);
// Delete a semester
router.delete("/:name", [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.param)("name").isString().notEmpty().trim(),
    validateRequest_1.validateRequest,
], userSemesterController_1.deleteUserSemester);
exports.default = router;
//# sourceMappingURL=userSemesterRoutes.js.map