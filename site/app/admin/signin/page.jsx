import { redirect } from 'next/navigation';
import { auth, signIn } from '../../../auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in', robots: { index: false } };

export default async function SignInPage({ searchParams }) {
  const session = await auth();
  if (session?.user) redirect('/admin');

  const params = await searchParams;
  const failed = Boolean(params?.error);

  return (
    <section className="section">
      <div className="shell admin-narrow">
        <p className="eyebrow">Content Admin</p>
        <h1>Sign in</h1>

        <p className="prose" style={{ marginTop: '1.25rem' }}>
          Use your Latitude 26 Google account.
        </p>

        {failed ? (
          <p className="form-message error" style={{ marginTop: '1rem' }}>
            That account is not permitted to edit this site. Ask Michael to add
            your address to the allowlist.
          </p>
        ) : null}

        <form
          style={{ marginTop: '2rem' }}
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/admin' });
          }}
        >
          <button className="btn" type="submit">
            Continue with Google
          </button>
        </form>
      </div>
    </section>
  );
}
