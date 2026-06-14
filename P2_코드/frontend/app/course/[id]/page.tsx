"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";

interface Lesson {
  id: number;
  title: string;
  video_url: string;
  order: number;
  duration: number;
}

interface Comment {
  id: number;
  content: string;
  user: { id: number; nickname: string };
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  likeCount: number;
  liked: boolean;
  enrolled: boolean;
  comments: Comment[];
  price: number;
  level: string;
  ratingAverage: number;
  reviewCount: number;
  reviews: Array<{id:number;rating:number;content:string;created_at:string;user:{nickname:string}}>;
}
interface CourseProgress { completionRate:number; completedLessons:number; totalLessons:number; nextLessonId:number|null; lessons:Array<{lessonId:number;watchedSeconds:number;duration:number}> }

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState("");
  const [rating,setRating]=useState(5); const [reviewText,setReviewText]=useState("");
  const [progress,setProgress]=useState<CourseProgress|null>(null);
  const isLoggedIn = typeof window !== "undefined" && !!getToken();

  useEffect(() => {
    api(`/courses/${params.id}`).then(setCourse).catch(() => {});
  }, [params.id]);
  useEffect(()=>{if(course?.enrolled)api<CourseProgress>(`/progress/${params.id}`).then(setProgress).catch(()=>{});},[course?.enrolled,params.id]);

  const handleLike = async () => {
    if (!isLoggedIn) return router.push("/login");
    try {
      const result = await api(`/courses/${params.id}/like`, { method: "POST" });
      setCourse((prev) =>
        prev ? { ...prev, liked: result.liked, likeCount: result.likeCount } : prev
      );
    } catch {}
  };

  const handleEnroll = async () => {
    if (!isLoggedIn) return router.push("/login");
    try {
      await api(`/courses/${params.id}/enroll`, { method: "POST" });
      setCourse((prev) => (prev ? { ...prev, enrolled: true } : prev));
    } catch {}
  };

  const handlePayment = async () => {
    if (!isLoggedIn) return router.push("/login");
    router.push(`/checkout?courseId=${course?.id}`);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return router.push("/login");
    if (!commentText.trim()) return;
    try {
      const { comment } = await api(`/courses/${params.id}/comment`, {
        method: "POST",
        body: JSON.stringify({ content: commentText }),
      });
      setCourse((prev) =>
        prev ? { ...prev, comments: [comment, ...prev.comments] } : prev
      );
      setCommentText("");
    } catch {}
  };

  const handleReview=async(e:React.FormEvent)=>{e.preventDefault();try{await api(`/courses/${params.id}/review`,{method:"POST",body:JSON.stringify({rating,content:reviewText})});setMessage("리뷰를 저장했습니다. 새로고침하면 반영됩니다.");setReviewText("");}catch(error){setMessage(error instanceof Error?error.message:"리뷰 저장 실패");}};

  if (!course)
    return <p className="p-8 text-[#717171]">로딩 중...</p>;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            Course
          </p>
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row">
            <h1
              className="text-4xl font-extrabold text-[#222222]"
              style={{ letterSpacing: "-1px" }}
            >
              {course.title}
            </h1>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  course.liked
                    ? "bg-[#FFF0F3] text-[#FF385C]"
                    : "bg-white text-[#717171] hover:bg-[#ebebeb]"
                }`}
              >
                {course.liked ? "♥" : "♡"} {course.likeCount}
              </button>
              {!course.enrolled ? (
                <button
                  onClick={course.price > 0 ? handlePayment : handleEnroll}
                  className="px-5 py-2 bg-[#FF385C] text-white text-sm rounded-full hover:bg-[#e0314f] transition-colors font-medium"
                >
                  {course.price > 0 ? `${course.price.toLocaleString()}원 결제` : "무료 수강 신청"}
                </button>
              ) : (
                <button onClick={()=>router.push(progress?.nextLessonId?`/learn/${progress.nextLessonId}`:`/learn/${course.lessons[0]?.id}`)} className="px-5 py-2 bg-[#FF385C] text-white text-sm rounded-full font-semibold">{progress?.completionRate===100?"복습하기":"이어보기"}</button>
              )}
            </div>
          </div>
          <p className="text-[#717171] mt-4 text-base leading-relaxed">{course.description}</p>
          <p className="mt-3 text-sm font-semibold text-zinc-600">★ {course.ratingAverage} ({course.reviewCount}) · 난이도 {course.level} · {course.price ? `${course.price.toLocaleString()}원` : "무료"}</p>
          {message && <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-[#FF385C]">{message}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {course.enrolled&&progress&&<section className="mb-10 rounded-2xl bg-zinc-950 p-6 text-white"><div className="flex items-end justify-between"><div><p className="text-xs font-bold tracking-widest text-[#FF385C]">MY PROGRESS</p><h2 className="mt-2 text-xl font-extrabold">학습 진행 상황</h2></div><strong className="text-3xl">{progress.completionRate}%</strong></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-700"><div className="h-full bg-[#FF385C]" style={{width:`${progress.completionRate}%`}}/></div><p className="mt-3 text-sm text-zinc-400">전체 {progress.totalLessons}개 중 {progress.completedLessons}개 완료</p></section>}
        <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
          Lessons
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] mb-6"
          style={{ letterSpacing: "-0.5px" }}
        >
          강의 목록
        </h2>
        <div className="space-y-2 mb-12">
          {course.lessons.map((lesson) => {
            const lessonProgress=progress?.lessons.find((item)=>item.lessonId===lesson.id); const complete=!!lessonProgress&&lessonProgress.duration>0&&lessonProgress.watchedSeconds>=lessonProgress.duration*0.9;
            return (
            <div
              key={lesson.id}
              className="bg-[#F7F7F7] rounded-xl px-5 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
            >
              <div>
                <span className={`font-mono text-sm mr-3 ${complete?"text-green-600":"text-[#FF385C]"}`}>{complete?"✓":`${lesson.order}.`}</span>
                <span className="font-medium text-[#222222]">{lesson.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#717171]">
                  {Math.floor(lesson.duration / 60)}분
                </span>
                <button
                  onClick={() => course.enrolled ? router.push(`/learn/${lesson.id}`) : setMessage("수강 등록 후 학습할 수 있습니다.")}
                  className="px-4 py-1.5 bg-[#222222] text-white text-sm rounded-full hover:bg-[#3a3a3a] transition-colors"
                >
                  학습하기
                </button>
              </div>
            </div>
          )})}
        </div>

        <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
          Discussion
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] mb-6"
          style={{ letterSpacing: "-0.5px" }}
        >
          댓글 ({course.comments.length})
        </h2>
        <form onSubmit={handleComment} className="flex gap-2 mb-8">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isLoggedIn ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다"}
            className="flex-1 border border-[#ebebeb] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm"
            disabled={!isLoggedIn}
          />
          <button
            type="submit"
            disabled={!isLoggedIn}
            className="px-6 py-3 bg-[#FF385C] text-white rounded-xl hover:bg-[#e0314f] transition-colors disabled:opacity-40 text-sm font-medium"
          >
            작성
          </button>
        </form>
        <div className="space-y-3">
          {course.comments.map((comment) => (
            <div key={comment.id} className="bg-[#F7F7F7] rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[#222222] text-sm">{comment.user.nickname}</span>
                <span className="text-xs text-[#717171]">
                  {new Date(comment.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="text-[#717171] text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))}
          {course.comments.length === 0 && (
            <p className="text-[#717171] text-center py-6 text-sm">아직 댓글이 없습니다</p>
          )}
        </div>
        <div className="mt-12 border-t pt-10"><h2 className="text-2xl font-extrabold">수강평</h2>{course.enrolled&&<form onSubmit={handleReview} className="my-5 rounded-2xl bg-zinc-50 p-5"><div className="flex gap-2">{[1,2,3,4,5].map((star)=><button type="button" key={star} onClick={()=>setRating(star)} className={`text-2xl ${star<=rating?"text-amber-400":"text-zinc-300"}`}>★</button>)}</div><textarea value={reviewText} onChange={(e)=>setReviewText(e.target.value)} maxLength={1000} placeholder="이 강의가 다른 개발자에게 어떤 도움이 되었나요?" className="mt-3 w-full rounded-xl border p-3 text-sm"/><button className="mt-3 rounded-full bg-zinc-900 px-5 py-2 text-sm font-bold text-white">수강평 저장</button></form>}<div className="space-y-3">{course.reviews.map((review)=><article key={review.id} className="rounded-2xl bg-zinc-50 p-5"><div className="flex justify-between"><strong>{review.user.nickname}</strong><span className="text-amber-500">{"★".repeat(review.rating)}</span></div><p className="mt-2 text-sm text-zinc-600">{review.content}</p></article>)}</div></div>
      </div>
    </div>
  );
}
