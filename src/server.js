const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Échoue au démarrage plutôt qu'à la première connexion si la config est incomplète
for (const name of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[name]) {
    console.error(`Variable d'environnement manquante : ${name}`);
    process.exit(1);
  }
}

const app = express();

// CORS_ORIGIN : une ou plusieurs origines séparées par des virgules (ex. https://monsite.com)
// Sans valeur, on autorise le frontend Vite local.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});