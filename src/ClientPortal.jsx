import { useState, useEffect } from 'react';
import { LogOut, TrendingUp, Wallet, Calendar, ShieldCheck, Clock, CheckCircle2, LayoutDashboard, FileText, Settings, Bell, Download, Lock, Building } from 'lucide-react';

export default function ClientPortal({ user, onLogout }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--sage-900)', color: 'white' }}>
      
      {/* Sidebar Lateral */}
      <aside style={{ width: '280px', borderRight: '1px solid var(--sage-700)', backgroundColor: '#0d170f', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--sage-700)' }}>
          <ShieldCheck size={32} style={{ color: '#d4af37' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>CrowdIn</h1>
            <p style={{ margin: 0, color: 'var(--sage-400)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Institucional</p>
          </div>
        </div>

        <div style={{ padding: '2rem 1.5rem', flexGrow: 1 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--sage-400)', fontWeight: 'bold', marginBottom: '1rem', paddingLeft: '1rem' }}>MENÚ PRINCIPAL</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s',
                  backgroundColor: activeTab === item.id ? 'var(--sage-800)' : 'transparent',
                  color: activeTab === item.id ? 'white' : 'var(--sage-300)'
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ padding: '2rem', borderTop: '1px solid var(--sage-700)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--sage-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#d4af37' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--sage-400)' }}>Inversor Registrado</p>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: '100%', background: 'transparent', border: '1px solid var(--sage-600)', color: 'white', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main style={{ flexGrow: 1, padding: '3rem 4rem', overflowY: 'auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>{navItems.find(i => i.id === activeTab).label}</h2>
            <p style={{ color: 'var(--sage-300)', fontSize: '1rem', margin: 0 }}>Información confidencial de tu portafolio.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'var(--sage-800)', border: '1px solid var(--sage-700)', padding: '0.8rem', borderRadius: '50%', color: 'white', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid var(--sage-800)' }}></span>
            </button>
            
            {/* Dropdown de Notificaciones */}
            {showNotifications && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '1rem', width: '300px', background: 'var(--sage-800)', border: '1px solid var(--sage-700)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 50 }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--sage-700)', fontWeight: 'bold' }}>Notificaciones Institucionales</div>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', padding: '0.5rem', borderRadius: '50%' }}><CheckCircle2 size={16}/></div>
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Capital Fondeado</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sage-400)' }}>Tu capital ha sido inyectado con éxito en La Caja.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', padding: '0.5rem', borderRadius: '50%' }}><FileText size={16}/></div>
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Bóveda Activa</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sage-400)' }}>Tus contratos están listos para descarga digital.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--sage-400)' }}>Sincronizando con base de datos criptográfica...</div>
        ) : (
          <>
            {/* VIEW: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div style={{ background: 'linear-gradient(145deg, var(--sage-800) 0%, #0d170f 100%)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--sage-700)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--sage-300)' }}>
                      <Wallet size={20} /> <span style={{ fontSize: '1rem', fontWeight: 600 }}>Capital en Custodia</span>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>
                      ${new Intl.NumberFormat('es-CL').format(totalCapital)}
                    </div>
                  </div>

                  <div style={{ background: 'var(--sage-800)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--sage-700)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--sage-300)' }}>
                      <TrendingUp size={20} /> <span style={{ fontSize: '1rem', fontWeight: 600 }}>Flujo Mensual Generado (ROI)</span>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: '#d4af37', fontFamily: 'monospace' }}>
                      ${new Intl.NumberFormat('es-CL').format(totalMonthlyROI)}
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LayoutDashboard size={20}/> Posiciones Estratégicas Activas
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {contracts.map(contract => (
                    <div key={contract.id} style={{ background: 'var(--sage-800)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--sage-700)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', opacity: contract.status === 'LIQUIDATED' ? 0.6 : 1 }}>
                      <div>
                        <div style={{ color: 'var(--sage-400)', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>TRAMO INSTITUCIONAL</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white' }}>{contract.tier_name} <span style={{fontSize: '0.9rem', color: contract.status === 'LIQUIDATED' ? 'var(--sage-400)' : '#34d399'}}>({contract.monthly_roi * 100}%)</span></div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--sage-400)', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>APORTE INICIAL</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'monospace', textDecoration: contract.status === 'LIQUIDATED' ? 'line-through' : 'none' }}>${new Intl.NumberFormat('es-CL').format(contract.amount)}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--sage-400)', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>ESTADO</div>
                        {contract.status === 'LIQUIDATED' ? (
                           <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', display: 'inline-block' }}>Liquidado / Devuelto</div>
                        ) : (
                           <div style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></div> Rentando ({contract.payments_made || 0}/12)
                           </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--sage-400)', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>RESCATE FINAL (BULLET)</div>
                        {contract.status === 'LIQUIDATED' ? (
                          <div style={{ color: 'var(--sage-400)', fontWeight: 'bold' }}>Ejecutado Satisfactoriamente</div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d4af37', fontWeight: 'bold', background: 'rgba(212, 175, 55, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                            <Clock size={16} /> En {calculateDaysLeft(contract.created_at)} días
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {contracts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sage-400)', background: 'var(--sage-800)', borderRadius: '20px', border: '1px dashed var(--sage-600)' }}>
                      No tienes contratos activos en este momento.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <div style={{ background: 'var(--sage-800)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--sage-700)', textAlign: 'center' }}>
                  <ShieldCheck size={64} style={{ color: '#34d399', margin: '0 auto 1.5rem auto' }} />
                  <h3 style={{ fontSize: '1.8rem', margin: '0 0 1rem 0' }}>Custodia Legal</h3>
                  <p style={{ color: 'var(--sage-300)', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>Tus contratos físicos y digitalizados están bajo custodia en notaría. Puedes descargar una copia certificada de tu pacto de accionistas aquí.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                    {contracts.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sage-900)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--sage-700)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <FileText size={24} style={{ color: '#d4af37' }} />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold' }}>Contrato Tramo {c.tier_name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--sage-400)' }}>Firmado y validado (UAF)</div>
                          </div>
                        </div>
                        <button onClick={() => handlePrintContract(c)} style={{ background: 'transparent', border: '1px solid #34d399', color: '#34d399', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
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
                  <div style={{ background: 'var(--sage-800)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--sage-700)' }}>
                    <div style={{ height: '200px', background: 'url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div style={{ padding: '2rem' }}>
                      <div style={{ display: 'inline-block', background: 'rgba(52,211,153,0.2)', color: '#34d399', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>EN DESARROLLO</div>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>Torre Zafiro - Las Condes</h3>
                      <p style={{ color: 'var(--sage-300)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>Proyecto de desarrollo habitacional premium. 85% de avance en obra gruesa. Fecha estimada de recepción municipal: Noviembre 2026.</p>
                      <div style={{ width: '100%', height: '6px', background: 'var(--sage-900)', borderRadius: '3px' }}>
                        <div style={{ width: '85%', height: '100%', background: '#d4af37', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: SETTINGS */}
            {activeTab === 'settings' && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <div style={{ background: 'var(--sage-800)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--sage-700)', maxWidth: '800px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 2rem 0' }}><Lock size={24} color="#d4af37"/> Protocolos de Seguridad UAF</h3>
                  
                  <div style={{ background: 'var(--sage-900)', padding: '2rem', borderRadius: '16px', border: '1px dashed #ef4444', marginBottom: '2rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#ef4444' }}>Cuenta Bancaria Irrevocable</h4>
                    <p style={{ color: 'var(--sage-300)', fontSize: '0.9rem', lineHeight: '1.6' }}>En cumplimiento de la Ley N° 19.913 sobre Lavado de Activos, todos tus retornos (ROI) y tu capital final solo podrán ser transferidos a tu cuenta bancaria de origen registrada. No se admiten transferencias a terceros.</p>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--sage-800)', borderRadius: '8px', color: 'white', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {contracts.length > 0 ? (contracts[0].bank_account_info || "Cuenta en proceso de verificación por notaría.") : "No hay contratos activos."}
                    </div>
                  </div>

                  <p style={{ color: 'var(--sage-400)', fontSize: '0.85rem' }}>Para modificar esta cuenta, debes solicitar una cita presencial con nuestro oficial de cumplimiento normativo (Compliance Officer).</p>
                </div>
              </div>
            )}

          </>
        )}
      </main>

    </div>
  );
}
