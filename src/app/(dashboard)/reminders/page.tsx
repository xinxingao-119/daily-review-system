"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Reminder {
  id: string;
  content: string;
  remindAt: string;
  recurrence: string | null;
  status: string;
  createdAt: string;
}

export default function ReminderListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [recurrence, setRecurrence] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchReminders();
    }
  }, [status]);

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/reminders");
      const data = await response.json();
      setReminders(data.reminders || []);
    } catch (error) {
      console.error("获取提醒列表错误:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          remindAt: new Date(remindAt).toISOString(),
          recurrence: recurrence || null,
        }),
      });

      if (response.ok) {
        setContent("");
        setRemindAt("");
        setRecurrence("");
        setShowForm(false);
        fetchReminders();
      }
    } catch (error) {
      console.error("创建提醒错误:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = async (id: string, action: string) => {
    try {
      await fetch(`/api/reminders/${id}/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      fetchReminders();
    } catch (error) {
      console.error("处理提醒错误:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个提醒吗？")) return;

    try {
      await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      fetchReminders();
    } catch (error) {
      console.error("删除提醒错误:", error);
    }
  };

  const getStatusLabel = (reminderStatus: string) => {
    switch (reminderStatus) {
      case "pending":
        return "待提醒";
      case "triggered":
        return "已触发";
      case "completed":
        return "已完成";
      case "expired":
        return "已过期";
      default:
        return reminderStatus;
    }
  };

  const getStatusColor = (reminderStatus: string) => {
    switch (reminderStatus) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "triggered":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
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
        <h1 className="text-2xl font-bold">提醒</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "取消" : "添加提醒"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提醒内容
              </label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="输入提醒内容..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提醒时间
              </label>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                重复
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">不重复</option>
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存提醒"}
            </button>
          </div>
        </form>
      )}

      {reminders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无提醒</div>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-800">{reminder.content}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      {format(new Date(reminder.remindAt), "yyyy-MM-dd HH:mm", {
                        locale: zhCN,
                      })}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${getStatusColor(
                        reminder.status
                      )}`}
                    >
                      {getStatusLabel(reminder.status)}
                    </span>
                    {reminder.recurrence && (
                      <span className="text-purple-600">
                        重复：
                        {reminder.recurrence === "daily" && "每天"}
                        {reminder.recurrence === "weekly" && "每周"}
                        {reminder.recurrence === "monthly" && "每月"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {reminder.status === "pending" && (
                    <button
                      onClick={() => handleDismiss(reminder.id, "complete")}
                      className="text-green-600 hover:underline"
                    >
                      完成
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(reminder.id, "dismiss")}
                    className="text-gray-600 hover:underline"
                  >
                    忽略
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="text-red-600 hover:underline"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
