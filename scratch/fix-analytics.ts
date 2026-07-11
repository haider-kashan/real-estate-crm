import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { isDemo: true } });
  const eventTypes = ['mark_contacted', 'set_reminder', 'click_share', 'click_call', 'click_whatsapp'];

  for (const user of users) {
    const count = await prisma.analyticsEvent.count({ where: { userId: user.id } });
    if (count === 0) {
      const mockEvents = [];
      for (let j = 0; j < 50; j++) {
        mockEvents.push({
          eventName: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)),
          userId: user.id
        });
      }
      await prisma.analyticsEvent.createMany({ data: mockEvents });
      console.log(`Added 50 events for demo user: ${user.email}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Done!');
  });
