export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Date;
}

export interface MonthlyRecord {
  id?: string;
  userId: string;
  date: string; // "YYYY-MM"
  weight: number; // kg
  customMetrics: Record<string, number>; // metricId -> value
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricDefinition {
  id?: string;
  name: string; // e.g., "スイングスピード"
  unit: string; // e.g., "km/h"
  color: string; // hex color code for charts
  createdAt: Date;
}

export const PRESET_COLORS = [
  { label: "ブルー", value: "#2563eb" },
  { label: "レッド", value: "#dc2626" },
  { label: "グリーン", value: "#16a34a" },
  { label: "イエロー", value: "#ca8a04" },
  { label: "パープル", value: "#9333ea" },
  { label: "シアン", value: "#0891b2" },
  { label: "ピンク", value: "#e11d48" },
  { label: "ライム", value: "#65a30d" },
  { label: "マゼンタ", value: "#c026d3" },
  { label: "ティール", value: "#0d9488" },
] as const;

export const WEIGHT_COLOR = "#f97316"; // orange for default weight metric
