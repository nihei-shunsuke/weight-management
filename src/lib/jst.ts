const JST = "Asia/Tokyo";

/**
 * 日本時間での「現在」の日付部分を返す（年・月・日・曜日）
 */
function getDatePartsInJST(d: Date): {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
} {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: JST,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(d);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)!.value, 10);
  const weekday = parts.find((p) => p.type === "weekday")!.value;
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday
  );
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    dayOfWeek,
  };
}

/**
 * 日本時間で「直近の金曜日」の日付を yyyy-MM-dd で返す。
 * 金曜→その日、土日〜木→その週の金曜（過去）
 */
export function getCurrentFridayJST(): string {
  const now = new Date();
  const { year, month, day, dayOfWeek } = getDatePartsInJST(now);
  // 金曜=5。直近の金曜までのオフセット: 金=0, 土=1, 日=2, 月=3, 火=4, 水=5, 木=6
  const offset = (dayOfWeek + 2) % 7;
  const friday = new Date(year, month - 1, day - offset);
  const y = friday.getFullYear();
  const m = String(friday.getMonth() + 1).padStart(2, "0");
  const d = String(friday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 日本時間で過去 n 週間分の金曜日を新しい順に yyyy-MM-dd の配列で返す
 */
export function getRecentFridaysJST(count: number): string[] {
  const current = getCurrentFridayJST();
  const [y, m, d] = current.split("-").map(Number);
  const fridays: string[] = [];
  const date = new Date(y, m - 1, d);
  for (let i = 0; i < count; i++) {
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    fridays.push(`${yy}-${mm}-${dd}`);
    date.setDate(date.getDate() - 7);
  }
  return fridays;
}

/**
 * 金曜日キー (yyyy-MM-dd) を表示用に整形する（例: 2025/2/7 (金)）
 */
export function formatFridayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString("ja-JP", { weekday: "short" });
  return `${y}/${m}/${d} (${weekday})`;
}
