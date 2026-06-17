"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  enrollmentCount: number;
  lessonCount: number;
}

interface Lesson {
  id: number;
  title: string;
  video_url: string;
  order: number;
  duration: number;
}

interface CourseComment {
  id: number;
  content: string;
  created_at: string;
  lesson: { id: number; title: string; order: number } | null;
  reply: { content: string; reply_at: string } | null;
  course: { id: number; title: string };
  user: { id: number; nickname: string };
}

interface Analytics {
  summary: { courseCount:number; enrollmentCount:number; grossRevenue:number; activeLearners:number };
  courses: Array<{ id:number; title:string; enrollments:number; revenue:number; averageProgress:number|null }>;
}

const CATEGORIES = ["프론트엔드", "백엔드", "모바일", "DevOps", "데이터", "기타"];

export default function InstructorPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "프론트엔드", thumbnail: "", price: "0", level: "입문" });
  const [lessonForm, setLessonForm] = useState({ title: "", video_url: "", order: "1", duration: "600" });
  const [message, setMessage] = useState("");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [comments, setComments] = useState<CourseComment[]>([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "instructor" && role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadCourses();
    api<Analytics>("/instructor/analytics").then(setAnalytics).catch(() => {});
    api<{ comments: CourseComment[] }>("/instructor/comments").then((d) => setComments(d.comments ?? [])).catch(() => {});
  }, [router]);

  const loadCourses = () =>
    api("/instructor/courses").then((d) => setCourses(d.courses ?? [])).catch((err: unknown) => {
      setMessage(err instanceof Error ? err.message : "강의 목록을 불러오지 못했습니다");
    });

  const loadLessons = (courseId: number) =>
    api(`/courses/${courseId}`).then((d) => setLessons(d.lessons || [])).catch(() => {});

  const selectCourse = (c: Course) => {
    setSelected(c);
    loadLessons(c.id);
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/instructor/courses", {
        method: "POST",
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      setMessage("강의 생성 완료");
      setShowForm(false);
      setForm({ title: "", description: "", category: "프론트엔드", thumbnail: "", price: "0", level: "입문" });
      loadCourses();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "생성 실패");
    }
  };

  const deleteCourse = async (courseId: number) => {
    if (!confirm("강의를 삭제하시겠습니까?")) return;
    try {
      await api(`/instructor/courses/${courseId}`, { method: "DELETE" });
      setMessage("강의 삭제 완료");
      setSelected(null);
      loadCourses();
      api<{ comments: CourseComment[] }>("/instructor/comments").then((d) => setComments(d.comments ?? [])).catch(() => {});
    } catch {
      setMessage("삭제 실패");
    }
  };

  const addLesson = async (e: React.FormEvent) => {
    if (!selected) return;
    e.preventDefault();
    try {
      await api(`/instructor/courses/${selected.id}/lessons`, {
        method: "POST",
        body: JSON.stringify({
          ...lessonForm,
          order: parseInt(lessonForm.order),
          duration: parseInt(lessonForm.duration),
        }),
      });
      setMessage("레슨 추가 완료");
      setLessonForm({ title: "", video_url: "", order: "1", duration: "600" });
      loadLessons(selected.id);
      api<{ comments: CourseComment[] }>("/instructor/comments").then((d) => setComments(d.comments ?? [])).catch(() => {});
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "추가 실패");
    }
  };

  const deleteLesson = async (lessonId: number) => {
    if (!selected || !confirm("레슨을 삭제하시겠습니까?")) return;
    try {
      await api(`/instructor/courses/${selected.id}/lessons/${lessonId}`, { method: "DELETE" });
      loadLessons(selected.id);
    } catch {
      setMessage("삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#222222] py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#00C471] text-xs font-extrabold tracking-[3px] uppercase mb-3">Instructor</p>
          <h1 className="text-4xl font-extrabold text-white" style={{ letterSpacing: "-1px" }}>강사 대시보드</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {message && (
          <div className="mb-4 p-3 bg-[#E9FBF2] text-[#00C471] text-sm rounded-xl border border-[#00C471]/20">
            {message}
          </div>
        )}

        {analytics && (
          <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["운영 강의", `${analytics.summary.courseCount}개`],
              ["전체 수강", `${analytics.summary.enrollmentCount}명`],
              ["누적 매출", `${Number(analytics.summary.grossRevenue).toLocaleString()}원`],
              ["학습 활동", `${analytics.summary.activeLearners}명`],
            ].map(([label,value]) => <div key={label} className="rounded-2xl bg-[#F7F7F7] p-5"><p className="text-xs font-bold text-[#717171]">{label}</p><strong className="mt-2 block text-2xl">{value}</strong></div>)}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-[#222222]">내 강의 목록</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2 bg-[#00C471] text-white rounded-full text-sm font-semibold hover:bg-[#00A65A]"
          >
            + 새 강의
          </button>
        </div>

        {showForm && (
          <form onSubmit={createCourse} className="bg-[#F7F7F7] rounded-2xl p-6 mb-6 space-y-3">
            <h3 className="font-bold text-[#222222] mb-2">새 강의 만들기</h3>
            <input
              placeholder="강의 제목"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
              required
            />
            <textarea
              placeholder="강의 설명"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white h-20"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min="0" step="1000" placeholder="가격" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white" />
              <select value={form.level} onChange={(e)=>setForm({...form,level:e.target.value})} className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"><option>입문</option><option>초급</option><option>중급</option><option>고급</option></select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2 bg-[#00C471] text-white rounded-full text-sm font-semibold hover:bg-[#00A65A]">
                생성
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-[#ebebeb] text-[#717171] rounded-full text-sm font-semibold">
                취소
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {courses.map((c) => (
            <div
              key={c.id}
              onClick={() => selectCourse(c)}
              className={`rounded-2xl p-6 cursor-pointer transition-all border-2 ${
                selected?.id === c.id ? "border-[#00C471] bg-[#E9FBF2]" : "border-transparent bg-[#F7F7F7] hover:border-[#ebebeb]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-[#222222]">{c.title}</p>
                  <p className="text-sm text-[#717171] mt-1">{c.category} · 레슨 {c.lessonCount}개 · 수강 {c.enrollmentCount}명</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCourse(c.id); }}
                  className="text-[#00C471] text-xs hover:underline ml-2"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-[#717171] text-sm col-span-2 text-center py-8">아직 강의가 없습니다</p>
          )}
        </div>

        {selected && (
          <div>
            <h3 className="text-xl font-extrabold text-[#222222] mb-4">
              {selected.title} — 레슨 관리
            </h3>
            <div className="space-y-2 mb-6">
              {lessons.map((l) => (
                <div key={l.id} className="bg-[#F7F7F7] rounded-xl px-5 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-[#222222]">{l.order}. {l.title}</span>
                  <button onClick={() => deleteLesson(l.id)} className="text-[#00C471] text-xs hover:underline">삭제</button>
                </div>
              ))}
              {lessons.length === 0 && <p className="text-sm text-[#717171] text-center py-4">레슨 없음</p>}
            </div>

            <form onSubmit={addLesson} className="bg-[#F7F7F7] rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-[#222222]">레슨 추가</h4>
              <input
                placeholder="레슨 제목"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
                required
              />
              <input
                placeholder="영상 URL (YouTube 등)"
                value={lessonForm.video_url}
                onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
              />
              <div className="flex gap-3">
                <input
                  placeholder="순서"
                  type="number"
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })}
                  className="w-24 px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
                />
                <input
                  placeholder="길이(초)"
                  type="number"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  className="w-28 px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
                />
                <button type="submit" className="px-5 py-2 bg-[#00C471] text-white rounded-full text-sm font-semibold hover:bg-[#00A65A]">
                  추가
                </button>
              </div>
            </form>

            <div className="mt-6 bg-[#F7F7F7] rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h4 className="font-bold text-[#222222]">최근 댓글</h4>
                <Link href="/instructor/comments" className="text-sm font-semibold text-[#00C471] hover:underline">
                  전체 댓글 보기
                </Link>
              </div>
              <div className="space-y-3">
                {comments
                  .filter((comment) => comment.course.id === selected.id)
                  .slice(0, 5)
                  .map((comment) => (
                    <article key={comment.id} className="rounded-xl bg-white p-4 border border-[#ebebeb]">
                      <div className="flex items-center justify-between gap-3 text-xs text-[#717171]">
                        <span className="font-semibold text-[#222222]">{comment.user.nickname}</span>
                        <span>{new Date(comment.created_at).toLocaleString("ko-KR")}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[#00C471]">{comment.course.title}</p>
                      <p className="mt-1 text-xs text-[#717171]">
                        {comment.lesson ? `${comment.lesson.order}번째 강의 · ${comment.lesson.title}` : "전체 강의"}
                      </p>
                      <p className="mt-1 text-sm text-[#222222]">{comment.content}</p>
                      {comment.reply && <p className="mt-2 rounded-lg bg-[#F3FFF8] p-3 text-sm text-[#222222]"><span className="font-semibold text-[#00C471]">답변:</span> {comment.reply.content}</p>}
                    </article>
                  ))}
                {comments.filter((comment) => comment.course.id === selected.id).length === 0 && (
                  <p className="text-sm text-[#717171]">이 강의에는 아직 댓글이 없습니다</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
