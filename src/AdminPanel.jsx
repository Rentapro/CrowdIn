import { useState, useEffect } from 'react';
import { Users, FileText, Plus, LogOut, CheckCircle2 } from 'lucide-react';

export default function AdminPanel({ user, onLogout }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(10000000);
  const [newCredentials, setNewCredentials] = useState(null);

  const tiers = [
    { value: 1000000, name: 'Inicio', roi: 0.015 },
    { value: 5000000, name: 'Crecimiento', roi: 0.017 },
    { value: 10000000, name: 'Avanzado', roi: 0.02 },
    { value: 20000000, name: 'Premium', roi: 0.022 },
    { value: 40000000, name: 'Elite', roi: 0.025 },
    { value: 100000000, name: 'Institucional', roi: 0.025 },
  ];

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` }
      });
      if (!res.ok) throw new Error('Error al cargar clientes');
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    const tier = tiers.find(t => t.value === parseInt(amount));
    
    try {
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}`
        },
        body: JSON.stringify({
          name,
          email,
          amount: tier.value,
          tier_name: tier.name,
          monthly_roi: tier.roi
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setNewCredentials(data.credentials);
      fetchClients();
      setShowForm(false);
      setName('');
      setEmail('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePrintContract = (client) => {
    // Generate printable contract window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Borrador de Contrato - ${client.name}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; color: #000; }
            h1 { text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 40px; }
            p { text-align: justify; margin-bottom: 20px; }
            .signature { margin-top: 80px; display: flex; justify-content: space-between; }
            .line { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Contrato de Promesa de Compraventa y Mandato Especial</h1>
          <p>En Santiago de Chile, a ${new Date().toLocaleDateString('es-CL')}, entre <strong>CrowdIn SpA</strong>, en adelante "La Sociedad", y don/doña <strong>${client.name}</strong>, correo electrónico <strong>${client.email}</strong>, en adelante "El Inversor", se acuerda lo siguiente:</p>
          <p><strong>PRIMERO:</strong> El Inversor hace entrega en este acto de la suma de <strong>$${new Intl.NumberFormat('es-CL').format(client.amount)} CLP</strong> correspondientes al Tramo <strong>${client.tier_name}</strong>.</p>
          <p><strong>SEGUNDO:</strong> La Sociedad garantiza un retorno fijo contractual correspondiente a un ROI mensual del <strong>${client.monthly_roi * 100}%</strong>, equivalente a <strong>$${new Intl.NumberFormat('es-CL').format(client.amount * client.monthly_roi)} CLP</strong> mensuales.</p>
          <p><strong>TERCERO:</strong> El plazo de bloqueo del capital será de 12 meses, tras lo cual se ejecutará el pago Bullet o la reestructuración del mandato.</p>
          <div class="signature">
            <div class="line">CrowdIn SpA<br/>Representante Legal</div>
            <div class="line">${client.name}<br/>El Inversor</div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--sage-900)', color: 'white', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--sage-700)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Cuartel General</h1>
          <p style={{ color: 'var(--sage-300)', margin: '0.5rem 0 0 0' }}>Panel Superadmin • {user.name}</p>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid var(--sage-600)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Salir
        </button>
      </header>

      {newCredentials && (
        <div style={{ background: '#064e3b', border: '1px solid #047857', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#34d399' }}>
            <CheckCircle2 size={24} /> <h3 style={{ margin: 0 }}>¡Cliente Creado Exitosamente!</h3>
          </div>
          <p style={{ margin: '0 0 0.5rem 0' }}>Copia estas credenciales y envíalas al cliente por un canal seguro (WhatsApp):</p>
          <div style={{ background: '#022c22', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace' }}>
            Correo: {newCredentials.email}<br/>
            Clave Temporal: <strong style={{ color: 'white' }}>{newCredentials.tempPassword}</strong>
          </div>
          <button onClick={() => setNewCredentials(null)} style={{ marginTop: '1rem', background: '#34d399', color: '#064e3b', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Aviso</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={24} /> Inversores Activos</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'white', color: 'var(--sage-900)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Plus size={18} /> Nuevo Inversor
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--sage-800)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--sage-700)' }}>
          <h3 style={{ marginTop: 0 }}>Registrar Nuevo Capitalista</h3>
          <form onSubmit={handleCreateClient} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--sage-300)' }}>Nombre Completo</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--sage-300)' }}>Correo Electrónico</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--sage-300)' }}>Tramo de Inversión</label>
              <select value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white' }}>
                {tiers.map(t => (
                  <option key={t.value} value={t.value}>{t.name} - ${new Intl.NumberFormat('es-CL').format(t.value)}</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{ background: '#34d399', color: '#064e3b', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '42px' }}>Crear y Asignar</button>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--sage-800)', borderRadius: '16px', border: '1px solid var(--sage-700)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--sage-900)' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500 }}>Inversor</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500 }}>Capital</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500 }}>Tramo</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500 }}>Estado</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Cargando inteligencia...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--sage-400)' }}>Aún no hay clientes registrados. Crea el primero.</td></tr>
            ) : (
              clients.map(client => (
                <tr key={client.user_id} style={{ borderTop: '1px solid var(--sage-700)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{client.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--sage-400)' }}>{client.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold', color: '#34d399' }}>
                    ${new Intl.NumberFormat('es-CL').format(client.amount)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ background: 'var(--sage-700)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>{client.tier_name}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}><CheckCircle2 size={14}/> {client.status}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <button onClick={() => handlePrintContract(client)} style={{ background: 'transparent', border: '1px solid var(--sage-500)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <FileText size={16} /> Borrador
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
