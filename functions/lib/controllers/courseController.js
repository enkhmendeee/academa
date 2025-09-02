"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourse = exports.deleteCourse = exports.getCourseById = exports.getCourses = exports.createCourse = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
;
const createCourse = async (req, res) => {
    var _a;
    const { name, semester, color } = req.body;
    const userId = req.user && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const course = await prisma_1.default.course.create({
            data: { name, semester, color, userId },
        });
        res.status(201).json(course);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create course" });
    }
};
exports.createCourse = createCourse;
const getCourses = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const courses = await prisma_1.default.course.findMany({
        where: { userId },
        include: { homeworks: true }, // optional
    });
    res.json(courses);
};
exports.getCourses = getCourses;
const getCourseById = async (req, res) => {
    var _a;
    const courseId = parseInt(req.params.id);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const course = await prisma_1.default.course.findFirst({
        where: { id: courseId, userId },
        include: { homeworks: true },
    });
    if (!course)
        return res.status(404).json({ error: "Course not found" });
    res.json(course);
};
exports.getCourseById = getCourseById;
const deleteCourse = async (req, res) => {
    const courseId = parseInt(req.params.id);
    try {
        await prisma_1.default.course.delete({
            where: {
                id: courseId,
                // optional: enforce userId check in application logic
            },
        });
        res.sendStatus(204);
    }
    catch (_a) {
        res.status(404).json({ error: "Course not found or not yours" });
    }
};
exports.deleteCourse = deleteCourse;
const updateCourse = async (req, res) => {
    var _a;
    const courseId = parseInt(req.params.id);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { name, description, semester, color } = req.body;
    try {
        const course = await prisma_1.default.course.findFirst({
            where: { id: courseId, userId },
        });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        const updatedCourse = await prisma_1.default.course.update({
            where: { id: courseId },
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (description !== undefined && { description })), (semester && { semester })), (color && { color })),
        });
        res.json(updatedCourse);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update course" });
    }
};
exports.updateCourse = updateCourse;
//# sourceMappingURL=courseController.js.map