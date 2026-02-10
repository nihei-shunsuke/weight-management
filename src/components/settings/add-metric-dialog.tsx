"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColorPicker } from "./color-picker";
import { PRESET_COLORS } from "@/types";

interface AddMetricDialogProps {
  onAdd: (name: string, unit: string, color: string) => Promise<void>;
}

export function AddMetricDialog({ onAdd }: AddMetricDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [color, setColor] = useState<string>(PRESET_COLORS[0].value);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd(name, unit, color);
      setName("");
      setUnit("");
      setColor(PRESET_COLORS[0].value);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>指標を追加</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>カスタム指標を追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metric-name">指標名</Label>
            <Input
              id="metric-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: スイングスピード"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metric-unit">単位</Label>
            <Input
              id="metric-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="例: km/h"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>グラフの色</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "追加中..." : "追加"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
