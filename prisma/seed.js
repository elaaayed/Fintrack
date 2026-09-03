const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const categories = [
  { name: 'Salaire', type: 'INCOME' },
  { name: 'Remboursement', type: 'INCOME' },
  { name: 'Loyer', type: 'EXPENSE' },
  { name: 'Courses', type: 'EXPENSE' },
  { name: 'Restaurant', type: 'EXPENSE' },
  { name: 'Transport', type: 'EXPENSE' },
  { name: 'Loisirs', type: 'EXPENSE' },
  { name: 'Abonnements', type: 'EXPENSE' },
  { name: 'Santé', type: 'EXPENSE' },
  { name: 'Autre', type: 'EXPENSE' },
];

async function main() {
  for (const category of categories) {
    await prisma.category.create({ data: category });
  }
  console.log('Catégories créées');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());