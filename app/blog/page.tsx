import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate, truncate } from "@/lib/utils";

async function getAllPublishedPosts() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
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
      publishedAt: "desc",
    },
  });

  return posts;
}

export default async function BlogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const posts = await getAllPublishedPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Blog</h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Manage your posts
          </p>
        </div>
        <Link
          href="/editor"
          className="rounded-full bg-blue-600 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 transition-colors text-center"
        >
          Write New Post
        </Link>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">All Published Stories</h2>
        {posts.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <div
                key={post.id}
                className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Published
                  </span>
                  {session?.user?.id === post.authorId && (
                    <Link
                      href={`/editor?edit=${post.slug}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                  )}
                </div>
                <Link href={`/posts/${post.slug}`}>
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
                </Link>
                <div className="mb-4 flex items-center space-x-2">
                  {post.author.image && (
                    <Image
                      src={post.author.image}
                      alt={post.author.name || "Author"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-xs text-gray-600">
                    {post.author.name || "Anonymous"}
                  </span>
                </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
                  <span>
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                  </span>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <span className="text-red-600 font-medium">{post._count.likes} likes</span>
                    <span className="text-blue-600 font-medium">{post._count.claps} claps</span>
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
    </div>
  );
}

