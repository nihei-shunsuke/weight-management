"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
            <TableHead>月</TableHead>
            <TableHead>体重 (kg)</TableHead>
            {metrics.map((m) => (
              <TableHead key={m.id}>
                {m.name} ({m.unit})
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.date}</TableCell>
              <TableCell>{record.weight}</TableCell>
              {metrics.map((m) => (
                <TableCell key={m.id}>
                  {record.customMetrics?.[m.id!] ?? "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
