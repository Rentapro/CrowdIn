import { useState, useEffect } from 'react';
import { LogOut, TrendingUp, Wallet, Calendar, ShieldCheck, Clock } from 'lucide-react';

export default function ClientPortal({ user, onLogout }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Calcula días restantes para el Pago Bullet asumiendo 12 meses desde el contrato
  const calculateDaysLeft = (dateString) => {
    const startDate = new Date(dateString);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 12);
    const today = new Date();
    const diffTime = Math.abs(endDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--sage-900)', color: 'white' }}>
      
      {/* Header */}
      <header style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sage-700)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldCheck size={32} style={{ color: '#34d399' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>CrowdIn</h1>
            <p style={{ margin: 0, color: 'var(--sage-300)', fontSize: '0.9rem' }}>Bóveda Inversor</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--sage-400)' }}>Socio Capitalista</p>
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid var(--sage-600)', color: 'white', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>Resumen de Portafolio</h2>
          <p style={{ color: 'var(--sage-300)', fontSize: '1.1rem', margin: 0 }}>Rendimiento en tiempo real de tus activos.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--sage-400)' }}>Sincronizando operaciones con Neon DB...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              
              <div style={{ background: 'var(--sage-800)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--sage-700)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--sage-300)' }}>
                  <Wallet size={24} /> <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Capital Activo</span>
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>
                  ${new Intl.NumberFormat('es-CL').format(totalCapital)}
                </div>
                <div style={{ marginTop: '1rem', color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} /> Blindado Notarialmente
                </div>
              </div>

              <div style={{ background: 'var(--sage-800)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--sage-700)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--sage-300)' }}>
                  <TrendingUp size={24} /> <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Flujo Mensual a tu Cuenta</span>
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#34d399' }}>
                  ${new Intl.NumberFormat('es-CL').format(totalMonthlyROI)}
                </div>
                <div style={{ marginTop: '1rem', color: 'var(--sage-300)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} /> Pago programado día 5 de cada mes
                </div>
              </div>

            </div>

            {/* Contratos List */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>Tus Posiciones</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {contracts.map(contract => (
                <div key={contract.id} style={{ background: 'var(--sage-800)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--sage-700)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                  
                  <div>
                    <div style={{ color: 'var(--sage-400)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>TRAMO ASIGNADO</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{contract.tier_name}</div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--sage-400)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>INVERSIÓN</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>${new Intl.NumberFormat('es-CL').format(contract.amount)}</div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--sage-400)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>ESTADO</div>
                    <div style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></div>
                      Rentando
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--sage-400)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>RESCATE (PAGO BULLET)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--sage-200)' }}>
                      <Clock size={16} /> En {calculateDaysLeft(contract.created_at)} días
                    </div>
                  </div>

                </div>
              ))}

              {contracts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sage-400)', background: 'var(--sage-800)', borderRadius: '20px' }}>
                  Tu portafolio está en proceso de estructuración legal.
                </div>
              )}
            </div>

          </>
        )}
      </main>
    </div>
  );
}
