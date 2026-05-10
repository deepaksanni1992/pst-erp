/** Common date-range presets for dashboards / reports. */
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function fmt(d) {
  if (!d) return "";
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  return x.toISOString().slice(0, 10);
}

export function rangePreset(key) {
  const now = new Date();
  switch (key) {
    case "today":      return { from: fmt(startOfDay(now)), to: fmt(endOfDay(now)) };
    case "yesterday": {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { from: fmt(startOfDay(y)), to: fmt(endOfDay(y)) };
    }
    case "last7": {
      const a = new Date(now); a.setDate(a.getDate() - 6);
      return { from: fmt(startOfDay(a)), to: fmt(endOfDay(now)) };
    }
    case "last30": {
      const a = new Date(now); a.setDate(a.getDate() - 29);
      return { from: fmt(startOfDay(a)), to: fmt(endOfDay(now)) };
    }
    case "thisMonth": {
      const a = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: fmt(a), to: fmt(endOfDay(now)) };
    }
    case "lastMonth": {
      const a = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const b = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: fmt(a), to: fmt(endOfDay(b)) };
    }
    case "thisYear": {
      const a = new Date(now.getFullYear(), 0, 1);
      return { from: fmt(a), to: fmt(endOfDay(now)) };
    }
    case "all":
    default:
      return { from: "", to: "" };
  }
}

export const RANGE_PRESETS = [
  { key: "today",     label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7",     label: "Last 7 days" },
  { key: "last30",    label: "Last 30 days" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "thisYear",  label: "This year" },
  { key: "all",       label: "All time" },
];

export { fmt as formatDate };
