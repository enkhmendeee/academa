"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHomework = exports.updateHomework = exports.createHomework = exports.getHomework = exports.getHomeworks = void 0;
const prisma_1 = __importDefault(require("../config/prisma")); // Adjust the import path as necessary
const getHomeworks = async (req, res) => {
    var _a;
    const homeworks = await prisma_1.default.homework.findMany({
        where: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
        include: { course: true },
        orderBy: { dueDate: "asc" },
    });
    res.json(homeworks);
};
exports.getHomeworks = getHomeworks;
const getHomework = async (req, res) => {
    var _a;
    const homework = await prisma_1.default.homework.findUnique({
        where: { id: parseInt(req.params.id), userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
        include: { course: true },
    });
    res.json(homework);
};
exports.getHomework = getHomework;
const createHomework = async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.id;
    try {
        const homework = await prisma_1.default.homework.create({
            data: {
                title: req.body.title,
                description: req.body.description,
                dueDate: new Date(req.body.dueDate),
                courseId: req.body.courseId,
                userId,
                status: req.body.status,
                grade: req.body.grade,
                semester: req.body.semester,
            },
        });
        res.status(201).json(homework);
    }
    catch (error) {
        console.error('Error creating homework:', error);
        res.status(500).json({ error: 'Failed to create homework' });
    }
};
exports.createHomework = createHomework;
const updateHomework = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description, dueDate, status, grade, semester } = req.body;
    const updated = await prisma_1.default.homework.update({
        where: { id },
        data: {
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            status,
            grade,
            semester,
        },
        include: { course: true },
    });
    res.json(updated);
};
exports.updateHomework = updateHomework;
const deleteHomework = async (req, res) => {
    const id = parseInt(req.params.id);
    await prisma_1.default.homework.delete({ where: { id } });
    res.status(204).send();
};
exports.deleteHomework = deleteHomework;
//# sourceMappingURL=homework.controller.js.map