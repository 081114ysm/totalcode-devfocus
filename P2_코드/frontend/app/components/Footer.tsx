"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function Footer() {
  const [email,setEmail]=useState(""); const [message,setMessage]=useState("");
  async function submit(event:FormEvent){ event.preventDefault(); try{ await api("/subscriptions",{method:"POST",body:JSON.stringify({email,channel:"email"})}); setMessage("구독 완료"); setEmail(""); }catch(error){ setMessage(error instanceof Error?error.message:"구독 실패"); } }
  return <footer className="border-t border-white/10 bg-[#111] px-5 py-14 text-white">
    <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
      <div><p className="flex items-center gap-2 text-lg font-black"><span className="h-3 w-3 rounded-full bg-[#00c471]"/>DevFocus</p><p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">배우고, 만들고, 성장하는 개발자 학습 플랫폼. 신규 강의와 학습 리포트를 받아보세요.</p></div>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="subscribe-email">이메일</label><input id="subscribe-email" required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-zinc-500"/><button className="rounded-full bg-[#00c471] px-6 py-3 text-sm font-bold hover:bg-[#00a65a]">이메일 구독</button></form>
    </div>{message&&<p className="mx-auto mt-3 max-w-6xl text-right text-xs text-zinc-400">{message}</p>}
  </footer>;
}
