"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function Footer() {
  const [email,setEmail]=useState(""); const [message,setMessage]=useState("");
  async function submit(event:FormEvent){ event.preventDefault(); try{ await api("/subscriptions",{method:"POST",body:JSON.stringify({email,channel:"email"})}); setMessage("구독 완료"); setEmail(""); }catch(error){ setMessage(error instanceof Error?error.message:"구독 실패"); } }
  return <footer className="bg-[#171717] text-white px-5 py-10">
    <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
      <div><p className="text-lg font-extrabold text-[#FF385C]">DEVFOCUS</p><p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">배우고, 만들고, 성장하는 개발자 학습 플랫폼. 신규 강의와 학습 리포트를 받아보세요.</p></div>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="subscribe-email">이메일</label><input id="subscribe-email" required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 rounded-xl bg-white px-4 py-3 text-sm text-zinc-900"/><button className="rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-bold">이메일 구독</button></form>
    </div>{message&&<p className="mx-auto mt-3 max-w-6xl text-right text-xs text-zinc-400">{message}</p>}
  </footer>;
}
