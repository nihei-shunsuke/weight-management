"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditMetricDialog } from "./edit-metric-dialog";
import type { MetricDefinition } from "@/types";

interface MetricsListProps {
  metrics: MetricDefinition[];
  onUpdate: (
    metricId: string,
    data: { name: string; unit: string; color: string }
  ) => Promise<void>;
  onDelete: (metricId: string) => Promise<void>;
  loading: boolean;
}

export function MetricsList({
  metrics,
  onUpdate,
  onDelete,
  loading,
}: MetricsListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        カスタム指標がまだ登録されていません。
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>色</TableHead>
          <TableHead>指標名</TableHead>
          <TableHead>単位</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {metrics.map((metric) => (
          <TableRow key={metric.id}>
            <TableCell>
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: metric.color }}
              />
            </TableCell>
            <TableCell className="font-medium">{metric.name}</TableCell>
            <TableCell>{metric.unit}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <EditMetricDialog metric={metric} onUpdate={onUpdate} />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(metric.id!)}
                >
                  削除
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
