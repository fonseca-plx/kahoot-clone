# REST API - Kahoot Clone

API REST para gerenciamento de dados do sistema Kahoot Clone. Responsável pela persistência e manipulação de usuários, quizzes, questões e salas de jogo.

## 📋 Visão Geral

Esta API fornece endpoints RESTful para operações CRUD (Create, Read, Update, Delete) de todos os recursos do sistema. Utiliza PostgreSQL como banco de dados e Prisma como ORM para gerenciamento de dados e migrations.

## 🛠️ Tecnologias

- **Express** - Framework web para Node.js
- **TypeScript** - Tipagem estática
- **Prisma** - ORM moderno com suporte a TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Zod** - Validação de esquemas
- **Swagger/OpenAPI** - Documentação interativa da API
- **CORS** - Suporte a requisições cross-origin

## 🗄️ Modelo de Dados

### User (Usuário)
- `id` - UUID único
- `name` - Nome do usuário
- `email` - Email único
- `createdAt` - Data de criação
- Relações: quizzes (autor)

### Quiz
- `id` - UUID único
- `title` - Título do quiz
- `description` - Descrição opcional
- `authorId` - ID do autor
- `createdAt` - Data de criação
- Relações: author, questions, rooms

### Question (Questão)
- `id` - UUID único
- `text` - Texto da pergunta
- `imageUrl` - URL da imagem (opcional)
- `timeLimit` - Tempo limite em segundos
- `points` - Pontos da questão
- `quizId` - ID do quiz
- `order` - Ordem da questão no quiz
- Relações: quiz, answers

### Answer (Resposta)
- `id` - UUID único
- `text` - Texto da resposta
- `isCorrect` - Se a resposta é correta
- `questionId` - ID da questão
- Relação: question

### Room (Sala de Jogo)
- `id` - UUID único
- `code` - Código único de 6 caracteres
- `quizId` - ID do quiz associado
- `hostId` - ID do host
- `status` - Status da sala (waiting, active, finished)
- `currentQuestionIndex` - Índice da questão atual
- `createdAt` - Data de criação
- Relações: quiz, host

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando (via Docker ou local)
- npm ou yarn

### Instalação

```bash
cd rest-api
npm install
```

### Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://dev:dev@localhost:5431/kahoot_dev
PORT=3001
```

### Migrations do Banco de Dados

```bash
# Executar migrations existentes
npm run prisma:migrate

# Gerar o Prisma Client
npm run prisma:generate
```

### Executar em Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

### Build para Produção

```bash
npm run build
npm start
```

## 📡 Endpoints da API

### Users (Usuários)

#### `POST /api/users`
Cria um novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-12-08T10:00:00Z"
}
```

#### `GET /api/users`
Lista todos os usuários

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "createdAt": "2024-12-08T10:00:00Z"
  }
]
```

#### `GET /api/users/:id`
Busca um usuário por ID

**Response:** `200 OK`

#### `PUT /api/users/:id`
Atualiza um usuário

**Body:**
```json
{
  "name": "João Silva Santos",
  "email": "joao.santos@example.com"
}
```

**Response:** `200 OK`

#### `DELETE /api/users/:id`
Remove um usuário

**Response:** `204 No Content`

### Quizzes

#### `POST /api/quizzes`
Cria um novo quiz

**Body:**
```json
{
  "title": "História do Brasil",
  "description": "Quiz sobre história brasileira",
  "authorId": "uuid",
  "questions": [
    {
      "text": "Quando foi a independência do Brasil?",
      "choices": ["1822", "1889", "1500", "1930"],
      "correctIndex": 0,
      "timeLimitSeconds": 30
    }
  ]
}
```

**Response:** `201 Created`

#### `GET /api/quizzes`
Lista todos os quizzes

**Query Parameters:**
- `authorId` (opcional) - Filtra por autor

**Response:** `200 OK`

#### `GET /api/quizzes/:id`
Busca um quiz por ID (inclui questões e respostas)

**Response:** `200 OK`

#### `PUT /api/quizzes/:id`
Atualiza um quiz

**Response:** `200 OK`

#### `DELETE /api/quizzes/:id`
Remove um quiz

**Response:** `204 No Content`

### Rooms (Salas)

#### `POST /api/rooms`
Cria uma nova sala de jogo

**Body:**
```json
{
  "quizId": "uuid",
  "hostId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "code": "ABC123",
  "quizId": "uuid",
  "hostId": "uuid",
  "status": "waiting",
  "currentQuestionIndex": 0,
  "createdAt": "2024-12-08T10:00:00Z"
}
```

#### `GET /api/rooms`
Lista todas as salas

**Query Parameters:**
- `status` (opcional) - Filtra por status (waiting, active, finished)

**Response:** `200 OK`

#### `GET /api/rooms/:id`
Busca uma sala por ID

**Response:** `200 OK`

#### `GET /api/rooms/code/:code`
Busca uma sala pelo código

**Response:** `200 OK`

#### `PATCH /api/rooms/:id/status`
Atualiza o status de uma sala

**Body:**
```json
{
  "status": "active"
}
```

**Response:** `200 OK`

#### `PATCH /api/rooms/:id/question`
Avança para a próxima questão

**Response:** `200 OK`

#### `DELETE /api/rooms/:id`
Remove uma sala

**Response:** `204 No Content`

## 📚 Documentação Interativa

Acesse a documentação Swagger em: `http://localhost:3001/docs`

