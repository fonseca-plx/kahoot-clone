export const schemas = {
  // ==================== USER SCHEMAS ====================
  User: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "User unique identifier"
      },
      name: {
        type: "string",
        description: "User full name"
      },
      email: {
        type: "string",
        format: "email",
        description: "User email address"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "User creation timestamp"
      }
    },
    required: ["id", "name", "email", "createdAt"]
  },

  CreateUserRequest: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "User full name",
        example: "João Silva"
      },
      email: {
        type: "string",
        format: "email",
        description: "User email address",
        example: "joao.silva@email.com"
      }
    },
    required: ["name", "email"]
  },

  UserLinks: {
    type: "object",
    properties: {
      self: {
        type: "object",
        properties: {
          href: { type: "string" },
          method: { type: "string" }
        }
      },
      quizzes: {
        type: "object",
        properties: {
          href: { type: "string" },
          method: { type: "string" },
          description: { type: "string" }
        }
      }
    }
  },

  UserResponse: {
    type: "object",
    properties: {
      user: {
        $ref: "#/components/schemas/User"
      },
      _links: {
        $ref: "#/components/schemas/UserLinks"
      }
    }
  },

  // ==================== QUIZ SCHEMAS ====================
  Question: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid"
      },
      quizId: {
        type: "string",
        format: "uuid"
      },
      text: {
        type: "string",
        example: "What is the capital of Brazil?"
      },
      choices: {
        type: "array",
        items: { type: "string" },
        example: ["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"]
      },
      correctIndex: {
        type: "integer",
        example: 1
      },
      timeLimitSeconds: {
        type: "integer",
        default: 10
      }
    }
  },

  Quiz: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid"
      },
      title: {
        type: "string",
        example: "World Geography"
      },
      description: {
        type: "string",
        nullable: true,
        example: "Test your knowledge"
      },
      authorId: {
        type: "string",
        format: "uuid"
      },
      createdAt: {
        type: "string",
        format: "date-time"
      },
      questions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Question"
        }
      }
    }
  },

  CreateQuestionRequest: {
    type: "object",
    properties: {
      text: {
        type: "string",
        example: "What is the capital of Brazil?"
      },
      choices: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        example: ["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"]
      },
      correctIndex: {
        type: "integer",
        minimum: 0,
        example: 1
      },
      timeLimitSeconds: {
        type: "integer",
        minimum: 5,
        example: 15
      }
    },
    required: ["text", "choices", "correctIndex"]
  },

  CreateQuizRequest: {
    type: "object",
    properties: {
      title: {
        type: "string",
        example: "World Geography"
      },
      description: {
        type: "string",
        example: "Test your knowledge"
      },
      authorId: {
        type: "string",
        format: "uuid"
      },
      questions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/CreateQuestionRequest"
        },
        minItems: 1
      }
    },
    required: ["title", "authorId", "questions"]
  },

  QuizLinks: {
    type: "object",
    properties: {
      self: {
        type: "object",
        properties: {
          href: { type: "string" },
          method: { type: "string" }
        }
      },
      createRoom: {
        type: "object",
        properties: {
          href: { type: "string" },
          method: { type: "string" },
          payload: { type: "object" },
          description: { type: "string" }
        }
      }
    }
  },

  QuizResponse: {
    type: "object",
    properties: {
      quiz: {
        $ref: "#/components/schemas/Quiz"
      },
      _links: {
        $ref: "#/components/schemas/QuizLinks"
      }
    }
  },

  // ==================== ROOM SCHEMAS ====================
  Room: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid"
      },
      code: {
        type: "string",
        description: "6-character join code",
        example: "ABC123"
      },
      quizId: {
        type: "string",
        format: "uuid"
      },
      title: {
        type: "string",
        nullable: true,
        example: "Friday Quiz Session"
      },
      status: {
        type: "string",
        enum: ["waiting", "running", "finished"],
        default: "waiting"
      },
      createdAt: {
        type: "string",
        format: "date-time"
      },
      quiz: {
        $ref: "#/components/schemas/Quiz"
      }
    }
  },

  CreateRoomRequest: {
    type: "object",
    properties: {
      quizId: {
        type: "string",
        format: "uuid",
        description: "Quiz ID to use in this room"
      },
      title: {
        type: "string",
        description: "Room custom title (optional)",
        example: "Friday Quiz Session"
      }
    },
    required: ["quizId"]
  },

  WebSocketEvent: {
    type: "object",
    properties: {
      event: {
        type: "string",
        description: "Socket.io event name"
      },
      payload: {
        type: "object",
        description: "Event payload structure"
      },
      description: {
        type: "string"
      }
    }
  },

  RoomLinks: {
    type: "object",
    properties: {
      self: {
        type: "object",
        properties: {
          href: { type: "string" },
          method: { type: "string" }
        }
      },
      byCode: {
        type: "object",
        properties: {
          href: { type: "string" },
          method: { type: "string" },
          description: { type: "string" }
        }
      },
      websocket: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "WebSocket server URL",
            example: "http://localhost:4000"
          },
          events: {
            type: "object",
            properties: {
              join: {
                $ref: "#/components/schemas/WebSocketEvent"
              },
              start: {
                $ref: "#/components/schemas/WebSocketEvent"
              }
            }
          }
        },
        description: "WebSocket connection details and available events"
      },
      quiz: {
        type: "object",
        properties: {
          href: { type: "string" },
          method: { type: "string" },
          description: { type: "string" }
        }
      }
    }
  },

  RoomResponse: {
    type: "object",
    properties: {
      room: {
        $ref: "#/components/schemas/Room"
      },
      _links: {
        $ref: "#/components/schemas/RoomLinks"
      }
    }
  },

  // ==================== COMMON SCHEMAS ====================
  Error: {
    type: "object",
    properties: {
      error: {
        type: "string",
        description: "Error message",
        example: "Resource not found"
      }
    }
  }
};