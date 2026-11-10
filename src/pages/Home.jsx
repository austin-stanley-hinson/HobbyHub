import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../client';
import PostCard from '../components/PostCard';

// The ways the feed can be ordered
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "upvotes", label: "Most Upvoted" },
];

// Keep only posts whose title contains the search text, ignoring capitals
function searchPosts(posts, searchText) {
  const query = searchText.trim().toLowerCase();
  if (query === "") return posts;
  return posts.filter((post) => post.title.toLowerCase().includes(query));
}

// Put posts in order without changing the original list
function sortPosts(posts, sortBy) {
  const sorted = [...posts];
  if (sortBy === "upvotes") {
    // Most upvotes first; posts with the same count stay newest first
    sorted.sort((a, b) => b.upvotes - a.upvotes || new Date(b.created_at) - new Date(a.created_at));
  } else {
    sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  return sorted;
}

function Home() {
  // Every post, as fetched
  const [posts, setPosts] = useState([]);

  // How the feed is ordered: "newest" or "upvotes"
  const [sortBy, setSortBy] = useState("newest");

  // What the user has typed in the search box
  const [searchText, setSearchText] = useState("");

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

  const visiblePosts = sortPosts(searchPosts(posts, searchText), sortBy);

  return (
    <div className="page">
      <h1>HobbyHub</h1>

      <input
        type="search"
        className="search-input"
        placeholder="Search posts by title..."
        aria-label="Search posts by title"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />

      <div className="feed-controls">
        <span className="feed-controls-label">Order by:</span>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`sort-button${sortBy === option.value ? " active" : ""}`}
            aria-pressed={sortBy === option.value}
            onClick={() => setSortBy(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading && <p>Loading posts...</p>}
      {error && <p className="error">{error}</p>}

      {!isLoading && !error && posts.length === 0 && (
        <p>
          No posts yet. <Link to="/create">Start the first conversation!</Link>
        </p>
      )}

      {posts.length > 0 && visiblePosts.length === 0 && (
        <p>
          No posts match "{searchText.trim()}".{" "}
          <button type="button" className="link-button" onClick={() => setSearchText("")}>
            Clear search
          </button>
        </p>
      )}

      <div className="post-feed">
        {visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Home;
