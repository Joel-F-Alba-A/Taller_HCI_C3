import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Edit2, Trash2, Search, ChevronLeft, ChevronRight, MessageSquareText } from 'lucide-react';

export default function PurchaseManagement() {
  const { purchases, clients, updatePurchase, deletePurchase } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset page on query changing
  }

  const filteredPurchases = purchases.filter(p => {
    const client = clients.find(c => c.id === p.clientId);
    const searchLow = searchTerm.toLowerCase();
    return (
      (client?.name.toLowerCase() || '').includes(searchLow) ||
      (client?.cedula || '').includes(searchLow) ||
      p.product.toLowerCase().includes(searchLow)
    );
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination Logic
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);

  const prevPage = () => { if(currentPage > 1) setCurrentPage(p => p - 1) };
  const nextPage = () => { if(currentPage < totalPages) setCurrentPage(p => p + 1) };

  const handleEditClick = (p: any) => {
    setEditingId(p.id);
    setEditFormData({
      product: p.product,
      lensType: p.lensType,
      cost: p.cost,
      date: p.date,
      comment: p.comment || ''
    });
  };

  const handleSave = (id: string) => {
    updatePurchase(id, {
      ...editFormData,
      cost: parseFloat(editFormData.cost)
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta compra? Esta acción afectará el Resumen Gerencial.')) {
      deletePurchase(id);
    }
  };

  return (
    <div className="card">
      <h2>Gestión de Compras</h2>
      <div className="search-bar-container" style={{ marginBottom: 20 }}>
        <div className="input-icon-wrapper">
          <Search size={18} className="input-icon" />
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: 40 }}
            placeholder="Buscar por nombre, cédula o producto..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Tipo Lente</th>
              <th>Costo ($)</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>No hay compras que coincidan.</td></tr>
            )}
            {currentItems.map(p => {
              const client = clients.find(c => c.id === p.clientId);
              const isEditing = editingId === p.id;
              
              return (
                <React.Fragment key={p.id}>
                <tr>
                  <td style={{ color: 'var(--opt-text-muted)' }}>
                    {p.comment ? <span title="Tiene comentario adjunto"><MessageSquareText size={16} /></span> : ''}
                  </td>
                  <td>
                    {client?.name}
                    <br/><small style={{ color: 'var(--text-color)', opacity: 0.7 }}>C.C: {client?.cedula}</small>
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editFormData.product} 
                        onChange={(e) => setEditFormData({...editFormData, product: e.target.value})} 
                        className="form-control"
                      />
                    ) : p.product}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editFormData.lensType} 
                        onChange={(e) => setEditFormData({...editFormData, lensType: e.target.value})} 
                        className="form-control"
                      />
                    ) : p.lensType}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editFormData.cost} 
                        onChange={(e) => setEditFormData({...editFormData, cost: e.target.value})} 
                        className="form-control"
                      />
                    ) : `$${p.cost.toLocaleString('es-CO')}`}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="date" 
                        value={editFormData.date} 
                        onChange={(e) => setEditFormData({...editFormData, date: e.target.value})} 
                        className="form-control"
                      />
                    ) : p.date}
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-primary" onClick={() => handleSave(p.id)}>Guardar</button>
                        <button className="btn" onClick={() => setEditingId(null)}>Cancelar</button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => handleEditClick(p)} title="Editar Compra"><Edit2 size={18} /></button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(p.id)} title="Eliminar Compra"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </td>
                </tr>
                {(isEditing || p.comment) && (
                  <tr style={{ background: 'var(--bg-color)' }}>
                    <td colSpan={7} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-color)' }}>
                      {isEditing ? (
                         <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>Comentarios / Notas de Compra</label>
                            <textarea 
                              className="form-control" 
                              style={{ width: '100%', minHeight: '60px' }}
                              value={editFormData.comment} 
                              onChange={(e) => setEditFormData({...editFormData, comment: e.target.value})} 
                            />
                         </div>
                      ) : (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                          <strong>Nota:</strong> {p.comment}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 15, marginTop: 20 }}>
          <button className="btn btn-icon" onClick={prevPage} disabled={currentPage === 1}>
            <ChevronLeft size={18} /> Anterior
          </button>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
            Página {currentPage} de {totalPages}
          </div>

          <button className="btn btn-icon" onClick={nextPage} disabled={currentPage === totalPages}>
            Siguiente <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
