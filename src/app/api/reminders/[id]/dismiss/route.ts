export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    let status: string;
    if (action === "dismiss") {
      status = "expired";
    } else if (action === "complete") {
      status = "completed";
    } else {
      return NextResponse.json(
        { error: "无效的操作" },
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
    console.error("处理提醒错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
