export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { parseTags, stringifyTags } from "@/lib/utils";

const noteUpdateSchema = z.object({
  content: z.string().min(1, "笔记内容不能为空").optional(),
  tags: z.array(z.string()).max(10, "标签数量不能超过 10 个").optional(),
  goalId: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        goal: {
          select: { id: true, name: true },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    return NextResponse.json({
      note: {
        ...note,
        tags: parseTags(note.tags),
      },
    });
  } catch (error) {
    console.error("获取笔记详情错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    const body = await request.json();
    const validation = noteUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { content, tags, goalId } = validation.data;

    if (content && content !== existingNote.content) {
      await prisma.editHistory.create({
        data: {
          noteId: params.id,
          content: existingNote.content,
        },
      });
    }

    const note = await prisma.note.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        ...(content && { content }),
        ...(tags && { tags: stringifyTags(tags) }),
        ...(goalId !== undefined && { goalId: goalId || null }),
      },
      include: {
        goal: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      note: {
        ...note,
        tags: parseTags(note.tags),
      },
    });
  } catch (error) {
    console.error("更新笔记错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    await prisma.note.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除笔记错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
