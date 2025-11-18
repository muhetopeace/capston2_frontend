import Link from "next/link";
import Image from "next/image";
import { formatDate, truncate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

async function getPosts() {
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
    take: 10,
  });

  return posts;
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Latest Stories</h1>
        <p className="mt-2 text-lg text-gray-600">
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: any) => (
          <div
            key={post.id}
            className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
          >
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
              <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mb-4 text-gray-600">{truncate(post.excerpt, 150)}</p>
              )}
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {post.author.image && (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || "Author"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-gray-600">
                  {post.author.name || "Anonymous"}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {post.publishedAt ? formatDate(post.publishedAt) : ""}
              </span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <span>{post._count?.likes || 0} likes</span>
              <span>{post._count?.claps || 0} claps</span>
              <span>{post._count?.comments || 0} comments</span>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600">No posts yet. Be the first to write!</p>
        </div>
      )}
    </div>
  );
}

