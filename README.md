# FormFlow

A SaaS platform for creating and managing online forms.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript, Prisma
- **Database:** PostgreSQL
- **Infrastructure:** Docker, Redis

## Project Structure

```
formflow/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── docker-compose.yml
├── package.json      # npm workspaces root
└── .env
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose

### Setup

1. **Start the database:**
   ```bash
   npm run db:up
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate Prisma client & run migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health check: http://localhost:3001/api/health

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all dev servers |
| `npm run dev:api` | Start API only |
| `npm run dev:web` | Start frontend only |
| `npm run build` | Build all apps |
| `npm run db:up` | Start Docker services |
| `npm run db:down` | Stop Docker services |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
