"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  nickname: string;
}

interface FocusSession {
  id: number;
  start_time: string;
  end_time: string;
  duration: number;
}

interface Enrollment { id:number; title:string; category:string; total_lessons:number; completed_lessons:number; completion_rate:number; next_lesson_id:number|null }

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [focusHistory, setFocusHistory] = useState<FocusSession[]>([]);
  const [totalFocus, setTotalFocus] = useState(0);
  const [enrollments,setEnrollments]=useState<Enrollment[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api("/users/me")
      .then(setUser)
      .catch(() => router.push("/login"));

    api("/focus/history")
      .then((data) => {
        const sessions = data.sessions ?? [];
        setFocusHistory(sessions.slice(0, 5));
        setTotalFocus(data.summary?.totalSeconds ?? 0);
      })
      .catch(() => {});
    api<Enrollment[]>("/courses/my").then(setEnrollments).catch(()=>{});
  }, [router]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!user) return <p className="p-8 text-[#717171]">로딩 중...</p>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            Dashboard
          </p>
          <h1
            className="text-4xl font-extrabold text-[#222222]"
            style={{ letterSpacing: "-1px" }}
          >
            대시보드
          </h1>
          <p className="text-[#717171] mt-2">
            안녕하세요,{" "}
            <span className="font-semibold text-[#FF385C]">{user.nickname}</span>님
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-12"><div className="mb-6 flex items-end justify-between"><div><p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-2">My Learning</p><h2 className="text-2xl font-extrabold">내 강의</h2></div><Link href="/courses" className="text-sm font-semibold text-[#FF385C]">강의 더 찾기</Link></div><div className="grid gap-4 md:grid-cols-2">{enrollments.map((course)=><article key={course.id} className="rounded-2xl border border-zinc-100 p-5"><div className="flex justify-between gap-3"><div><span className="text-xs font-bold text-[#FF385C]">{course.category}</span><h3 className="mt-1 font-extrabold">{course.title}</h3></div><strong className="text-lg">{course.completion_rate}%</strong></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100"><div className="h-full bg-[#FF385C]" style={{width:`${course.completion_rate}%`}}/></div><p className="mt-2 text-xs text-zinc-500">{course.completed_lessons}/{course.total_lessons}개 완료</p><Link href={course.next_lesson_id?`/learn/${course.next_lesson_id}`:`/course/${course.id}`} className="mt-4 inline-block rounded-full bg-zinc-900 px-5 py-2 text-sm font-bold text-white">{course.completion_rate===100?"다시 보기":"이어보기"}</Link></article>)}{enrollments.length===0&&<p className="col-span-2 rounded-2xl bg-zinc-50 p-8 text-center text-sm text-zinc-500">수강 중인 강의가 없습니다.</p>}</div></div>
        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#F7F7F7] rounded-2xl p-8">
            <p className="text-xs font-extrabold text-[#717171] uppercase tracking-widest mb-3">
              총 집중 시간
            </p>
            <p className="text-4xl font-extrabold text-[#FF385C]">
              {formatTime(Math.round(totalFocus))}
            </p>
          </div>
          <div className="bg-[#F7F7F7] rounded-2xl p-8">
            <p className="text-xs font-extrabold text-[#717171] uppercase tracking-widest mb-3">
              집중 세션 수
            </p>
            <p className="text-4xl font-extrabold text-[#222222]">
              {focusHistory.length}회
            </p>
          </div>
        </div>

        {/* Recent sessions */}
        <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
          History
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] mb-6"
          style={{ letterSpacing: "-0.5px" }}
        >
          최근 집중 기록
        </h2>
        <div className="space-y-2">
          {focusHistory.map((session) => (
            <div
              key={session.id}
              className="bg-[#F7F7F7] rounded-xl px-6 py-4 flex justify-between items-center"
            >
              <span className="text-[#717171] text-sm">
                {new Date(session.start_time).toLocaleString("ko-KR")}
              </span>
              <span className="font-mono font-semibold text-[#222222]">
                {session.duration ? formatTime(Math.round(session.duration)) : "-"}
              </span>
            </div>
          ))}
          {focusHistory.length === 0 && (
            <p className="text-[#717171] text-center py-8 text-sm">아직 기록이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
