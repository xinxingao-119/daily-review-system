"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  createdAt: string;
  updatedAt: string;
}

export default function ReviewListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchReviews();
    }
  }, [status, search]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("获取复盘列表错误:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条复盘吗？")) return;

    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (error) {
      console.error("删除复盘错误:", error);
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">复盘记录</h1>
        <Link
          href="/review/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          创建复盘
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索复盘内容..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无复盘记录，点击 &quot;创建复盘&quot; 开始记录
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {format(new Date(review.date), "yyyy 年 MM 月 dd 日", {
                      locale: zhCN,
                    })}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    字数：{review.wordCount} | 状态：
                    {review.status === "completed" ? "已完成" : "草稿"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/review/${review.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    查看
                  </Link>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:underline"
                  >
                    删除
                  </button>
                </div>
              </div>
              {review.workCompleted && (
                <p className="mt-2 text-gray-700 line-clamp-2">
                  {review.workCompleted}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
