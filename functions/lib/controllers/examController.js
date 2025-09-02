"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateExam = exports.validateCreateExam = exports.getExam = exports.deleteExam = exports.updateExam = exports.createExam = exports.getExams = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const express_validator_1 = require("express-validator");
// Get all exams for a user
const getExams = async (req, res) => {
    try {
        const userId = req.user.id;
        const exams = await prisma_1.default.exam.findMany({
            where: {
                userId: userId
            },
            include: {
                course: true
            },
            orderBy: {
                examDate: 'asc'
            }
        });
        res.json(exams);
    }
    catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
};
exports.getExams = getExams;
// Create a new exam
const createExam = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { title, description, examDate, courseId, semester, examType, location, duration } = req.body;
        // Verify the course belongs to the user
        const course = await prisma_1.default.course.findFirst({
            where: {
                id: courseId,
                userId: userId
            }
        });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const exam = await prisma_1.default.exam.create({
            data: {
                title,
                description,
                examDate: new Date(examDate),
                courseId,
                userId,
                semester,
                examType,
                location,
                duration: duration ? parseInt(duration) : null
            },
            include: {
                course: true
            }
        });
        res.status(201).json(exam);
    }
    catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ error: 'Failed to create exam' });
    }
};
exports.createExam = createExam;
// Update an exam
const updateExam = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const examId = parseInt(req.params.id);
        const updateData = req.body;
        // Verify the exam belongs to the user
        const existingExam = await prisma_1.default.exam.findFirst({
            where: {
                id: examId,
                userId: userId
            }
        });
        if (!existingExam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        // If courseId is being updated, verify the course belongs to the user
        if (updateData.courseId) {
            const course = await prisma_1.default.course.findFirst({
                where: {
                    id: updateData.courseId,
                    userId: userId
                }
            });
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
        }
        // Convert examDate to Date if provided
        if (updateData.examDate) {
            updateData.examDate = new Date(updateData.examDate);
        }
        // Convert duration to number if provided
        if (updateData.duration) {
            updateData.duration = parseInt(updateData.duration);
        }
        const exam = await prisma_1.default.exam.update({
            where: {
                id: examId
            },
            data: updateData,
            include: {
                course: true
            }
        });
        res.json(exam);
    }
    catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ error: 'Failed to update exam' });
    }
};
exports.updateExam = updateExam;
// Delete an exam
const deleteExam = async (req, res) => {
    try {
        const userId = req.user.id;
        const examId = parseInt(req.params.id);
        // Verify the exam belongs to the user
        const exam = await prisma_1.default.exam.findFirst({
            where: {
                id: examId,
                userId: userId
            }
        });
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        await prisma_1.default.exam.delete({
            where: {
                id: examId
            }
        });
        res.json({ message: 'Exam deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ error: 'Failed to delete exam' });
    }
};
exports.deleteExam = deleteExam;
// Get a single exam
const getExam = async (req, res) => {
    try {
        const userId = req.user.id;
        const examId = parseInt(req.params.id);
        const exam = await prisma_1.default.exam.findFirst({
            where: {
                id: examId,
                userId: userId
            },
            include: {
                course: true
            }
        });
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        res.json(exam);
    }
    catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ error: 'Failed to fetch exam' });
    }
};
exports.getExam = getExam;
// Validation rules for exam creation
exports.validateCreateExam = [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('examDate').isISO8601().withMessage('Valid exam date is required'),
    (0, express_validator_1.body)('courseId').isInt().withMessage('Valid course ID is required'),
    (0, express_validator_1.body)('semester').optional().isString().withMessage('Semester must be a string'),
    (0, express_validator_1.body)('examType').optional().isString().withMessage('Exam type must be a string'),
    (0, express_validator_1.body)('location').optional().isString().withMessage('Location must be a string'),
    (0, express_validator_1.body)('duration').optional().isInt().withMessage('Duration must be a number'),
    (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string')
];
// Validation rules for exam update
exports.validateUpdateExam = [
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Title cannot be empty'),
    (0, express_validator_1.body)('examDate').optional().isISO8601().withMessage('Valid exam date is required'),
    (0, express_validator_1.body)('courseId').optional().isInt().withMessage('Valid course ID is required'),
    (0, express_validator_1.body)('semester').optional().isString().withMessage('Semester must be a string'),
    (0, express_validator_1.body)('examType').optional().isString().withMessage('Exam type must be a string'),
    (0, express_validator_1.body)('location').optional().isString().withMessage('Location must be a string'),
    (0, express_validator_1.body)('duration').optional().isInt().withMessage('Duration must be a number'),
    (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string'),
    (0, express_validator_1.body)('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).withMessage('Invalid status'),
    (0, express_validator_1.body)('grade').optional().isInt({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100')
];
//# sourceMappingURL=examController.js.map