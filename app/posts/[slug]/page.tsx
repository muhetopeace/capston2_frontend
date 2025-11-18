import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import PostContent from "@/components/PostContent";
import PostActions from "@/components/PostActions";
import CommentsSection from "@/components/CommentsSection";
import FollowButton from "@/components/FollowButton";
import type { Metadata } from "next";

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
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
  });

  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author.name ? [post.author.name] : [],
      tags: post.tags.map((tag: any) => tag.name),
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">{post.title}</h1>

        {post.excerpt && (
          <p className="mb-6 text-xl text-gray-600">{post.excerpt}</p>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {post.author.image && (
              <Image
                src={post.author.image}
                alt={post.author.name || "Author"}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <Link
                href={`/profile/${post.author.id}`}
                className="block font-semibold text-gray-900 hover:text-blue-600"
              >
                {post.author.name || "Anonymous"}
              </Link>
              {post.publishedAt && (
                <time className="text-sm text-gray-500">
                  {formatDate(post.publishedAt)}
                </time>
              )}
            </div>
          </div>
          <FollowButton userId={post.author.id} />
        </div>

        {post.coverImage && (
          <div className="relative mb-8 h-96 w-full overflow-hidden rounded-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: any) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <PostContent content={post.content} />

      <PostActions
        postId={post.id}
        postSlug={post.slug}
        likesCount={post._count.likes}
        clapsCount={post._count.claps}
      />

      <CommentsSection postSlug={post.slug} />
    </article>
  );
}

