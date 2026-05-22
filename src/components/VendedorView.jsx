import { useState } from 'react';

export default function VendedorView({ 
  locales, 
  onUpdateLocalStatus,
  solicitudesVendedor,
  onRegisterNewLocal
}) {
  // Option selected in dropdown: either a local ID (e.g. 1, 2, 3...) or "new_request"
  const [selectedOption, setSelectedOption] = useState(locales[0]?.id || 1);

  // Form states for new local request
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Comida Rápida');
  const [aceptaJunaeb, setAceptaJunaeb] = useState(false);
  const [menuItems, setMenuItems] = useState([
    { item: 'Menú Especial 1', precio: 3000 },
    { item: 'Bebida Mediana', precio: 1200 }
  ]);

  const activeLocal = locales.find(l => l.id === parseInt(selectedOption));

  // Find if there is a pending request associated with the vendor's submitted request
  // Let's filter pending requests from the global state
  const pendingRequests = solicitudesVendedor.filter(s => s.estado === 'Pendiente');
  const approvedRequests = solicitudesVendedor.filter(s => s.estado === 'Aprobado');

  const handleAddMenuItem = () => {
    setMenuItems(prev => [...prev, { item: '', precio: 1000 }]);
  };

  const handleRemoveMenuItem = (idx) => {
    setMenuItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMenuChange = (idx, field, val) => {
    setMenuItems(prev => 
      prev.map((item, i) => i === idx ? { ...item, [field]: field === 'precio' ? parseInt(val) || 0 : val } : item)
    );
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    // Filter out empty menu items
    const finalMenu = menuItems.filter(item => item.item.trim() !== '');
    
    onRegisterNewLocal({
      nombre,
      categoria,
      aceptaJunaeb,
      menu: finalMenu.length > 0 ? finalMenu : [{ item: 'Menú Standard', precio: 3000 }]
    });

    // Reset form
    setNombre('');
    setAceptaJunaeb(false);
    setMenuItems([
      { item: 'Menú Especial 1', precio: 3000 },
      { item: 'Bebida Mediana', precio: 1200 }
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center justify-center h-full overflow-y-auto select-none scrollbar-thin">
      
      {/* Title & Description */}
      <div className="text-center max-w-xl mb-4 shrink-0">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
          Portal de Locatarios
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
          Sincronización de bajo consumo de datos y ancho de banda. Administra la disponibilidad y stock en caliente de tu local o registra uno nuevo.
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl transition-colors">
        
        {/* Dropdown to Identify Local */}
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Identificarse como
          </label>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-bold w-full transition-colors"
          >
            {/* Approved locales list */}
            {locales.map(l => (
              <option key={l.id} value={l.id}>🏪 {l.nombre}</option>
            ))}
            <option value="new_request">➕ Solicitud de Nuevo Local</option>
          </select>
        </div>

        {/* CONDITION A: MANAGE ACTIVE APPROVED LOCAL */}
        {selectedOption !== 'new_request' && activeLocal && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded font-black uppercase font-mono">
                  Aprobado y Visible en el Mapa
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID #{activeLocal.id}</span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-2">{activeLocal.nombre}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-550 font-semibold">{activeLocal.categoria}</p>
              
              <div className="mt-3 flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-250 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estado en vivo:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                  activeLocal.estadoServicio === 'Abierto'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-450'
                    : activeLocal.estadoServicio === 'Sin Stock'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-450'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-450'
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

        {/* CONDITION B: REQUEST NEW LOCAL PORTAL */}
        {selectedOption === 'new_request' && (
          <div className="flex flex-col gap-4">
            
            {/* If there are pending requests, show the status tracker */}
            {pendingRequests.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping"></div>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase font-mono">
                        Pendiente de Aprobación
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-250 mt-2.5">{req.nombre}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">Categoría: {req.categoria}</p>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-500 mt-3 leading-normal">
                      Tu solicitud de local ha sido enviada al Administrador del sistema. La aprobación se reflejará en vivo de inmediato en el mapa de Comensales.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              // Solicitud creation form
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-3">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                  <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Solicitud de Local FCFM</h3>
                  <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-0.5">Postula tu local comercial para aparecer en el mapa geofence.</p>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nombre del Local</label>
                  <input 
                    type="text" 
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. El Carrito Universitario"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Categoría</label>
                  <div className="flex gap-2">
                    {['Comida Rápida', 'Almuerzos', 'Vegana', 'Cafetería'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoria(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          categoria === cat
                            ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-950 font-black'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 transition-colors mt-1">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-950 text-[9px] font-black text-emerald-600 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900">J</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Acepta JUNAEB</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={aceptaJunaeb} 
                      onChange={(e) => setAceptaJunaeb(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4.5 bg-slate-250 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
                  </label>
                </div>

                {/* Initial Menu input */}
                <div className="flex flex-col gap-1.5 mt-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Menú Inicial</label>
                    <button 
                      type="button" 
                      onClick={handleAddMenuItem}
                      className="text-[9px] text-emerald-500 hover:text-emerald-400 font-extrabold uppercase tracking-wider"
                    >
                      + Añadir item
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {menuItems.map((menuItem, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          required
                          value={menuItem.item}
                          placeholder="Nombre plato (ej. Pizza Slice)"
                          onChange={(e) => handleMenuChange(idx, 'item', e.target.value)}
                          className="flex-1 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-colors font-medium"
                        />
                        <input 
                          type="number" 
                          required
                          value={menuItem.precio}
                          placeholder="Precio ($)"
                          onChange={(e) => handleMenuChange(idx, 'precio', e.target.value)}
                          className="w-20 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 font-mono font-bold transition-colors"
                        />
                        {menuItems.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveMenuItem(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all active:scale-[0.98]"
                >
                  Enviar Solicitud al Administrador
                </button>
              </form>
            )}

            {/* Display Rejected Solicitudes if any */}
            {approvedRequests.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-850 pt-3">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Solicitudes Históricas</span>
                <div className="flex flex-col gap-1.5 mt-2">
                  {approvedRequests.map(app => (
                    <div key={app.id} className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>🏪 {app.nombre}</span>
                      <span className="text-emerald-500 font-bold">Aprobado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 transition-colors">
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
          <div className="w-10 h-5.5 bg-slate-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
        </label>
      </div>

      {/* Toggle 2: Stock Availability */}
      <div className={`flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 transition-colors ${
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
          <div className="w-10 h-5.5 bg-slate-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
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
