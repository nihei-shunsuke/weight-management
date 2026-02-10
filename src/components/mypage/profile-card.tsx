"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUser, updateUser } from "@/lib/firebase/firestore";
import { updateDisplayName } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { UserProfile } from "@/types";

export function ProfileCard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const data = await getUser(user!.uid);
      if (data) {
        setProfile(data);
        setDisplayName(data.displayName);
      }
    }
    load();
  }, [user]);

  async function handleSave() {
    if (!user || !displayName.trim()) return;
    setLoading(true);
    try {
      await updateUser(user.uid, { displayName: displayName.trim() });
      await updateDisplayName(displayName.trim());
      setProfile((prev) =>
        prev ? { ...prev, displayName: displayName.trim() } : prev
      );
      setEditing(false);
      toast.success("プロフィールを更新しました");
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setDisplayName(profile?.displayName ?? "");
    setEditing(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">プロフィール</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>メールアドレス</Label>
          <p className="text-sm text-muted-foreground">
            {profile?.email ?? user?.email ?? ""}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">名前</Label>
          {editing ? (
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          ) : (
            <p className="text-sm">{profile?.displayName ?? ""}</p>
          )}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                キャンセル
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              編集
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
