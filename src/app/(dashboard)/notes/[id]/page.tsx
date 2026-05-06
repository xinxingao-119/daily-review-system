"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Note {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  goal?: { id: string; name: string } | null;
}

export default function NoteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNote();
    }
  }, [status, params.id]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setNote(data.note);
        setContent(data.note.content);
        setTagsInput(data.note.tags.join(", "));
      }
    } catch (error) {
      console.error("获取笔记详情错误:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);

      const response = await fetch(`/api/notes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tags }),
      });

      if (response.ok) {
        const data = await response.json();
        setNote(data.note);
        setEditing(false);
      }
    } catch (error) {
      console.error("保存笔记错误:", error);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">笔记不存在</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">笔记详情</h1>
        <div className="flex gap-2">
          <Link
            href="/notes"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            返回列表
          </Link>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editing ? "取消" : "编辑"}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-48"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="工作, 学习, 灵感"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>

          <div className="pt-4 border-t text-sm text-gray-500">
            <div>创建时间：{format(new Date(note.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}</div>
            <div>更新时间：{format(new Date(note.updatedAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}</div>
            {note.tags.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {note.goal && (
              <div className="mt-2 text-purple-600">关联目标：{note.goal.name}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
