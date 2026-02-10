"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatInputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInputBar({ onSend, disabled }: ChatInputBarProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t bg-background px-4 py-3"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="メッセージを入力..."
        disabled={disabled}
        className="flex-1 rounded-full border bg-muted px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <Button
        type="submit"
        size="sm"
        disabled={disabled || !text.trim()}
        className="rounded-full bg-[#06C755] hover:bg-[#05b34c] text-white"
      >
        送信
      </Button>
    </form>
  );
}
