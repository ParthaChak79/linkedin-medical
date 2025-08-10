import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "~/components/Layout";
import { useAuthStore } from "~/stores/authStore";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, User } from "lucide-react";

export const Route = createFileRoute("/feed/")({
  component: FeedPage,
});

type PostForm = {
  content: string;
};

type CommentForm = {
  content: string;
};

function FeedPage() {
  const navigate = useNavigate();
  const { token, user, isAuthenticated } = useAuthStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const {
    register: registerPost,
    handleSubmit: handlePostSubmit,
    reset: resetPost,
    formState: { errors: postErrors },
  } = useForm<PostForm>();

  const feedQuery = useQuery(
    trpc.getFeed.queryOptions({
      limit: 10,
    })
  );

  const createPostMutation = useMutation(
    trpc.createPost.mutationOptions({
      onSuccess: () => {
        resetPost();
        queryClient.invalidateQueries({ queryKey: trpc.getFeed.queryKey() });
      },
    })
  );

  const likePostMutation = useMutation(
    trpc.likePost.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.getFeed.queryKey() });
      },
    })
  );

  const onSubmitPost = (data: PostForm) => {
    if (!token) return;
    createPostMutation.mutate({
      authToken: token,
      content: data.content,
    });
  };

  const handleLikePost = (postId: number) => {
    if (!token) return;
    likePostMutation.mutate({
      authToken: token,
      postId,
    });
  };

  if (!isAuthenticated() || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Create Post Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Share an update</h2>
          <form onSubmit={handlePostSubmit(onSubmitPost)} className="space-y-4">
            <div>
              <textarea
                {...registerPost("content", { 
                  required: "Please write something to share",
                  maxLength: { value: 2000, message: "Post is too long" }
                })}
                rows={3}
                placeholder="What's on your mind? Share your thoughts, experiences, or medical insights..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {postErrors.content && (
                <p className="mt-1 text-sm text-red-600">{postErrors.content.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={createPostMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </button>
          </form>
        </div>

        {/* Feed */}
        {feedQuery.isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading feed...</p>
          </div>
        )}

        {feedQuery.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading feed: {feedQuery.error.message}
          </div>
        )}

        {feedQuery.data?.posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            {/* Post Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {post.author.firstName} {post.author.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {post.author.medicalProfile?.specialty} • {post.author.medicalProfile?.yearsOfExperience} years experience
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleLikePost(post.id)}
                disabled={likePostMutation.isPending}
                className={`flex items-center space-x-2 text-sm transition-colors ${
                  post.likes.some(like => like.userId === user.id)
                    ? "text-red-600"
                    : "text-gray-600 hover:text-red-600"
                }`}
              >
                <Heart 
                  size={18} 
                  fill={post.likes.some(like => like.userId === user.id) ? "currentColor" : "none"}
                />
                <span>{post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</span>
              </button>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageCircle size={18} />
                <span>{post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
              </div>
            </div>

            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {comment.user.firstName} {comment.user.lastName}
                        </p>
                        <p className="text-sm text-gray-800">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            <CommentForm postId={post.id} />
          </div>
        ))}

        {feedQuery.data?.posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No posts yet! Be the first to share something.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function CommentForm({ postId }: { postId: number }) {
  const { token } = useAuthStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentForm>();

  const addCommentMutation = useMutation(
    trpc.addComment.mutationOptions({
      onSuccess: () => {
        reset();
        setShowForm(false);
        queryClient.invalidateQueries({ queryKey: trpc.getFeed.queryKey() });
      },
    })
  );

  const onSubmit = (data: CommentForm) => {
    if (!token) return;
    addCommentMutation.mutate({
      authToken: token,
      postId,
      content: data.content,
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Add a comment...
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <textarea
            {...register("content", { 
              required: "Please write a comment",
              maxLength: { value: 500, message: "Comment is too long" }
            })}
            rows={2}
            placeholder="Write a comment..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.content && (
            <p className="text-xs text-red-600">{errors.content.message}</p>
          )}
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={addCommentMutation.isPending}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {addCommentMutation.isPending ? "Posting..." : "Comment"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                reset();
              }}
              className="text-gray-600 px-3 py-1 rounded text-sm hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
