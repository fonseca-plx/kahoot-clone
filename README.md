# Kahoot Clone

Um clone do Kahoot desenvolvido como projeto acadêmico para a disciplina de Desenvolvimento de Sistemas Distribuídos do IFRN. O sistema permite criar quizzes interativos e realizar partidas em tempo real com múltiplos jogadores.

## 📋 Sobre o Projeto

Este projeto implementa uma aplicação de quiz em tempo real inspirada no Kahoot, utilizando uma arquitetura de microsserviços distribuídos. O sistema permite que professores/hosts criem quizzes e conduzam sessões de jogo onde múltiplos jogadores podem participar simultaneamente através de seus dispositivos.

### Principais Funcionalidades

- **Criação de Quizzes**: Interface para criar e gerenciar questionários com múltiplas questões
- **Salas de Jogo**: Sistema de salas com códigos únicos para acesso dos jogadores
- **Gameplay em Tempo Real**: Sincronização em tempo real de perguntas, respostas e pontuação
- **Leaderboard Dinâmico**: Ranking atualizado em tempo real baseado em acertos e velocidade
- **Múltiplos Jogadores**: Suporte para várias sessões simultâneas com múltiplos participantes

## 🏗️ Arquitetura

O projeto segue uma arquitetura de microsserviços distribuídos com mensageria assíncrona:

```
┌─────────────┐
│ Web Client  │ (Next.js + React)
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
┌──────▼──────┐   ┌─────▼──────┐   ┌─────▼──────┐
│ API Gateway │   │  REST API  │   │ WS Server  │
│   (3000)    │   │   (3001)   │   │   (4000)   │
└──────┬──────┘   └─────┬──────┘   └─────┬──────┘
       │                │                 │
       └────────────────┤                 │
                        │                 │
                   ┌────▼────┐      ┌─────▼──────┐
                   │PostgreSQL│      │ RabbitMQ   │
                   │  (5432) │      │  (5672)    │
                   └─────────┘      └────────────┘
                                    Message Broker
```

### Componentes

1. **Web Client** - Interface do usuário desenvolvida em Next.js e React
2. **API Gateway** - Ponto de entrada unificado que roteia requisições ([documentação](./gateway/README.md))
3. **REST API** - Serviço de gerenciamento de dados (usuários, quizzes, salas) ([documentação](./rest-api/README.md))
4. **WebSocket Server** - Servidor de comunicação em tempo real para gameplay ([documentação](./ws-server/README.md))
5. **RabbitMQ** - Message Broker (MOM) para comunicação assíncrona entre serviços
6. **PostgreSQL** - Banco de dados relacional para persistência

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web minimalista
- **Socket.IO** - Biblioteca para comunicação WebSocket em tempo real
- **RabbitMQ** - Message Broker para mensageria assíncrona (AMQP)
- **amqplib** - Cliente Node.js para RabbitMQ
- **Prisma** - ORM moderno para Node.js e TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Swagger** - Documentação interativa de APIs

### Frontend
- **Next.js 16** - Framework React com SSR e SSG
- **React 19** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Socket.IO Client** - Cliente WebSocket

### DevOps
- **Docker & Docker Compose** - Containerização
- **ts-node-dev** - Desenvolvimento com hot reload

## 🚀 Como Executar o Projeto

### 🐳 Execução com Docker (Recomendado)

A forma mais rápida e confiável de executar o projeto é usando Docker Compose:

```bash
# 1. Clonar o repositório
git clone https://github.com/fonseca-plx/kahoot-clone.git
cd kahoot-clone

# 2. Iniciar todos os serviços
docker-compose up --build

# Ou em background
docker-compose up -d --build
```

**Serviços disponíveis:**
- Web Client: http://localhost:3002
- API Gateway: http://localhost:3000
- REST API: http://localhost:3001
- WebSocket Server: http://localhost:4000
- RabbitMQ Management: http://localhost:15672 (user: `kahoot`, pass: `kahoot123`)
- PostgreSQL: localhost:5432

**📖 Documentação completa do Docker:** [DOCKER_SETUP.md](./DOCKER_SETUP.md)

---

### ⚙️ Execução Manual (Desenvolvimento)

<details>
<summary>Clique para ver instruções de execução manual</summary>

