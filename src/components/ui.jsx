import {
  FileText, Clock, ClipboardCheck, XCircle, CheckCircle2,
  Settings, Award, Shield, GraduationCap, Star, TrendingUp, AlertTriangle,
  Info, CheckCircle
} from 'lucide-react';

// ── Status RPH ──────────────────────────────────────
export const STATUS_CFG = {
  draf:          { label: 'Draf',          cls: 'bg-stone-100 text-stone-700 border-stone-300',   icon: FileText     },
  semakan_gpk:   { label: 'Semakan GPK',   cls: 'bg-amber-50 text-amber-800 border-amber-300',    icon: Clock        },
  disahkan_gpk:  { label: 'Disahkan GPK',  cls: 'bg-sky-50 text-sky-800 border-sky-300',          icon: ClipboardCheck },
  dikembalikan:  { label: 'Dikembalikan',  cls: 'bg-rose-50 text-rose-800 border-rose-300',       icon: XCircle      },
  lulus:         { label: 'Diluluskan',    cls: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: CheckCircle2 },
};

export const ROLE_CFG = {
  admin:          { label: 'Admin',          color: 'bg-violet-100 text-violet-800 border-violet-300', icon: Settings    },
  gurubesar:      { label: 'Guru Besar',     color: 'bg-amber-100 text-amber-800 border-amber-300',   icon: Award       },
  gpk_kurikulum:  { label: 'GPK Kurikulum',  color: 'bg-teal-100 text-teal-800 border-teal-300',      icon: ClipboardCheck },
  gpk_hem:        { label: 'GPK HEM',        color: 'bg-cyan-100 text-cyan-800 border-cyan-300',      icon: Shield      },
  guru:           { label: 'Guru',           color: 'bg-blue-100 text-blue-800 border-blue-300',      icon: GraduationCap },
};

export const MONTHS_MY = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
export const DAYS_MY   = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];

export const STATUS_DOT = {
  draf: 'bg-stone-400', semakan_gpk: 'bg-amber-500',
  disahkan_gpk: 'bg-sky-500', dikembalikan: 'bg-rose-500', lulus: 'bg-emerald-500',
};

export const KAT_CFG = {
  'Cemerlang':      { cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Star          },
  'Memuaskan':      { cls: 'bg-amber-100 text-amber-800 border-amber-300',       icon: TrendingUp    },
  'Perlu Perhatian':{ cls: 'bg-rose-100 text-rose-800 border-rose-300',          icon: AlertTriangle },
};

export function getRoleKey(user) {
  if (!user) return 'guru';
  if (user.peranan === 'gpk') return user.gpk_jenis === 'hem' ? 'gpk_hem' : 'gpk_kurikulum';
  return user.peranan;
}

export function getKategori(kadar) {
  if (kadar >= 75) return 'Cemerlang';
  if (kadar >= 50) return 'Memuaskan';
  return 'Perlu Perhatian';
}

// ── StatusBadge ─────────────────────────────────────
export function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.draf;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${c.cls}`}>
      <Icon className="w-3.5 h-3.5" />{c.label}
    </span>
  );
}

// ── RoleBadge ───────────────────────────────────────
export function RoleBadge({ user }) {
  const key = getRoleKey(user);
  const c = ROLE_CFG[key] || ROLE_CFG.guru;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${c.color}`}>
      <Icon className="w-3.5 h-3.5" />{c.label}
    </span>
  );
}

// ── Toast ────────────────────────────────────────────
export function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success: 'bg-emerald-700', warn: 'bg-amber-600', error: 'bg-rose-700', info: 'bg-blue-700' };
  const icons  = { success: CheckCircle, warn: AlertTriangle, error: XCircle, info: Info };
  const Icon = icons[toast.type] || icons.success;
  return (
    <div className="fixed top-20 right-4 z-[100] pointer-events-none animate-in fade-in slide-in-from-top-3">
      <div className={`${colors[toast.type] || colors.success} text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 max-w-sm`}>
        <Icon className="w-4 h-4 flex-shrink-0" />{toast.msg}
      </div>
    </div>
  );
}

// ── LoadingSpinner ───────────────────────────────────
export function Spinner({ text = 'Memuatkan...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-3 border-blue-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-500">{text}</p>
    </div>
  );
}

// ── ErrorBox ─────────────────────────────────────────
export function ErrorBox({ msg, onRetry }) {
  return (
    <div className="text-center py-12">
      <div className="text-rose-600 text-sm mb-3">{msg}</div>
      {onRetry && <button onClick={onRetry} className="btn-secondary text-sm px-4 py-2">Cuba Semula</button>}
    </div>
  );
}

// ── RPHCard ──────────────────────────────────────────
export function RPHCard({ rph, onClick, showGuru }) {
  return (
    <div onClick={onClick}
      className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-stone-800 truncate text-sm group-hover:text-blue-700 transition">{rph.tajuk}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{rph.subjek} • {rph.kelas} • {rph.tarikh?.slice(0,10)}</p>
          {showGuru && <p className="text-xs text-blue-700 font-medium mt-0.5">{rph.guru_nama}</p>}
        </div>
        <StatusBadge status={rph.status} />
      </div>
    </div>
  );
}

// ── ConfirmDialog ────────────────────────────────────
export function ConfirmDialog({ title, msg, onConfirm, onCancel, danger }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className={`w-6 h-6 ${danger ? 'text-rose-600' : 'text-amber-600'}`} />
          <h3 className="font-bold text-stone-800">{title}</h3>
        </div>
        <p className="text-sm text-stone-600 mb-5">{msg}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm px-4 py-2">Batal</button>
          <button onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
            Teruskan
          </button>
        </div>
      </div>
    </div>
  );
}
