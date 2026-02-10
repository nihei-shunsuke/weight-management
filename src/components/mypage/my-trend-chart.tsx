"use client";

import { useMemo, useState } from "react";
import { LineChart } from "@/components/charts/line-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { MonthlyRecord, MetricDefinition } from "@/types";
import { WEIGHT_COLOR } from "@/types";

interface Props {
  records: MonthlyRecord[];
  metrics: MetricDefinition[];
}

export function MyTrendChart({ records, metrics }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<string>("weight");

  const metricInfo = useMemo(() => {
    if (selectedMetric === "weight") {
      return { name: "体重", unit: "kg", color: WEIGHT_COLOR };
    }
    const m = metrics.find((m) => m.id === selectedMetric);
    return m
      ? { name: m.name, unit: m.unit, color: m.color }
      : { name: "体重", unit: "kg", color: WEIGHT_COLOR };
  }, [selectedMetric, metrics]);

  const chartData = useMemo(() => {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map((r) => r.date);
    const data = sorted.map((r) =>
      selectedMetric === "weight"
        ? r.weight
        : (r.customMetrics?.[selectedMetric] ?? null)
    );

    return {
      labels,
      datasets: [
        {
          label: metricInfo.name,
          data,
          borderColor: metricInfo.color,
          backgroundColor: metricInfo.color,
          tension: 0.3,
          spanGaps: true,
        },
      ],
    };
  }, [records, selectedMetric, metricInfo]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label>指標:</Label>
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weight">体重 (kg)</SelectItem>
            {metrics.map((m) => (
              <SelectItem key={m.id} value={m.id!}>
                {m.name} ({m.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="h-[400px]">
        <LineChart
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" as const },
              title: {
                display: true,
                text: `${metricInfo.name}推移`,
              },
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: `${metricInfo.name} (${metricInfo.unit})`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
