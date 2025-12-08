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

O projeto segue uma arquitetura de microsserviços distribuídos com os seguintes componentes:

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
└──────┬──────┘   └─────┬──────┘   └────────────┘
       │                │
       └────────────────┤
                        │
                   ┌────▼────┐
                   │PostgreSQL│
                   │  (5431) │
                   └─────────┘
```

### Componentes

1. **Web Client** - Interface do usuário desenvolvida em Next.js e React
2. **API Gateway** - Ponto de entrada unificado que roteia requisições ([documentação](./gateway/README.md))
3. **REST API** - Serviço de gerenciamento de dados (usuários, quizzes, salas) ([documentação](./rest-api/README.md))
4. **WebSocket Server** - Servidor de comunicação em tempo real para gameplay ([documentação](./ws-server/README.md))
5. **PostgreSQL** - Banco de dados relacional para persistência

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web minimalista
- **Socket.IO** - Biblioteca para comunicação WebSocket em tempo real
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

### Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose instalados
- npm ou yarn

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/fonseca-plx/kahoot-clone.git
cd kahoot-clone
```

### Passo 2: Iniciar o Banco de Dados

```bash
docker-compose up -d
```

Isso iniciará o PostgreSQL na porta `5431`.

### Passo 3: Configurar e Iniciar a REST API

```bash
cd rest-api
npm install

# Configurar variáveis de ambiente
echo "DATABASE_URL=postgresql://dev:dev@localhost:5431/kahoot_dev" > .env
echo "PORT=3001" >> .env

# Executar migrations do banco de dados
npm run prisma:migrate

# Iniciar o servidor
npm run dev
```

A REST API estará disponível em `http://localhost:3001`
- Documentação Swagger: `http://localhost:3001/docs`

### Passo 4: Configurar e Iniciar o WebSocket Server

```bash
cd ws-server
npm install

# Configurar variáveis de ambiente
echo "PORT=4000" > .env
echo "REST_API_URL=http://localhost:3001/api" >> .env

# Iniciar o servidor
npm run dev
```

O WebSocket Server estará disponível em `http://localhost:4000`

### Passo 5: Configurar e Iniciar o API Gateway

```bash
cd gateway
npm install

# Configurar variáveis de ambiente
echo "PORT=3000" > .env
echo "REST_API_URL=http://localhost:3001/api" >> .env
echo "WS_SERVER_URL=http://localhost:4000" >> .env

# Iniciar o servidor
npm run dev
```

O API Gateway estará disponível em `http://localhost:3000`
- Documentação Swagger: `http://localhost:3000/docs`

### Passo 6: Configurar e Iniciar o Web Client

```bash
cd web-client
npm install

# Configurar variáveis de ambiente
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
echo "NEXT_PUBLIC_WS_URL=http://localhost:4000" >> .env.local

# Iniciar o servidor de desenvolvimento
npm run dev
```

O cliente web estará disponível em `http://localhost:3001` (ou a porta indicada pelo Next.js)

## 🧪 Como Testar

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

## 📚 Documentação Detalhada

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
