"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const homework_controller_1 = require("../controllers/homework.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
router.get("/", homework_controller_1.getHomeworks);
router.get("/:id", [
    (0, express_validator_1.param)("id").isInt(),
    validateRequest_1.validateRequest,
], homework_controller_1.getHomework);
router.post("/", [
    (0, express_validator_1.body)("title").isString().notEmpty(),
    (0, express_validator_1.body)("dueDate").isISO8601(),
    (0, express_validator_1.body)("courseId").isInt(),
    (0, express_validator_1.body)("semester").optional().isString(),
    // Optionally: body("status").isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"]),
    validateRequest_1.validateRequest,
], homework_controller_1.createHomework);
router.patch("/:id", [
    (0, express_validator_1.param)("id").isInt(),
    (0, express_validator_1.body)("title").optional().isString(),
    (0, express_validator_1.body)("dueDate").optional().isISO8601(),
    (0, express_validator_1.body)("status").optional().isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"]),
    (0, express_validator_1.body)("semester").optional().isString(),
    validateRequest_1.validateRequest,
], homework_controller_1.updateHomework);
router.delete("/:id", [
    (0, express_validator_1.param)("id").isInt(),
    validateRequest_1.validateRequest,
], homework_controller_1.deleteHomework);
exports.default = router;
//# sourceMappingURL=homework.route.js.map