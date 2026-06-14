"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function PaymentSuccessPage(){
  const [state,setState]=useState<"loading"|"success"|"error">("loading"); const [message,setMessage]=useState("결제를 승인하고 있습니다."); const [receipt,setReceipt]=useState<string|null>(null);
  useEffect(()=>{const params=new URLSearchParams(window.location.search); const paymentKey=params.get("paymentKey"),orderId=params.get("orderId"),amount=Number(params.get("amount")); if(!paymentKey||!orderId||!amount){setState("error");setMessage("결제 정보가 올바르지 않습니다.");return;} api<{message:string;receiptUrl:string|null}>("/payments/confirm",{method:"POST",body:JSON.stringify({paymentKey,orderId,amount})}).then((result)=>{setState("success");setMessage(result.message);setReceipt(result.receiptUrl);}).catch((error)=>{setState("error");setMessage(error instanceof Error?error.message:"결제 승인 실패");});},[]);
  return <div className="grid min-h-[70vh] place-items-center px-5"><div className="w-full max-w-md rounded-3xl bg-zinc-50 p-8 text-center"><div className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-2xl ${state==="success"?"bg-green-100 text-green-700":state==="error"?"bg-red-100 text-red-700":"bg-zinc-200"}`}>{state==="success"?"✓":state==="error"?"!":"…"}</div><h1 className="mt-5 text-2xl font-extrabold">{state==="success"?"결제 완료":state==="error"?"결제 확인 필요":"처리 중"}</h1><p className="mt-3 text-sm text-zinc-600">{message}</p><div className="mt-6 flex justify-center gap-3">{receipt&&<a href={receipt} target="_blank" rel="noreferrer" className="rounded-full border px-5 py-2 text-sm">영수증</a>}<Link href="/dashboard" className="rounded-full bg-[#FF385C] px-5 py-2 text-sm font-bold text-white">내 강의</Link></div></div></div>;
}
