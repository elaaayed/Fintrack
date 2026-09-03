const prisma = require('../prismaClient');

async function createTransaction(req, res) {
  try {
    const { accountId, categoryId, amount, description, date } = req.body;

    if (!accountId || !categoryId || !amount || !date) {
      return res.status(400).json({ error: 'accountId, categoryId, amount et date requis' });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.userId },
    });
    if (!account) {
      return res.status(404).json({ error: 'Compte introuvable' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        date: new Date(date),
        accountId,
        categoryId,
      },
    });

    res.status(201).json(transaction);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getTransactions(req, res) {
  try {
    const { accountId } = req.params;

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.userId },
    });
    if (!account) {
      return res.status(404).json({ error: 'Compte introuvable' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { accountId },
      include: { category: true }, 
    });

    res.json(transactions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { amount, description, date, categoryId } = req.body;
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        account: { userId: req.userId },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction introuvable' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(categoryId !== undefined && { categoryId }),
      },
    });

    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        account: { userId: req.userId },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction introuvable' });
    }

    await prisma.transaction.delete({ where: { id } });

    res.status(204).send();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { createTransaction, getTransactions, updateTransaction, deleteTransaction };