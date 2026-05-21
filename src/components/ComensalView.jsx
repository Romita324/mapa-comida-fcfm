import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Helper component to update map view dynamically
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 17, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
}

export default function ComensalView({ locales, reseñas, onReportReview }) {
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [filterJunaeb, setFilterJunaeb] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [maxDistance, setMaxDistance] = useState(3.0); // Limit up to strict 3.0 km
  const [mapCenter, setMapCenter] = useState([-33.4581, -70.6642]); // FCFM center

  // Extract unique categories for filter
  const categories = ['All', ...new Set(locales.map(l => l.categoria))];

  // Apply filters
  const filteredLocales = locales.filter(local => {
    // 1. Distance filter (strictly capped at 3.0 km as per request, dynamic based on slider)
    if (local.distanciaKm > maxDistance) return false;
    // 2. JUNAEB filter
    if (filterJunaeb && !local.aceptaJunaeb) return false;
    // 3. Category filter
    if (filterCategory !== 'All' && local.categoria !== filterCategory) return false;
    return true;
  });

  // Custom marker generator using SVG and Tailwind
  const getMarkerIcon = (local) => {
    let color = 'bg-emerald-500 text-slate-950 border-emerald-300 ring-emerald-500/25';
    if (local.estadoServicio === 'Cerrado') {
      color = 'bg-rose-500 text-white border-rose-300 ring-rose-500/25';
    } else if (local.estadoServicio === 'Sin Stock') {
      color = 'bg-amber-500 text-slate-950 border-amber-300 ring-amber-500/25';
    }

    const junaebBadge = local.aceptaJunaeb
      ? `<span class="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-black border border-slate-900 text-white shadow-md">J</span>`
      : '';

    const html = `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg ring-4 transform transition-all duration-300 hover:scale-125 ${color}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
        </svg>
        ${junaebBadge}
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-map-marker-container',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const handleSelectLocal = (local) => {
    setSelectedLocal(local);
    setMapCenter(local.coordenadas);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
      
      {/* LEFT COLUMN: Filters & List */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {/* Filters Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-100">Filtros de Búsqueda</h2>
            <button 
              onClick={() => { setFilterJunaeb(false); setFilterCategory('All'); setMaxDistance(3.0); }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Restablecer
            </button>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCategory === cat
                      ? 'bg-slate-100 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-950/80 border border-slate-800'
                  }`}
                >
                  {cat === 'All' ? 'Todas' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Slider (Capped strictly at 3.0 km) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Distancia Máxima</span>
              <span className="text-emerald-400 font-bold font-mono">{maxDistance.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.1 km</span>
              <span>1.5 km</span>
              <span>3.0 km</span>
            </div>
          </div>

          {/* Junaeb Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 transition-colors hover:border-slate-700">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-950 border border-emerald-800 text-[10px] font-black text-emerald-400">J</span>
              <div>
                <p className="text-xs font-bold text-slate-200">Acepta JUNAEB</p>
                <p className="text-[10px] text-slate-500">Solo mostrar locales adheridos</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={filterJunaeb} 
                onChange={(e) => setFilterJunaeb(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
            </label>
          </div>
        </div>

        {/* Locales List */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-400 px-1 font-mono">
            LOCALES ENCONTRADOS: {filteredLocales.length}
          </p>
          <div className="flex flex-col gap-2.5">
            {filteredLocales.map(local => {
              const reviewsCount = reseñas.filter(r => r.localId === local.id).length;
              return (
                <div
                  key={local.id}
                  onClick={() => handleSelectLocal(local)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                    selectedLocal?.id === local.id
                      ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm leading-tight">{local.nombre}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{local.categoria}</p>
                    </div>
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      local.estadoServicio === 'Abierto'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                        : local.estadoServicio === 'Sin Stock'
                        ? 'bg-amber-950 text-amber-400 border border-amber-900'
                        : 'bg-rose-950 text-rose-400 border border-rose-900'
                    }`}>
                      {local.estadoServicio}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-950 text-xs text-slate-400 font-medium">
                    <span className="flex items-center space-x-1 font-mono">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5 text-slate-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <span>{local.distanciaKm} km</span>
                    </span>
                    {local.aceptaJunaeb && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/60 font-bold">
                        JUNAEB
                      </span>
                    )}
                    <span className="text-slate-500 font-mono text-[10px]">
                      {reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredLocales.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 mx-auto text-slate-600 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm font-semibold text-slate-400">No hay locales que cumplan los filtros.</p>
                <p className="text-xs text-slate-500 mt-1">Prueba ampliando la distancia o cambiando la categoría.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Map & Detail Side-Drawer */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-xl h-full flex">
        {/* React Leaflet Map */}
        <div className="flex-1 h-full z-10">
          <MapContainer 
            center={[-33.4581, -70.6642]} 
            zoom={16.5} 
            style={{ height: '100%', width: '100%', background: '#020617' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuyentes'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <ChangeView center={mapCenter} />

            {/* FCFM Landmark Marker */}
            <Marker 
              position={[-33.4581, -70.6642]} 
              icon={L.divIcon({
                html: `
                  <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500 border border-indigo-300 text-slate-950 font-black shadow-md shadow-indigo-500/25 ring-4 ring-indigo-500/20">
                    U
                  </div>
                `,
                className: 'university-landmark',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup>
                <div className="text-xs font-bold text-slate-950">FCFM Beauchef</div>
              </Popup>
            </Marker>

            {/* Locales Markers */}
            {filteredLocales.map(local => (
              <Marker
                key={local.id}
                position={local.coordenadas}
                icon={getMarkerIcon(local)}
                eventHandlers={{
                  click: () => handleSelectLocal(local),
                }}
              >
                <Popup>
                  <div className="text-slate-950">
                    <h4 className="font-bold text-xs">{local.nombre}</h4>
                    <p className="text-[10px] text-slate-600 font-medium">{local.categoria}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        local.estadoServicio === 'Abierto'
                          ? 'bg-emerald-100 text-emerald-800'
                          : local.estadoServicio === 'Sin Stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {local.estadoServicio}
                      </span>
                      {local.aceptaJunaeb && (
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-black">JUNAEB</span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Side Panel: Local Details (Slides in if local selected) */}
        {selectedLocal && (
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-slate-900/95 border-l border-slate-800 z-20 shadow-2xl p-6 overflow-y-auto flex flex-col gap-5 backdrop-blur">
            {/* Close Button */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-slate-950 text-[10px] text-slate-400 rounded-md border border-slate-800 font-mono">Detalles</span>
              </div>
              <button 
                onClick={() => setSelectedLocal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-950 border border-slate-800 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Local Information */}
            <div>
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-xl font-bold text-slate-100 tracking-tight leading-tight">{selectedLocal.nombre}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  selectedLocal.estadoServicio === 'Abierto'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                    : selectedLocal.estadoServicio === 'Sin Stock'
                    ? 'bg-amber-950 text-amber-400 border border-amber-900'
                    : 'bg-rose-950 text-rose-400 border border-rose-900'
                }`}>
                  {selectedLocal.estadoServicio}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-slate-950 rounded text-slate-500 font-medium">{selectedLocal.categoria}</span>
                <span className="font-mono text-slate-500">•</span>
                <span className="font-mono">{selectedLocal.distanciaKm} km de FCFM</span>
              </p>

              {/* Junaeb Callout */}
              {selectedLocal.aceptaJunaeb ? (
                <div className="mt-3.5 bg-emerald-950/20 border border-emerald-900/60 p-3 rounded-xl flex items-center space-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-800 text-[10px] font-black text-emerald-400">J</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400">¡Acepta Tarjeta Junaeb!</h4>
                    <p className="text-[10px] text-emerald-400/80">Puedes pagar tu almuerzo con la beca BAES aquí.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center space-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-500">J</span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400">Sin Convenio Junaeb</h4>
                    <p className="text-[10px] text-slate-500">Este local actualmente no cuenta con pago BAES.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Section */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menú del Local</h4>
              <div className="flex flex-col gap-2 bg-slate-950 p-4 rounded-xl border border-slate-850">
                {selectedLocal.menu && selectedLocal.menu.map((food, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-900 last:border-b-0">
                    <span className="text-xs font-semibold text-slate-200">{food.item}</span>
                    <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">
                      ${food.precio.toLocaleString('es-CL')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reseñas de la Comunidad</h4>
              <div className="flex flex-col gap-3">
                {reseñas
                  .filter(review => review.localId === selectedLocal.id)
                  .map(review => (
                    <div 
                      key={review.id} 
                      className={`p-3.5 rounded-xl border transition-all ${
                        review.reportado 
                          ? 'bg-rose-950/15 border-rose-900/40 opacity-75' 
                          : 'bg-slate-950 border-slate-850'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-300 font-mono">@{review.usuario}</span>
                        <div className="flex text-amber-400 text-xs font-mono">
                          {'★'.repeat(review.calificacion)}
                          {'☆'.repeat(5 - review.calificacion)}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed font-medium">"{review.comentario}"</p>

                      {review.reportado ? (
                        <div className="mt-2.5 flex items-center space-x-1.5 bg-rose-950/30 border border-rose-900/50 p-2 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-rose-400 shrink-0">
                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[10px] text-rose-300 font-bold leading-none">Reseña reportada - En revisión</span>
                        </div>
                      ) : (
                        <div className="mt-2.5 flex justify-end">
                          <button
                            onClick={() => onReportReview(review.id)}
                            className="flex items-center space-x-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 px-2 py-1 rounded-md transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-5.705-1.115 48.552 48.552 0 0 1-6.49 1.487L3 15Z" />
                            </svg>
                            <span>Reportar Troll</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {reseñas.filter(review => review.localId === selectedLocal.id).length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-2">No hay reseñas para este local aún.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
