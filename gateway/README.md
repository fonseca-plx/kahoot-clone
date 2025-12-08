# API Gateway - Kahoot Clone

Gateway de API que atua como ponto de entrada unificado para o sistema Kahoot Clone. Roteia requisições HTTP do cliente para os serviços backend apropriados (REST API e WebSocket Server).

## 📋 Visão Geral

O API Gateway implementa o padrão de design Gateway/BFF (Backend for Frontend), fornecendo:

- **Ponto de Entrada Único**: Todos os clientes acessam através de uma única URL
- **Roteamento**: Direciona requisições para serviços apropriados
- **Proxy Reverso**: Encaminha requisições HTTP para REST API
- **HATEOAS**: Adiciona links hipermídia nas respostas
- **Documentação Centralizada**: Swagger UI agregando documentação de todos os serviços
- **CORS**: Configuração centralizada de políticas de acesso

## 🛠️ Tecnologias

- **Express** - Framework web para Node.js
- **TypeScript** - Tipagem estática
- **Axios** - Cliente HTTP para comunicação com serviços
- **Swagger/OpenAPI** - Documentação interativa da API
- **CORS** - Suporte a requisições cross-origin

## 🔀 Arquitetura de Roteamento

```
Cliente → API Gateway (3000) → REST API (3001)
                             → WS Server (4000)
```

### Rotas Disponíveis

| Rota Gateway | Serviço Destino | Porta | Descrição |
|-------------|-----------------|-------|-----------|
| `/api/users/*` | REST API | 3001 | Operações de usuários |
| `/api/quizzes/*` | REST API | 3001 | Operações de quizzes |
| `/api/rooms/*` | REST API | 3001 | Operações de salas |
| `/docs` | Gateway | 3000 | Documentação Swagger |
| `/health` | Gateway | 3000 | Health check |

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- REST API rodando em `http://localhost:3001`
- WebSocket Server rodando em `http://localhost:4000`
- npm ou yarn

### Instalação

```bash
cd gateway
npm install
```

### Configuração de Variáveis de Ambiente

Crie um arquivo `.env`:

```env
PORT=3000
REST_API_URL=http://localhost:3001/api
WS_SERVER_URL=http://localhost:4000
```

### Executar em Desenvolvimento

```bash
npm run dev
```

O gateway estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
npm start
```

## 📡 Endpoints

### Health Check

#### `GET /health`
Verifica se o gateway está funcionando

**Response:** `200 OK`
```json
{
  "status": "ok"
}
```

### Users (Proxy para REST API)

#### `POST /api/users`
Cria um novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com"
}
```

**Response:** `201 Created` com links HATEOAS
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-12-08T10:00:00Z",
  "_links": {
    "self": { "href": "/api/users/uuid" },
    "quizzes": { "href": "/api/quizzes?authorId=uuid" },
    "all": { "href": "/api/users" }
  }
}
```

#### `GET /api/users`
Lista todos os usuários

**Response:** `200 OK` com links HATEOAS

#### `GET /api/users/:id`
Busca um usuário por ID

**Response:** `200 OK` com links HATEOAS

#### `PUT /api/users/:id`
Atualiza um usuário

#### `DELETE /api/users/:id`
Remove um usuário

### Quizzes (Proxy para REST API)

#### `POST /api/quizzes`
Cria um novo quiz

**Body:**
```json
{
  "title": "História do Brasil",
  "description": "Quiz sobre história",
  "authorId": "uuid",
  "questions": [
    {
      "text": "Pergunta?",
      "timeLimit": 30,
      "points": 100,
      "order": 0,
      "answers": [
        { "text": "Resposta 1", "isCorrect": true },
        { "text": "Resposta 2", "isCorrect": false }
      ]
    }
  ]
}
```

**Response:** `201 Created` com links HATEOAS
```json
{
  "id": "uuid",
  "title": "História do Brasil",
  "authorId": "uuid",
  "_links": {
    "self": { "href": "/api/quizzes/uuid" },
    "author": { "href": "/api/users/uuid" },
    "rooms": { "href": "/api/rooms?quizId=uuid" },
    "all": { "href": "/api/quizzes" }
  }
}
```

#### `GET /api/quizzes`
Lista todos os quizzes

**Query:** `?authorId=uuid` (opcional)

#### `GET /api/quizzes/:id`
Busca um quiz por ID (inclui questões)

#### `PUT /api/quizzes/:id`
Atualiza um quiz

#### `DELETE /api/quizzes/:id`
Remove um quiz

### Rooms (Proxy para REST API)

#### `POST /api/rooms`
Cria uma nova sala de jogo

**Body:**
```json
{
  "quizId": "uuid",
  "hostId": "uuid"
}
```

**Response:** `201 Created` com links HATEOAS
```json
{
  "id": "uuid",
  "code": "ABC123",
  "quizId": "uuid",
  "hostId": "uuid",
  "status": "waiting",
  "_links": {
    "self": { "href": "/api/rooms/uuid" },
    "byCode": { "href": "/api/rooms/code/ABC123" },
    "quiz": { "href": "/api/quizzes/uuid" },
    "host": { "href": "/api/users/uuid" },
    "websocket": { "href": "ws://localhost:4000?roomCode=ABC123" }
  }
}
```

#### `GET /api/rooms`
Lista todas as salas

**Query:** `?status=waiting` (opcional)

#### `GET /api/rooms/:id`
Busca uma sala por ID

#### `GET /api/rooms/code/:code`
Busca uma sala pelo código

**Response:** `200 OK` com link WebSocket
```json
{
  "id": "uuid",
  "code": "ABC123",
  "_links": {
    "websocket": { "href": "ws://localhost:4000?roomCode=ABC123" }
  }
}
```

#### `PATCH /api/rooms/:id/status`
Atualiza o status de uma sala

**Body:**
```json
{
  "status": "active"
}
```

#### `PATCH /api/rooms/:id/question`
Avança para a próxima questão

#### `DELETE /api/rooms/:id`
Remove uma sala

## 🔗 HATEOAS (Hypermedia Links)

O gateway adiciona automaticamente links HATEOAS nas respostas, facilitando a navegação da API.

### Exemplo de Links

```json
{
  "id": "123",
  "name": "João",
  "_links": {
    "self": { "href": "/api/users/123" },
    "quizzes": { "href": "/api/quizzes?authorId=123" },
    "all": { "href": "/api/users" }
  }
}
```

### Links por Recurso

**User:**
- `self` - Detalhes do usuário
- `quizzes` - Quizzes do autor
- `all` - Todos os usuários

**Quiz:**
- `self` - Detalhes do quiz
- `author` - Autor do quiz
- `rooms` - Salas com este quiz
- `all` - Todos os quizzes

**Room:**
- `self` - Detalhes da sala
- `byCode` - Acesso por código
- `quiz` - Quiz da sala
- `host` - Host da sala
- `websocket` - URL do WebSocket

## 📚 Documentação Interativa

Acesse a documentação Swagger em: `http://localhost:3000/docs`

