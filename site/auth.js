import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

/**
 * Google sign-in for the content admin.
 *
 * Access is allowlisted twice over: a Workspace domain and/or an explicit list
 * of addresses. If NEITHER is configured, every sign-in is rejected — the admin
 * fails closed rather than letting any Google account in.
 *
 * Env vars (set in the Vercel project, never committed):
 *   AUTH_SECRET            random string, `openssl rand -base64 32`
 *   AUTH_GOOGLE_ID         Google OAuth client ID
 *   AUTH_GOOGLE_SECRET     Google OAuth client secret
 *   ADMIN_ALLOWED_DOMAIN   e.g. latitude26.co — any verified address on it
 *   ADMIN_ALLOWED_EMAILS   comma-separated addresses, for one-off access
 */

function allowedDomain() {
  return (process.env.ADMIN_ALLOWED_DOMAIN ?? '').trim().toLowerCase();
}

function allowedEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email, emailVerified = true) {
  if (!email || !emailVerified) return false;

  const address = email.trim().toLowerCase();
  const domain = allowedDomain();
  const emails = allowedEmails();

  // Fail closed when nothing is configured.
  if (!domain && emails.length === 0) return false;

  if (emails.includes(address)) return true;
  if (domain && address.endsWith(`@${domain}`)) return true;

  return false;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: '/admin/signin', error: '/admin/signin' },
  callbacks: {
    signIn({ profile }) {
      return isAllowedEmail(profile?.email, profile?.email_verified !== false);
    },
    session({ session }) {
      return session;
    },
  },
});
