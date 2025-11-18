import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ posts: [], users: [], tags: [] });
    }

    const searchTerm = q.trim();

    // Search posts
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { content: { contains: searchTerm, mode: "insensitive" } },
          { excerpt: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
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
      take: 20,
    });

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
      },
      take: 10,
    });

    // Search tags
    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { slug: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    return NextResponse.json({ posts, users, tags });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}

