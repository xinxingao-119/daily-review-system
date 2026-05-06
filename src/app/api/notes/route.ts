export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { parseTags, stringifyTags } from "@/lib/utils";

const noteSchema = z.object({
  content: z.string().min(1, "笔记内容不能为空"),
  tags: z.array(z.string()).max(10, "标签数量不能超过 10 个").optional(),
  goalId: z.string().optional().nullable(),
});

const noteUpdateSchema = z.object({
  content: z.string().min(1, "笔记内容不能为空").optional(),
  tags: z.array(z.string()).max(10, "标签数量不能超过 10 个").optional(),
  goalId: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      userId: session.user.id,
      ...(search && { content: { contains: search } }),
      ...(tag && { tags: { contains: tag } }),
    };

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          goal: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.note.count({ where }),
    ]);

    const notesWithParsedTags = notes.map((note) => ({
      ...note,
      tags: parseTags(note.tags),
    }));

    return NextResponse.json({
      notes: notesWithParsedTags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取笔记列表错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const body = await request.json();
    const validation = noteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { content, tags = [], goalId } = validation.data;

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        content,
        tags: stringifyTags(tags),
        goalId: goalId || null,
      },
      include: {
        goal: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(
      {
        note: {
          ...note,
          tags: parseTags(note.tags),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("创建笔记错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
