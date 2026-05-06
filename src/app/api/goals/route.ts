export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const goalSchema = z.object({
  name: z.string().min(1, "目标名称不能为空"),
  description: z.string().optional(),
  deadline: z.string().datetime().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  progress: z.number().min(0).max(100).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [{ deadline: "asc" }, { priority: "asc" }],
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("获取目标列表错误:", error);
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
    const validation = goalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, deadline, priority, progress } = validation.data;

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        name,
        description: description || "",
        deadline: deadline ? new Date(deadline) : null,
        priority: priority || "medium",
        progress: progress || 0,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("创建目标错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
