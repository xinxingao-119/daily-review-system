"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReviewForm from "@/components/review/review-form";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Review {
  id: string;
  date: string;
  workCompleted: string;
  problems: string;
  tomorrowPlan: string;
  reflections: string;
  status: string;
  wordCount: number;
}

export default function ReviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchReview();
    }
  }, [status, params.id]);

  const fetchReview = async () => {
    try {
      const response = await fetch(`/api/reviews/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setReview(data.review);
      }
    } catch (error) {
      console.error("获取复盘详情错误:", error);
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

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">复盘不存在</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {format(new Date(review.date), "yyyy 年 MM 月 dd 日", {
            locale: zhCN,
          })}
        </h1>
        <div className="flex gap-2">
          <Link
            href="/review"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            返回列表
          </Link>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editing ? "取消编辑" : "编辑"}
          </button>
        </div>
      </div>

      {editing ? (
        <ReviewForm initialData={review} />
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">今日完成的工作</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {review.workCompleted || "未记录"}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">遇到的问题</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {review.problems || "未记录"}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">明日计划</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {review.tomorrowPlan || "未记录"}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">反思/感悟</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {review.reflections || "未记录"}
            </p>
          </div>

          <div className="pt-4 border-t text-sm text-gray-500">
            状态：{review.status === "completed" ? "已完成" : "草稿"} | 字数：{review.wordCount}
          </div>
        </div>
      )}
    </div>
  );
}
