"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface CommentsSectionProps {
  postSlug: string;
}

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

type CommentFormData = z.infer<typeof commentSchema>;

async function getComments(slug: string) {
  const response = await fetch(`/api/posts/${slug}/comments`);
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return response.json();
}

async function createComment(slug: string, content: string, parentId?: string) {
  const response = await fetch(`/api/posts/${slug}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, parentId }),
  });
  if (!response.ok) {
    throw new Error("Failed to create comment");
  }
  return response.json();
}

function CommentItem({
  comment,
  postSlug,
}: {
  comment: any;
  postSlug: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const replyMutation = useMutation({
    mutationFn: (data: CommentFormData) =>
      createComment(postSlug, data.content, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postSlug],
      });
      reset();
      setShowReplyForm(false);
    },
  });

  const onSubmit = (data: CommentFormData) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    replyMutation.mutate(data);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-start space-x-4">
        {comment.author.image && (
          <Image
            src={comment.author.image}
            alt={comment.author.name || "User"}
            width={44}
            height={44}
            className="rounded-full ring-2 ring-purple-500/50 shadow-lg"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              {comment.author.name || "Anonymous"}
            </span>
            <span className="text-sm text-cyan-400/70">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-gray-100 leading-relaxed">{comment.content}</p>
          {session && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              💬 Reply
            </button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 ml-14 bg-slate-900/50 rounded-lg p-4 border border-cyan-500/20">
          <textarea
            {...register("content")}
            rows={3}
            className="w-full rounded-lg border border-purple-500/30 bg-slate-950 text-white px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-gray-500"
            placeholder="Write a reply..."
          />
          {errors.content && (
            <p className="mt-2 text-sm text-rose-400">
              {errors.content.message}
            </p>
          )}
          <div className="mt-3 flex space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-purple-500/50"
            >
              {isSubmitting ? "Posting..." : "Post Reply"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                reset();
              }}
              className="rounded-lg border border-purple-500/30 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-slate-800 hover:border-purple-500/50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-12 space-y-3">
          {comment.replies.map((reply: any) => (
            <CommentItem key={reply.id} comment={reply} postSlug={postSlug} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ postSlug }: CommentsSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postSlug],
    queryFn: () => getComments(postSlug),
    refetchOnWindowFocus: false,
  });

  const commentMutation = useMutation({
    mutationFn: (data: CommentFormData) => createComment(postSlug, data.content),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
    },
  });

  const onSubmit = (data: CommentFormData) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    commentMutation.mutate(data);
  };

  return (
    <div className="mt-8 sm:mt-12">
      <h2 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500">💬 Comments</h2>

      {session ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-5 sm:p-7 border border-purple-500/30 shadow-xl">
          <textarea
            {...register("content")}
            rows={4}
            className="w-full rounded-xl border border-purple-500/30 bg-slate-950 text-white px-4 sm:px-5 py-3 sm:py-4 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-gray-500 transition-all"
            placeholder="Share your thoughts..."
          />
          {errors.content && (
            <p className="mt-2 text-xs sm:text-sm text-rose-400">
              {errors.content.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full sm:w-auto rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 px-8 py-3 text-sm font-bold text-white hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105"
          >
            {isSubmitting ? "✨ Posting..." : "✨ Post Comment"}
          </button>
        </form>
      ) : (
        <div className="mb-8 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-purple-500/30 p-8 text-center shadow-lg">
          <p className="text-gray-200 text-lg">
            <button
              onClick={() => router.push("/auth/signin")}
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 hover:from-purple-300 hover:to-cyan-300 font-bold transition-all"
            >
              🔐 Sign in
            </button>{" "}
            to leave a comment.
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="text-cyan-400 animate-pulse">✨ Loading comments...</p>
      ) : data?.comments && data.comments.length > 0 ? (
        <div className="space-y-5">
          {data.comments.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-12 text-lg">💭 No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}

