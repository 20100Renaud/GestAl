# GestAL
Gestion de consulations animales pour les professionnels

## Technos
- Backend
  - Node.js
  - Express
  - Prisma

- Frontend
  - Vite
  - React
  - Tailwind CSS

- Database
  - PostgresSQL

## Ports
- Backend: http://localhost:3000/
- Frontend: http://localhost:5173/
- Docker: http://localhost:5432/

## Commandes
```
~/GestAl/backend$ npm run dev
```
```
~/GestAl/backend$ docker compose up
```
```
~/GestAl/frontend$ npm run dev
```

## Tasks
1. protecting the frontend routes
```
                    ┌─────────────────┐
                    │     React       │
                    │   AuthContext   │
                    └────────┬────────┘
                             │
                       GET /auth/me
                             │
                             ▼
                    ┌─────────────────┐
                    │     Express     │
                    │ auth.middleware │
                    └────────┬────────┘
                             │
                      verify JWT
                             │
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │     Prisma      │
                    └─────────────────┘
```
Then on the frontend:
```
Not authenticated
       │
       ▼
    /login
       │
    login()
       │
       ▼
Authenticated
       │
       ▼
   /dashboard
```
And if somebody manually visits /dashboard without the cookie, React checks /auth/me and sends them back to /login.

2. Building the actual admin dashboard and then the CRUD API for your domain models (T_Proprietaires, T_Animaux, T_Consultations, etc.).