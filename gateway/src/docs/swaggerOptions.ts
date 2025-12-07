import { Options } from "swagger-jsdoc";
import { tags } from "./tags";
import { schemas } from "./schemas";

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Kahoot Clone - API Gateway",
      version: "1.0.0",
      description: `
# API Gateway for Kahoot Clone

This API Gateway acts as a unified entry point for the Kahoot Clone system, integrating:
- **REST API**: For resource management (users, quizzes, rooms)
- **WebSocket Server**: For real-time game interactions

## Architecture

\`\`\`
Client → Gateway (port 3000) → REST API (port 3001)
                             ↘ WebSocket Server (port 4000)
\`\`\`

## How to Use

1. **Create resources** via Gateway HTTP endpoints (users, quizzes, rooms)
2. **Follow HATEOAS links** in responses to discover available actions
3. **Connect to WebSocket** using URLs provided in room responses
4. **Play the game** via WebSocket events (join, answer, leaderboard)

## WebSocket Events

When you create or retrieve a room, you'll receive WebSocket connection details:

### Client → Server Events:
- \`room:join\` - Join a game room
- \`host:start\` - Start the game (host only)
- \`game:answer\` - Submit an answer to a question

### Server → Client Events:
- \`room:joined\` - Confirmation of room join
- \`room:player_list\` - List of players in room
- \`game:question\` - New question broadcast
- \`game:answer_result\` - Your answer result
- \`game:leaderboard\` - Current leaderboard
- \`game:question_end\` - Question time expired
- \`game:finished\` - Game finished with final scores
      `,
      contact: {
        name: "API Support"
      }
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Local development gateway"
      }
    ],
    tags,
    components: {
      schemas
    }
  },
  apis: ["./src/routes/*.ts"]
};