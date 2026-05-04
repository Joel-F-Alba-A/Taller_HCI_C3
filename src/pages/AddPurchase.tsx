import React, { useState, useEffect } from 'react';
import { useData } from '../store/DataContext';

export default function AddPurchase() {
  const { addPurchase, clients } = useData();

  const [searchValue, setSearchValue] = useState('');
  const [clientName, setClientName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');

  const [product, setProduct] = useState('Montura y Lentes');
  const [lensType, setLensType] = useState('Monofocal');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');

  // Handle autocomplete dynamically when searchValue changes
  useEffect(() => {
    if (searchValue.trim().length > 2) {
      const searchLow = searchValue.toLowerCase();
      const found = clients.find(c =>
        c.name.toLowerCase() === searchLow ||
        c.cedula === searchLow
      );

      if (found) {
        setClientName(found.name);
        setCedula(found.cedula || '');
        setPhone(found.phone || '');
      } else {
        // Only override if search value is distinctly a number vs text
        if (/^\d+$/.test(searchValue)) {
          setCedula(searchValue);
          setClientName('');
        } else {
          setClientName(searchValue);
          setCedula('');
        }
      }
    } else {
      // If not found or empty, just bind to name mostly unless digits
      if (/^\d+$/.test(searchValue)) {
        setCedula(searchValue);
        setClientName('');
      } else {
        setClientName(searchValue);
        setCedula('');
      }
    }
  }, [searchValue, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !cost) return;

    addPurchase({
      product,
      lensType,
      cost: parseFloat(cost),
      date,
      comment
    }, clientName, cedula, phone);

    // Reset some fields
    setSearchValue('');
    setClientName('');
    setCedula('');
    setPhone('');
    setCost('');
    setComment('');
    alert('¡Compra registrada con éxito!');
  };

  return (
    <div className="card" style={{ maxWidth: 950, margin: '0 auto' }}>
      <h2>Registrar Nueva Compra</h2>
      <form onSubmit={handleSubmit}>

        <div className="form-group" style={{ background: 'var(--bg-color)', padding: 15, borderRadius: 8, border: '1px solid var(--border-color)' }}>
          <label>Buscar Cliente (Nombre o Cédula)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej. Juan Pérez o 1098765432"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            list="client-suggestions"
          />
          <datalist id="client-suggestions">
            {clients.map(c => (
              <option key={c.id} value={c.name}>{c.cedula ? `C.C: ${c.cedula}` : ''}</option>
            ))}
            {clients.map(c => (
              c.cedula ? <option key={`${c.id}-cc`} value={c.cedula}>{c.name}</option> : null
            ))}
          </datalist>
          <small style={{ color: 'var(--text-color)', opacity: 0.9, fontSize: '0.9rem', marginTop: 8, display: 'block' }}>
            Si el cliente existe, se autocompletarán sus datos. Si es nuevo, llena los siguientes campos.
          </small>
        </div>

        {/* Client Metadata Grid (3 columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 15, marginTop: 15 }}>
          <div className="form-group">
            <label>Nombre del Cliente *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej. Juan Pérez"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Cédula *</label>
            <input
              type="number"
              className="form-control"
              placeholder="Ej. 10987453"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Ej. 3001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />

        {/* Purchase Metadata Grids (2 columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 15 }}>
          <div className="form-group">
            <label>Producto Comprado</label>
            <select
              className="form-control"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            >
              <option value="Montura y Lentes">Montura y Lentes</option>
              <option value="Solo Montura">Solo Montura</option>
              <option value="Lentes de Contacto">Lentes de Contacto</option>
              <option value="Gafas de Sol">Gafas de Sol</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tipo de Lente</label>
            <select
              className="form-control"
              value={lensType}
              onChange={(e) => setLensType(e.target.value)}
            >
              <option value="Monofocal">Monofocal</option>
              <option value="Bifocal">Bifocal</option>
              <option value="Progresivo">Progresivo</option>
              <option value="Ocupacional">Ocupacional</option>
              <option value="Ninguno">Ninguno</option>
            </select>
          </div>

          <div className="form-group">
            <label>Costo ($)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Ej. 150000"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha de Compra</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 10 }}>
          <label>Comentario o Descripción (Opcional)</label>
          <textarea
            className="form-control"
            style={{ resize: 'vertical', minHeight: '60px' }}
            placeholder="Ej. Montura en promo, armazón negro y vidrios anti-reflejo."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 20, width: '100%', padding: '15px', fontSize: '15px' }}>
          Registrar Compra
        </button>
      </form>
    </div>
  );
}
