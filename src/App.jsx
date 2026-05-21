import { useState } from 'react';
import Navbar from './components/Navbar';
import ComensalView from './components/ComensalView';
import VendedorView from './components/VendedorView';
import AdminView from './components/AdminView';

// Import initial database mocks
import { 
  locales, 
  reseñas, 
  reportesSeguridad, 
  logAuditoriaAdmin 
} from './mockData';

export default function App() {
  const [activeView, setActiveView] = useState('comensal');
  
  // Shared reactive states
  const [localesList, setLocalesList] = useState(locales);
  const [reseñasList, setReseñasList] = useState(reseñas);
  const [reportesList, setReportesList] = useState(reportesSeguridad);
  const [auditLogs, setAuditLogs] = useState(logAuditoriaAdmin);

  // COUNT of pending moderation reports to display in the navbar
  const pendingReportsCount = reportesList.filter(r => r.estado === 'Pendiente').length;

  // HANDLER: Comensal flags a review as a Troll/Malicious comment
  const handleReportReview = (reviewId) => {
    // 1. Mark review as reported in-place (updates local list view)
    setReseñasList(prev => 
      prev.map(r => r.id === reviewId ? { ...r, reportado: true } : r)
    );

    // 2. Generate new security report entry for the Admin table
    const newReport = {
      id: Date.now(),
      reseñaId: reviewId,
      estado: 'Pendiente',
      motivo: 'Comentario malicioso / Troll'
    };
    setReportesList(prev => [newReport, ...prev]);
  };

  // HANDLER: Vendedor updates food availability & open status
  const handleUpdateLocalStatus = (localId, newStatus) => {
    setLocalesList(prev => 
      prev.map(l => l.id === localId ? { ...l, estadoServicio: newStatus } : l)
    );
  };

  // HANDLER: Admin resolves security reviews
  const handleResolveReport = (reportId, action, reviewId, username) => {
    const timestamp = new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL');

    if (action === 'banear') {
      // 1. Delete review from general list
      setReseñasList(prev => prev.filter(r => r.id !== reviewId));

      // 2. Resolve safety report state
      setReportesList(prev => 
        prev.map(rep => rep.id === reportId ? { ...rep, estado: 'Resuelto (Eliminado)' } : rep)
      );

      // 3. Insert audit log entry to mitigate collusion/bias
      const newLog = {
        id: Date.now(),
        accion: `Admin_Master eliminó reseña ID ${reviewId} y bloqueó al usuario '${username || 'desconocido'}' por trolling.`,
        fecha: timestamp
      };
      setAuditLogs(prev => [newLog, ...prev]);

    } else if (action === 'descartar') {
      // 1. Remove reported tag from review, resetting status
      setReseñasList(prev => 
        prev.map(r => r.id === reviewId ? { ...r, reportado: false } : r)
      );

      // 2. Resolve safety report state
      setReportesList(prev => 
        prev.map(rep => rep.id === reportId ? { ...rep, estado: 'Resuelto (Descartado)' } : rep)
      );

      // 3. Log action
      const newLog = {
        id: Date.now(),
        accion: `Admin_Master descartó reporte ID ${reportId} sobre reseña ID ${reviewId}.`,
        fecha: timestamp
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar Header */}
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        pendingReportsCount={pendingReportsCount} 
      />

      {/* Main Content Router */}
      <main className="flex-1 w-full">
        {activeView === 'comensal' && (
          <ComensalView 
            locales={localesList} 
            reseñas={reseñasList} 
            onReportReview={handleReportReview} 
          />
        )}
        
        {activeView === 'vendedor' && (
          <VendedorView 
            locales={localesList} 
            onUpdateLocalStatus={handleUpdateLocalStatus} 
          />
        )}
        
        {activeView === 'admin' && (
          <AdminView 
            locales={localesList} 
            reseñas={reseñasList} 
            reportesSeguridad={reportesList} 
            logAuditoriaAdmin={auditLogs}
            onResolveReport={handleResolveReport} 
          />
        )}
      </main>

      {/* Modern Dashboard Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-4 px-6 text-center text-[10px] text-slate-500 font-mono">
        &copy; {new Date().getFullYear()} Beauchef Eats - DCC Evaluación de Proyectos FCFM. Todos los derechos reservados.
      </footer>
    </div>
  );
}
