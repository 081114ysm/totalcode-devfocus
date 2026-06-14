"use client";

import Link from "next/link";

export default function PaymentFailPage(){const params=typeof window!=="undefined"?new URLSearchParams(window.location.search):null; return <div className="grid min-h-[70vh] place-items-center px-5"><div className="max-w-md rounded-3xl bg-red-50 p-8 text-center"><h1 className="text-2xl font-extrabold text-red-700">결제가 완료되지 않았습니다</h1><p className="mt-3 text-sm text-red-600">{params?.get("message")||"결제수단을 확인하고 다시 시도해주세요."}</p><Link href="/courses" className="mt-6 inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white">강의로 돌아가기</Link></div></div>}
