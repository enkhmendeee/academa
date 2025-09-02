"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router();
router.post("/", [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.body)("name").isString().notEmpty(),
    (0, express_validator_1.body)("semester").optional().isString(),
    validateRequest_1.validateRequest,
], courseController_1.createCourse);
router.get("/", authMiddleware_1.authenticateToken, courseController_1.getCourses);
router.get("/:id", [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.param)("id").isInt(),
    validateRequest_1.validateRequest,
], courseController_1.getCourseById);
router.patch("/:id", [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.param)("id").isInt(),
    (0, express_validator_1.body)("name").optional().isString().notEmpty(),
    (0, express_validator_1.body)("description").optional().isString(),
    (0, express_validator_1.body)("semester").optional().isString(),
    (0, express_validator_1.body)("color").optional().isString(),
    validateRequest_1.validateRequest,
], courseController_1.updateCourse);
router.delete("/:id", [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.param)("id").isInt(),
    validateRequest_1.validateRequest,
], courseController_1.deleteCourse);
exports.default = router;
//# sourceMappingURL=courseRoutes.js.map