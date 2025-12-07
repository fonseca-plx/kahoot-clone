import { Router } from "express";
import GatewayController from "../controllers/gatewayController";

const router = Router();

/**
 * @swagger
 * /quizzes:
 *   post:
 *     tags: [Quizzes]
 *     summary: Create a new quiz
 *     description: Creates a quiz with nested questions. Use the returned HATEOAS links to create a room for this quiz. Proxied to REST API.
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
 *         description: Quiz created successfully with HATEOAS links
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
router.post("/", GatewayController.createQuiz);

/**
 * @swagger
 * /quizzes:
 *   get:
 *     tags: [Quizzes]
 *     summary: List all quizzes
 *     description: Retrieves all quizzes with their questions and HATEOAS links. Proxied to REST API.
 *     responses:
 *       200:
 *         description: List of quizzes with HATEOAS navigation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuizResponse'
 */
router.get("/", GatewayController.listQuizzes);

/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     tags: [Quizzes]
 *     summary: Get quiz by ID
 *     description: Retrieves a single quiz with all questions and HATEOAS links to create rooms. Proxied to REST API.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Quiz UUID
 *     responses:
 *       200:
 *         description: Quiz found with questions and HATEOAS links
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
router.get("/:id", GatewayController.getQuiz);

export default router;
