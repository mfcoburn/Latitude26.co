import { redirect } from 'next/navigation';
import { auth, isAllowedEmail } from '../auth';

/** Returns the signed-in editor, or redirects to sign-in. */
export async function requireSession() {
  const session = await auth();

  if (!isAllowedEmail(session?.user?.email)) redirect('/admin/signin');

  return session;
}
