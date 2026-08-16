'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Schema-driven editor. Holds the whole document in state and submits it as
 * one JSON payload, which keeps arbitrarily nested and repeatable fields
 * working without encoding paths into form field names.
 */

function setIn(doc, path, value) {
  if (path.length === 0) return value;

  const [key, ...rest] = path;
  const clone = Array.isArray(doc) ? [...doc] : { ...doc };
  clone[key] = setIn(clone[key], rest, value);
  return clone;
}

function blankFrom(fields) {
  const item = {};
  for (const field of fields) {
    if (field.type === 'stringList' || field.type === 'objectList') item[field.name] = [];
    else if (field.type === 'object') item[field.name] = blankFrom(field.fields);
    else if (field.type === 'boolean') item[field.name] = false;
    else if (field.type === 'number') item[field.name] = null;
    else item[field.name] = '';
  }
  return item;
}

function Field({ field, value, path, onChange }) {
  const id = path.join('-');
  const update = (next) => onChange(path, next);

  if (field.type === 'object') {
    return (
      <fieldset className="admin-group">
        <legend>{field.label}</legend>
        {field.hint ? <p className="admin-hint">{field.hint}</p> : null}
        {field.fields.map((child) => (
          <Field
            key={child.name}
            field={child}
            value={value?.[child.name]}
            path={[...path, child.name]}
            onChange={onChange}
          />
        ))}
      </fieldset>
    );
  }

  if (field.type === 'objectList') {
    const items = Array.isArray(value) ? value : [];

    return (
      <fieldset className="admin-group">
        <legend>{field.label}</legend>
        {field.hint ? <p className="admin-hint">{field.hint}</p> : null}

        {items.map((item, index) => (
          <div className="admin-item" key={index}>
            <div className="admin-item__head">
              <span>
                {item?.[field.itemLabel] || `${field.label} ${index + 1}`}
              </span>
              <div className="admin-item__controls">
                <button
                  type="button"
                  onClick={() => {
                    if (index === 0) return;
                    const next = [...items];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    update(next);
                  }}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (index === items.length - 1) return;
                    const next = [...items];
                    [next[index], next[index + 1]] = [next[index + 1], next[index]];
                    update(next);
                  }}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="admin-remove"
                  onClick={() => update(items.filter((_, i) => i !== index))}
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            </div>

            {field.fields.map((child) => (
              <Field
                key={child.name}
                field={child}
                value={item?.[child.name]}
                path={[...path, index, child.name]}
                onChange={onChange}
              />
            ))}
          </div>
        ))}

        <button
          type="button"
          className="btn btn--ghost admin-add"
          onClick={() => update([...items, blankFrom(field.fields)])}
        >
          Add {field.label.replace(/s$/, '')}
        </button>
      </fieldset>
    );
  }

  if (field.type === 'stringList') {
    const items = Array.isArray(value) ? value : [];

    return (
      <fieldset className="admin-group">
        <legend>{field.label}</legend>
        {field.hint ? <p className="admin-hint">{field.hint}</p> : null}

        {items.map((item, index) => (
          <div className="admin-inline" key={index}>
            <input
              type="text"
              value={item ?? ''}
              onChange={(event) => {
                const next = [...items];
                next[index] = event.target.value;
                update(next);
              }}
            />
            <button
              type="button"
              className="admin-remove"
              onClick={() => update(items.filter((_, i) => i !== index))}
              aria-label="Remove"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn btn--ghost admin-add"
          onClick={() => update([...items, ''])}
        >
          Add Item
        </button>
      </fieldset>
    );
  }

  if (field.type === 'boolean') {
    return (
      <label className="admin-check">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => update(event.target.checked)}
        />
        <span>
          {field.label}
          {field.hint ? ` — ${field.hint}` : ''}
        </span>
      </label>
    );
  }

  return (
    <div className="field">
      <label htmlFor={id}>
        {field.label}
        {field.required ? ' *' : ''}
      </label>

      {field.type === 'select' ? (
        <select
          id={id}
          value={value ?? ''}
          onChange={(event) => update(event.target.value)}
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'markdown' || field.type === 'text' ? (
        <textarea
          id={id}
          value={value ?? ''}
          style={
            field.type === 'markdown'
              ? { minHeight: '380px', fontFamily: 'ui-monospace, monospace' }
              : { minHeight: '90px' }
          }
          onChange={(event) => update(event.target.value)}
        />
      ) : (
        <input
          id={id}
          type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(event) =>
            update(
              field.type === 'number'
                ? event.target.value === ''
                  ? null
                  : Number(event.target.value)
                : event.target.value
            )
          }
        />
      )}

      {field.hint ? <p className="admin-hint">{field.hint}</p> : null}
    </div>
  );
}

export default function DocEditor({
  fields,
  initialDoc,
  action,
  collection,
  slug,
  isNew = false,
  backHref,
  deleteAction,
}) {
  const [doc, setDoc] = useState(initialDoc);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onChange = (path, value) => setDoc((current) => setIn(current, path, value));

  async function handleSubmit(formData) {
    setSaving(true);
    setError('');

    const result = await action(formData);

    // A successful save redirects, so reaching here means it failed.
    if (result?.error) setError(result.error);
    setSaving(false);
  }

  return (
    <>
      <form action={handleSubmit} className="admin-form">
        <input type="hidden" name="collection" value={collection} />
        <input type="hidden" name="slug" value={slug ?? ''} />
        <input type="hidden" name="isNew" value={isNew ? '1' : ''} />
        <input type="hidden" name="doc" value={JSON.stringify(doc)} />

        {fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={doc?.[field.name]}
            path={[field.name]}
            onChange={onChange}
          />
        ))}

        {error ? <p className="form-message error">{error}</p> : null}

        <div className="admin-actions">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save Changes'}
          </button>
          <Link className="btn btn--ghost" href={backHref}>
            Cancel
          </Link>
        </div>
      </form>

      {deleteAction && !isNew ? (
        <form action={deleteAction} className="admin-danger">
          <input type="hidden" name="collection" value={collection} />
          <input type="hidden" name="slug" value={slug} />
          <button className="btn btn--ghost admin-delete" type="submit">
            Delete this entry
          </button>
        </form>
      ) : null}
    </>
  );
}
