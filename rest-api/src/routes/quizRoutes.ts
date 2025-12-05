import { Router } from "express";
import * as quizController from "../controllers/quizController";

const router = Router();

/**
 * @swagger
 * /quizzes:
 *   post:
 *     tags: [Quizzes]
 *     summary: Create a new quiz
 *     description: Creates a new quiz with questions. Questions are created inline with the quiz.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuizRequest'
 *           example:
 *             title: "World Geography"
 *             description: "Test your knowledge about world geography"
 *             authorId: "123e4567-e89b-12d3-a456-426614174000"
 *             questions:
 *               - text: "What is the capital of Brazil?"
 *                 choices: ["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"]
 *                 correctIndex: 1
 *                 timeLimitSeconds: 15
 *               - text: "Which country has the largest population?"
 *                 choices: ["India", "China", "USA", "Indonesia"]
 *                 correctIndex: 1
 *                 timeLimitSeconds: 10
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", quizController.createQuiz);

/**
 * @swagger
 * /quizzes:
 *   get:
 *     tags: [Quizzes]
 *     summary: List all quizzes
 *     description: Retrieves a list of all quizzes in the system with their questions
 *     responses:
 *       200:
 *         description: List of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuizResponse'
 */
router.get("/", quizController.listQuizzes);

/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     tags: [Quizzes]
 *     summary: Get quiz by ID
 *     description: Retrieves a single quiz with all its questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResponse'
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", quizController.getQuiz);

export default router;