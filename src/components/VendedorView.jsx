import { useState } from 'react';

export default function VendedorView({ 
  locales = [], 
  onUpdateLocalStatus,
  registeredUser,
  onUpdateLocalMenu,
  onUpdateLocalTags,
  solicitudesVendedor = [],
  onRegisterNewLocal,
  onToggleLocalJunaeb
}) {
  const isDemo = !registeredUser || registeredUser.username === 'vendedor_demo';
  
  // Filter locales list to show only the logged in user's local
  const myLocales = isDemo 
    ? locales 
    : locales.filter(l => l.vendedorUsername === registeredUser.username);

  const [selectedOption, setSelectedOption] = useState('');
  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'menu'
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [confirmItem, setConfirmItem] = useState(null);

  // Registration Modal States
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regLocalNombre, setRegLocalNombre] = useState('');
  const [regLocalCategoria, setRegLocalCategoria] = useState('Casino');
  const [regLocalJunaeb, setRegLocalJunaeb] = useState(true);
  const [regLocalPreset, setRegLocalPreset] = useState('Patio Central');
  const [regLocalMenu, setRegLocalMenu] = useState([]);
  const [tempItemName, setTempItemName] = useState('');
  const [tempItemPrice, setTempItemPrice] = useState('');

  // Location Presets
  const locationPresets = {
    'Patio Central': [-33.4581, -70.6642],
    'Beauchef 851': [-33.4568, -70.6636],
    'Entrada Blanco Encalada': [-33.4572, -70.6645],
    'Edificio Física': [-33.4588, -70.6648],
    'Edificio Geología': [-33.4576, -70.6651],
  };

  // Check if they have a pending request
  const pendingSolicitud = solicitudesVendedor.find(
    s => s.vendedorUsername === registeredUser?.username && s.estado === 'Pendiente'
  );

  // Ensure we adapt dynamically when myLocales changes
  const activeLocal = myLocales.find(l => l.id === parseInt(selectedOption)) || myLocales[0];

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice) return;
    const priceVal = parseInt(newProductPrice);
    if (isNaN(priceVal) || priceVal <= 0) {
      alert("El precio debe ser un número positivo.");
      return;
    }
    const newItem = {
      item: newProductName.trim(),
      precio: priceVal,
      agotado: false
    };
    const updatedMenu = [...(activeLocal.menu || []), newItem];
    onUpdateLocalMenu(activeLocal.id, updatedMenu);
    setNewProductName('');
    setNewProductPrice('');
  };

  const handleToggleStock = (foodItem) => {
    const updatedMenu = (activeLocal.menu || []).map(m => {
      if (m.item === foodItem.item) {
        return { ...m, agotado: !m.agotado };
      }
      return m;
    });
    onUpdateLocalMenu(activeLocal.id, updatedMenu);
    setConfirmItem(null);
  };

  const handleAddTempItem = (e) => {
    e.preventDefault();
    if (!tempItemName.trim() || !tempItemPrice) return;
    const priceVal = parseInt(tempItemPrice);
    if (isNaN(priceVal) || priceVal <= 0) return;
    
    setRegLocalMenu(prev => [...prev, { item: tempItemName.trim(), precio: priceVal }]);
    setTempItemName('');
    setTempItemPrice('');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regLocalNombre.trim()) return;

    onRegisterNewLocal({
      nombre: regLocalNombre.trim(),
      categoria: regLocalCategoria,
      aceptaJunaeb: regLocalJunaeb,
      menu: regLocalMenu,
      coordenadas: locationPresets[regLocalPreset]
    });

    // Reset Form
    setRegLocalNombre('');
    setRegLocalCategoria('Casino');
    setRegLocalJunaeb(true);
    setRegLocalPreset('Patio Central');
    setRegLocalMenu([]);
    setIsRegModalOpen(false);
  };

  const states = [
    { name: 'Abierto', label: '🟢 Abierto', active: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' },
    { name: 'Colación', label: '⏰ Colación', active: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400' },
    { name: 'Sin Stock', label: '⚠️ Sin Stock', active: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' },
    { name: 'Cerrado', label: '🔴 Cerrado', active: 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455' }
  ];

  // EMPTY STATE FLOW
  if (myLocales.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center justify-start h-full overflow-y-auto select-none scrollbar-thin">
        {/* Title & Description */}
        <div className="text-center max-w-xl mb-6 shrink-0">
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
            Portal de Locatarios
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
            Sincronización de bajo consumo de datos. Administra la disponibilidad y stock de tu local.
          </p>
        </div>

        {/* Empty State Screen */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl transition-colors">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center transition-colors flex flex-col gap-4">
            <span className="text-4xl block">🏪</span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Usted aún no tiene ningún local registrado en el sistema</h4>
            
            {pendingSolicitud ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/25 border border-amber-250 dark:border-amber-900 rounded-xl text-left">
                <span className="text-[9px] font-black uppercase text-amber-550 block mb-1">Solicitud en Proceso</span>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-normal">
                  Ya has enviado una solicitud para registrar el local <strong className="text-slate-700 dark:text-slate-200">"{pendingSolicitud.nombre}"</strong>. Actualmente se encuentra bajo revisión por el Administrador.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed px-2">
                  Para comenzar a ofrecer tus productos a la comunidad Beauchefeana, solicita la publicación de tu local comercial en la plataforma.
                </p>
                <button
                  onClick={() => setIsRegModalOpen(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-[0.98] hover:opacity-95 cursor-pointer"
                >
                  Publicar mi Local
                </button>
              </>
            )}
          </div>
        </div>

        {/* Registration Modal */}
        {isRegModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto scrollbar-thin">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Postulación de Local</h3>
              
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[8px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-bold block mb-1">Nombre del Local</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Jugos Beauchef"
                    value={regLocalNombre}
                    onChange={(e) => setRegLocalNombre(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-bold block mb-1">Categoría</label>
                    <select
                      value={regLocalCategoria}
                      onChange={(e) => setRegLocalCategoria(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Casino">Casino</option>
                      <option value="Cafetería">Cafetería</option>
                      <option value="Comida Rápida">Comida Rápida</option>
                      <option value="Casero">Casero</option>
                      <option value="Dulces">Dulces</option>
                      <option value="Saludable">Saludable</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[8px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-bold block mb-1">Ubicación (Presets)</label>
                    <select
                      value={regLocalPreset}
                      onChange={(e) => setRegLocalPreset(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      {Object.keys(locationPresets).map(preset => (
                        <option key={preset} value={preset}>{preset}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Acepta JUNAEB:</span>
                  <input
                    type="checkbox"
                    checked={regLocalJunaeb}
                    onChange={(e) => setRegLocalJunaeb(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                </div>

                {/* Add initial products */}
                <div className="border-t border-slate-150 dark:border-slate-850 pt-3">
                  <span className="text-[8px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-bold block mb-2">Menú Inicial ({regLocalMenu.length} items)</span>
                  
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Producto"
                      value={tempItemName}
                      onChange={(e) => setTempItemName(e.target.value)}
                      className="flex-1 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      value={tempItemPrice}
                      onChange={(e) => setTempItemPrice(e.target.value)}
                      className="w-16 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddTempItem}
                      className="px-3 bg-slate-850 text-white rounded-lg text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Temp menu list */}
                  {regLocalMenu.length > 0 && (
                    <div className="flex flex-col gap-1 max-h-24 overflow-y-auto p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 rounded-xl text-[10px]">
                      {regLocalMenu.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-mono">
                          <span>{item.item}</span>
                          <span>${item.precio}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegLocalNombre('');
                      setRegLocalMenu([]);
                      setIsRegModalOpen(false);
                    }}
                    className="flex-1 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 rounded-xl text-[10px] font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider shadow-md transition-all"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center justify-start h-full overflow-y-auto select-none scrollbar-thin relative">
      
      {/* Title & Description */}
      <div className="text-center max-w-xl mb-6 shrink-0">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
          Portal de Locatarios
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
          Sincronización de bajo consumo de datos. Administra la disponibilidad y stock de tu local.
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl transition-colors relative">
        
        <div className="flex flex-col gap-4">
          
          {/* Dropdown to Identify Local (Visible only if Demo has multiple options) */}
          {isDemo && myLocales.length > 1 && (
            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Seleccionar Local Aprobado (Demo)
              </label>
              <select
                value={selectedOption || (activeLocal ? activeLocal.id : '')}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-bold w-full transition-colors"
              >
                {myLocales.map(l => (
                  <option key={l.id} value={l.id}>🏪 {l.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {activeLocal && (
            <div className="flex flex-col gap-4">
              
              {/* Local Info Badge */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-205 rounded-2xl p-4 transition-colors text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900 px-2 py-0.5 rounded font-black uppercase font-mono">
                    Aprobado y Visible
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID #{activeLocal.id}</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-2">{activeLocal.nombre}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">{activeLocal.categoria}</p>
                
                <div className="mt-3 flex justify-between items-center bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estado de mi Local:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    activeLocal.estadoServicio === 'Abierto'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                      : activeLocal.estadoServicio === 'Colación'
                      ? 'bg-orange-105 dark:bg-orange-950 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-900'
                      : activeLocal.estadoServicio === 'Sin Stock'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400'
                  }`}>
                    {activeLocal.estadoServicio}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-850/50">
                <button
                  onClick={() => setActiveTab('status')}
                  className={`flex-1 py-2 text-center rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 ${
                    activeTab === 'status'
                      ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 shadow-md'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-400'
                  }`}
                >
                  ⚙️ Estado Operativo
                </button>
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`flex-1 py-2 text-center rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 ${
                    activeTab === 'menu'
                      ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 shadow-md'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-400'
                  }`}
                >
                  🍔 Administrar Menú
                </button>
              </div>

              {/* Tab Content 1: Operative Status Chips & JUNAEB control */}
              {activeTab === 'status' && (
                <div className="flex flex-col gap-4 animate-fade-in text-left">
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Seleccionar Estado de mi Local
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {states.map(s => {
                      const isActive = activeLocal.estadoServicio === s.name;
                      return (
                        <button
                          key={s.name}
                          onClick={() => onUpdateLocalStatus(activeLocal.id, s.name)}
                          className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-black transition-all ${
                            isActive 
                              ? s.active + ' scale-[1.02] shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* JUNAEB SWITCH CONTROL */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-2">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Medio de Pago JUNAEB
                    </h4>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <div>
                        <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200 block">¿Acepta JUNAEB actualmente?</span>
                        <p className="text-[8px] text-slate-450 dark:text-slate-500 leading-tight">Desactívalo en caso de caída del validador Sodexo/Edenred.</p>
                      </div>
                      <button
                        onClick={() => onToggleLocalJunaeb(activeLocal.id, !activeLocal.aceptaJunaeb)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer ${
                          activeLocal.aceptaJunaeb ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-800 justify-start'
                        }`}
                      >
                        <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                      </button>
                    </div>
                  </div>

                  {/* Etiquetas del Local */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-2">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Etiquetas del Local
                    </h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500/80 leading-normal">
                      Selecciona las etiquetas de alimentos asociadas a tu local:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {['Vegana', 'Hipocalórica', 'Sin Gluten', 'Apto para Celíacos', 'Vegetariana', 'Saludable', 'Bajo en Sodio', 'Casero'].map(tag => {
                        const hasTag = (activeLocal.tags || []).includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const currentTags = activeLocal.tags || [];
                              const updatedTags = hasTag
                                ? currentTags.filter(t => t !== tag)
                                : [...currentTags, tag];
                              onUpdateLocalTags(activeLocal.id, updatedTags);
                            }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all border ${
                              hasTag
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                          >
                            {hasTag ? `✓ ${tag}` : `+ ${tag}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Menu / Product Manager */}
              {activeTab === 'menu' && (
                <div className="flex flex-col gap-4 animate-fade-in text-left">
                  
                  {/* Inline Form to Add Product */}
                  <form onSubmit={handleAddProductSubmit} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    <h4 className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Añadir Nuevo Producto
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nombre (ej: Jugo Natural)"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="flex-1 text-[11px] p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-colors"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Precio ($)"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        className="w-20 text-[11px] p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 font-mono font-bold transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-950 dark:bg-slate-850 hover:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-[0.98]"
                    >
                      + Agregar al Menú
                    </button>
                  </form>

                  {/* Grid layout of menu products */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Carta de Productos
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">
                        {(activeLocal.menu || []).length} items
                      </span>
                    </div>
                    
                    {(!activeLocal.menu || activeLocal.menu.length === 0) ? (
                      <div className="text-center py-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <span className="text-2xl block mb-1">🍽️</span>
                        <p className="text-[10px] text-slate-400">El menú está vacío. ¡Añade tu primer producto arriba!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {(activeLocal.menu || []).map((food, idx) => {
                          const isAgotado = food.agotado === true;
                          return (
                            <button
                              key={idx}
                              onClick={() => setConfirmItem(food)}
                              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all hover:scale-[1.01] hover:shadow-sm ${
                                isAgotado
                                  ? 'bg-slate-50 dark:bg-slate-955 border-dashed border-slate-350 dark:border-slate-850 opacity-45'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-lg">🍽️</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                                  isAgotado
                                    ? 'bg-rose-100 dark:bg-rose-955 text-rose-800 dark:text-rose-455 border border-rose-200 dark:border-rose-900'
                                    : 'bg-emerald-100 dark:bg-emerald-955 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                                }`}>
                                  {isAgotado ? 'Agotado' : 'Stock'}
                                </span>
                              </div>
                              <h5 className={`text-[11px] font-extrabold mt-2 leading-tight text-slate-700 dark:text-slate-200 ${
                                isAgotado ? 'line-through text-slate-400 dark:text-slate-500' : ''
                              }`}>
                                {food.item}
                              </h5>
                              <span className={`text-[10px] font-black font-mono mt-1 ${
                                isAgotado ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-emerald-600 dark:text-emerald-400'
                              }`}>
                                ${food.precio.toLocaleString('es-CL')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Confirmation Custom Modal for Stock Toggle */}
        {confirmItem && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 rounded-3xl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 w-full max-w-[280px] shadow-2xl animate-scale-up text-center">
              <span className="text-3xl block mb-2">{confirmItem.agotado ? '✅' : '🚫'}</span>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">¿Cambiar disponibilidad?</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                ¿Deseas marcar <span className="font-extrabold text-slate-700 dark:text-slate-350">"{confirmItem.item}"</span> como{' '}
                <span className={`font-black ${confirmItem.agotado ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {confirmItem.agotado ? 'Disponible' : 'Agotado'}
                </span>?
              </p>
              
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setConfirmItem(null)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-655 dark:text-slate-400 rounded-xl text-[10px] font-bold transition-all active:scale-[0.98]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStock(confirmItem)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black shadow-md transition-all active:scale-[0.98] ${
                    confirmItem.agotado 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                      : 'bg-rose-50 hover:bg-rose-600 text-white'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
