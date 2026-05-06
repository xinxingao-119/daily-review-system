"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  initialData?: {
    id?: string;
    workCompleted?: string;
    problems?: string;
    tomorrowPlan?: string;
    reflections?: string;
    status?: string;
  };
  isCreating?: boolean;
}

export default function ReviewForm({
  initialData = {},
  isCreating = false,
}: ReviewFormProps) {
  const router = useRouter();
  const [workCompleted, setWorkCompleted] = useState(
    initialData.workCompleted || ""
  );
  const [problems, setProblems] = useState(initialData.problems || "");
  const [tomorrowPlan, setTomorrowPlan] = useState(
    initialData.tomorrowPlan || ""
  );
  const [reflections, setReflections] = useState(
    initialData.reflections || ""
  );
  const [status, setStatus] = useState(initialData.status || "draft");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const saveDraft = useCallback(async () => {
    setSaving(true);
    try {
      const url = initialData.id
        ? `/api/reviews/${initialData.id}`
        : "/api/reviews";
      const method = initialData.id ? "PUT" : "POST";

      const body: Record<string, string> = {
        date: new Date().toISOString(),
        workCompleted,
        problems,
        tomorrowPlan,
        reflections,
        status: "draft",
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok && !initialData.id) {
        const data = await response.json();
        router.replace(`/review/${data.review.id}`);
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("保存草稿错误:", error);
    } finally {
      setSaving(false);
    }
  }, [
    workCompleted,
    problems,
    tomorrowPlan,
    reflections,
    initialData.id,
    router,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (
        workCompleted ||
        problems ||
        tomorrowPlan ||
        reflections
      ) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [saveDraft, workCompleted, problems, tomorrowPlan, reflections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = initialData.id
        ? `/api/reviews/${initialData.id}`
        : "/api/reviews";
      const method = initialData.id ? "PUT" : "POST";

      const body = {
        date: new Date().toISOString(),
        workCompleted,
        problems,
        tomorrowPlan,
        reflections,
        status: "completed",
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/review/${data.review?.id || initialData.id}`);
      }
    } catch (error) {
      console.error("提交复盘错误:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          今日完成的工作
        </label>
        <textarea
          value={workCompleted}
          onChange={(e) => setWorkCompleted(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
          placeholder="记录今天完成的工作..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          遇到的问题
        </label>
        <textarea
          value={problems}
          onChange={(e) => setProblems(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
          placeholder="记录遇到的问题..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          明日计划
        </label>
        <textarea
          value={tomorrowPlan}
          onChange={(e) => setTomorrowPlan(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
          placeholder="规划明天的工作..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          反思/感悟
        </label>
        <textarea
          value={reflections}
          onChange={(e) => setReflections(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
          placeholder="写下今天的反思和感悟..."
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {saving ? (
            "保存中..."
          ) : lastSaved ? (
            <>最后保存：{lastSaved.toLocaleTimeString()}</>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            保存草稿
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "提交中..." : "提交复盘"}
          </button>
        </div>
      </div>
    </form>
  );
}
