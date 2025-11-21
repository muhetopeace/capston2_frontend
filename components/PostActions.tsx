"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  postId: string;
  postSlug: string;
  likesCount: number;
}

async function toggleLike(slug: string) {
  const response = await fetch(`/api/posts/${slug}/like`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to toggle like");
  }
  return response.json();
}

async function getPostStats(slug: string) {
  const response = await fetch(`/api/posts/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }
  const data = await response.json();
  return {
    likesCount: data.post._count.likes,
  };
}

export default function PostActions({
  postId,
  postSlug,
  likesCount: initialLikesCount,
}: PostActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["postStats", postSlug],
    queryFn: () => getPostStats(postSlug),
    initialData: {
      likesCount: initialLikesCount,
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(postSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats", postSlug] });
    },
  });

  const handleLike = () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    likeMutation.mutate();
  };

  return (
    <div className="mt-6 sm:mt-8 flex items-center flex-wrap gap-3 sm:gap-6 border-t border-gray-200 pt-6 sm:pt-8">
      <button
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className="flex items-center space-x-2 rounded-full border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{stats?.likesCount || 0}</span>
      </button>

    </div>
  );
}

