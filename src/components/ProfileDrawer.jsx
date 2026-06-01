import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

function MapClickEvents({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

const pickerIcon = typeof window !== 'undefined' && L ? L.divIcon({
  html: `
    <div class="flex flex-col items-center justify-start w-[80px] h-[40px]">
      <div class="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-amber-300 bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-500/25">
        <span class="text-[10px]">📍</span>
      </div>
    </div>
  `,
  className: 'custom-map-marker-container',
  iconSize: [80, 40],
  iconAnchor: [40, 20]
}) : null;

export default function ProfileDrawer({
  isOpen,
  onClose,
  activeView,
  solicitudesModerador,
  onPostularModerador,
  solicitudesVendedor,
  onRegisterNewLocal,
  locales,
  reseñas,
  reportesList,
  favoritos,
  registeredUser,
  onRegisterUser
}) {
  // Account Registration State
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState('comensal');

  // Comensal Form State
  const [modUsuario, setModUsuario] = useState('');
  const [modRut, setModRut] = useState('');
  const [modMotivacion, setModMotivacion] = useState('');

  // Vendedor Form State
  const [localNombre, setLocalNombre] = useState('');
  const [localCategoria, setLocalCategoria] = useState('Almuerzos');
  const [localJunaeb, setLocalJunaeb] = useState(false);
  const [localLat, setLocalLat] = useState(-33.4581);
  const [localLng, setLocalLng] = useState(-70.6642);

  if (!isOpen) return null;

  // Handle Comensal Application Submit
  const handleModSubmit = (e) => {
    e.preventDefault();
    onPostularModerador({
      usuario: modUsuario,
      rut: modRut,
      motivacion: modMotivacion
    });
    setModUsuario('');
    setModRut('');
    setModMotivacion('');
  };

  // Handle Vendedor Local Request Submit
  const handleLocalSubmit = (e) => {
    e.preventDefault();

    onRegisterNewLocal({
      nombre: localNombre,
      categoria: localCategoria,
      aceptaJunaeb: localJunaeb,
      coordenadas: [localLat, localLng],
      menu: []
    });

    setLocalNombre('');
    setLocalCategoria('Almuerzos');
    setLocalJunaeb(false);
    setLocalLat(-33.4581);
    setLocalLng(-70.6642);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-[9990] animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute top-0 bottom-0 right-0 w-[85%] sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-[9991] shadow-2xl p-5 overflow-y-auto flex flex-col gap-4 backdrop-blur-md animate-slide-in-right transition-colors scrollbar-thin">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">👤</span>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Mi Perfil</h3>
              <p className="text-[10px] font-bold text-emerald-500">
                Rol: {activeView === 'comensal' ? 'Comensal' : activeView === 'vendedor' ? 'Vendedor' : activeView === 'admin' ? 'Administrador' : 'Invitado'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content depending on Role */}
        <div className="flex-1 flex flex-col gap-5">
          
          {/* 1. GUEST / INVITADO */}
          {activeView === 'invitado' && (
            <div className="flex flex-col gap-4 animate-scale-up">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                <span className="text-2xl block mb-1 text-center">📝</span>
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 text-center mb-1">Registrar Nueva Cuenta</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mb-4 leading-normal">
                  Crea tu perfil en Beauchef Eats para solicitar locales, administrar stock de menús o moderar la comunidad.
                </p>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!regUsername.trim()) return;
                    onRegisterUser(regUsername.trim(), regRole);
                    setRegUsername('');
                  }}
                  className="flex flex-col gap-3.5"
                >
                  <div>
                    <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block mb-1">Nombre de Usuario</label>
                    <input 
                      type="text" 
                      required
                      placeholder="ej: diego_inge"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block mb-1">Tipo de Cuenta</label>
                    <select 
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-bold transition-colors"
                    >
                      <option value="comensal">Comensal</option>
                      <option value="vendedor">Vendedor / Locatario</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-[0.98] hover:opacity-95"
                  >
                    Crear Cuenta e Habilitar Vista
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 2. COMENSAL PROFILE */}
          {activeView === 'comensal' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              {/* Application Form */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 mb-1">Postulación a Moderador</h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mb-3 leading-normal">
                  Ayuda a mantener la comunidad libre de trolls y reportes falsos. Tu solicitud será evaluada por el Administrador.
                </p>

                <form onSubmit={handleModSubmit} className="flex flex-col gap-3">
                  <div>
                    <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">Usuario de la comunidad</label>
                    <input 
                      type="text" 
                      required
                      placeholder="ej: juan_perez"
                      value={modUsuario}
                      onChange={(e) => setModUsuario(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">RUT / Identificador</label>
                    <input 
                      type="text" 
                      required
                      placeholder="12.345.678-9"
                      value={modRut}
                      onChange={(e) => setModRut(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">Motivo (Breve)</label>
                    <textarea 
                      required
                      rows={2.5}
                      placeholder="¿Por qué deseas sumarte como moderador de la comunidad?"
                      value={modMotivacion}
                      onChange={(e) => setModMotivacion(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-[0.98] hover:opacity-95"
                  >
                    Enviar Solicitud
                  </button>
                </form>
              </div>

              {/* Status Tracker */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Mis Postulaciones</span>
                
                {solicitudesModerador.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 font-sans">
                    {solicitudesModerador.map(app => (
                      <div 
                        key={app.id} 
                        className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px]"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-slate-300">@{app.usuario}</span>
                          <span className="text-[8px] text-slate-400 font-mono">ID: {app.id}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                          app.estado === 'Aprobado' 
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-400' 
                            : app.estado === 'Rechazado' 
                            ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-400' 
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-400'
                        }`}>
                          {app.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center py-2">
                    No has enviado ninguna postulación aún.
                  </p>
                )}
            </div>
          </div>
        )}

          {/* 3. VENDEDOR PROFILE */}
          {activeView === 'vendedor' && (() => {
            const sellerUsername = registeredUser?.username || 'vendedor_demo';
            const hasApprovedLocal = locales.some(l => l.vendedorUsername === sellerUsername);
            const activeRequest = solicitudesVendedor.find(s => s.vendedorUsername === sellerUsername && s.estado === 'Pendiente');
            const hasExisting = hasApprovedLocal || activeRequest;
            const myRequests = solicitudesVendedor.filter(req => req.vendedorUsername === sellerUsername);

            return (
              <div className="flex flex-col gap-5 animate-fade-in">
                {/* Local Registration Form or Status Info Card */}
                {hasExisting ? (
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md">
                    {hasApprovedLocal ? (
                      <div className="text-center py-2">
                        <span className="text-3xl block mb-2">🏪</span>
                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 mb-1">¡Tu local está activo!</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4 leading-normal">
                          Tu local comercial ya se encuentra aprobado y visible para todos los comensales en el mapa.
                        </p>
                        <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900 rounded-lg text-[10px] font-black uppercase font-mono">
                          Estado: Habilitado
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <span className="text-3xl block mb-2">⏳</span>
                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 mb-1">Solicitud en Revisión</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4 leading-normal">
                          Hemos recibido la solicitud para tu local <span className="font-bold text-slate-700 dark:text-slate-200">"{activeRequest.nombre}"</span>. El equipo de administración la está revisando.
                        </p>
                        <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-900 rounded-lg text-[10px] font-black uppercase font-mono animate-pulse">
                          Estado: Pendiente
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 mb-1">Registrar Nuevo Local</h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">
                        Somete a evaluación del Administrador tu local de comida. Tras la aprobación, aparecerás en el mapa oficial.
                      </p>
                    </div>

                    {/* 1:1 Restriction Info Box */}
                    <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 text-[8.5px] text-slate-400 dark:text-slate-500 leading-normal text-left">
                      ⚠️ **Aviso de Restricción 1:1**: Cada cuenta de locatario está restringida a gestionar única y estrictamente un solo local de comida (las franquicias o cadenas múltiples están deshabilitadas).
                    </div>

                    <form onSubmit={handleLocalSubmit} className="flex flex-col gap-3">
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Nombre del Local</label>
                        <input 
                          type="text" 
                          required
                          placeholder="ej: Casino Central FCFM"
                          value={localNombre}
                          onChange={(e) => setLocalNombre(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">Categoría</label>
                          <select 
                            value={localCategoria}
                            onChange={(e) => setLocalCategoria(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-bold transition-colors"
                          >
                            <option value="Almuerzos">Almuerzos</option>
                            <option value="Fast Food">Fast Food</option>
                            <option value="Cafetería">Cafetería</option>
                            <option value="Pastelería">Pastelería</option>
                            <option value="Snacks">Snacks</option>
                          </select>
                        </div>

                        <div className="flex flex-col justify-end pb-1">
                          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 h-9.5">
                            <span className="text-[9px] font-bold text-slate-500">JUNAEB</span>
                            <input 
                              type="checkbox" 
                              checked={localJunaeb}
                              onChange={(e) => setLocalJunaeb(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 border-slate-200 dark:border-slate-800"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Leaflet Map coordinates picker */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block">
                          Ubicación Geográfica (Clic para marcar)
                        </label>
                        <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10">
                          <MapContainer 
                            center={[-33.4581, -70.6642]} 
                            zoom={16} 
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                          >
                            <TileLayer
                              attribution='&copy; OpenStreetMap contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapClickEvents onClick={(latlng) => {
                              setLocalLat(parseFloat(latlng.lat.toFixed(6)));
                              setLocalLng(parseFloat(latlng.lng.toFixed(6)));
                            }} />
                            <Marker position={[localLat, localLng]} icon={pickerIcon} />
                          </MapContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 flex justify-between items-center">
                            <span>Latitud:</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{localLat}</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 flex justify-between items-center">
                            <span>Longitud:</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{localLng}</span>
                          </div>
                        </div>
                      </div>


                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-[0.98] hover:opacity-95"
                      >
                        Enviar Solicitud
                      </button>
                    </form>
                  </div>
                )}

                {/* Solicitudes Tracker */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Estado de mis Locales</span>
                  
                  {myRequests.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      {myRequests.map(req => (
                        <div 
                          key={req.id} 
                          className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px]"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 dark:text-slate-300">🏪 {req.nombre}</span>
                            <span className="text-[8px] text-slate-400 font-mono">{req.categoria} • ID: {req.id}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                            req.estado === 'Aprobado' 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' 
                              : req.estado === 'Rechazado' 
                              ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-400' 
                              : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-400'
                          }`}>
                            {req.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center py-2">
                      No has registrado solicitudes aún.
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 4. ADMINISTRADOR PROFILE */}
          {activeView === 'admin' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 mb-3">Métricas de la Plataforma</h4>

                <div className="grid grid-cols-2 gap-2.5 text-center">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 shadow-sm">
                    <span className="text-lg block">🏪</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 block mt-0.5">{locales.length}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Locales</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 shadow-sm">
                    <span className="text-lg block">✍️</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 block mt-0.5">{reseñas.length}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Reseñas</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 shadow-sm">
                    <span className="text-lg block">🚨</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 block mt-0.5">
                      {reportesList.filter(r => r.estado === 'Pendiente').length} / {reportesList.length}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Reportes Pnd.</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5 shadow-sm">
                    <span className="text-lg block">❤️</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 block mt-0.5">{favoritos.length}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Favoritos Tot.</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/45 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-center">
                <span className="text-2xl block mb-1">💼</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  Usa el panel de navegación para acceder al <span className="font-extrabold text-emerald-500">Panel de Administración</span> completo, donde podrás moderar reportes, aprobar postulaciones a moderador y habilitar nuevos comercios.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="text-center text-[8px] text-slate-400 font-mono pt-3 border-t border-slate-100 dark:border-slate-800">
          Beauchef Eats • Versión 2.0.0
        </div>

      </div>
    </>
  );
}
