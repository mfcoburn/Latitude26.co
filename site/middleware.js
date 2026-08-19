/**
 * Gate for the unlaunched site.
 *
 * Vercel Authentication only covers production deployments on the Pro plan, so
 * the gate lives in the app instead. Every route sits behind HTTP Basic Auth
 * until launch.
 *
 * Deliberately imports nothing. An earlier version imported NextResponse from
 * "next/server" and crashed at runtime with MIDDLEWARE_INVOCATION_FAILED —
 * Vercel's build log showed middleware.js being recompiled from ESM to
 * CommonJS, and the interop broke the import. Web-standard APIs only now:
 * returning a Response blocks the request, returning nothing lets it through.
 *
 * Env vars (set in the Vercel project, NOT in this repo):
 *   SITE_GATE_USER      username
 *   SITE_GATE_PASSWORD  password
 *   SITE_GATE_ENABLED   set to exactly "false" to open the site publicly
 *
 * FAILS CLOSED: if the credentials are missing the site is unreachable rather
 * than accidentally public. That is deliberate — a misconfigured deploy should
 * lock people out, not expose an unlaunched practice site.
 *
 * TO GO LIVE: set SITE_GATE_ENABLED=false and redeploy.
 */

function unauthorized(message = 'Authentication required.') {
  return new Response(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Latitude 26", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

/** Constant-time-ish string comparison. */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Decodes base64 without relying on atob or Buffer being present. */
function decodeBase64(value) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const input = value.replace(/=+$/, '');
  let bits = 0;
  let accumulator = 0;
  let output = '';

  for (const char of input) {
    const index = chars.indexOf(char);
    if (index === -1) return null;

    accumulator = (accumulator << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((accumulator >> bits) & 0xff);
    }
  }

  return output;
}

export function middleware(request) {
  // Returning undefined lets the request through untouched.
  if (process.env.SITE_GATE_ENABLED === 'false') return;

  const user = process.env.SITE_GATE_USER;
  const password = process.env.SITE_GATE_PASSWORD;

  if (!user || !password) {
    return unauthorized(
      'This site is not yet available. (Gate credentials are not configured.)'
    );
  }

  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Basic ')) return unauthorized();

  const decoded = decodeBase64(header.slice(6).trim());
  if (decoded === null) return unauthorized();

  const separator = decoded.indexOf(':');
  if (separator === -1) return unauthorized();

  if (
    safeEqual(decoded.slice(0, separator), user) &&
    safeEqual(decoded.slice(separator + 1), password)
  ) {
    return;
  }

  return unauthorized();
}

export const config = {
  // Everything except Next's own build chunks, which carry no content.
  matcher: ['/((?!_next/static|_next/image).*)'],
};
