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

  UserResponse: {
    type: "object",
    properties: {
      user: {
        $ref: "#/components/schemas/User"
      },
      _links: {
        $ref: "#/components/schemas/Links"
      }
    }
  },

  // ==================== QUIZ SCHEMAS ====================
  Question: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Question unique identifier"
      },
      quizId: {
        type: "string",
        format: "uuid",
        description: "Quiz ID this question belongs to"
      },
      text: {
        type: "string",
        description: "Question text",
        example: "What is the capital of Brazil?"
      },
      choices: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of answer choices",
        example: ["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"]
      },
      correctIndex: {
        type: "integer",
        description: "Index of the correct answer (0-based)",
        example: 1
      },
      timeLimitSeconds: {
        type: "integer",
        description: "Time limit to answer in seconds",
        default: 10,
        example: 15
      }
    },
    required: ["id", "quizId", "text", "choices", "correctIndex", "timeLimitSeconds"]
  },

  Quiz: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Quiz unique identifier"
      },
      title: {
        type: "string",
        description: "Quiz title",
        example: "World Geography"
      },
      description: {
        type: "string",
        nullable: true,
        description: "Quiz description",
        example: "Test your knowledge about world geography"
      },
      authorId: {
        type: "string",
        format: "uuid",
        description: "Author user ID"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Quiz creation timestamp"
      },
      questions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Question"
        },
        description: "Quiz questions"
      }
    },
    required: ["id", "title", "authorId", "createdAt"]
  },

  CreateQuestionRequest: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "Question text",
        example: "What is the capital of Brazil?"
      },
      choices: {
        type: "array",
        items: {
          type: "string"
        },
        minItems: 2,
        description: "Array of answer choices",
        example: ["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"]
      },
      correctIndex: {
        type: "integer",
        minimum: 0,
        description: "Index of the correct answer (0-based)",
        example: 1
      },
      timeLimitSeconds: {
        type: "integer",
        minimum: 5,
        description: "Time limit to answer in seconds (optional, defaults to 10)",
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
        description: "Quiz title",
        example: "World Geography"
      },
      description: {
        type: "string",
        description: "Quiz description (optional)",
        example: "Test your knowledge about world geography"
      },
      authorId: {
        type: "string",
        format: "uuid",
        description: "Author user ID"
      },
      questions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/CreateQuestionRequest"
        },
        minItems: 1,
        description: "Array of questions for this quiz"
      }
    },
    required: ["title", "authorId", "questions"]
  },

  QuizResponse: {
    type: "object",
    properties: {
      quiz: {
        $ref: "#/components/schemas/Quiz"
      },
      _links: {
        $ref: "#/components/schemas/Links"
      }
    }
  },

  // ==================== ROOM SCHEMAS ====================
  Room: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Room unique identifier"
      },
      code: {
        type: "string",
        description: "Short code to join the room",
        example: "ABC123"
      },
      quizId: {
        type: "string",
        format: "uuid",
        description: "Quiz ID for this room"
      },
      title: {
        type: "string",
        nullable: true,
        description: "Room custom title",
        example: "Friday Quiz Session"
      },
      status: {
        type: "string",
        enum: ["waiting", "active", "finished"],
        description: "Room status",
        default: "waiting"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Room creation timestamp"
      },
      quiz: {
        $ref: "#/components/schemas/Quiz",
        description: "Quiz details (included in some responses)"
      }
    },
    required: ["id", "code", "quizId", "status", "createdAt"]
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

  RoomResponse: {
    type: "object",
    properties: {
      room: {
        $ref: "#/components/schemas/Room"
      },
      _links: {
        type: "object",
        properties: {
          self: {
            type: "object",
            properties: {
              href: {
                type: "string"
              }
            }
          },
          join: {
            type: "object",
            properties: {
              href: {
                type: "string"
              },
              method: {
                type: "string"
              }
            }
          },
          info: {
            type: "object",
            properties: {
              href: {
                type: "string"
              },
              method: {
                type: "string"
              }
            }
          }
        }
      }
    }
  },

  // ==================== COMMON SCHEMAS ====================
  Links: {
    type: "object",
    properties: {
      self: {
        type: "object",
        properties: {
          href: {
            type: "string",
            description: "Resource URL"
          }
        }
      }
    },
    description: "HATEOAS links"
  },

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