import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../client';
import PostForm from '../components/PostForm';
import LoadingSpinner from '../components/LoadingSpinner';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  // The post's current values, filled into the form (null = not loaded, or doesn't exist)
  const [post, setPost] = useState(null);

  // Is the post still being fetched?
  const [isLoading, setIsLoading] = useState(true);

  // Message to show if fetching failed ("" = no error)
  const [loadError, setLoadError] = useState("");

  // Are the changes being saved right now?
  const [isSaving, setIsSaving] = useState(false);

  // Message to show if saving failed ("" = no error)
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      // Post IDs are whole numbers, so anything else can't be a post
      if (!/^\d+$/.test(id)) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("title, content, image_url")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setLoadError("Couldn't load this post. Please refresh the page.");
      } else if (data) {
        // The form needs "" instead of null for empty fields
        setPost({
          title: data.title,
          content: data.content ?? "",
          image_url: data.image_url ?? "",
        });
      }
      setIsLoading(false);
    };

    fetchPost();
  }, [id]);

  const updatePost = async () => {
    setIsSaving(true);
    setSaveError("");

    // Get the row back to make sure the post still exists
    const { data, error } = await supabase
      .from("posts")
      .update({
        title: post.title.trim(),
        content: post.content.trim() || null,
        image_url: post.image_url.trim() || null,
      })
      .eq("id", id)
      .select("id");

    setIsSaving(false);

    if (error) {
      setSaveError("Couldn't save your changes. Please try again.");
      return;
    }

    if (data.length === 0) {
      setSaveError("This post has been deleted, so it can't be edited.");
      return;
    }

    // Show the updated post
    navigate(`/post/${id}`);
  };

  if (isLoading) {
    return <div className="page"><LoadingSpinner label="Loading post..." /></div>;
  }

  if (loadError) {
    return <div className="page"><p className="error">{loadError}</p></div>;
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
      <Link to={`/post/${id}`} className="back-link">&larr; Back to the post</Link>
      <h1>Edit Post</h1>
      <PostForm
        post={post}
        setPost={setPost}
        onSubmit={updatePost}
        submitLabel="Save Changes"
        isSaving={isSaving}
      />
      {saveError && <p className="error">{saveError}</p>}
    </div>
  );
}

export default EditPost;
