
export default function AdminView({ 
  locales, 
  reseñas, 
  reportesSeguridad, 
  logAuditoriaAdmin, 
  onResolveReport 
}) {
  
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8 min-h-[calc(100vh-100px)]">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            Panel de Seguridad y Auditoría
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión anti-fraude, moderación de trolls y bitácora transparente de acciones administrativas.
          </p>
        </div>
        
        {/* KPI metrics */}
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-col justify-center min-w-32 shadow-md">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Pendientes</span>
            <span className="text-xl font-bold text-rose-500 font-mono mt-0.5">{pendingReports.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-col justify-center min-w-32 shadow-md">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Auditoría</span>
            <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{logAuditoriaAdmin.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SECTION A: SAFETY REPORTS (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
            <h3 className="text-md font-bold text-slate-200 uppercase tracking-wider text-xs">
              Reportes de Seguridad Pendientes
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {pendingReports.map(report => {
              const review = getReviewForReport(report);
              const localName = getLocalNameForReview(review);

              return (
                <div key={report.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                  {/* Report Card Header */}
                  <div className="flex justify-between items-start border-b border-slate-950 pb-3">
                    <div>
                      <span className="text-[9px] bg-rose-950 text-rose-400 border border-rose-900/60 px-2 py-0.5 rounded-md font-black uppercase font-mono">
                        {report.motivo || 'Reporte de Comensal'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-400 mt-2 font-mono">
                        Reporte ID #{report.id}
                      </h4>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/40 font-bold font-mono">
                      {localName}
                    </span>
                  </div>

                  {/* Review Content */}
                  {review ? (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-400">@{review.usuario}</span>
                        <span className="text-amber-400 font-mono text-[10px]">
                          {Array.from({ length: review.calificacion }).map(() => '★').join('')}
                          {Array.from({ length: 5 - review.calificacion }).map(() => '☆').join('')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{review.comentario}"
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs text-rose-400 italic">
                      La reseña asociada ya fue eliminada o no se encuentra disponible.
                    </div>
                  )}

                  {/* Actions Buttons */}
                  <div className="flex justify-end gap-2.5">
                    {/* Discard */}
                    <button
                      onClick={() => onResolveReport(report.id, 'descartar', review?.id, review?.usuario)}
                      className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-slate-100 font-bold rounded-xl text-xs transition-all active:scale-[0.98]"
                    >
                      Descartar Denuncia
                    </button>
                    {/* Ban and Delete */}
                    <button
                      onClick={() => onResolveReport(report.id, 'banear', review?.id, review?.usuario)}
                      className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-950/20 active:scale-[0.98]"
                    >
                      Banear Usuario / Borrar Reseña
                    </button>
                  </div>
                </div>
              );
            })}

            {pendingReports.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 mx-auto text-slate-700 mb-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 1 12 2.714Z" />
                </svg>
                <p className="text-sm font-semibold text-slate-400">¡Bandeja de reportes despejada!</p>
                <p className="text-xs text-slate-500 mt-1">No hay denuncias de comensales pendientes de revisión.</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION B: AUDIT LOGS (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-full">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
            </svg>
            <h3 className="text-md font-bold text-slate-200 uppercase tracking-wider text-xs">
              Log de Auditoría de Moderadores
            </h3>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-950 pb-3 mb-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historial de Moderaciones</span>
              <span className="text-[9px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30 font-black font-mono">INMUTABLE</span>
            </div>

            {/* Terminal look console box */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 flex-1 overflow-y-auto max-h-[420px] custom-scrollbar flex flex-col gap-3">
              {logAuditoriaAdmin.map(log => (
                <div key={log.id} className="py-2 border-b border-slate-900 last:border-0 hover:bg-slate-900/30 px-1.5 rounded transition-colors">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                    <span>[UTC] {log.fecha}</span>
                    <span className="text-emerald-500 font-bold">#AUD-{log.id}</span>
                  </div>
                  <p className="text-slate-300 break-words leading-tight">{log.accion}</p>
                </div>
              ))}
              
              {logAuditoriaAdmin.length === 0 && (
                <p className="text-slate-600 italic text-center py-6">Consola vacía. Sin auditorías registradas.</p>
              )}
            </div>
            
            <p className="text-[10px] text-slate-500 mt-4 leading-normal text-center">
              * El log de auditoría simula una firma digital inmutable para prevenir la colusión entre locatarios y administradores maliciosos.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
