"use client";

import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/format";
import type { Message } from "@/types";

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  return (
    <div
      className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}
    >
      {!isOwn && (
        <span className="text-xs text-muted-foreground mb-1 ml-1">
          {message.senderName}
        </span>
      )}
      <div
        className={cn(
          "max-w-[75%] px-3 py-2 text-sm whitespace-pre-wrap break-words",
          isOwn
            ? "bg-[#06C755] text-white rounded-2xl rounded-br-sm"
            : "bg-muted rounded-2xl rounded-bl-sm"
        )}
      >
        {message.text}
      </div>
      <span className="text-[10px] text-muted-foreground mt-0.5 mx-1">
        {formatMessageTime(message.createdAt)}
      </span>
    </div>
  );
}
