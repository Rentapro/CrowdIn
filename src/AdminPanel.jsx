import { useState, useEffect } from 'react';
import { Users, FileText, Plus, LogOut, CheckCircle2, ShieldAlert, DollarSign, Activity, AlertCircle, Trash2, KeyRound, ArrowRightCircle, History, X } from 'lucide-react';
import ParallaxBackground from './ParallaxBackground';

export default function AdminPanel({ user, onLogout }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(10000000);
  const [bankAccount, setBankAccount] = useState('');
  const [newCredentials, setNewCredentials] = useState(null);

  // Modal Logs
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ name, rut, email, bank_account: bankAccount, amount: tier.value, tier_name: tier.name, monthly_roi: tier.roi })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.credentials) setNewCredentials(data.credentials);
      else alert(data.message); // Inversor ya existía
      fetchClients();
      setShowForm(false);
      setName(''); setRut(''); setEmail(''); setBankAccount('');
    } catch (err) { alert(err.message); }
  };

  const handleToggleKYC = async (userId, currentStatus) => {
    try {
      const res = await fetch('/api/admin/toggle-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ user_id: userId, current_status: currentStatus })
      });
      if (res.ok) fetchClients();
    } catch (err) { console.error(err); }
  };

  const handleAddPayment = async (contractId) => {
    try {
      const res = await fetch('/api/admin/add-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ contract_id: contractId })
      });
      if (res.ok) fetchClients();
    } catch (err) { console.error(err); }
  };

  const handleLiquidate = async (contractId) => {
    if (!window.confirm("¿Confirmas que el Pago Bullet (Capital Original) ya fue transferido? Esta acción cerrará el contrato.")) return;
    try {
      const res = await fetch('/api/admin/liquidate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ contract_id: contractId })
      });
      if (res.ok) fetchClients();
    } catch (err) { console.error(err); }
  };

  const handleResetPassword = async (userId, email) => {
    if (!window.confirm(`¿Generar nueva clave para ${email}? La antigua dejará de funcionar.`)) return;
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (res.ok) setNewCredentials({ email, tempPassword: data.tempPassword });
    } catch (err) { console.error(err); }
  };

  const handleOpenLogs = async (contractId) => {
    setLogsModalOpen(true);
    setLogLoading(true);
    setCurrentLogs([]);
    try {
      const res = await fetch(`/api/admin/payment-logs?contract_id=${contractId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` }
      });
      const data = await res.json();
      if (res.ok) setCurrentLogs(data);
    } catch (err) { console.error(err); } finally {
      setLogLoading(false);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`¿Estás 100% seguro de eliminar al inversor ${name} y destruir sus contratos?`)) return;
    try {
      const res = await fetch('/api/admin/delete-client', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) fetchClients();
    } catch (err) { console.error(err); }
  };

  const handlePrintContract = (client) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Contrato Institucional CrowdIn - ${client.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap');
            body { font-family: 'Merriweather', serif; padding: 50px 70px; line-height: 1.8; max-width: 900px; margin: 0 auto; color: #1a1a1a; font-size: 11pt; text-align: justify; }
            h1 { text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 40px; font-weight: 700; letter-spacing: 1px; border-bottom: 2px solid #000; padding-bottom: 15px; }
            h2 { font-size: 12pt; margin-top: 35px; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px dotted #ccc; padding-bottom: 5px; font-weight: 700; }
            p { margin-bottom: 20px; text-indent: 20px; }
            .signature-block { margin-top: 100px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .line { border-top: 1px solid #000; width: 300px; text-align: center; padding-top: 10px; font-weight: 700; font-size: 10pt; line-height: 1.4; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100pt; color: rgba(0,0,0,0.03); z-index: -1; white-space: nowrap; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="watermark">CROWDIN INSTITUCIONAL</div>
          <h1>CONTRATO DE SUSCRIPCIÓN DE ACCIONES, PACTO DE RENTABILIDAD GARANTIZADA, OPCIÓN DE COMPRA (CALL OPTION) Y MANDATO IRREVOCABLE</h1>
          <p>En la ciudad de Santiago de Chile, a <strong>${new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>, comparecen por una parte <strong>CrowdIn SpA</strong>, y por la otra parte don/doña <strong>${client.name}</strong>, correo electrónico <strong>${client.email}</strong>, ${client.bank_account_info ? 'Cuenta Bancaria Registrada (UAF): <strong>'+client.bank_account_info+'</strong>' : ''} (en adelante "El Inversor").</p>
          <h2>PRIMERO: Naturaleza y Antecedentes Societarios</h2>
          <p>La Sociedad desarrolla activos inmobiliarios de alto rendimiento (Proptech). El Inversor aporta liquidez a La Caja a cambio de rentabilidad mensual garantizada.</p>
          <h2>SEGUNDO: Aporte y Suscripción</h2>
          <p>El Inversor integra la suma de <strong>$${new Intl.NumberFormat('es-CL').format(client.amount)} CLP</strong> ("Capital Aportado").</p>
          <h2>TERCERO: Rentabilidad Preferente (ROI Mensual)</h2>
          <p>La Sociedad garantiza un flujo mensual del <strong>${client.monthly_roi * 100}%</strong>, equivalente a <strong>$${new Intl.NumberFormat('es-CL').format(client.amount * client.monthly_roi)} CLP</strong> mensuales.</p>
          <h2>CUARTO: Restricciones Estrictas (UAF y Lavado de Activos)</h2>
          <p><strong>LEY N° 19.913:</strong> Todos los flujos y la devolución final (Pago Bullet) serán transferidos <strong>estricta y exclusivamente a la cuenta bancaria de origen</strong> declarada. Bajo ninguna circunstancia se aceptarán transferencias a terceros.</p>
          <h2>QUINTO: Plazo de Inversión y Pago Bullet</h2>
          <p>El horizonte es de <strong>12 meses calendario</strong>. Al vencimiento, La Sociedad restituirá íntegramente el Capital Aportado.</p>
          <h2>SEXTO: Opción de Compra Unilateral y Mandato Especial (Call Option)</h2>
          <p>El Inversor otorga una Opción de Compra irrevocable a favor de La Sociedad para recomprar las acciones por el mismo valor nominal. Si se negare, otorga un <strong>Mandato Especial (Art. 241 C. Comercio)</strong> al representante legal para autocontratar y forzar el traspaso tras depositar el capital original.</p>
          <div class="signature-block">
            <div class="line">CrowdIn SpA<br/>Representante Legal</div>
            <div class="line">${client.name}<br/>El Inversor</div>
          </div>
          <script>window.onload = function() { setTimeout(() => window.print(), 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalCapital = clients.reduce((acc, c) => acc + Number(c.amount), 0);
  const totalPagado = clients.reduce((acc, c) => acc + ((Number(c.amount) * Number(c.monthly_roi)) * (c.payments_made || 0)), 0);
  const kycPendientes = clients.filter(c => c.kyc_status !== 'VERIFIED').length;

  return (
    <>
      <ParallaxBackground />
      <div style={{ minHeight: '100vh', color: 'var(--charcoal)', padding: '2rem', position: 'relative', zIndex: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--sage-300)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--sage-800)' }}>Portal Institucional (Backoffice)</h1>
          <p style={{ color: 'var(--charcoal-mid)', margin: '0.5rem 0 0 0' }}>Superadmin • Dashboard de Control</p>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid var(--sage-500)', color: 'var(--sage-800)', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <LogOut size={18} /> Salir
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
          <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><DollarSign size={16} color="var(--sage-500)"/> AUM (Capital Activo)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)' }}>${new Intl.NumberFormat('es-CL').format(totalCapital)}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
          <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><Activity size={16} color="var(--sage-500)"/> Retornos Pagados</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>${new Intl.NumberFormat('es-CL').format(totalPagado)}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
          <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><Users size={16} color="var(--sage-500)"/> KYC Pendientes</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: kycPendientes > 0 ? '#b45309' : 'var(--success)' }}>{kycPendientes}</div>
        </div>
      </div>

      {newCredentials && (
        <div style={{ background: '#064e3b', border: '1px solid #047857', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#34d399' }}>¡Atención: Credenciales Temporales!</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>Usuario: {newCredentials.email}</p>
          <div style={{ background: '#022c22', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>{newCredentials.tempPassword}</div>
          <button onClick={() => setNewCredentials(null)} style={{ marginTop: '1rem', background: '#34d399', color: '#064e3b', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar y Limpiar</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--sage-800)' }}><Users size={24} /> Operaciones Activas</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'var(--sage-800)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Plus size={18} /> Nuevo Contrato
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--sage-300)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--sage-800)' }}>Onboarding Institucional</h3>
          <form onSubmit={handleCreateClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>Nombre Completo</label><input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)', color: 'var(--charcoal)' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>RUT</label><input type="text" value={rut} onChange={e => setRut(e.target.value)} placeholder="12.345.678-9" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)', color: 'var(--charcoal)' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>Correo (ID de Bóveda)</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)', color: 'var(--charcoal)' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>Cuenta Origen/Destino</label><input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="Cta Corriente BCI 123..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)', color: 'var(--charcoal)' }} /></div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>Tramo de Inversión</label>
              <select value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)', color: 'var(--charcoal)' }}>
                {tiers.map(t => <option key={t.value} value={t.value}>{t.name} - ${new Intl.NumberFormat('es-CL').format(t.value)}</option>)}
              </select>
            </div>
            <button type="submit" style={{ background: 'var(--sage-800)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Estructurar Posición</button>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--sage-300)', overflowX: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
          <thead>
            <tr style={{ background: 'var(--sage-100)' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontWeight: 600, fontSize: '0.85rem' }}>INVERSOR</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontWeight: 600, fontSize: '0.85rem' }}>CAPITAL (TRAMO)</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontWeight: 600, fontSize: '0.85rem' }}>KYC STATUS</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontWeight: 600, fontSize: '0.85rem' }}>PAGOS (MESES)</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>ACCIONES LEGALES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Sincronizando Neon DB...</td></tr> : 
             clients.map(client => (
              <tr key={client.contract_id} style={{ borderTop: '1px solid var(--sage-100)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{client.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-mid)' }}>{client.bank_account_info || client.email}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--charcoal)' }}>${new Intl.NumberFormat('es-CL').format(client.amount)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sage-700)' }}>{client.tier_name} ({client.monthly_roi * 100}%)</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <button onClick={() => handleToggleKYC(client.user_id, client.kyc_status)} style={{ background: client.kyc_status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: client.kyc_status === 'VERIFIED' ? 'var(--success)' : '#d97706', border: `1px solid ${client.kyc_status === 'VERIFIED' ? 'var(--success)' : '#d97706'}`, padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    {client.kyc_status === 'VERIFIED' ? <><ShieldAlert size={14}/> KYC VERIFICADO</> : <><AlertCircle size={14}/> KYC PENDIENTE</>}
                  </button>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: 'var(--sage-100)', width: '100px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--success)', width: `${((client.payments_made || 0) / 12) * 100}%`, height: '100%' }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--charcoal-mid)', minWidth: '40px', fontWeight: 600 }}>{client.payments_made || 0}/12</span>
                    
                    {client.payments_made < 12 ? (
                      <button onClick={() => handleAddPayment(client.contract_id)} style={{ background: 'var(--sage-700)', border: 'none', color: 'white', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem' }}>+1</button>
                    ) : (
                      <button onClick={() => handleLiquidate(client.contract_id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <ArrowRightCircle size={14}/> LIQUIDAR
                      </button>
                    )}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button onClick={() => handlePrintContract(client)} style={{ background: 'white', border: '1px solid var(--sage-300)', color: 'var(--charcoal)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    <FileText size={14} /> PDF
                  </button>
                  <button onClick={() => handleOpenLogs(client.contract_id)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }} title="Historial de Pagos">
                    <History size={16} />
                  </button>
                  <button onClick={() => handleResetPassword(client.user_id, client.email)} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--gold-dark)', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }} title="Regenerar Clave">
                    <KeyRound size={16} />
                  </button>
                  <button onClick={() => handleDelete(client.user_id, client.name)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }} title="Eliminar Cliente Totalmente">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', border: '1px solid var(--sage-100)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>
            <button onClick={() => setLogsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--charcoal-mid)', cursor: 'pointer' }}><X size={24}/></button>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--sage-800)' }}><History size={24}/> Historial de Pagos (Auditoría)</h3>
            
            {logLoading ? (
              <p style={{ color: 'var(--charcoal-mid)', textAlign: 'center' }}>Cargando logs del sistema...</p>
            ) : currentLogs.length === 0 ? (
              <p style={{ color: 'var(--charcoal-mid)', textAlign: 'center' }}>No hay registros de pagos para este contrato aún.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentLogs.map(log => (
                  <div key={log.id} style={{ background: 'var(--sage-50)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--sage-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: 'var(--sage-700)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>CUOTA #{log.payment_number}</div>
                      <div style={{ color: 'var(--charcoal)', fontWeight: 'bold' }}>{new Date(log.executed_at).toLocaleString('es-CL')}</div>
                      <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Audit: {log.executed_by}</div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                      +${new Intl.NumberFormat('es-CL').format(log.payment_amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
    </>
  );
}
