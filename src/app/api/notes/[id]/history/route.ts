export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
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
    });

    if (!note) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    const history = await prisma.editHistory.findMany({
      where: {
        noteId: params.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("获取笔记历史错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
