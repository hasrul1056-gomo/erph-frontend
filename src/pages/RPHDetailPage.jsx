import { useState } from 'react';
import { ArrowLeft, Download, CheckCircle2, XCircle, Award, BookOpen, Target, Users, Printer } from 'lucide-react';
import { StatusBadge } from '../components/ui';
import { exportPDF } from '../lib/exportPdf';

const TQS_SUBJECTS = ['TQS','Tilawah','Tahfiz'];
const isTQS = (subjek) => TQS_SUBJECTS.some(s => (subjek||'').toUpperCase().includes(s.toUpperCase()));

export default function RPHDetailPage({ rph, user, onBack, onAction }) {
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const tqs = isTQS(rph.subjek);

  const canSemak = user.peranan === 'gpk' && user.gpk_jenis !== 'hem' && rph.status === 'semakan_gpk';
  const canLulus = user.peranan === 'gurubesar' && rph.status === 'disahkan_gpk';

  const Sec = ({ title, val, icon: Icon, className = '' }) => (
    <div className={`mb-3 ${className}`}>
      <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}{title}
      </h3>
      <div className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed bg-stone-50 rounded-lg px-3 py-2 min-h-[32px]">
        {val || <span className="text-stone-400 italic text-xs">—</span>}
      </div>
    </div>
  );

  const handleAction = async (tindakan) => {
    setLoading(true);
    try { await onAction(tindakan, catatan); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-4 transition">
        <ArrowLeft className="w-4 h-4" />Kembali
      </button>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200" style={{ background: 'linear-gradient(135deg,#1a3a5c,#2a9d8f)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs text-teal-200 font-semibold tracking-wider uppercase mb-1">
                SRITI Tahfiz Al-Ummah • {tqs ? 'RPH TQS (Mingguan)' : 'Rancangan Pengajaran Harian'}
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Lora,Georgia,serif' }}>
                {rph.tajuk}
              </h2>
              <p className="text-sm text-teal-100 mt-1">
                {rph.guru_nama} • {rph.subjek} • {rph.kelas}
              </p>
            </div>
            <StatusBadge status={rph.status} />
          </div>
        </div>

        <div className="p-6">
          {/* Info grid */}
          <div className={`grid gap-3 mb-5 ${tqs ? 'grid-cols-3 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
            {[
              ['Tarikh', rph.tarikh?.slice(0,10)],
              ['Masa', rph.masa],
              ['Subjek', rph.subjek],
              ['Kelas', rph.kelas],
              ...(tqs ? [['Kelas/Halaqah', rph.kelas]] : []),
            ].filter((_, i, arr) => {
              // deduplicate kelas for TQS
              return !tqs || i !== 3;
            }).map(([l, v]) => (
              <div key={l} className="bg-teal-50 border border-teal-100 rounded-xl px-3 py-2.5">
                <div className="text-xs text-teal-600 uppercase tracking-wide font-semibold">{l}</div>
                <div className="font-semibold text-stone-800 text-sm mt-0.5">{v || '—'}</div>
              </div>
            ))}
          </div>

          {/* ── TQS FORMAT ── */}
          {tqs ? (
            <div className="space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Sec title="Nama Surah" val={rph.tajuk} icon={BookOpen} />
                <Sec title="Nombor Ayat" val={rph.nombor_ayat} />
              </div>
              <Sec title="Objektif Pembelajaran" val={rph.objektif} icon={Target} />
              <Sec title="Aktiviti PdPc" val={rph.aktiviti} icon={Users} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Sec title="Nilai Kaffah" val={rph.nilai_murni} />
                <Sec title="Tahap Penguasaan" val={rph.tahap_penguasaan} />
              </div>
              {rph.refleksi && <Sec title="Refleksi / Impak" val={rph.refleksi} />}
            </div>
          ) : (
            /* ── RPH BIASA FORMAT ── */
            <div className="space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Sec title="Tema" val={rph.tema} icon={BookOpen} />
                <Sec title="Unit/Topik" val={rph.tajuk} />
              </div>
              <Sec title="Standard Kandungan" val={rph.standard_kandungan} icon={Target} />
              <Sec title="Standard Pembelajaran" val={rph.standard_pembelajaran} icon={Target} />
              <Sec title="Objektif Pembelajaran" val={rph.objektif} icon={Target} />
              <Sec title="Aktiviti PdPc" val={rph.aktiviti} icon={Users} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Sec title="Aktiviti PAK-21" val={rph.pak21} />
                <Sec title="KBAT" val={rph.kbat} />
              </div>
              <Sec title="Bahan Bantu Mengajar (BBM)" val={rph.bbm} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Sec title="Elemen Merentas Kurikulum (EMK)" val={rph.ebk} />
                <Sec title="Nilai Murni / Nilai Kaffah" val={rph.nilai_murni} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Sec title="Tahap Penguasaan" val={rph.tahap_penguasaan} />
                <Sec title="Pentaksiran Bilik Darjah" val={rph.penilaian} />
              </div>
              {rph.refleksi && <Sec title="Refleksi / Impak" val={rph.refleksi} />}
            </div>
          )}

          {/* Catatan semakan */}
          {rph.catatan_gpk && (
            <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl">
              <div className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-1">Catatan GPK Kurikulum</div>
              <p className="text-sm text-teal-900">{rph.catatan_gpk}</p>
            </div>
          )}
          {rph.catatan_gb && (
            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Catatan Guru Besar</div>
              <p className="text-sm text-amber-900">{rph.catatan_gb}</p>
            </div>
          )}
        </div>

        {/* Panel tindakan semak/lulus */}
        {(canSemak || canLulus) && (
          <div className="px-6 py-5 bg-stone-50 border-t border-stone-200">
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              Catatan {canSemak ? 'GPK Kurikulum' : 'Guru Besar'}
            </label>
            <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3}
              placeholder="Tulis ulasan, cadangan atau catatan..." className="textarea" />
            <div className="flex flex-wrap justify-end gap-2 mt-3">
              <button onClick={() => handleAction('kembalikan')} disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-700 bg-white border border-rose-300 rounded-xl hover:bg-rose-50 transition disabled:opacity-60">
                <XCircle className="w-4 h-4" />Kembalikan kepada Guru
              </button>
              {canSemak && (
                <button onClick={() => handleAction('sahkan')} disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
                  <CheckCircle2 className="w-4 h-4" />{loading ? 'Memproses...' : 'Sahkan RPH'}
                </button>
              )}
              {canLulus && (
                <button onClick={() => handleAction('lulus')} disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#b45309,#92400e)' }}>
                  <Award className="w-4 h-4" />{loading ? 'Memproses...' : 'Luluskan RPH'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Export */}
        <div className="px-6 py-3 bg-white border-t border-stone-200 flex justify-end gap-2">
          <button onClick={() => exportPDF(rph)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow hover:shadow-md transition"
            style={{ background: 'linear-gradient(135deg,#1a3a5c,#2a9d8f)' }}>
            <Printer className="w-4 h-4" />Cetak / Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
