export function dayIndexToDateString(dayIndex: number) {
  const date = new Date(dayIndex * 86400 * 1000);
  return date.toISOString().slice(0, 10);
}

export function todayIndexFromUnix(unixSeconds: number) {
  return Math.floor(unixSeconds / 86400);
}

export function formatYMD(date: Date) {
  return date.toISOString().slice(0, 10);
}

