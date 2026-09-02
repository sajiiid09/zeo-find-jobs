export function formatSalary(min, max, jobType, locale = "en") {
  const isDaily = jobType === "daily";
  const unit = locale === "ar" ? (isDaily ? "ر.س / يوم" : "ر.س / شهر") : isDaily ? "SAR / day" : "SAR / month";
  const fmt = (value) => new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(value);
  if (!min && !max) return locale === "ar" ? "الراتب عند الطلب" : "Salary on request";
  if (min === max) return `${fmt(min)} ${unit}`;
  return `${fmt(min)} – ${fmt(max)} ${unit}`;
}

export function formatNumber(value, locale = "en") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(value ?? 0);
}

export function formatDate(value, locale = "en") {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function relativeTime(value, locale = "en") {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86400000);
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "en", { numeric: "auto" });
  if (days < 1) {
    const hours = Math.floor(diff / 3600000);
    return rtf.format(-Math.max(hours, 0), "hour");
  }
  if (days < 30) return rtf.format(-days, "day");
  return rtf.format(-Math.floor(days / 30), "month");
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
