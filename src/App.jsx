import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';

function App() {
  const [investment, setInvestment] = useState(10000000);

  // Lógica de cálculo
  const getTier = (amount) => {
    if (amount >= 40000000) return { roi: 0.025, name: 'Elite' };
    if (amount >= 20000000) return { roi: 0.020, name: 'Premium' };
    if (amount >= 10000000) return { roi: 0.016, name: 'Avanzado' };
    if (amount >= 5000000) return { roi: 0.013, name: 'Crecimiento' };
    return { roi: 0.010, name: 'Inicio' };
  };

  const currentTier = getTier(investment);
  const monthlyPayment = investment * currentTier.roi;
  const yearlyInterests = monthlyPayment * 12;
  const totalReturn = investment + yearlyInterests;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <>
      {/* Navbar Minimalista */}
      <nav style={{ padding: '1.5rem 2rem', position: 'absolute', top: 0, width: '100%', zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', color: 'var(--sage-800)' }}>
            CrowdIn<span style={{ color: 'var(--gold-muted)' }}>.</span>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>Ingresar</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Rentabilidad Inteligente Respaldada por <span>20 años de Construcción Sólida.</span>
            </h1>
            <p className="hero-subtitle">
              Participa en proyectos de Real Estate privado y flipping de alta rentabilidad. Entra al círculo donde tu capital trabaja respaldado por activos reales inmobiliarios.
            </p>
            <a href="#calculadora" className="btn btn-primary">
              Calcular Retornos <ChevronRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Tiers Section */}
      <section className="section container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Entre más inviertes, más ganamos todos</h2>
          <p style={{ color: 'var(--charcoal-light)', maxWidth: '600px', margin: '0 auto' }}>
            Hemos diseñado una estructura de tramos donde premiamos el volumen de capital, permitiéndonos ejecutar proyectos de flipping de mayor envergadura.
          </p>
        </div>

        <div className="tiers-grid">
          {[
            { amount: '1.000.000', roi: '1.0%', annual: '12.0%' },
            { amount: '5.000.000', roi: '1.3%', annual: '15.6%' },
            { amount: '10.000.000', roi: '1.6%', annual: '19.2%' },
            { amount: '20.000.000', roi: '2.0%', annual: '24.0%' }
          ].map((tier, idx) => (
            <div className="glass-card tier-card" key={idx}>
              <h3>Desde ${tier.amount}</h3>
              <div className="roi-value">{tier.roi} <span style={{fontSize: '1rem', color: 'var(--charcoal-light)'}}>mensual</span></div>
              <p style={{ fontWeight: 600 }}>{tier.annual} Retorno Anual</p>
            </div>
          ))}

          <div className="glass-card tier-card elite">
            <div className="tier-badge">Recomendado</div>
            <h3>Desde $40.000.000</h3>
            <div className="roi-value">2.5% <span style={{fontSize: '1rem', color: 'rgba(255,255,255,0.7)'}}>mensual</span></div>
            <p style={{ fontWeight: 600, color: 'var(--gold-muted)' }}>30.0% Retorno Anual</p>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="calculator-section" id="calculadora">
        <div className="container calc-container">
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--white)' }}>Proyecta tus Ganancias</h2>
            <p style={{ color: 'var(--sage-100)', marginBottom: '3rem' }}>
              Descubre cuánto flujo mensual puedes generar directamente a tu cuenta bancaria a través de nuestros proyectos de crowdfunding.
            </p>

            <div className="calc-input-group">
              <label>Capital a Invertir: {formatCurrency(investment)}</label>
              <input 
                type="range" 
                min="1000000" 
                max="100000000" 
                step="1000000"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                className="calc-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                <span>$1M</span>
                <span>$100M+</span>
              </div>
            </div>
          </div>

          <div className="calc-results">
            <h3 style={{ color: 'var(--gold-muted)', marginBottom: '1.5rem', fontFamily: 'Outfit' }}>Nivel: {currentTier.name} ({currentTier.roi * 100}%)</h3>
            
            <div className="result-row highlight">
              <span>Pago Mensual (Directo)</span>
              <span className="result-val">{formatCurrency(monthlyPayment)}</span>
            </div>
            <div className="result-row">
              <span>Intereses Totales (12 meses)</span>
              <span className="result-val">{formatCurrency(yearlyInterests)}</span>
            </div>
            <div className="result-row" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Retorno Total + Capital</span>
              <span className="result-val" style={{ color: 'var(--sage-500)', fontSize: '1.8rem' }}>{formatCurrency(totalReturn)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison & Trust */}
      <section className="section container">
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem' }}>La Realidad del Mercado</h2>
        
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Banco (DAP Tradicional)</th>
              <th className="td-elite">CrowdIn (Nivel Elite 40M)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Pago Mensual (por 40M)</strong></td>
              <td className="td-banco">~ $200.000</td>
              <td className="td-elite">{formatCurrency(40000000 * 0.025)}</td>
            </tr>
            <tr>
              <td><strong>Rentabilidad Anual</strong></td>
              <td className="td-banco">~ 6.0%</td>
              <td className="td-elite">30.0%</td>
            </tr>
            <tr>
              <td><strong>Respaldo</strong></td>
              <td className="td-banco">Papel Financiero</td>
              <td className="td-elite">Activos Inmobiliarios (20 Años Exp.)</td>
            </tr>
            <tr>
              <td><strong>Flexibilidad</strong></td>
              <td className="td-banco">Cierre rígido penalizado</td>
              <td className="td-elite">Reinversión opcional a 6 meses</td>
            </tr>
          </tbody>
        </table>

        {/* Trust Factors */}
        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon"><ShieldCheck size={32} /></div>
            <h3>Contratos Legales</h3>
            <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Estructura legal robusta respaldando tu capital e intereses mensualmente.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon"><TrendingUp size={32} /></div>
            <h3>Pagos Bullet</h3>
            <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Flujo directo a tu cuenta bancaria mes a mes sin retenciones ocultas.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon"><RefreshCw size={32} /></div>
            <h3>Ciclo de Reinversión</h3>
            <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Plazo inicial de 12 meses. Opcional de reinversión o retiro a los 6 meses.</p>
          </div>
        </div>
      </section>

      <footer style={{ background: 'var(--charcoal)', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem', marginTop: '4rem' }}>
        <p>&copy; 2026 CrowdIn Platform. Rentabilidad respaldada en activos inmobiliarios.</p>
      </footer>
    </>
  );
}

export default App;
