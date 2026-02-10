"use client";

import { useEffect, useState } from "react";
import {
  getAllMetrics,
  addMetric,
  updateMetric,
  deleteMetric,
} from "@/lib/firebase/firestore";
import { MetricsList } from "@/components/settings/metrics-list";
import { AddMetricDialog } from "@/components/settings/add-metric-dialog";
import { toast } from "sonner";
import type { MetricDefinition } from "@/types";

export default function SettingsPage() {
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMetrics() {
    const data = await getAllMetrics();
    setMetrics(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function handleAdd(name: string, unit: string, color: string) {
    await addMetric(name, unit, color);
    toast.success(`「${name}」を追加しました`);
    await fetchMetrics();
  }

  async function handleUpdate(
    metricId: string,
    data: { name: string; unit: string; color: string }
  ) {
    await updateMetric(metricId, data);
    toast.success(`「${data.name}」を更新しました`);
    await fetchMetrics();
  }

  async function handleDelete(metricId: string) {
    const metric = metrics.find((m) => m.id === metricId);
    await deleteMetric(metricId);
    toast.success(`「${metric?.name}」を削除しました`);
    await fetchMetrics();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">設定</h1>
        <AddMetricDialog onAdd={handleAdd} />
      </div>
      <MetricsList
        metrics={metrics}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}
