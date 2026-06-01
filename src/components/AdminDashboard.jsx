import { useState, useEffect } from 'react';

export default function AdminDashboard({ 
  locales, 
  reseñas, 
  reportesSeguridad, 
  logAuditoriaAdmin, 
  onResolveReport,
  solicitudesVendedor,
  onApproveLocal,
  onRejectLocal,
  solicitudesModerador,
  onApproveModerador,
  onRejectModerador,
  deviceMode
}) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = deviceMode === 'mobile' || windowWidth < 1024;
  const [adminTab, setAdminTab] = useState('reportes'); // 'reportes' | 'locales' | 'moderadores'
  const [banConfirmData, setBanConfirmData] = useState(null);
  const [banMotive, setBanMotive] = useState('');
  const [discardConfirmData, setDiscardConfirmData] = useState(null);

  // Helper to find the review associated with a report
  const getReviewForReport = (report) => {
    return reseñas.find(r => r.id === report.reseñaId);
  };

  // Helper to find the local name associated with a review
  const getLocalNameForReview = (review) => {
    if (!review) return 'Local desconocido';
    const local = locales.find(l => l.id === review.localId);
    return local ? local.nombre : 'Local desconocido';
  };

  const pendingReports = reportesSeguridad.filter(r => r.estado === 'Pendiente');
  const pendingLocales = solicitudesVendedor.filter(s => s.estado === 'Pendiente');
  const pendingMods = solicitudesModerador.filter(s => s.estado === 'Pendiente');

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 h-full overflow-y-auto select-none scrollbar-thin">
      
      {/* Dashboard Top Header */}
      <div className={`flex border-b border-slate-200 dark:border-slate-800 pb-4 gap-3 shrink-0 ${
        isMobile ? 'flex-col' : 'flex-row items-center justify-between'
      }`}>
        <div>
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
            Panel de Administración y Auditoría
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Gestión anti-fraude, moderación de trolls, aprobación de locales y bitácora transparente de acciones.
          </p>
        </div>
        
        {/* KPI metrics */}
        <div className="flex gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 flex flex-col justify-center min-w-24 shadow-sm transition-colors">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Reportes</span>
            <span className="text-base font-extrabold text-rose-500 font-mono mt-0.5">{pendingReports.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 flex flex-col justify-center min-w-24 shadow-sm transition-colors">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Locales Pen.</span>
            <span className="text-base font-extrabold text-amber-500 font-mono mt-0.5">{pendingLocales.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 flex flex-col justify-center min-w-24 shadow-sm transition-colors">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Auditorías</span>
            <span className="text-base font-extrabold text-emerald-500 font-mono mt-0.5">{logAuditoriaAdmin.length}</span>
          </div>
        </div>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 gap-0.5 shrink-0">
        <button 
          onClick={() => setAdminTab('reportes')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all relative ${
            adminTab === 'reportes' 
              ? 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🛡️ Reportes
          {pendingReports.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[8px] font-black">
              {pendingReports.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setAdminTab('locales')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all relative ${
            adminTab === 'locales' 
              ? 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🏪 Solicitudes Locales
          {pendingLocales.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[8px] font-black">
              {pendingLocales.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setAdminTab('moderadores')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all relative ${
            adminTab === 'moderadores' 
              ? 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🛡️ Moderadores
          {pendingMods.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-teal-500 text-white rounded-full text-[8px] font-black">
              {pendingMods.length}
            </span>
          )}
        </button>
      </div>

      {/* ACTIVE VIEW TAB ROUTER */}
      <div className="flex-1 min-h-0">
        
        {/* TAB 1: REPORTS AND AUDIT LOGS */}
        {adminTab === 'reportes' && (
          <div className={`grid gap-5 items-start ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
            {/* Safety reports */}
            <div className={`${isMobile ? 'w-full' : 'col-span-7'} flex flex-col gap-3`}>
              <div className="flex items-center space-x-2 px-1">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Denuncias de Comentarios Pendientes
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {pendingReports.map(report => {
                  const review = getReviewForReport(report);
                  const localName = getLocalNameForReview(review);

                  return (
                    <div key={report.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow flex flex-col gap-3 transition-colors">
                      <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div>
                          <span className="text-[8px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded font-black uppercase font-mono">
                            {report.motivo || 'Reporte de Comensal'}
                          </span>
                          <h4 className="text-[10px] font-bold text-slate-400 mt-1.5 font-mono">
                            Reporte ID #{report.id}
                          </h4>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40 font-bold">
                          {localName}
                        </span>
                      </div>

                      {review ? (
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5 transition-colors">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">@{review.usuario}</span>
                            <span className="text-amber-500 font-mono text-[9px]">
                              {'★'.repeat(review.calificacion)}
                              {'☆'.repeat(5 - review.calificacion)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                            "{review.comentario}"
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-rose-500 italic transition-colors">
                          La reseña asociada ya fue eliminada o no se encuentra disponible.
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setDiscardConfirmData({ reportId: report.id, reviewId: review?.id, username: review?.usuario })}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
                        >
                          Descartar Reporte
                        </button>
                        <button
                          onClick={() => setBanConfirmData({ reportId: report.id, reviewId: review?.id, username: review?.usuario })}
                          className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold rounded-xl text-xs shadow hover:opacity-95"
                        >
                          Banear Usuario / Borrar
                        </button>
                      </div>
                    </div>
                  );
                })}

                {pendingReports.length === 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow transition-colors">
                    <p className="text-xs font-bold text-slate-400">¡Bandeja de reportes de comensales limpia!</p>
                    <p className="text-[10px] text-slate-505 mt-1">No hay denuncias de trolls pendientes.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Logs Console */}
            <div className={`${isMobile ? 'w-full' : 'col-span-5'} flex flex-col gap-3`}>
              <div className="flex items-center space-x-2 px-1">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                </svg>
                <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Log de Auditoría Inmutable
                </h3>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow flex flex-col transition-colors">
                <div className="bg-slate-950 border border-slate-900 dark:border-slate-900/60 rounded-xl p-3.5 font-mono text-[10px] leading-relaxed text-emerald-400/90 max-h-96 overflow-y-auto scrollbar-thin flex flex-col gap-2">
                  {logAuditoriaAdmin.map(log => (
                    <div key={log.id} className="py-1.5 border-b border-slate-900 last:border-0">
                      <div className="flex justify-between items-center text-[9px] text-slate-500 mb-1">
                        <span>[UTC] {log.fecha}</span>
                        <span className="text-emerald-500 font-bold">#AUD-{log.id}</span>
                      </div>
                      <p className="text-slate-300 break-words leading-tight">{log.accion}</p>
                    </div>
                  ))}
                  {logAuditoriaAdmin.length === 0 && (
                    <p className="text-slate-600 italic text-center py-4">Consola de auditoría vacía.</p>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-3 text-center leading-normal">
                  * Registros protegidos con hash criptográfico simulado anti-colusión.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VENDOR LOCAL APPROVALS */}
        {adminTab === 'locales' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center space-x-2 px-1">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></div>
              <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Solicitudes de Nuevos Vendedores
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {pendingLocales.map(req => (
                <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow flex flex-col gap-3 transition-colors">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <span className="text-[8px] bg-amber-100 dark:bg-amber-955 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900 px-2.5 py-0.5 rounded font-black uppercase font-mono">
                        Petición de Vendedor
                      </span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2">{req.nombre}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{req.categoria}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ubicación Coordinadas</span>
                      <p className="font-mono text-slate-600 dark:text-slate-300">{req.coordenadas[0].toFixed(5)}, {req.coordenadas[1].toFixed(5)}</p>
                      <p className="text-[9px] text-emerald-500 font-bold mt-1">Acepta JUNAEB: {req.aceptaJunaeb ? 'Sí' : 'No'}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Menú Inicial Declarado</span>
                      <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                        {req.menu.map((menuItem, idx) => (
                          <div key={idx} className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono">
                            <span>{menuItem.item}</span>
                            <span>${menuItem.precio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onRejectLocal(req.id)}
                      className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-505 font-bold rounded-xl text-xs transition-colors"
                    >
                      Rechazar Ingreso
                    </button>
                    <button
                      onClick={() => onApproveLocal(req.id)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow hover:opacity-95"
                    >
                      Aprobar e Incorporar al Mapa
                    </button>
                  </div>
                </div>
              ))}

              {pendingLocales.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow transition-colors">
                  <p className="text-xs font-bold text-slate-400">Sin solicitudes de locales pendientes.</p>
                  <p className="text-[10px] text-slate-500 mt-1">Los comerciantes registrados están todos activos.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MODERATOR APPLICATION MANAGEMENT */}
        {adminTab === 'moderadores' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center space-x-2 px-1">
              <div className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse"></div>
              <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Postulaciones de Comensales a Moderadores
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {pendingMods.map(app => (
                <div key={app.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow flex flex-col gap-3 transition-colors">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <span className="text-[8px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-400 border border-teal-200 dark:border-teal-900/60 px-2.5 py-0.5 rounded font-black uppercase font-mono">
                        Postulación Moderador
                      </span>
                      <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                        @{app.usuario}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">RUT: {app.rut}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Carta de Motivación</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                      "{app.motivacion}"
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onRejectModerador(app.id)}
                      className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-505 font-bold rounded-xl text-xs transition-colors"
                    >
                      Rechazar Solicitud
                    </button>
                    <button
                      onClick={() => onApproveModerador(app.id)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow hover:opacity-95"
                    >
                      Aprobar y Promover a Moderador
                    </button>
                  </div>
                </div>
              ))}

              {pendingMods.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow transition-colors">
                  <p className="text-xs font-bold text-slate-400">Sin postulaciones de moderadores pendientes.</p>
                  <p className="text-[10px] text-slate-500 mt-1">Los comensales postulados han sido resueltos.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Ban Confirmation Modal */}
      {banConfirmData && (
        <div className="fixed inset-0 z-[10002] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-scale-up text-center flex flex-col gap-4">
            <span className="text-3xl block">⚠️</span>
            <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 uppercase tracking-wider">Confirmar Acción Irreversible</h3>
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Estás a punto de banear al usuario <span className="font-extrabold text-rose-500 font-mono">@{banConfirmData.username}</span> y eliminar permanentemente su reseña. Esta acción se registrará de forma inmutable en la bitácora de auditoría.
            </p>

            <div className="text-left">
              <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">Motivo del Baneo (Obligatorio)</label>
              <textarea
                required
                rows={2}
                value={banMotive}
                onChange={(e) => setBanMotive(e.target.value)}
                placeholder="Indica la justificación legal/técnica..."
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-rose-500 text-slate-850 dark:text-slate-200 resize-none font-sans"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setBanConfirmData(null);
                  setBanMotive('');
                }}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-[10px] font-bold transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!banMotive.trim()}
                onClick={() => {
                  onResolveReport(banConfirmData.reportId, 'banear', banConfirmData.reviewId, banConfirmData.username, banMotive.trim());
                  setBanConfirmData(null);
                  setBanMotive('');
                }}
                className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-red-500 disabled:opacity-40 disabled:from-rose-500 disabled:to-rose-500 text-white rounded-xl text-[10px] font-black shadow-md transition-all active:scale-[0.98]"
              >
                Confirmar y Registrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Discard Confirmation Modal */}
      {discardConfirmData && (
        <div className="fixed inset-0 z-[10002] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-scale-up text-center flex flex-col gap-4">
            <span className="text-3xl block">🛡️</span>
            <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 uppercase tracking-wider">Confirmar Descarte de Reporte</h3>
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              ¿Estás seguro de que deseas descartar el reporte sobre el comentario del usuario <span className="font-extrabold text-emerald-500">@{discardConfirmData.username}</span>? El comentario se mantendrá visible en la plataforma y el reporte será archivado.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDiscardConfirmData(null)}
                className="flex-1 py-2 border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-[10px] font-bold transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResolveReport(discardConfirmData.reportId, 'descartar', discardConfirmData.reviewId, discardConfirmData.username);
                  setDiscardConfirmData(null);
                }}
                className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-xl text-[10px] font-black shadow-md transition-all active:scale-[0.98]"
              >
                Confirmar Descarte
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
