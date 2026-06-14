"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Course {
  id: number;
  title: string;
  description: string;
  category?: string;
  level?: string;
  price?: number;
}

const TOPICS = ["프론트엔드", "백엔드", "데이터베이스", "DevOps", "AI", "커리어"];
const BENEFITS = [
  ["01", "끝까지 배우는 수강 경험", "이어보기, 자동 진도 저장, 집중 타이머로 학습 흐름을 놓치지 않습니다."],
  ["02", "실무자에게 바로 질문", "강의별 Q&A와 수강평으로 막히는 지점을 빠르게 해결합니다."],
  ["03", "성장을 숫자로 확인", "대시보드에서 완강률, 학습 시간, 최근 활동을 한눈에 확인합니다."],
];

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api("/courses").then((data) => setCourses(data.courses ?? [])).catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden bg-white text-[#111]">
      <section className="relative px-5 pb-20 pt-16 sm:pt-24 lg:pb-28 lg:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#dff8e9_0%,rgba(255,255,255,0)_68%)]" />
        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <span className="inline-flex rounded-full border border-[#b8ecd0] bg-[#effbf5] px-4 py-2 text-xs font-bold text-[#008f52]">배우는 개발자의 다음 단계</span>
          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-black leading-[1.08] tracking-[-0.055em] sm:text-7xl lg:text-[84px]">배우고, 만들고,<br />더 멀리 성장하세요.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#667085] sm:text-xl sm:leading-8">개발 강의부터 진도 관리, 질문, 집중 기록까지.<br className="hidden sm:block" /> 학습에 필요한 경험을 하나의 깔끔한 흐름으로 연결했습니다.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/courses" className="rounded-full bg-[#111] px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#272727]">강의 둘러보기</Link>
            <Link href="/register" className="rounded-full border border-[#d0d5dd] bg-white px-7 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 hover:border-[#00c471] hover:text-[#008f52]">무료로 시작하기</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[#eaecf0] bg-[#fafafa] px-5 py-5">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto [scrollbar-width:none]">
          {TOPICS.map((topic) => <Link key={topic} href={`/courses?category=${encodeURIComponent(topic)}`} className="shrink-0 rounded-full border border-[#eaecf0] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] hover:border-[#00c471] hover:text-[#008f52]">{topic}</Link>)}
        </div>
      </section>

      <section className="px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-6">
            <div><p className="text-sm font-bold text-[#00a65a]">지금 많이 배우는 강의</p><h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-5xl">오늘의 성장을 시작하세요.</h2></div>
            <Link href="/courses" className="hidden text-sm font-bold text-[#475467] hover:text-[#00a65a] sm:block">전체 강의 보기 →</Link>
          </div>
          {courses.length === 0 ? <div className="mt-10 rounded-[28px] bg-[#f7f8f9] py-20 text-center text-sm text-[#667085]">강의를 불러오는 중입니다.</div> : (
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course, index) => (
                <Link key={course.id} href={`/course/${course.id}`} className="group">
                  <div className={`relative flex aspect-[16/10] items-end overflow-hidden rounded-[24px] p-6 ${index % 3 === 0 ? "bg-[#e6f9ef]" : index % 3 === 1 ? "bg-[#eef2ff]" : "bg-[#fff4e8]"}`}>
                    <span className="absolute right-5 top-5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#475467] backdrop-blur">{course.category || "개발"}</span>
                    <span className="max-w-[85%] text-2xl font-black leading-tight tracking-[-0.03em] transition-transform group-hover:-translate-y-1">{course.title}</span>
                  </div>
                  <div className="px-1 pt-5"><h3 className="text-lg font-bold tracking-[-0.02em]">{course.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#667085]">{course.description}</p><div className="mt-4 flex items-center justify-between text-sm"><span className="font-medium text-[#667085]">{course.level || "입문"}</span><strong>{course.price ? `${course.price.toLocaleString()}원` : "무료"}</strong></div></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#111] px-5 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-6xl"><p className="text-sm font-bold text-[#49e197]">DevFocus Learning System</p><h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">좋은 학습은 강의를 재생하는 것보다 더 많은 경험입니다.</h2>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[28px] bg-[#333] md:grid-cols-3">{BENEFITS.map(([number, title, description]) => <article key={number} className="bg-[#191919] p-8 sm:p-10"><span className="text-sm font-bold text-[#49e197]">{number}</span><h3 className="mt-10 text-xl font-bold">{title}</h3><p className="mt-4 text-sm leading-6 text-[#a9b0bb]">{description}</p></article>)}</div>
        </div>
      </section>

      <section className="px-5 py-20 text-center sm:py-28"><div className="mx-auto max-w-4xl rounded-[36px] bg-[#e8faf0] px-6 py-16 sm:px-16 sm:py-20"><h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">오늘 배운 것이 내일의 실력이 됩니다.</h2><p className="mt-5 text-[#52665c]">나에게 맞는 강의를 찾고 첫 번째 학습 기록을 남겨보세요.</p><Link href="/courses" className="mt-8 inline-flex rounded-full bg-[#00c471] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#00a65a]">학습 시작하기</Link></div></section>
    </div>
  );
}
