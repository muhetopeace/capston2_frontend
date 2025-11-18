import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clapSchema = z.object({
  count: z.number().min(1).max(50).optional(),
});

export async function POST(
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
    const validatedData = clapSchema.parse(body);

    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const clapCount = validatedData.count || 1;

    // Check if clap already exists
    const existingClap = await prisma.clap.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
    });

    if (existingClap) {
      // Update clap count
      const clap = await prisma.clap.update({
        where: {
          id: existingClap.id,
        },
        data: {
          count: Math.min(existingClap.count + clapCount, 50),
        },
      });
      return NextResponse.json({ clap });
    } else {
      // Create new clap
      const clap = await prisma.clap.create({
        data: {
          userId: session.user.id,
          postId: post.id,
          count: clapCount,
        },
      });
      return NextResponse.json({ clap }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating clap:", error);
    return NextResponse.json(
      { error: "Failed to create clap" },
      { status: 500 }
    );
  }
}

