import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ComensalView from './components/ComensalView';
import VendedorView from './components/VendedorView';
import AdminDashboard from './components/AdminDashboard';
import ProfileView from './components/ProfileView';

// Import initial database mocks
import { 
  locales, 
  reseñas, 
  reportesSeguridad, 
  logAuditoriaAdmin 
} from './mockData';

export default function App() {
  const [activeView, setActiveView] = useState('comensal'); // 'comensal', 'vendedor', 'admin', 'invitado'
  const [registeredUser, setRegisteredUser] = useState({ username: 'comensal_demo', role: 'comensal', nombre: 'Comensal', apellido: 'Demo', correo: 'comensal@fcfm.cl', preferencias: 'Ninguna' });
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingTab, setOnboardingTab] = useState('login'); // 'login' | 'register'
  const [regRole, setRegRole] = useState('comensal'); // 'comensal' | 'vendedor'
  
  // Registration Form States
  // Comensal
  const [comNombre, setComNombre] = useState('');
  const [comApellido, setComApellido] = useState('');
  const [comCorreo, setComCorreo] = useState('');
  const [comPassword, setComPassword] = useState('');
  const [comPreferencia, setComPreferencia] = useState('Ninguna');

  // Vendedor
  const [venNombre, setVenNombre] = useState('');
  const [venCorreo, setVenCorreo] = useState('');
  const [venPassword, setVenPassword] = useState('');
  const [venRut, setVenRut] = useState('');
  const [venTelefono, setVenTelefono] = useState('');

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
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [solicitudesVendedor, setSolicitudesVendedor] = useState([]);
  const [solicitudesModerador, setSolicitudesModerador] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

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
  const handleResolveReport = (reportId, action, reviewId, username, reason = '') => {
    const timestamp = new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL');

    if (action === 'banear') {
      setReseñasList(prev => prev.filter(r => r.id !== reviewId));
      setReportesList(prev => 
        prev.map(rep => rep.id === reportId ? { ...rep, estado: 'Resuelto (Eliminado)' } : rep)
      );

      const newLog = {
        id: Date.now(),
        accion: `Admin eliminó reseña ID ${reviewId} y bloqueó al usuario '${username || 'desconocido'}' por trolling. Motivo: ${reason || 'Sin motivo especificado'}`,
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
      coordenadas: solicitudData.coordenadas || [-33.4581 + (Math.random() - 0.5) * 0.008, -70.6642 + (Math.random() - 0.5) * 0.008],
      estado: 'Pendiente',
      vendedorUsername: registeredUser ? registeredUser.username : 'vendedor_demo'
    };
    setSolicitudesVendedor(prev => [...prev, newSolicitud]);
    addToast("Solicitud de local enviada al Administrador", "success");
  };

  const handleAddReview = (localId, rating, comment) => {
    const newReview = {
      id: Date.now(),
      localId,
      usuario: registeredUser ? registeredUser.username : 'Invitado',
      calificacion: rating,
      comentario: comment,
      votosUtilidad: 0,
      fecha: "Ahora",
      reportado: false
    };
    setReseñasList(prev => [newReview, ...prev]);
    addToast("Reseña agregada en vivo", "success");
  };

  const handleVoteHelpful = (reviewId) => {
    setReseñasList(prev =>
      prev.map(r => r.id === reviewId ? { ...r, votosUtilidad: (r.votosUtilidad || 0) + 1 } : r)
    );
  };

  const handleUpdateLocalTags = (localId, updatedTags) => {
    setLocalesList(prev => 
      prev.map(l => l.id === localId ? { ...l, tags: updatedTags } : l)
    );
    addToast("Etiquetas del local actualizadas", "success");
  };

  const handleLogout = () => {
    setRegisteredUser(null);
    setActiveView('comensal');
    setShowOnboarding(true);
    setOnboardingTab('login');
  };

  const handleToggleLocalJunaeb = (localId, acceptsJunaeb) => {
    setLocalesList(prev => 
      prev.map(l => l.id === localId ? { ...l, aceptaJunaeb: acceptsJunaeb } : l)
    );
    addToast(acceptsJunaeb ? "Convenio JUNAEB habilitado" : "Convenio JUNAEB deshabilitado", "success");
  };

  const handleUpdateUserDetails = (updatedDetails) => {
    setRegisteredUser(prev => ({
      ...prev,
      ...updatedDetails
    }));
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
        onOpenProfile={() => {
          setActiveView('perfil');
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full flex flex-col min-h-0 relative">
        {/* COMENSAL VIEW (also used for guest view with isGuest set) */}
        {activeView === 'comensal' && (
          <ComensalView 
            locales={localesList} 
            reseñas={reseñasList} 
            onReportReview={handleReportReview}
            onVoteHelpful={handleVoteHelpful}
            favoritos={favoritos}
            onToggleFavorite={handleToggleFavorite}
            isGuest={false}
            theme={theme}
            deviceMode={deviceMode}
            filterFavorites={filterFavorites}
            setFilterFavorites={setFilterFavorites}
            onAddReview={handleAddReview}
          />
        )}

        {/* INVITADO VIEW (ComensalView with isGuest={true}) */}
        {activeView === 'invitado' && (
          <ComensalView 
            locales={localesList} 
            reseñas={reseñasList} 
            onReportReview={handleReportReview}
            onVoteHelpful={handleVoteHelpful}
            favoritos={[]}
            onToggleFavorite={handleToggleFavorite}
            isGuest={true}
            theme={theme}
            deviceMode={deviceMode}
            filterFavorites={false}
            setFilterFavorites={() => {}}
            onAddReview={() => {}}
          />
        )}

        {/* PROFILE VIEW */}
        {activeView === 'perfil' && (
          <ProfileView 
            registeredUser={registeredUser}
            favoritos={favoritos}
            locales={localesList}
            onToggleFavorite={handleToggleFavorite}
            onGoBack={() => {
              if (registeredUser && registeredUser.role === 'vendedor') {
                setActiveView('vendedor');
              } else {
                setActiveView('comensal');
              }
            }}
            solicitudesModerador={solicitudesModerador}
            onPostularModerador={handlePostularModerador}
            onFilterFavoritesOnMap={() => {
              setFilterFavorites(true);
              setActiveView('comensal');
            }}
            solicitudesVendedor={solicitudesVendedor}
            onUpdateUserDetails={handleUpdateUserDetails}
            onGoToRegister={() => {
              setOnboardingTab('register');
              setShowOnboarding(true);
            }}
            addToast={addToast}
          />
        )}
        
        {/* VENDEDOR VIEW */}
        {activeView === 'vendedor' && (
          <VendedorView 
            locales={localesList} 
            onUpdateLocalStatus={handleUpdateLocalStatus}
            registeredUser={registeredUser}
            onUpdateLocalMenu={handleUpdateLocalMenu}
            onUpdateLocalTags={handleUpdateLocalTags}
            solicitudesVendedor={solicitudesVendedor}
            onRegisterNewLocal={handleRegisterNewLocal}
            onToggleLocalJunaeb={handleToggleLocalJunaeb}
          />
        )}
        
        {/* ADMIN DASHBOARD */}
        {activeView === 'admin' && (
          <AdminDashboard 
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

    </div>
  );

  if (showOnboarding) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-tr from-slate-900 via-slate-955 to-emerald-950 text-slate-100 flex items-center justify-center p-4 antialiased select-none font-sans transition-colors duration-200">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center animate-scale-up">
          
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl text-slate-950 shadow-lg shadow-emerald-500/25 transform transition-transform hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent tracking-tight leading-none">
                Beauchef Eats
              </h1>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1.5 font-mono">
                Mapa de Comida FCFM
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed px-4">
            Bienvenido al portal centralizado de alimentación para la comunidad de Beauchef.
          </p>

          {/* Onboarding Tabs */}
          <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-800 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setOnboardingTab('login')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                onboardingTab === 'login'
                  ? 'bg-slate-900 border border-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setOnboardingTab('register')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                onboardingTab === 'register'
                  ? 'bg-slate-900 border border-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Registrarse
            </button>
          </div>

          {onboardingTab === 'login' ? (
            <div className="flex flex-col gap-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setRegisteredUser({ 
                    username: 'comensal_demo', 
                    role: 'comensal', 
                    nombre: 'Comensal', 
                    apellido: 'Demo', 
                    correo: 'comensal@fcfm.cl',
                    preferencias: 'Ninguna'
                  });
                  setActiveView('comensal');
                  setShowOnboarding(false);
                }}
                className="group p-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center justify-between text-left transition-all duration-300 active:scale-[0.98] shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl p-2 bg-emerald-950/40 rounded-xl group-hover:scale-110 transition-transform">🍔</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-200">Iniciar Sesión Comensal</h4>
                    <p className="text-[8.5px] text-slate-500 leading-none mt-1">Busca comida, marca favoritos y escribe reseñas.</p>
                  </div>
                </div>
                <span className="text-slate-600 group-hover:text-emerald-400 transition-colors text-xs">➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegisteredUser({ 
                    username: 'vendedor_demo', 
                    role: 'vendedor',
                    nombreLocatario: 'Vendedor Demo',
                    correo: 'vendedor@fcfm.cl',
                    rut: '12.345.678-9',
                    telefono: '+56912345678'
                  });
                  setActiveView('vendedor');
                  setShowOnboarding(false);
                }}
                className="group p-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center justify-between text-left transition-all duration-300 active:scale-[0.98] shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl p-2 bg-amber-950/40 rounded-xl group-hover:scale-110 transition-transform">🏪</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-200">Iniciar Sesión Vendedor</h4>
                    <p className="text-[8.5px] text-slate-500 leading-none mt-1">Gestiona tu local, cambia el stock y abre tu menú.</p>
                  </div>
                </div>
                <span className="text-slate-600 group-hover:text-emerald-400 transition-colors text-xs">➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegisteredUser(null);
                  setActiveView('invitado');
                  setShowOnboarding(false);
                }}
                className="group p-3 bg-slate-950/40 hover:bg-slate-900/50 border border-slate-800 hover:border-slate-700/50 rounded-2xl flex items-center justify-between text-left transition-all duration-300 active:scale-[0.98] shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl p-2 bg-slate-900/40 rounded-xl group-hover:scale-110 transition-transform">👁️</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-300">Entrar sin iniciar sesión (Invitado)</h4>
                    <p className="text-[8.5px] text-slate-500 leading-none mt-1">Explora locales y lee reseñas de la comunidad.</p>
                  </div>
                </div>
                <span className="text-slate-600 group-hover:text-emerald-400 transition-colors text-xs">➔</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-left max-h-[380px] overflow-y-auto pr-1">
              <div className="flex bg-slate-950/40 p-0.5 rounded-xl border border-slate-850 gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setRegRole('comensal')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    regRole === 'comensal'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Comensal
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('vendedor')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    regRole === 'vendedor'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Vendedor
                </button>
              </div>

              {regRole === 'comensal' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!comNombre.trim() || !comCorreo.trim()) return;
                    setRegisteredUser({
                      username: comCorreo.split('@')[0],
                      role: 'comensal',
                      nombre: comNombre.trim(),
                      apellido: comApellido.trim(),
                      correo: comCorreo.trim(),
                      preferencias: comPreferencia
                    });
                    setActiveView('comensal');
                    setShowOnboarding(false);
                    addToast("Registro exitoso. ¡Bienvenido!", "success");
                  }}
                  className="flex flex-col gap-2.5 mt-1"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        placeholder="Juan"
                        value={comNombre}
                        onChange={(e) => setComNombre(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Apellido</label>
                      <input
                        type="text"
                        required
                        placeholder="Perez"
                        value={comApellido}
                        onChange={(e) => setComApellido(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Correo Institucional</label>
                    <input
                      type="email"
                      required
                      placeholder="juan.perez@ing.uchile.cl"
                      value={comCorreo}
                      onChange={(e) => setComCorreo(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={comPassword}
                      onChange={(e) => setComPassword(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Preferencia Alimentaria</label>
                    <select
                      value={comPreferencia}
                      onChange={(e) => setComPreferencia(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-bold transition-colors"
                    >
                      <option value="Ninguna">Ninguna / Todo</option>
                      <option value="Vegana">Vegana</option>
                      <option value="Vegetariana">Vegetariana</option>
                      <option value="Sin Gluten">Sin Gluten</option>
                      <option value="Apto para Celíacos">Apto para Celíacos</option>
                      <option value="Hipocalórica">Hipocalórica</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-[0.98] hover:opacity-95 text-center cursor-pointer"
                  >
                    Registrarse e Ingresar
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!venNombre.trim() || !venCorreo.trim() || !venRut.trim()) return;
                    setRegisteredUser({
                      username: venCorreo.split('@')[0],
                      role: 'vendedor',
                      nombreLocatario: venNombre.trim(),
                      correo: venCorreo.trim(),
                      rut: venRut.trim(),
                      telefono: venTelefono.trim()
                    });
                    setActiveView('vendedor');
                    setShowOnboarding(false);
                    addToast("Registro de Locatario exitoso. ¡Bienvenido!", "success");
                  }}
                  className="flex flex-col gap-2.5 mt-1"
                >
                  <div>
                    <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Nombre del Locatario</label>
                    <input
                      type="text"
                      required
                      placeholder="Pedro Gómez"
                      value={venNombre}
                      onChange={(e) => setVenNombre(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      placeholder="pedro.gomez@gmail.com"
                      value={venCorreo}
                      onChange={(e) => setVenCorreo(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={venPassword}
                      onChange={(e) => setVenPassword(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">RUT / Identificación</label>
                      <input
                        type="text"
                        required
                        placeholder="18.765.432-1"
                        value={venRut}
                        onChange={(e) => setVenRut(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Teléfono</label>
                      <input
                        type="text"
                        required
                        placeholder="+56998765432"
                        value={venTelefono}
                        onChange={(e) => setVenTelefono(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-[0.98] hover:opacity-95 text-center cursor-pointer"
                  >
                    Registrarse e Ingresar
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="text-[8px] text-slate-600 font-mono mt-4">
            DCC FCFM • Evaluación de Proyectos
          </div>

        </div>
      </div>
    );
  }

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
