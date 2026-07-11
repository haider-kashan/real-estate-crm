import { replenishSandboxPool } from '../app/lib/auth-actions';

async function main() {
  console.log('Generating initial sandbox pool (5 accounts)...');
  await replenishSandboxPool(5);
  console.log('Done!');
}

main().catch(console.error);
