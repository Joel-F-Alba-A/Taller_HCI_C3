import { useState } from 'react';
import { useData } from '../store/DataContext';
import { Edit2, Trash2, Search, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ClientManagement() {
  const { clients, updateClient, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Limit to 8 items per page to reduce vertical height

  // On search change, reset pagination
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  const filteredClients = clients.filter(c => {
    const searchLow = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(searchLow) ||
      (c.cedula || '').includes(searchLow) ||
      (c.phone || '').includes(searchLow)
    );
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const prevPage = () => { if(currentPage > 1) setCurrentPage(p => p - 1) };
  const nextPage = () => { if(currentPage < totalPages) setCurrentPage(p => p + 1) };

  const handleEditClick = (c: any) => {
    setEditingId(c.id);
    setEditFormData({
      name: c.name,
      cedula: c.cedula,
      phone: c.phone
    });
  };

  const handleSave = (id: string) => {
    updateClient(id, editFormData);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este cliente? Se eliminarán también todas sus compras efectuadas.')) {
      deleteClient(id);
    }
  };

  return (
    <div className="card">
      <h2>Gestión de Clientes</h2>
      <div className="search-bar-container" style={{ marginBottom: 20 }}>
        <div className="input-icon-wrapper">
          <Search size={18} className="input-icon" />
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: 40 }}
            placeholder="Buscar cliente por nombre, cédula o teléfono..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre del Cliente</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>No hay clientes que coincidan.</td></tr>
            )}
            {currentItems.map(c => {
              const isEditing = editingId === c.id;
              
              return (
                <tr key={c.id}>
                  <td>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editFormData.name} 
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                        className="form-control"
                      />
                    ) : c.name}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editFormData.cedula} 
                        onChange={(e) => setEditFormData({...editFormData, cedula: e.target.value})} 
                        className="form-control"
                      />
                    ) : c.cedula || 'N/A'}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editFormData.phone} 
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} 
                        className="form-control"
                      />
                    ) : c.phone || 'N/A'}
                  </td>
                  <td>
                    <span className={`badge ${c.type.toLowerCase()}`}>
                      {c.type}
                    </span>
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn-icon" onClick={() => handleSave(c.id)} title="Guardar"><Save size={18} /></button>
                        <button className="btn-icon" onClick={() => setEditingId(null)} title="Cancelar"><X size={18} /></button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => handleEditClick(c)} title="Editar Perfil"><Edit2 size={18} /></button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(c.id)} title="Eliminar Cliente"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </td>
                </tr>
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
