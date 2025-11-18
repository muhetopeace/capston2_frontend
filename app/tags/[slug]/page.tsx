import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate, truncate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

async function getTag(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
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
      },
    },
  });

  return tag;
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{tag.name}</h1>
        <p className="mt-2 text-lg text-gray-600">
          {tag.posts.length} {tag.posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {tag.posts.map((post: any) => (
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
            <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mb-4 text-gray-600">{truncate(post.excerpt, 150)}</p>
            )}
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
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <span>{post._count.likes} likes</span>
              <span>{post._count.claps} claps</span>
              <span>{post._count.comments} comments</span>
            </div>
          </Link>
        ))}
      </div>

      {tag.posts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600">No posts in this tag yet.</p>
        </div>
      )}
    </div>
  );
}

