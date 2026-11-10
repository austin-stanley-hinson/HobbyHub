import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../client';
import PostForm from '../components/PostForm';

// Post IDs are whole numbers
const isPostId = (text) => /^\d+$/.test(text.trim());

function CreatePost() {
  const navigate = useNavigate();

  // "Repost" on a post page links here with ?repost=<id>
  const [searchParams] = useSearchParams();

  // What the user has typed so far
  const [post, setPost] = useState({
    title: "",
    content: "",
    image_url: "",
    repost_of: searchParams.get("repost") ?? "",
    secret_key: "",
  });

  // The post being reposted, shown under its ID (null = none or not found)
  const [repostedPost, setRepostedPost] = useState(null);

  // Is the new post being saved right now?
  const [isSaving, setIsSaving] = useState(false);

  // Message to show if saving failed ("" = no error)
  const [error, setError] = useState("");

  // Look up the post being reposted whenever its ID changes
  const repostId = post.repost_of.trim();
  useEffect(() => {
    // Ignore the answer if the ID changes again before it arrives
    let isCurrent = true;

    const fetchRepostedPost = async () => {
      if (!isPostId(repostId)) {
        setRepostedPost(null);
        return;
      }

      const { data } = await supabase
        .from("posts")
        .select("id, title")
        .eq("id", repostId)
        .maybeSingle();

      if (isCurrent) setRepostedPost(data);
    };

    fetchRepostedPost();

    return () => {
      isCurrent = false;
    };
  }, [repostId]);

  const createPost = async () => {
    setError("");

    if (repostId !== "" && !isPostId(repostId)) {
      setError("The post ID to repost should be a number, like 12.");
      return;
    }

    setIsSaving(true);

    // Save empty optional fields as null instead of ""
    const { error } = await supabase.from("posts").insert({
      title: post.title.trim(),
      content: post.content.trim() || null,
      image_url: post.image_url.trim() || null,
      repost_of: repostId === "" ? null : Number(repostId),
      secret_key: post.secret_key.trim(),
    });

    setIsSaving(false);

    // 23503 = the post ID being reposted doesn't exist
    if (error?.code === "23503") {
      setError(`There's no post #${repostId} to repost.`);
      return;
    }

    if (error) {
      setError("Couldn't create the post. Please try again.");
      return;
    }

    // Show the new post at the top of the home feed
    navigate("/");
  };

  // Shown under the repost field so users can tell they picked the right post
  let repostPreview = null;
  if (isPostId(repostId)) {
    repostPreview = repostedPost ? (
      <p className="field-hint">
        Reposting: <Link to={`/post/${repostedPost.id}`}>{repostedPost.title}</Link>
      </p>
    ) : (
      <p className="field-hint">No post #{repostId} found yet.</p>
    );
  }

  return (
    <div className="page">
      <h1>Create a New Post</h1>
      <PostForm
        post={post}
        setPost={setPost}
        onSubmit={createPost}
        submitLabel="Create Post"
        isSaving={isSaving}
        isNewPost
        repostPreview={repostPreview}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default CreatePost;
