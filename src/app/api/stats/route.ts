import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseTags } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    const userId = session.user.id;

    const [
      reviewCount,
      completedReviewCount,
      noteCount,
      reminderCount,
      goalCount,
      reviews,
    ] = await Promise.all([
      prisma.review.count({ where: { userId } }),
      prisma.review.count({ where: { userId, status: "completed" } }),
      prisma.note.count({ where: { userId } }),
      prisma.reminder.count({ where: { userId } }),
      prisma.goal.count({ where: { userId } }),
      prisma.review.findMany({
        where: { userId, status: "completed" },
        select: { date: true, wordCount: true },
        orderBy: { date: "asc" },
      }),
    ]);

    const notes = await prisma.note.findMany({
      where: { userId },
      select: { createdAt: true, content: true, tags: true },
      orderBy: { createdAt: "asc" },
    });

    const goals = await prisma.goal.findMany({
      where: { userId },
      select: { priority: true, progress: true },
    });

    const reviewTrend = reviews.map((r) => ({
      date: r.date.toISOString().split("T")[0],
      wordCount: r.wordCount,
    }));

    const noteTrend: Record<string, number> = {};
    notes.forEach((n) => {
      const date = n.createdAt.toISOString().split("T")[0];
      noteTrend[date] = (noteTrend[date] || 0) + 1;
    });

    const tagCounts: Record<string, number> = {};
    notes.forEach((n) => {
      const tags = parseTags(n.tags);
      tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const goalDistribution = {
      low: goals.filter((g) => g.priority === "low").length,
      medium: goals.filter((g) => g.priority === "medium").length,
      high: goals.filter((g) => g.priority === "high").length,
    };

    const heatmapData = reviews.map((r) => ({
      date: r.date.toISOString().split("T")[0],
      wordCount: r.wordCount,
    }));

    notes.forEach((n) => {
      const date = n.createdAt.toISOString().split("T")[0];
      const existing = heatmapData.find((h) => h.date === date);
      if (existing) {
        existing.wordCount += 1;
      } else {
        heatmapData.push({ date, wordCount: 1 });
      }
    });

    return NextResponse.json({
      overview: {
        reviewCount,
        completedReviewCount,
        noteCount,
        reminderCount,
        goalCount,
        completionRate: reviewCount > 0 ? completedReviewCount / reviewCount : 0,
      },
      reviewTrend,
      noteTrend: Object.entries(noteTrend).map(([date, count]) => ({
        date,
        count,
      })),
      goalDistribution,
      topTags,
      heatmapData,
    });
  } catch (error) {
    console.error("获取统计数据错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