A interface Swagger permite:
- Visualizar todos os endpoints disponíveis
- Ver schemas de request/response
- Testar endpoints diretamente no navegador
- Gerar exemplos de código

## 🧪 Testando a API

### Usando cURL

```bash
# Criar um usuário
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@test.com"}'

# Listar usuários
curl http://localhost:3001/api/users

# Buscar usuário por ID
curl http://localhost:3001/api/users/{id}
```

### Usando Swagger UI

1. Acesse `http://localhost:3001/docs`
2. Escolha um endpoint
3. Clique em "Try it out"
4. Preencha os parâmetros
5. Clique em "Execute"

## 📁 Estrutura do Projeto

```
rest-api/
├── prisma/
│   ├── schema.prisma           # Schema do banco de dados
│   └── migrations/             # Migrations do Prisma
├── src/
│   ├── index.ts                # Entrada da aplicação
│   ├── prisma.ts               # Cliente Prisma
│   ├── controllers/            # Controllers
│   │   ├── userController.ts
│   │   ├── quizController.ts
│   │   └── roomController.ts
│   ├── services/               # Lógica de negócio
│   │   ├── userService.ts
│   │   ├── quizService.ts
│   │   └── roomService.ts
│   ├── routes/                 # Definição de rotas
│   │   ├── userRoutes.ts
│   │   ├── quizRoutes.ts
│   │   └── roomRoutes.ts
│   └── docs/                   # Configuração Swagger
│       ├── swaggerOptions.ts
│       ├── schemas.ts
│       └── tags.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Abrir Prisma Studio (GUI para banco de dados)
npx prisma studio
```

## 🔒 Validação de Dados

A API utiliza Zod para validação de dados de entrada, garantindo:
- Tipos corretos
- Campos obrigatórios presentes
- Formatos válidos (email, etc.)
- Valores dentro de limites esperados

Respostas de erro incluem mensagens descritivas sobre problemas de validação.

## 🐛 Tratamento de Erros

A API retorna códigos HTTP apropriados:
- `200` - Sucesso
- `201` - Recurso criado
- `204` - Sucesso sem conteúdo
- `400` - Erro de validação
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

Respostas de erro incluem:
```json
{
  "error": "Mensagem descritiva do erro"
}
```

## 🔗 Integração com Outros Serviços

Esta API é consumida por:
- **API Gateway** - Roteia requisições do cliente
- **WebSocket Server** - Busca dados de quizzes e salas durante o jogo

## 📝 Observações

- O código da sala é gerado automaticamente usando `nanoid` com 6 caracteres
- Status de sala: `waiting` (aguardando), `active` (em andamento), `finished` (finalizada)
- Exclusão de quiz também remove suas questões, respostas e salas associadas (cascade)
- IDs são UUIDs gerados automaticamente pelo Prisma

## 🔙 Voltar

[← Documentação Principal](../README.md)
