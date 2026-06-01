import { useState } from 'react';

export default function ProfileView({
  registeredUser,
  favoritos = [],
  locales = [],
  onToggleFavorite,
  onGoBack,
  solicitudesModerador = [],
  onPostularModerador,
  onFilterFavoritesOnMap,
  solicitudesVendedor = [],
  onUpdateUserDetails,
  onGoToRegister,
  addToast
}) {
  const isGuest = !registeredUser;
  const role = registeredUser?.role || 'invitado';

  // Basic Info Form States
  const [comNombre, setComNombre] = useState(registeredUser?.nombre || '');
  const [comApellido, setComApellido] = useState(registeredUser?.apellido || '');
  const [comPreferencia, setComPreferencia] = useState(registeredUser?.preferencias || 'Ninguna');

  const [venNombreLocatario, setVenNombreLocatario] = useState(registeredUser?.nombreLocatario || '');
  const [venTelefono, setVenTelefono] = useState(registeredUser?.telefono || '');

  // Password Form States
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Moderator Apply State
  const [modRut, setModRut] = useState('');
  const [modMotivacion, setModMotivacion] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Filter local for Vendedor
  const myLocal = role === 'vendedor' 
    ? locales.find(l => l.vendedorUsername === registeredUser?.username || (registeredUser?.username === 'vendedor_demo' && l.id === 1))
    : null;

  const mySolicitud = role === 'vendedor'
    ? solicitudesVendedor.find(s => s.vendedorUsername === registeredUser?.username)
    : null;

  const favLocales = locales.filter(l => favoritos.includes(l.id));

  // Handlers
  const handleSaveDetails = (e) => {
    e.preventDefault();
    if (role === 'comensal') {
      onUpdateUserDetails({
        nombre: comNombre,
        apellido: comApellido,
        preferencias: comPreferencia
      });
      if (addToast) addToast("Datos de perfil actualizados", "success");
    } else if (role === 'vendedor') {
      onUpdateUserDetails({
        nombreLocatario: venNombreLocatario,
        telefono: venTelefono
      });
      if (addToast) addToast("Datos del locatario actualizados", "success");
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currPassword || !newPassword) {
      if (addToast) addToast("Por favor complete todos los campos de contraseña", "error");
      return;
    }
    // Simulate successful password update
    setCurrPassword('');
    setNewPassword('');
    if (addToast) addToast("Contraseña cambiada exitosamente", "success");
  };

  const handleModSubmit = (e) => {
    e.preventDefault();
    onPostularModerador({
      usuario: registeredUser?.username || 'comensal_demo',
      rut: modRut,
      motivacion: modMotivacion
    });
    setModRut('');
    setModMotivacion('');
    setIsApplying(false);
  };

  // Rendering Helper for Left Column (User card & editing forms)
  const renderLeftColumn = () => {
    if (role === 'comensal') {
      return (
        <div className="flex flex-col gap-5">
          {/* Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl">
              C
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none">@{registeredUser?.username}</h4>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Comensal Verificado</p>
              <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">{registeredUser?.correo}</p>
            </div>
          </div>

          {/* Edit basic info */}
          <form onSubmit={handleSaveDetails} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Editar Datos Personales</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={comNombre} 
                  onChange={(e) => setComNombre(e.target.value)} 
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                />
              </div>
              <div>
                <label className="text-[8px] text-slate-455 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">Apellido</label>
                <input 
                  type="text" 
                  value={comApellido} 
                  onChange={(e) => setComApellido(e.target.value)} 
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-[8px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">Preferencia Alimentaria</label>
              <select 
                value={comPreferencia} 
                onChange={(e) => setComPreferencia(e.target.value)} 
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-bold transition-colors"
              >
                <option value="Ninguna">Ninguna / Todo</option>
                <option value="Vegana">Vegana</option>
                <option value="Vegetariana">Vegetariana</option>
                <option value="Sin Gluten">Sin Gluten</option>
                <option value="Apto para Celíacos">Apto para Celíacos</option>
                <option value="Hipocalórica">Hipocalórica</option>
              </select>
            </div>
            <button type="submit" className="w-full py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-[0.98]">
              Guardar Cambios
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Cambiar Contraseña</h3>
            <div>
              <label className="text-[8px] text-slate-455 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">Contraseña Actual</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={currPassword} 
                onChange={(e) => setCurrPassword(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono transition-colors"
              />
            </div>
            <div>
              <label className="text-[8px] text-slate-455 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">Nueva Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono transition-colors"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-slate-900 dark:bg-slate-850 hover:bg-slate-850 text-white font-black rounded-xl text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-[0.98]">
              Actualizar Contraseña
            </button>
          </form>
        </div>
      );
    } else if (role === 'vendedor') {
      return (
        <div className="flex flex-col gap-5">
          {/* Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-450 flex items-center justify-center font-black text-xl">
              V
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none">@{registeredUser?.username}</h4>
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">Locatario Verificado</p>
              <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">{registeredUser?.correo}</p>
            </div>
          </div>

          {/* Edit basic info */}
          <form onSubmit={handleSaveDetails} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Datos del Locatario</h3>
            <div>
              <label className="text-[8px] text-slate-455 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">Nombre Locatario</label>
              <input 
                type="text" 
                value={venNombreLocatario} 
                onChange={(e) => setVenNombreLocatario(e.target.value)} 
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-[8px] text-slate-455 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">Teléfono</label>
              <input 
                type="text" 
                value={venTelefono} 
                onChange={(e) => setVenTelefono(e.target.value)} 
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono transition-colors"
              />
            </div>
            <div className="opacity-75">
              <label className="text-[8px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">RUT / Identificación</label>
              <input 
                type="text" 
                disabled 
                value={registeredUser?.rut || '12.345.678-9'} 
                className="w-full text-xs p-2 rounded-lg bg-slate-50 text-slate-500 border border-slate-250 font-mono cursor-not-allowed"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-[0.98]">
              Guardar Cambios
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">Cambiar Contraseña</h3>
            <div>
              <label className="text-[8px] text-slate-455 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">Contraseña Actual</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={currPassword} 
                onChange={(e) => setCurrPassword(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono transition-colors"
              />
            </div>
            <div>
              <label className="text-[8px] text-slate-455 dark:text-slate-500 uppercase tracking-widest font-black block mb-1">Nueva Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono transition-colors"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-slate-900 dark:bg-slate-850 hover:bg-slate-850 text-white font-black rounded-xl text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-[0.98]">
              Actualizar Contraseña
            </button>
          </form>
        </div>
      );
    } else {
      // Guest
      return (
        <div className="flex flex-col gap-5 blur-[1.5px] pointer-events-none select-none">
          {/* Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-850 text-slate-400 flex items-center justify-center font-black text-xl">
              I
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-850">@invitado</h4>
              <p className="text-[9px] font-black text-slate-550 uppercase tracking-widest mt-1">Usuario Invitado</p>
            </div>
          </div>

          {/* Edit basic info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Editar Datos</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8px] text-slate-400 uppercase tracking-widest block mb-1">Nombre</label>
                <input type="text" disabled value="Invitado" className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200" />
              </div>
              <div>
                <label className="text-[8px] text-slate-400 uppercase tracking-widest block mb-1">Apellido</label>
                <input type="text" disabled value="" className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200" />
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Rendering Helper for Right Column
  const renderRightColumn = () => {
    if (role === 'comensal') {
      return (
        <div className="flex flex-col gap-4 h-full">
          {/* Favorites Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Locales Favoritos ({favLocales.length})</h3>
              {favLocales.length > 0 && (
                <button
                  onClick={onFilterFavoritesOnMap}
                  className="px-2.5 py-1 bg-rose-500 text-white font-black rounded-lg text-[9px] uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] flex items-center space-x-1"
                >
                  <span>❤️ Aislar en el Mapa</span>
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 max-h-72 scrollbar-thin">
              {favLocales.map(local => (
                <div 
                  key={local.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center justify-between transition-all"
                >
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs leading-snug">{local.nombre}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{local.categoria} • {local.distanciaKm} km</p>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono mt-1.5 ${
                      local.estadoServicio === 'Abierto'
                        ? 'bg-emerald-100 text-emerald-800'
                        : local.estadoServicio === 'Colación'
                        ? 'bg-orange-100 text-orange-850'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {local.estadoServicio}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(local.id)}
                    className="p-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-rose-100/30 text-rose-500 transition-colors"
                  >
                    ❤️
                  </button>
                </div>
              ))}

              {favLocales.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-slate-400">
                  <span className="text-2xl block mb-1">💔</span>
                  <p className="text-[10px] font-bold">Sin locales favoritos aún.</p>
                </div>
              )}
            </div>
          </div>

          {/* Moderator Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Postulación a Moderador</h3>
              {!isApplying && (
                <button onClick={() => setIsApplying(true)} className="text-[10px] text-emerald-500 font-black hover:underline">
                  Postular
                </button>
              )}
            </div>
            
            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Ayuda a moderar los comentarios troll de las reseñas de comida.
            </p>

            {isApplying ? (
              <form onSubmit={handleModSubmit} className="flex flex-col gap-3 mt-2 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850 animate-scale-up">
                <div>
                  <label className="text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">RUT / ID</label>
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
                  <label className="text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">Motivación</label>
                  <textarea 
                    required
                    rows={2}
                    placeholder="¿Por qué deseas sumarte como moderador?"
                    value={modMotivacion}
                    onChange={(e) => setModMotivacion(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 resize-none transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsApplying(false)} className="flex-1 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg text-[9px] font-bold">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider">
                    Enviar
                  </button>
                </div>
              </form>
            ) : null}

            {/* Application status list */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-2.5 mt-2 flex flex-col gap-2 max-h-36 overflow-y-auto scrollbar-thin">
              {solicitudesModerador && solicitudesModerador.length > 0 ? (
                solicitudesModerador.map(app => (
                  <div key={app.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-[10px]">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-600 dark:text-slate-350">ID Solicitud #{app.id}</span>
                      <span className="text-[8.5px] text-slate-400 font-mono">Motivo: {app.motivacion.substring(0, 20)}...</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded font-black text-[8px] uppercase ${
                      app.estado === 'Aprobado' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : app.estado === 'Rechazado' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {app.estado}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[9px] text-slate-400 italic text-center">No has enviado solicitudes aún.</p>
              )}
            </div>
          </div>
        </div>
      );
    } else if (role === 'vendedor') {
      return (
        <div className="flex flex-col gap-4 h-full">
          {/* Vendedor Local Status Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4 flex-1">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Estado de mi Local</h3>
            </div>

            <div className="flex-1 flex flex-col gap-3 justify-center items-stretch">
              {myLocal ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-snug">{myLocal.nombre}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{myLocal.categoria}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                      myLocal.estadoServicio === 'Abierto'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : myLocal.estadoServicio === 'Colación'
                        ? 'bg-orange-100 text-orange-850 border border-orange-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {myLocal.estadoServicio}
                    </span>
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-850 pt-2 flex flex-col gap-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Convenio JUNAEB:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{myLocal.aceptaJunaeb ? 'Acepta' : 'No Acepta'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Carta / Menú:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{(myLocal.menu || []).length} productos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ubicación:</span>
                      <span className="font-mono text-slate-500">[{myLocal.coordenadas?.join(', ')}]</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={onGoBack}
                    className="w-full mt-1.5 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] text-center"
                  >
                    Gestionar en Panel de Locatario
                  </button>
                </div>
              ) : mySolicitud ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Solicitud de Local</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                      mySolicitud.estado === 'Aprobado'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : mySolicitud.estado === 'Rechazado'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {mySolicitud.estado}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs mt-1">{mySolicitud.nombre}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Categoría: {mySolicitud.categoria}</p>
                  <p className="text-[9.5px] text-slate-400 dark:text-slate-550 mt-1 leading-relaxed italic">
                    Su solicitud está siendo auditada por el Administrador. Recibirá una notificación reactiva una vez aprobada.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400">
                  <span className="text-3xl block mb-2">🏪</span>
                  <p className="text-xs font-bold">Sin locales registrados</p>
                  <p className="text-[9.5px] text-slate-400/80 mt-1 max-w-[220px]">
                    No se encontró ningún local o solicitud de registro asociado a este perfil de Vendedor.
                  </p>
                  <button
                    onClick={onGoBack}
                    className="mt-3 px-3 py-1.5 bg-slate-950 dark:bg-slate-800 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider shadow-sm transition-all"
                  >
                    Ir al Panel Vendedor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // Guest Column
      return (
        <div className="flex flex-col gap-4 h-full blur-[1.5px] pointer-events-none select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4 flex-1">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Locales Favoritos</h3>
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-slate-400">
              <span className="text-xl block mb-1">❤️</span>
              <p className="text-[10px] font-bold">Inicia sesión para ver favoritos.</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6 h-full overflow-y-auto select-none scrollbar-thin relative">
      
      {/* Header and Back Button */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">👤</div>
          <div>
            <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
              {role === 'comensal' ? 'Mi Perfil de Comensal' : role === 'vendedor' ? 'Mi Perfil de Vendedor' : 'Perfil de Invitado'}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {role === 'comensal' 
                ? 'Administra tus preferencias, tus locales favoritos y tu postulación a moderador.' 
                : role === 'vendedor'
                ? 'Administra tus datos de contacto, contraseña y revisa el estado de tu comercio.'
                : 'Registra tu perfil en la demo para desbloquear las funcionalidades de personalización.'}
            </p>
          </div>
        </div>
        <button
          onClick={onGoBack}
          className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-[0.98]"
        >
          <span>🗺️ Volver al Mapa</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start flex-1 min-h-0 relative">
        
        {/* Left Column */}
        <div className="md:col-span-5">
          {renderLeftColumn()}
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 h-full">
          {renderRightColumn()}
        </div>

        {/* Guest Lock Warning Overlay */}
        {isGuest && (
          <div className="absolute inset-0 bg-slate-100/60 dark:bg-slate-950/70 backdrop-blur-md z-[20] flex items-center justify-center p-4 rounded-3xl">
            <div className="bg-amber-50 dark:bg-slate-900 border border-amber-300 dark:border-amber-900/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-up text-center flex flex-col gap-4 ring-8 ring-amber-500/5">
              <span className="text-3xl block">⚠️</span>
              <h3 className="text-sm font-black text-amber-850 dark:text-amber-400 uppercase tracking-wider">Perfil Bloqueado</h3>
              <p className="text-[11px] text-amber-900/90 dark:text-slate-350 leading-relaxed font-bold">
                Para acceder a las configuraciones de perfil, favoritos y reportes debes estar registrado en la plataforma.
              </p>
              
              <button
                type="button"
                onClick={onGoToRegister}
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-amber-500 to-yellow-400 dark:from-emerald-500 dark:to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-[0.98] hover:opacity-95 text-center cursor-pointer"
              >
                Registrarme en la plataforma
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
