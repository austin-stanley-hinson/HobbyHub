import { useEffect, useState } from 'react';
import { supabase } from '../client';
import { timeAgo } from '../timeAgo';
import LoadingSpinner from './LoadingSpinner';

// The comments under a post, oldest first, and a form to add one
function Comments({ postId }) {
  const [comments, setComments] = useState([]);

  // Are the comments still being fetched?
  const [isLoading, setIsLoading] = useState(true);

  // Message to show if fetching failed ("" = no error)
  const [loadError, setLoadError] = useState("");

  // What the user has typed in the comment box
  const [newComment, setNewComment] = useState("");

  // Is a new comment being saved right now?
  const [isSaving, setIsSaving] = useState(false);

  // Message to show if saving failed ("" = no error)
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    // Ignore the answer if the user moves to another post before it arrives
    let isCurrent = true;

    const fetchComments = async () => {
      setIsLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (!isCurrent) return;

      if (error) {
        setLoadError("Couldn't load comments. Please refresh the page.");
      } else {
        setComments(data);
      }
      setIsLoading(false);
    };

    fetchComments();

    return () => {
      isCurrent = false;
    };
  }, [postId]);

  const addComment = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");

    // Get the saved comment back so it can be shown right away
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, content: newComment.trim() })
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      setSaveError("Couldn't post your comment. Please try again.");
      return;
    }

    setComments((current) => [...current, data]);
    setNewComment("");
  };

  const canSubmit = newComment.trim() !== "" && !isSaving;

  return (
    <section className="comments">
      <h2>Comments ({comments.length})</h2>

      {isLoading && <LoadingSpinner label="Loading comments..." />}
      {loadError && <p className="error">{loadError}</p>}

      {!isLoading && !loadError && comments.length === 0 && (
        <p className="comments-empty">No comments yet. Be the first to weigh in!</p>
      )}

      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment">
            <p className="comment-content">{comment.content}</p>
            <p className="comment-time" title={new Date(comment.created_at).toLocaleString()}>
              {timeAgo(comment.created_at)}
            </p>
          </li>
        ))}
      </ul>

      <form className="comment-form" onSubmit={addComment}>
        <label htmlFor="new-comment">Leave a comment</label>
        <textarea
          id="new-comment"
          rows="3"
          placeholder="What do you think?"
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
        />
        <button type="submit" className="primary-button" disabled={!canSubmit}>
          {isSaving ? "Posting..." : "Post Comment"}
        </button>
        {saveError && <p className="error">{saveError}</p>}
      </form>
    </section>
  );
}

export default Comments;
