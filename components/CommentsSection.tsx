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
    <div className="border-l-2 border-gray-200 pl-4">
      <div className="mb-2 flex items-start space-x-3">
        {comment.author.image && (
          <Image
            src={comment.author.image}
            alt={comment.author.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">
              {comment.author.name || "Anonymous"}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-gray-700">{comment.content}</p>
          {session && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
          <textarea
            {...register("content")}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a reply..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
          <div className="mt-2 flex space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post Reply"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                reset();
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
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
  });

  const commentMutation = useMutation({
    mutationFn: (data: CommentFormData) => createComment(postSlug, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
      reset();
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
      <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900">Comments</h2>

      {session ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 sm:mb-8">
          <textarea
            {...register("content")}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a comment..."
          />
          {errors.content && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 w-full sm:w-auto rounded-md bg-blue-600 px-4 sm:px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="mb-8 rounded-md bg-gray-50 p-4 text-center">
          <p className="text-gray-600">
            <button
              onClick={() => router.push("/auth/signin")}
              className="text-blue-600 hover:text-blue-800"
            >
              Sign in
            </button>{" "}
            to leave a comment.
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-600">Loading comments...</p>
      ) : data?.comments && data.comments.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {data.comments.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}

