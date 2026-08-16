/**
 * Content model for the admin.
 *
 * This is the single source of truth for what is editable. The editor renders
 * its forms from these definitions and the server validates against them, so
 * adding a field here adds it to the UI and the saved file at once.
 *
 * Field types:
 *   string | text | markdown | number | date | boolean | select
 *   stringList              — repeatable plain strings
 *   object   { fields }     — a fixed nested group
 *   objectList { fields }   — a repeatable nested group
 *
 * A field literally named `body` is stored as the Markdown body of the file
 * rather than as frontmatter.
 */

const SEO = [
  { name: 'title', label: 'Title', type: 'string', required: true },
  { name: 'seo_description', label: 'SEO Description', type: 'text' },
];

const HERO = {
  name: 'hero',
  label: 'Hero',
  type: 'object',
  fields: [
    { name: 'headline', label: 'Headline', type: 'string', required: true },
    { name: 'intro', label: 'Intro', type: 'text' },
  ],
};

const CTA = {
  name: 'cta',
  label: 'Call to Action',
  type: 'object',
  fields: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'href', label: 'Link', type: 'string' },
  ],
};

const SECTIONS = {
  name: 'sections',
  label: 'Sections',
  type: 'objectList',
  itemLabel: 'heading',
  fields: [
    { name: 'heading', label: 'Heading', type: 'string', required: true },
    { name: 'body', label: 'Body', type: 'text' },
  ],
};

