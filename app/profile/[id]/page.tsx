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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={120}
                height={120}
                className="rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0"
              />
            )}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {user.name || "Anonymous"}
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 break-all">{user.email}</p>
              {user.bio && (
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700">{user.bio}</p>
              )}
              <div className="mt-3 sm:mt-4 flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
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
          {!isOwnProfile && (
            <div className="flex justify-center sm:justify-end">
              <FollowButton userId={user.id} />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900">Published Posts</h2>
        {user.posts.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                <h3 className="mb-2 text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mb-4 text-gray-600">{post.excerpt}</p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
                  <span>
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                  </span>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <span>{post._count.likes} likes</span>
                    <span>{post._count.comments} comments</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-green-500">No published posts yet.</p>
        )}
      </div>
    </div>
  );
}

