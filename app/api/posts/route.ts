import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published") !== "false";
    const authorId = searchParams.get("authorId");
    const tag = searchParams.get("tag");

    const posts = await prisma.post.findMany({
      where: {
        ...(published !== undefined && { published }),
        ...(authorId && { authorId }),
        ...(tag && {
          tags: {
            some: {
              slug: tag,
            },
          },
        }),
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
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Clean up empty strings for optional fields
    if (body.coverImage === "" || body.coverImage === null) {
      body.coverImage = undefined;
    }
    if (body.excerpt === "" || body.excerpt === null) {
      body.excerpt = undefined;
    }
    
    const validatedData = postSchema.parse(body);

    // Create post
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        slug: `${validatedData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}-${Date.now()}`,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        coverImage: validatedData.coverImage || null,
        published: validatedData.published || false,
        publishedAt: validatedData.published ? new Date() : null,
        authorId: session.user.id,
      },
    });

    // Handle tags
    if (validatedData.tags && validatedData.tags.length > 0) {
      for (const tagName of validatedData.tags) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        let tag = await prisma.tag.findUnique({
          where: { slug: tagSlug },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagSlug,
            },
          });
        }

        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: tag.id,
          },
        });
      }
    }

    const postWithRelations = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        author: true,
        tags: true,
      },
    });

    return NextResponse.json({ post: postWithRelations }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { error: "Validation error", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating post:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

