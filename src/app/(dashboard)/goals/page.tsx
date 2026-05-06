"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Goal {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  priority: string;
  progress: number;
  createdAt: string;
}

export default function GoalListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchGoals();
    }
  }, [status]);

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      const data = await response.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error("获取目标列表错误:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          deadline: deadline || null,
          priority,
        }),
      });

      if (response.ok) {
        setName("");
        setDescription("");
        setDeadline("");
        setPriority("medium");
        setShowForm(false);
        fetchGoals();
      }
    } catch (error) {
      console.error("创建目标错误:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个目标吗？")) return;

    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
      fetchGoals();
    } catch (error) {
      console.error("删除目标错误:", error);
    }
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case "low":
        return "低";
      case "medium":
        return "中";
      case "high":
        return "高";
      default:
        return p;
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <h1 className="text-2xl font-bold">长期目标</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "取消" : "添加目标"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="输入目标名称..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                placeholder="描述你的目标..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  截止日期
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  优先级
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存目标"}
            </button>
          </div>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无目标</div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    href={`/goals/${goal.id}`}
                    className="text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {goal.name}
                  </Link>
                  <p className="mt-1 text-gray-600">{goal.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(
                        goal.priority
                      )}`}
                    >
                      {getPriorityLabel(goal.priority)}优先级
                    </span>
                    {goal.deadline && (
                      <span>
                        截止：
                        {format(new Date(goal.deadline), "yyyy-MM-dd", {
                          locale: zhCN,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      进度：{goal.progress}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-red-600 hover:underline ml-4"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
