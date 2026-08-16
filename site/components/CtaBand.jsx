import Link from 'next/link';

export default function CtaBand({ cta, note }) {
  if (!cta?.label) return null;

  return (
    <section className="cta-band">
      <div className="shell">
        {note ? <p className="eyebrow">{note}</p> : null}
        <Link className="btn" href={cta.href ?? '/contact'}>
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
