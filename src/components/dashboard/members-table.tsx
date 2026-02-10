"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MonthlyRecord, UserProfile, MetricDefinition } from "@/types";

interface Props {
  records: MonthlyRecord[];
  users: UserProfile[];
  metrics: MetricDefinition[];
}

export function MembersTable({ records, users, metrics }: Props) {
  const latestMonth = records.reduce(
    (max, r) => (r.date > max ? r.date : max),
    ""
  );

  const latestRecords = records.filter((r) => r.date === latestMonth);
  const userMap = new Map(users.map((u) => [u.uid, u]));

  if (latestRecords.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        データがまだ登録されていません。
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {latestMonth} のデータ
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>体重 (kg)</TableHead>
              {metrics.map((m) => (
                <TableHead key={m.id}>
                  {m.name} ({m.unit})
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {latestRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  {userMap.get(record.userId)?.displayName ?? "不明"}
                </TableCell>
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
    </div>
  );
}
