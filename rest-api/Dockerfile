FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL (necessário para Prisma)
RUN apk add --no-cache openssl

# Copiar package.json e package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3001

# Comando padrão
CMD ["npm", "run", "dev"]
