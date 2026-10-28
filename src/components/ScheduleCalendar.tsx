import { getSchedule } from "@/lib/content";
import { CALENDAR_TEXT, type Locale } from "@/lib/i18n";

/**
 * 診療カレンダーのHTML再現。
 * calendar.png に曜日・凡例が日本語で焼き込まれているため、
 * en/zh では schedule.json の calendar データから組み立てる。
 */
export function ScheduleCalendar({ locale }: { locale: Locale }) {
  const s = getSchedule(locale);
  const cal = s.calendar;
  if (!cal) return null;
  const { year, month, closedDays } = cal;
  const text = CALENDAR_TEXT[locale];

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(
    locale === "zh" ? "zh-CN" : locale === "en" ? "en-US" : "ja-JP",
    { year: "numeric", month: "long" },
  );
  const hours = s.hoursTable[0];

  return (
    <div className="cal-i18n">
      <p className="cal-ym">{monthLabel}</p>
      <table>
        <thead>
          <tr>
            {text.weekdays.map((w, i) => (
              <th key={w} className={i === 0 ? "sun" : i === 6 ? "sat" : ""}>
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: cells.length / 7 }, (_, w) => (
            <tr key={w}>
              {cells.slice(w * 7, w * 7 + 7).map((d, i) => (
                <td
                  key={i}
                  className={
                    d != null && closedDays.includes(d) ? "closed" : ""
                  }
                >
                  {d ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="cal-legend">
        <span className="cal-x">✕</span>
        <span className="cal-legend-text">
          {text.closedMark}
          {hours ? ` ｜ ${hours.label} ${hours.value}` : ""}
        </span>
      </p>
      {cal.note && <p className="cal-note">※ {cal.note}</p>}
    </div>
  );
}
