import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send, Target, Users, BookOpen, Mic, MicOff, Globe } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput.js';

// ── Senarai data ──────────────────────────────────
const SUBJEK_LIST = [
  'Al-Quran','Hadith','Fiqh','Akidah','Sirah',
  'Bahasa Arab','Bahasa Melayu','Bahasa Inggeris',
  'Matematik','Sains','Sejarah','Geografi',
  'Pendidikan Islam','Tasawwur Islam',
  'TQS','Tilawah','Tahfiz',
  'Pendidikan Jasmani','Seni Visual','Muzik',
  'Reka Bentuk & Teknologi','Teknologi Maklumat & Komunikasi',
];

const KELAS_LIST = [
  'Tahun 1 Amanah','Tahun 1 Barakah','Tahun 1 Cekal',
  'Tahun 2 Amanah','Tahun 2 Barakah','Tahun 2 Cekal',
  'Tahun 3 Amanah','Tahun 3 Barakah','Tahun 3 Cekal',
  'Tahun 4 Amanah','Tahun 4 Barakah','Tahun 4 Cekal',
  'Tahun 5 Amanah','Tahun 5 Barakah','Tahun 5 Cekal',
  'Tahun 6 Amanah','Tahun 6 Barakah','Tahun 6 Cekal',
  'Tingkatan 1 A','Tingkatan 1 B',
  'Tingkatan 2 A','Tingkatan 2 B',
  'Tingkatan 3 A','Tingkatan 3 B',
];

const TQS_SUBJECTS = ['TQS','Tilawah','Tahfiz'];
const isTQS = (s) => TQS_SUBJECTS.some(t => (s||'').toUpperCase().includes(t.toUpperCase()));

// ── Komponen MicButton ────────────────────────────
// Butang mikrofon yang ditunjuk di tepi setiap textarea
function MicButton({ fieldKey, currentValue, onUpdate, voice }) {
  if (!voice.supported) return null;
  const active = voice.activeField === fieldKey && voice.isListening;
  return (
    <button
      type="button"
      onClick={() => voice.toggleField(fieldKey, currentValue, onUpdate)}
      title={active ? 'Klik untuk berhenti rakam' : 'Klik untuk rakam suara'}
      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
        active
          ? 'bg-rose-500 border-rose-500 text-white shadow-lg animate-pulse'
          : 'bg-white border-stone-300 text-stone-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
      }`}
    >
      {active ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Wrapper textarea + mikrofon ───────────────────
// useEffect sync ref setiap render supaya voice sentiasa ada nilai terkini
function VoiceTextarea({ fieldKey, value, onChange, rows = 3, placeholder, voice }) {
  const active = voice.activeField === fieldKey && voice.isListening;

  // ⬇️ KUNCI PENYELESAIAN: sync ref setiap kali value ATAU onChange berubah
  useEffect(() => {
    if (voice.activeField === fieldKey) {
      voice.updateRefs(value, onChange);
    }
  });

  return (
    <div className="space-y-1">
      <div className="flex gap-1.5 items-start">
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`textarea flex-1 transition-all ${active ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/30' : ''}`}
        />
        <MicButton fieldKey={fieldKey} currentValue={value}
          onUpdate={onChange} voice={voice} />
      </div>
      {/* Teks sementara semasa rakam */}
      {active && voice.interim && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 border border-rose-200 rounded-lg">
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping flex-shrink-0" />
          <span className="text-xs text-rose-700 italic">{voice.interim}</span>
        </div>
      )}
    </div>
  );
}

