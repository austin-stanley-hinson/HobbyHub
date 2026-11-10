// Turn a timestamp into a short phrase like "5 minutes ago" or "2 days ago"
const UNITS = [
  { name: "year", seconds: 60 * 60 * 24 * 365 },
  { name: "month", seconds: 60 * 60 * 24 * 30 },
  { name: "week", seconds: 60 * 60 * 24 * 7 },
  { name: "day", seconds: 60 * 60 * 24 },
  { name: "hour", seconds: 60 * 60 },
  { name: "minute", seconds: 60 },
];

export function timeAgo(timestamp) {
  const secondsAgo = Math.floor((Date.now() - new Date(timestamp)) / 1000);

  for (const unit of UNITS) {
    const count = Math.floor(secondsAgo / unit.seconds);
    if (count >= 1) {
      return `${count} ${unit.name}${count === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}
