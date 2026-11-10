import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../client';
import { timeAgo } from '../timeAgo';

// A small linked card for a post in a thread
function ThreadCard({ post }) {
  return (
    <Link to={`/post/${post.id}`} className="thread-card">
      <span className="thread-card-id">#{post.id}</span>
      <span className="thread-card-title">{post.title}</span>
      <span className="thread-card-meta">
        {timeAgo(post.created_at)} &middot; {post.upvotes} {post.upvotes === 1 ? "upvote" : "upvotes"}
      </span>
    </Link>
  );
}

// The post this one reposts, shown above its content
export function RepostedPost({ postId }) {
  const [original, setOriginal] = useState(null);

  useEffect(() => {
    // Ignore the answer if the user moves to another post before it arrives
    let isCurrent = true;

    const fetchOriginal = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, created_at, title, upvotes")
        .eq("id", postId)
        .maybeSingle();

      if (isCurrent) setOriginal(data);
    };

    fetchOriginal();

    return () => {
      isCurrent = false;
    };
  }, [postId]);

  if (!original) return null;

  return (
    <div className="thread reposted-post">
      <p className="thread-label">&#8635; Reposting</p>
      <ThreadCard post={original} />
    </div>
  );
}

// Later posts that repost this one, shown at the bottom of the post
export function RepostList({ postId }) {
  const [reposts, setReposts] = useState([]);

  useEffect(() => {
    // Ignore the answer if the user moves to another post before it arrives
    let isCurrent = true;

    const fetchReposts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, created_at, title, upvotes")
        .eq("repost_of", postId)
        .order("created_at", { ascending: true });

      if (isCurrent) setReposts(data ?? []);
    };

    fetchReposts();

    return () => {
      isCurrent = false;
    };
  }, [postId]);

  if (reposts.length === 0) return null;

  return (
    <div className="thread repost-list">
      <p className="thread-label">&#8635; Reposted in</p>
      {reposts.map((repost) => (
        <ThreadCard key={repost.id} post={repost} />
      ))}
    </div>
  );
}
