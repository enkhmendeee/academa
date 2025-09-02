"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma_1 = __importDefault(require("../config/prisma"));
const router = express_1.default.Router();
// Get all exams for the authenticated user
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const userId = req.user && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const exams = await prisma_1.default.exam.findMany({
            where: { userId },
            include: {
                course: true,
            },
            orderBy: { examDate: 'asc' },
        });
        res.json(exams);
    }
    catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});
// Create a new exam
router.post('/', [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.body)('title').isString().notEmpty(),
    (0, express_validator_1.body)('examDate').isISO8601(),
    (0, express_validator_1.body)('courseId').isInt(),
    (0, express_validator_1.body)('examType').optional().isString(),
    (0, express_validator_1.body)('location').optional().isString(),
    (0, express_validator_1.body)('duration').optional().isInt(),
    (0, express_validator_1.body)('semester').optional().isString(),
    validateRequest_1.validateRequest,
], async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const userId = req.user.id;
        const { title, examDate, courseId, examType, location, duration, semester } = req.body;
        const exam = await prisma_1.default.exam.create({
            data: {
                title,
                examDate: new Date(examDate),
                courseId: parseInt(courseId),
                userId,
                examType,
                location,
                duration: duration ? parseInt(duration) : null,
                semester,
            },
            include: {
                course: true,
            },
        });
        res.status(201).json(exam);
    }
    catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ error: 'Failed to create exam' });
    }
});
// Update an exam
router.patch('/:id', [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.body)('title').optional().isString(),
    (0, express_validator_1.body)('examDate').optional().isISO8601(),
    (0, express_validator_1.body)('courseId').optional().isInt(),
    (0, express_validator_1.body)('examType').optional().isString(),
    (0, express_validator_1.body)('location').optional().isString(),
    (0, express_validator_1.body)('duration').optional().isInt(),
    (0, express_validator_1.body)('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']),
    (0, express_validator_1.body)('grade').optional().isInt({ min: 0, max: 100 }),
    validateRequest_1.validateRequest,
], async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const userId = req.user.id;
        const examId = parseInt(req.params.id);
        const updateData = req.body;
        // Convert examDate to Date object if provided
        if (updateData.examDate) {
            updateData.examDate = new Date(updateData.examDate);
        }
        // Convert courseId to number if provided
        if (updateData.courseId) {
            updateData.courseId = parseInt(updateData.courseId);
        }
        // Convert duration to number if provided
        if (updateData.duration) {
            updateData.duration = parseInt(updateData.duration);
        }
        // Convert grade to number if provided
        if (updateData.grade) {
            updateData.grade = parseInt(updateData.grade);
        }
        const exam = await prisma_1.default.exam.update({
            where: {
                id: examId,
                userId, // Ensure user can only update their own exams
            },
            data: updateData,
            include: {
                course: true,
            },
        });
        res.json(exam);
    }
    catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ error: 'Failed to update exam' });
    }
});
// Delete an exam
router.delete('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const userId = req.user.id;
        const examId = parseInt(req.params.id);
        await prisma_1.default.exam.delete({
            where: {
                id: examId,
                userId, // Ensure user can only delete their own exams
            },
        });
        res.json({ message: 'Exam deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ error: 'Failed to delete exam' });
    }
});
exports.default = router;
//# sourceMappingURL=examRoutes.js.map