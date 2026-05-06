"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface StatsData {
  overview: {
    reviewCount: number;
    completedReviewCount: number;
    noteCount: number;
    reminderCount: number;
    goalCount: number;
    completionRate: number;
  };
  reviewTrend: { date: string; wordCount: number }[];
  noteTrend: { date: string; count: number }[];
  goalDistribution: { low: number; medium: number; high: number };
  topTags: { tag: string; count: number }[];
  heatmapData: { date: string; wordCount: number }[];
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("获取统计数据错误:", error);
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

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">无法加载统计数据</div>
      </div>
    );
  }

  const reviewChartData = {
    labels: stats.reviewTrend.slice(-30).map((r) => r.date),
    datasets: [
      {
        label: "复盘字数",
        data: stats.reviewTrend.slice(-30).map((r) => r.wordCount),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const noteChartData = {
    labels: stats.noteTrend.slice(-30).map((n) => n.date),
    datasets: [
      {
        label: "笔记数量",
        data: stats.noteTrend.slice(-30).map((n) => n.count),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
      },
    ],
  };

  const goalChartData = {
    labels: ["低优先级", "中优先级", "高优先级"],
    datasets: [
      {
        data: [
          stats.goalDistribution.low,
          stats.goalDistribution.medium,
          stats.goalDistribution.high,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.5)",
          "rgba(234, 179, 8, 0.5)",
          "rgba(239, 68, 68, 0.5)",
        ],
      },
    ],
  };

  const tagChartData = {
    labels: stats.topTags.map((t) => t.tag),
    datasets: [
      {
        label: "使用次数",
        data: stats.topTags.map((t) => t.count),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">统计概览</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">复盘总数</div>
          <div className="text-2xl font-bold">{stats.overview.reviewCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">完成率</div>
          <div className="text-2xl font-bold">
            {(stats.overview.completionRate * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">笔记总数</div>
          <div className="text-2xl font-bold">{stats.overview.noteCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">提醒总数</div>
          <div className="text-2xl font-bold">{stats.overview.reminderCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">目标总数</div>
          <div className="text-2xl font-bold">{stats.overview.goalCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">复盘字数趋势</h3>
          <Line data={reviewChartData} />
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">笔记数量趋势</h3>
          <Line data={noteChartData} />
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">目标优先级分布</h3>
          <div className="max-w-xs mx-auto">
            <Doughnut data={goalChartData} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">标签使用频率 Top 10</h3>
          <Bar data={tagChartData} />
        </div>
      </div>
    </div>
  );
}