A documentação inclui:
- Todos os endpoints do gateway
- Schemas de request/response
- Exemplos de uso
- Possibilidade de testar endpoints

## 🧪 Testando o Gateway

### Health Check

```bash
curl http://localhost:3000/health
```

### Criar Usuário

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@test.com"}'
```

### Listar Quizzes

```bash
curl http://localhost:3000/api/quizzes
```

### Buscar Sala por Código

```bash
curl http://localhost:3000/api/rooms/code/ABC123
```

### Usando Swagger UI

1. Acesse `http://localhost:3000/docs`
2. Explore os endpoints disponíveis
3. Use "Try it out" para testar
4. Observe os links HATEOAS nas respostas

## 📁 Estrutura do Projeto

```
gateway/
├── src/
│   ├── index.ts                    # Entrada da aplicação
│   ├── routes/
│   │   ├── index.ts                # Agregador de rotas
│   │   ├── users.routes.ts         # Rotas de usuários
│   │   ├── quizzes.routes.ts       # Rotas de quizzes
│   │   └── rooms.routes.ts         # Rotas de salas
│   ├── controllers/
│   │   └── gatewayController.ts    # Controller do gateway
│   ├── services/
│   │   └── restProxyService.ts     # Serviço de proxy
│   ├── utils/
│   │   └── hateoas.ts              # Utilitários HATEOAS
│   └── docs/
│       ├── swaggerOptions.ts       # Configuração Swagger
│       ├── schemas.ts              # Schemas OpenAPI
│       └── tags.ts                 # Tags da documentação
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
```

## 🌐 CORS

O gateway está configurado para aceitar requisições de qualquer origem:

```typescript
app.use(cors());
```

Para produção, recomenda-se configurar origens específicas:

```typescript
app.use(cors({
  origin: ['https://seu-dominio.com'],
  credentials: true
}));
```

## 🔒 Segurança

Considerações de segurança:

- **Rate Limiting**: Considere adicionar rate limiting para prevenir abuso
- **Autenticação**: Adicione JWT ou OAuth se necessário
- **Validação**: Valide todas as entradas antes de fazer proxy
- **HTTPS**: Use HTTPS em produção
- **CORS**: Configure origens específicas em produção

## 🐛 Tratamento de Erros

O gateway propaga erros dos serviços backend:

```typescript
// Erro 404 do backend
{
  "error": "Recurso não encontrado"
}

// Erro 500 do backend
{
  "error": "Erro interno do servidor"
}

// Erro de conexão com backend
{
  "error": "Serviço temporariamente indisponível"
}
```

## 📊 Logs

O gateway registra:
- Porta de execução
- URL da documentação
- Requisições recebidas
- Erros de proxy

```
API Gateway rodando na porta 3000
Documentação: http://localhost:3000/docs
```

## 🔄 Proxy Service

O `restProxyService` encapsula a lógica de comunicação com a REST API:

```typescript
// Exemplo de uso
const users = await restProxyService.get('/users');
const newUser = await restProxyService.post('/users', userData);
const updated = await restProxyService.put('/users/123', userData);
await restProxyService.delete('/users/123');
```

Recursos:
- Tratamento de erros HTTP
- Timeout configurável
- Headers customizáveis
- Suporte a query parameters

## 🚦 Health Monitoring

Para monitorar a saúde dos serviços:

```bash
# Gateway
curl http://localhost:3000/health

# REST API (através do gateway)
curl http://localhost:3000/api/users

# WebSocket Server (direto)
curl http://localhost:4000/health
```

## 🔧 Configuração Avançada

### Timeout de Requisições

Ajuste o timeout no `restProxyService`:

```typescript
const response = await axios.get(url, {
  timeout: 5000 // 5 segundos
});
```

### Limites de Payload

Configurado no Express:

```typescript
app.use(express.json({ limit: "10mb" }));
```

### Headers Customizados

Adicione headers nas requisições proxy:

```typescript
const response = await axios.get(url, {
  headers: {
    'X-Request-ID': requestId,
    'Authorization': `Bearer ${token}`
  }
});
```

## 🔙 Voltar

[← Documentação Principal](../README.md)
