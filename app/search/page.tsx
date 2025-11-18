"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { formatDate, truncate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

async function search(query: string) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error("Failed to search");
  }
  return response.json();
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Search</h1>
        <div className="mt-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, users, and tags..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading && (
        <div className="py-12 text-center">
          <p className="text-gray-600">Searching...</p>
        </div>
      )}

      {error && (
        <div className="py-12 text-center">
          <p className="text-red-600">Error searching. Please try again.</p>
        </div>
      )}

      {!isLoading && !error && debouncedQuery && data && (
        <>
          {data.posts && data.posts.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Posts</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.posts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
                  >
                    {post.coverImage && (
                      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mb-4 text-gray-600">
                        {truncate(post.excerpt, 150)}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {post.publishedAt ? formatDate(post.publishedAt) : ""}
                      </span>
                      <div className="flex space-x-4">
                        <span>{post._count.likes} likes</span>
                        <span>{post._count.comments} comments</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {data.users && data.users.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Users</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.users.map((user: any) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg"
                  >
                    {user.image && (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.name || "Anonymous"}
                      </h3>
                      {user.bio && (
                        <p className="text-sm text-gray-600">
                          {truncate(user.bio, 50)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {data.tags && data.tags.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="rounded-full bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {data.posts.length === 0 &&
            data.users.length === 0 &&
            data.tags.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-600">No results found.</p>
              </div>
            )}
        </>
      )}

      {!debouncedQuery && (
        <div className="py-12 text-center">
          <p className="text-gray-600">Enter a search query to get started.</p>
        </div>
      )}
    </div>
  );
}

