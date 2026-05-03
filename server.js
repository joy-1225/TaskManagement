require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/prisma');

const PORT = process.env.PORT || 3000;

async function main() {
  await prisma.$connect();
  console.log('✅ MySQL connected via Prisma.');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
  });
}

main().catch((err) => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});

// Graceful shutdown on Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Graceful shutdown on container stop
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
