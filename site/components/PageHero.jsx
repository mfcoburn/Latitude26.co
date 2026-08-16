export default function PageHero({ hero, coordinate, showMark = false }) {
  if (!hero) return null;

  return (
    <section className="hero">
      <div className="shell">
        {showMark ? (
          <img
            className="hero__mark"
            src="/assets/logo-mark.png"
            alt="Latitude 26 compass emblem"
            width="120"
            height="120"
          />
        ) : null}

        {coordinate ? <p className="eyebrow">{coordinate}</p> : null}

        <h1>{hero.headline}</h1>

        <div className="mark-rule" aria-hidden="true">
          <span />
          <span />
        </div>

        {hero.intro ? <p className="lede">{hero.intro}</p> : null}
      </div>
    </section>
  );
}
