"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAllRecords,
  getAllUsers,
  getAllMetrics,
} from "@/lib/firebase/firestore";
import { MembersTable } from "@/components/dashboard/members-table";
import { MembersChart } from "@/components/dashboard/members-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlyRecord, UserProfile, MetricDefinition } from "@/types";

export default function DashboardPage() {
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      const [recordsData, usersData, metricsData] = await Promise.all([
        getAllRecords(),
        getAllUsers(),
        getAllMetrics(),
      ]);
      setRecords(recordsData);
      setUsers(usersData);
      setMetrics(metricsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const weekOptions = useMemo(() => {
    const weeks = [...new Set(records.map((r) => r.date))].sort((a, b) =>
      b.localeCompare(a)
    );
    return weeks;
  }, [records]);

  const displayWeek = selectedWeek || weekOptions[0] || "";

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">全体ダッシュボード</h1>
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">テーブル</TabsTrigger>
          <TabsTrigger value="chart">グラフ</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <MembersTable
            records={records}
            users={users}
            metrics={metrics}
            selectedWeek={displayWeek}
            weekOptions={weekOptions}
            onWeekChange={setSelectedWeek}
          />
        </TabsContent>
        <TabsContent value="chart">
          <MembersChart
            records={records}
            users={users}
            metrics={metrics}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
