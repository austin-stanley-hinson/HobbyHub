import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../client';
import PostCard from '../components/PostCard';

function Home() {
  // Every post, newest first
  const [posts, setPosts] = useState([]);

  // Are the posts still being fetched?
  const [isLoading, setIsLoading] = useState(true);

  // Message to show if fetching failed ("" = no error)
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      // The feed only shows these fields, so don't fetch content or images
      const { data, error } = await supabase
        .from("posts")
        .select("id, created_at, title, upvotes")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Couldn't load posts. Please refresh the page.");
      } else {
        setPosts(data);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="page">
      <h1>HobbyHub</h1>

      {isLoading && <p>Loading posts...</p>}
      {error && <p className="error">{error}</p>}

      {!isLoading && !error && posts.length === 0 && (
        <p>
          No posts yet. <Link to="/create">Start the first conversation!</Link>
        </p>
      )}

      <div className="post-feed">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Home;
