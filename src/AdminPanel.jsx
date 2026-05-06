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
          <title>Contrato Legal - ${client.name}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; max-width: 850px; margin: 0 auto; color: #000; font-size: 11pt; text-align: justify; }
            h1 { text-align: center; text-transform: uppercase; font-size: 14pt; margin-bottom: 30px; font-weight: bold; }
            h2 { font-size: 12pt; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; }
            p { margin-bottom: 15px; }
            .signature-block { margin-top: 80px; display: flex; justify-content: space-around; page-break-inside: avoid; }
            .line { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 10px; font-weight: bold; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <h1>CONTRATO DE SUSCRIPCIÓN DE ACCIONES, PACTO DE RENTABILIDAD Y OPCIÓN DE COMPRA</h1>
          
          <p>En Santiago de Chile, a <strong>${new Date().toLocaleDateString('es-CL')}</strong>, entre <strong>CrowdIn SpA</strong> (en adelante "La Sociedad" o "El Desarrollador"), representada legalmente por su Gerente General, y don/doña <strong>${client.name}</strong>, cédula de identidad N° _______________, correo electrónico <strong>${client.email}</strong> (en adelante "El Inversor"), se ha convenido el siguiente contrato privado:</p>

          <h2>PRIMERO: Antecedentes del Capital</h2>
          <p>La Sociedad es una empresa dedicada al desarrollo, remodelación y comercialización de activos inmobiliarios. Para la estructuración de su capital de trabajo, La Sociedad emite acciones preferentes. El Inversor manifiesta su intención de aportar liquidez al modelo de negocios a cambio de una rentabilidad fija y garantizada.</p>

          <h2>SEGUNDO: Aporte y Suscripción</h2>
          <p>Por el presente acto, El Inversor suscribe e integra a la caja de La Sociedad la suma de <strong>$${new Intl.NumberFormat('es-CL').format(client.amount)} CLP</strong> (el "Capital Aportado"), correspondiente al plan institucional <strong>Tramo ${client.tier_name}</strong>. Dicho monto será transferido a la cuenta corriente institucional de la Sociedad. Contra recepción de los fondos, la Sociedad registrará a nombre del Inversor las acciones preferentes correspondientes en el Registro de Accionistas.</p>

          <h2>TERCERO: Rentabilidad Garantizada (Condiciones de Pago)</h2>
          <p>La Sociedad garantiza contractualmente al Inversor un flujo financiero mensual fijo (ROI) del <strong>${client.monthly_roi * 100}%</strong> sobre el Capital Aportado. Esto equivale a la suma de <strong>$${new Intl.NumberFormat('es-CL').format(client.amount * client.monthly_roi)} CLP</strong> mensuales, los cuales serán depositados en la cuenta bancaria designada por El Inversor los días 5 de cada mes calendario, devengándose desde la recepción del Capital Aportado.</p>

          <h2>CUARTO: Plazo de Inversión y Pago Bullet</h2>
          <p>El horizonte de inversión y bloqueo del capital será de exactamente <strong>12 meses</strong>. Al término de este período (Mes 12), La Sociedad ejecutará el "Pago Bullet", restituyendo el Capital Aportado ($${new Intl.NumberFormat('es-CL').format(client.amount)} CLP) de forma íntegra a la cuenta del Inversor, extinguiendo su participación accionaria, salvo que las partes acuerden por escrito la reinversión ("roll-over") en un nuevo ciclo.</p>

          <h2>QUINTO: Opción de Compra Unilateral y Mandato Irrevocable (Call Option)</h2>
          <p>Para asegurar el correcto funcionamiento del modelo de crowdfunding, El Inversor no podrá retener las acciones más allá del Plazo de Inversión estipulado, dado que su participación es netamente de rentabilidad financiera y no de control societario.</p>
          <p>En este acto, El Inversor otorga de forma irrevocable e incondicional una <strong>Opción de Compra (Call Option)</strong> a favor de La Sociedad (o del Accionista Mayoritario que esta designe) para recomprar la totalidad de sus acciones suscritas, exactamente por el mismo valor nominal del Capital Aportado.</p>
          <p><strong>Cláusula de Ejecución Forzosa:</strong> En caso de que, cumplido el Mes 12, El Inversor se niegue o retrase injustificadamente la firma del traspaso de acciones de vuelta a La Sociedad, El Inversor otorga en este acto un <strong>Mandato Especial, Gratuito e Irrevocable</strong>, en los términos del artículo 241 del Código de Comercio, al representante legal de La Sociedad. Este mandato faculta a la Sociedad a autocontratar, firmar el traspaso de acciones en representación del Inversor, e inscribirlo en el Registro de Accionistas, bastando para ello únicamente que La Sociedad demuestre haber transferido o depositado el Capital Aportado original a la cuenta bancaria del Inversor. Una vez fondeada la cuenta, la salida del Inversor será inmediata y legalmente perfeccionada.</p>

          <h2>SEXTO: Riesgo, Liquidación y Garantías</h2>
          <p>La Sociedad declara que el pago del flujo mensual establecido en la cláusula Tercera no depende del éxito o fracaso comercial de la venta de los inmuebles, asumiendo la Sociedad dicho riesgo comercial con su propio capital patrimonial y flujo de caja matriz.</p>

          <h2>SÉPTIMO: Jurisdicción y Domicilio</h2>
          <p>Para todos los efectos legales derivados de este contrato, las partes fijan su domicilio en la comuna y ciudad de Santiago, sometiéndose a la jurisdicción de sus Tribunales Ordinarios de Justicia.</p>

          <p><br/>Se firma en dos ejemplares del mismo tenor y fecha, quedando uno en poder de cada parte.</p>

          <div class="signature-block">
            <div class="line">
              <br/>CrowdIn SpA<br/>Representante Legal<br/>RUT: ____________
            </div>
            <div class="line">
              <br/>${client.name}<br/>El Inversor<br/>RUT: ____________
            </div>
          </div>
          
          <script>
            window.onload = function() { 
              setTimeout(() => window.print(), 500);
            }
          </script>
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
