import { useState } from 'react';

export default function VendedorView({ locales, onUpdateLocalStatus }) {
  const [selectedLocalId, setSelectedLocalId] = useState(locales[0]?.id || 1);
  const activeLocal = locales.find(l => l.id === selectedLocalId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      {/* Title & Description of Low-Cost Merchant Sync */}
      <div className="text-center max-w-xl mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
          Portal de Locatarios
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Interfaz optimizada para bajo consumo de datos y ancho de banda. Los comerciantes actualizan su stock en un click, mitigando los costos de infraestructura y de GPS continuo.
        </p>
      </div>

      {/* Simulated Mobile Device Chassis */}
      <div className="relative w-80 h-[560px] rounded-[36px] border-[8px] border-slate-800 bg-slate-950 shadow-2xl flex flex-col overflow-hidden ring-4 ring-slate-900">
        
        {/* Mobile Speaker & Notch */}
        <div className="absolute top-0 inset-x-0 h-5 bg-slate-850 flex items-center justify-between px-6 z-30">
          <span className="text-[10px] text-slate-400 font-mono font-medium">12:30</span>
          <div className="w-16 h-3 bg-slate-950 rounded-b-lg mx-auto"></div>
          <div className="flex space-x-1 items-center">
            {/* Battery / Wifi icons */}
            <div className="w-2.5 h-2 bg-emerald-500 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-sm"></div>
          </div>
        </div>

        {/* Form keyed by selectedLocalId to reset state cleanly on selection change */}
        {activeLocal && (
          <MerchantForm 
            key={activeLocal.id} 
            activeLocal={activeLocal} 
            locales={locales} 
            selectedLocalId={selectedLocalId} 
            setSelectedLocalId={setSelectedLocalId} 
            onUpdateLocalStatus={onUpdateLocalStatus} 
          />
        )}

      </div>
    </div>
  );
}

function MerchantForm({ 
  activeLocal, 
  locales, 
  selectedLocalId, 
  setSelectedLocalId, 
  onUpdateLocalStatus 
}) {
  const [isOpen, setIsOpen] = useState(activeLocal.estadoServicio !== 'Cerrado');
  const [hasStock, setHasStock] = useState(activeLocal.estadoServicio !== 'Sin Stock');
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    let finalStatus = 'Cerrado';
    if (isOpen) {
      finalStatus = hasStock ? 'Abierto' : 'Sin Stock';
    }
    
    onUpdateLocalStatus(activeLocal.id, finalStatus);
    
    // Trigger animated feedback
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col pt-6 p-5 relative overflow-y-auto justify-between">
      <div>
        {/* Merchant Selector Dropdown */}
        <div className="flex flex-col gap-1.5 mb-5 mt-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identificarse como</label>
          <select
            value={selectedLocalId}
            onChange={(e) => setSelectedLocalId(parseInt(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold w-full"
          >
            {locales.map(l => (
              <option key={l.id} value={l.id}>{l.nombre}</option>
            ))}
          </select>
        </div>

        {/* Local Status Display Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded font-black uppercase font-mono">
            CONECTADO
          </span>
          <h3 className="font-extrabold text-sm text-slate-100 mt-2">{activeLocal.nombre}</h3>
          <p className="text-[11px] text-slate-400">{activeLocal.categoria}</p>
          
          <div className="mt-3.5 flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-850">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Estado Actual:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              activeLocal.estadoServicio === 'Abierto'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                : activeLocal.estadoServicio === 'Sin Stock'
                ? 'bg-amber-950 text-amber-400 border border-amber-900'
                : 'bg-rose-950 text-rose-400 border border-rose-900'
            }`}>
              {activeLocal.estadoServicio}
            </span>
          </div>
        </div>

        {/* Interactive Controls Form */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Panel de Control</h4>

          {/* Toggle 1: Open/Closed */}
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-850">
            <div>
              <p className="text-xs font-bold text-slate-200">Local Abierto</p>
              <p className="text-[10px] text-slate-500">¿Recibir pedidos en FCFM?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
            </label>
          </div>

          {/* Toggle 2: Stock Availability */}
          <div className={`flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-850 transition-all ${
            !isOpen ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div>
              <p className="text-xs font-bold text-slate-200">Menú con Stock</p>
              <p className="text-[10px] text-slate-500">¿Quedan ingredientes / platos?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={hasStock}
                disabled={!isOpen}
                onChange={(e) => setHasStock(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-4">
        {/* Action Update Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
        >
          Publicar Cambios
        </button>

        {/* Home Indicator bar */}
        <div className="flex items-center justify-center">
          <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
        </div>
      </div>

      {/* Integrated Live Mobile Toast Feedback */}
      {showToast && (
        <div className="absolute bottom-16 inset-x-6 bg-emerald-950 border border-emerald-700 p-3.5 rounded-xl shadow-xl z-50 text-center animate-fade-in-up">
          <p className="text-xs font-bold text-emerald-400">¡Servidor Actualizado!</p>
          <p className="text-[9px] text-emerald-400/80 mt-0.5">El estado del mapa se modificó en caliente.</p>
        </div>
      )}
    </div>
  );
}
