# Configuração para Acesso Externo (Outras Máquinas na Rede)

Este guia explica como configurar o Kahoot Clone para permitir acesso de outras máquinas na mesma rede local.

## 📋 Pré-requisitos

1. Todos os serviços rodando na mesma máquina host
2. Firewall configurado para permitir as portas necessárias
3. Máquinas na mesma rede local

## 🔧 Configuração

### 1. Obter o IP da Máquina Host

**Windows (PowerShell):**
```powershell
ipconfig | Select-String -Pattern "IPv4"
```

**Linux/Mac:**
```bash
ifconfig | grep "inet "
# ou
ip addr show
```

Anote o IP da rede local (geralmente começa com `192.168.x.x` ou `10.x.x.x`).

### 2. Atualizar Variáveis de Ambiente

#### **Gateway** (`gateway/.env`)
```env
PORT=3000
REST_API_URL=http://localhost:3001/api
WS_URL=http://SEU_IP_AQUI:4000
```

Exemplo:
```env
WS_URL=http://192.168.1.100:4000
```

#### **Web Client** (`web-client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://SEU_IP_AQUI:3000/api
NEXT_PUBLIC_WS_URL=http://SEU_IP_AQUI:4000
```

Exemplo:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:3000/api
NEXT_PUBLIC_WS_URL=http://192.168.1.100:4000
```

#### **WS Server** (`ws-server/.env`)
```env
PORT=4000
REST_API_URL=http://localhost:3001/api
```
*Não precisa alteração se estiver na mesma máquina*

#### **REST API** (`rest-api/.env`)
```env
PORT=3001
DATABASE_URL=postgresql://dev:dev@localhost:5431/kahoot_dev
```
*Não precisa alteração se estiver na mesma máquina*

### 3. Configurar Next.js para Aceitar Conexões Externas

Já está configurado em `web-client/next.config.ts`:
```typescript
allowedDevOrigins: ['*']
```

### 4. Iniciar os Serviços

#### Opção 1: Iniciar Todos Manualmente

```bash
# Terminal 1 - Database
cd kahoot-clone
docker-compose up

# Terminal 2 - REST API
cd rest-api
npm install
npm run dev

# Terminal 3 - Gateway
cd gateway
npm install
npm run dev

# Terminal 4 - WebSocket Server
cd ws-server
npm install
npm run dev

# Terminal 5 - Web Client (IMPORTANTE: usar --hostname 0.0.0.0)
cd web-client
npm install
npm run dev -- --hostname 0.0.0.0
```

#### Opção 2: Script de Início (Criar)

Você pode criar um script para iniciar todos os serviços de uma vez.

### 5. Acessar de Outra Máquina

Na máquina remota, abra o navegador e acesse:
```
http://SEU_IP_AQUI:3001
```

Exemplo:
```
http://192.168.1.100:3001
```

## 🔍 Troubleshooting

### Problema: "Sala não encontrada"
**Causa:** Web client está tentando conectar ao localhost da máquina remota.

**Solução:** Verifique se o `.env.local` do web-client está usando o IP correto, não `localhost`.

### Problema: WebSocket não conecta
**Causa:** WS_URL no gateway ainda está com localhost.

**Solução:** Atualize `gateway/.env` com o IP correto em `WS_URL`.

### Problema: CORS errors
**Causa:** Configuração de CORS ou allowedDevOrigins.

**Solução:** 
1. Verifique se `allowedDevOrigins: ['*']` está em `next.config.ts`
2. Reinicie o servidor Next.js
3. Certifique-se de usar `--hostname 0.0.0.0` ao iniciar

### Problema: Conexão recusada
**Causa:** Firewall bloqueando as portas.

**Solução (Windows):**
```powershell
# Permitir portas no Firewall
New-NetFirewallRule -DisplayName "Kahoot Gateway" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Kahoot Web Client" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Kahoot WebSocket" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
```

## 🌐 Portas Usadas

| Serviço | Porta | Acesso Externo Necessário |
|---------|-------|---------------------------|
| Gateway | 3000 | ✅ Sim |
| REST API | 3001 | ❌ Não (apenas interno) |
| Web Client | 3001 (Next.js) | ✅ Sim |
| WebSocket | 4000 | ✅ Sim |
| Database | 5431 | ❌ Não (apenas interno) |

## 📝 Notas

1. **Desenvolvimento apenas**: Esta configuração é para ambiente de desenvolvimento. Em produção, use variáveis de ambiente apropriadas e configuração de rede adequada.

2. **IP Dinâmico**: Se o IP da máquina host mudar (comum em redes com DHCP), você precisará atualizar os arquivos `.env` novamente.

3. **Segurança**: Certifique-se de estar em uma rede confiável ao permitir acesso externo.

## ✅ Checklist de Configuração

- [ ] Obtive o IP da máquina host
- [ ] Atualizei `gateway/.env` com o IP correto em `WS_URL`
- [ ] Atualizei `web-client/.env.local` com os IPs corretos
- [ ] Configurei o firewall para permitir as portas
- [ ] Iniciei o banco de dados (Docker)
- [ ] Iniciei o REST API
- [ ] Iniciei o Gateway
- [ ] Iniciei o WebSocket Server
- [ ] Iniciei o Web Client com `--hostname 0.0.0.0`
- [ ] Testei o acesso de outra máquina

## 🎯 Resumo da Solução

**O problema principal era:**
- O web-client usava `localhost` nas variáveis de ambiente
- Quando acessado de outra máquina, o navegador tentava conectar ao localhost **daquela máquina**, não do servidor

**A solução:**
- Usar o IP da máquina host nas variáveis de ambiente que são usadas pelo navegador (client-side)
- O Gateway retorna a URL do WebSocket baseada em `WS_URL`
- O Web Client usa essas URLs para fazer as requisições corretas
