import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import PostForm from '../components/PostForm';

const EMPTY_POST = { title: "", content: "", image_url: "" };

function CreatePost() {
  const navigate = useNavigate();

  // What the user has typed so far
  const [post, setPost] = useState(EMPTY_POST);

  // Is the new post being saved right now?
  const [isSaving, setIsSaving] = useState(false);

  // Message to show if saving failed ("" = no error)
  const [error, setError] = useState("");

  const createPost = async () => {
    setIsSaving(true);
    setError("");

    // Save empty optional fields as null instead of ""
    const { error } = await supabase.from("posts").insert({
      title: post.title.trim(),
      content: post.content.trim() || null,
      image_url: post.image_url.trim() || null,
    });

    setIsSaving(false);

    if (error) {
      setError("Couldn't create the post. Please try again.");
      return;
    }

    // Show the new post at the top of the home feed
    navigate("/");
  };

  return (
    <div className="page">
      <h1>Create a New Post</h1>
      <PostForm
        post={post}
        setPost={setPost}
        onSubmit={createPost}
        submitLabel="Create Post"
        isSaving={isSaving}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default CreatePost;
