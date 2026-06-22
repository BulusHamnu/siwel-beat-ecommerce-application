import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

/* Format currencies*/
export function formatAmount(cents: number, currency = "USD") {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(dollars);
}

/* Format time ago */
export default function formatTimeAgo(date: Date | string) {
  return dayjs(date).fromNow();
}
