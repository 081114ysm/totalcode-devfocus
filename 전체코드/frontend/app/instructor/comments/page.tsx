"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface CourseComment {
  id: number;
  content: string;
  created_at: string;
  course: { id: number; title: string };
  lesson: { id: number; title: string; order: number } | null;
  user: { id: number; nickname: string };
  reply: { content: string; reply_at: string } | null;
}

export default function InstructorCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<CourseComment[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "instructor" && role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadComments();
  }, [router]);

  const loadComments = () => {
    api<{ comments: CourseComment[] }>("/instructor/comments")
      .then((data) => setComments(data.comments ?? []))
      .catch((err: unknown) => setMessage(err instanceof Error ? err.message : "댓글을 불러오지 못했습니다"));
  };

  const replyCount = useMemo(() => comments.filter((comment) => comment.reply).length, [comments]);

  const submitReply = async (commentId: number) => {
    const content = replyDrafts[commentId]?.trim();
    if (!content) return;
    try {
      await api(`/instructor/comments/${commentId}/reply`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setMessage("답변을 저장했습니다.");
      setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
      loadComments();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "답변 저장 실패");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#222222] py-16 px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-extrabold uppercase tracking-[3px] text-[#00C471]">Instructor Comments</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white">강의별 댓글 관리</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300">
            어떤 강의의 몇 번째 레슨에 달린 댓글인지 한눈에 보고, 바로 답변할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link href="/instructor" className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            강사 대시보드
          </Link>
          <span className="rounded-full bg-[#E9FBF2] px-4 py-2 text-sm font-semibold text-[#00C471]">
            총 댓글 {comments.length}개
          </span>
          <span className="rounded-full bg-[#F7F7F7] px-4 py-2 text-sm font-semibold text-[#222222]">
            답변 완료 {replyCount}개
          </span>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-[#00C471]/20 bg-[#E9FBF2] px-4 py-3 text-sm text-[#00C471]">
            {message}
          </div>
        )}

        <div className="grid gap-4">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-[#ebebeb] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-[#E9FBF2] px-3 py-1 text-[#00C471]">{comment.course.title}</span>
                    <span className="rounded-full bg-[#F7F7F7] px-3 py-1 text-[#222222]">
                      {comment.lesson ? `${comment.lesson.order}번째 강의 · ${comment.lesson.title}` : "전체 강의"}
                    </span>
                    <span className="rounded-full bg-[#F7F7F7] px-3 py-1 text-[#717171]">{comment.user.nickname}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#222222]">{comment.content}</p>
                  <p className="text-xs text-[#717171]">{new Date(comment.created_at).toLocaleString("ko-KR")}</p>
                </div>
              </div>

              {comment.reply ? (
                <div className="mt-4 rounded-xl border border-[#00C471]/15 bg-[#F3FFF8] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#00C471]">답변 완료</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#222222]">{comment.reply.content}</p>
                  <p className="mt-2 text-xs text-[#717171]">{new Date(comment.reply.reply_at).toLocaleString("ko-KR")}</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 rounded-xl bg-[#F7F7F7] p-4">
                  <label className="block text-sm font-semibold text-[#222222]">답변 작성</label>
                  <textarea
                    value={replyDrafts[comment.id] || ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                    className="min-h-28 w-full rounded-xl border border-[#ebebeb] bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C471]"
                    placeholder="학생에게 답변을 남기세요"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => submitReply(comment.id)}
                      className="rounded-full bg-[#00C471] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00A65A]"
                    >
                      답변 저장
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}

          {comments.length === 0 && (
            <p className="rounded-2xl bg-[#F7F7F7] p-8 text-center text-sm text-[#717171]">아직 댓글이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
