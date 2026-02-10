"use client";

import { formatDateSeparator } from "@/lib/format";

interface ChatDateSeparatorProps {
  date: Date;
}

export function ChatDateSeparator({ date }: ChatDateSeparatorProps) {
  return (
    <div className="flex justify-center my-3">
      <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
        {formatDateSeparator(date)}
      </span>
    </div>
  );
}
