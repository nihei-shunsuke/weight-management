"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  upsertRecord,
  getAllMetrics,
  getUserRecords,
} from "@/lib/firebase/firestore";
import { calculateBMI } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { MetricDefinition, MonthlyRecord } from "@/types";
import { format } from "date-fns";

export function RecordForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return format(d, "yyyy-MM");
  });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [metricsData, recordsData] = await Promise.all([
        getAllMetrics(),
        getUserRecords(user!.uid),
      ]);
      setMetrics(metricsData);
      setRecords(recordsData);
    }
    load();
  }, [user]);

  useEffect(() => {
    const existing = records.find((r) => r.date === selectedMonth);
    if (existing) {
      setWeight(existing.weight.toString());
      if (existing.height) {
        setHeight(existing.height.toString());
      } else {
        // 他のレコードから最新の身長を取得
        const latestHeight = records.find((r) => r.height && r.height > 0)?.height;
        setHeight(latestHeight ? latestHeight.toString() : "");
      }
      const values: Record<string, string> = {};
      metrics.forEach((m) => {
        if (m.id && existing.customMetrics?.[m.id] !== undefined) {
          values[m.id] = existing.customMetrics[m.id].toString();
        }
      });
      setCustomValues(values);
    } else {
      setWeight("");
      // 既存レコードから身長を自動補完
      const latestHeight = records.find((r) => r.height && r.height > 0)?.height;
      setHeight(latestHeight ? latestHeight.toString() : "");
      setCustomValues({});
    }
  }, [selectedMonth, records, metrics]);

  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h)) return null;
    return calculateBMI(w, h);
  }, [weight, height]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const customMetrics: Record<string, number> = {};
    Object.entries(customValues).forEach(([metricId, value]) => {
      if (value !== "") {
        customMetrics[metricId] = parseFloat(value);
      }
    });

    const heightVal = height ? parseFloat(height) : undefined;

    try {
      await upsertRecord(
        user.uid,
        selectedMonth,
        parseFloat(weight),
        heightVal,
        customMetrics
      );
      toast.success(`${selectedMonth} のデータを保存しました`);
      router.push("/mypage");
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>月次データ入力</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>月</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">体重 (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">身長 (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          {bmi !== null && (
            <div className="rounded-md bg-muted px-4 py-3">
              <span className="text-sm text-muted-foreground">BMI: </span>
              <span className="text-sm font-medium">{bmi}</span>
            </div>
          )}

          {metrics.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <Label htmlFor={metric.id!}>
                {metric.name} ({metric.unit})
              </Label>
              <Input
                id={metric.id!}
                type="number"
                step="0.1"
                value={customValues[metric.id!] ?? ""}
                onChange={(e) =>
                  setCustomValues((prev) => ({
                    ...prev,
                    [metric.id!]: e.target.value,
                  }))
                }
              />
            </div>
          ))}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