#### Pré-requisitos
- Node.js 18+
- Docker (apenas para PostgreSQL e RabbitMQ)
- npm ou yarn

#### 1. Iniciar infraestrutura

```bash
docker-compose up -d postgres rabbitmq
```

#### 2. REST API

```bash
cd rest-api
npm install
echo "DATABASE_URL=postgresql://dev:dev@localhost:5432/kahoot_dev" > .env
echo "PORT=3001" >> .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

#### 3. WebSocket Server

```bash
cd ws-server
npm install
echo "PORT=4000" > .env
echo "REST_API_URL=http://localhost:3001/api" >> .env
echo "RABBITMQ_URL=amqp://kahoot:kahoot123@localhost:5672" >> .env
npm run dev
```

#### 4. API Gateway

```bash
cd gateway
npm install
echo "PORT=3000" > .env
echo "REST_API_URL=http://localhost:3001/api" >> .env
npm run dev
```

#### 5. Web Client

```bash
cd web-client
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev
```

</details>

## 🧪 Como Testar

### Teste de Conexão RabbitMQ

Verifique se o message broker está funcionando:

```bash
cd ws-server
npm run test:rabbitmq
```

**RabbitMQ Management UI**: http://localhost:15672
- User: `kahoot`
- Pass: `kahoot123`
- Verifique exchanges: `kahoot.room.events` e `kahoot.game.events`

### Teste Manual Completo

1. **Acessar a Aplicação**: Abra `http://localhost:3001` no navegador

2. **Criar um Quiz**:
   - Navegue até a área de criação de quiz
   - Adicione perguntas com múltiplas alternativas
   - Salve o quiz

3. **Criar uma Sala**:
   - Selecione um quiz criado
   - Crie uma nova sala de jogo
   - Anote o código da sala gerado

4. **Participar como Jogador** (em outra aba/janela):
   - Acesse `/join`
   - Insira seu nome e o código da sala
   - Aguarde o host iniciar a partida

5. **Jogar**:
   - O host inicia a partida
   - Jogadores respondem às perguntas em tempo real
   - Acompanhe o leaderboard sendo atualizado
   - Veja os resultados finais ao término

### Teste de Fluxo de Sala (WebSocket)

O ws-server inclui um script de teste automatizado:

```bash
cd ws-server
npm run test
```

Este teste simula:
- Criação de sala
- Entrada de jogadores
- Início de partida
- Respostas às questões
- Progressão entre perguntas
- Finalização da partida

### Testar APIs via Swagger

- **API Gateway**: `http://localhost:3000/docs`
- **REST API**: `http://localhost:3001/docs`

Use a interface Swagger para testar endpoints individualmente.

### Verificar Saúde dos Serviços

```bash
# REST API
curl http://localhost:3001/api/users

# WebSocket Server
curl http://localhost:4000/health

# API Gateway
curl http://localhost:3000/health
```

## ⚡ Escalabilidade Horizontal

Com RabbitMQ como Message Broker, o sistema suporta múltiplas instâncias do WebSocket Server:

```bash
# Adicionar segunda instância ao docker-compose.yml
# e executar:
docker-compose up --scale ws-server=3
```

**Benefícios:**
- ✅ Load balancing automático
- ✅ Alta disponibilidade
- ✅ Eventos compartilhados entre instâncias
- ✅ Suporte a milhares de jogadores simultâneos

## 📚 Documentação Detalhada

- **[Configuração Docker](./DOCKER_SETUP.md)** - Guia completo de Docker e Docker Compose
- **[API Gateway](./gateway/README.md)** - Documentação do gateway de APIs
- **[REST API](./rest-api/README.md)** - Documentação da API REST
- **[WebSocket Server](./ws-server/README.md)** - Documentação do servidor WebSocket

## 🗂️ Estrutura do Projeto

```
kahoot-clone/
├── gateway/          # API Gateway (porta 3000)
├── rest-api/         # REST API + Prisma (porta 3001)
├── ws-server/        # WebSocket Server (porta 4000)
├── web-client/       # Frontend Next.js
├── docker-compose.yml # Configuração do banco de dados
└── README.md         # Este arquivo
```

## 📄 Licença

Este projeto é um trabalho acadêmico desenvolvido para fins educacionais.
