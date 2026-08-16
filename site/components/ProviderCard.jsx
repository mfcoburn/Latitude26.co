/**
 * Repeatable provider card, driven by one file in content/providers/.
 * Renders identically for one provider or several — the About page maps over
 * the collection, so adding a provider needs no layout change.
 */
export default function ProviderCard({ provider }) {
  return (
    <article className="provider">
      {provider.photo ? (
        <img
          className="provider__portrait"
          src={provider.photo}
          alt={provider.name}
        />
      ) : (
        <div
          className="provider__portrait provider__portrait--placeholder"
          aria-hidden="true"
        >
          <img src="/assets/logo-mark.png" alt="" />
        </div>
      )}

      <div>
        <h3 className="provider__name">
          {provider.name}
          {provider.credentials ? `, ${provider.credentials}` : ''}
        </h3>

        {provider.role ? <p className="provider__role">{provider.role}</p> : null}

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: provider.bodyHtml }}
        />
      </div>
    </article>
  );
}
