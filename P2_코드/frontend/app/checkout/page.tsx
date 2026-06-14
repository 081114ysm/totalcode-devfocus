"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { api } from "@/lib/api";

interface Order { orderId:string; amount:number; orderName:string; customerKey:string; }

export default function CheckoutPage(){
  const router=useRouter(); const [courseId,setCourseId]=useState(0);
  const [order,setOrder]=useState<Order|null>(null); const [message,setMessage]=useState("결제 정보를 준비하고 있습니다."); const widget=useRef<TossPaymentsWidgets|null>(null);
  useEffect(()=>{setCourseId(Number(new URLSearchParams(window.location.search).get("courseId")));},[]);
  useEffect(()=>{ if(!localStorage.getItem("token")){router.push("/login");return;} if(!courseId)return; api<Order>("/payments/initiate",{method:"POST",body:JSON.stringify({courseId})}).then(setOrder).catch((error)=>setMessage(error instanceof Error?error.message:"주문 생성 실패")); },[courseId,router]);
  useEffect(()=>{ if(!order)return; const clientKey=process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY; if(!clientKey){setMessage("NEXT_PUBLIC_TOSS_CLIENT_KEY가 설정되지 않았습니다.");return;} loadTossPayments(clientKey).then(async(toss)=>{const paymentWidget=toss.widgets({customerKey:order.customerKey}); widget.current=paymentWidget; await paymentWidget.setAmount({currency:"KRW",value:order.amount}); await Promise.all([paymentWidget.renderPaymentMethods({selector:"#payment-method",variantKey:"DEFAULT"}),paymentWidget.renderAgreement({selector:"#agreement",variantKey:"AGREEMENT"})]); setMessage("");}).catch(()=>setMessage("결제위젯을 불러오지 못했습니다.")); },[order]);
  async function pay(){ if(!order||!widget.current)return; const origin=window.location.origin; await widget.current.requestPayment({orderId:order.orderId,orderName:order.orderName,successUrl:`${origin}/payments/success`,failUrl:`${origin}/payments/fail`,customerEmail:localStorage.getItem("email")||undefined}); }
  return <div className="min-h-screen bg-zinc-50 px-4 py-10"><div className="mx-auto max-w-2xl rounded-3xl bg-white p-5 shadow-sm sm:p-8"><p className="text-xs font-extrabold tracking-[3px] text-[#FF385C]">CHECKOUT</p><h1 className="mt-3 text-2xl font-extrabold">안전한 결제</h1>{order&&<div className="mt-6 flex justify-between rounded-2xl bg-zinc-50 p-5"><span>{order.orderName}</span><strong>{order.amount.toLocaleString()}원</strong></div>}<div id="payment-method" className="mt-6"/><div id="agreement"/><button onClick={pay} disabled={!order||!!message} className="mt-5 w-full rounded-xl bg-[#FF385C] py-4 font-bold text-white disabled:opacity-40">{order?`${order.amount.toLocaleString()}원 결제하기`:"준비 중"}</button>{message&&<p className="mt-4 text-center text-sm text-zinc-500">{message}</p>}</div></div>;
}
