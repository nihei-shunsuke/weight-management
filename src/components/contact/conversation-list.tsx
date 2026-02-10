"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserConversations } from "@/lib/firebase/firestore";
import { ConversationListItem } from "./conversation-list-item";
import { NewConversationDialog } from "./new-conversation-dialog";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/types";

export function ConversationList() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const convs = await getUserConversations(user.uid);
      setConversations(convs);
      setLoading(false);
    })();
  }, [user]);

  async function handleRefresh() {
    if (!user) return;
    setLoading(true);
    const convs = await getUserConversations(user.uid);
    setConversations(convs);
    setLoading(false);
  }

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">お問い合わせ</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            更新
          </Button>
          <NewConversationDialog onCreated={handleRefresh} />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          読み込み中...
        </p>
      ) : conversations.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          会話はまだありません
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {conversations.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              currentUid={user.uid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
