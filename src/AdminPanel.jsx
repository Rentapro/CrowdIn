import { useState, useEffect } from 'react';
import { Users, FileText, Plus, LogOut, CheckCircle2, ShieldAlert, DollarSign, Activity, AlertCircle, Check } from 'lucide-react';

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
          name, rut, email, bank_account: bankAccount,
          amount: tier.value, tier_name: tier.name, monthly_roi: tier.roi
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setNewCredentials(data.credentials);
      fetchClients();
      setShowForm(false);
      setName(''); setRut(''); setEmail(''); setBankAccount('');
    } catch (err) {
      alert(err.message);
    }
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

  const handlePrintContract = (client) => {
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
          </style>
        </head>
        <body>
          <h1>CONTRATO DE SUSCRIPCIÓN DE ACCIONES, PACTO DE RENTABILIDAD Y OPCIÓN DE COMPRA</h1>
          <p>En Santiago de Chile, a <strong>${new Date().toLocaleDateString('es-CL')}</strong>, entre <strong>CrowdIn SpA</strong> (en adelante "La Sociedad" o "El Desarrollador"), y don/doña <strong>${client.name}</strong>, correo electrónico <strong>${client.email}</strong>, ${client.bank_account_info ? 'Cuenta Bancaria de Origen/Destino: <strong>'+client.bank_account_info+'</strong>' : ''} (en adelante "El Inversor"), se ha convenido lo siguiente:</p>

          <h2>PRIMERO: Aporte y Suscripción</h2>
          <p>El Inversor suscribe e integra a la caja de La Sociedad la suma de <strong>$${new Intl.NumberFormat('es-CL').format(client.amount)} CLP</strong> ("Capital Aportado").</p>

          <h2>SEGUNDO: Rentabilidad Garantizada</h2>
          <p>La Sociedad garantiza contractualmente al Inversor un ROI del <strong>${client.monthly_roi * 100}% mensual</strong>, equivalente a <strong>$${new Intl.NumberFormat('es-CL').format(client.amount * client.monthly_roi)} CLP</strong>.</p>

          <h2>TERCERO: Restricción UAF / Lavado de Activos y Medio de Pago</h2>
          <p><strong>CUMPLIMIENTO ESTRICTO LEY N° 19.913:</strong> Las partes acuerdan irrevocablemente que todos los flujos de rentabilidad mensual, así como la devolución del Capital Aportado (Pago Bullet), serán transferidos <strong>estricta y exclusivamente a la cuenta bancaria de origen declarada por el Inversor en los antecedentes de este contrato</strong>. Bajo ninguna circunstancia, ni aun mediando solicitud expresa del Inversor, La Sociedad aceptará o ejecutará transferencias a cuentas de terceros u otras cuentas no verificadas, con el fin de prevenir delitos de lavado de activos y financiamiento del terrorismo. Si la cuenta de origen fuere cerrada, el Inversor deberá someterse a un estricto proceso de compliance corporativo para el registro de una nueva cuenta a su nombre.</p>

          <h2>CUARTO: Plazo de Inversión y Pago Bullet</h2>
          <p>El horizonte de inversión es de <strong>12 meses</strong>. Al Mes 12, La Sociedad ejecutará el "Pago Bullet", restituyendo el Capital Aportado de forma íntegra a la cuenta bancaria oficial del Inversor.</p>

          <h2>QUINTO: Opción de Compra Unilateral y Mandato Irrevocable (Call Option)</h2>
          <p>El Inversor otorga de forma irrevocable e incondicional una <strong>Opción de Compra (Call Option)</strong> a favor de La Sociedad para recomprar la totalidad de sus acciones suscritas, exactamente por el mismo valor nominal. Si al Mes 12 el Inversor se niega o retrasa el traspaso, este otorga un <strong>Mandato Especial e Irrevocable (Art. 241 C. Comercio)</strong> al representante de La Sociedad para autocontratar, firmar el traspaso y perfeccionar la salida, depositando los fondos en la cuenta bancaria del Inversor.</p>

          <div class="signature-block">
            <div class="line"><br/>CrowdIn SpA<br/>Representante Legal</div>
            <div class="line"><br/>${client.name}<br/>El Inversor</div>
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--sage-900)', color: 'white', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--sage-700)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Portal Institucional (Backoffice)</h1>
          <p style={{ color: 'var(--sage-300)', margin: '0.5rem 0 0 0' }}>Superadmin • Control de Cumplimiento Normativo (UAF)</p>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid var(--sage-600)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Salir
        </button>
      </header>

      {/* KPI Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--sage-800)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-700)' }}>
          <div style={{ color: 'var(--sage-300)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={16}/> AUM (Capital Activo)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>${new Intl.NumberFormat('es-CL').format(totalCapital)}</div>
        </div>
        <div style={{ background: 'var(--sage-800)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-700)' }}>
          <div style={{ color: 'var(--sage-300)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16}/> Retornos Pagados</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>${new Intl.NumberFormat('es-CL').format(totalPagado)}</div>
        </div>
        <div style={{ background: 'var(--sage-800)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-700)' }}>
          <div style={{ color: 'var(--sage-300)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16}/> KYC Pendientes</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: kycPendientes > 0 ? '#fbbf24' : '#34d399' }}>{kycPendientes}</div>
        </div>
      </div>

      {newCredentials && (
        <div style={{ background: '#064e3b', border: '1px solid #047857', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#34d399' }}>¡Cliente Creado Exitosamente!</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>Clave Temporal (Copiar):</p>
          <div style={{ background: '#022c22', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', color: 'white' }}>{newCredentials.tempPassword}</div>
          <button onClick={() => setNewCredentials(null)} style={{ marginTop: '1rem', background: '#34d399', color: '#064e3b', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={24} /> Operaciones Activas</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'white', color: 'var(--sage-900)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Plus size={18} /> Nuevo Contrato
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--sage-800)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--sage-700)' }}>
          <h3 style={{ marginTop: 0 }}>Onboarding (KYC Básico)</h3>
          <form onSubmit={handleCreateClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--sage-300)' }}>Nombre</label><input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--sage-300)' }}>RUT</label><input type="text" required value={rut} onChange={e => setRut(e.target.value)} placeholder="12.345.678-9" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--sage-300)' }}>Correo</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--sage-300)' }}>Cuenta Origen/Destino</label><input type="text" required value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="Cta Corriente BCI 123..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white' }} /></div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--sage-300)' }}>Tramo</label>
              <select value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white' }}>
                {tiers.map(t => <option key={t.value} value={t.value}>{t.name} - ${new Intl.NumberFormat('es-CL').format(t.value)}</option>)}
              </select>
            </div>
            <button type="submit" style={{ background: '#34d399', color: '#064e3b', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Estructurar</button>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--sage-800)', borderRadius: '16px', border: '1px solid var(--sage-700)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: 'var(--sage-900)' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500, fontSize: '0.85rem' }}>INVERSOR</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500, fontSize: '0.85rem' }}>CAPITAL (TRAMO)</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500, fontSize: '0.85rem' }}>KYC STATUS</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500, fontSize: '0.85rem' }}>PAGOS (MESES)</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-300)', fontWeight: 500, fontSize: '0.85rem' }}>ACCIONES LEGALES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Sincronizando Neon DB...</td></tr> : 
             clients.map(client => (
              <tr key={client.user_id} style={{ borderTop: '1px solid var(--sage-700)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{client.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sage-400)' }}>{client.bank_account_info || client.email}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 'bold', color: 'white' }}>${new Intl.NumberFormat('es-CL').format(client.amount)}</div>
                  <div style={{ fontSize: '0.8rem', color: '#34d399' }}>{client.tier_name} ({client.monthly_roi * 100}%)</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <button onClick={() => handleToggleKYC(client.user_id, client.kyc_status)} style={{ background: client.kyc_status === 'VERIFIED' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)', color: client.kyc_status === 'VERIFIED' ? '#34d399' : '#fbbf24', border: `1px solid ${client.kyc_status === 'VERIFIED' ? '#047857' : '#b45309'}`, padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    {client.kyc_status === 'VERIFIED' ? <><ShieldAlert size={14}/> KYC VERIFICADO</> : <><AlertCircle size={14}/> KYC PENDIENTE</>}
                  </button>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: 'var(--sage-900)', width: '100px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ background: '#34d399', width: `${((client.payments_made || 0) / 12) * 100}%`, height: '100%' }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--sage-300)' }}>{client.payments_made || 0}/12</span>
                    <button onClick={() => handleAddPayment(client.contract_id)} disabled={(client.payments_made || 0) >= 12} style={{ background: 'var(--sage-700)', border: 'none', color: 'white', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem' }}>+1</button>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handlePrintContract(client)} style={{ background: 'transparent', border: '1px solid var(--sage-500)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <FileText size={14} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
