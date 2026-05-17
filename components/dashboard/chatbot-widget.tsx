"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "안녕하세요. 오늘 작성된 가격, 수요, 뉴스, AI 인사이트에 대해 물어보세요.",
  },
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestMessages = useMemo(() => messages.slice(-10), [messages]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10) }),
      });
      const result = await response.json() as { reply?: string; error?: string; detail?: string; status?: number };
      const errorText = [
        result.error,
        result.status ? `status ${result.status}` : "",
        result.detail,
      ].filter(Boolean).join(" · ");

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.ok ? result.reply ?? "답변을 생성하지 못했습니다." : errorText || "챗봇 요청에 실패했습니다.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "챗봇 서버에 연결할 수 없습니다. 배포 환경의 GEMINI_API_KEY 설정을 확인해 주세요.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <section className="flex h-[560px] w-[min(calc(100vw-2.5rem),380px)] flex-col overflow-hidden rounded-lg border bg-card shadow-2xl">
          <header className="flex items-center justify-between border-b bg-secondary/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Wegoinn AI 챗봇</p>
                <p className="text-xs text-muted-foreground">일별 대시보드 내용 문의</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="챗봇 닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {latestMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border bg-secondary/45 text-foreground"
                  }`}
                >
                  <MessageContent content={message.content} />
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-lg border bg-secondary/45 px-3 py-2 text-sm text-muted-foreground">
                  답변 작성 중...
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={submitMessage} className="flex gap-2 border-t p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="오늘 AI 인사이트 요약해줘"
              className="min-w-0 flex-1 rounded-md border bg-secondary px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="메시지 보내기"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          window.setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-105"
        aria-label="챗봇 열기"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        const markdownLink = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
        const url = markdownLink?.[2] ?? (part.startsWith("http") ? part : null);

        if (!url) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }

        return (
          <a
            key={`${url}-${index}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            {markdownLink?.[1] ?? url}
          </a>
        );
      })}
    </>
  );
}
