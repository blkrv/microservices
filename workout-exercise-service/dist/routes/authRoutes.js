"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Убедитесь, что импортируете express, если используете express.Router()
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router(); // Используем express.Router()
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Операции аутентификации
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string, description: Имя пользователя }
 *               password: { type: string, description: Пароль пользователя }
 *               email: { type: string, description: Email пользователя }
 *               firstName: { type: string, description: Имя пользователя }
 *               lastName: { type: string, description: Фамилия пользователя }
 *             required:
 *               - username
 *               - password
 *               - email
 *               - firstName
 *               - lastName
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации или email уже используется
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/register", authController_1.register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход пользователя в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, description: Email пользователя }
 *               password: { type: string, description: Пароль пользователя }
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Успешный вход, возвращен JWT токен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string, description: JWT токен }
 *       400:
 *         description: Неверный email или пароль
 *       401:
 *         description: Неверные учетные данные
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/login", authController_1.login);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map