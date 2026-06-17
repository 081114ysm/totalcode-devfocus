"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api, logout } from "@/lib/api";

export default function Navbar() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api("/users/me")
        .then((user) => {
          setNickname(user.nickname);
          setRole(localStorage.getItem("role"));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setNickname(null);
          setRole(null);
        });
    }
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const linkClass = (href: string) =>
    `hover:text-[#00C471] transition-colors ${isActive(href) ? "text-[#00C471] font-semibold" : ""}`;

  return (
    <nav className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-[-0.04em] text-[#111]">
          <span className="h-3 w-3 rounded-full bg-[#00c471]" /> DevFocus
        </Link>
        <button onClick={()=>setOpen(!open)} className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold md:hidden" aria-expanded={open}>메뉴</button>
        <div className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-16 flex-col gap-4 border-b bg-white p-5 text-sm font-semibold text-[#344054] md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0`}>
          <Link href="/courses" className={linkClass("/courses")}>강의</Link>
          <Link href="/focus" className={linkClass("/focus")}>집중 타이머</Link>
          <Link href="/qna" className={linkClass("/qna")}>Q&A</Link>
          <Link href="/snippets" className={linkClass("/snippets")}>코드 스니펫</Link>

          {nickname ? (
            <>
              {role === "admin" && (
                <Link href="/admin" className={linkClass("/admin")}>관리자</Link>
              )}
              {(role === "instructor" || role === "admin") && (
                <Link href="/instructor" className={linkClass("/instructor")}>강사</Link>
              )}
              {(role === "instructor" || role === "admin") && (
                <Link href="/instructor/comments" className={linkClass("/instructor/comments")}>댓글 관리</Link>
              )}
              <Link href="/dashboard" className={linkClass("/dashboard")}>대시보드</Link>
              <Link href="/mypage" className={linkClass("/mypage")}>마이페이지</Link>
              <span className="text-[#00C471] font-semibold">{nickname}님</span>
              <button
                onClick={logout}
                className="rounded-full bg-[#f2f4f7] px-4 py-2 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#eaecf0]"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-1 py-2 text-sm font-semibold hover:text-[#00a65a]">
                로그인
              </Link>
              <Link href="/register" className="rounded-full bg-[#111] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333]">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
