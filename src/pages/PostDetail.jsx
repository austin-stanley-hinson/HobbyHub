import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../client';
import { timeAgo } from '../timeAgo';

function PostDetail() {
  const { id } = useParams();

  // The post being shown (null = not loaded yet, or doesn't exist)
  const [post, setPost] = useState(null);

  // Is the post still being fetched?
  const [isLoading, setIsLoading] = useState(true);

  // Message to show if fetching failed ("" = no error)
  const [error, setError] = useState("");

  // Hide the image if its URL doesn't load
  const [imageFailed, setImageFailed] = useState(false);

  // Message to show if an upvote didn't save ("" = no error)
  const [upvoteError, setUpvoteError] = useState("");

  useEffect(() => {
    // Ignore the answer if the user moves to another post before it arrives
    let isCurrent = true;

    const fetchPost = async () => {
      setIsLoading(true);
      setError("");
      setImageFailed(false);
      setUpvoteError("");

      // Post IDs are whole numbers, so anything else can't be a post
      if (!/^\d+$/.test(id)) {
        setPost(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!isCurrent) return;

      if (error) {
        setError("Couldn't load this post. Please refresh the page.");
      } else {
        setPost(data);
      }
      setIsLoading(false);
    };

    fetchPost();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const upvote = async () => {
    setUpvoteError("");

    // Count the click right away so fast clicks all show up
    setPost((current) => ({ ...current, upvotes: current.upvotes + 1 }));

    const { error } = await supabase.rpc("increment_upvotes", { row_id: post.id });

    // Take the click back off if it didn't save
    if (error) {
      setPost((current) => ({ ...current, upvotes: current.upvotes - 1 }));
      setUpvoteError("Couldn't save your upvote. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="page"><p>Loading post...</p></div>;
  }

  if (error) {
    return <div className="page"><p className="error">{error}</p></div>;
  }

  if (!post) {
    return (
      <div className="page">
        <h1>Post not found</h1>
        <p>This post may have been deleted. <Link to="/">Back to the feed</Link></p>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">&larr; Back to the feed</Link>

      <article className="post-detail">
        <p className="post-time" title={new Date(post.created_at).toLocaleString()}>
          Posted {timeAgo(post.created_at)}
        </p>
        <h1 className="post-title">{post.title}</h1>

        {post.content && <p className="post-content">{post.content}</p>}

        {post.image_url && !imageFailed && (
          <img
            className="post-image"
            src={post.image_url}
            alt={post.title}
            onError={() => setImageFailed(true)}
          />
        )}

        <div className="upvote-row">
          <button type="button" className="upvote-button" onClick={upvote}>
            &#9650; Upvote
          </button>
          <span className="post-upvotes">
            {post.upvotes} {post.upvotes === 1 ? "upvote" : "upvotes"}
          </span>
        </div>
        {upvoteError && <p className="error">{upvoteError}</p>}
      </article>
    </div>
  );
}

export default PostDetail;