export const COLLECTIONS = {
  // ---------------------------------------------------------------- settings
  settings: {
    label: 'Site Settings',
    description: 'Tagline, locations, contact details, and the primary CTA.',
    kind: 'single',
    format: 'yaml',
    path: 'site/content/settings/site.yml',
    fields: [
      { name: 'practice_name', label: 'Practice Name', type: 'string', required: true },
      { name: 'short_name', label: 'Short Name', type: 'string' },
      { name: 'tagline', label: 'Tagline', type: 'string' },
      { name: 'coordinate_mark', label: 'Coordinate Mark', type: 'string' },
      { name: 'locations', label: 'Locations', type: 'stringList' },
      {
        name: 'exclusivity_note',
        label: 'Exclusivity Note',
        type: 'string',
        hint: 'Signals the tier without a price. Never put figures on the site.',
      },
      {
        name: 'contact',
        label: 'Contact',
        type: 'object',
        fields: [
          { name: 'email', label: 'Email', type: 'string' },
          { name: 'phone', label: 'Phone', type: 'string' },
        ],
      },
      {
        name: 'primary_cta',
        label: 'Primary Call to Action',
        type: 'object',
        fields: [
          { name: 'label', label: 'Label', type: 'string' },
          { name: 'href', label: 'Link', type: 'string' },
        ],
      },
      { name: 'legal_entity', label: 'Legal Entity', type: 'string' },
    ],
  },

  // ------------------------------------------------------------------- pages
  pages: {
    label: 'Pages',
    description: 'The fixed marketing pages.',
    kind: 'files',
    format: 'markdown',
    entries: {
      home: {
        label: 'Home',
        path: 'site/content/pages/home.md',
        fields: [
          ...SEO,
          HERO,
          {
            name: 'value_proposition',
            label: 'Value Proposition',
            type: 'object',
            fields: [
              { name: 'heading', label: 'Heading', type: 'string' },
              { name: 'body', label: 'Body', type: 'text' },
            ],
          },
          {
            name: 'pillars',
            label: 'Pillars',
            type: 'objectList',
            itemLabel: 'title',
            fields: [
              { name: 'title', label: 'Title', type: 'string', required: true },
              { name: 'body', label: 'Body', type: 'text' },
            ],
          },
          CTA,
          { name: 'body', label: 'Closing Copy', type: 'markdown' },
        ],
      },
      model: {
        label: 'The Model',
        path: 'site/content/pages/model.md',
        fields: [...SEO, HERO, SECTIONS],
      },
      services: {
        label: 'Services (page header)',
        path: 'site/content/pages/services.md',
        fields: [...SEO, HERO, CTA],
      },
      membership: {
        label: 'Membership',
        path: 'site/content/pages/membership.md',
        fields: [
          ...SEO,
          HERO,
          SECTIONS,
          {
            name: 'included',
            label: 'Included in Membership',
            type: 'object',
            fields: [
              { name: 'heading', label: 'Heading', type: 'string' },
              { name: 'items', label: 'Items', type: 'stringList' },
            ],
          },
          {
            name: 'add_ons',
            label: 'Add-Ons',
            hint: 'Name add-ons only. Never attach pricing.',
            type: 'object',
            fields: [
              { name: 'heading', label: 'Heading', type: 'string' },
              { name: 'items', label: 'Items', type: 'stringList' },
            ],
          },
          {
            name: 'inquiry_flow',
            label: 'Inquiry Flow',
            type: 'object',
            fields: [
              { name: 'heading', label: 'Heading', type: 'string' },
              {
                name: 'steps',
                label: 'Steps',
                type: 'objectList',
                itemLabel: 'title',
                fields: [
                  { name: 'title', label: 'Title', type: 'string', required: true },
                  { name: 'body', label: 'Body', type: 'text' },
                ],
              },
            ],
          },
          CTA,
        ],
      },
      about: {
        label: 'About / Providers',
        path: 'site/content/pages/about.md',
        fields: [
          ...SEO,
          HERO,
          {
            name: 'providers_section',
            label: 'Providers Section',
            type: 'object',
            fields: [
              { name: 'heading', label: 'Heading', type: 'string' },
              { name: 'intro', label: 'Intro', type: 'text' },
            ],
          },
          SECTIONS,
          CTA,
        ],
      },
      'service-area': {
        label: 'Service Area',
        path: 'site/content/pages/service-area.md',
        fields: [
          ...SEO,
          HERO,
          {
            name: 'areas',
            label: 'Areas',
            type: 'objectList',
            itemLabel: 'name',
            fields: [
              { name: 'name', label: 'Name', type: 'string', required: true },
              { name: 'body', label: 'Body', type: 'text' },
            ],
          },
          SECTIONS,
          CTA,
        ],
      },
      contact: {
        label: 'Contact / Request an Invitation',
        path: 'site/content/pages/contact.md',
        fields: [
          ...SEO,
          HERO,
          {
            name: 'form',
            label: 'Form Copy',
            type: 'object',
            fields: [
              { name: 'name_label', label: 'Name Label', type: 'string' },
              { name: 'email_label', label: 'Email Label', type: 'string' },
              { name: 'phone_label', label: 'Phone Label', type: 'string' },
              { name: 'message_label', label: 'Message Label', type: 'string' },
              { name: 'submit_label', label: 'Submit Label', type: 'string' },
              { name: 'success_message', label: 'Success Message', type: 'text' },
              { name: 'privacy_note', label: 'Privacy Note', type: 'text' },
            ],
          },
          SECTIONS,
        ],
      },
      blog: {
        label: 'Journal (page header)',
        path: 'site/content/pages/blog.md',
        fields: [
          ...SEO,
          HERO,
          { name: 'empty_message', label: 'Empty State Message', type: 'string' },
        ],
      },
    },
  },

  // ----------------------------------------------------------------- journal
  blog: {
    label: 'Journal',
    description: 'Blog posts. Drafts are saved but never shown on the site.',
    kind: 'folder',
    format: 'markdown',
    path: 'site/content/blog',
    titleField: 'title',
    sortBy: 'date',
    newDefaults: { draft: true },
    fields: [
      { name: 'title', label: 'Title', type: 'string', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'author', label: 'Author', type: 'string', required: true },
      {
        name: 'excerpt',
        label: 'Excerpt',
        type: 'text',
        hint: 'One or two sentences shown on the journal index.',
      },
      { name: 'cover', label: 'Cover Image URL', type: 'string' },
      {
        name: 'draft',
        label: 'Draft',
        type: 'boolean',
        hint: 'Saved to the repository but never shown on the site.',
      },
      { name: 'body', label: 'Post', type: 'markdown' },
    ],
  },

  // ---------------------------------------------------------------- services
  services: {
    label: 'Services',
    description: 'One entry per service, shown in order on the Services page.',
    kind: 'folder',
    format: 'markdown',
    path: 'site/content/services',
    titleField: 'title',
    sortBy: 'order',
    fields: [
      { name: 'title', label: 'Title', type: 'string', required: true },
      { name: 'order', label: 'Order', type: 'number', required: true },
      { name: 'summary', label: 'Summary', type: 'text' },
      { name: 'highlights', label: 'Highlights', type: 'stringList' },
      { name: 'body', label: 'Body', type: 'markdown' },
    ],
  },

  // --------------------------------------------------------------- providers
  providers: {
    label: 'Providers',
    description: 'One entry per physician. Adding a file adds a card.',
    kind: 'folder',
    format: 'markdown',
    path: 'site/content/providers',
    titleField: 'name',
    sortBy: 'order',
    fields: [
      { name: 'name', label: 'Name', type: 'string', required: true },
      { name: 'credentials', label: 'Credentials', type: 'string' },
      { name: 'role', label: 'Role', type: 'string' },
      { name: 'order', label: 'Order', type: 'number', required: true },
      { name: 'photo', label: 'Portrait URL', type: 'string' },
      { name: 'body', label: 'Biography', type: 'markdown' },
    ],
  },

  // ------------------------------------------------------------------- legal
  legal: {
    label: 'Legal Notices',
    description: 'Placeholders until counsel supplies the copy.',
    kind: 'files',
    format: 'markdown',
    entries: Object.fromEntries(
      [
        ['privacy', 'Privacy Policy'],
        ['terms', 'Terms of Use'],
        ['hipaa-notice', 'HIPAA Notice of Privacy Practices'],
        ['medical-disclaimer', 'Medical Disclaimer'],
        ['non-discrimination', 'Non-Discrimination Notice'],
      ].map(([slug, label]) => [
        slug,
        {
          label,
          path: `site/content/legal/${slug}.md`,
          fields: [
            { name: 'title', label: 'Title', type: 'string', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['pending-legal-review', 'approved'],
            },
            { name: 'body', label: 'Body', type: 'markdown' },
          ],
        },
      ])
    ),
  },
};

export function getCollectionDef(name) {
  return COLLECTIONS[name] ?? null;
}

/** Resolves {fields, path} for a collection entry, or null when unknown. */
export function resolveEntry(collectionName, slug) {
  const collection = getCollectionDef(collectionName);
  if (!collection) return null;

  if (collection.kind === 'single') {
    return { fields: collection.fields, path: collection.path, label: collection.label };
  }

  if (collection.kind === 'files') {
    const entry = collection.entries[slug];
    if (!entry) return null;
    return { fields: entry.fields, path: entry.path, label: entry.label };
  }

  if (collection.kind === 'folder') {
    if (!/^[a-z0-9-]+$/i.test(slug)) return null;
    return {
      fields: collection.fields,
      path: `${collection.path}/${slug}.md`,
      label: slug,
    };
  }

  return null;
}
