import { useState, useEffect } from 'react';
import { Users, FileText, Plus, LogOut, CheckCircle2, ShieldAlert, DollarSign, Activity, AlertCircle, Trash2, KeyRound, ArrowRightCircle, History, X, LayoutDashboard, Database, Search, Lock, TrendingUp, Target } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState('clients');
  const [prospects, setProspects] = useState([]);
  const [prospectLoading, setProspectLoading] = useState(false);
  const [showProspectForm, setShowProspectForm] = useState(false);
  
  // Prospect Form State
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pSource, setPSource] = useState('Manual');
  const [pNotes, setPNotes] = useState('');

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
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        alert(`Error API: ${errorData.error}`);
        throw new Error(errorData.error);
      }
      const data = await res.json();
      console.log('Clientes cargados:', data);
      if (Array.isArray(data)) {
        setClients(data);
      } else {
        console.error('Data is not an array:', data);
        setClients([]);
      }
    } catch (err) {
      console.error(err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProspects = async () => {
    setProspectLoading(true);
    try {
      const res = await fetch('/api/admin/crm', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProspects(data);
      } else {
        setProspects([]);
      }
    } catch (err) {
      console.error(err);
      setProspects([]);
    } finally { setProspectLoading(false); }
  };

  useEffect(() => {
    fetchClients();
    fetchProspects();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    const tier = tiers.find(t => t.value === parseInt(amount));
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ name, email, bankAccount, amount: parseInt(amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.tempPassword) setNewCredentials({ email, tempPassword: data.tempPassword });
      fetchClients();
      setShowForm(false);
      setName(''); setRut(''); setEmail(''); setBankAccount('');
    } catch (err) { alert(err.message); }
  };

  const handleToggleKYC = async (userId, currentStatus) => {
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ action: 'kyc', userId, kycStatus: currentStatus })
      });
      if (res.ok) fetchClients();
    } catch (err) { console.error(err); }
  };

  const handleAddPayment = async (contractId, amount, nextPaymentNumber) => {
    if (!window.confirm(`¿Confirmar abono de $${new Intl.NumberFormat('es-CL').format(amount)}?`)) return;
    try {
      const res = await fetch('/api/admin/payments?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ contract_id: contractId, amount, payment_number: nextPaymentNumber })
      });
      if (res.ok) fetchClients();
    } catch (err) { console.error(err); }
  };

  const handleLiquidate = async (contractId) => {
    if (!window.confirm("¿Confirmas que el Pago Bullet (Capital Original) ya fue transferido? Esta acción cerrará el contrato.")) return;
    try {
      const res = await fetch('/api/admin/payments?action=liquidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ contract_id: contractId })
      });
      if (res.ok) fetchClients();
    } catch (err) { console.error(err); }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('¿Resetear contraseña a este inversor?')) return;
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ action: 'reset-password', userId })
      });
      const data = await res.json();
      if (res.ok) setNewCredentials(data);
    } catch (err) { console.error(err); }
  };

  const handleOpenLogs = async (contractId) => {
    setLogsModalOpen(true);
    setLogLoading(true);
    setCurrentLogs([]);
    try {
      const res = await fetch(`/api/admin/payments?action=logs&contract_id=${contractId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` }
      });
      const data = await res.json();
      if (res.ok) setCurrentLogs(data);
    } catch (err) { console.error(err); } finally {
      setLogLoading(false);
    }
  };

  const handleCreateProspect = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ name: pName, phone: pPhone, email: pEmail, source: pSource, notes: pNotes })
      });
      if (res.ok) {
        setPName(''); setPPhone(''); setPEmail(''); setPNotes(''); setShowProspectForm(false);
        fetchProspects();
      }
    } catch (err) { console.error(err); }
  };
  
  const handleCaptureLeads = async () => {
    console.log("Botón presionado");
    try {
      const confirmacion = window.confirm("¿Deseas iniciar la búsqueda automática de perfiles VIP en LinkedIn?");
      if (!confirmacion) return;
      
      alert("PASO 1: Conectando con el servidor de prospección...");
      setProspectLoading(true);

      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` 
        },
        body: JSON.stringify({ action: 'capture' })
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("PASO 2: ¡ÉXITO! Se han inyectado 3 perfiles estratégicos.");
        await fetchProspects();
      } else {
        alert("ERROR DEL SERVIDOR: " + (data.error || 'Fallo desconocido'));
      }
    } catch (err) { 
      alert("ERROR DE CONEXIÓN: " + err.message);
    } finally { 
      setProspectLoading(false); 
    }
  };

  const handleUpdateProspectStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchProspects();
    } catch (err) { console.error(err); }
  };

  const handleDeleteClient = async (userId, name) => {
    if (!window.confirm(`¿Estás 100% seguro de eliminar al inversor ${name} y destruir sus contratos?`)) return;
    try {
      const res = await fetch('/api/admin/clients', {
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
  
  const totalProspectos = prospects.length;
  const invertidos = prospects.filter(p => p.status === 'Invertido').length;
  const conversionRate = totalProspectos > 0 ? ((invertidos / totalProspectos) * 100).toFixed(1) : 0;

  return (
    <>
      <ParallaxBackground />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{ width: '280px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRight: '1px solid var(--sage-300)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 10 }}>
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', color: 'var(--sage-800)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
              CrowdIn<span style={{ color: 'var(--gold-primary)' }}>.</span>
            </div>
            <p style={{ margin: 0, color: 'var(--charcoal-mid)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Panel Administrativo</p>
          </div>

          <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => setActiveTab('clients')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', backgroundColor: activeTab === 'clients' ? 'var(--sage-50)' : 'transparent', color: activeTab === 'clients' ? 'var(--sage-800)' : 'var(--charcoal-mid)' }}>
              <LayoutDashboard size={20} /> Inversores Activos
            </button>
            <button onClick={() => setActiveTab('crm')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', backgroundColor: activeTab === 'crm' ? 'var(--sage-50)' : 'transparent', color: activeTab === 'crm' ? 'var(--sage-800)' : 'var(--charcoal-mid)' }}>
              <Database size={20} /> CRM Prospectos
            </button>
            <button onClick={() => setActiveTab('settings')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', backgroundColor: activeTab === 'settings' ? 'var(--sage-50)' : 'transparent', color: activeTab === 'settings' ? 'var(--sage-800)' : 'var(--charcoal-mid)' }}>
              <KeyRound size={20} /> Configuración
            </button>
          </nav>

          <button onClick={onLogout} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--sage-300)', cursor: 'pointer', fontWeight: 600, color: 'var(--sage-800)', background: 'white' }}>
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </aside>

        {/* Main Content */}
        <main style={{ flexGrow: 1, padding: '2rem 3rem', position: 'relative', zIndex: 1 }}>
          <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--sage-800)', fontFamily: 'Outfit' }}>
                {activeTab === 'clients' ? 'Gestión de Capital Activo' : activeTab === 'crm' ? 'Pipeline de Captación' : 'Configuración del Sistema'}
              </h2>
              <p style={{ color: 'var(--charcoal-mid)', margin: '0.5rem 0 0 0' }}>Superadmin • Control de Operaciones</p>
            </div>
            
            {activeTab === 'clients' && (
              <button onClick={() => setShowForm(!showForm)} style={{ background: 'var(--sage-800)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, boxShadow: '0 10px 20px rgba(45, 66, 45, 0.2)' }}>
                <Plus size={20} /> Nuevo Contrato
              </button>
            )}
            
            {activeTab === 'crm' && (
              <button onClick={() => setShowProspectForm(!showProspectForm)} style={{ background: 'var(--gold-primary)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, boxShadow: '0 10px 20px rgba(212,175,55,0.2)' }}>
                <Search size={20} /> Registrar Prospecto
              </button>
            )}
          </header>

          {/* KPI Bar */}
          {activeTab === 'clients' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><DollarSign size={16} color="var(--sage-500)"/> AUM Activo</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)' }}>${new Intl.NumberFormat('es-CL').format(totalCapital)}</div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><Activity size={16} color="var(--sage-500)"/> ROI Pagado</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>${new Intl.NumberFormat('es-CL').format(totalPagado)}</div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><AlertCircle size={16} color="var(--sage-500)"/> Alertas KYC</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: kycPendientes > 0 ? '#b45309' : 'var(--success)' }}>{kycPendientes}</div>
              </div>
            </div>
          )}

          {activeTab === 'crm' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><Users size={16} color="var(--sage-500)"/> Total Prospectos</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)' }}>{totalProspectos}</div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><TrendingUp size={16} color="var(--sage-500)"/> Tasa de Conversión</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold-primary)' }}>{conversionRate}%</div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><CheckCircle2 size={16} color="var(--sage-500)"/> Inversores Cerrados</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{invertidos}</div>
              </div>
            </div>
          )}

          {/* TABS CONTENT */}
          {activeTab === 'clients' && (
            <>
              {newCredentials && (
                <div style={{ background: '#064e3b', border: '1px solid #047857', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#34d399' }}>¡Atención: Credenciales Temporales!</h3>
                  <div style={{ background: '#022c22', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>{newCredentials.tempPassword}</div>
                  <button onClick={() => setNewCredentials(null)} style={{ marginTop: '1rem', background: '#34d399', color: '#064e3b', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Entendido</button>
                </div>
              )}

              {showForm && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--sage-300)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ marginTop: 0, color: 'var(--sage-800)' }}>Estructuración de Nueva Posición</h3>
                  <form onSubmit={handleCreateClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>Nombre Inversor</label><input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>RUT</label><input type="text" value={rut} onChange={e => setRut(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>Email Institucional</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>Cuenta Bancaria</label><input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)' }} /></div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>Tramo ROI</label>
                      <select value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)' }}>
                        {tiers.map(t => <option key={t.value} value={t.value}>{t.name} ({t.roi * 100}%)</option>)}
                      </select>
                    </div>
                    <button type="submit" style={{ background: 'var(--sage-800)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Registrar</button>
                  </form>
                </div>
              )}

              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--sage-300)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--sage-50)' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem' }}>INVERSOR</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem' }}>CAPITAL</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem' }}>KYC</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem' }}>PAGOS</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem', textAlign: 'center' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.contract_id} style={{ borderTop: '1px solid var(--sage-100)' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{client.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-mid)' }}>{client.email}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--charcoal)' }}>${new Intl.NumberFormat('es-CL').format(client.amount)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--sage-700)' }}>{client.tier_name} ({(client.monthly_roi * 100).toFixed(1)}%)</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <button onClick={() => handleToggleKYC(client.user_id, client.kyc_status)} style={{ background: client.kyc_status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: client.kyc_status === 'VERIFIED' ? 'var(--success)' : '#d97706', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>
                            {client.kyc_status === 'VERIFIED' ? 'VERIFICADO' : 'PENDIENTE'}
                          </button>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{client.payments_made || 0}/12</span>
                            <button onClick={() => handleAddPayment(client.contract_id)} style={{ background: 'var(--sage-100)', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>+1</button>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button onClick={() => handlePrintContract(client)} style={{ background: 'white', border: '1px solid var(--sage-300)', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}><FileText size={16}/></button>
                            <button onClick={() => handleOpenLogs(client.contract_id)} style={{ background: 'white', border: '1px solid var(--sage-300)', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}><History size={16}/></button>
                            <button onClick={() => handleDeleteClient(client.user_id, client.name)} style={{ background: 'white', border: '1px solid #fee2e2', color: '#ef4444', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'crm' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, color: 'var(--sage-900)', fontSize: '1.8rem' }}>Pipeline de Captación <span style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', background: 'var(--sage-50)', padding: '0.2rem 0.5rem', borderRadius: '4px', verticalAlign: 'middle' }}>v1.2.6-HOTFIX</span></h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={handleCaptureLeads}
                    style={{ background: 'var(--gold-primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)' }}
                  >
                    <Target size={20} /> CAPTURAR LEADS VIP
                  </button>
                  <button 
                    onClick={() => setShowProspectForm(true)}
                    style={{ background: 'var(--sage-900)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
                  >
                    <Users size={20} /> REGISTRAR PROSPECTO
                  </button>
                </div>
              </div>
              {showProspectForm && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--sage-300)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ marginTop: 0, color: 'var(--sage-800)' }}>Registrar Nuevo Prospecto</h3>
                  <form onSubmit={handleCreateProspect} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Nombre / Empresa</label><input type="text" value={pName} onChange={e => setPName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>WhatsApp / Teléfono</label><input type="text" value={pPhone} onChange={e => setPPhone(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Origen</label><select value={pSource} onChange={e => setPSource(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)' }}><option>LinkedIn</option><option>Google Maps</option><option>Manual</option><option>Referido</option></select></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Notas Iniciales</label><input type="text" value={pNotes} onChange={e => setPNotes(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--sage-300)' }} /></div>
                    <button type="submit" style={{ background: 'var(--gold-primary)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Prospecto</button>
                  </form>
                </div>
              )}

              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--sage-300)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--sage-50)' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem' }}>PROSPECTO</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem' }}>CONTACTO</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem' }}>ORIGEN</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem' }}>ESTADO</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--sage-800)', fontSize: '0.85rem' }}>ULT. ACTUALIZACIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospects && Array.isArray(prospects) && prospects.length > 0 ? prospects.map(prospect => (
                      <tr key={prospect.id} style={{ borderTop: '1px solid var(--sage-100)' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{prospect.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-mid)' }}>{prospect.notes}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>{prospect.phone}</span>
                            <a href={`https://wa.me/${prospect.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#25D366' }}><ArrowRightCircle size={18}/></a>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ fontSize: '0.8rem', background: 'var(--sage-100)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{prospect.source}</span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <select 
                            value={prospect.status} 
                            onChange={(e) => handleUpdateProspectStatus(prospect.id, e.target.value)}
                            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--sage-300)', fontSize: '0.85rem', background: prospect.status === 'Invertido' ? 'var(--success)' : prospect.status === 'Contactado' ? 'var(--gold-primary)' : 'white', color: prospect.status === 'Invertido' || prospect.status === 'Contactado' ? 'white' : 'black' }}
                          >
                            <option>Prospecto</option>
                            <option>Contactado</option>
                            <option>Seguimiento</option>
                            <option>Invertido</option>
                            <option>Rechazado</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--charcoal-mid)' }}>
                          {new Date(prospect.updated_at).toLocaleDateString('es-CL')}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--charcoal-mid)' }}>
                          No hay prospectos activos. Use el botón "Capturar Leads VIP" para iniciar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid var(--sage-300)', textAlign: 'center' }}>
              <Lock size={64} color="var(--sage-300)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'var(--sage-800)' }}>Configuración de Bóveda</h3>
              <p style={{ color: 'var(--charcoal-mid)' }}>Mantenimiento programado de claves maestras y logs de auditoría global.</p>
            </div>
          )}
        </main>
      </div>

      {/* Logs Modal */}
      {logsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setLogsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24}/></button>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><History size={24}/> Auditoría de Pagos</h3>
            {logLoading ? <p>Cargando...</p> : currentLogs.map(log => (
              <div key={log.id} style={{ background: 'var(--sage-50)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Cuota #{log.payment_number} - {new Date(log.executed_at).toLocaleDateString()}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>+${new Intl.NumberFormat('es-CL').format(log.payment_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
