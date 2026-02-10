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
import type { MetricDefinition } from "@/types";

interface EditMetricDialogProps {
  metric: MetricDefinition;
  onUpdate: (
    metricId: string,
    data: { name: string; unit: string; color: string }
  ) => Promise<void>;
}

export function EditMetricDialog({ metric, onUpdate }: EditMetricDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(metric.name);
  const [unit, setUnit] = useState(metric.unit);
  const [color, setColor] = useState(metric.color);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(metric.id!, { name, unit, color });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          編集
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>指標を編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">指標名</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-unit">単位</Label>
            <Input
              id="edit-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>グラフの色</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "更新中..." : "更新"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
