import { Link } from 'react-router-dom';
import { timeAgo } from '../timeAgo';

// One post in the home feed: only its time, title, and upvotes
function PostCard({ post }) {
  return (
    <Link to={`/post/${post.id}`} className="post-card">
      <div className="post-card-body">
        <p className="post-time">Posted {timeAgo(post.created_at)}</p>
        <h2 className="post-title">{post.title}</h2>
      </div>
      {/* Shown like a score on a scoreboard */}
      <p className="post-upvotes">
        <span className="post-upvotes-count">{post.upvotes}</span>
        <span className="post-upvotes-label">{post.upvotes === 1 ? "upvote" : "upvotes"}</span>
      </p>
    </Link>
  );
}

export default PostCard;
