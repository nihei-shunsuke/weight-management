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
import { calculateBMI } from "@/lib/format";
import { formatFridayLabel } from "@/lib/jst";
import type { MonthlyRecord, UserProfile, MetricDefinition } from "@/types";
import { WEIGHT_COLOR } from "@/types";

const COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#ca8a04",
  "#9333ea",
  "#0891b2",
  "#e11d48",
  "#65a30d",
  "#c026d3",
  "#0d9488",
];

const BMI_COLOR = "#6366f1"; // indigo

interface Props {
  records: MonthlyRecord[];
  users: UserProfile[];
  metrics: MetricDefinition[];
}

export function MembersChart({ records, users, metrics }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<string>("weight");

  const metricInfo = useMemo(() => {
    if (selectedMetric === "weight") {
      return { name: "体重", unit: "kg", color: WEIGHT_COLOR };
    }
    if (selectedMetric === "bmi") {
      return { name: "BMI", unit: "", color: BMI_COLOR };
    }
    const m = metrics.find((m) => m.id === selectedMetric);
    return m
      ? { name: m.name, unit: m.unit, color: m.color }
      : { name: "体重", unit: "kg", color: WEIGHT_COLOR };
  }, [selectedMetric, metrics]);

  const chartData = useMemo(() => {
    const weeks = [...new Set(records.map((r) => r.date))].sort();
    const userMap = new Map(users.map((u) => [u.uid, u]));
    const userIds = [...new Set(records.map((r) => r.userId))];

    const datasets = userIds.map((userId, index) => {
      const userRecords = records.filter((r) => r.userId === userId);
      const dataByWeek = new Map(
        userRecords.map((r) => {
          let value: number | null;
          if (selectedMetric === "weight") {
            value = r.weight;
          } else if (selectedMetric === "bmi") {
            value =
              r.height && r.height > 0
                ? calculateBMI(r.weight, r.height)
                : null;
          } else {
            value = r.customMetrics?.[selectedMetric] ?? null;
          }
          return [r.date, value];
        })
      );

      return {
        label: userMap.get(userId)?.displayName ?? "不明",
        data: weeks.map((w) => dataByWeek.get(w) ?? null),
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: COLORS[index % COLORS.length],
        tension: 0.3,
        spanGaps: true,
      };
    });

    const labels = weeks.map((w) =>
      w.length === 10 ? formatFridayLabel(w) : w
    );
    return { labels, datasets };
  }, [records, users, selectedMetric]);

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
            <SelectItem value="bmi">BMI</SelectItem>
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
                text: `${metricInfo.name}推移（全体）`,
              },
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: metricInfo.unit
                    ? `${metricInfo.name} (${metricInfo.unit})`
                    : metricInfo.name,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
