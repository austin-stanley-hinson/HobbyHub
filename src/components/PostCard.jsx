import { Link } from 'react-router-dom';
import { timeAgo } from '../timeAgo';

// One post in the home feed: only its time, title, and upvotes
function PostCard({ post }) {
  return (
    <Link to={`/post/${post.id}`} className="post-card">
      <p className="post-time">Posted {timeAgo(post.created_at)}</p>
      <h2 className="post-title">{post.title}</h2>
      <p className="post-upvotes">
        {post.upvotes} {post.upvotes === 1 ? "upvote" : "upvotes"}
      </p>
    </Link>
  );
}

export default PostCard;
