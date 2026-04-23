import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const [un, setUn] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!un || !pw) { setErr('Sila isi nama pengguna dan kata laluan.'); return; }
    setLoading(true); setErr('');
    try {
      await login(un.trim(), pw);
    } catch (e) {
      setErr(e.response?.data?.error || 'Ralat sambungan. Pastikan server berjalan.');
    } finally {
      setLoading(false);
    }
  };

  const demos = [
    { role: 'Admin',         u: 'admin',     p: 'admin123', color: 'text-violet-700' },
    { role: 'Guru Besar',    u: 'gurubesar', p: 'gb123',    color: 'text-amber-700'  },
    { role: 'GPK Kurikulum', u: 'gpk1',      p: 'gpk123',   color: 'text-teal-700'   },
    { role: 'GPK HEM',       u: 'gpk2',      p: 'gpk456',   color: 'text-cyan-700'   },
    { role: 'Guru',          u: 'guru1',     p: 'g123',     color: 'text-blue-700'   },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 40%,#d1fae5 100%)' }}>
      <div className="w-full max-w-md">

        {/* Logo & Nama Sekolah */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/logo_sriti.jpg"
              alt="Logo SRITI"
              className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white"
            />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight" style={{ fontFamily: 'Lora,Georgia,serif' }}>
            SRITI Tahfiz Al-Ummah
          </h1>
          <p className="text-sm text-emerald-700 font-semibold mt-0.5">Sekolah Rendah Integrasi Teras Islam</p>
          <div className="mt-2 inline-block px-3 py-1 bg-emerald-700 text-white text-xs font-bold rounded-full tracking-wider">
            SISTEM e-RPH
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nama Pengguna</label>
              <input value={un} onChange={e => setUn(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handle()}
                className="input" placeholder="cth: guru1" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Kata Laluan</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={pw}
                  onChange={e => setPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handle()}
                  className="input pr-10" placeholder="••••••" />
                <button onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 transition">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {err && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {err}
              </div>
            )}

            <button onClick={handle} disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#15803d,#166534)' }}>
              {loading ? 'Memproses...' : 'Log Masuk'}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-stone-200">
            <p className="text-xs font-semibold text-stone-600 mb-2">Akaun Demo (klik untuk isi):</p>
            <div className="grid grid-cols-1 gap-1">
              {demos.map(d => (
                <button key={d.u} onClick={() => { setUn(d.u); setPw(d.p); setErr(''); }}
                  className="flex items-center justify-between text-xs px-3 py-1.5 bg-stone-50 hover:bg-stone-100 rounded-lg transition text-left">
                  <span className={`font-bold ${d.color}`}>{d.role}</span>
                  <span className="font-mono text-stone-500">{d.u} / {d.p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          Sistem e-RPH © 2026 • SRITI Tahfiz Al-Ummah
        </p>
      </div>
    </div>
  );
}
