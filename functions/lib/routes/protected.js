"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/dashboard', authMiddleware_1.authenticateToken, (req, res) => {
    const user = req.user;
    res.json({ message: `Welcome, user ${user === null || user === void 0 ? void 0 : user.id}` });
});
exports.default = router;
//# sourceMappingURL=protected.js.map