// ── Bar status voice (tunjuk bila sedang rakam) ───
function VoiceStatusBar({ voice }) {
  if (!voice.supported || !voice.isListening) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-rose-600 text-white rounded-full shadow-2xl">
      <div className="flex gap-0.5 items-end h-4">
        {[1,2,3,4,3,2,1].map((h, i) => (
          <div key={i}
            className="w-1 bg-white rounded-full"
            style={{
              height: `${h * 4}px`,
              animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <span className="text-sm font-semibold">Sedang merakam...</span>
      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
        {voice.langOptions.find(l => l.code === voice.lang)?.label}
      </span>
      <button onClick={voice.stopListening}
        className="ml-1 p-1 hover:bg-white/20 rounded-full transition">
        <MicOff className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.5); }
          to   { transform: scaleY(1.5); }
        }
      `}</style>
    </div>
  );
}

// ── Selector bahasa voice ─────────────────────────
function LangSelector({ voice }) {
  if (!voice.supported) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-stone-500">
      <Globe className="w-3.5 h-3.5" />
      <span>Bahasa suara:</span>
      {voice.langOptions.map(l => (
        <button key={l.code} onClick={() => voice.setLang(l.code)}
          className={`px-2 py-0.5 rounded-md font-medium transition ${voice.lang === l.code ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

// ── Halaman Form RPH utama ────────────────────────
export default function RPHFormPage({ user, existing, onSave, onSubmit, onCancel }) {
  const [form, setForm] = useState(existing ? {
    subjek: existing.subjek || '',
    kelas: existing.kelas || '',
    tarikh: existing.tarikh?.slice(0, 10) || '',
    masa: existing.masa || '',
    tajuk: existing.tajuk || '',
    tema: existing.tema || '',
    standard_kandungan: existing.standard_kandungan || '',
    standard_pembelajaran: existing.standard_pembelajaran || '',
    objektif: existing.objektif || '',
    aktiviti: existing.aktiviti || '',
    pak21: existing.pak21 || '',
    kbat: existing.kbat || '',
    bbm: existing.bbm || '',
    ebk: existing.ebk || '',
    nilai_murni: existing.nilai_murni || '',
    tahap_penguasaan: existing.tahap_penguasaan || '',
    penilaian: existing.penilaian || '',
    refleksi: existing.refleksi || '',
    nama_surah: existing.nama_surah || '',
    nombor_ayat: existing.nombor_ayat || '',
    nilai_kaffah: existing.nilai_kaffah || '',
  } : {
    subjek: user.subjek || '', kelas: '', tarikh: '', masa: '',
    tajuk: '', tema: '', standard_kandungan: '', standard_pembelajaran: '',
    objektif: '', aktiviti: '', pak21: '', kbat: '', bbm: '',
    ebk: '', nilai_murni: '', tahap_penguasaan: '', penilaian: '', refleksi: '',
    nama_surah: '', nombor_ayat: '', nilai_kaffah: '',
  });

  const [loading, setLoading] = useState(false);
  const [subjekCustom, setSubjekCustom] = useState(!SUBJEK_LIST.includes(form.subjek) && form.subjek !== '');
  const [kelasCustom, setKelasCustom] = useState(!KELAS_LIST.includes(form.kelas) && form.kelas !== '');

  // Voice input hook
  const voice = useVoiceInput();

  const up = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const upE = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const upV = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAction = async (hantar) => {
    voice.stopListening(); // pastikan rakam diberhentikan
    if (!form.tajuk && !form.nama_surah) { alert('Tajuk / Nama Surah RPH diperlukan.'); return; }
    setLoading(true);
    try {
      if (hantar) await onSubmit(form);
      else await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  const L = 'block text-sm font-semibold text-stone-700 mb-1.5';
  const I = 'input';
  const S = 'input bg-white';
  const tqs = isTQS(form.subjek);

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-4 transition">
        <ArrowLeft className="w-4 h-4" />Kembali
      </button>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200" style={{ background: 'linear-gradient(135deg,#1a3a5c,#2a9d8f)' }}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-teal-200 font-semibold tracking-wider uppercase">SRITI Tahfiz Al-Ummah</p>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Lora,Georgia,serif' }}>
                {existing ? 'Edit RPH' : 'Rancangan Pengajaran Harian Baru'}
              </h2>
              {tqs && <span className="inline-block mt-1 text-xs bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded">Format TQS</span>}
            </div>
            {/* Panduan voice */}
            {voice.supported && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                <Mic className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span className="text-xs text-white/90">Klik 🎤 pada mana-mana medan untuk taip dengan suara</span>
              </div>
            )}
          </div>
        </div>

        {/* Bar pilihan bahasa + status */}
        {voice.supported && (
          <div className="px-6 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2">
            <LangSelector voice={voice} />
            {!voice.isListening && (
              <span className="text-xs text-stone-400">
                Tidak semua browser sokong ciri ini. Disyorkan: Chrome / Edge
              </span>
            )}
          </div>
        )}

        <div className="p-6 space-y-6">

          {/* ── Maklumat Asas ── */}
          <div>
            <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-700" />Maklumat Asas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subjek */}
              <div>
                <label className={L}>Mata Pelajaran <span className="text-rose-500">*</span></label>
                {subjekCustom ? (
                  <div className="flex gap-1">
                    <input className={I} value={form.subjek} onChange={upE('subjek')} placeholder="Taip nama subjek" />
                    <button onClick={() => { setSubjekCustom(false); upV('subjek',''); }}
                      className="px-2 text-stone-500 hover:text-rose-600 border border-stone-300 rounded-lg text-xs">✕</button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <select className={`${S} flex-1`} value={form.subjek} onChange={e => upV('subjek', e.target.value)}>
                      <option value="">-- Pilih Subjek --</option>
                      {SUBJEK_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setSubjekCustom(true)}
                      className="px-2 text-xs border border-stone-300 rounded-lg text-stone-500 hover:bg-stone-50 whitespace-nowrap">+ Lain</button>
                  </div>
                )}
              </div>

              {/* Kelas */}
              <div>
                <label className={L}>Kelas {tqs && '/ Halaqah'}</label>
                {kelasCustom ? (
                  <div className="flex gap-1">
                    <input className={I} value={form.kelas} onChange={upE('kelas')} placeholder="Taip nama kelas" />
                    <button onClick={() => { setKelasCustom(false); upV('kelas',''); }}
                      className="px-2 text-stone-500 hover:text-rose-600 border border-stone-300 rounded-lg text-xs">✕</button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <select className={`${S} flex-1`} value={form.kelas} onChange={e => upV('kelas', e.target.value)}>
                      <option value="">-- Pilih Kelas --</option>
                      {KELAS_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <button onClick={() => setKelasCustom(true)}
                      className="px-2 text-xs border border-stone-300 rounded-lg text-stone-500 hover:bg-stone-50 whitespace-nowrap">+ Lain</button>
                  </div>
                )}
              </div>

              <div>
                <label className={L}>Tarikh <span className="text-rose-500">*</span></label>
                <input type="date" className={I} value={form.tarikh} onChange={upE('tarikh')} />
              </div>
              <div>
                <label className={L}>Masa</label>
                <input className={I} value={form.masa} onChange={upE('masa')} placeholder="cth: 8:00 - 9:00 pagi" />
              </div>

              {tqs ? (
                <>
                  <div>
                    <label className={L}>Nama Surah <span className="text-rose-500">*</span></label>
                    <input className={I} value={form.tajuk} onChange={upE('tajuk')} placeholder="cth: Al-Baqarah" />
                  </div>
                  <div>
                    <label className={L}>Nombor Ayat</label>
                    <input className={I} value={form.nombor_ayat} onChange={upE('nombor_ayat')} placeholder="cth: 1-5" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={L}>Tajuk / Unit/Topik <span className="text-rose-500">*</span></label>
                    <input className={I} value={form.tajuk} onChange={upE('tajuk')} placeholder="Tajuk PdPc" />
                  </div>
                  <div>
                    <label className={L}>Tema</label>
                    <input className={I} value={form.tema} onChange={upE('tema')} placeholder="cth: Nombor dan Operasi" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Kurikulum (bukan TQS) ── */}
          {!tqs && (
            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-700" />Kurikulum
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={L}>Standard Kandungan</label>
                  <VoiceTextarea fieldKey="standard_kandungan"
                    value={form.standard_kandungan} onChange={up('standard_kandungan')}
                    rows={2} placeholder="cth: 1.1 Pecahan Wajar dan Tak Wajar" voice={voice} />
                </div>
                <div>
                  <label className={L}>Standard Pembelajaran</label>
                  <VoiceTextarea fieldKey="standard_pembelajaran"
                    value={form.standard_pembelajaran} onChange={up('standard_pembelajaran')}
                    rows={3} placeholder="Senaraikan standard pembelajaran mengikut nombor" voice={voice} />
                </div>
              </div>
            </div>
          )}

          {/* ── Objektif ── */}
          <div className="pt-4 border-t border-stone-100">
            <label className={L}>Objektif Pembelajaran <span className="text-rose-500">*</span></label>
            <VoiceTextarea fieldKey="objektif"
              value={form.objektif} onChange={up('objektif')}
              rows={3} placeholder="Pada akhir PdPc, murid dapat..." voice={voice} />
          </div>

          {/* ── Pelaksanaan ── */}
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />Pelaksanaan PdPc
            </h3>
            <div className="space-y-4">
              <div>
                <label className={L}>Aktiviti PdPc</label>
                <VoiceTextarea fieldKey="aktiviti"
                  value={form.aktiviti} onChange={up('aktiviti')}
                  rows={5} placeholder="Set Induksi, Perkembangan (Langkah 1, 2, 3), Penutup" voice={voice} />
              </div>

              {!tqs && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={L}>Aktiviti PAK-21</label>
                      <VoiceTextarea fieldKey="pak21"
                        value={form.pak21} onChange={up('pak21')}
                        rows={2} placeholder="cth: Think-Pair-Share, Gallery Walk" voice={voice} />
                    </div>
                    <div>
                      <label className={L}>KBAT</label>
                      <VoiceTextarea fieldKey="kbat"
                        value={form.kbat} onChange={up('kbat')}
                        rows={2} placeholder="cth: Menganalisis, Menilai, Mencipta" voice={voice} />
                    </div>
                  </div>
                  <div>
                    <label className={L}>Bahan Bantu Mengajar (BBM)</label>
                    <VoiceTextarea fieldKey="bbm"
                      value={form.bbm} onChange={up('bbm')}
                      rows={2} placeholder="cth: Buku teks, kad manila, video, lembaran kerja" voice={voice} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Elemen Tambah ── */}
          <div className="pt-4 border-t border-stone-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tqs ? (
                <>
                  <div>
                    <label className={L}>Nilai Kaffah</label>
                    <input className={I} value={form.nilai_murni} onChange={upE('nilai_murni')} placeholder="cth: Amanah, Sabar, Tekun" />
                  </div>
                  <div>
                    <label className={L}>Tahap Penguasaan</label>
                    <input className={I} value={form.tahap_penguasaan} onChange={upE('tahap_penguasaan')} placeholder="cth: TP 1 - TP 6" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={L}>Elemen Merentas Kurikulum (EMK)</label>
                    <input className={I} value={form.ebk} onChange={upE('ebk')} placeholder="cth: Kreativiti dan Inovasi, TMK" />
                  </div>
                  <div>
                    <label className={L}>Nilai Murni / Nilai Kaffah</label>
                    <input className={I} value={form.nilai_murni} onChange={upE('nilai_murni')} placeholder="cth: Kerjasama, Ketekunan" />
                  </div>
                  <div>
                    <label className={L}>Tahap Penguasaan</label>
                    <input className={I} value={form.tahap_penguasaan} onChange={upE('tahap_penguasaan')} placeholder="cth: TP 1 - TP 6" />
                  </div>
                  <div>
                    <label className={L}>Pentaksiran Bilik Darjah</label>
                    <input className={I} value={form.penilaian} onChange={upE('penilaian')} placeholder="cth: Pemerhatian, soal jawab" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Refleksi ── */}
          <div className="pt-4 border-t border-stone-100">
            <label className={L}>Refleksi / Impak (diisi selepas PdPc)</label>
            <VoiceTextarea fieldKey="refleksi"
              value={form.refleksi} onChange={up('refleksi')}
              rows={3} placeholder="Catatan tentang pencapaian objektif, isu, dan penambahbaikan..." voice={voice} />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-wrap justify-between items-center gap-3">
          {/* Info voice */}
          {voice.isListening ? (
            <div className="flex items-center gap-2 text-xs text-rose-700 font-medium">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              Sedang merakam suara... klik 🎤 untuk berhenti
            </div>
          ) : (
            <div className="text-xs text-stone-400 hidden sm:block">
              {voice.supported ? '🎤 Gunakan butang mikrofon pada setiap medan untuk taip dengan suara' : ''}
            </div>
          )}

          <div className="flex flex-wrap gap-2 ml-auto">
            <button onClick={onCancel} className="btn-secondary" disabled={loading}>Batal</button>
            <button onClick={() => handleAction(false)} className="btn-secondary" disabled={loading}>
              <Save className="w-4 h-4" />{loading ? 'Menyimpan...' : 'Simpan Draf'}
            </button>
            <button onClick={() => handleAction(true)} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#1a3a5c,#2a9d8f)' }}>
              <Send className="w-4 h-4" />{loading ? 'Menghantar...' : 'Hantar untuk Semakan'}
            </button>
          </div>
        </div>
      </div>

      {/* Bar status voice global (floating) */}
      <VoiceStatusBar voice={voice} />
    </div>
  );
}
