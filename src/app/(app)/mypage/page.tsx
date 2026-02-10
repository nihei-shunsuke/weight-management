"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserRecords, getAllMetrics } from "@/lib/firebase/firestore";
import { MyRecordsTable } from "@/components/mypage/my-records-table";
import { MyTrendChart } from "@/components/mypage/my-trend-chart";
import { ProfileCard } from "@/components/mypage/profile-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlyRecord, MetricDefinition } from "@/types";

export default function MyPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const [recordsData, metricsData] = await Promise.all([
        getUserRecords(user!.uid),
        getAllMetrics(),
      ]);
      setRecords(recordsData);
      setMetrics(metricsData);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">マイページ</h1>
      <ProfileCard />
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">テーブル</TabsTrigger>
          <TabsTrigger value="chart">グラフ</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <MyRecordsTable records={records} metrics={metrics} />
        </TabsContent>
        <TabsContent value="chart">
          <MyTrendChart records={records} metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
