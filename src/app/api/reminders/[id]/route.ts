export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!["pending", "triggered", "completed", "expired"].includes(status)) {
      return NextResponse.json(
        { error: "无效的提醒状态" },
        { status: 400 }
      );
    }

    const reminder = await prisma.reminder.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: { status },
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error("更新提醒错误:", error);
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

    await prisma.reminder.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除提醒错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
