import prisma from '../app/lib/prisma';
import { replenishSandboxPool } from '../app/lib/auth-actions';

async function resetPool() {
  console.log("Wiping corrupted demo accounts...");
  await prisma.user.deleteMany({ where: { isDemo: true } });
  
  console.log("Generating 5 fresh, complete demo accounts...");
  await replenishSandboxPool(5);
  
  console.log("Done! Clean pool is ready.");
}

resetPool().catch(console.error);
