"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Dynamically load Jodit CSS to avoid Next.js CSS parsing issues

// Dynamically import Jodit to avoid SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <div className="h-96 border rounded-md p-4">Loading editor...</div>,
});

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

  // Clean up coverImage - if empty string, set to undefined
  const cleanData = {
    ...data,
    tags,
    coverImage: data.coverImage && data.coverImage.trim() !== "" ? data.coverImage : undefined,
  };

  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanData),
  });

  if (!response.ok) {
    const error = await response.json();
    // Show more detailed error message
    if (error.issues && Array.isArray(error.issues)) {
      const errorMessages = error.issues.map((issue: any) => 
        `${issue.path.join(".")}: ${issue.message}`
      ).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }
    throw new Error(error.error || `Failed to create post (${response.status})`);
  }

  return response.json();
}

async function updatePost(slug: string, data: PostFormData) {
  const tags = data.tags
    ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  // Clean up coverImage - if empty string, set to undefined
  const cleanData = {
    ...data,
    tags,
    coverImage: data.coverImage && data.coverImage.trim() !== "" ? data.coverImage : undefined,
  };

  const response = await fetch(`/api/posts/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanData),
  });

  if (!response.ok) {
    const error = await response.json();
    // Show more detailed error message
    if (error.issues && Array.isArray(error.issues)) {
      const errorMessages = error.issues.map((issue: any) => 
        `${issue.path.join(".")}: ${issue.message}`
      ).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }
    throw new Error(error.error || `Failed to update post (${response.status})`);
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

// Local storage key for drafts
const DRAFT_STORAGE_KEY = "blog-post-draft";

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const editorRef = useRef<any>(null);
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

  const watchedTitle = watch("title");
  const watchedExcerpt = watch("excerpt");
  const watchedTags = watch("tags");

  const { data: postData, isLoading: isLoadingPost } = useQuery({
    queryKey: ["post", editSlug],
    queryFn: () => getPost(editSlug!),
    enabled: !!editSlug && status === "authenticated",
  });

  // Load draft from local storage on mount (only if not editing existing post)
  useEffect(() => {
    if (!editSlug) {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setValue("title", draft.title || "");
          setValue("content", draft.content || "");
          setContent(draft.content || "");
          setValue("excerpt", draft.excerpt || "");
          setValue("coverImage", draft.coverImage || "");
          setValue("tags", draft.tags || "");
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      }
    }
  }, [editSlug, setValue]);

  // Load existing post data
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
      setValue("published", postData.post.published || false);
    }
  }, [postData, setValue]);

  // Auto-save draft to local storage
  useEffect(() => {
    if (!editSlug && (watchedTitle || content || watchedExcerpt || watchedTags)) {
      const draft = {
        title: watchedTitle || "",
        content: content || "",
        excerpt: watchedExcerpt || "",
        tags: watchedTags || "",
        coverImage: watch("coverImage") || "",
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  }, [watchedTitle, content, watchedExcerpt, watchedTags, editSlug, watch]);

  const postMutation = useMutation({
    mutationFn: (data: PostFormData) =>
      editSlug ? updatePost(editSlug, data) : createPost(data),
    onSuccess: (data) => {
      // Clear draft from local storage after successful publish
      if (!editSlug) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      router.push(`/posts/${data.post.slug}`);
      router.refresh();
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Dynamically load Jodit CSS from CDN to avoid Next.js CSS parsing issues
  useEffect(() => {
    // Check if stylesheet is already loaded
    const existingLink = document.querySelector('link[data-jodit-css="true"]');
    if (existingLink) {
      return;
    }

    // Load Jodit CSS from CDN (bypasses Next.js CSS parser)
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/jodit@4.7.9/build/es2015/jodit.min.css";
    link.setAttribute("data-jodit-css", "true");
    document.head.appendChild(link);

    // Also load the fix for invalid CSS syntax
    const fixLink = document.createElement("link");
    fixLink.rel = "stylesheet";
    fixLink.href = "/jodit-fix.css";
    fixLink.setAttribute("data-jodit-fix", "true");
    document.head.appendChild(fixLink);

    return () => {
      // Cleanup: remove the stylesheets when component unmounts (optional)
      const linkToRemove = document.querySelector('link[data-jodit-css="true"]');
      const fixToRemove = document.querySelector('link[data-jodit-fix="true"]');
      if (linkToRemove) linkToRemove.remove();
      if (fixToRemove) fixToRemove.remove();
    };
  }, []);

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

  const onSubmit = async (data: PostFormData, publish: boolean = true) => {
    try {
      const postData = {
        ...data,
        content,
        published: publish,
      };
      
      console.log("Submitting post data:", {
        title: postData.title,
        contentLength: postData.content?.length,
        excerpt: postData.excerpt,
        coverImage: postData.coverImage,
        tags: postData.tags,
        published: postData.published,
      });
      
      await postMutation.mutateAsync(postData);
    } catch (error) {
      console.error("Error saving post:", error);
      // Error will be displayed via postMutation.isError
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const formData = {
        title: watchedTitle || "Untitled",
        content: content || "",
        excerpt: watchedExcerpt || "",
        coverImage: watch("coverImage") || "",
        tags: watchedTags || "",
        published: false,
      };

      await onSubmit(formData as PostFormData, false);
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Jodit editor configuration
  const editorConfig = {
    readonly: false,
    placeholder: "Start writing your content here...",
    toolbar: true,
    spellcheck: true,
    language: "en",
    toolbarButtonSize: "medium",
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    defaultActionOnPaste: "insert_as_html",
    buttons: [
      "source",
      "|",
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "outdent",
      "indent",
      "|",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "heading",
      "|",
      "image",
      "link",
      "|",
      "align",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "copyformat",
      "|",
      "fullsize",
      "selectall",
      "print",
      "|",
      "code",
      "blockquote",
      "|",
      "preview",
    ],
    uploader: {
      insertImageAsBase64URI: false,
      url: "/api/upload",
      format: "json",
      prepareData: (formData: FormData) => {
        return formData;
      },
      isSuccess: (resp: any) => {
        return resp && resp.url !== undefined && !resp.error;
      },
      getMessage: (resp: any) => {
        return resp.error || "";
      },
      process: (resp: any) => {
        if (resp.error) {
          return {
            files: [],
            path: "",
            baseurl: "",
            error: 1,
            msg: resp.error || "Upload failed",
          };
        }
        return {
          files: resp.url ? [resp.url] : [],
          path: resp.url || "",
          baseurl: "",
          error: 0,
          msg: "",
        };
      },
      defaultHandlerSuccess: (data: any) => {
        if (data && data.files && data.files.length) {
          const url = data.files[0];
          if (editorRef.current?.editor) {
            editorRef.current.editor.selection.insertImage(url);
          }
        }
      },
      error: (e: any) => {
        console.error("Upload error:", e);
        alert(`Image upload failed: ${e.message || "Unknown error"}`);
      },
    },
    events: {
      afterInsertImage: (image: HTMLImageElement) => {
        image.style.maxWidth = "100%";
        image.style.height = "auto";
      },
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {editSlug ? "Edit Post" : "Create New Post"}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {isPreview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data, true))} className="space-y-6">
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
            placeholder="Enter post title..."
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
            placeholder="Brief description of your post..."
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
            placeholder="https://example.com/image.jpg"
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
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Content
          </label>
          {isPreview ? (
            <div className="mt-1 min-h-[400px] rounded-md border border-gray-300 p-4 bg-white">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <JoditEditor
                ref={editorRef}
                value={content}
                config={editorConfig as any}
                onBlur={(newContent) => {
                  setContent(newContent);
                  setValue("content", newContent);
                }}
                onChange={(newContent) => {
                  setContent(newContent);
                  setValue("content", newContent);
                }}
              />
            </div>
          )}
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="submit"
            disabled={isSubmitting || postMutation.isPending}
            className="w-full sm:w-auto rounded-md bg-blue-600 px-4 sm:px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting || postMutation.isPending
              ? "Publishing..."
              : editSlug
              ? "Update Post"
              : "Publish Post"}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting || postMutation.isPending}
            className="w-full sm:w-auto rounded-md border bg-blue-600 border-blue-600 px-4 sm:px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {isSavingDraft ? "Saving Draft..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto rounded-md border  bg-blue-600 border-blue-600 px-4 sm:px-6 py-2 text-sm font-medium text-white hover:bg-blue-500"
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
