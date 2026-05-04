import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { MessageSquare, Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ClientList() {
  const { clients, sendWhatsAppMessage } = useData();
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Compact view

  const handleSearchFilter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, type: 'search' | 'filter') => {
    if(type === 'search') setSearchTerm(e.target.value);
    if(type === 'filter') setFilterType(e.target.value);
    setCurrentPage(1); // Reset page on filter
  }

  const toggleClient = (id: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    const newSet = new Set(selectedClients);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedClients(newSet);
  };

  const filteredClients = clients.filter(c => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(searchLow) || (c.cedula || '').includes(searchLow);
    const matchesType = filterType === 'All' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate Pagination OVER filtered clients
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const prevPage = () => { if(currentPage > 1) setCurrentPage(p => p - 1) };
  const nextPage = () => { if(currentPage < totalPages) setCurrentPage(p => p + 1) };

  const selectAllCurrentPage = () => {
    const isAllSelected = currentItems.every(c => selectedClients.has(c.id));
    const newSet = new Set(selectedClients);
    if (isAllSelected) {
      currentItems.forEach(c => newSet.delete(c.id));
    } else {
      currentItems.forEach(c => newSet.add(c.id));
    }
    setSelectedClients(newSet);
  };

  const handleSendMessage = () => {
    if (selectedClients.size === 0) {
      alert("Selecciona al menos un cliente.");
      return;
    }
    if (!message.trim()) {
      alert("Escribe un mensaje.");
      return;
    }

    selectedClients.forEach(id => {
      const client = clients.find(c => c.id === id);
      if (client) sendWhatsAppMessage(client.name, message);
    });

    setMessage('');
    setSelectedClients(newSet => {
      newSet.clear();
      return newSet;
    });
    alert('Mensajes enviados. Revisa tu aplicación de WhatsApp.');
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };


  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>CRM y Campañas</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="input-icon-wrapper" style={{ width: 250 }}>
            <Search size={18} className="input-icon" />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: 40 }}
              placeholder="Buscar (Nombre, CC)..." 
              value={searchTerm}
              onChange={(e) => handleSearchFilter(e, 'search')}
            />
          </div>
          <div className="input-icon-wrapper" style={{ width: 140 }}>
            <Filter size={18} className="input-icon" />
            <select 
              className="form-control" 
              style={{ paddingLeft: 40 }}
              value={filterType}
              onChange={(e) => handleSearchFilter(e, 'filter')}
            >
              <option value="All">Todas</option>
              <option value="VIP">VIP</option>
              <option value="Fiel">Fiel</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>
                <input 
                  type="checkbox" 
                  onChange={selectAllCurrentPage}
                  checked={currentItems.length > 0 && currentItems.every(c => selectedClients.has(c.id))}
                  title="Seleccionar la página actual"
                />
              </th>
              <th>Cliente</th>
              <th>Categoría</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>No hay clientes que coincidan.</td></tr>
            )}
            {currentItems.map(c => (
              <React.Fragment key={c.id}>
                <tr onClick={() => toggleExpand(c.id)} style={{ cursor: 'pointer' }} className={expandedId === c.id ? 'active-row' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedClients.has(c.id)}
                      onChange={(e) => toggleClient(c.id, e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>
                    <span className={`badge ${c.type.toLowerCase()}`}>
                      {c.type}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon">
                      {expandedId === c.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </td>
                </tr>
                {expandedId === c.id && (
                  <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <td colSpan={4} style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, fontSize: '0.9rem' }}>
                        <div><strong>Cédula:</strong> {c.cedula || 'N/A'}</div>
                        <div><strong>Teléfono:</strong> {c.phone || 'N/A'}</div>
                        <div><strong>Total Compras:</strong> {c.purchaseCount}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 15, marginTop: 15 }}>
          <button className="btn btn-icon" onClick={prevPage} disabled={currentPage === 1}>
            <ChevronLeft size={18} /> Anterior
          </button>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
            Página {currentPage} de {totalPages} ({filteredClients.length} filtrados)
          </div>

          <button className="btn btn-icon" onClick={nextPage} disabled={currentPage === totalPages}>
            Siguiente <ChevronRight size={18} />
          </button>
        </div>
      )}

      <div className="messaging-box" style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 15, fontSize: "1rem" }}>Enviar Mensaje a {selectedClients.size} clientes seleccionados</h3>
        <textarea 
          className="form-control"
          style={{ height: 100, resize: 'vertical' }}
          placeholder="Escribe el mensaje que quieres enviar por WhatsApp..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div style={{ marginTop: 15, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleSendMessage} disabled={selectedClients.size === 0}>
            <MessageSquare size={18} />
            Enviar Campaña URL
          </button>
        </div>
      </div>
    </div>
  );
}
