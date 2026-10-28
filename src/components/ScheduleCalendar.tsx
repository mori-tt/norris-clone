import type { Schedule } from "@/lib/schemas";

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

/** schedule.json の calendar データから当月診療カレンダーを描画(休診日=グレー) */
export function ScheduleCalendar({ calendar }: { calendar: Schedule["calendar"] }) {
  const { year, month, closedDays, note } = calendar;
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-3 text-center font-serif text-lg font-semibold">
        {year}年{month}月 診療日
      </p>
      <table className="w-full border-collapse text-center text-sm">
        <thead>
          <tr>
            {weekdayLabels.map((d, i) => (
              <th
                key={d}
                className={`border border-accent/60 py-2 font-medium ${
                  i === 0
                    ? "text-red-500"
                    : i === 6
                      ? "text-blue-500"
                      : "text-text"
                }`}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: cells.length / 7 }, (_, w) => (
            <tr key={w}>
              {cells.slice(w * 7, w * 7 + 7).map((day, d) => (
                <td
                  key={d}
                  className={`border border-accent/60 py-2.5 ${
                    day === null
                      ? "bg-accent/10"
                      : closedDays.includes(day)
                        ? "bg-accent/30 text-text/40"
                        : "bg-white"
                  }`}
                >
                  {day ?? ""}
                  {day !== null && closedDays.includes(day) && (
                    <span className="block text-[10px]">休</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="mt-3 text-center text-xs text-text/70">{note}</p>}
    </div>
  );
}
