"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todayReview, setTodayReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      checkTodayReview();
    }
  }, [status]);

  const checkTodayReview = async () => {
    try {
      const response = await fetch("/api/reviews/today");
      const data = await response.json();
      setTodayReview(data.review);
    } catch (error) {
      console.error("检查今日复盘错误:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          欢迎回来，{session?.user?.name || session?.user?.email}
        </h1>
        <p className="text-gray-600">
          {format(new Date(), "yyyy 年 MM 月 dd 日 EEEE", { locale: zhCN })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/review/new"
          className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">创建复盘</h3>
          <p className="text-gray-600 text-sm">
            {todayReview ? "今日复盘已创建，点击编辑" : "点击创建今日复盘"}
          </p>
        </Link>

        <Link
          href="/notes/new"
          className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">添加笔记</h3>
          <p className="text-gray-600 text-sm">快速记录碎片化想法</p>
        </Link>

        <Link
          href="/reminders"
          className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">查看提醒</h3>
          <p className="text-gray-600 text-sm">管理你的待办事项</p>
        </Link>

        <Link
          href="/goals"
          className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">长期目标</h3>
          <p className="text-gray-600 text-sm">追踪目标进展</p>
        </Link>
      </div>

      {todayReview && (
        <div className="bg-white p-6 rounded-lg border mb-8">
          <h2 className="text-xl font-semibold mb-4">今日复盘</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                今日完成的工作
              </h3>
              <p className="text-gray-800">
                {todayReview.workCompleted || "未记录"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                遇到的问题
              </h3>
              <p className="text-gray-800">{todayReview.problems || "未记录"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">明日计划</h3>
              <p className="text-gray-800">
                {todayReview.tomorrowPlan || "未记录"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                反思/感悟
              </h3>
              <p className="text-gray-800">
                {todayReview.reflections || "未记录"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={`/review/${todayReview.id}`}
              className="text-blue-600 hover:underline"
            >
              编辑复盘 →
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">快速导航</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/review"
            className="text-blue-600 hover:underline"
          >
            复盘列表
          </Link>
          <Link href="/notes" className="text-blue-600 hover:underline">
            笔记列表
          </Link>
          <Link href="/stats" className="text-blue-600 hover:underline">
            统计概览
          </Link>
        </div>
      </div>
    </div>
  );
}
