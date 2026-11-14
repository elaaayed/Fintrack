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
  let created = 0;
  for (const category of categories) {
    const existing = await prisma.category.findFirst({ where: category });
    if (!existing) {
      await prisma.category.create({ data: category });
      created++;
    }
  }
  console.log(`Catégories créées : ${created}, déjà présentes : ${categories.length - created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });