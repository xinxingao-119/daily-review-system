export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const reminderSchema = z.object({
  content: z.string().min(1, "提醒内容不能为空"),
  remindAt: z.string().datetime(),
  recurrence: z.enum(["daily", "weekly", "monthly"]).optional().nullable(),
});

const reminderUpdateSchema = z.object({
  status: z.enum(["pending", "triggered", "completed", "expired"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const where: any = {
      userId: session.user.id,
      ...(statusFilter && { status: statusFilter }),
    };

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: { remindAt: "asc" },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("获取提醒列表错误:", error);
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
    const validation = reminderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { content, remindAt, recurrence } = validation.data;
    const remindAtDate = new Date(remindAt);

    if (remindAtDate <= new Date()) {
      return NextResponse.json(
        { error: "提醒时间必须在未来" },
        { status: 400 }
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        content,
        remindAt: remindAtDate,
        recurrence: recurrence || null,
        status: "pending",
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error("创建提醒错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
