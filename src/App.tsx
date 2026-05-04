import { useState } from 'react';
import Overview from './pages/Overview';
import AddPurchase from './pages/AddPurchase';
import ClientList from './pages/ClientList'; 
import ClientManagement from './pages/ClientManagement';
import PurchaseManagement from './pages/PurchaseManagement';
import WhatsApp from './pages/WhatsApp';
import { LayoutDashboard, Users, PlusCircle, ShoppingCart, UserCog, MessageCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'crm' | 'clients' | 'purchases' | 'whatsapp'>('overview');

  const isClientSim = window.location.search.includes('client_sim=true');

  // If opening in standalone simulator mode
  if (isClientSim) {
    return (
       <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
          <WhatsApp isClientMode={true} />
       </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">O</div>
          Opticalia
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} />
            Resumen Gerencial
          </div>
          <div className={`nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
            <PlusCircle size={20} />
            Añadir Compra
          </div>
          <div className={`nav-item ${activeTab === 'crm' ? 'active' : ''}`} onClick={() => setActiveTab('crm')}>
            <Users size={20} />
            CRM y Campañas
          </div>
          <div className={`nav-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
            <UserCog size={20} />
            Gestión de Clientes
          </div>
          <div className={`nav-item ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
            <ShoppingCart size={20} />
            Gestión de Compras
          </div>
        </nav>

        <div style={{ marginTop: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Link to native WhatsApp interface (Employer) */}
          <button 
            onClick={() => setActiveTab('whatsapp')}
            className={`nav-item ${activeTab === 'whatsapp' ? 'active' : ''}`}
            style={{ backgroundColor: 'var(--opt-fiel)', color: 'white', borderRadius: '4px', display: 'flex', justifyContent: 'center', width: '100%', border: 'none' }}
          >
            <MessageCircle size={20} />
            WhatsApp Empresa
          </button>
          
          {/* Link to native WhatsApp interface (Client Simulator) */}
          <button 
             onClick={() => window.open(window.location.href.split('?')[0] + '?client_sim=true', '_blank')}
            className="nav-item"
            style={{ backgroundColor: 'var(--opt-vip)', color: 'var(--opt-vip-text)', borderRadius: '4px', display: 'flex', justifyContent: 'center', width: '100%', border: 'none', fontWeight: 'bold' }}
          >
            <Users size={20} />
            Simulador Cliente (Nueva Pestaña)
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="user-profile">
            <span>Gerente Sucursal</span>
            <div style={{width: 35, height: 35, backgroundColor: 'var(--opt-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
              G
            </div>
          </div>
        </header>
        
        <div className="page-content">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'add' && <AddPurchase />}
          {activeTab === 'crm' && <ClientList />}
          {activeTab === 'clients' && <ClientManagement />}
          {activeTab === 'purchases' && <PurchaseManagement />}
          {activeTab === 'whatsapp' && <WhatsApp isClientMode={false} />}
        </div>
      </main>
    </div>
  );
}

export default App;
