import { useState } from 'react';

export default function ProfileView({
  registeredUser,
  favoritos,
  locales,
  onToggleFavorite,
  onGoBack,
  solicitudesModerador,
  onPostularModerador,
  onFilterFavoritesOnMap
}) {
  const modUsuario = registeredUser?.username || '';
  const [modRut, setModRut] = useState('');
  const [modMotivacion, setModMotivacion] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const favLocales = locales.filter(l => favoritos.includes(l.id));

  const handleModSubmit = (e) => {
    e.preventDefault();
    onPostularModerador({
      usuario: modUsuario,
      rut: modRut,
      motivacion: modMotivacion
    });
    setModRut('');
    setModMotivacion('');
    setIsApplying(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6 h-full overflow-y-auto select-none scrollbar-thin">
      
      {/* Header and Back Button */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">👤</div>
          <div>
            <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
              Mi Perfil de Comensal
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Administra tus preferencias, tus locales favoritos y tu postulación a moderador.
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start flex-1 min-h-0">
        
        {/* Left column: User info & Moderator App */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {/* User Details card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Datos de la Cuenta</h3>
            
            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-905">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-lg">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 font-mono">@{registeredUser?.username || 'comensal_demo'}</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Comensal Verificado</span>
              </div>
            </div>
          </div>

          {/* Moderator Postulation card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Postulación a Moderador</h3>
              {!isApplying && (
                <button
                  onClick={() => setIsApplying(true)}
                  className="text-[10px] text-emerald-500 font-black hover:underline"
                >
                  Postular
                </button>
              )}
            </div>
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Ayuda a mantener la FCFM libre de comentarios troll y spam en las reseñas de comida.
            </p>

            {isApplying ? (
              <form onSubmit={handleModSubmit} className="flex flex-col gap-3 mt-2 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850 animate-scale-up">
                <div>
                  <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">RUT / ID</label>
                  <input 
                    type="text" 
                    required
                    placeholder="12.345.678-9"
                    value={modRut}
                    onChange={(e) => setModRut(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">Motivación</label>
                  <textarea 
                    required
                    rows={2.5}
                    placeholder="¿Por qué deseas sumarte como moderador?"
                    value={modMotivacion}
                    onChange={(e) => setModMotivacion(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsApplying(false)}
                    className="flex-1 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 rounded-lg text-[10px] font-bold transition-all active:scale-[0.98]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider transition-all active:scale-[0.98]"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            ) : null}

            {/* List existing Applications */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Mis Solicitudes</span>
              {solicitudesModerador && solicitudesModerador.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                  {solicitudesModerador.map(app => (
                    <div 
                      key={app.id} 
                      className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-[10px] transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-600 dark:text-slate-350">ID Solicitud #{app.id}</span>
                        <span className="text-[8px] text-slate-400 font-mono">Motivo: {app.motivacion.substring(0, 20)}...</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded font-black text-[8px] uppercase ${
                        app.estado === 'Aprobado' 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900' 
                          : app.estado === 'Rechazado' 
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-455 border border-rose-200 dark:border-rose-900' 
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-450 border border-amber-200 dark:border-amber-900'
                      }`}>
                        {app.estado}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 dark:text-slate-500 italic text-center">No has enviado solicitudes aún.</p>
              )}
            </div>

          </div>
        </div>

        {/* Right column: Clean Favorites list */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4 h-full">
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

          <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
            {favLocales.map(local => (
              <div 
                key={local.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center justify-between transition-all"
              >
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs leading-snug">{local.nombre}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{local.categoria} • {local.distanciaKm} km</p>
                  
                  {/* Status badge */}
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
                  title="Quitar de favoritos"
                >
                  ❤️
                </button>
              </div>
            ))}

            {favLocales.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <span className="text-3xl block mb-2">💔</span>
                <p className="text-xs font-bold">No tienes locales marcados como favoritos aún.</p>
                <p className="text-[10px] text-slate-400/80 mt-1 max-w-[240px]">
                  Presiona el icono de corazón en el mapa o en el listado para agregar tus comercios preferidos.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
