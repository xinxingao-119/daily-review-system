export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const reviewUpdateSchema = z.object({
  workCompleted: z.string().optional(),
  problems: z.string().optional(),
  tomorrowPlan: z.string().optional(),
  reflections: z.string().optional(),
  status: z.enum(["draft", "completed"]).optional(),
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

    const review = await prisma.review.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "复盘不存在" }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("获取复盘详情错误:", error);
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

    const body = await request.json();
    const validation = reviewUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { workCompleted, problems, tomorrowPlan, reflections, status } =
      validation.data;

    const content = [workCompleted, problems, tomorrowPlan, reflections]
      .filter(Boolean)
      .join("");
    const wordCount = content.length;

    const review = await prisma.review.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        ...(workCompleted !== undefined && { workCompleted }),
        ...(problems !== undefined && { problems }),
        ...(tomorrowPlan !== undefined && { tomorrowPlan }),
        ...(reflections !== undefined && { reflections }),
        ...(status && { status }),
        wordCount,
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("更新复盘错误:", error);
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

    await prisma.review.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除复盘错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
