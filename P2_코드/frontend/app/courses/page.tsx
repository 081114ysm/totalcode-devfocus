"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  price: number;
  level: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    api("/courses/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "전체") params.set("category", selectedCategory);
    if (search) params.set("search", search);
    const query = params.toString();
    api(`/courses${query ? `?${query}` : ""}`).then((d) => setCourses(d.courses ?? [])).catch(() => {});
  }, [selectedCategory, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-[#eaecf0] bg-[#fafafa] px-5 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <p className="mb-3 text-sm font-bold text-[#00a65a]">Courses</p>
          <h1
            className="text-4xl font-black tracking-[-0.04em] text-[#111] sm:text-6xl"
          >
            배우고 싶은 기술을<br />찾아보세요.
          </h1>
          <p className="mt-5 text-[#667085]">입문부터 실전까지, 현재 목표에 맞는 개발 강의를 탐색할 수 있습니다.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-10 sm:py-14">
        {/* Filter bar */}
        <div className="mb-10 flex flex-col items-stretch gap-4 rounded-[24px] border border-[#eaecf0] bg-white p-4 md:flex-row md:items-center">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#111] text-white"
                    : "bg-[#f7f8f9] text-[#667085] hover:bg-[#eefbf4] hover:text-[#008f52]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 md:ml-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="강의 검색..."
              className="min-w-0 flex-1 rounded-full border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C471]"
            />
            <button
              type="submit"
              className="rounded-full bg-[#00c471] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#00a65a]"
            >
              검색
            </button>
          </form>
        </div>

        {/* Course grid */}
        {courses.length === 0 ? (
          <p className="text-[#717171] text-center py-16">검색 결과가 없습니다</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <div className="group cursor-pointer overflow-hidden bg-white">
                  <div className="relative flex aspect-[16/10] w-full items-end overflow-hidden rounded-[22px] bg-[#e8faf0] px-6 py-6 transition-transform duration-300 group-hover:-translate-y-1">
                    <span className="text-left text-xl font-black leading-snug tracking-[-0.03em] text-[#111]">
                      {course.title}
                    </span>
                    {course.category && (
                      <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#008f52] backdrop-blur">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <div className="px-1 pt-5">
                    <h2 className="mb-2 text-lg font-bold tracking-[-0.02em] text-[#111]">{course.title}</h2>
                    <p className="line-clamp-2 text-sm leading-6 text-[#667085]">{course.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500">{course.level}</span>
                      <strong>{course.price ? `${course.price.toLocaleString()}원` : "무료"}</strong>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
