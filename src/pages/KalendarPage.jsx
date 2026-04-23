import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RPHCard, StatusBadge, Spinner, STATUS_DOT, MONTHS_MY, DAYS_MY } from '../components/ui';
import api from '../lib/api';

export default function KalendarPage({ user, onView }) {
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [rphList, setRphList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/rph').then(r => setRphList(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const prev = () => setCur(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 });
  const next = () => setCur(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 });

  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const firstDay = new Date(cur.y, cur.m, 1).getDay();
  const isToday = (d) => d === today.getDate() && cur.m === today.getMonth() && cur.y === today.getFullYear();

  const monthStr = `${cur.y}-${String(cur.m + 1).padStart(2, '0')}`;
  const monthRPH = rphList.filter(r => r.tarikh?.startsWith(monthStr));

  const byDate = {};
  monthRPH.forEach(r => {
    const d = parseInt(r.tarikh?.slice(8, 10));
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(r);
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Lora,Georgia,serif' }}>Kalendar RPH</h2>
        <p className="text-sm text-stone-600 mt-0.5">Pandangan bulanan jadual pengajaran</p>
      </div>

      <div className="card overflow-hidden mb-5">
        {/* Nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200"
          style={{ background: 'linear-gradient(135deg,#1e40af,#1e3a8a)' }}>
          <button onClick={prev} className="p-2 rounded-lg text-white hover:bg-white/20 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Lora,Georgia,serif' }}>
            {MONTHS_MY[cur.m]} {cur.y}
          </h3>
          <button onClick={next} className="p-2 rounded-lg text-white hover:bg-white/20 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
          {DAYS_MY.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-stone-500 py-2.5 uppercase tracking-wider">
              {d.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => (
              <div key={idx}
                className={`min-h-[88px] border-b border-r border-stone-100 p-1.5 ${day && isToday(day) ? 'bg-blue-50' : day ? 'hover:bg-stone-50' : ''} transition`}>
                {day && (
                  <>
                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-700 text-white' : 'text-stone-600'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {(byDate[day] || []).slice(0, 3).map(r => (
                        <div key={r.id} onClick={() => onView(r)}
                          className="flex items-center gap-1 cursor-pointer group">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[r.status]}`} />
                          <span className="text-xs text-stone-600 truncate group-hover:text-blue-700 leading-tight transition">{r.tajuk}</span>
                        </div>
                      ))}
                      {(byDate[day] || []).length > 3 && (
                        <div className="text-xs text-stone-400">+{byDate[day].length - 3} lagi</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex flex-wrap gap-4">
          {Object.entries(STATUS_DOT).map(([k, dot]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              <span className="text-xs text-stone-600 capitalize">{k.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Senarai bulan ini */}
      <div className="card p-4">
        <h3 className="font-semibold text-stone-800 mb-3">
          RPH dalam {MONTHS_MY[cur.m]} {cur.y} ({monthRPH.length})
        </h3>
        {loading ? <Spinner /> : monthRPH.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-sm">Tiada RPH pada bulan ini.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[...monthRPH].sort((a, b) => a.tarikh?.localeCompare(b.tarikh)).map(r => (
              <div key={r.id} onClick={() => onView(r)}
                className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl hover:shadow-md hover:border-blue-300 cursor-pointer transition-all">
                <div className="text-center min-w-[44px]">
                  <div className="text-xl font-bold text-blue-700 leading-none">{parseInt(r.tarikh?.slice(8, 10))}</div>
                  <div className="text-xs text-stone-500">{MONTHS_MY[cur.m].slice(0, 3)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-800 text-sm truncate">{r.tajuk}</div>
                  <div className="text-xs text-stone-500">{r.subjek} • {r.kelas} • {r.masa}</div>
                  {user.peranan !== 'guru' && <div className="text-xs text-blue-700 font-medium">{r.guru_nama}</div>}
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
