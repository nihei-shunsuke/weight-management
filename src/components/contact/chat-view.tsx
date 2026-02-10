"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getMessages, sendMessage } from "@/lib/firebase/firestore";
import { isSameDay } from "@/lib/format";
import { ChatBubble } from "./chat-bubble";
import { ChatDateSeparator } from "./chat-date-separator";
import { ChatInputBar } from "./chat-input-bar";
import type { Message } from "@/types";

interface ChatViewProps {
  conversationId: string;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const msgs = await getMessages(conversationId);
    setMessages(msgs);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text: string) {
    if (!user) return;
    setSending(true);
    await sendMessage(
      conversationId,
      user.uid,
      user.displayName || "匿名",
      text
    );
    await loadMessages();
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
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
