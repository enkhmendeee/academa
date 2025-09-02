"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserSemester = exports.updateUserSemester = exports.addUserSemester = exports.getUserSemesters = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getUserSemesters = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const semesters = await prisma_1.default.userSemester.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(semesters.map((s) => s.name));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch semesters" });
    }
};
exports.getUserSemesters = getUserSemesters;
const addUserSemester = async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.id;
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Semester name is required" });
    }
    try {
        const semester = await prisma_1.default.userSemester.create({
            data: {
                name: name.trim(),
                userId
            }
        });
        res.status(201).json({ name: semester.name });
    }
    catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: "Semester already exists" });
        }
        console.error(err);
        res.status(500).json({ error: "Failed to add semester" });
    }
};
exports.addUserSemester = addUserSemester;
const updateUserSemester = async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.id;
    const { oldName, newName } = req.body;
    if (!oldName || !newName || typeof oldName !== 'string' || typeof newName !== 'string') {
        return res.status(400).json({ error: "Old and new semester names are required" });
    }
    try {
        const semester = await prisma_1.default.userSemester.update({
            where: {
                userId_name: {
                    userId,
                    name: oldName.trim()
                }
            },
            data: {
                name: newName.trim()
            }
        });
        res.json({ name: semester.name });
    }
    catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Semester not found" });
        }
        if (err.code === 'P2002') {
            return res.status(409).json({ error: "New semester name already exists" });
        }
        console.error(err);
        res.status(500).json({ error: "Failed to update semester" });
    }
};
exports.updateUserSemester = updateUserSemester;
const deleteUserSemester = async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.id;
    const { name } = req.params;
    console.log('Delete semester request:', { userId, name, params: req.params });
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: "Semester name is required" });
    }
    try {
        // Check if semester has associated data
        const hasCourses = await prisma_1.default.course.findFirst({
            where: { userId, semester: name }
        });
        const hasHomeworks = await prisma_1.default.homework.findFirst({
            where: { userId, semester: name }
        });
        const hasExams = await prisma_1.default.exam.findFirst({
            where: { userId, semester: name }
        });
        if (hasCourses || hasHomeworks || hasExams) {
            return res.status(400).json({ error: "Cannot delete semester with existing data" });
        }
        // Check if semester exists before trying to delete
        const existingSemester = await prisma_1.default.userSemester.findUnique({
            where: {
                userId_name: {
                    userId,
                    name: name.trim()
                }
            }
        });
        console.log('Existing semester check:', { existingSemester, userId, name: name.trim() });
        if (!existingSemester) {
            return res.status(404).json({ error: "Semester not found" });
        }
        await prisma_1.default.userSemester.delete({
            where: {
                userId_name: {
                    userId,
                    name: name.trim()
                }
            }
        });
        res.status(204).send();
    }
    catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Semester not found" });
        }
        console.error(err);
        res.status(500).json({ error: "Failed to delete semester" });
    }
};
exports.deleteUserSemester = deleteUserSemester;
//# sourceMappingURL=userSemesterController.js.map