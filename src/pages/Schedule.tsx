import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useStore } from "../lib/store";
import { EventModal } from "../components/modals/EventModal";
import { AMBER, GREEN, PINK, VIOLET } from "../components/common";

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_NAMES = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

const TYPE_COLOR: Record<string, string> = { rent: PINK, return: AMBER, studio: GREEN, other: VIOLET };

export function Schedule() {
  const { data } = useStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showModal, setShowModal] = useState(false);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  }

  const eventsByDay = useMemo(() => {
    const map: Record<number, { label: string; type: string }[]> = {};
    for (const e of data.events) {
      const d = new Date(e.date);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const day = d.getDate();
      map[day] = map[day] || [];
      const cust = e.orderId ? data.orders.find((o) => o.id === e.orderId) : undefined;
      const className = cust ? data.customers.find((c) => c.id === cust.customerId)?.className : undefined;
      const label = e.type === "rent" || e.type === "return"
        ? `${className ? className + " · " : ""}${e.type === "return" ? "Trả đồ: " + (e.orderId ?? "") : e.label}`
        : e.label;
      map[day].push({ label, type: e.type });
    }
    return map;
  }, [data.events, data.orders, data.customers, year, month]);

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // make Monday index 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number) => year === now.getFullYear() && month === now.getMonth() && d === now.getDate();

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Lịch trình</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Theo dõi ngày thuê · trả đồ · sự kiện</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-card border border-white/[0.06] rounded-xl overflow-hidden">
            <button onClick={() => shiftMonth(-1)} className="px-3 py-2 hover:bg-white/[0.05] transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 text-sm font-medium text-foreground min-w-[120px] text-center">
              {MONTH_NAMES[month]} · {year}
            </span>
            <button onClick={() => shiftMonth(1)} className="px-3 py-2 hover:bg-white/[0.05] transition-colors text-muted-foreground hover:text-foreground">
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:brightness-110"
            style={{ background: `linear-gradient(135deg, ${PINK}, ${VIOLET})` }}
          >
            <Plus size={13} /> Thêm sự kiện
          </button>
        </div>
      </div>

      <div className="bg-card border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/[0.05]">
          {DAYS.map((d) => (
            <div key={d} className="px-3 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const events = day ? eventsByDay[day] || [] : [];
            return (
              <div key={idx} className="min-h-[100px] p-2.5 border-b border-r border-white/[0.04] last:border-r-0">
                {day && (
                  <>
                    <div className="flex justify-end mb-1.5">
                      <span
                        className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium"
                        style={isToday(day) ? { background: `linear-gradient(135deg, ${PINK}, ${VIOLET})`, color: "#fff" } : { color: "#7A6F8A" }}
                      >
                        {day}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {events.map((ev, ei) => (
                        <div
                          key={ei}
                          className="px-1.5 py-0.5 rounded text-[9px] truncate font-medium"
                          style={{ background: `${TYPE_COLOR[ev.type]}22`, color: TYPE_COLOR[ev.type], border: `1px solid ${TYPE_COLOR[ev.type]}30` }}
                        >
                          {ev.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        {[{ color: PINK, label: "Ngày thuê" }, { color: AMBER, label: "Ngày trả đồ" }, { color: GREEN, label: "Sự kiện studio" }, { color: VIOLET, label: "Khác" }].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      {showModal && <EventModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
