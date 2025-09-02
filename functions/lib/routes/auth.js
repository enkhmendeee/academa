"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma_1 = __importDefault(require("../config/prisma"));
const router = express_1.default.Router();
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('username').isString().notEmpty(),
    (0, express_validator_1.body)('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    validateRequest_1.validateRequest,
], async (req, res) => {
    console.log('Registration endpoint called');
    console.log('Request body:', req.body);
    const { email, password, username } = req.body;
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    try {
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log('Email already registered:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
            },
        });
        console.log('User created successfully:', user.id);
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                motto: user.motto,
            },
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(400).json({ error: 'User registration failed', details: errorMessage });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
    validateRequest_1.validateRequest,
], async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            motto: user.motto,
        },
    });
});
router.patch('/profile', [
    authMiddleware_1.authenticateToken,
    (0, express_validator_1.body)('motto').optional().isString(),
    validateRequest_1.validateRequest,
], async (req, res) => {
    var _a;
    console.log('Profile update endpoint called');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    const userId = req.user && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const { motto } = req.body;
    console.log('User ID:', userId);
    console.log('Motto to update:', motto);
    try {
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: { motto },
            select: {
                id: true,
                username: true,
                email: true,
                motto: true,
            },
        });
        console.log('Updated user:', updatedUser);
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map