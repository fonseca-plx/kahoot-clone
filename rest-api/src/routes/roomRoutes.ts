import { Router } from "express";
import * as roomController from "../controllers/roomController";

const router = Router();

/**
 * @swagger
 * /rooms:
 *   post:
 *     tags: [Rooms]
 *     summary: Create a new room
 *     description: Creates a new game room for a quiz. A unique 6-character code is automatically generated for players to join.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *           example:
 *             quizId: "123e4567-e89b-12d3-a456-426614174000"
 *             title: "Friday Quiz Session"
 *     responses:
 *       201:
 *         description: Room created successfully with join code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoomResponse'
 *             example:
 *               room:
 *                 id: "987e6543-e21b-12d3-a456-426614174999"
 *                 code: "ABC123"
 *                 quizId: "123e4567-e89b-12d3-a456-426614174000"
 *                 title: "Friday Quiz Session"
 *                 status: "waiting"
 *                 createdAt: "2025-12-05T12:00:00.000Z"
 *               _links:
 *                 self:
 *                   href: "/api/rooms/987e6543-e21b-12d3-a456-426614174999"
 *                 join:
 *                   href: "/api/rooms/ABC123/join"
 *                   method: "POST"
 *                 info:
 *                   href: "/api/rooms/987e6543-e21b-12d3-a456-426614174999"
 *                   method: "GET"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", roomController.createRoom);

/**
 * @swagger
 * /rooms:
 *   get:
 *     tags: [Rooms]
 *     summary: List all rooms
 *     description: Retrieves a list of all game rooms with their associated quizzes
 *     responses:
 *       200:
 *         description: List of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoomResponse'
 */
router.get("/", roomController.listRooms);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     tags: [Rooms]
 *     summary: Get room by ID
 *     description: Retrieves a single room with its associated quiz and questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoomResponse'
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", roomController.getRoom);

/**
 * @swagger
 * /rooms/code/{code}:
 *   get:
 *     tags: [Rooms]
 *     summary: Get room by code
 *     description: Retrieves a room using its join code instead of UUID
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Room join code
 *         example: "ABC123"
 *     responses:
 *       200:
 *         description: Room found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoomResponse'
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/code/:code", roomController.getRoomByCode);

export default router;