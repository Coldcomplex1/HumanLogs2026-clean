import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export { dayjs };

export function prettyDate(d: Date | string) {
  const date = dayjs(d);

  if (date.isSame(dayjs(), "day")) {
    return date.format("[Today at] h:mm A");
  }

  return date.format("MMM D, YYYY");
}
