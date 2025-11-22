"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

async function deletePost(slug: string) {
  const response = await fetch(`/api/posts/${slug}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete post");
  }

  return response.json();
}

interface DeletePostButtonProps {
  slug: string;
  onDeleted?: () => void;
}

export default function DeletePostButton({ slug, onDeleted }: DeletePostButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(slug),
    onSuccess: () => {
      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/blog");
        router.refresh();
      }
    },
  });

  const handleDelete = () => {
    if (showConfirm) {
      deleteMutation.mutate();
    } else {
      setShowConfirm(true);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="inline-block">
      {showConfirm ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Are you sure?</span>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            onClick={handleCancel}
            disabled={deleteMutation.isPending}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete
        </button>
      )}
      {deleteMutation.isError && (
        <p className="mt-1 text-sm text-red-600">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : "Failed to delete post"}
        </p>
      )}
    </div>
  );
}

