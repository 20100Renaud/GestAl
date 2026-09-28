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


## Commandes & ports

Database: http://localhost:5432/
```
~/GestAl/backend$ docker compose up
```
Studio: http://localhost:5173/
```
~/GestAl/backend$ npx prisma studio
```

Backend: http://localhost:3000/
```
~/GestAl/backend$ npm run dev
```

Frontend: http://localhost:5173/
```
~/GestAl/frontend$ npm run dev
```


## Business model

```
User
└── Propriétaires
    ├── Animaux
    └── Prestations
        ├── Date
        ├── Lieu
        ├── Déplacement
        ├── Remise
        ├── Consultations
        │   ├── Animal
        │   ├── Tarif
        │   └── Zonages
        └── Paiements

```
