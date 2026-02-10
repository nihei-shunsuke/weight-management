"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getContactMessages, sendContactMessage } from "@/lib/firebase/firestore";
import { isSameDay } from "@/lib/format";
import { ChatBubble } from "./chat-bubble";
import { ChatDateSeparator } from "./chat-date-separator";
import { ChatInputBar } from "./chat-input-bar";
import { Button } from "@/components/ui/button";
import type { Message } from "@/types";

export function ChatView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const msgs = await getContactMessages();
    setMessages(msgs);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text: string) {
    if (!user) return;
    setSending(true);
    await sendContactMessage(
      user.uid,
      user.displayName || "匿名",
      text
    );
    await loadMessages();
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="font-bold text-lg">お問い合わせ</h1>
        <Button variant="outline" size="sm" onClick={loadMessages}>
          更新
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {loading ? (
          <div className="flex justify-center py-8 text-sm text-muted-foreground">
            読み込み中...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-8 text-sm text-muted-foreground">
            メッセージはまだありません
          </div>
        ) : (
          messages.map((msg, i) => {
            const showDate =
              i === 0 ||
              !isSameDay(msg.createdAt, messages[i - 1].createdAt);
            return (
              <div key={msg.id}>
                {showDate && <ChatDateSeparator date={msg.createdAt} />}
                <ChatBubble
                  message={msg}
                  isOwn={msg.senderUid === user?.uid}
                />
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInputBar onSend={handleSend} disabled={sending} />
    </div>
  );
}
