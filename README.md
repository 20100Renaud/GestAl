
# GestAL

Application de gestion de consultations animales destinée aux professionnels.

## Technologies

### Backend
- Node.js
- Express
- Prisma

### Frontend
- Vite
- React
- Tailwind CSS

### Base de données
- PostgreSQL
- Docker

## Installation

Installer les dépendances du projet :

```
npm install
```

Installer également les dépendances du backend et du frontend :

```
cd backend && npm install
cd ../frontend && npm install
```

## Lancement du projet

Le projet dispose d'un script centralisé permettant de démarrer simultanément les trois environnements :

- Docker : démarrage des conteneurs (PostgreSQL).
- Backend : serveur Express.
- Frontend : serveur Vite.

Depuis la racine du projet :

```
npm run dev
```

Le script `scripts/dev.js` utilise `concurrently` pour lancer les trois processus simultanément.

Chaque processus dispose de son propre nom et de sa propre couleur dans le terminal :
- DOCKER (bleu)
- BACKEND (vert)
- FRONTEND (magenta)

### Arrêt des serveurs

Pour arrêter l'ensemble des processus :

```
Ctrl + C
```

Le script :
1. Intercepte le signal d'arrêt (`SIGINT` ou `SIGTERM`).
2. Arrête les processus Docker, backend et frontend.
3. Exécute automatiquement `docker compose down`.
4. Supprime les conteneurs Docker.

**Important :** le volume PostgreSQL n'est pas supprimé. Les données de la base de données sont donc conservées.

## Scripts disponibles

Les scripts sont définis dans le `package.json` à la racine du projet.

| Commande | Description |
|---|---|
| `npm run dev` | Démarre Docker, le backend et le frontend |
| `npm run docker` | Démarre les conteneurs Docker |
| `npm run backend` | Démarre le serveur backend |
| `npm run frontend` | Démarre le serveur frontend |
| `npm run stop` | Arrête les conteneurs Docker |

## Services et ports

| Service | URL | Description |
|---|---|---|
| PostgreSQL | `localhost:5432` | Base de données |
| Prisma Studio | `localhost:5555` | Interface de gestion de la base de données |
| Backend | `http://localhost:3000` | API Express |
| Frontend | `http://localhost:5173` | Application React |

### PostgreSQL

Le service PostgreSQL est démarré automatiquement avec Docker Compose.

Pour démarrer uniquement Docker :

```
npm run docker
```

### Prisma Studio

Pour ouvrir l'interface graphique de Prisma :

```
cd backend
npx prisma studio
```

Accessible sur :

http://localhost:5555/

### Backend

Pour démarrer uniquement le backend :

```
npm run backend
```

Accessible sur :

http://localhost:3000/

### Frontend

Pour démarrer uniquement le frontend :

```
npm run frontend
```

Accessible sur :

http://localhost:5173/

## Business model

```text
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
