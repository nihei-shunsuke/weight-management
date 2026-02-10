"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getConversation } from "@/lib/firebase/firestore";
import { ChatView } from "@/components/contact/chat-view";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/types";

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      const conv = await getConversation(conversationId);
      setConversation(conv);
      setLoading(false);
    })();
  }, [conversationId]);

  if (loading) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        読み込み中...
      </p>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground mb-4">
          会話が見つかりません
        </p>
        <Link href="/contact">
          <Button variant="outline" size="sm">
            戻る
          </Button>
        </Link>
      </div>
    );
  }

  const otherName = user
    ? Object.entries(conversation.participantNames)
        .filter(([uid]) => uid !== user.uid)
        .map(([, name]) => name)
        .join(", ")
    : "";

  return (
    <div className="-mx-4 -mt-6">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link href="/contact">
          <Button variant="ghost" size="sm">
            ← 戻る
          </Button>
        </Link>
        <span className="font-medium text-sm">{otherName}</span>
      </div>
      <ChatView conversationId={conversationId} />
    </div>
  );
}
