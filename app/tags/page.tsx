import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getTags() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tags;
}

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">All Tags</h1>
        <p className="mt-2 text-lg text-gray-600">
          Explore posts by topic and category
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tags.map((tag: any) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
          >
            <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
              {tag.name}
            </h2>
            
          </Link>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600">No tags yet.</p>
        </div>
      )}
    </div>
  );
}

