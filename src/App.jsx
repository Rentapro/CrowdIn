import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, RefreshCw, ChevronRight, BarChart3, Wallet, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

function App() {
  const tierValues = [1000000, 5000000, 10000000, 20000000, 40000000, 100000000];
  const [sliderIndex, setSliderIndex] = useState(4); // Start at 40M Elite

  // TODO: Reemplaza este número cuando compres el Chip nuevo. (Formato: código de país + número, sin el '+')
  const WHATSAPP_NUMBER = "56900000000"; 

  const investment = tierValues[sliderIndex];

  const getTier = (amount) => {
    if (amount >= 100000000) return { roi: 0.025, name: 'Institucional' };
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

  const handleWhatsAppRedirect = () => {
    const message = `Hola equipo CrowdIn.\nQuiero estructurar un ticket de inversión por *${formatCurrency(investment)}* (Tramo ${currentTier.name}).\nEntiendo que el flujo mensual de intereses será de *${formatCurrency(monthlyPayment)}*.\n\nSolicito información sobre los proyectos actuales y el borrador del Pacto de Retroventa.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <>
      <nav className="navbar">
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: 'var(--sage-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(45deg, var(--charcoal), var(--sage-800))', borderRadius: '8px' }}></div>
          CrowdIn<span style={{ color: 'var(--gold-muted)' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#como-funciona" style={{ textDecoration: 'none', color: 'var(--charcoal)', fontWeight: 600, display: window.innerWidth > 768 ? 'block' : 'none' }}>Cómo Funciona</a>
          <a href="#calculadora" style={{ textDecoration: 'none', color: 'var(--charcoal)', fontWeight: 600, display: window.innerWidth > 768 ? 'block' : 'none' }}>Simulador</a>
          <button onClick={handleWhatsAppRedirect} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>Portal Inversor</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div style={{ display: 'inline-block', padding: '0.5rem 1.5rem', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-muted)', borderRadius: '50px', fontWeight: 800, marginBottom: '2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Acceso Privado Institucional
              </div>
              <h1 className="hero-title">
                Rentabilidad Asegurada mediante <span>Activos Inmobiliarios Reales.</span>
              </h1>
              <p className="hero-subtitle">
                Supera los instrumentos tradicionales bancarios. Invierte en operaciones de flipping inmobiliario privado con retornos de hasta 30% anual, blindado con acciones notariales.
              </p>
              
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <a href="#calculadora" className="btn btn-primary">
                  Proyectar Retornos <ArrowRight size={24} />
                </a>
                <a href="#como-funciona" className="btn" style={{ background: 'transparent', border: '2px solid var(--charcoal)', color: 'var(--charcoal)' }}>
                  Ver Mecanismo Legal
                </a>
              </div>

              <div className="stats-bar">
                <div className="stat-item">
                  <h4>0%</h4>
                  <p>Tasa de Default</p>
                </div>
                <div className="stat-item">
                  <h4>20+</h4>
                  <p>Años de Experiencia</p>
                </div>
                <div className="stat-item">
                  <h4>$12M+</h4>
                  <p>Gestionados Anual</p>
                </div>
              </div>
            </div>
            
            {/* 3D Glass Mockup */}
            <div className="hero-mockup">
              <div className="mockup-decoration"></div>
              <div className="mockup-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--charcoal-light)', padding: '1rem', borderRadius: '16px', color: 'var(--gold-muted)' }}>
                      <BarChart3 size={32} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>Simulador Activo</h3>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', margin: 0 }}>Flujo Mensual Garantizado</p>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.9rem', color: 'var(--gold-light)' }}>
                    Actualizado
                  </div>
                </div>
                
                <div className="mockup-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}><Wallet size={24}/> Capital Base (Tier Elite)</span>
                  <span className="mockup-value">$40.000.000</span>
                </div>
                <div className="mockup-item">
                  <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>ROI Contractual (Mensual)</span>
                  <span className="mockup-value" style={{ color: 'var(--gold-muted)' }}>2.50%</span>
                </div>
                <div className="mockup-item" style={{ paddingTop: '3rem' }}>
                  <span style={{ fontSize: '1.3rem', color: 'var(--white)', fontWeight: 600 }}>Intereses Mensuales a tu Cuenta</span>
                  <span className="mockup-value" style={{ fontSize: '2.5rem', background: 'linear-gradient(90deg, var(--gold-light), var(--gold-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>$1.000.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="section bg-dark" id="como-funciona">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'var(--gold-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Mecanismo de Inversión</span>
            <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', marginTop: '1rem', color: 'var(--white)' }}>Seguridad Institucional, paso a paso</h2>
          </div>

          <div className="mechanism-wrapper">
            <div className="mechanism-image">
              <div style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', zIndex: 2 }}>
                <h4 style={{ color: 'var(--gold-muted)', fontSize: '1.8rem', margin: 0, fontFamily: 'Outfit' }}>Auditoría Inmobiliaria</h4>
                <p style={{ color: 'var(--white)', opacity: 0.8, margin: 0, fontSize: '1.1rem' }}>Respaldo tangible y planos de ejecución.</p>
              </div>
            </div>
            
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">01</div>
                <div className="step-content">
                  <FileText size={40} color="var(--sage-800)" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>Compra de Acción (SpA)</h3>
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem' }}>Eliges tu volumen de capital. Pasas a ser accionista formal de la Sociedad dueña del activo inmobiliario. Tu inversión está respaldada en metros cuadrados, no en aire.</p>
                </div>
              </div>

              <div className="step-card">
                <div className="step-number">02</div>
                <div className="step-content">
                  <TrendingUp size={40} color="var(--sage-800)" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>Flujo de Intereses (Mensual)</h3>
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem' }}>Mientras el proyecto madura mediante flipping o remodelación, tú recibes el pago de intereses pactado de forma ininterrumpida directamente en tu cuenta bancaria cada 30 días.</p>
                </div>
              </div>

              <div className="step-card">
                <div className="step-number">03</div>
                <div className="step-content">
                  <RefreshCw size={40} color="var(--sage-800)" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>Devolución Bullet (Mes 12)</h3>
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem' }}>Al vencimiento del contrato (Mes 12), ejecutamos el pacto de retroventa para recuperar la acción. Recibes un pago Bullet que te <strong>devuelve el 100% de tu capital inicial</strong> íntegro.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIERS SECTION */}
      <section className="section bg-sage">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', marginBottom: '1.5rem' }}>Estructura de Tramos de Capital</h2>
            <p style={{ color: 'var(--charcoal-mid)', maxWidth: '800px', margin: '0 auto', fontSize: '1.3rem' }}>
              Para minimizar la fricción notarial y garantizar la robustez del libro de accionistas, nuestro modelo de pacto de retroventa se rige por bloques de capital fijos. A mayor volumen, mayor es tu posición preferente.
            </p>
          </div>

          <div className="tiers-grid">
            {[
              { amount: '1.000.000', roi: '1.0%', annual: '12.0%' },
              { amount: '5.000.000', roi: '1.3%', annual: '15.6%' },
              { amount: '10.000.000', roi: '1.6%', annual: '19.2%' },
              { amount: '20.000.000', roi: '2.0%', annual: '24.0%' }
            ].map((tier, idx) => (
              <div className="tier-card" key={idx}>
                <h3 style={{ fontSize: '1.8rem' }}>Tramo {idx + 1}</h3>
                <div style={{ fontSize: '1.2rem', color: 'var(--charcoal-mid)', marginTop: '1rem' }}>Valor de la Acción</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>${tier.amount}</div>
                <div className="roi-value">{tier.roi} <span style={{fontSize: '1.2rem', color: 'var(--charcoal-mid)'}}>mensual</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--sage-800)' }}><CheckCircle2 size={20}/> {tier.annual} Retorno Anual</div>
              </div>
            ))}

            {/* Elite Tier */}
            <div className="tier-card elite" style={{ gridColumn: window.innerWidth > 1024 ? 'span 2' : 'auto' }}>
              <div className="tier-badge">El más elegido</div>
              <div style={{ display: 'flex', flexDirection: window.innerWidth > 768 ? 'row' : 'column', justifyContent: 'space-between', alignItems: window.innerWidth > 768 ? 'center' : 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '2.5rem' }}>Tramo Elite / Institucional</h3>
                  <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginTop: '1rem' }}>Valor de la Acción</div>
                  <div style={{ fontSize: '3rem', fontWeight: 800 }}>$40M - $100M+</div>
                </div>
                <div style={{ textAlign: window.innerWidth > 768 ? 'right' : 'left', marginTop: window.innerWidth > 768 ? 0 : '2rem' }}>
                  <div className="roi-value" style={{ margin: 0, fontSize: '4rem' }}>2.5%</div>
                  <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>Retorno Mensual Garantizado</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--gold-muted)', justifyContent: window.innerWidth > 768 ? 'flex-end' : 'flex-start', marginTop: '1rem' }}>
                    <CheckCircle2 size={20}/> 30.0% Retorno Anual
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR SECTION */}
      <section className="section calculator-section bg-dark" id="calculadora">
        <div className="container calc-container">
          <div>
            <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '2rem', color: 'var(--white)', lineHeight: 1.1 }}>Simula tu Flujo Financiero</h2>
            <p style={{ color: 'var(--sage-100)', marginBottom: '5rem', fontSize: '1.3rem', maxWidth: '700px', lineHeight: 1.8 }}>
              Mueve el deslizador a través de los bloques institucionales y descubre el flujo de caja exacto que depositaremos mes a mes en tu cuenta corriente.
            </p>

            <div className="calc-input-group">
              <label>Volumen de Inversión Seleccionado</label>
              <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--gold-muted)', marginBottom: '3rem', fontFamily: 'Outfit', lineHeight: 1 }}>
                {formatCurrency(investment)}
              </div>
              
              <input 
                type="range" 
                min="0" 
                max={tierValues.length - 1} 
                step="1"
                value={sliderIndex}
                onChange={(e) => setSliderIndex(Number(e.target.value))}
                className="calc-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 600 }}>
                <span>Tramo 1 ($1M)</span>
                <span>Institucional ($100M+)</span>
              </div>
            </div>
          </div>

          <div className="calc-results">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h3 style={{ color: 'var(--white)', fontFamily: 'Outfit', fontSize: '2rem', margin: 0 }}>
                {currentTier.name}
              </h3>
              <div style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-muted)', padding: '0.5rem 1.5rem', borderRadius: '50px', fontWeight: 800, fontSize: '1.2rem' }}>
                {(currentTier.roi * 100).toFixed(1)}% Mensual
              </div>
            </div>
            
            <div className="result-row highlight">
              <span>Intereses (Flujo Mensual)</span>
              <span className="result-val">{formatCurrency(monthlyPayment)}</span>
            </div>
            <div className="result-row">
              <span>Rendimiento Anual Proyectado</span>
              <span className="result-val" style={{ color: 'var(--white)' }}>{formatCurrency(yearlyInterests)}</span>
            </div>
            <div className="result-row">
              <span style={{ color: 'var(--gold-light)' }}>Pago Bullet del Capital (Mes 12)</span>
              <span className="result-val" style={{ color: 'var(--gold-light)' }}>{formatCurrency(investment)}</span>
            </div>
            <div className="result-row" style={{ borderTop: '2px solid rgba(255,255,255,0.1)', paddingTop: '3rem', marginTop: '2rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1.5rem', color: 'var(--sage-100)' }}>Liquidación Total Cierre de Ciclo</span>
              <span className="result-val" style={{ color: 'var(--sage-500)', fontSize: '3rem' }}>{formatCurrency(totalReturn)}</span>
            </div>
            
            <button onClick={handleWhatsAppRedirect} className="btn btn-primary" style={{ width: '100%', marginTop: '3rem', fontSize: '1.3rem', padding: '1.5rem' }}>
              Iniciar Estructuración Legal
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="section bg-white">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--charcoal-mid)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Transparencia Total</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', marginTop: '1rem', color: 'var(--charcoal)' }}>Preguntas Frecuentes</h2>
          </div>
          
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'var(--sage-50)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--sage-100)' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--charcoal)', marginBottom: '1rem' }}>¿Qué pasa si el proyecto inmobiliario fracasa o se retrasa?</h3>
              <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.1rem', lineHeight: 1.6 }}>Al firmar un Contrato de Retroventa, no eres un prestamista, eres **dueño de acciones de la Sociedad**. En el peor escenario de liquidación de la empresa, los activos inmobiliarios (propiedades) se liquidan para cubrir el patrimonio de los accionistas, blindando el capital muy por encima de un crédito común.</p>
            </div>
            <div style={{ background: 'var(--sage-50)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--sage-100)' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--charcoal)', marginBottom: '1rem' }}>¿El pago de impuestos recae sobre mi flujo mensual?</h3>
              <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.1rem', lineHeight: 1.6 }}>Las estructuras se diseñan según normativa de rentas de capital mobiliario. Entregamos los certificados correspondientes en la Operación Renta anual. Es el inversor quien declara su incremento patrimonial en su global complementario.</p>
            </div>
            <div style={{ background: 'var(--sage-50)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--sage-100)' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--charcoal)', marginBottom: '1rem' }}>¿Puedo retirar mi capital antes del Mes 12?</h3>
              <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.1rem', lineHeight: 1.6 }}>El ciclo mínimo de bloqueo son 12 meses, ya que los fondos se materializan en hormigón y proyectos reales de flipping. La ventana de rescate se abre exclusivamente al cumplir el ciclo anual, donde puedes solicitar el pago Bullet o renovar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON & TRUST SECTION */}
      <section className="section bg-sage">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--charcoal-mid)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Análisis Competitivo</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', marginTop: '1rem' }}>Superamos a la Banca Tradicional</h2>
          </div>
          
          <div className="comparison-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Métrica de Evaluación</th>
                  <th>Depósito a Plazo (Banca)</th>
                  <th className="td-elite" style={{ background: 'var(--charcoal)', color: 'var(--gold-muted)' }}>CrowdIn (Nivel Elite 40M)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Flujo Mensual Generado (por 40M)</strong></td>
                  <td className="td-banco">~ $200.000</td>
                  <td className="td-elite" style={{ fontSize: '1.5rem' }}>{formatCurrency(40000000 * 0.025)}</td>
                </tr>
                <tr>
                  <td><strong>Rentabilidad Anual Proyectada</strong></td>
                  <td className="td-banco">~ 6.0% (Mermado por inflación)</td>
                  <td className="td-elite" style={{ fontSize: '1.5rem' }}>30.0%</td>
                </tr>
                <tr>
                  <td><strong>Naturaleza de la Garantía</strong></td>
                  <td className="td-banco">Papel Financiero de Deuda (Pagaré)</td>
                  <td className="td-elite">Garantía Accionaria Real (SpA Inmobiliaria)</td>
                </tr>
                <tr>
                  <td><strong>Flexibilidad Contractual</strong></td>
                  <td className="td-banco">Bloqueo rígido con penalización de salida</td>
                  <td className="td-elite">Renovación o rescate cada 6/12 meses</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon"><ShieldCheck size={50} /></div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Auditoría Notarial</h3>
              <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.1rem', lineHeight: 1.7 }}>Cada ingreso de capital se formaliza legalmente. No somos un fondo ciego, tú eres dueño nominal de tu fracción del proyecto.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><TrendingUp size={50} /></div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Sin Intermediarios</h3>
              <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.1rem', lineHeight: 1.7 }}>Al conectar directamente tu capital con la operación inmobiliaria matriz (20 años de experiencia), eliminamos los inmensos spreads bancarios.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><RefreshCw size={50} /></div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Interés Compuesto Real</h3>
              <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.1rem', lineHeight: 1.7 }}>Puedes retirar tu flujo o reinvertirlo en nuevos proyectos de flipping, escalando tu capital a velocidad de mercado privado.</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: 'var(--charcoal)', color: 'rgba(255,255,255,0.4)', padding: '5rem 0 2rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2.5rem', color: 'var(--sage-100)', marginBottom: '1.5rem' }}>
                CrowdIn<span style={{ color: 'var(--gold-muted)' }}>.</span>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>Plataforma privada de inversión y levantamiento de capital inmobiliario con respaldo accionario.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--white)', fontSize: '1.2rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Enlaces Legales</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }}>Términos del Pacto de Retroventa</a></li>
                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }}>Auditorías Inmobiliarias</a></li>
                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }}>Políticas de Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '1rem' }}>
            <p>&copy; 2026 CrowdIn Capital. La información aquí presentada constituye una simulación y los retornos están sujetos a la materialización de los contratos.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
