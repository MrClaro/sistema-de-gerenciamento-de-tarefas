# Sistema de Gerenciamento de Tarefas (To-Do API)

Uma API RESTful para gerenciamento de tarefas com autenticação e autorização, construída com NestJS e Prisma.

## Funcionalidades

- Autenticação de usuários com JWT
- Gerenciamento de usuários (criar, atualizar, listar, excluir)
- Gerenciamento de tarefas (criar, atualizar, listar, excluir)
- Controle de acesso baseado em roles (ADMIN e USER)
- Documentação da API com Swagger
- Banco de dados PostgreSQL com Prisma ORM

## Stack Tecnológica

- **Framework:** NestJS
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (hospedado no Neon)
- **ORM:** Prisma
- **Autenticação:** JWT
- **Documentação da API:** Swagger/OpenAPI
- **Gerenciador de Pacotes:** pnpm

## Pré-requisitos

- Node.js (v18 ou superior)
- pnpm
- Banco de dados PostgreSQL (ou conta no Neon)

## Começando

### 1. Clone o repositório

```bash
git clone git@github.com:MrClaro/sistema-de-gerenciamento-de-tarefas.git
cd sistema-de-gerenciamento-de-tarefas
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure o banco de dados

1. Crie uma conta no Neon em https://console.neon.tech
2. Crie um novo projeto
3. Selecione AWS e São Paulo como região
4. No dashboard, clique no botão "Connect"
5. Copie a URL de conexão

### 4. Configuração do ambiente

Crie um arquivo `.env` no diretório raiz com as seguintes variáveis(estão no .env.example):

```env
DATABASE_URL="sua-url-do-banco-neon"
JWT_SECRET="seu-segredo-jwt"
PORT="porta-do-servidor"
```

Caso você altere a porta, certifique-se de passar a porta correta quando for usar a API, a porta padrão é `3000`.

### 5. Configuração do banco de dados

```bash
# Gerar o Prisma Client
pnpm prisma generate

# Executar as migrações
pnpm prisma migrate dev
```

### 6. Executando a aplicação

```bash
# Desenvolvimento
pnpm start:dev

# Executando testes unitários
pnpm test

# Produção
pnpm build
pnpm start:prod
```

A API por padrão estará disponível em `http://localhost:3000`

## Documentação da API

Quando a aplicação estiver rodando, você pode acessar a documentação Swagger em:

```
http://localhost:3000/api
```

## Endpoints da API

### Autenticação

- `POST /auth/register` - Registrar um novo usuário
- `POST /auth/login` - Login e obtenção do token JWT

### Usuários (Protegidos por JWT)

- `GET /users` - Listar todos os usuários
- `POST /users` - Criar um novo usuário
- `GET /users/{id}` - Buscar um usuário específico
- `PATCH /users/{id}` - Atualizar um usuário
- `DELETE /users/{id}` - Excluir um usuário

### Tarefas (Protegidas por JWT)

- `GET /tasks` - Listar todas as tarefas do usuário logado
  - É possivel filtrar as tasks por um parametro de query chamado status que aceita - PENDING | COMPLETED
- `POST /tasks` - Criar uma nova tarefa
- `GET /tasks/{id}` - Buscar uma tarefa específica
- `PATCH /tasks/{id}` - Atualizar uma tarefa
- `DELETE /tasks/{id}` - Excluir uma tarefa

## Estrutura do Projeto

```
src/
├── auth/           # Módulo de autenticação
├── task/           # Módulo de gerenciamento de tarefas
├── user/           # Módulo de gerenciamento de usuários
├── database/       # Configuração do banco de dados
└── main.ts         # Ponto de entrada da aplicação
```

## Modelos de Dados

### Usuário (User)

- `id`: string (PK, UUID, VarChar(36))
- `name`: string
- `password`: string (hash)
- `email`: string (único)
- `role`: Role (enum: USER | ADMIN, default: USER)
- `isActive`: boolean (default: true)
- `tasks`: Task[] (relação um-para-muitos)
- `createdAt`: DateTime (default: now())
- `updatedAt`: DateTime (auto-updated)

### Tarefa (Task)

- `id`: string (PK, UUID, VarChar(36))
- `title`: string
- `description`: string (opcional)
- `status`: TaskStatus (enum: PENDING | COMPLETED, default: PENDING)
- `dueDate`: DateTime (opcional)
- `isActive`: boolean (default: true)
- `userId`: string (FK para User, VarChar(36))
- `user`: User (relação muitos-para-um)
- `createdAt`: DateTime (default: now())
- `updatedAt`: DateTime (auto-updated)

### Enums

#### Role

- `USER`
- `ADMIN`

#### TaskStatus

- `PENDING`
- `COMPLETED`

## Autenticação

Para acessar endpoints protegidos, inclua o token JWT no cabeçalho da requisição:

```
Authorization: Bearer seu-token-jwt
```

## Decisões Técnicas

1. **NestJS**: Escolhido por sua arquitetura robusta, suporte a TypeScript e recursos integrados para construir aplicações escaláveis.

2. **Prisma**: Selecionado por sua segurança de tipos, migrações automáticas e excelente integração com TypeScript.

3. **PostgreSQL com Neon**: Utilizado por sua confiabilidade e a conveniência do PostgreSQL serverless do Neon.

4. **Autenticação JWT**: Implementada para autenticação stateless e fácil integração com aplicações frontend.

5. **Controle de Acesso Baseado em Roles**: Implementado para restringir o acesso a certas operações com base nas roles dos usuários.

## Melhorias Futuras

1. Adicionar testes unitários e de integração
2. Implementar logs estruturados
3. Adicionar funcionalidade de recuperação de senha
4. Adicionar compartilhamento de tarefas entre usuários
5. Implementar categorias e tags para tarefas
6. Adicionar níveis de prioridade para tarefas
7. Implementar lembretes e notificações para tarefas

## Trello do Projeto
[Aperte aqui para ser redirecionado para o Quadro do Trello](https://trello.com/invite/b/683be60e38be541deee5b7c0/ATTIfbb758874c463718753f12258b07faf7728D9F0F/sistema-de-gerenciamento-de-tarefas-to-do-api)

## Licença

Este projeto está licenciado sob a Licença MIT.
