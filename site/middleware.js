import { NextResponse } from 'next/server';

/**
 * Gate for the unlaunched site.
 *
 * Vercel Authentication only covers production deployments on the Pro plan, so
 * the gate lives in the app instead. Every route — pages, /admin, assets — sits
 * behind HTTP Basic Auth until launch.
 *
 * Env vars (set in the Vercel project, NOT in this repo):
 *   SITE_GATE_USER      username
 *   SITE_GATE_PASSWORD  password
 *   SITE_GATE_ENABLED   set to exactly "false" to open the site to the public
 *
 * FAILS CLOSED: if the credentials are missing the site is unreachable rather
 * than accidentally public. That is deliberate — a misconfigured deploy should
 * lock people out, not expose an unlaunched practice site.
 *
 * TO GO LIVE: set SITE_GATE_ENABLED=false and redeploy.
 */

function unauthorized(message = 'Authentication required.') {
  return new NextResponse(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Latitude 26", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

/** Length-independent constant-time-ish string comparison. */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function middleware(request) {
  if (process.env.SITE_GATE_ENABLED === 'false') {
    return NextResponse.next();
  }

  const user = process.env.SITE_GATE_USER;
  const password = process.env.SITE_GATE_PASSWORD;

  if (!user || !password) {
    return unauthorized(
      'This site is not yet available. (Gate credentials are not configured.)'
    );
  }

  const header = request.headers.get('authorization');
  if (!header?.startsWith('Basic ')) return unauthorized();

  let decoded;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(':');
  if (separator === -1) return unauthorized();

  const suppliedUser = decoded.slice(0, separator);
  const suppliedPassword = decoded.slice(separator + 1);

  if (safeEqual(suppliedUser, user) && safeEqual(suppliedPassword, password)) {
    return NextResponse.next();
  }

  return unauthorized();
}

export const config = {
  // Everything except:
  //   _next/static, _next/image — build chunks, no content
  //   admin, api/auth         — the content admin, which enforces its own
  //                             Google sign-in. Exempting it means Colleen
  //                             needs one credential, not two.
  matcher: ['/((?!_next/static|_next/image|admin|api/auth).*)'],
};
