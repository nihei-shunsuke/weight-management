"use client";

import { RecordForm } from "@/components/record/record-form";

export default function RecordPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">データ入力</h1>
      <RecordForm />
    </div>
  );
}
