# WebSocket Server - Kahoot Clone

Servidor WebSocket para comunicação em tempo real do sistema Kahoot Clone. Gerencia a lógica de jogo, sincronização de estado entre jogadores e host, e orquestração de partidas.

## 📋 Visão Geral

Este servidor utiliza Socket.IO para estabelecer conexões bidirecionais em tempo real entre o host da partida e os jogadores. É responsável por:

- Gerenciar conexões de múltiplos jogadores em salas distintas
- Sincronizar estado do jogo entre todos os participantes
- Controlar fluxo de perguntas e respostas
- Calcular pontuações em tempo real
- Atualizar e distribuir leaderboard
- Coordenar início e fim de partidas

## 🛠️ Tecnologias

- **Socket.IO** - Biblioteca WebSocket para comunicação em tempo real
- **Express** - Framework web para endpoints HTTP
- **TypeScript** - Tipagem estática
- **Axios** - Cliente HTTP para integração com REST API
- **nanoid** - Geração de IDs únicos

## 🎮 Fluxo do Jogo

```
1. Host cria sala na REST API
2. Host conecta ao WS Server (room:host)
3. Jogadores conectam ao WS Server (player:join)
4. Host inicia partida (game:start)
5. WS Server carrega questão da REST API
6. WS Server envia questão para todos (question:new)
7. Jogadores enviam respostas (player:answer)
8. Timer expira ou todos respondem
9. WS Server calcula pontos e atualiza leaderboard
10. Host avança para próxima questão (game:nextQuestion)
11. Repete passos 5-10 até acabar questões
12. WS Server envia resultados finais (game:end)
```

## 🔌 Eventos WebSocket

### Eventos do Host

#### `room:host`
Host se conecta à sala

**Payload:**
```typescript
{
  roomCode: string;
  hostId: string;
}
```

**Response:** `room:host:success` ou `room:host:error`

#### `game:start`
Inicia a partida

**Payload:**
```typescript
{
  roomCode: string;
}
```

**Response:** `game:started` (broadcast)

**Emite:** `question:new` (primeira questão)

#### `game:nextQuestion`
Avança para a próxima questão

**Payload:**
```typescript
{
  roomCode: string;
}
```

**Emite:** `question:new` ou `game:end`

#### `game:forceEnd`
Força o término da partida

**Payload:**
```typescript
{
  roomCode: string;
}
```

**Emite:** `game:end` (broadcast)

### Eventos dos Jogadores

#### `player:join`
Jogador entra na sala

**Payload:**
```typescript
{
  roomCode: string;
  playerName: string;
}
```

**Response:** `player:joined` ou `player:join:error`

**Emite:** `room:players:update` (broadcast para todos na sala)

#### `player:answer`
Jogador envia resposta

**Payload:**
```typescript
{
  roomCode: string;
  playerId: string;
  answerId: string;
  timeSpent: number; // ms gastos para responder
}
```

**Response:** `answer:result` (para o jogador)

**Emite:** `leaderboard:update` (broadcast quando todos respondem)

### Eventos Recebidos (Server → Client)

#### `room:host:success`
Confirmação de conexão do host

```typescript
{
  message: string;
  roomCode: string;
}
```

#### `player:joined`
Confirmação de entrada do jogador

```typescript
{
  playerId: string;
  playerName: string;
  roomCode: string;
}
```

#### `room:players:update`
Atualização da lista de jogadores

```typescript
{
  players: Array<{
    id: string;
    name: string;
    score: number;
  }>;
}
```

#### `game:started`
Partida iniciada

```typescript
{
  message: string;
  totalQuestions: number;
}
```

#### `question:new`
Nova questão disponível

```typescript
{
  questionIndex: number;
  totalQuestions: number;
  question: {
    id: string;
    text: string;
    imageUrl?: string;
    timeLimit: number;
    points: number;
    answers: Array<{
      id: string;
      text: string;
      // isCorrect NÃO é enviado para jogadores
    }>;
  };
}
```

#### `answer:result`
Resultado da resposta do jogador

```typescript
{
  correct: boolean;
  points: number;
  correctAnswerId: string;
}
```

#### `leaderboard:update`
Atualização do ranking

```typescript
{
  leaderboard: Array<{
    id: string;
    name: string;
    score: number;
    rank: number;
  }>;
}
```

#### `game:end`
Fim da partida

```typescript
{
  finalLeaderboard: Array<{
    id: string;
    name: string;
    score: number;
    rank: number;
  }>;
  totalQuestions: number;
}
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- REST API rodando em `http://localhost:3001`
- npm ou yarn

### Instalação

```bash
cd ws-server
npm install
```

### Configuração de Variáveis de Ambiente

Crie um arquivo `.env`:

```env
PORT=4000
REST_API_URL=http://localhost:3001/api
```

### Executar em Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:4000`

### Build para Produção

```bash
npm run build
npm start
```

## 🧪 Testando o WebSocket Server

### Teste Automatizado

O projeto inclui um script de teste completo:

```bash
npm run test
```

Este script simula:
1. Criação de sala e quiz via REST API
2. Conexão do host
3. Conexão de 3 jogadores
4. Início da partida
5. Recebimento de questões
6. Envio de respostas (corretas e incorretas)
7. Atualização do leaderboard
8. Progressão entre questões
9. Finalização da partida

