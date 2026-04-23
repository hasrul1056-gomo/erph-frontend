import { useState, useEffect, useRef } from 'react';
import {
  LogOut, Bell, BellRing, LayoutDashboard, Calendar, Settings,
  Menu, X, CheckCircle2, XCircle, Clock, Info,
  KeyRound, ChevronDown, User, Eye, EyeOff
} from 'lucide-react';
import { RoleBadge } from './ui';
import api from '../lib/api';

// ── Notifikasi config ──────────────────────────────
const NOTIF_CFG = {
  semakan:      { cls: 'bg-amber-50 text-amber-800',     icon: Clock,        dot: 'bg-amber-500'   },
  dikembalikan: { cls: 'bg-rose-50 text-rose-800',       icon: XCircle,      dot: 'bg-rose-500'    },
  lulus:        { cls: 'bg-emerald-50 text-emerald-800', icon: CheckCircle2, dot: 'bg-emerald-500'  },
  info:         { cls: 'bg-blue-50 text-blue-800',       icon: Info,         dot: 'bg-blue-500'     },
};

// ── Panel notifikasi ──────────────────────────────
function NotifPanel({ notifs, loading, onRead, onReadAll, onClose, onGoRPH }) {
  const unread = notifs.filter(n => !n.dibaca).length;
  return (
    <div className="absolute right-0 top-14 w-80 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-stone-600" />
          <span className="font-semibold text-stone-800 text-sm">Notifikasi</span>
          {unread > 0 && <span className="px-1.5 py-0.5 bg-rose-500 text-white text-xs rounded-full font-bold leading-none">{unread}</span>}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && <button onClick={onReadAll} className="text-xs text-blue-700 hover:underline mr-2">Baca semua</button>}
          <button onClick={onClose} className="p-1 hover:bg-stone-200 rounded-lg"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-stone-400 text-sm">Memuatkan...</div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-sm">Tiada notifikasi</div>
        ) : notifs.map(n => {
          const cfg = NOTIF_CFG[n.jenis] || NOTIF_CFG.info;
          const Icon = cfg.icon;
          return (
            <div key={n.id}
              className={`px-4 py-3 border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition ${!n.dibaca ? 'bg-blue-50/40' : ''}`}
              onClick={() => { onRead(n.id); if (n.rph_id) onGoRPH(n.rph_id); onClose(); }}>
              <div className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.cls}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${!n.dibaca ? 'text-stone-800 font-medium' : 'text-stone-500'}`}>{n.mesej}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{new Date(n.dibuat_pada).toLocaleString('ms-MY')}</p>
                </div>
                {!n.dibaca && <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Modal Tukar Kata Laluan ───────────────────────
function TukarPasswordModal({ onClose }) {
  const [lama, setLama] = useState('');
  const [baru, setBaru] = useState('');
  const [sahkan, setSahkan] = useState('');
  const [showLama, setShowLama] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showSahkan, setShowSahkan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);

  const handleSubmit = async () => {
    setErr('');
    if (!lama || !baru || !sahkan) { setErr('Sila isi semua medan.'); return; }
    if (baru.length < 6) { setErr('Kata laluan baru mestilah sekurang-kurangnya 6 aksara.'); return; }
    if (baru !== sahkan) { setErr('Kata laluan baru dan pengesahan tidak sepadan.'); return; }
    if (baru === lama) { setErr('Kata laluan baru tidak boleh sama dengan kata laluan lama.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/tukar-password', { password_lama: lama, password_baru: baru });
      setOk(true);
    } catch (e) {
      setErr(e.response?.data?.error || 'Ralat menyimpan. Cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const PwInput = ({ value, onChange, show, onToggle, placeholder }) => (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pr-10"
      />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 transition">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200"
          style={{ background: 'linear-gradient(135deg,#15803d,#166534)' }}>
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-white" style={{ fontFamily: 'Lora,Georgia,serif' }}>
              Tukar Kata Laluan
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-white hover:bg-white/20 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {ok ? (
            /* Berjaya */
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-bold text-stone-800 text-lg mb-1">Berjaya!</h4>
              <p className="text-sm text-stone-600 mb-5">
                Kata laluan anda telah berjaya ditukar. Sila ingat kata laluan baru anda.
              </p>
              <button onClick={onClose}
                className="btn-primary w-full justify-center"
                style={{ background: 'linear-gradient(135deg,#15803d,#166534)' }}>
                Tutup
              </button>
            </div>
          ) : (
            /* Form */
            <div className="space-y-4">
              {err && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
                  <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {err}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Kata Laluan Semasa
                </label>
                <PwInput value={lama} onChange={setLama} show={showLama}
                  onToggle={() => setShowLama(p => !p)} placeholder="Masukkan kata laluan semasa" />
              </div>

              <div className="pt-1 border-t border-stone-100">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Kata Laluan Baru
                    <span className="text-xs text-stone-500 font-normal ml-1">(min. 6 aksara)</span>
                  </label>
                  <PwInput value={baru} onChange={setBaru} show={showBaru}
                    onToggle={() => setShowBaru(p => !p)} placeholder="Masukkan kata laluan baru" />
                </div>

                {/* Strength indicator */}
                {baru.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                          baru.length >= i * 3
                            ? baru.length >= 10 ? 'bg-emerald-500'
                              : baru.length >= 7 ? 'bg-amber-400'
                              : 'bg-rose-400'
                            : 'bg-stone-200'
                        }`} />
                      ))}
                    </div>
                    <p className="text-xs text-stone-500">
                      {baru.length < 6 ? '⚠️ Terlalu pendek' :
                       baru.length < 7 ? '🔒 Lemah' :
                       baru.length < 10 ? '🔒 Sederhana' : '🔒 Kuat'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Sahkan Kata Laluan Baru
                </label>
                <PwInput value={sahkan} onChange={setSahkan} show={showSahkan}
                  onToggle={() => setShowSahkan(p => !p)} placeholder="Masukkan semula kata laluan baru" />
                {sahkan.length > 0 && baru !== sahkan && (
                  <p className="text-xs text-rose-600 mt-1">⚠️ Kata laluan tidak sepadan</p>
                )}
                {sahkan.length > 0 && baru === sahkan && baru.length >= 6 && (
                  <p className="text-xs text-emerald-600 mt-1">✓ Kata laluan sepadan</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={onClose} className="btn-secondary flex-1 justify-center" disabled={loading}>
                  Batal
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow disabled:opacity-60 transition"
                  style={{ background: 'linear-gradient(135deg,#15803d,#166534)' }}>
                  <KeyRound className="w-4 h-4" />
                  {loading ? 'Menyimpan...' : 'Tukar Kata Laluan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dropdown Profil ───────────────────────────────
function ProfilDropdown({ user, onLogout, onTukarPassword }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition text-stone-700 max-w-[200px]">
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <User className="w-3.5 h-3.5 text-emerald-700" />
        </div>
        <span className="text-sm font-medium truncate hidden sm:block">{user.nama?.split(' ')[0]}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-60 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Info pengguna */}
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-700 font-bold text-sm">{user.nama?.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-stone-800 text-sm truncate">{user.nama}</div>
                <div className="text-xs text-stone-500 truncate">{user.username}</div>
              </div>
            </div>
            <div className="mt-2">
              <RoleBadge user={user} />
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button onClick={() => { setOpen(false); onTukarPassword(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition text-left">
              <KeyRound className="w-4 h-4 text-stone-500" />
              Tukar Kata Laluan
            </button>

            <div className="border-t border-stone-100 mt-1 pt-1">
              <button onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-700 hover:bg-rose-50 transition text-left">
                <LogOut className="w-4 h-4" />
                Log Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Header utama ──────────────────────────────────
export default function Header({ user, onLogout, onNav, activeNav, onGoRPH }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTukarPw, setShowTukarPw] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifRef = useRef(null);

  const navItems = {
    admin:     [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'admin', label: 'Pengurusan', icon: Settings }],
    gurubesar: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'calendar', label: 'Kalendar', icon: Calendar }],
    gpk:       [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'calendar', label: 'Kalendar', icon: Calendar }],
    guru:      [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'calendar', label: 'Kalendar', icon: Calendar }],
  };
  const items = navItems[user.peranan] || navItems.guru;

  // Polling kiraan notif
  useEffect(() => {
    if (user.peranan === 'admin') return;
    const fetch = async () => {
      try { const r = await api.get('/notif/count'); setUnread(r.data.bilangan); } catch {}
    };
    fetch();
    const iv = setInterval(fetch, 30000);
    return () => clearInterval(iv);
  }, [user]);

  // Klik luar tutup notif
  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openNotif = async () => {
    if (showNotif) { setShowNotif(false); return; }
    setShowNotif(true); setLoadingNotif(true);
    try { const r = await api.get('/notif'); setNotifs(r.data); }
    catch {} finally { setLoadingNotif(false); }
  };

  const handleRead = async (id) => {
    try {
      await api.patch(`/notif/${id}/baca`);
      setNotifs(ns => ns.map(n => n.id === id ? { ...n, dibaca: true } : n));
      setUnread(u => Math.max(0, u - 1));
    } catch {}
  };

  const handleReadAll = async () => {
    try {
      await api.patch('/notif/baca-semua');
      setNotifs(ns => ns.map(n => ({ ...n, dibaca: true })));
      setUnread(0);
    } catch {}
  };

  return (
    <>
      <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">

            {/* Logo + Nama Sekolah */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img src="/logo_sriti.jpg" alt="Logo SRITI"
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200 shadow-sm" />
              <div className="hidden sm:block">
                <div className="font-bold text-stone-800 text-sm leading-tight" style={{ fontFamily: 'Lora,Georgia,serif' }}>
                  SRITI Tahfiz Al-Ummah
                </div>
                <div className="text-xs text-emerald-700 font-semibold">Sistem e-RPH</div>
              </div>
              <div className="sm:hidden font-bold text-stone-800 text-sm" style={{ fontFamily: 'Lora,Georgia,serif' }}>
                e-RPH
              </div>
            </div>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {items.map(it => {
                const Icon = it.icon;
                return (
                  <button key={it.id} onClick={() => onNav(it.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeNav === it.id ? 'bg-emerald-700 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'}`}>
                    <Icon className="w-4 h-4" />{it.label}
                  </button>
                );
              })}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-1.5">

              {/* Loceng notifikasi */}
              {user.peranan !== 'admin' && (
                <div className="relative" ref={notifRef}>
                  <button onClick={openNotif}
                    className="relative p-2 rounded-lg hover:bg-stone-100 transition text-stone-600">
                    {unread > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  {showNotif && (
                    <NotifPanel notifs={notifs} loading={loadingNotif}
                      onRead={handleRead} onReadAll={handleReadAll}
                      onClose={() => setShowNotif(false)} onGoRPH={onGoRPH} />
                  )}
                </div>
              )}

              {/* Dropdown profil (nama + tukar password + logout) */}
              <ProfilDropdown
                user={user}
                onLogout={onLogout}
                onTukarPassword={() => setShowTukarPw(true)}
              />

              {/* Mobile nav toggle */}
              <button onClick={() => setShowMenu(!showMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition">
                <Menu className="w-5 h-5 text-stone-700" />
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {showMenu && (
            <div className="md:hidden mt-3 pt-3 border-t border-stone-200 flex gap-1 flex-wrap">
              {items.map(it => {
                const Icon = it.icon;
                return (
                  <button key={it.id} onClick={() => { onNav(it.id); setShowMenu(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeNav === it.id ? 'bg-emerald-700 text-white' : 'text-stone-600 bg-stone-100'}`}>
                    <Icon className="w-4 h-4" />{it.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Modal tukar password */}
      {showTukarPw && <TukarPasswordModal onClose={() => setShowTukarPw(false)} />}
    </>
  );
}
