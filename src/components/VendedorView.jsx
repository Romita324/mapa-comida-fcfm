import { useState } from 'react';

export default function VendedorView({ 
  locales, 
  onUpdateLocalStatus
}) {
  const [selectedOption, setSelectedOption] = useState(locales[0]?.id || '');

  // Ensure we adapt dynamically when locales list changes
  const activeLocal = locales.find(l => l.id === parseInt(selectedOption)) || locales[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center justify-start h-full overflow-y-auto select-none scrollbar-thin">
      
      {/* Title & Description */}
      <div className="text-center max-w-xl mb-6 shrink-0">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
          Portal de Locatarios
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
          Sincronización de bajo consumo de datos y ancho de banda. Administra la disponibilidad y stock en caliente de tu local comercial.
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl transition-colors">
        
        {locales.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* Dropdown to Identify Local */}
            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Seleccionar Local Aprobado
              </label>
              <select
                value={selectedOption || (activeLocal ? activeLocal.id : '')}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-bold w-full transition-colors"
              >
                {locales.map(l => (
                  <option key={l.id} value={l.id}>🏪 {l.nombre}</option>
                ))}
              </select>
            </div>

            {activeLocal && (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded font-black uppercase font-mono">
                      Aprobado y Visible en el Mapa
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID #{activeLocal.id}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-2">{activeLocal.nombre}</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">{activeLocal.categoria}</p>
                  
                  <div className="mt-3 flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estado en vivo:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      activeLocal.estadoServicio === 'Abierto'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                        : activeLocal.estadoServicio === 'Sin Stock'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400'
                    }`}>
                      {activeLocal.estadoServicio}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <MerchantControls 
                  key={activeLocal.id}
                  activeLocal={activeLocal}
                  onUpdateLocalStatus={onUpdateLocalStatus}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center transition-colors">
            <span className="text-3xl block mb-2">🏪</span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Sin locales vinculados</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-normal">
              No tienes locales comerciales aprobados. Abre tu <span className="font-extrabold text-emerald-500">Perfil de Usuario</span> (icono 👤 en la cabecera) para registrar un nuevo local o revisar solicitudes en proceso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MerchantControls({ activeLocal, onUpdateLocalStatus }) {
  const [isOpen, setIsOpen] = useState(activeLocal.estadoServicio !== 'Cerrado');
  const [hasStock, setHasStock] = useState(activeLocal.estadoServicio !== 'Sin Stock');

  const handleSave = () => {
    let finalStatus = 'Cerrado';
    if (isOpen) {
      finalStatus = hasStock ? 'Abierto' : 'Sin Stock';
    }
    onUpdateLocalStatus(activeLocal.id, finalStatus);
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Panel de Control</h4>

      {/* Toggle 1: Open/Closed */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Local Abierto</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">¿Recibir pedidos de Comensales?</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-10 h-5.5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
        </label>
      </div>

      {/* Toggle 2: Stock Availability */}
      <div className={`flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors ${
        !isOpen ? 'opacity-40 pointer-events-none' : ''
      }`}>
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Menú con Stock</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">¿Quedan ingredientes suficientes?</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={hasStock}
            disabled={!isOpen}
            onChange={(e) => setHasStock(e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-10 h-5.5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
        </label>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all active:scale-[0.98]"
      >
        Publicar Estado del Local
      </button>
    </div>
  );
}
