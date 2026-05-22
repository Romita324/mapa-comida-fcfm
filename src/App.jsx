import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ComensalView from './components/ComensalView';
import VendedorView from './components/VendedorView';
import AdminView from './components/AdminView';
import ProfileDrawer from './components/ProfileDrawer';

// Import initial database mocks
import { 
  locales, 
  reseñas, 
  reportesSeguridad, 
  logAuditoriaAdmin 
} from './mockData';

export default function App() {
  const [activeView, setActiveView] = useState('comensal'); // 'comensal', 'vendedor', 'admin', 'invitado'
  const [registeredUser, setRegisteredUser] = useState({ username: 'comensal_demo', role: 'comensal' });

  const handleActiveViewChange = (view) => {
    setActiveView(view);
    if (view === 'invitado') {
      setRegisteredUser(null);
    } else {
      setRegisteredUser({
        username: `${view}_demo`,
        role: view
      });
    }
  };
  
  // Shared reactive states
  const [localesList, setLocalesList] = useState(locales);
  const [reseñasList, setReseñasList] = useState(reseñas);
  const [reportesList, setReportesList] = useState(reportesSeguridad);
  const [auditLogs, setAuditLogs] = useState(logAuditoriaAdmin);

  // V2 Feature States
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [deviceMode, setDeviceMode] = useState('browser'); // 'browser' | 'mobile'
  const [favoritos, setFavoritos] = useState([2]); // Casino Central is favorited by default
  const [solicitudesVendedor, setSolicitudesVendedor] = useState([]);
  const [solicitudesModerador, setSolicitudesModerador] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Simulated notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      titulo: "Promoción de la semana",
      mensaje: "¡Casino Central FCFM lanzó un 15% de descuento en el menú vegetariano!",
      tipo: "promo",
      fecha: "Hace 10 min",
      read: false
    },
    {
      id: 2,
      titulo: "Apertura en vivo",
      mensaje: "El Carrito del Tío Beauchef ahora está Abierto.",
      tipo: "estado",
      fecha: "Hace 1 hora",
      read: false
    }
  ]);

  // Toast messages
  const [toasts, setToasts] = useState([]);

  // Trigger Toast Alert helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Helper to add notification
  const addNotification = (titulo, mensaje, tipo) => {
    const newNotif = {
      id: Date.now(),
      titulo,
      mensaje,
      tipo,
      fecha: "Ahora",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // ----------------------------------------------------
  // THEME CONTROLLER EFFECT
  // ----------------------------------------------------
  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('theme', theme);

    const handleSystemThemeChange = (e) => {
      if (theme === 'system') {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  // COUNT of pending moderation reports to display in the navbar
  const pendingReportsCount = reportesList.filter(r => r.estado === 'Pendiente').length;

  // HANDLER: Comensal flags a review as a Troll/Malicious comment
  const handleReportReview = (reviewId) => {
    setReseñasList(prev => 
      prev.map(r => r.id === reviewId ? { ...r, reportado: true } : r)
    );

    const newReport = {
      id: Date.now(),
      reseñaId: reviewId,
      estado: 'Pendiente',
      motivo: 'Comentario malicioso / Troll'
    };
    setReportesList(prev => [newReport, ...prev]);
    addToast("Reseña reportada al equipo de moderación", "success");
  };

  // HANDLER: Vendedor updates food availability & open status
  const handleUpdateLocalStatus = (localId, newStatus) => {
    const local = localesList.find(l => l.id === localId);
    if (!local) return;

    const oldStatus = local.estadoServicio;
    if (oldStatus === newStatus) return;

    setLocalesList(prev => 
      prev.map(l => l.id === localId ? { ...l, estadoServicio: newStatus } : l)
    );

    // Dynamic Notifications & Toasts
    const isFav = favoritos.includes(localId);
    const stateMsg = `El local "${local.nombre}" ahora está ${newStatus}.`;
    
    if (isFav) {
      addNotification("¡Favorito Actualizado!", `Atención: Tu favorito "${local.nombre}" cambió de estado a ${newStatus}.`, "estado");
      addToast(`Favorito: ${local.nombre} está ${newStatus}`, "favorito");
    } else {
      addNotification("Aviso de local", stateMsg, "estado");
      addToast(stateMsg, "success");
    }
  };

  // HANDLER: Admin resolves security reviews
  const handleResolveReport = (reportId, action, reviewId, username) => {
    const timestamp = new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL');

    if (action === 'banear') {
      setReseñasList(prev => prev.filter(r => r.id !== reviewId));
      setReportesList(prev => 
        prev.map(rep => rep.id === reportId ? { ...rep, estado: 'Resuelto (Eliminado)' } : rep)
      );

      const newLog = {
        id: Date.now(),
        accion: `Admin eliminó reseña ID ${reviewId} y bloqueó al usuario '${username || 'desconocido'}' por trolling.`,
        fecha: timestamp
      };
      setAuditLogs(prev => [newLog, ...prev]);
      addToast("Usuario baneado y reseña borrada correctamente", "success");

    } else if (action === 'descartar') {
      setReseñasList(prev => 
        prev.map(r => r.id === reviewId ? { ...r, reportado: false } : r)
      );
      setReportesList(prev => 
        prev.map(rep => rep.id === reportId ? { ...rep, estado: 'Resuelto (Descartado)' } : rep)
      );

      const newLog = {
        id: Date.now(),
        accion: `Admin descartó reporte ID ${reportId} sobre reseña ID ${reviewId}.`,
        fecha: timestamp
      };
      setAuditLogs(prev => [newLog, ...prev]);
      addToast("Reporte descartado", "success");
    }
  };

  // HANDLER: Toggle favorite local
  const handleToggleFavorite = (localId) => {
    if (favoritos.includes(localId)) {
      setFavoritos(prev => prev.filter(id => id !== localId));
      addToast("Eliminado de tus favoritos", "success");
    } else {
      setFavoritos(prev => [...prev, localId]);
      addToast("¡Agregado a tus favoritos!", "favorito");
    }
  };

  // HANDLER: Submit Vendor Registration Solicitud
  const handleRegisterNewLocal = (solicitudData) => {
    const newSolicitud = {
      id: Date.now(),
      nombre: solicitudData.nombre,
      categoria: solicitudData.categoria,
      aceptaJunaeb: solicitudData.aceptaJunaeb,
      menu: solicitudData.menu.map(item => ({ ...item, agotado: false })),
      coordenadas: [-33.4581 + (Math.random() - 0.5) * 0.008, -70.6642 + (Math.random() - 0.5) * 0.008], // Random near FCFM
      estado: 'Pendiente',
      vendedorUsername: registeredUser ? registeredUser.username : 'vendedor_demo'
    };
    setSolicitudesVendedor(prev => [...prev, newSolicitud]);
    addToast("Solicitud de local enviada al Administrador", "success");
  };

  // HANDLER: Vendedor updates local menu (e.g. toggles item out-of-stock)
  const handleUpdateLocalMenu = (localId, updatedMenu) => {
    setLocalesList(prev => 
      prev.map(l => l.id === localId ? { ...l, menu: updatedMenu } : l)
    );
    addToast("Menú de local actualizado", "success");
  };

  // HANDLER: Admin Approves Vendor Local
  const handleApproveLocal = (solicitudId) => {
    const solicitud = solicitudesVendedor.find(s => s.id === solicitudId);
    if (!solicitud) return;

    // 1. Mark request as approved
    setSolicitudesVendedor(prev => 
      prev.map(s => s.id === solicitudId ? { ...s, estado: 'Aprobado' } : s)
    );

    // 2. Add local to list
    const newLocal = {
      id: localesList.length + 1,
      nombre: solicitud.nombre,
      categoria: solicitud.categoria,
      coordenadas: solicitud.coordenadas,
      distanciaKm: parseFloat((0.1 + Math.random() * 1.5).toFixed(1)),
      aceptaJunaeb: solicitud.aceptaJunaeb,
      estadoServicio: 'Abierto',
      menu: solicitud.menu,
      solicitudId: solicitud.id, // connect them
      vendedorUsername: solicitud.vendedorUsername
    };
    setLocalesList(prev => [...prev, newLocal]);

    // 3. Log and notify
    const timestamp = new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL');
    const newLog = {
      id: Date.now(),
      accion: `Admin aprobó e ingresó el local "${solicitud.nombre}" al mapa.`,
      fecha: timestamp
    };
    setAuditLogs(prev => [newLog, ...prev]);
    addNotification("Nuevo Local Aprobado", `El local "${solicitud.nombre}" ya está visible y disponible en el mapa.`, "estado");
    addToast(`Local "${solicitud.nombre}" aprobado exitosamente`, "success");
  };

  // HANDLER: Admin Rejects Vendor Local
  const handleRejectLocal = (solicitudId) => {
    setSolicitudesVendedor(prev => 
      prev.map(s => s.id === solicitudId ? { ...s, estado: 'Rechazado' } : s)
    );
    const timestamp = new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL');
    const newLog = {
      id: Date.now(),
      accion: `Admin rechazó la solicitud de local ID ${solicitudId}.`,
      fecha: timestamp
    };
    setAuditLogs(prev => [newLog, ...prev]);
    addToast("Solicitud rechazada", "success");
  };

  // HANDLER: Submit Moderator Application
  const handlePostularModerador = (postulacion) => {
    const newPost = {
      id: Date.now(),
      usuario: postulacion.usuario,
      rut: postulacion.rut,
      motivacion: postulacion.motivacion,
      estado: 'Pendiente'
    };
    setSolicitudesModerador(prev => [...prev, newPost]);
    addToast("Postulación enviada correctamente", "success");
  };

  // HANDLER: Admin Approves Moderator Application
  const handleApproveModerador = (appId) => {
    const app = solicitudesModerador.find(a => a.id === appId);
    if (!app) return;

    setSolicitudesModerador(prev => 
      prev.map(a => a.id === appId ? { ...a, estado: 'Aprobado' } : a)
    );

    const timestamp = new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL');
    const newLog = {
      id: Date.now(),
      accion: `Admin promovió al comensal @${app.usuario} a rol Moderador.`,
      fecha: timestamp
    };
    setAuditLogs(prev => [newLog, ...prev]);
    addNotification("Moderador Promovido", `El comensal @${app.usuario} fue aprobado como nuevo Moderador de la comunidad.`, "admin");
    addToast(`@${app.usuario} promovido a Moderador`, "success");
  };

  // HANDLER: Admin Rejects Moderator Application
  const handleRejectModerador = (appId) => {
    setSolicitudesModerador(prev => 
      prev.map(a => a.id === appId ? { ...a, estado: 'Rechazado' } : a)
    );
    const timestamp = new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL');
    const newLog = {
      id: Date.now(),
      accion: `Admin rechazó postulación de moderador ID ${appId}.`,
      fecha: timestamp
    };
    setAuditLogs(prev => [newLog, ...prev]);
    addToast("Postulación rechazada", "success");
  };

  // 3 Reviews with most votes for summary modal
  const topReviews = [...reseñasList]
    .sort((a, b) => (b.votosUtilidad || 0) - (a.votosUtilidad || 0))
    .slice(0, 3);

  const getLocalName = (localId) => {
    const loc = localesList.find(l => l.id === localId);
    return loc ? loc.nombre : "Local desconocido";
  };

  // The application HTML structure shared between layouts
  const appContent = (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
      <Navbar 
        activeView={activeView} 
        setActiveView={handleActiveViewChange} 
        pendingReportsCount={pendingReportsCount}
        theme={theme}
        setTheme={setTheme}
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        notifications={notifications}
        setNotifications={setNotifications}
        onOpenMonthlySummary={() => setIsSummaryOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1 w-full flex flex-col min-h-0 relative">
        {/* COMENSAL VIEW (also used for guest view with isGuest set) */}
        {activeView === 'comensal' && (
          <ComensalView 
            locales={localesList} 
            reseñas={reseñasList} 
            onReportReview={handleReportReview}
            favoritos={favoritos}
            onToggleFavorite={handleToggleFavorite}
            isGuest={false}
            theme={theme}
            deviceMode={deviceMode}
          />
        )}

        {/* INVITADO VIEW (ComensalView with isGuest={true}) */}
        {activeView === 'invitado' && (
          <ComensalView 
            locales={localesList} 
            reseñas={reseñasList} 
            onReportReview={handleReportReview}
            favoritos={[]}
            onToggleFavorite={handleToggleFavorite}
            isGuest={true}
            theme={theme}
            deviceMode={deviceMode}
          />
        )}
        
        {/* VENDEDOR VIEW */}
        {activeView === 'vendedor' && (
          <VendedorView 
            locales={localesList} 
            onUpdateLocalStatus={handleUpdateLocalStatus}
            registeredUser={registeredUser}
            onUpdateLocalMenu={handleUpdateLocalMenu}
          />
        )}
        
        {/* ADMIN VIEW */}
        {activeView === 'admin' && (
          <AdminView 
            locales={localesList} 
            reseñas={reseñasList} 
            reportesSeguridad={reportesList} 
            logAuditoriaAdmin={auditLogs}
            onResolveReport={handleResolveReport}
            solicitudesVendedor={solicitudesVendedor}
            onApproveLocal={handleApproveLocal}
            onRejectLocal={handleRejectLocal}
            solicitudesModerador={solicitudesModerador}
            onApproveModerador={handleApproveModerador}
            onRejectModerador={handleRejectModerador}
            deviceMode={deviceMode}
          />
        )}
      </main>

      <footer className="w-full py-3 px-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 shrink-0">
        &copy; {new Date().getFullYear()} Beauchef Eats - DCC FCFM. Prototipo V2.
      </footer>

      {/* Unified User Profile Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        activeView={activeView}
        solicitudesModerador={solicitudesModerador}
        onPostularModerador={handlePostularModerador}
        solicitudesVendedor={solicitudesVendedor}
        onRegisterNewLocal={handleRegisterNewLocal}
        locales={localesList}
        reseñas={reseñasList}
        reportesList={reportesList}
        favoritos={favoritos}
        registeredUser={registeredUser}
        onRegisterUser={(username, role) => {
          setRegisteredUser({ username, role });
          setActiveView(role);
          addToast(`Cuenta @${username} creada exitosamente`, "success");
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-sans antialiased transition-colors duration-200">
      {deviceMode === 'mobile' ? (
        // Premium Frame Chassis Simulator
        <div className="my-6 relative w-[400px] h-[850px] rounded-[52px] border-[14px] border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden ring-8 ring-slate-900/5 dark:ring-slate-950/20">
          
          {/* Speaker, Camera and Sensor Notch */}
          <div className="absolute top-0 inset-x-0 h-7 bg-slate-900 dark:bg-slate-800 rounded-b-2xl mx-auto w-40 z-[9999] flex items-center justify-center gap-1.5 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800"></div>
            <div className="w-14 h-1 bg-slate-950 rounded-full"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900"></div>
          </div>

          {/* Status Bar inside Screen */}
          <div className="h-7 bg-slate-900 text-slate-300 flex items-center justify-between px-6 text-[10px] select-none font-sans font-medium tracking-tight z-[9998] shrink-0 pt-1">
            <span>13:47</span>
            <div className="flex items-center space-x-1.5">
              {/* Signal strength */}
              <div className="flex items-end gap-[1px]">
                <div className="w-[2px] h-[4px] bg-slate-300 rounded-2xs"></div>
                <div className="w-[2px] h-[6px] bg-slate-300 rounded-2xs"></div>
                <div className="w-[2px] h-[8px] bg-slate-300 rounded-2xs"></div>
                <div className="w-[2px] h-[10px] bg-slate-300 rounded-2xs"></div>
              </div>
              <span className="font-semibold text-[8px] uppercase">5G</span>
              {/* Battery */}
              <div className="w-5 h-2.5 border border-slate-400 rounded p-[1px] flex items-center relative">
                <div className="w-3.5 h-full bg-emerald-500 rounded-2xs"></div>
                <div className="absolute right-[-2.5px] top-[2px] w-[2px] h-1 bg-slate-400 rounded-r-2xs"></div>
              </div>
            </div>
          </div>

          {/* Main App viewport */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {appContent}
          </div>

          {/* iOS-like Home Indicator */}
          <div className="h-5 bg-white dark:bg-slate-950 flex items-center justify-center z-[9998] shrink-0 pb-1">
            <div className="w-28 h-1 bg-slate-300 dark:bg-slate-800 rounded-full"></div>
          </div>
        </div>
      ) : (
        // Browser / Full screen layout
        <div className="w-full h-screen flex flex-col overflow-hidden">
          {appContent}
        </div>
      )}

      {/* TOAST CONTAINER FOR DEVELOPER ALERTS */}
      <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between pointer-events-auto animate-fade-in-up transition-all ${
              toast.type === 'favorito'
                ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-100'
                : toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              {toast.type === 'favorito' ? (
                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/50 rounded-lg text-rose-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}
              <p className="text-xs font-bold leading-normal">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-3"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* MONTHLY SUMMARY MODAL (Voted reviews) */}
      {isSummaryOpen && (
        <div className="fixed inset-0 z-[10001] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative animate-scale-up">
            {/* Close */}
            <button 
              onClick={() => setIsSummaryOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl text-slate-950 shadow-lg shadow-amber-500/10">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.43a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Resumen Mensual de Reseñas</h3>
                <p className="text-xs text-slate-400">Reseñas de Comensales más votadas por utilidad de la comunidad.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {topReviews.map((review, idx) => {
                const medals = [
                  { border: 'border-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-500', name: 'Oro' },
                  { border: 'border-slate-300', bg: 'bg-slate-400/10', text: 'text-slate-400', name: 'Plata' },
                  { border: 'border-amber-600', bg: 'bg-amber-700/10', text: 'text-amber-600', name: 'Bronce' }
                ];
                const medal = medals[idx];

                return (
                  <div 
                    key={review.id}
                    className={`p-4 rounded-2xl border ${medal.border} ${medal.bg} flex flex-col gap-2 relative overflow-hidden`}
                  >
                    {/* Medal rank tag */}
                    <div className="absolute top-0 right-0 py-1 px-3 bg-gradient-to-l from-slate-950/20 to-transparent text-[9px] font-black uppercase tracking-wider text-slate-500">
                      #{idx + 1} {medal.name}
                    </div>

                    <div className="flex justify-between items-center pr-12">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">@{review.usuario}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-white/60 dark:bg-slate-950/60 rounded font-semibold text-slate-600 dark:text-slate-400">
                        {getLocalName(review.localId)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                      "{review.comentario}"
                    </p>

                    <div className="flex justify-between items-center mt-1 border-t border-slate-300/30 dark:border-slate-700/30 pt-2 text-[10px] font-bold">
                      <span className="text-amber-500">
                        {Array.from({ length: review.calificacion }).map(() => '★').join('')}
                        {Array.from({ length: 5 - review.calificacion }).map(() => '☆').join('')}
                      </span>
                      <span className={`flex items-center space-x-1 font-mono ${medal.text}`}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 00-.8 2.4L6.8 10.333a2 2 0 00-.8.001z" />
                        </svg>
                        <span>{review.votosUtilidad} útiles</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-400 mt-5 text-center leading-normal">
              * El ranking se actualiza mensualmente mediante auditoría del panel de administración basándose en las valoraciones hechas por comensales verificados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
