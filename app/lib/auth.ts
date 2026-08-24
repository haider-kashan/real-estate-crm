import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from './prisma';

/**
 * Retrieves the currently authenticated user's database record.
 * If the user exists in Clerk but not in our database, it provisions
 * a corresponding User row in PostgreSQL to maintain relational integrity.
 */
export async function requireDbUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // 1. Try to find the user by Clerk User ID
  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (dbUser) {
    return dbUser;
  }

  // 2. Fetch user profile details from Clerk
  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.user`;
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') ||
    'Agent';
  const logoUrl = clerkUser?.imageUrl || null;

  // 3. Check if a record already exists with this email (e.g. from previous auth)
  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingByEmail) {
    return existingByEmail;
  }

  // 4. Provision a new User record for this Clerk account
  dbUser = await prisma.user.create({
    data: {
      id: userId,
      email,
      name,
      logoUrl,
      plan: 'free',
    },
  });

  return dbUser;
}

/**
 * Helper to retrieve the current user's database ID for server actions.
 * Throws an error if the user is unauthenticated.
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const dbUser = await requireDbUser();

  if (!dbUser?.id) {
    throw new Error('Unauthorized: Please login first.');
  }

  return dbUser.id;
}
