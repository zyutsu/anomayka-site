/** Работа с датой и временем в часовом поясе автосервиса (по умолчанию Москва). */

export const SHOP_TIMEZONE = process.env.SHOP_TIMEZONE || "Europe/Moscow";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SHOP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function shopNow(): { date: string; time: string; minutes: number } {
  const parts = formatter.formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));

  return {
    date: year + "-" + month + "-" + day,
    time: String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0"),
    minutes: hour * 60 + minute,
  };
}

export function todayIso(): string {
  return shopNow().date;
}

