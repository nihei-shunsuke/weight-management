"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation } from "@/types";

interface ConversationListItemProps {
  conversation: Conversation;
  currentUid: string;
}

export function ConversationListItem({
  conversation,
  currentUid,
}: ConversationListItemProps) {
  const otherName = Object.entries(conversation.participantNames)
    .filter(([uid]) => uid !== currentUid)
    .map(([, name]) => name)
    .join(", ");

  return (
    <Link
      href={`/contact/${conversation.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium shrink-0">
        {otherName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm truncate">{otherName}</span>
          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        {conversation.lastMessage && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {conversation.lastMessage}
          </p>
        )}
      </div>
    </Link>
  );
}
