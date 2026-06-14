"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// 노션과 동일한 라이트 테마 색상 (GitHub Light 기반)
const notionStyle: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': {
    color: "#37352f",
    background: "none",
    fontFamily: '"SFMono-Regular", Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace',
    fontSize: "0.8125rem",
    lineHeight: "1.625",
    whiteSpace: "pre",
    wordBreak: "normal",
    wordWrap: "normal",
    tabSize: 2,
  },
  'pre[class*="language-"]': {
    color: "#37352f",
    background: "#f7f6f3",
    fontFamily: '"SFMono-Regular", Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace',
    fontSize: "0.8125rem",
    lineHeight: "1.625",
    margin: 0,
    padding: "1rem 1.25rem",
    overflow: "auto",
  },
  comment: { color: "#9b9a97", fontStyle: "italic" },
  prolog: { color: "#9b9a97" },
  doctype: { color: "#9b9a97" },
  cdata: { color: "#9b9a97" },
  punctuation: { color: "#37352f" },
  property: { color: "#6f42c1" },
  tag: { color: "#22863a" },
  boolean: { color: "#005cc5" },
  number: { color: "#005cc5" },
  constant: { color: "#005cc5" },
  symbol: { color: "#005cc5" },
  deleted: { color: "#b31d28" },
  selector: { color: "#22863a" },
  "attr-name": { color: "#6f42c1" },
  string: { color: "#032f62" },
  char: { color: "#032f62" },
  builtin: { color: "#6f42c1" },
  inserted: { color: "#22863a" },
  operator: { color: "#37352f" },
  entity: { color: "#e36209", cursor: "help" },
  url: { color: "#032f62" },
  variable: { color: "#e36209" },
  keyword: { color: "#d73a49" },
  atrule: { color: "#d73a49" },
  "attr-value": { color: "#032f62" },
  function: { color: "#6f42c1" },
  "class-name": { color: "#6f42c1" },
  regex: { color: "#032f62" },
  important: { color: "#d73a49", fontWeight: "bold" },
};

interface Snippet {
  id: number;
  title: string;
  code: string;
  language: string;
  memo: string | null;
  created_at: string;
}

const LANGUAGES = [
  "javascript", "typescript", "python", "java",
  "go", "rust", "c", "cpp", "html", "css", "sql", "bash", "etc",
];

const PRISM_LANG: Record<string, string> = {
  javascript: "javascript", typescript: "typescript", python: "python",
  java: "java", go: "go", rust: "rust", c: "c", cpp: "cpp",
  html: "markup", css: "css", sql: "sql", bash: "bash", etc: "text",
};

