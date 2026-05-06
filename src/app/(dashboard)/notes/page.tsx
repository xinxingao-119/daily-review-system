"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Note {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
  goal?: { id: string; name: string } | null;
}

export default function NoteListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes();
      fetchTags();
    }
  }, [status, search, selectedTag]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedTag) params.set("tag", selectedTag);

      const response = await fetch(`/api/notes?${params}`);
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("获取笔记列表错误:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/notes/tags");
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error("获取标签列表错误:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条笔记吗？")) return;

    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      setNotes(notes.filter((n) => n.id !== id));
    } catch (error) {
      console.error("删除笔记错误:", error);
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
      <h1 className="text-2xl font-bold mb-6">碎片笔记</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="搜索笔记内容..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded"
        />
        <Link
          href="/notes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
        >
          添加笔记
        </Link>
      </div>

      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded text-sm ${
              !selectedTag
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            全部
          </button>
          {tags.slice(0, 10).map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded text-sm ${
                selectedTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {tag} ({count})
            </button>
          ))}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无笔记，点击 &quot;添加笔记&quot; 开始记录
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-800 whitespace-pre-wrap line-clamp-3">
                    {note.content}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      {format(new Date(note.createdAt), "yyyy-MM-dd HH:mm", {
                        locale: zhCN,
                      })}
                    </span>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1">
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
                      <span className="text-purple-600">关联目标：{note.goal.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/notes/${note.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(note.id)}
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
