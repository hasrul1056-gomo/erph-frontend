import { useState, useCallback } from 'react';
import { useAuth } from './hooks/useAuth.jsx';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import RPHFormPage from './pages/RPHFormPage';
import RPHDetailPage from './pages/RPHDetailPage';
import KalendarPage from './pages/KalendarPage';
import { GuruDashboard, GPKKurikulumDashboard, GPKHEMDashboard, GuruBesarDashboard, AdminDashboard } from './pages/Dashboards';
import { Toast } from './components/ui';
import api from './lib/api';

export default function App() {
  const { user, logout } = useAuth();
  const [nav, setNav] = useState('dashboard');
  const [view, setView] = useState('dashboard'); // dashboard | new | edit | detail | calendar | admin
  const [selected, setSelected] = useState(null); // RPH terpilih
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const goBack = () => { setView('dashboard'); setSelected(null); };

  const handleNav = (n) => {
    setNav(n);
    setView(n);
    setSelected(null);
  };

  const handleGoRPH = (rphId) => {
    // Dari notifikasi — muat RPH dan papar detail
    api.get(`/rph/${rphId}`)
      .then(res => { setSelected(res.data); setView('detail'); setNav('dashboard'); })
      .catch(() => showToast('RPH tidak dijumpai.', 'error'));
  };

  // ── Tindakan RPH ─────────────────────────────────
  const handleSaveRPH = async (formData) => {
    try {
      if (selected) {
        await api.patch(`/rph/${selected.id}`, formData);
        showToast('Draf disimpan.');
      } else {
        await api.post('/rph', formData);
        showToast('RPH baru dicipta sebagai draf.');
      }
      goBack();
    } catch (e) {
      showToast(e.response?.data?.error || 'Gagal menyimpan RPH.', 'error');
      throw e;
    }
  };

  const handleSubmitRPH = async (formData) => {
    try {
      if (selected) {
        await api.patch(`/rph/${selected.id}`, { ...formData, hantar: true });
      } else {
        await api.post('/rph', { ...formData, hantar: true });
      }
      showToast('RPH dihantar untuk semakan GPK Kurikulum.');
      goBack();
    } catch (e) {
      showToast(e.response?.data?.error || 'Gagal menghantar RPH.', 'error');
      throw e;
    }
  };

  const handleAction = async (tindakan, catatan) => {
    if (!selected) return;
    try {
      if (user.peranan === 'gpk') {
        await api.post(`/rph/${selected.id}/semak`, { tindakan, catatan });
        showToast(tindakan === 'sahkan' ? 'RPH disahkan. Dihantar kepada Guru Besar.' : 'RPH dikembalikan kepada guru.', tindakan === 'sahkan' ? 'success' : 'warn');
      } else if (user.peranan === 'gurubesar') {
        await api.post(`/rph/${selected.id}/lulus`, { tindakan, catatan });
        showToast(tindakan === 'lulus' ? 'RPH diluluskan.' : 'RPH dikembalikan kepada guru.', tindakan === 'lulus' ? 'success' : 'warn');
      }
      goBack();
    } catch (e) {
      showToast(e.response?.data?.error || 'Gagal memproses tindakan.', 'error');
      throw e;
    }
  };

  if (!user) return <LoginPage />;

  const isGPKHEM = user.peranan === 'gpk' && user.gpk_jenis === 'hem';
  const isGPKKurikulum = user.peranan === 'gpk' && user.gpk_jenis !== 'hem';

  return (
    <div className="min-h-screen bg-stone-50">
      <Header user={user} onLogout={logout} onNav={handleNav} activeNav={nav} onGoRPH={handleGoRPH} />
      <Toast toast={toast} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── GURU ── */}
        {view === 'dashboard' && user.peranan === 'guru' && (
          <GuruDashboard user={user}
            onNew={() => { setSelected(null); setView('new'); }}
            onView={r => { setSelected(r); setView('detail'); }}
            onEdit={r => { setSelected(r); setView('edit'); }} />
        )}

        {/* ── GPK KURIKULUM ── */}
        {view === 'dashboard' && isGPKKurikulum && (
          <GPKKurikulumDashboard user={user} onView={r => { setSelected(r); setView('detail'); }} />
        )}

        {/* ── GPK HEM ── */}
        {view === 'dashboard' && isGPKHEM && (
          <GPKHEMDashboard user={user} onView={r => { setSelected(r); setView('detail'); }} />
        )}

        {/* ── GURU BESAR ── */}
        {view === 'dashboard' && user.peranan === 'gurubesar' && (
          <GuruBesarDashboard onView={r => { setSelected(r); setView('detail'); }} />
        )}

        {/* ── ADMIN ── */}
        {(view === 'dashboard' || view === 'admin') && user.peranan === 'admin' && (
          <AdminDashboard />
        )}

        {/* ── KALENDAR ── */}
        {view === 'calendar' && user.peranan !== 'admin' && (
          <KalendarPage user={user} onView={r => { setSelected(r); setView('detail'); }} />
        )}

        {/* ── FORM BARU / EDIT ── */}
        {(view === 'new' || view === 'edit') && (
          <RPHFormPage user={user}
            existing={view === 'edit' ? selected : null}
            onSave={handleSaveRPH}
            onSubmit={handleSubmitRPH}
            onCancel={goBack} />
        )}

        {/* ── DETAIL RPH ── */}
        {view === 'detail' && selected && (
          <RPHDetailPage rph={selected} user={user}
            onBack={goBack}
            onAction={handleAction} />
        )}
      </main>

      <footer className="text-center text-xs text-stone-500 py-6 border-t border-stone-200 mt-8">
        Sistem e-RPH v3.0 © 2026 • SRITI Tahfiz Al-Ummah
      </footer>
    </div>
  );
}