export default function SnippetsPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filterLang, setFilterLang] = useState("전체");
  const [languages, setLanguages] = useState<string[]>(["전체"]);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [memo, setMemo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<number | "form" | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    loadSnippets();
    loadLanguages();
  }, [router]);

  useEffect(() => { loadSnippets(); }, [filterLang]);

  const loadSnippets = () => {
    const params = filterLang !== "전체" ? `?language=${encodeURIComponent(filterLang)}` : "";
    api(`/snippets${params}`).then((d) => setSnippets(d.snippets ?? [])).catch(() => {});
  };

  const loadLanguages = () => {
    api("/snippets/languages").then(setLanguages).catch(() => {});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;
    try {
      await api("/snippets", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), code, language, memo: memo.trim() }),
      });
      setTitle(""); setCode(""); setMemo(""); setLanguage("javascript");
      setShowForm(false);
      loadSnippets(); loadLanguages();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await api(`/snippets/${id}`, { method: "DELETE" });
      loadSnippets(); loadLanguages();
    } catch {}
  };

  const handleCopy = (id: number | "form", text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-4xl mx-auto flex items-end justify-between">
          <div>
            <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">Snippets</p>
            <h1 className="text-4xl font-extrabold text-[#222222]" style={{ letterSpacing: "-1px" }}>
              코드 스니펫
            </h1>
            <p className="text-[#717171] mt-2 text-sm">학습하면서 유용한 코드를 저장하세요</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${
              showForm
                ? "bg-white text-[#717171] hover:bg-[#ebebeb] border border-[#ebebeb]"
                : "bg-[#FF385C] text-white hover:bg-[#e0314f]"
            }`}
          >
            {showForm ? "취소" : "+ 새 스니펫"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Create form — Notion 스타일 */}
        {showForm && (
          <form onSubmit={handleCreate} className="mb-10">
            {/* 제목 + 언어 */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="스니펫 제목"
                className="flex-1 border-b border-[#e9e9e7] py-2 text-[#37352f] text-base font-medium placeholder:text-[#9b9a97] focus:outline-none focus:border-[#37352f] bg-transparent"
                required
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm text-[#9b9a97] border border-[#e9e9e7] rounded-md px-3 py-1.5 bg-white focus:outline-none"
              >
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* 노션 코드 블록 스타일 입력 */}
            <div className="rounded-md overflow-hidden mb-3">
              {/* 코드 블록 헤더 */}
              <div className="flex items-center justify-between bg-[#f7f6f3] px-4 py-2 border-b border-[#e9e9e7]">
                <span className="text-xs text-[#9b9a97] font-medium select-none">{language}</span>
                <button
                  type="button"
                  onClick={() => handleCopy("form", code)}
                  className="text-xs text-[#9b9a97] hover:text-[#37352f] transition-colors"
                >
                  {copiedId === "form" ? "복사됨" : "복사"}
                </button>
              </div>
              {/* 코드 입력 영역 */}
              <div className="relative bg-[#f7f6f3]">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="코드를 입력하세요..."
                  rows={8}
                  className="w-full bg-transparent px-5 py-4 font-mono text-[0.8125rem] text-[#37352f] placeholder:text-[#c7c5c0] focus:outline-none resize-none leading-[1.625]"
                  style={{ fontFamily: '"SFMono-Regular", Menlo, Consolas, "PT Mono", monospace' }}
                  required
                />
              </div>
            </div>

            {/* 메모 */}
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 (선택사항) — 이 코드가 왜 유용한지 설명하세요"
              className="w-full text-sm text-[#9b9a97] placeholder:text-[#c7c5c0] focus:outline-none border-b border-[#e9e9e7] py-2 mb-5 bg-transparent focus:border-[#37352f]"
            />

            <button
              type="submit"
              className="px-6 py-2 bg-[#FF385C] text-white rounded-full font-medium text-sm hover:bg-[#e0314f] transition-colors"
            >
              저장
            </button>
          </form>
        )}

        {/* 언어 필터 */}
        <div className="flex gap-2 flex-wrap mb-8">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setFilterLang(lang)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterLang === lang
                  ? "bg-[#37352f] text-white"
                  : "bg-[#f7f6f3] text-[#9b9a97] hover:bg-[#efefed] hover:text-[#37352f]"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* 스니펫 목록 */}
        {snippets.length === 0 ? (
          <div className="rounded-md bg-[#f7f6f3] p-10 text-center">
            <p className="text-[#9b9a97] text-sm">저장된 스니펫이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-6">
            {snippets.map((snippet) => (
              <div key={snippet.id}>
                {/* 제목 행 */}
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <h3 className="font-semibold text-[#37352f] text-sm">{snippet.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#9b9a97]">
                      {new Date(snippet.created_at).toLocaleDateString("ko-KR")}
                    </span>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className="text-xs text-[#9b9a97] hover:text-[#d73a49] transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* 노션 코드 블록 */}
                <div className="rounded-md overflow-hidden">
                  {/* 헤더 */}
                  <div className="flex items-center justify-between bg-[#f7f6f3] px-4 py-2 border-b border-[#e9e9e7]">
                    <span className="text-xs text-[#9b9a97] font-medium select-none">
                      {snippet.language}
                    </span>
                    <button
                      onClick={() => handleCopy(snippet.id, snippet.code)}
                      className="text-xs text-[#9b9a97] hover:text-[#37352f] transition-colors"
                    >
                      {copiedId === snippet.id ? "✓ 복사됨" : "복사"}
                    </button>
                  </div>

                  {/* 코드 */}
                  <SyntaxHighlighter
                    language={PRISM_LANG[snippet.language] ?? "text"}
                    style={notionStyle}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      background: "#f7f6f3",
                    }}
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>

                {/* 메모 */}
                {snippet.memo && (
                  <p className="mt-2 px-1 text-xs text-[#9b9a97] leading-relaxed">
                    {snippet.memo}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
