import Link from 'next/link';
import { savePost, removePost } from '../app/admin/actions';

/**
 * Create/edit form for a journal post. Rendered on the server — submitting
 * calls a server action, so no post content passes through client JS.
 */
export default function PostEditor({ post, slug, authorFallback }) {
  const isEdit = Boolean(slug);

  return (
    <>
      <form action={savePost} className="form admin-form">
        {isEdit ? <input type="hidden" name="slug" value={slug} /> : null}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={post?.title ?? ''}
            required
          />
        </div>

        <div className="admin-row">
          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={post?.date ?? new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="author">Author</label>
            <input
              id="author"
              name="author"
              type="text"
              defaultValue={post?.author ?? authorFallback ?? ''}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            style={{ minHeight: '80px' }}
            defaultValue={post?.excerpt ?? ''}
          />
        </div>

        <div className="field">
          <label htmlFor="cover">Cover image URL</label>
          <input
            id="cover"
            name="cover"
            type="text"
            placeholder="/assets/uploads/example.jpg"
            defaultValue={post?.cover ?? ''}
          />
        </div>

        <div className="field">
          <label htmlFor="body">Post (Markdown)</label>
          <textarea
            id="body"
            name="body"
            style={{ minHeight: '420px', fontFamily: 'ui-monospace, monospace' }}
            defaultValue={post?.body ?? ''}
          />
        </div>

        <label className="admin-check">
          <input
            type="checkbox"
            name="draft"
            defaultChecked={post ? post.draft : true}
          />
          <span>
            Draft — saved to the repository but never shown on the site
          </span>
        </label>

        <div className="admin-actions">
          <button className="btn" type="submit">
            {isEdit ? 'Save Changes' : 'Create Post'}
          </button>
          <Link className="btn btn--ghost" href="/admin">
            Cancel
          </Link>
        </div>
      </form>

      {isEdit ? (
        <form action={removePost} className="admin-danger">
          <input type="hidden" name="slug" value={slug} />
          <button className="btn btn--ghost admin-delete" type="submit">
            Delete this post
          </button>
        </form>
      ) : null}
    </>
  );
}
