const prisma = require('../prismaClient');

async function createAccount(req, res) {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Nom et type requis' });
    }

    if (!['CHECKING', 'SAVINGS'].includes(type)) {
      return res.status(400).json({ error: 'Type invalide (CHECKING ou SAVINGS)' });
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        userId: req.userId, 
      },
    });

    res.status(201).json(account);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getAccounts(req, res) {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
    });
    res.json(accounts);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { createAccount, getAccounts };