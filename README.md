# Projeto: Vercel + MongoDB Auth

Projeto simples de cadastro e login usando Vercel Serverless Functions e MongoDB (Mongoose).

## Como usar

1. Instale o Vercel CLI (opcional, para desenvolvimento local):
   ```bash
   npm i -g vercel
   ```

2. Copie `.env.example` para `.env` e preencha `MONGODB_URI` e `JWT_SECRET`.

3. Instale dependências:
   ```bash
   npm install
   ```

4. Rodar localmente com `vercel dev` (recomendado):
   ```bash
   vercel dev
   ```

5. Deploy:
   - Crie um projeto no Vercel e adicione as variáveis de ambiente (`MONGODB_URI` e `JWT_SECRET`) no painel do Vercel.
   - Rode `vercel --prod` para fazer deploy.

## Notas de segurança e dicas 🔒

- Nunca comite `.env` com credenciais no repositório. Use o painel de Environment Variables do Vercel.
- Use um `JWT_SECRET` forte (string longa e aleatória). No ambiente de produção, mantenha-a fora do código.
- Para produção, considere adicionar validações mais robustas e proteger contra brute-force (rate limiting) e tentativas de enumeração de usuários.

## Endpoints

- `POST /api/register` — body: `{ "name": "...", "email": "...", "password": "..." }` — cria usuário (o campo `name` agora é obrigatório)
- `POST /api/login` — body: `{ "email": "...", "password": "..." }` — seta cookie HttpOnly com o token e retorna `{ message }`
- `GET /api/me` — retorna `{ user }` (inclui `name`) se autenticado via cookie
- `POST /api/logout` — limpa o cookie e encerra a sessão

## Testando localmente ✅

- Inicie com `vercel dev` (ele carrega `.env` automaticamente):
  ```bash
  vercel dev
  ```

- Usando curl (Windows PowerShell):
  ```powershell
  curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d '{"email":"teste@example.com","password":"senha123"}'
  curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"email":"teste@example.com","password":"senha123"}'
  ```

- A resposta de login terá `{ "token": "..." }`. Você pode salvar o token no `localStorage` no frontend ou usá-lo ao acessar rotas protegidas.

## Estrutura do projeto

- `api/` - funções serverless (`register.js`, `login.js`)
- `lib/` - utilitários (conexão com MongoDB)
- `models/` - modelos Mongoose (`User.js`)
- `public/` - páginas estáticas (signup, login)


## Estrutura

- `api/` - funções serverless (`register.js`, `login.js`)
- `lib/` - utilitários (conexão com MongoDB)
- `public/` - páginas estáticas (signup, login)