### Teste Manual com Socket.IO Client

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

// Como jogador
socket.emit('player:join', {
  roomCode: 'ABC123',
  playerName: 'João'
});

socket.on('player:joined', (data) => {
  console.log('Entrou na sala:', data);
});

socket.on('question:new', (question) => {
  console.log('Nova questão:', question);
  
  // Responder após 2 segundos
  setTimeout(() => {
    socket.emit('player:answer', {
      roomCode: 'ABC123',
      playerId: data.playerId,
      answerId: question.question.answers[0].id,
      timeSpent: 2000
    });
  }, 2000);
});

socket.on('answer:result', (result) => {
  console.log('Resultado:', result);
});

socket.on('leaderboard:update', (leaderboard) => {
  console.log('Ranking:', leaderboard);
});
```

### Health Check

```bash
curl http://localhost:4000/health
```

Resposta:
```json
{
  "status": "ok",
  "service": "ws-server"
}
```

## 💡 Lógica de Pontuação

A pontuação é calculada com base em:

1. **Acerto**: Resposta correta é obrigatória
2. **Velocidade**: Quanto mais rápido, mais pontos
3. **Pontos Base**: Definidos na questão (ex: 1000 pontos)

### Fórmula

```typescript
if (resposta correta) {
  pontos = pontosBase * (1 - (tempoGasto / tempoLimite) * 0.5);
} else {
  pontos = 0;
}
```

**Exemplo:**
- Pontos da questão: 1000
- Tempo limite: 30 segundos
- Tempo gasto: 5 segundos

```
pontos = 1000 * (1 - (5 / 30) * 0.5)
pontos = 1000 * (1 - 0.0833)
pontos = 1000 * 0.9167
pontos = 917 (arredondado)
```

- Resposta imediata (0s): 1000 pontos (100%)
- Resposta na metade do tempo (15s): 750 pontos (75%)
- Resposta no limite (30s): 500 pontos (50%)
- Resposta incorreta: 0 pontos

## 📁 Estrutura do Projeto

```
ws-server/
├── src/
│   ├── index.ts                # Entrada e configuração Socket.IO
│   ├── types.ts                # Tipos TypeScript
│   ├── controller/
│   │   └── gameController.ts   # Lógica dos eventos do jogo
│   ├── services/
│   │   ├── roomService.ts      # Gerenciamento de salas
│   │   ├── playerService.ts    # Gerenciamento de jogadores
│   │   ├── gameService.ts      # Lógica do jogo
│   │   └── restApiService.ts   # Integração com REST API
│   └── utils/
│       └── scoreCalculator.ts  # Cálculo de pontuação
├── tests/
│   └── testRoomFlow.ts         # Teste automatizado
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

# Executar teste automatizado
npm run test
```

## 🗃️ Gerenciamento de Estado

O servidor mantém estado em memória para cada sala:

```typescript
interface Room {
  code: string;
  hostSocketId: string;
  quiz: Quiz;
  currentQuestionIndex: number;
  players: Map<string, Player>;
  answeredPlayers: Set<string>;
  status: 'waiting' | 'active' | 'finished';
}

interface Player {
  id: string;
  name: string;
  socketId: string;
  score: number;
  answers: Map<number, Answer>;
}
```

## 🔒 Validações e Segurança

- **Códigos de Sala**: Validação de existência e status
- **Jogadores Duplicados**: Prevenção de múltiplas conexões do mesmo jogador
- **Host Único**: Apenas um host por sala
- **Respostas Duplicadas**: Jogador só pode responder uma vez por questão
- **Timeout**: Implementação de limites de tempo por questão
- **Desconexões**: Tratamento de desconexões abruptas

## 🐛 Tratamento de Erros

Eventos de erro são emitidos para o cliente:

```typescript
// Sala não encontrada
socket.emit('player:join:error', {
  error: 'Sala não encontrada'
});

// Sala já iniciada
socket.emit('player:join:error', {
  error: 'Sala já iniciou'
});

// Host não autorizado
socket.emit('room:host:error', {
  error: 'Não autorizado'
});
```

## 🔗 Integração com REST API

O WebSocket Server consulta a REST API para:

1. **Validar salas**: Verificar se código existe e status
2. **Carregar quizzes**: Obter questões e respostas
3. **Atualizar status**: Marcar sala como ativa/finalizada
4. **Avançar questões**: Atualizar índice da questão atual

Endpoints utilizados:
- `GET /api/rooms/code/:code` - Buscar sala por código
- `GET /api/quizzes/:id` - Carregar quiz com questões
- `PATCH /api/rooms/:id/status` - Atualizar status
- `PATCH /api/rooms/:id/question` - Avançar questão

## 📊 Logs e Monitoramento

O servidor registra:
- Conexões e desconexões de clientes
- Eventos do jogo (início, respostas, fim)
- Erros e exceções
- URL da REST API configurada

```
✅ WS Server rodando na porta 4000
📡 REST API URL: http://localhost:3001/api
```

## 🔙 Voltar

[← Documentação Principal](../README.md)
