import matter from 'gray-matter';
import yaml from 'js-yaml';

/**
 * Converts between stored content files and the plain objects the editor
 * works with. Values are coerced and ordered according to the schema, so a
 * round-trip through the admin produces a minimal, predictable diff.
 */

function toDateString(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

/** A blank document matching the schema's shape. */
export function emptyDocument(fields) {
  const doc = {};

  for (const field of fields) {
    switch (field.type) {
      case 'boolean':
        doc[field.name] = false;
        break;
      case 'number':
        doc[field.name] = null;
        break;
      case 'stringList':
      case 'objectList':
        doc[field.name] = [];
        break;
      case 'object':
        doc[field.name] = emptyDocument(field.fields);
        break;
      case 'select':
        doc[field.name] = field.options?.[0] ?? '';
        break;
      default:
        doc[field.name] = '';
    }
  }

  return doc;
}

/** Normalises arbitrary stored data into the schema's shape. */
function coerce(fields, data) {
  const doc = {};

  for (const field of fields) {
    const value = data?.[field.name];

    switch (field.type) {
      case 'boolean':
        doc[field.name] = Boolean(value);
        break;

      case 'number': {
        const parsed = Number(value);
        doc[field.name] = Number.isFinite(parsed) ? parsed : null;
        break;
      }

      case 'date':
        doc[field.name] = toDateString(value);
        break;

      case 'stringList':
        doc[field.name] = Array.isArray(value)
          ? value.map((item) => String(item ?? '')).filter((item) => item.trim())
          : [];
        break;

      case 'object':
        doc[field.name] = coerce(field.fields, value ?? {});
        break;

      case 'objectList':
        doc[field.name] = Array.isArray(value)
          ? value.map((item) => coerce(field.fields, item ?? {}))
          : [];
        break;

      default:
        doc[field.name] = value == null ? '' : String(value);
    }
  }

  return doc;
}

/** Parses a stored file into an editor document. */
export function parseDocument(raw, fields, format) {
  if (format === 'yaml') {
    return coerce(fields, yaml.load(raw ?? '') ?? {});
  }

  const { data, content } = matter(raw ?? '');
  return coerce(fields, { ...data, body: content.trim() });
}

/** Serialises an editor document back to file contents. */
export function serializeDocument(doc, fields, format) {
  const clean = coerce(fields, doc);

  if (format === 'yaml') {
    return yaml.dump(clean, { lineWidth: 100, noRefs: true });
  }

  // A field named `body` becomes the Markdown body, not frontmatter.
  const { body, ...frontmatter } = clean;
  const text = (body ?? '').replace(/\r\n/g, '\n').trim();

  return matter.stringify(text ? `${text}\n` : '', frontmatter);
}

/** Returns an array of human-readable validation errors. */
export function validateDocument(doc, fields, path = '') {
  const errors = [];

  for (const field of fields) {
    const value = doc?.[field.name];
    const label = path ? `${path} → ${field.label}` : field.label;

    if (field.type === 'object') {
      errors.push(...validateDocument(value ?? {}, field.fields, label));
      continue;
    }

    if (field.type === 'objectList') {
      (value ?? []).forEach((item, index) => {
        errors.push(
          ...validateDocument(item ?? {}, field.fields, `${label} #${index + 1}`)
        );
      });
      continue;
    }

    if (!field.required) continue;

    const missing =
      field.type === 'number'
        ? !Number.isFinite(Number(value))
        : !String(value ?? '').trim();

    if (missing) errors.push(`${label} is required.`);
  }

  return errors;
}
