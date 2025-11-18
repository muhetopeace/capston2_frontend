"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  userId: string;
}

async function toggleFollow(userId: string) {
  const response = await fetch(`/api/users/${userId}/follow`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to toggle follow");
  }
  return response.json();
}

async function getFollowStatus(userId: string) {
  const response = await fetch(`/api/users/${userId}/follow`);
  if (!response.ok) {
    return { following: false };
  }
  return response.json();
}

export default function FollowButton({ userId }: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: followStatus } = useQuery({
    queryKey: ["followStatus", userId],
    queryFn: () => getFollowStatus(userId),
    enabled: !!session,
  });

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
    },
  });

  if (!session) {
    return (
      <button
        onClick={() => router.push("/auth/signin")}
        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Follow
      </button>
    );
  }

  const handleFollow = () => {
    followMutation.mutate();
  };

  return (
    <button
      onClick={handleFollow}
      disabled={followMutation.isPending}
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        followStatus?.following
          ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } disabled:opacity-50`}
    >
      {followMutation.isPending
        ? "Loading..."
        : followStatus?.following
        ? "Following"
        : "Follow"}
    </button>
  );
}

