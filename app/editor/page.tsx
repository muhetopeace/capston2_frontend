"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import JoditEditor from "jodit-react";
import { useMutation, useQuery } from "@tanstack/react-query";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  published: z.boolean().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

async function createPost(data: PostFormData) {
  const tags = data.tags
    ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      tags,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create post");
  }

  return response.json();
}

async function updatePost(slug: string, data: PostFormData) {
  const tags = data.tags
    ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  const response = await fetch(`/api/posts/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      tags,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update post");
  }

  return response.json();
}

async function getPost(slug: string) {
  const response = await fetch(`/api/posts/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }
  return response.json();
}

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [content, setContent] = useState("");
  const editSlug = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      published: false,
    },
  });

  const { data: postData, isLoading: isLoadingPost } = useQuery({
    queryKey: ["post", editSlug],
    queryFn: () => getPost(editSlug!),
    enabled: !!editSlug && status === "authenticated",
  });

  useEffect(() => {
    if (postData?.post) {
      setValue("title", postData.post.title);
      setValue("content", postData.post.content);
      setContent(postData.post.content);
      setValue("excerpt", postData.post.excerpt || "");
      setValue("coverImage", postData.post.coverImage || "");
      setValue(
        "tags",
        postData.post.tags?.map((tag: any) => tag.name).join(", ") || ""
      );
      setValue("published", postData.post.published);
    }
  }, [postData, setValue]);

  const postMutation = useMutation({
    mutationFn: (data: PostFormData) =>
      editSlug ? updatePost(editSlug, data) : createPost(data),
    onSuccess: (data) => {
      router.push(`/posts/${data.post.slug}`);
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading" || isLoadingPost) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const onSubmit = async (data: PostFormData) => {
    try {
      await postMutation.mutateAsync({
        ...data,
        content,
      });
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-gray-900">
        {editSlug ? "Edit Post" : "Create New Post"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            {...register("title")}
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium text-gray-700"
          >
            Excerpt (optional)
          </label>
          <textarea
            {...register("excerpt")}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="coverImage"
            className="block text-sm font-medium text-gray-700"
          >
            Cover Image URL (optional)
          </label>
          <input
            {...register("coverImage")}
            type="url"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700"
          >
            Tags (comma-separated)
          </label>
          <input
            {...register("tags")}
            type="text"
            placeholder="e.g., technology, programming, web"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <div className="mt-1">
            <JoditEditor
              value={content}
              onChange={(newContent) => {
                setContent(newContent);
                setValue("content", newContent);
              }}
              config={{
                height: typeof window !== "undefined" && window.innerWidth < 640 ? 300 : 500,
                placeholder: "Start writing...",
              }}
            />
          </div>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            {...register("published")}
            type="checkbox"
            id="published"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="published" className="ml-2 text-sm text-gray-700">
            Publish immediately
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="submit"
            disabled={isSubmitting || postMutation.isPending}
            className="w-full sm:w-auto rounded-md bg-blue-600 px-4 sm:px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting || postMutation.isPending
              ? "Saving..."
              : editSlug
              ? "Update Post"
              : "Publish Post"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto rounded-md border border-gray-300 px-4 sm:px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {postMutation.isError && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              {postMutation.error instanceof Error
                ? postMutation.error.message
                : "An error occurred"}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

