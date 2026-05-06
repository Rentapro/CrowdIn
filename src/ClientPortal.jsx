import { useState, useEffect } from 'react';
import { LogOut, TrendingUp, Wallet, Calendar, ShieldCheck, Clock, CheckCircle2, LayoutDashboard, FileText, Settings, Bell, Download, Lock, Building, History, X } from 'lucide-react';
import ParallaxBackground from './ParallaxBackground';

export default function ClientPortal({ user, onLogout }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // Modal Logs
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/client/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` }
        });
        if (!res.ok) throw new Error('Error de conexión');
        const data = await res.json();
        setContracts(data.contracts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const totalCapital = contracts.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalMonthlyROI = contracts.reduce((acc, curr) => acc + (Number(curr.amount) * Number(curr.monthly_roi)), 0);

  const calculateDaysLeft = (dateString) => {
    const startDate = new Date(dateString);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 12);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(endDate - today) / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'documents', label: 'Bóveda Legal', icon: <FileText size={20} /> },
    { id: 'projects', label: 'Proyectos Activos', icon: <Building size={20} /> },
    { id: 'settings', label: 'Seguridad', icon: <Settings size={20} /> }
  ];

  const handlePrintContract = (contract) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Copia de Contrato - ${user.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap');
            body { font-family: 'Merriweather', serif; padding: 50px 70px; line-height: 1.8; max-width: 900px; margin: 0 auto; color: #1a1a1a; font-size: 11pt; text-align: justify; }
            h1 { text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 40px; font-weight: 700; border-bottom: 2px solid #000; padding-bottom: 15px; }
            p { margin-bottom: 20px; text-indent: 20px; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80pt; color: rgba(0,0,0,0.05); z-index: -1; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="watermark">COPIA INVERSOR</div>
          <h1>CONTRATO DE SUSCRIPCIÓN DE ACCIONES - COPIA CLIENTE</h1>
          <p>En Santiago de Chile, se certifica que <strong>${user.name}</strong>, titular de la cuenta de correo <strong>${user.email}</strong>, mantiene bajo custodia de <strong>CrowdIn SpA</strong> la suscripción de un plan institucional Tramo <strong>${contract.tier_name}</strong> por un capital de <strong>$${new Intl.NumberFormat('es-CL').format(contract.amount)} CLP</strong>.</p>
          <p>La rentabilidad mensual pactada corresponde a un <strong>${contract.monthly_roi * 100}%</strong>, lo cual equivale a <strong>$${new Intl.NumberFormat('es-CL').format(contract.amount * contract.monthly_roi)} CLP</strong> pagaderos los días 5 de cada mes a la cuenta registrada bajo la normativa UAF: <strong>${contract.bank_account_info || 'Pendiente de Registro'}</strong>.</p>
          <p>Este documento es una copia digitalizada y no reemplaza la escritura matriz que yace en bóveda notarial. El rescate del capital (Pago Bullet) está programado contractualmente para cumplirse a los 12 meses de la fecha de suscripción original.</p>
          <p style="margin-top: 50px; text-align: center; font-size: 9pt; color: #666;">
            Verificado criptográficamente por la plataforma CrowdIn Institucional<br/>
            ID de Operación: ${contract.id}
          </p>
          <script>window.onload = function() { setTimeout(() => window.print(), 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <ParallaxBackground />
      <div style={{ display: 'flex', minHeight: '100vh', color: 'var(--charcoal)', position: 'relative', zIndex: 1 }}>
      
      {/* Sidebar Lateral */}
      <aside style={{ width: '280px', borderRight: '1px solid var(--sage-300)', backgroundColor: 'var(--sage-100)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--sage-300)' }}>
          <ShieldCheck size={32} style={{ color: 'var(--gold-primary)' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--sage-800)' }}>CrowdIn</h1>
            <p style={{ margin: 0, color: 'var(--charcoal-mid)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Institucional</p>
          </div>
        </div>

        <div style={{ padding: '2rem 1.5rem', flexGrow: 1 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--charcoal-mid)', fontWeight: 'bold', marginBottom: '1rem', paddingLeft: '1rem' }}>MENÚ PRINCIPAL</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s',
                  backgroundColor: activeTab === item.id ? 'var(--sage-50)' : 'transparent',
                  color: activeTab === item.id ? 'var(--sage-800)' : 'var(--charcoal-mid)'
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--sage-300)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '45px', height: '45px', background: 'var(--sage-800)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>{user.name[0]}</div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--sage-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: user.kyc_status === 'VERIFIED' ? 'var(--success)' : '#b45309', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                {user.kyc_status === 'VERIFIED' ? <CheckCircle2 size={12}/> : <ShieldAlert size={12}/>}
                {user.kyc_status === 'VERIFIED' ? 'INVERSOR VERIFICADO' : 'KYC PENDIENTE'}
              </div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: '100%', background: 'white', border: '1px solid var(--sage-300)', color: 'var(--sage-800)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main style={{ flexGrow: 1, padding: '3rem 4rem', overflowY: 'auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: 'var(--sage-800)' }}>{navItems.find(i => i.id === activeTab).label}</h2>
            <p style={{ color: 'var(--charcoal-mid)', fontSize: '1rem', margin: 0 }}>Información confidencial de tu portafolio.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'white', border: '1px solid var(--sage-300)', padding: '0.8rem', borderRadius: '50%', color: 'var(--charcoal)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></span>
            </button>
            
            {/* Dropdown de Notificaciones */}
            {showNotifications && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '1rem', width: '300px', background: 'white', border: '1px solid var(--sage-100)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50 }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--sage-100)', fontWeight: 'bold', color: 'var(--sage-800)' }}>Notificaciones Institucionales</div>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.5rem', borderRadius: '50%' }}><CheckCircle2 size={16}/></div>
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--charcoal)' }}>Capital Fondeado</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--charcoal-mid)' }}>Tu capital ha sido inyectado con éxito en La Caja.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-dark)', padding: '0.5rem', borderRadius: '50%' }}><FileText size={16}/></div>
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--charcoal)' }}>Bóveda Activa</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--charcoal-mid)' }}>Tus contratos están listos para descarga digital.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--charcoal-mid)' }}>Sincronizando con base de datos criptográfica...</div>
        ) : (
          <>
            {/* VIEW: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--charcoal-mid)' }}>
                      <Wallet size={20} /> <span style={{ fontSize: '1rem', fontWeight: 600 }}>Capital en Custodia</span>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--charcoal)', fontFamily: 'Outfit' }}>
                      ${new Intl.NumberFormat('es-CL').format(totalCapital)}
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--sage-100)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--charcoal-mid)' }}>
                      <TrendingUp size={20} /> <span style={{ fontSize: '1rem', fontWeight: 600 }}>Flujo Mensual Generado (ROI)</span>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--gold-dark)', fontFamily: 'Outfit' }}>
                      ${new Intl.NumberFormat('es-CL').format(totalMonthlyROI)}
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--sage-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LayoutDashboard size={20}/> Posiciones Estratégicas Activas
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {contracts.map(contract => (
                    <div key={contract.id} style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--sage-300)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', opacity: contract.status === 'LIQUIDATED' ? 0.6 : 1, boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                      <div>
                        <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>TRAMO INSTITUCIONAL</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--charcoal)' }}>{contract.tier_name} <span style={{fontSize: '0.9rem', color: contract.status === 'LIQUIDATED' ? 'var(--sage-500)' : 'var(--success)'}}>({contract.monthly_roi * 100}%)</span></div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>APORTE INICIAL</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Outfit', color: 'var(--charcoal)', textDecoration: contract.status === 'LIQUIDATED' ? 'line-through' : 'none' }}>${new Intl.NumberFormat('es-CL').format(contract.amount)}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>ESTADO</div>
                        {contract.status === 'LIQUIDATED' ? (
                           <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', display: 'inline-block' }}>Liquidado / Devuelto</div>
                        ) : (
                           <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div> Rentando ({contract.payments_made || 0}/12)
                           </div>
                        )}
                        <button onClick={() => handleOpenLogs(contract.id)} style={{ background: 'transparent', border: '1px solid var(--sage-300)', color: 'var(--sage-700)', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
                          <History size={12}/> Ver Historial
                        </button>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>RESCATE FINAL (BULLET)</div>
                        {contract.status === 'LIQUIDATED' ? (
                          <div style={{ color: 'var(--sage-500)', fontWeight: 'bold' }}>Ejecutado Satisfactoriamente</div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-dark)', fontWeight: 'bold', background: 'rgba(212, 175, 55, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                            <Clock size={16} /> En {calculateDaysLeft(contract.created_at)} días
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {contracts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-mid)', background: 'white', borderRadius: '20px', border: '1px dashed var(--sage-300)' }}>
                      No tienes contratos activos en este momento.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid var(--sage-300)', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                  <ShieldCheck size={64} style={{ color: 'var(--success)', margin: '0 auto 1.5rem auto' }} />
                  <h3 style={{ fontSize: '1.8rem', margin: '0 0 1rem 0', color: 'var(--sage-800)' }}>Custodia Legal</h3>
                  <p style={{ color: 'var(--charcoal-mid)', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>Tus contratos físicos y digitalizados están bajo custodia en notaría. Puedes descargar una copia certificada de tu pacto de accionistas aquí.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                    {contracts.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sage-50)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--sage-100)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <FileText size={24} style={{ color: 'var(--gold-dark)' }} />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--charcoal)' }}>Contrato Tramo {c.tier_name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--sage-700)' }}>Firmado y validado (UAF)</div>
                          </div>
                        </div>
                        <button onClick={() => handlePrintContract(c)} style={{ background: 'transparent', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                          <Download size={16} /> Ver Contrato
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: PROJECTS (Future) */}
            {activeTab === 'projects' && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--sage-300)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                    <div style={{ height: '200px', background: 'url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div style={{ padding: '2rem' }}>
                      <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>EN DESARROLLO</div>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem', color: 'var(--sage-800)' }}>Torre Zafiro - Las Condes</h3>
                      <p style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>Proyecto de desarrollo habitacional premium. 85% de avance en obra gruesa. Fecha estimada de recepción municipal: Noviembre 2026.</p>
                      <div style={{ width: '100%', height: '6px', background: 'var(--sage-100)', borderRadius: '3px' }}>
                        <div style={{ width: '85%', height: '100%', background: 'var(--gold-dark)', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: SETTINGS */}
            {activeTab === 'settings' && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid var(--sage-300)', maxWidth: '800px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 2rem 0', color: 'var(--sage-800)' }}><Lock size={24} color="var(--gold-primary)"/> Protocolos de Seguridad y KYC</h3>
                  
                  {user.kyc_status !== 'VERIFIED' && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={20}/> Validación de Identidad Requerida</h4>
                      <p style={{ color: '#92400e', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>Para procesar los pagos de rentabilidad del próximo ciclo, nuestro oficial de cumplimiento (Compliance) debe validar tu identidad digital. Por favor sube una foto de tu Cédula de Identidad (Ambos lados).</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '2px dashed #d1d5db', textAlign: 'center', cursor: 'pointer' }}>
                          <Download size={24} style={{ color: '#d1d5db', marginBottom: '0.5rem', transform: 'rotate(180deg)' }}/>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280' }}>ANVERSO (RUT)</div>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '2px dashed #d1d5db', textAlign: 'center', cursor: 'pointer' }}>
                          <Download size={24} style={{ color: '#d1d5db', marginBottom: '0.5rem', transform: 'rotate(180deg)' }}/>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280' }}>REVERSO (RUT)</div>
                        </div>
                      </div>
                      <button style={{ width: '100%', marginTop: '1.5rem', background: '#b45309', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Enviar para Validación Notarial</button>
                    </div>
                  )}

                  <div style={{ background: 'var(--sage-50)', padding: '2rem', borderRadius: '16px', border: '1px dashed var(--danger)', marginBottom: '2rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--danger)' }}>Cuenta Bancaria Irrevocable</h4>
                    <p style={{ color: 'var(--charcoal-mid)', fontSize: '0.9rem', lineHeight: '1.6' }}>En cumplimiento de la Ley N° 19.913 sobre Lavado de Activos, todos tus retornos (ROI) y tu capital final solo podrán ser transferidos a tu cuenta bancaria de origen registrada. No se admiten transferencias a terceros.</p>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'white', border: '1px solid var(--sage-300)', borderRadius: '8px', color: 'var(--charcoal)', fontFamily: 'Outfit', fontWeight: 'bold' }}>
                      {contracts.length > 0 ? (contracts[0].bank_account_info || "Cuenta en proceso de verificación por notaría.") : "No hay contratos activos."}
                    </div>
                  </div>

                  <p style={{ color: 'var(--sage-700)', fontSize: '0.85rem' }}>Para modificar esta cuenta, debes solicitar una cita presencial con nuestro oficial de cumplimiento normativo (Compliance Officer).</p>
                </div>
              </div>
            )}

          </>
        )}
      </main>

      {logsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', border: '1px solid var(--sage-100)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>
            <button onClick={() => setLogsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--charcoal-mid)', cursor: 'pointer' }}><X size={24}/></button>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--sage-800)' }}><History size={24}/> Historial de Pagos Recibidos</h3>
            
            {logLoading ? (
              <p style={{ color: 'var(--charcoal-mid)', textAlign: 'center' }}>Sincronizando con libro mayor...</p>
            ) : currentLogs.length === 0 ? (
              <p style={{ color: 'var(--charcoal-mid)', textAlign: 'center' }}>No has recibido pagos aún.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentLogs.map(log => (
                  <div key={log.id} style={{ background: 'var(--sage-50)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--sage-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: 'var(--sage-700)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>CUOTA #{log.payment_number}</div>
                      <div style={{ color: 'var(--charcoal)', fontWeight: 'bold' }}>{new Date(log.executed_at).toLocaleDateString('es-CL')}</div>
                      <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><CheckCircle2 size={12}/> Transacción Confirmada</div>
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
