const prisma = require('../prismaClient');

async function createTransaction(req, res) {
  try {
    const { accountId, categoryId, amount, description, date } = req.body;

    if (!accountId || !categoryId || amount === undefined || amount === null || !date) {
      return res.status(400).json({ error: 'accountId, categoryId, amount et date requis' });
    }

    // Le signe est porté par la catégorie (INCOME / EXPENSE) : le montant doit rester positif
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Le montant doit être un nombre positif' });
    }

    if (Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: 'Date invalide' });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.userId },
    });
    if (!account) {
      return res.status(404).json({ error: 'Compte introuvable' });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ error: 'Catégorie introuvable' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parsedAmount,
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
      orderBy: { date: 'desc' },
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

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Le montant doit être un nombre positif' });
      }
    }
    if (date !== undefined && Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: 'Date invalide' });
    }
    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(404).json({ error: 'Catégorie introuvable' });
      }
    }

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
        ...(amount !== undefined && { amount: Number(amount) }),
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