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
git clone <url-do-repositório>
cd to-do-api
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
PORT=3000
```

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

### Tarefas (Protegidas por JWT)

- `GET /tasks` - Listar todas as tarefas do usuário logado
- `GET /tasks?status=completed` - Filtrar tarefas por status
- `POST /tasks` - Criar uma nova tarefa
- `GET /tasks/:id` - Buscar uma tarefa específica
- `PUT /tasks/:id` - Atualizar uma tarefa
- `DELETE /tasks/:id` - Excluir uma tarefa

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

### Usuário
- `id`: string (PK)
- `name`: string
- `email`: string (único)
- `password`: string (hash)
- `role`: 'ADMIN' | 'USER'
- `createdAt`: Date

### Tarefa
- `id`: string (PK)
- `title`: string
- `description`: string (opcional)
- `status`: 'PENDING' | 'COMPLETED'
- `dueDate`: Date (opcional)
- `userId`: string (FK para User)
- `isActive`: boolean
- `createdAt`: Date
- `updatedAt`: Date

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

## Licença

Este projeto está licenciado sob a Licença MIT.
