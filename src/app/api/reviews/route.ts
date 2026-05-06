export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  date: z.string().datetime(),
  workCompleted: z.string().optional(),
  problems: z.string().optional(),
  tomorrowPlan: z.string().optional(),
  reflections: z.string().optional(),
  status: z.enum(["draft", "completed"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { workCompleted: { contains: search } },
          { problems: { contains: search } },
          { tomorrowPlan: { contains: search } },
          { reflections: { contains: search } },
        ],
      }),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取复盘列表错误:", error);
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
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { date, workCompleted, problems, tomorrowPlan, reflections, status } =
      validation.data;

    const dateObj = new Date(date);
    const content = [workCompleted, problems, tomorrowPlan, reflections]
      .filter(Boolean)
      .join("");
    const wordCount = content.length;

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        date: dateObj,
        workCompleted: workCompleted || "",
        problems: problems || "",
        tomorrowPlan: tomorrowPlan || "",
        reflections: reflections || "",
        status: status || "draft",
        wordCount,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("创建复盘错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
