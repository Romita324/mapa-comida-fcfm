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

export default function ComensalView({ 
  locales, 
  reseñas, 
  onReportReview,
  onVoteHelpful,
  favoritos,
  onToggleFavorite,
  isGuest,
  theme,
  deviceMode,
  onAddReview,
  filterFavorites,
  setFilterFavorites
}) {
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [isFloatingFiltersOpen, setIsFloatingFiltersOpen] = useState(false);
  const [filterJunaeb, setFilterJunaeb] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [maxDistance, setMaxDistance] = useState(3.0); // Capped at strict 3.0 km
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Abierto' | 'Colación' | 'Cerrado'
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [mapCenter, setMapCenter] = useState([-33.4581, -70.6642]); // FCFM center
  const [mobileTab, setMobileTab] = useState('mapa'); // 'mapa' | 'lista'
  const [reportConfirmData, setReportConfirmData] = useState(null);
  const [votedReviews, setVotedReviews] = useState([]);

  // Viewport resize tracking to support desktop browser resizing alongside chassis simulated mode
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = deviceMode === 'mobile' || windowWidth < 1024;



  // Apply filters
  const filteredLocales = locales.filter(local => {
    // 1. Distance filter (strictly capped at 3.0 km, slider dynamic)
    if (local.distanciaKm > maxDistance) return false;
    // 2. JUNAEB filter
    if (filterJunaeb && !local.aceptaJunaeb) return false;
    // 3. Category filter
    if (filterCategory !== 'All' && local.categoria !== filterCategory) return false;
    // 4. Favorites filter
    if (filterFavorites && !isGuest && !favoritos.includes(local.id)) return false;
    // 5. Status filter
    if (filterStatus !== 'All' && local.estadoServicio !== filterStatus) return false;
    return true;
  });

  // Custom marker generator using SVG and Tailwind
  const getMarkerIcon = (local) => {
    const isFav = !isGuest && favoritos.includes(local.id);
    let color = 'bg-emerald-500 text-slate-950 border-emerald-300 ring-emerald-500/25';
    if (local.estadoServicio === 'Cerrado') {
      color = 'bg-rose-500 text-white border-rose-300 ring-rose-500/25';
    } else if (local.estadoServicio === 'Sin Stock') {
      color = 'bg-amber-500 text-slate-950 border-amber-300 ring-amber-500/25';
    } else if (local.estadoServicio === 'Colación') {
      color = 'bg-orange-500 text-white border-orange-300 ring-orange-500/25';
    }

    const junaebBadge = local.aceptaJunaeb
      ? `<span class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-black border border-white dark:border-slate-950 text-white shadow-md">J</span>`
      : '';

    const favHeart = isFav
      ? `<span class="absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 border border-white dark:border-slate-950 text-white shadow-md text-[8px]">❤️</span>`
      : '';

    const html = `
      <div class="flex flex-col items-center justify-start w-[120px] h-[60px]">
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg ring-4 transform transition-all duration-300 hover:scale-125 ${color}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
          </svg>
          ${junaebBadge}
          ${favHeart}
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700/50 dark:border-slate-800/80 text-[8px] font-extrabold text-white text-center shadow-md truncate max-w-[110px] leading-tight select-none pointer-events-none">
          ${local.nombre}
        </div>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-map-marker-container',
      iconSize: [120, 60],
      iconAnchor: [60, 16],
      popupAnchor: [0, -16]
    });
  };

  // Extract unique categories dynamically based on the global array of active locales
  const categories = ['All', ...new Set(locales.map(l => l.categoria))];

  const handleSelectLocal = (local) => {
    setSelectedLocal(local);
    setMapCenter(local.coordenadas);
    setMobileTab('mapa');
  };
  // Determine dynamic Leaflet tile layer URL based on active theme
  // We'll force updates by checking if dark class exists on document
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className={`w-full h-full flex-1 min-h-0 transition-colors duration-200 overflow-hidden flex ${
      isMobile ? 'flex-col p-4 gap-4' : 'flex-row p-6 gap-6'
    }`}>
      
      {/* Tab Switcher for Mobile */}
      <div className={`bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full shrink-0 mb-1 ${
        isMobile ? 'flex' : 'hidden'
      }`}>
        <button
          onClick={() => setMobileTab('mapa')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'mapa'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>🗺️ Ver Mapa</span>
        </button>
        <button
          onClick={() => setMobileTab('lista')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'lista'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>🏪 Ver Locales</span>
        </button>
      </div>

      {/* LEFT COLUMN: Filters, Favoritos & List */}
      <div className={`gap-4 overflow-y-auto pr-1 select-none scrollbar-thin ${
        isMobile 
          ? (mobileTab === 'lista' ? 'flex flex-col flex-1 h-full w-full' : 'hidden')
          : 'flex flex-col w-96 h-full flex-none'
      }`}>
        
        {/* Guest Warning Card */}
        {isGuest && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex gap-3 shadow-sm">
            <span className="text-xl">👤</span>
            <div>
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Perfil de Invitado</h4>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-500/80 mt-0.5 leading-normal">
                Visualizas el mapa en modo de solo lectura. Regístrate como comensal para agregar favoritos, votar utilidad de reseñas, enviar reportes anti-troll y postular como moderador.
              </p>
            </div>
          </div>
        )}

        {/* Filters Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4 transition-colors">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Filtros de Búsqueda</h2>
            <button 
              onClick={() => { setFilterJunaeb(false); setFilterCategory('All'); setMaxDistance(3.0); setFilterFavorites(false); setFilterStatus('All'); }}
              className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold transition-colors"
            >
              Restablecer
            </button>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    filterCategory === cat
                      ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-950 font-black'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'Todas' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Slider (Capped strictly at 3.0 km) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <span>Distancia Máxima</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-extrabold font-mono">{maxDistance.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono">
              <span>0.1 km</span>
              <span>1.5 km</span>
              <span>3.0 km (Geofencing)</span>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estado de Servicio</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: 'All', label: 'Todos' },
                { value: 'Abierto', label: '🟢 Abiertos' },
                { value: 'Colación', label: '⏰ Colación' },
                { value: 'Cerrado', label: '🔴 Cerrados' }
              ].map(statusOpt => (
                <button
                  key={statusOpt.value}
                  type="button"
                  onClick={() => setFilterStatus(statusOpt.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    filterStatus === statusOpt.value
                      ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-950 font-black'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {statusOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Junaeb and Favorites Filters */}
          <div className="flex flex-col gap-2.5">
            {/* JUNAEB Filter Button */}
            <button
              type="button"
              onClick={() => setFilterJunaeb(!filterJunaeb)}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 active:scale-[0.98] w-full text-left cursor-pointer ${
                filterJunaeb 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-extrabold ring-1 ring-emerald-400/20'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black border transition-colors ${
                  filterJunaeb 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
                }`}>J</span>
                <div>
                  <p className="text-xs font-bold leading-none">Acepta JUNAEB</p>
                </div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase transition-colors ${
                filterJunaeb
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {filterJunaeb ? 'Activo' : 'Filtrar'}
              </span>
            </button>

            {/* FAVORITES Filter Button */}
            {!isGuest && (
              <button
                type="button"
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 active:scale-[0.98] w-full text-left cursor-pointer ${
                  filterFavorites 
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-450 dark:border-rose-700 text-rose-900 dark:text-rose-100 font-extrabold ring-1 ring-rose-400/20'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black border transition-colors ${
                    filterFavorites 
                      ? 'bg-rose-500 text-slate-950 border-rose-500'
                      : 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400'
                  }`}>❤️</span>
                  <div>
                    <p className="text-xs font-bold leading-none">Mis Favoritos</p>
                  </div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase transition-colors ${
                  filterFavorites
                    ? 'bg-rose-500 text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {filterFavorites ? 'Activo' : 'Filtrar'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Locales List */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 px-1 font-mono uppercase tracking-wider">
            Locales Encontrados: {filteredLocales.length}
          </p>
          <div className="flex flex-col gap-2">
            {filteredLocales.map(local => {
              const reviewsCount = reseñas.filter(r => r.localId === local.id).length;
              const isFav = !isGuest && favoritos.includes(local.id);
              return (
                <div
                  key={local.id}
                  onClick={() => handleSelectLocal(local)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 flex flex-col gap-2 relative ${
                    selectedLocal?.id === local.id
                      ? 'bg-slate-100 dark:bg-slate-900 border-emerald-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Favorite direct heart toggle button */}
                  {!isGuest && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(local.id);
                      }}
                      className="absolute top-3.5 right-3.5 p-1 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors z-10"
                      title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill={isFav ? "currentColor" : "none"} 
                        viewBox="0 0 24 24" 
                        strokeWidth="2.5" 
                        stroke="currentColor" 
                        className="w-3.5 h-3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                  )}

                  <div className="flex justify-between items-start pr-6">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs leading-snug">{local.nombre}</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{local.categoria}</p>
                      {local.tags && local.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {local.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/40 text-[8px] font-black uppercase">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide shrink-0 ${
                      local.estadoServicio === 'Abierto'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                        : local.estadoServicio === 'Colación'
                        ? 'bg-orange-100 dark:bg-orange-950/70 text-orange-850 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50'
                        : local.estadoServicio === 'Sin Stock'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    }`}>
                      {local.estadoServicio}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-0.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                    <span className="flex items-center space-x-1 font-mono">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <span>{local.distanciaKm} km</span>
                    </span>
                    {local.aceptaJunaeb && (
                      <span className="text-[8px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-900 font-extrabold">
                        JUNAEB
                      </span>
                    )}
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px] font-medium">
                      {reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredLocales.length === 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-md">
                <p className="text-xs font-bold text-slate-500">No hay locales que cumplan los filtros.</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Prueba ampliando el geofencing o cambiando la categoría.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Map & Detail Side-Drawer */}
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden relative shadow-xl transition-colors ${
        isMobile 
          ? (mobileTab === 'mapa' ? 'flex flex-1 h-full w-full' : 'hidden')
          : 'flex flex-1 h-full'
      }`}>
        
        {/* Floating Filters Button for Mobile */}
        {isMobile && mobileTab === 'mapa' && (
          <button
            onClick={() => setIsFloatingFiltersOpen(true)}
            className="absolute top-4 right-4 z-[1001] px-3.5 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 font-extrabold text-xs rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>🔍</span>
            <span>Filtros</span>
          </button>
        )}

        {/* Slide-up Mobile Filters Sheet */}
        {isMobile && isFloatingFiltersOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-[1002] animate-fade-in"
              onClick={() => setIsFloatingFiltersOpen(false)}
            />
            
            {/* Sheet Panel */}
            <div className="absolute bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-[32px] p-5 pb-8 z-[1003] shadow-2xl flex flex-col gap-4 max-h-[70%] overflow-y-auto animate-slide-in-up scrollbar-none">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base">🔍</span>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Filtros de Búsqueda</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => { setFilterJunaeb(false); setFilterCategory('All'); setMaxDistance(3.0); setFilterFavorites(false); setFilterStatus('All'); }}
                    className="text-[11px] text-emerald-500 hover:text-emerald-400 font-bold transition-colors"
                  >
                    Restablecer
                  </button>
                  <button 
                    onClick={() => setIsFloatingFiltersOpen(false)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Category Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Categoría</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        filterCategory === cat
                          ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-950 font-black'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {cat === 'All' ? 'Todas' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span>Distancia Máxima</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-extrabold font-mono">{maxDistance.toFixed(1)} km</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>0.1 km</span>
                  <span>1.5 km</span>
                  <span>3.0 km (Geofencing)</span>
                </div>
              </div>

              {/* Status Filter (Mobile) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estado de Servicio</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: 'All', label: 'Todos' },
                    { value: 'Abierto', label: '🟢 Abiertos' },
                    { value: 'Colación', label: '⏰ Colación' },
                    { value: 'Cerrado', label: '🔴 Cerrados' }
                  ].map(statusOpt => (
                    <button
                      key={statusOpt.value}
                      type="button"
                      onClick={() => setFilterStatus(statusOpt.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        filterStatus === statusOpt.value
                          ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-950 font-black'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {statusOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2.5">
                {/* JUNAEB Filter Button */}
                <button
                  type="button"
                  onClick={() => setFilterJunaeb(!filterJunaeb)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 active:scale-[0.98] w-full text-left cursor-pointer ${
                    filterJunaeb 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-extrabold ring-1 ring-emerald-400/20'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black border transition-colors ${
                      filterJunaeb 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
                    }`}>J</span>
                    <div>
                      <p className="text-xs font-bold leading-none">Acepta JUNAEB</p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase transition-colors ${
                    filterJunaeb
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {filterJunaeb ? 'Activo' : 'Filtrar'}
                  </span>
                </button>

                {/* FAVORITES Filter Button */}
                {!isGuest && (
                  <button
                    type="button"
                    onClick={() => setFilterFavorites(!filterFavorites)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 active:scale-[0.98] w-full text-left cursor-pointer ${
                      filterFavorites 
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-450 dark:border-rose-700 text-rose-900 dark:text-rose-100 font-extrabold ring-1 ring-rose-400/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black border transition-colors ${
                        filterFavorites 
                          ? 'bg-rose-500 text-slate-950 border-rose-500'
                          : 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400'
                      }`}>❤️</span>
                      <div>
                        <p className="text-xs font-bold leading-none">Mis Favoritos</p>
                      </div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase transition-colors ${
                      filterFavorites
                        ? 'bg-rose-500 text-slate-950'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {filterFavorites ? 'Activo' : 'Filtrar'}
                    </span>
                  </button>
                )}
              </div>

              <button 
                onClick={() => setIsFloatingFiltersOpen(false)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-[0.98] mt-2"
              >
                Ver locales filtrados ({filteredLocales.length})
              </button>
            </div>
          </>
        )}

        {/* Leaflet Map */}
        <div className="w-full h-full z-10">
          <MapContainer 
            key={theme} // Force re-render of Leaflet tiles on theme change
            center={[-33.4581, -70.6642]} 
            zoom={16} 
            style={{ height: '100%', width: '100%', background: isDarkMode ? '#020617' : '#f8fafc' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={tileUrl}
            />
            <ChangeView center={mapCenter} />

            {/* FCFM Center Landmark Marker */}
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
                <div className="text-xs font-black text-slate-900">FCFM Beauchef 850</div>
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
                  <div className="text-slate-900">
                    <h4 className="font-extrabold text-xs">{local.nombre}</h4>
                    <p className="text-[9px] text-slate-500 font-semibold">{local.categoria}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        local.estadoServicio === 'Abierto'
                          ? 'bg-emerald-100 text-emerald-800'
                          : local.estadoServicio === 'Colación'
                          ? 'bg-orange-100 text-orange-850'
                          : local.estadoServicio === 'Sin Stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {local.estadoServicio}
                      </span>
                      {local.aceptaJunaeb && (
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-black border border-emerald-200">JUNAEB</span>
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
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-white/95 dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-800 z-20 shadow-2xl p-5 overflow-y-auto flex flex-col gap-4 backdrop-blur transition-colors scrollbar-thin">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 text-[9px] font-bold text-slate-500 rounded-md border border-slate-200 dark:border-slate-800 font-mono uppercase tracking-wider">
                  Detalles
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {/* FAVORITES HEART BUTTON */}
                {!isGuest && (
                  <button
                    onClick={() => onToggleFavorite(selectedLocal.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors"
                    title={favoritos.includes(selectedLocal.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill={favoritos.includes(selectedLocal.id) ? "currentColor" : "none"} 
                      viewBox="0 0 24 24" 
                      strokeWidth="2" 
                      stroke="currentColor" 
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                )}

                <button 
                  onClick={() => setSelectedLocal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Local Information */}
            <div>
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">{selectedLocal.nombre}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide shrink-0 ${
                  selectedLocal.estadoServicio === 'Abierto'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                    : selectedLocal.estadoServicio === 'Colación'
                    ? 'bg-orange-100 dark:bg-orange-950/70 text-orange-850 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50'
                    : selectedLocal.estadoServicio === 'Sin Stock'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                }`}>
                  {selectedLocal.estadoServicio}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5 font-semibold">
                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-950 rounded text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50">{selectedLocal.categoria}</span>
                <span>•</span>
                <span className="font-mono">{selectedLocal.distanciaKm} km de FCFM</span>
              </p>

              {selectedLocal.tags && selectedLocal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedLocal.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[8.5px] font-extrabold uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Junaeb Callout */}
              {selectedLocal.aceptaJunaeb ? (
                <div className="mt-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 p-3 rounded-xl flex items-center space-x-3 transition-colors">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-900 text-[10px] font-black text-emerald-600 dark:text-emerald-400">J</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">¡Convenio JUNAEB Activo!</h4>
                    <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500">Acepta pago BAES para compras de colación.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center space-x-3 transition-colors">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[10px] font-black text-slate-400">J</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500">Sin Convenio JUNAEB</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500/85">No cuenta con soporte de pago de tarjeta BAES.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Section */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Menú Oferta</h4>
              <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                {selectedLocal.menu && selectedLocal.menu.map((food, i) => (
                  <div key={i} className={`flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-900/60 last:border-b-0 ${
                    food.agotado ? 'opacity-40 select-none' : ''
                  }`}>
                    <span className={`text-xs font-bold text-slate-700 dark:text-slate-200 ${
                      food.agotado ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}>
                      {food.item} {food.agotado && <span className="text-[9px] text-rose-500 font-extrabold ml-1 uppercase">(Agotado)</span>}
                    </span>
                    <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded border ${
                      food.agotado 
                        ? 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
                        : 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-900/30'
                    }`}>
                      ${food.precio.toLocaleString('es-CL')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reseñas de Comensales</h4>
              <div className="flex flex-col gap-2.5">
                {reseñas
                  .filter(review => review.localId === selectedLocal.id)
                  .map(review => (
                    <div 
                      key={review.id} 
                      className={`p-3 rounded-2xl border transition-all ${
                        review.reportado 
                          ? 'bg-rose-50/50 dark:bg-rose-950/15 border-rose-200/50 dark:border-rose-900/40 opacity-75' 
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">@{review.usuario}</span>
                        <div className="flex text-amber-500 text-xs font-mono select-none">
                          {'★'.repeat(review.calificacion)}
                          {'☆'.repeat(5 - review.calificacion)}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">"{review.comentario}"</p>

                      {review.reportado ? (
                        <div className="mt-2 flex items-center space-x-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-1.5 rounded-lg">
                          <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold leading-none">⚠️ Reseña bajo revisión por Moderador</span>
                        </div>
                      ) : (
                        <div className="mt-2.5 flex justify-between items-center gap-2">
                          <button
                            onClick={() => {
                              if (isGuest) {
                                alert("Debes estar registrado como Comensal para votar la utilidad de las reseñas.");
                                return;
                              }
                              const alreadyVoted = votedReviews.includes(review.id);
                              if (alreadyVoted) {
                                onVoteHelpful(review.id, false);
                                setVotedReviews(prev => prev.filter(id => id !== review.id));
                              } else {
                                onVoteHelpful(review.id, true);
                                setVotedReviews(prev => [...prev, review.id]);
                              }
                            }}
                            disabled={isGuest}
                            className={`flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border transition-all ${
                              isGuest 
                                ? 'opacity-40 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : votedReviews.includes(review.id)
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 shadow-inner'
                                : 'text-slate-500 bg-slate-105 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                          >
                            <span>{votedReviews.includes(review.id) ? '👍 ¡Útil!' : '👍 Me sirvió'}</span>
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/20 text-[8.5px] font-mono font-bold shadow-xs">
                              {review.votosUtilidad || 0}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              if (isGuest) {
                                alert("Debes estar registrado como Comensal para reportar trolls.");
                              } else {
                                setReportConfirmData(review.id);
                              }
                            }}
                            disabled={isGuest}
                            className={`flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border transition-all ${
                              isGuest 
                                ? 'opacity-40 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                                : 'text-rose-500 hover:text-rose-600 bg-rose-100/30 hover:bg-rose-100/50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/50'
                            }`}
                          >
                            <span>🚩 Reportar Troll</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {reseñas.filter(review => review.localId === selectedLocal.id).length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-2">Sin valoraciones para este local aún.</p>
                )}
              </div>

              {/* Review Submission Form */}
              {!isGuest ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newComment.trim()) return;
                    onAddReview(selectedLocal.id, newRating, newComment.trim());
                    setNewComment('');
                    setNewRating(5);
                  }} 
                  className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 mt-2"
                >
                  <h5 className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Escribir una Reseña</h5>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Calificación:</span>
                    <div className="flex gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-base transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          {star <= newRating ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Comparte tu experiencia con este local..."
                    className="w-full p-2 text-xs rounded-lg bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 resize-none font-sans"
                  />

                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="self-end px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                  >
                    Publicar Reseña
                  </button>
                </form>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center mt-2">
                  <p className="text-[10px] text-slate-400 font-bold">Inicia sesión como Comensal para escribir una reseña.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Report Troll Confirmation Modal */}
      {reportConfirmData && (
        <div className="fixed inset-0 z-[10003] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-scale-up text-center flex flex-col gap-4">
            <span className="text-3xl block">🚨</span>
            <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 uppercase tracking-wider">¿Reportar Comentario?</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              ¿Estás seguro de que deseas reportar este comentario como malicioso/troll? Será enviado al equipo de administración para su evaluación.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReportConfirmData(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 rounded-xl text-[10px] font-bold transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onReportReview(reportConfirmData);
                  setReportConfirmData(null);
                }}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black shadow-md transition-all active:scale-[0.98]"
              >
                Reportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
