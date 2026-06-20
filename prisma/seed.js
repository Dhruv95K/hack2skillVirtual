import { PrismaClient } from '@prisma/client';
import { BADGE_DEFINITIONS } from '../src/lib/gamification';
const prisma = new PrismaClient();
async function main() {
  console.log('Seeding badges...');
  for (const badge of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: {
        key: badge.key
      },
      update: {},
      create: {
        key: badge.key,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        thresholdType: badge.thresholdType,
        thresholdValue: badge.thresholdValue
      }
    });
    console.log(`  ✓ Badge upserted: ${badge.name}`);
  }
  console.log('Badges seeded successfully.');
}
main().finally(() => prisma.$disconnect());