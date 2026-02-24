import { auth, currentUser } from '@clerk/nextjs/server';
import { createUser } from '@/lib/db';

export async function syncUser() {
  const { userId } = await auth();
  
  if (!userId) return null;
  
  const user = await currentUser();
  if (!user) return null;
  
  const email = user.emailAddresses[0]?.emailAddress || '';
  const name = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || user.username || '';
  
  // Sync user to our database
  await createUser(userId, email, name);
  
  return { userId, email, name };
}

export async function getAuthUser() {
  const { userId } = await auth();
  return userId;
}
