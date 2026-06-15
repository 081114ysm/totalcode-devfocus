"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Order { orderId:string; amount:number; orderName:string; customerKey:string; demoMode?:boolean; }

export default function CheckoutPage(){
  const router=useRouter(); const [courseId,setCourseId]=useState(0);
  const [order,setOrder]=useState<Order|null>(null); const [message,setMessage]=useState("결제 정보를 준비하고 있습니다."); const [loading,setLoading]=useState(false);
  useEffect(()=>{setCourseId(Number(new URLSearchParams(window.location.search).get("courseId")));},[]);
  useEffect(()=>{ if(!localStorage.getItem("token")){router.push("/login");return;} if(!courseId)return; api<Order>("/payments/initiate",{method:"POST",body:JSON.stringify({courseId})}).then(setOrder).catch((error)=>setMessage(error instanceof Error?error.message:"주문 생성 실패")); },[courseId,router]);
  async function payDemo(){
    if(!order)return;
    setLoading(true);
    setMessage("데모 결제를 진행하고 있습니다.");
    const paymentKey = `demo_${globalThis.crypto?.randomUUID?.() || Date.now().toString(36)}`;
    router.push("/payments/success?paymentKey=" + encodeURIComponent(paymentKey) + "&orderId=" + encodeURIComponent(order.orderId) + "&amount=" + encodeURIComponent(String(order.amount)));
  }
  return <div className="min-h-screen bg-zinc-50 px-4 py-10"><div className="mx-auto max-w-2xl rounded-3xl bg-white p-5 shadow-sm sm:p-8"><p className="text-xs font-extrabold tracking-[3px] text-[#00C471]">CHECKOUT</p><h1 className="mt-3 text-2xl font-extrabold">데모 결제</h1><p className="mt-2 text-sm text-zinc-500">사업자등록 없이 시연할 수 있도록 모의 결제 흐름으로 동작합니다.</p>{order&&<div className="mt-6 rounded-2xl bg-zinc-50 p-5"><div className="flex justify-between gap-4"><span className="font-medium">{order.orderName}</span><strong>{order.amount.toLocaleString()}원</strong></div><div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">실제 카드 결제가 아니라 수강 등록 시연용 데모 결제입니다.</div></div>}<button onClick={payDemo} disabled={!order||loading} className="mt-5 w-full rounded-xl bg-[#00C471] py-4 font-bold text-white disabled:opacity-40">{loading?"처리 중":order?`${order.amount.toLocaleString()}원 데모 결제하기`:"준비 중"}</button>{message&&<p className="mt-4 text-center text-sm text-zinc-500">{message}</p>}</div></div>;
}
