# 🐳 Docker Setup - Kahoot Clone

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+

## 🧹 Limpeza inicial (primeira execução ou problemas)

Se você tem containers antigos ou portas em uso:

```bash
# Limpar containers órfãos e volumes antigos
docker-compose down --remove-orphans -v

# Verificar se portas estão livres
sudo lsof -i :3000  # Gateway
sudo lsof -i :3001  # REST API
sudo lsof -i :3002  # Web Client
sudo lsof -i :4000  # WS Server
sudo lsof -i :5432  # PostgreSQL

# Se PostgreSQL do sistema estiver rodando, pare-o
sudo systemctl stop postgresql

# Agora inicie o projeto
docker-compose up --build
```

## 🚀 Iniciando o projeto

### 1. Construir e iniciar todos os serviços

```bash
# Em foreground (ver logs em tempo real)
docker-compose up --build

# Em background
docker-compose up -d --build
```

### 2. Verificar status dos containers

```bash
docker-compose ps
```

### 3. Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f web-client
docker-compose logs -f gateway
docker-compose logs -f rest-api
docker-compose logs -f ws-server
docker-compose logs -f postgres
```

## 🌐 URLs de acesso

| Serviço | URL Local | Porta |
|---------|-----------|-------|
| Web Client | http://localhost:3002 | 3002 |
| Gateway API | http://localhost:3000 | 3000 |
| REST API | http://localhost:3001 | 3001 |
| WebSocket Server | http://localhost:4000 | 4000 |
| PostgreSQL | localhost:5432 | 5432 |

## 📱 Acesso via rede local

Para acessar de outros dispositivos na mesma rede (celular, tablet, outro PC):

### 1. Descubra seu IP local

```bash
# Linux
hostname -I | awk '{print $1}'

# Ou
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
```

### 2. Acesse usando o IP

- Web Client: `http://192.168.x.x:3002`
- Gateway API: `http://192.168.x.x:3000`

### 3. Configuração necessária

Se quiser que o web-client acesse o gateway via IP da rede local, você precisa:

1. Parar os containers:
   ```bash
   docker-compose down
   ```

2. Editar `docker-compose.yml` e alterar a variável de ambiente do web-client:
   ```yaml
   web-client:
     environment:
       NEXT_PUBLIC_API_URL: http://192.168.x.x:3000  # Substitua pelo seu IP
   ```

3. Reiniciar:
   ```bash
   docker-compose up -d
   ```

## 🛠️ Comandos úteis

### Parar containers

```bash
# Parar todos
docker-compose stop

# Parar um específico
docker-compose stop web-client
```

### Reiniciar containers

```bash
# Reiniciar todos
docker-compose restart

# Reiniciar um específico
docker-compose restart gateway
```

### Remover containers

```bash
# Parar e remover containers
docker-compose down

# Parar, remover containers E volumes (limpa banco de dados)
docker-compose down -v
```

### Reconstruir um serviço específico

```bash
docker-compose up -d --build rest-api
```

### Executar comandos dentro de um container

```bash
# Prisma Studio (gerenciar banco de dados)
docker-compose exec rest-api npx prisma studio

# Bash interativo
docker-compose exec rest-api sh
docker-compose exec gateway sh

# Ver variáveis de ambiente
docker-compose exec gateway env
```

### Limpar recursos Docker

```bash
# Remover containers parados
docker container prune

# Remover imagens não utilizadas
docker image prune

# Remover volumes não utilizados
docker volume prune

# Limpar tudo (cuidado!)
docker system prune -a --volumes
```

## 🗄️ Banco de Dados

### Acessar PostgreSQL

```bash
# Via docker-compose
docker-compose exec postgres psql -U dev -d kahoot_dev

# Ou conectar via cliente externo
# Host: localhost
# Port: 5432
# User: dev
# Password: dev
# Database: kahoot_dev
```

### Executar migrations

```bash
# Dentro do container rest-api
docker-compose exec rest-api npx prisma migrate deploy

# Criar nova migration
docker-compose exec rest-api npx prisma migrate dev --name nome_da_migration

# Gerar Prisma Client
docker-compose exec rest-api npx prisma generate
```

## 🔧 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs rest-api

# Reconstruir imagem
docker-compose build --no-cache rest-api
docker-compose up -d rest-api
```

### Porta já em uso

```bash
# Verificar processos usando a porta
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :4000

# Matar processo
kill -9 <PID>
```

### Problemas com volumes

```bash
# Remover volumes e recriar
docker-compose down -v
docker-compose up -d --build
```

### Banco de dados não conecta

```bash
# Verificar se o Postgres está rodando
docker-compose ps postgres

# Ver logs do Postgres
docker-compose logs postgres

# Resetar banco de dados
docker-compose down -v
docker-compose up -d postgres
```

### Web Client com erro de conexão

Verifique se `NEXT_PUBLIC_API_URL` está correto:

```bash
docker-compose exec web-client env | grep NEXT_PUBLIC
```

## 📊 Monitoramento

### Ver recursos usados pelos containers

```bash
docker stats
```

### Ver informações de rede

```bash
docker network inspect kahoot-clone_kahoot-network
```

## 🔄 Desenvolvimento

### Hot reload está funcionando?

Sim! Os volumes estão configurados para sincronizar o código:

```yaml
volumes:
  - ./rest-api:/app        # Código sincronizado
  - /app/node_modules      # node_modules isolado no container
```

Basta editar os arquivos localmente e o container detectará as mudanças automaticamente.

### Instalar nova dependência

```bash
# Opção 1: Instalar no container
docker-compose exec rest-api npm install nova-dependencia

# Opção 2: Instalar localmente e reconstruir
npm install nova-dependencia
docker-compose up -d --build rest-api
```

## 🎯 Comandos rápidos

```bash
# Iniciar tudo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Resetar tudo (incluindo banco)
docker-compose down -v && docker-compose up -d --build

# Ver status
docker-compose ps

# Acessar shell do container
docker-compose exec rest-api sh
```

## 📝 Notas importantes

1. **Primeira execução**: O banco de dados demora alguns segundos para estar pronto. O healthcheck garante que os outros serviços só iniciem quando o Postgres estiver disponível.

2. **Hot reload**: Funciona automaticamente. Não precisa reconstruir imagens durante desenvolvimento.

3. **node_modules**: Cada container tem seu próprio `node_modules` isolado. Isso evita conflitos entre dependências do host e do container.

4. **Persistência**: Os dados do PostgreSQL são persistidos no volume `postgres_data`. Para limpar, use `docker-compose down -v`.

5. **Rede local**: Para acessar de outros dispositivos, certifique-se de que o firewall permite conexões nas portas 3000, 3001, 3002 e 4000.
