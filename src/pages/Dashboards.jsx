import { useState, useEffect, useCallback } from 'react';
import {
  Plus, FileText, Clock, CheckCircle2, XCircle, TrendingUp,
  Star, AlertTriangle, ClipboardCheck, FileCheck, Users, Eye,
  Info, Shield, Trash2, Edit3, UserPlus, Lock, Unlock, Check,
  X, Key, GraduationCap, Award, Settings, EyeOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { StatusBadge, RoleBadge, RPHCard, Spinner, ErrorBox, ConfirmDialog, KAT_CFG, getKategori, ROLE_CFG } from '../components/ui';
import api from '../lib/api';

// ═══════════════════════════════════════════════════
// GURU DASHBOARD
// ═══════════════════════════════════════════════════
export function GuruDashboard({ user, onNew, onView, onEdit }) {
  const [rphList, setRphList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try { const res = await api.get('/rph'); setRphList(res.data); }
    catch { setErr('Gagal memuatkan data RPH.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = {
    total: rphList.length,
    semakan: rphList.filter(r => ['semakan_gpk','disahkan_gpk'].includes(r.status)).length,
    lulus: rphList.filter(r => r.status === 'lulus').length,
    balik: rphList.filter(r => r.status === 'dikembalikan').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Lora,Georgia,serif' }}>
            Selamat Datang, {user.nama?.split(' ').slice(-1)[0]}
          </h2>
          <p className="text-sm text-stone-600">Urus dan pantau RPH anda</p>
        </div>
        <button onClick={onNew} className="btn-primary">
          <Plus className="w-4 h-4" />RPH Baru
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[['Jumlah RPH', s.total, 'from-blue-50 to-blue-100 border-blue-200 text-blue-900', FileText],
          ['Dalam Semakan', s.semakan, 'from-amber-50 to-amber-100 border-amber-200 text-amber-900', Clock],
          ['Diluluskan', s.lulus, 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900', CheckCircle2],
          ['Dikembalikan', s.balik, 'from-rose-50 to-rose-100 border-rose-200 text-rose-900', XCircle],
        ].map(([l, v, c, Icon]) => (
          <div key={l} className={`bg-gradient-to-br ${c} border rounded-2xl p-4`}>
            <Icon className="w-5 h-5 mb-2 opacity-70" />
            <div className="text-3xl font-bold">{v}</div>
            <div className="text-xs opacity-70 font-medium mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-stone-800 mb-3">RPH Saya</h3>
        {loading ? <Spinner /> : err ? <ErrorBox msg={err} onRetry={load} /> : rphList.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada RPH. Klik "RPH Baru" untuk mula.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rphList.map(r => (
              <RPHCard key={r.id} rph={r}
                onClick={() => ['draf','dikembalikan'].includes(r.status) ? onEdit(r) : onView(r)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// GPK KURIKULUM DASHBOARD
// ═══════════════════════════════════════════════════
export function GPKKurikulumDashboard({ user, onView }) {
  const [rphList, setRphList] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rphRes, statsRes] = await Promise.all([api.get('/rph'), api.get('/rph/stats')]);
      setRphList(rphRes.data); setStats(statsRes.data);
    } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const perlu = rphList.filter(r => r.status === 'semakan_gpk');
  const sejarah = rphList.filter(r => ['disahkan_gpk','lulus','dikembalikan'].includes(r.status));
  const chartData = stats.map(p => {
    const kadar = p.total > 0 ? Math.round((p.lulus / p.total) * 100) : 0;
    return { name: p.nama?.split(' ').pop() || p.username, Pematuhan: kadar };
  });
  const prestasiRows = stats.map(p => {
    const kadar = p.total > 0 ? Math.round((Number(p.lulus) / Number(p.total)) * 100) : 0;
    return { ...p, kadar, kat: getKategori(kadar) };
  });

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Lora,Georgia,serif' }}>Panel GPK Kurikulum</h2>
          <p className="text-sm text-stone-600">Semak RPH guru dan pantau pematuhan</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border bg-teal-100 text-teal-800 border-teal-300">
          <ClipboardCheck className="w-3.5 h-3.5" />Kurikulum
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[['Perlu Semakan', perlu.length, 'from-amber-50 to-amber-100 border-amber-200 text-amber-900', Clock],
          ['Disahkan', rphList.filter(r => r.status === 'disahkan_gpk').length, 'from-sky-50 to-sky-100 border-sky-200 text-sky-900', ClipboardCheck],
          ['Diluluskan', rphList.filter(r => r.status === 'lulus').length, 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900', CheckCircle2],
          ['Dikembalikan', rphList.filter(r => r.status === 'dikembalikan').length, 'from-rose-50 to-rose-100 border-rose-200 text-rose-900', XCircle],
        ].map(([l, v, c, Icon]) => (
          <div key={l} className={`bg-gradient-to-br ${c} border rounded-2xl p-4`}>
            <Icon className="w-5 h-5 mb-2 opacity-70" />
            <div className="text-3xl font-bold">{v}</div>
            <div className="text-xs opacity-70 font-medium mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-5">
        <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-700" />Perlu Semakan ({perlu.length})
        </h3>
        {loading ? <Spinner /> : perlu.length === 0
          ? <div className="text-center py-8 text-stone-400 text-sm">Tiada RPH perlu disemak.</div>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{perlu.map(r => <RPHCard key={r.id} rph={r} onClick={() => onView(r)} showGuru />)}</div>
        }
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-5 mb-5">
          <h3 className="font-semibold text-stone-800 mb-1 text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-teal-700" />Kadar Pematuhan RPH per Guru</h3>
          <p className="text-xs text-stone-500 mb-4">Peratus RPH yang diluluskan</p>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#57534e' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#57534e' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e7e5e4', fontSize: 12 }} />
                <Bar dataKey="Pematuhan" radius={[5, 5, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.Pematuhan >= 75 ? '#0d9488' : e.Pematuhan >= 50 ? '#d97706' : '#e11d48'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Jadual prestasi */}
      <div className="card p-4 mb-5">
        <h3 className="font-semibold text-stone-800 mb-3">Prestasi Pematuhan Guru</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wider text-stone-500">
              {['Guru','Subjek','Total','Lulus','Kadar','Kategori'].map(h => <th key={h} className="py-2 px-2 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {prestasiRows.map(p => {
                const cfg = KAT_CFG[p.kat] || KAT_CFG['Perlu Perhatian'];
                const Icon = cfg.icon;
                return (
                  <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-2 font-medium text-stone-800">{p.nama?.replace(/^Cikgu /, '')}</td>
                    <td className="py-3 px-2 text-stone-600">{p.subjek}</td>
                    <td className="py-3 px-2 text-center">{p.total}</td>
                    <td className="py-3 px-2 text-center">{p.lulus}</td>
                    <td className="py-3 px-2 text-center font-bold">{p.kadar}%</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />{p.kat}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-stone-800 mb-3">Sejarah Semakan</h3>
        {loading ? <Spinner /> : sejarah.length === 0
          ? <div className="text-center py-8 text-stone-400 text-sm">Tiada rekod.</div>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{sejarah.map(r => <RPHCard key={r.id} rph={r} onClick={() => onView(r)} showGuru />)}</div>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// GPK HEM DASHBOARD
// ═══════════════════════════════════════════════════
export function GPKHEMDashboard({ user, onView }) {
  const [rphList, setRphList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rph').then(r => setRphList(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Lora,Georgia,serif' }}>Panel GPK HEM</h2>
          <p className="text-sm text-stone-600">Lihat rekod RPH guru — akses baca sahaja</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border bg-cyan-100 text-cyan-800 border-cyan-300">
          <Shield className="w-3.5 h-3.5" />HEM — Baca Sahaja
        </span>
      </div>
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-700 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-cyan-800">Sebagai <strong>GPK HEM</strong>, anda boleh melihat semua RPH untuk tujuan pemantauan. Semakan dan kelulusan adalah dalam bidang kuasa <strong>GPK Kurikulum</strong> dan <strong>Guru Besar</strong>.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[['Jumlah RPH', rphList.length, 'from-stone-50 to-stone-100 border-stone-200 text-stone-800', FileText],
          ['Diluluskan', rphList.filter(r => r.status === 'lulus').length, 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900', CheckCircle2],
          ['Dalam Semakan', rphList.filter(r => ['semakan_gpk','disahkan_gpk'].includes(r.status)).length, 'from-amber-50 to-amber-100 border-amber-200 text-amber-900', Clock],
          ['Dikembalikan', rphList.filter(r => r.status === 'dikembalikan').length, 'from-rose-50 to-rose-100 border-rose-200 text-rose-900', XCircle],
        ].map(([l, v, c, Icon]) => (
          <div key={l} className={`bg-gradient-to-br ${c} border rounded-2xl p-4`}>
            <Icon className="w-5 h-5 mb-2 opacity-70" />
            <div className="text-3xl font-bold">{v}</div>
            <div className="text-xs opacity-70 font-medium mt-0.5">{l}</div>
          </div>
        ))}
      </div>
      <div className="card p-4">
        <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-cyan-700" />Semua RPH (Lihat Sahaja)</h3>
        {loading ? <Spinner /> : rphList.length === 0
          ? <div className="text-center py-10 text-stone-400 text-sm">Tiada rekod RPH.</div>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{rphList.map(r => <RPHCard key={r.id} rph={r} onClick={() => onView(r)} showGuru />)}</div>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// GURU BESAR DASHBOARD
// ═══════════════════════════════════════════════════
export function GuruBesarDashboard({ onView }) {
  const [rphList, setRphList] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([api.get('/rph'), api.get('/rph/stats')]);
      setRphList(r.data); setStats(s.data);
    } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const perluLulus = rphList.filter(r => r.status === 'disahkan_gpk');
  const chartData = stats.map(p => {
    const kadar = p.total > 0 ? Math.round((Number(p.lulus) / Number(p.total)) * 100) : 0;
    return { name: p.nama?.split(' ').pop() || p.username, Pematuhan: kadar };
  });
  const prestasiRows = stats.map(p => {
    const kadar = p.total > 0 ? Math.round((Number(p.lulus) / Number(p.total)) * 100) : 0;
    return { ...p, kadar, kat: getKategori(kadar) };
  });
  const pieData = [
    { name: 'Diluluskan', value: rphList.filter(r => r.status === 'lulus').length },
    { name: 'Dalam Proses', value: rphList.filter(r => ['semakan_gpk','disahkan_gpk'].includes(r.status)).length },
    { name: 'Dikembalikan', value: rphList.filter(r => r.status === 'dikembalikan').length },
    { name: 'Draf', value: rphList.filter(r => r.status === 'draf').length },
  ].filter(d => d.value > 0);
  const PIE_COLORS = ['#059669','#d97706','#e11d48','#78716c'];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Lora,Georgia,serif' }}>Panel Guru Besar</h2>
        <p className="text-sm text-stone-600">Kelulusan akhir dan pemantauan prestasi</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[['Perlu Kelulusan', perluLulus.length, 'from-amber-50 to-amber-100 border-amber-200 text-amber-900', FileCheck],
          ['Diluluskan', rphList.filter(r => r.status === 'lulus').length, 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900', CheckCircle2],
          ['Guru Aktif', stats.length, 'from-blue-50 to-blue-100 border-blue-200 text-blue-900', Users],
          ['Jumlah RPH', rphList.length, 'from-stone-50 to-stone-100 border-stone-200 text-stone-800', FileText],
        ].map(([l, v, c, Icon]) => (
          <div key={l} className={`bg-gradient-to-br ${c} border rounded-2xl p-4`}>
            <Icon className="w-5 h-5 mb-2 opacity-70" />
            <div className="text-3xl font-bold">{v}</div>
            <div className="text-xs opacity-70 font-medium mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {perluLulus.length > 0 && (
        <div className="card border-amber-200 p-4 mb-5">
          <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2"><FileCheck className="w-4 h-4 text-amber-700" />Perlu Kelulusan ({perluLulus.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{perluLulus.map(r => <RPHCard key={r.id} rph={r} onClick={() => onView(r)} showGuru />)}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="md:col-span-2 card p-5">
          <h3 className="font-semibold text-stone-800 mb-1 text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-700" />Kadar Pematuhan RPH</h3>
          <p className="text-xs text-stone-500 mb-4">% RPH diluluskan per guru</p>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#57534e' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#57534e' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e7e5e4', fontSize: 12 }} />
                <Bar dataKey="Pematuhan" radius={[5, 5, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.Pematuhan >= 75 ? '#059669' : e.Pematuhan >= 50 ? '#d97706' : '#e11d48'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-stone-800 mb-1 text-sm">Status RPH Keseluruhan</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ value }) => value > 0 ? value : ''} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e7e5e4', fontSize: 11 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-stone-800 mb-3">Prestasi Guru</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wider text-stone-500">
              {['Guru','Subjek','Total','Lulus','Kadar','Kategori'].map(h => <th key={h} className="py-2 px-2 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {prestasiRows.map(p => {
                const cfg = KAT_CFG[p.kat] || KAT_CFG['Perlu Perhatian'];
                const Icon = cfg.icon;
                return (
                  <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-2 font-medium text-stone-800">{p.nama?.replace(/^Cikgu /, '')}</td>
                    <td className="py-3 px-2 text-stone-600">{p.subjek}</td>
                    <td className="py-3 px-2 text-center">{p.total}</td>
                    <td className="py-3 px-2 text-center">{p.lulus}</td>
                    <td className="py-3 px-2 text-center font-bold">{p.kadar}%</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />{p.kat}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════
// USER FORM — komponen berasingan (elak focus lost)
// ═══════════════════════════════════════════════════
function UserForm({ editUser, onClose, onSaved, modal }) {
  const emptyForm = { username: '', password: '', nama: '', jawatan: '', peranan: 'guru', gpk_jenis: 'kurikulum', subjek: '', kelas: '', aktif: true };
  const [form, setForm] = useState(editUser ? {
    username: editUser.username,
    password: '',
    nama: editUser.nama || '',
    jawatan: editUser.jawatan || '',
    peranan: editUser.peranan || 'guru',
    gpk_jenis: editUser.gpk_jenis || 'kurikulum',
    subjek: editUser.subjek || '',
    kelas: Array.isArray(editUser.kelas) ? editUser.kelas.join(', ') : (editUser.kelas || ''),
    aktif: editUser.aktif !== false,
  } : emptyForm);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const up = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const upV = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setErr('');
    if (!form.nama || !form.peranan) { setErr('Sila isi semua medan wajib.'); return; }
    if (!editUser && !form.password) { setErr('Kata laluan diperlukan untuk pengguna baru.'); return; }
    if (!editUser && !form.username) { setErr('Nama pengguna diperlukan.'); return; }
    setSaving(true);
    try {
      if (editUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.patch(`/users/${editUser.id}`, payload);
      } else {
        await api.post('/users', form);
      }
      onSaved();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || 'Ralat menyimpan.');
    } finally { setSaving(false); }
  };

  const L = 'block text-xs font-semibold text-stone-700 mb-1';
  const I = 'input';

  const inner = (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-stone-200" style={{ background: 'linear-gradient(135deg,#1e40af,#1e3a8a)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white" style={{ fontFamily: 'Lora,Georgia,serif' }}>{editUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
          {modal && <button onClick={onClose} className="p-1 text-white hover:bg-white/20 rounded-lg"><X className="w-4 h-4" /></button>}
        </div>
      </div>
      <div className="p-5 space-y-4 overflow-y-auto" style={modal ? { maxHeight: 'calc(90vh - 140px)' } : {}}>
        {err && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!editUser && (
            <div>
              <label className={L}>Nama Pengguna *</label>
              <input className={`${I} font-mono`} value={form.username} onChange={up('username')} placeholder="cth: guru4" />
            </div>
          )}
          <div>
            <label className={L}>{editUser ? 'Kata Laluan Baru (kosong = tidak tukar)' : 'Kata Laluan *'}</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className={`${I} pr-10`} value={form.password} onChange={up('password')} placeholder="••••••" />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className={L}>Nama Penuh *</label>
          <input className={I} value={form.nama} onChange={up('nama')} placeholder="cth: Cikgu Ahmad bin Ali" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={L}>Peranan *</label>
            <select className={`${I} bg-white`} value={form.peranan} onChange={up('peranan')}>
              <option value="guru">Guru</option>
              <option value="gpk">GPK</option>
              <option value="gurubesar">Guru Besar</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.peranan === 'gpk' ? (
            <div>
              <label className={L}>Jenis GPK *</label>
              <select className={`${I} bg-white`} value={form.gpk_jenis} onChange={up('gpk_jenis')}>
                <option value="kurikulum">GPK Kurikulum</option>
                <option value="hem">GPK HEM</option>
              </select>
              <p className="text-xs text-stone-500 mt-1">{form.gpk_jenis === 'hem' ? '⚠️ GPK HEM — lihat sahaja.' : '✅ GPK Kurikulum — boleh semak RPH.'}</p>
            </div>
          ) : (
            <div>
              <label className={L}>Jawatan / Gelaran</label>
              <input className={I} value={form.jawatan} onChange={up('jawatan')} placeholder="cth: Guru Matematik" />
            </div>
          )}
        </div>
        {form.peranan === 'guru' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className={L}>Mata Pelajaran</label>
              <input className={I} value={form.subjek} onChange={up('subjek')} placeholder="cth: Matematik" />
            </div>
            <div>
              <label className={L}>Kelas (pisah dengan koma)</label>
              <input className={I} value={form.kelas} onChange={up('kelas')} placeholder="cth: 5 Amanah, 5 Bestari" />
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 pt-2">
          <button type="button" onClick={() => upV('aktif', !form.aktif)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.aktif ? 'bg-emerald-500' : 'bg-stone-300'}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${form.aktif ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm text-stone-700">{form.aktif ? 'Akaun Aktif' : 'Akaun Tidak Aktif'}</span>
        </div>
      </div>
      <div className="px-5 py-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
        {modal && <button onClick={onClose} className="btn-secondary text-sm">Batal</button>}
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          <Check className="w-4 h-4" />{saving ? 'Menyimpan...' : editUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
        </button>
      </div>
    </div>
  );

  if (modal) return <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="w-full max-w-lg">{inner}</div></div>;
  return inner;
}

// ═══════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════
export function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('senarai');
  const [editUser, setEditUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast] = useState(null);

  const showMsg = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/users'); setUsers(res.data); }
    catch { showMsg('Gagal memuatkan senarai pengguna.', 'error'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleEdit = (u) => { setEditUser(u); setShowForm(true); setTab('senarai'); };

  const handleToggle = async (u) => {
    try {
      await api.patch(`/users/${u.id}`, { aktif: !u.aktif });
      showMsg(u.aktif ? 'Akaun dinyahaktifkan.' : 'Akaun diaktifkan.', 'info');
      loadUsers();
    } catch { showMsg('Gagal mengemas kini.', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${confirmDel.id}`);
      showMsg('Pengguna dipadam.');
      setConfirmDel(null); loadUsers();
    } catch (e) {
      showMsg(e.response?.data?.error || 'Gagal memadam.', 'error');
      setConfirmDel(null);
    }
  };

  const byRole = (role) => users.filter(u => u.peranan === role);

  const TABS = [
    { id: 'senarai', label: 'Senarai Pengguna', icon: Users },
    { id: 'tambah', label: 'Tambah Pengguna', icon: UserPlus },
    { id: 'akses', label: 'Kawalan Akses', icon: Key },
  ];

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-4 z-[100]">
          <div className={`px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-xl ${toast.type === 'error' ? 'bg-rose-600' : toast.type === 'info' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
            {toast.msg}
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmDialog title="Padam Pengguna?" msg={`Pengguna "${confirmDel.nama}" akan dipadam secara kekal.`}
          onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} danger />
      )}

      {showForm && (
        <UserForm
          editUser={editUser}
          modal
          onClose={() => { setShowForm(false); setEditUser(null); }}
          onSaved={() => { loadUsers(); showMsg(editUser ? 'Pengguna dikemaskini.' : 'Pengguna baru ditambah.'); }}
        />
      )}

      <div className="mb-5">
        <h2 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Lora,Georgia,serif' }}>Modul Pentadbiran</h2>
        <p className="text-sm text-stone-600">Urus data pengguna dan kawalan akses sistem</p>
      </div>

      <div className="flex gap-1 mb-5 bg-stone-100 p-1 rounded-xl w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'tambah') { setEditUser(null); setShowForm(false); } }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-stone-600 hover:text-stone-800'}`}>
              <Icon className="w-4 h-4" />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'senarai' && (
        <div className="space-y-4">
          {loading ? <Spinner /> : ['admin','gurubesar','gpk','guru'].map(role => {
            if (role === 'gpk') {
              const kList = users.filter(u => u.peranan === 'gpk' && u.gpk_jenis !== 'hem');
              const hList = users.filter(u => u.peranan === 'gpk' && u.gpk_jenis === 'hem');
              return (
                <div key="gpk" className="space-y-3">
                  {[{ list: kList, jenis: 'kurikulum', label: 'GPK Kurikulum', cfg: ROLE_CFG.gpk_kurikulum },
                    { list: hList, jenis: 'hem', label: 'GPK HEM', cfg: ROLE_CFG.gpk_hem }]
                    .filter(g => g.list.length > 0).map(({ list, jenis, label, cfg }) => {
                      const RIcon = cfg.icon;
                      return (
                        <div key={jenis} className="card overflow-hidden">
                          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.color}`}><RIcon className="w-3.5 h-3.5" />{label}</span>
                            <span className="text-sm text-stone-600 font-medium">({list.length})</span>
                          </div>
                          <UserRows list={list} onEdit={handleEdit} onToggle={handleToggle} onDelete={setConfirmDel} />
                        </div>
                      );
                    })}
                </div>
              );
            }
            const list = byRole(role);
            if (!list.length) return null;
            const cfg = role === 'admin' ? ROLE_CFG.admin : role === 'gurubesar' ? ROLE_CFG.gurubesar : ROLE_CFG.guru;
            const RIcon = cfg.icon;
            return (
              <div key={role} className="card overflow-hidden">
                <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.color}`}><RIcon className="w-3.5 h-3.5" />{cfg.label}</span>
                  <span className="text-sm text-stone-600 font-medium">({list.length})</span>
                </div>
                <UserRows list={list} onEdit={handleEdit} onToggle={handleToggle} onDelete={setConfirmDel} />
              </div>
            );
          })}
        </div>
      )}

      {tab === 'tambah' && (
        <UserForm editUser={null} modal={false}
          onClose={() => setTab('senarai')}
          onSaved={() => { loadUsers(); showMsg('Pengguna baru ditambah.'); setTab('senarai'); }} />
      )}

      {tab === 'akses' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>Jadual ini menunjukkan kebenaran akses bagi setiap peranan. Peranan ditetapkan semasa tambah atau edit pengguna.</div>
          </div>
          {[
            { key: 'admin', label: 'Admin', kebenaran: ['Urus semua pengguna', 'Tambah/edit/padam akaun', 'Tetapkan peranan & jenis GPK', 'Kawalan akses sistem'] },
            { key: 'gurubesar', label: 'Guru Besar', kebenaran: ['Lulus/kembalikan RPH (peringkat akhir)', 'Dashboard prestasi guru', 'Lihat semua RPH', 'Export PDF', 'Kalendar RPH'] },
            { key: 'gpk_kurikulum', label: 'GPK Kurikulum', kebenaran: ['Semak & sahkan RPH guru', 'Kembalikan RPH untuk pindaan', 'Dashboard pematuhan guru', 'Kalendar RPH', 'Export PDF'] },
            { key: 'gpk_hem', label: 'GPK HEM', kebenaran: ['Lihat semua RPH (baca sahaja)', 'Tiada akses semakan RPH', 'Lihat status pematuhan', 'Kalendar RPH'] },
            { key: 'guru', label: 'Guru', kebenaran: ['Buat & edit RPH sendiri', 'Hantar RPH untuk semakan', 'Lihat status RPH sendiri', 'Kalendar RPH peribadi', 'Export PDF RPH sendiri'] },
          ].map(({ key, label, kebenaran }) => {
            const cfg = ROLE_CFG[key] || ROLE_CFG.guru;
            const RIcon = cfg.icon;
            return (
              <div key={key} className="card overflow-hidden">
                <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.color}`}><RIcon className="w-3.5 h-3.5" />{label}</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {kebenaran.map(k => {
                    const isNo = k.startsWith('Tiada');
                    return (
                      <div key={k} className={`flex items-center gap-2 text-sm ${isNo ? 'text-stone-400' : 'text-stone-700'}`}>
                        {isNo ? <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                        {k}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function UserRows({ list, onEdit, onToggle, onDelete }) {
  return (
    <div className="divide-y divide-stone-100">
      {list.map(u => (
        <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-stone-50 transition">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${u.aktif ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-500'}`}>
              {u.nama?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <div className={`font-semibold text-sm ${!u.aktif ? 'text-stone-400' : 'text-stone-800'}`}>{u.nama}</div>
              <div className="text-xs text-stone-500 flex items-center gap-2">
                <span className="font-mono bg-stone-100 px-1 rounded">{u.username}</span>
                {u.jawatan && <span>• {u.jawatan}</span>}
                {u.subjek && <span>• {u.subjek}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
              {u.aktif ? 'Aktif' : 'Tidak Aktif'}
            </span>
            <button onClick={() => onEdit(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Edit3 className="w-3.5 h-3.5" /></button>
            <button onClick={() => onToggle(u)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition">
              {u.aktif ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            {u.username !== 'admin' && <button onClick={() => onDelete(u)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition"><Trash2 className="w-3.5 h-3.5" /></button>}
          </div>
        </div>
      ))}
    </div>
  );
}

