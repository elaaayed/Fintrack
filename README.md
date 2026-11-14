# FinTrack

Application web de suivi de finances personnelles : créez vos comptes bancaires, enregistrez vos revenus et dépenses, et suivez votre solde en un coup d'œil.

Le projet est composé de deux applications indépendantes, chacune sur sa propre branche de ce dépôt :

| Branche | Rôle |
|---|---|
| [`backend`](../../tree/backend) | API REST (Node.js, Express, Prisma, PostgreSQL) |
| [`frontend`](../../tree/frontend) | Interface web (React, Vite) |
| `main` | Ce README, point d'entrée du projet |

## Fonctionnalités

- Inscription et connexion (JWT, mots de passe hachés avec bcrypt)
- Gestion de plusieurs comptes (courant ou épargne) avec solde initial
- Ajout et suppression de transactions depuis le dashboard (modification disponible via l'API)
- Catégories de revenus et de dépenses (Salaire, Loyer, Courses, etc.)
- Solde par compte = solde initial + revenus - dépenses
- Validation des données côté API (email, mot de passe d'au moins 8 caractères, montants positifs, dates)
- Session conservée au rafraîchissement de la page
- Routes protégées côté API (token Bearer) et côté interface

## Stack technique

**Backend**
- Node.js, Express 5
- Prisma 7 avec l'adapter `@prisma/adapter-pg` et le driver `pg`
- PostgreSQL (hébergé sur Neon)
- `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`
- `nodemon` pour le développement

**Frontend**
- React 19, Vite 8
- React Router 7
- Axios (intercepteur qui ajoute automatiquement le token)
- Recharts (graphiques)
- ESLint 10

## Structure du projet

Une fois les deux branches clonées côte à côte :

```
fintrack/
├── fintrack-backend/          # branche backend
│   ├── prisma/
│   │   ├── schema.prisma        # Modèles : User, Account, Category, Transaction
│   │   ├── migrations/
│   │   └── seed.js              # Catégories par défaut (relançable sans doublons)
│   ├── src/
│   │   ├── controllers/         # Logique métier
│   │   ├── middleware/          # Authentification JWT
│   │   ├── routes/
│   │   ├── prismaClient.js
│   │   └── server.js
│   ├── .env.example
│   └── prisma.config.ts
└── fintrack-frontend/         # branche frontend
    ├── .env.example
    └── src/
        ├── api/axiosClient.js   # Client HTTP configuré
        ├── context/AuthContext.jsx
        ├── pages/               # Login, Register, Dashboard
        └── App.jsx              # Routes
```

## Prérequis

- Node.js 20 ou supérieur
- npm
- Une base PostgreSQL (locale, ou gratuite sur [Neon](https://neon.tech))

## Installation

### 1. Cloner le projet

Chaque application se clone depuis sa branche :

```bash
mkdir fintrack && cd fintrack
git clone -b backend https://github.com/elaaayed/Fintrack.git fintrack-backend
git clone -b frontend https://github.com/elaaayed/Fintrack.git fintrack-frontend
```

### 2. Backend

```bash
cd fintrack-backend
npm install
```

Copiez le fichier d'exemple puis renseignez vos valeurs :

```bash
cp .env.example .env
```

| Variable | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | oui | Chaîne de connexion PostgreSQL |
| `JWT_SECRET` | oui | Secret de signature des tokens |
| `PORT` | non | Port de l'API (défaut : 3000) |
| `CORS_ORIGIN` | non | Origines autorisées, séparées par des virgules (défaut : `http://localhost:5173`) |

L'API refuse de démarrer si `DATABASE_URL` ou `JWT_SECRET` est absent.

> Générez un secret solide avec : `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Appliquez les migrations, générez le client Prisma, puis insérez les catégories par défaut :

```bash
npx prisma migrate deploy
npx prisma generate
node prisma/seed.js
```

> Le seed peut être relancé sans risque : les catégories déjà présentes ne sont pas recréées.

Démarrez l'API :

```bash
npm run dev
```

L'API est disponible sur `http://localhost:3000`.

### 3. Frontend

Dans un second terminal :

```bash
cd fintrack-frontend
npm install
cp .env.example .env   # optionnel si l'API tourne sur http://localhost:3000
npm run dev
```

L'interface est disponible sur `http://localhost:5173`.

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL de l'API (défaut : `http://localhost:3000/api`) |

## Scripts disponibles

**Backend**

| Commande | Description |
|---|---|
| `npm run dev` | Lance l'API avec rechargement automatique (nodemon) |

**Frontend**

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualise le build |
| `npm run lint` | Analyse du code avec ESLint |

## API

Toutes les routes, sauf `register` et `login`, nécessitent l'en-tête `Authorization: Bearer <token>`.

### Santé

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/health` | Vérifie que l'API répond (sans authentification) |

### Authentification

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte utilisateur (mot de passe de 8 caractères minimum) |
| POST | `/api/auth/login` | Se connecter (retourne un token valable 7 jours) |
| GET | `/api/auth/me` | Profil de l'utilisateur connecté |

### Comptes

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/accounts` | Liste des comptes de l'utilisateur |
| POST | `/api/accounts` | Créer un compte (`name`, `type` : `CHECKING` ou `SAVINGS`, `initialBalance?`) |

### Transactions

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/transactions/account/:accountId` | Transactions d'un compte, de la plus récente à la plus ancienne |
| POST | `/api/transactions` | Créer une transaction (`accountId`, `categoryId`, `amount` positif, `date`, `description?`) |
| PATCH | `/api/transactions/:id` | Modifier une transaction |
| DELETE | `/api/transactions/:id` | Supprimer une transaction |

### Catégories

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/categories` | Liste des catégories |

## Modèle de données

- **User** : email, mot de passe haché, prénom, nom, date de naissance
- **Account** : nom, type (`CHECKING` / `SAVINGS`), solde initial, rattaché à un utilisateur
- **Category** : nom, type (`INCOME` / `EXPENSE`)
- **Transaction** : montant, description, date, `isAnomaly`, rattachée à un compte et une catégorie