"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateBMI } from "@/lib/format";
import { formatFridayLabel } from "@/lib/jst";
import type { MonthlyRecord, MetricDefinition } from "@/types";

interface Props {
  records: MonthlyRecord[];
  metrics: MetricDefinition[];
}

export function MyRecordsTable({ records, metrics }: Props) {
  if (records.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        データがまだ登録されていません。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>週（金曜）</TableHead>
            <TableHead>体重 (kg)</TableHead>
            <TableHead>身長 (cm)</TableHead>
            <TableHead>BMI</TableHead>
            {metrics.map((m) => (
              <TableHead key={m.id}>
                {m.name} ({m.unit})
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const bmi =
              record.height && record.height > 0
                ? calculateBMI(record.weight, record.height)
                : null;
            return (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  {record.date.length === 10
                    ? formatFridayLabel(record.date)
                    : record.date}
                </TableCell>
                <TableCell>{record.weight}</TableCell>
                <TableCell>{record.height ?? "-"}</TableCell>
                <TableCell>{bmi ?? "-"}</TableCell>
                {metrics.map((m) => (
                  <TableCell key={m.id}>
                    {record.customMetrics?.[m.id!] ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
