"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getAllUsers, getOrCreateConversation } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { UserProfile } from "@/types";

interface NewConversationDialogProps {
  onCreated: () => void;
}

export function NewConversationDialog({
  onCreated,
}: NewConversationDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const allUsers = await getAllUsers();
      setUsers(allUsers.filter((u) => u.uid !== user?.uid));
    })();
  }, [open, user]);

  async function handleSelect(target: UserProfile) {
    if (!user) return;
    setLoading(true);
    const convId = await getOrCreateConversation(
      user.uid,
      user.displayName || "匿名",
      target.uid,
      target.displayName
    );
    setOpen(false);
    setLoading(false);
    onCreated();
    router.push(`/contact/${convId}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">新規会話</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ユーザーを選択</DialogTitle>
        </DialogHeader>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            他のユーザーがいません
          </p>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {users.map((u) => (
              <button
                key={u.uid}
                onClick={() => handleSelect(u)}
                disabled={loading}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {u.displayName.charAt(0)}
                </div>
                <span className="text-sm">{u.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
