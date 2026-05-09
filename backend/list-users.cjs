require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ select: { email: true, role: true, isActive: true }, orderBy: { role: 'asc' } })
  .then(users => { console.table(users); return p.$disconnect(); })
  .catch(e => { console.error(e.message); p.$disconnect(); process.exit(1); });
