import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate, truncate } from "@/lib/utils";

async function getUserPosts(userId: string) {
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      tags: true,
      _count: {
        select: {
          likes: true,
          claps: true,
          comments: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return posts;
}

export default async function BlogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const posts = await getUserPosts(session.user.id);
  const publishedPosts = posts.filter((post:any) => post.published);
  const draftPosts = posts.filter((post:any) => !post.published);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Blog</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your posts and drafts
          </p>
        </div>
        <Link
          href="/editor"
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Write New Post
        </Link>
      </div>

      {draftPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Drafts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {draftPosts.map((post: any) => (
              <div
                key={post.id}
                className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                    Draft
                  </span>
                  <Link
                    href={`/editor?edit=${post.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                </div>
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
                  <p className="mb-4 text-gray-600">{truncate(post.excerpt, 150)}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Last updated: {formatDate(post.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Posts</h2>
        {publishedPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedPosts.map((post: any) => (
              <div
                key={post.id}
                className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Published
                  </span>
                  <Link
                    href={`/editor?edit=${post.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                </div>
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
                  <p className="mb-4 text-gray-600">{truncate(post.excerpt, 150)}</p>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag: any) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
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
                <Link
                  href={`/posts/${post.slug}`}
                  className="block mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600 mb-4">No published posts yet.</p>
            <Link
              href="/editor"
              className="inline-block rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Create Your First Post
            </Link>
          </div>
        )}
      </div>

      {posts.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-lg text-gray-600 mb-2">You haven't created any posts yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Start writing and share your thoughts with the world!
          </p>
          <Link
            href="/editor"
            className="inline-block rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Write Your First Post
          </Link>
        </div>
      )}
    </div>
  );
}

