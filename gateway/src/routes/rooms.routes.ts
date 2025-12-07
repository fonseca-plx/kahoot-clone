import { Router } from "express";
import GatewayController from "../controllers/gatewayController";

const router = Router();

/**
 * @swagger
 * /rooms:
 *   post:
 *     tags: [Rooms]
 *     summary: Create a new game room
 *     description: |
 *       Creates a game room for a quiz. Returns the room with:
 *       - A unique 6-character join code
 *       - HATEOAS links including WebSocket connection details
 *       
 *       Use the WebSocket URL and events from the response to connect and join the game.
 *       
 *       Proxied to REST API.
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
 *         description: |
 *           Room created successfully with WebSocket connection details in HATEOAS links.
 *           
 *           Use `_links.websocket.url` to connect and `_links.websocket.events` to see available events.
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
 *                 createdAt: "2025-12-06T12:00:00.000Z"
 *               _links:
 *                 self:
 *                   href: "/api/rooms/987e6543-e21b-12d3-a456-426614174999"
 *                   method: "GET"
 *                 websocket:
 *                   url: "http://localhost:4000"
 *                   events:
 *                     join:
 *                       event: "room:join"
 *                       payload:
 *                         code: "ABC123"
 *                         displayName: "string"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", GatewayController.createRoom);

/**
 * @swagger
 * /rooms:
 *   get:
 *     tags: [Rooms]
 *     summary: List all game rooms
 *     description: Retrieves all game rooms with WebSocket connection details in HATEOAS links. Proxied to REST API.
 *     responses:
 *       200:
 *         description: List of rooms with WebSocket details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoomResponse'
 */
router.get("/", GatewayController.listRooms);

/**
 * @swagger
 * /rooms/code/{code}:
 *   get:
 *     tags: [Rooms]
 *     summary: Get room by join code
 *     description: |
 *       Retrieves a room using its 6-character join code instead of UUID.
 *       Returns WebSocket connection details for joining the game.
 *       
 *       This is the primary endpoint for players joining a game.
 *       
 *       Proxied to REST API.
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9]{6}$'
 *         description: 6-character room join code
 *         example: "ABC123"
 *     responses:
 *       200:
 *         description: Room found with WebSocket connection details
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
router.get("/code/:code", GatewayController.getRoomByCode);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     tags: [Rooms]
 *     summary: Get room by ID
 *     description: Retrieves a room by UUID with full quiz details and WebSocket connection info. Proxied to REST API.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room UUID
 *     responses:
 *       200:
 *         description: Room found with full details
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
router.get("/:id", GatewayController.getRoom);

export default router;