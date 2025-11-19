import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import FollowButton from "@/components/FollowButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: {
        where: { published: true },
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
          publishedAt: "desc",
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  return user;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={120}
                height={120}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.name || "Anonymous"}
              </h1>
              <p className="mt-2 text-gray-600">{user.email}</p>
              {user.bio && (
                <p className="mt-4 text-gray-700">{user.bio}</p>
              )}
              <div className="mt-4 flex space-x-6 text-sm text-gray-600">
                <span>
                  <strong>{user._count.followers}</strong> Following
                </span>
                <span>
                  <strong>{user._count.following}</strong> Follower
                </span>
                <span>
                  <strong>{user.posts.length}</strong> Posts
                </span>
              </div>
            </div>
          </div>
          {!isOwnProfile && <FollowButton userId={user.id} />}
        </div>
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Published Posts</h2>
        {user.posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {user.posts.map((post: any) => (
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
                  <p className="mb-4 text-gray-600">{post.excerpt}</p>
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
        ) : (
          <p className="text-center text-gray-600">No published posts yet.</p>
        )}
      </div>
    </div>
  );
}

