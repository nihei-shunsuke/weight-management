"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Props {
  records: MonthlyRecord[];
  users: UserProfile[];
  metrics: MetricDefinition[];
  selectedWeek: string;
  weekOptions: string[];
  onWeekChange: (week: string) => void;
}

export function MembersTable({
  records,
  users,
  metrics,
  selectedWeek,
  weekOptions,
  onWeekChange,
}: Props) {
  const weekRecords = records.filter((r) => r.date === selectedWeek);
  const userMap = new Map(users.map((u) => [u.uid, u]));

  if (weekOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        データがまだ登録されていません。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label>対象の週</Label>
        <Select value={selectedWeek} onValueChange={onWeekChange}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {weekOptions.map((w) => (
              <SelectItem key={w} value={w}>
                {w.length === 10 ? formatFridayLabel(w) : w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">
        {selectedWeek.length === 10
          ? formatFridayLabel(selectedWeek)
          : selectedWeek}{" "}
        のデータ
      </p>
      {weekRecords.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          この週のデータはまだありません。
        </p>
      ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
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
            {weekRecords.map((record) => {
              const bmi =
                record.height && record.height > 0
                  ? calculateBMI(record.weight, record.height)
                  : null;
              return (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {userMap.get(record.userId)?.displayName ?? "不明"}
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
      )}
    </div>
  );
}
