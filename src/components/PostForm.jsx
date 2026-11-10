// The title, content, and image URL fields, shared by the create and edit pages
function PostForm({ post, setPost, onSubmit, submitLabel, isSaving }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setPost((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  // A post needs a title; content and image are optional
  const canSubmit = post.title.trim() !== "" && !isSaving;

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        name="title"
        type="text"
        placeholder="Who's the best point guard right now?"
        value={post.title}
        onChange={handleChange}
        required
      />

      <label htmlFor="content">Content (optional)</label>
      <textarea
        id="content"
        name="content"
        rows="6"
        placeholder="Make your case..."
        value={post.content}
        onChange={handleChange}
      />

      <label htmlFor="image_url">Image URL (optional)</label>
      <input
        id="image_url"
        name="image_url"
        type="url"
        placeholder="https://example.com/dunk.jpg"
        value={post.image_url}
        onChange={handleChange}
      />

      <button type="submit" className="primary-button" disabled={!canSubmit}>
        {isSaving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default PostForm;
