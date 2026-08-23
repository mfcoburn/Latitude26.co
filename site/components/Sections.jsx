import { renderMarkdown } from '../lib/content';

/**
 * Renders a page's `sections: [{heading, body}]` frontmatter list.
 * `className` is appended to each section, for page-level variants such as
 * `section--justified`.
 */
export default function Sections({ sections, className }) {
  if (!sections?.length) return null;

  return (
    <>
      {sections.map((section) => (
        <section
          className={className ? `section ${className}` : 'section'}
          key={section.heading}
        >
          <div className="shell">
            <div className="section__head">
              <h2>{section.heading}</h2>
            </div>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }}
            />
          </div>
        </section>
      ))}
    </>
  );
}
