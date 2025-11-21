import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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
              comments: true,
            },
          },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const validatedData = postSchema.parse(body);

    // Check if post exists and user is author
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update post
    const updateData: any = {};
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.content) updateData.content = validatedData.content;
    if (validatedData.excerpt !== undefined)
      updateData.excerpt = validatedData.excerpt;
    if (validatedData.coverImage !== undefined)
      updateData.coverImage = validatedData.coverImage || null;
    if (validatedData.published !== undefined) {
      updateData.published = validatedData.published;
      updateData.publishedAt = validatedData.published ? new Date() : null;
    }

    const post = await prisma.post.update({
      where: { slug },
      data: updateData,
      include: {
        author: true,
        tags: true,
      },
    });

    // Handle tags if provided
    if (validatedData.tags) {
      // Remove existing tags
      await prisma.postTag.deleteMany({
        where: { postId: post.id },
      });

      // Add new tags
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

    return NextResponse.json({ post: postWithRelations });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Check if post exists and user is author
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

