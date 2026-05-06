import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, ShieldCheck, RefreshCw, ChevronRight, BarChart3, Wallet, FileText, ArrowRight, CheckCircle2, Lock, Scale, Building2, Landmark, Activity } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Login from './Login';
import AdminPanel from './AdminPanel';
import ClientPortal from './ClientPortal';
import ParallaxBackground from './ParallaxBackground';

function App() {
  const tierValues = [1000000, 5000000, 10000000, 20000000, 40000000, 100000000];
  const [sliderIndex, setSliderIndex] = useState(4); // Start at 40M Elite
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#home');
  
  // Mouse position for 3D effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crowdin_user'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash || '#home');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  if (currentRoute === '#login') {
    return (
      <Login 
        onNavigate={(route) => { window.location.hash = route; }} 
        onLoginSuccess={(user) => { 
          setCurrentUser(user);
          window.location.hash = user.role === 'SUPERADMIN' ? '#admin' : '#portal';
        }} 
      />
    );
  }

  if (currentRoute === '#admin') {
    if (currentUser?.role !== 'SUPERADMIN') {
      window.location.hash = '#login';
      return null;
    }
    return (
      <AdminPanel 
        user={currentUser} 
        onLogout={() => { localStorage.removeItem('crowdin_token'); localStorage.removeItem('crowdin_user'); setCurrentUser(null); window.location.href = '/'; }} 
      />
    );
  }

  if (currentRoute === '#portal') {
    if (currentUser?.role !== 'CLIENT') {
      window.location.hash = '#login';
      return null;
    }
    return (
      <ClientPortal 
        user={currentUser} 
        onLogout={() => { localStorage.removeItem('crowdin_token'); localStorage.removeItem('crowdin_user'); setCurrentUser(null); window.location.href = '/'; }} 
      />
    );
  }

  // TODO: Reemplaza este número cuando compres el Chip nuevo.
  const WHATSAPP_NUMBER = "56900000000"; 

  const investment = tierValues[sliderIndex];

  const faqs = [
    { q: "¿Qué pasa si el proyecto inmobiliario fracasa o se retrasa?", a: "Al firmar un Contrato de Retroventa, no eres un prestamista, eres dueño de acciones de la Sociedad. En el peor escenario de liquidación, los activos inmobiliarios se liquidan para cubrir el patrimonio de los accionistas, blindando el capital muy por encima de un crédito común." },
    { q: "¿El pago de impuestos recae sobre mi flujo mensual?", a: "Las estructuras se diseñan según normativa de rentas de capital mobiliario. Entregamos los certificados correspondientes en la Operación Renta anual. Es el inversor quien declara su incremento patrimonial en su global complementario." },
    { q: "¿Puedo retirar mi capital antes del Mes 12?", a: "El ciclo mínimo de bloqueo son 12 meses, ya que los fondos se materializan en hormigón, condominios y proyectos reales de flipping. La ventana de rescate se abre exclusivamente al cumplir el ciclo anual, donde puedes solicitar el pago Bullet o renovar." },
    { q: "¿En qué tipo de propiedades invierte mi capital?", a: "Nuestro portafolio abarca tres líneas: 1) 'Flipping' de alta velocidad en zonas urbanas, 2) Compra de terrenos y desarrollo de condominios privados, y 3) Construcción de cabañas para el rubro hotelero, generando rentabilidad fija a través de arriendos." },
    { q: "¿Qué garantía tengo sobre mi inversión inicial?", a: "Tu capital ingresa a una Sociedad por Acciones (SpA) diseñada específicamente como vehículo de adquisición. Primero levantamos el capital estructurado y luego la SpA ejecuta la compra del activo inmobiliario matriz, manteniendo el capital societario blindado bajo mandato legal." },
    { q: "¿Me mantendrán informado del progreso de las obras?", a: "Sí. Durante la fase inicial de levantamiento, la operación es administrativa. Una vez adquirido el activo y comenzada la fase de obra, enviamos reportes digitales de avance a nuestros accionistas." },
    { q: "¿Dónde se realiza la firma legal de las acciones?", a: "Todo el proceso notarial se realiza mediante firma presencial en Notaría o a través de plataformas certificadas de Firma Electrónica Avanzada." },
    { q: "¿El interés mensual es fijo o depende de las ventas?", a: "Es 100% fijo y contractual. Nosotros pagamos tu flujo mensual con nuestro capital de trabajo mientras la obra madura." },
    { q: "¿Quién administra el dinero transferido?", a: "Los fondos ingresan directamente a la cuenta corriente institucional de la Sociedad por Acciones (SpA) que desarrolla el proyecto." }
  ];

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

  const formatCurrency = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const handleWhatsAppRedirect = () => {
    const message = `Hola equipo CrowdIn.\nQuiero estructurar un ticket de inversión por *${formatCurrency(investment)}* (Tramo ${currentTier.name}).\nEntiendo que el flujo mensual de intereses será de *${formatCurrency(monthlyPayment)}*.\n\nSolicito información sobre los proyectos actuales y el borrador del Pacto de Retroventa.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <div style={{ background: 'var(--sage-900)', color: 'var(--white)', padding: '0.5rem 0', fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', position: 'fixed', top: 0, width: '100%', zIndex: 3000, borderBottom: '1px solid var(--gold-primary)' }}>
        <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'ticker 30s linear infinite' }}>
          <span style={{ marginRight: '3rem' }}><CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '5px' }} color="var(--gold-primary)"/> Pago Bullet Confirmado: $40.000.000 a Inversor #829 (Notaría Labbé)</span>
          <span style={{ marginRight: '3rem' }}><CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '5px' }} color="var(--gold-primary)"/> ROI Mensual Ejecutado: $1.250.000 a Inversor #712</span>
          <span style={{ marginRight: '3rem' }}><CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '5px' }} color="var(--gold-primary)"/> Nuevo Contrato Tramo Elite: $40M (Condominio Los Olivos)</span>
          <span style={{ marginRight: '3rem' }}><CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '5px' }} color="var(--gold-primary)"/> Pago Bullet Confirmado: $40.000.000 a Inversor #829</span>
          <span style={{ marginRight: '3rem' }}><CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '5px' }} color="var(--gold-primary)"/> ROI Mensual Ejecutado: $1.250.000 a Inversor #712</span>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      <motion.div
        style={{
          scaleX,
          position: 'fixed',
          top: '28px',
          left: 0,
          right: 0,
          height: '4px',
          background: 'var(--gold-primary)',
          transformOrigin: '0%',
          zIndex: 2000
        }}
      />
      <ParallaxBackground />

      <nav className="navbar" style={{ position: 'fixed', top: '32px', width: '100%', zIndex: 1000, background: 'rgba(244, 247, 244, 0.9)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '0.8rem 2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: 'var(--sage-800)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <img src="/logo.png" alt="CrowdIn Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
          CrowdIn<span style={{ color: 'var(--gold-primary)' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#como-funciona" style={{ textDecoration: 'none', color: 'var(--charcoal)', fontWeight: 600, display: window.innerWidth > 768 ? 'block' : 'none' }}>Mecanismo</a>
          <a href="#calculadora" style={{ textDecoration: 'none', color: 'var(--charcoal)', fontWeight: 600, display: window.innerWidth > 768 ? 'block' : 'none' }}>Simulador</a>
          <button onClick={() => { window.location.hash = '#login'; }} className="btn btn-primary" style={{ padding: '0.6rem 2rem', fontSize: '1rem' }}>Ingresar</button>
        </div>
      </nav>

      {/* HERO SECTION (3D Enhancements) */}
      <section className="hero" ref={heroRef} onMouseMove={handleMouseMove}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-grid" style={{ alignItems: 'center' }}>
            <div className="hero-content">
              <div style={{ display: 'inline-block', padding: '0.5rem 1.5rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold-primary)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '50px', fontWeight: 800, marginBottom: '2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                <Lock size={14} style={{ display: 'inline', marginRight: '5px' }}/> Wealth Management
              </div>
              <h1 className="hero-title" style={{ lineHeight: 1.1 }}>
                Inversión en Casas con <span style={{ color: 'var(--gold-primary)' }}>Renta Fija Mensual.</span>
              </h1>
              <p className="hero-subtitle" style={{ color: 'var(--charcoal-mid)', fontSize: '1.4rem' }}>
                Invierte en el desarrollo de condominios, recibe <strong>intereses mes a mes</strong> en tu cuenta y recupera el 100% de tu capital al mes 12. Blindado por Notaría.
              </p>
              
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                <a href="#calculadora" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Proyectar Retornos <ArrowRight size={20} />
                </a>
                <a href="#como-funciona" className="btn" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--sage-800)', padding: '1rem 2rem', fontSize: '1.1rem', backdropFilter: 'blur(10px)' }}>
                  Ver Mecanismo
                </a>
              </div>

              <div className="stats-bar" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <div className="stat-item"><h4 style={{ color: 'var(--sage-800)' }}>0%</h4><p style={{ color: 'var(--charcoal-mid)' }}>Tasa de Default</p></div>
                <div className="stat-item"><h4 style={{ color: 'var(--sage-800)' }}>20+</h4><p style={{ color: 'var(--charcoal-mid)' }}>Años Experiencia</p></div>
                <div className="stat-item"><h4 style={{ color: 'var(--gold-primary)' }}>+$500M</h4><p style={{ color: 'var(--charcoal-mid)' }}>Gestionados Anual</p></div>
              </div>
            </div>
            
            {/* 3D Interactive Card Element */}
            <div style={{ perspective: '1000px', display: window.innerWidth > 992 ? 'block' : 'none' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '500px',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${mousePos.x * 20}deg) rotateX(${-mousePos.y * 20}deg)`,
                transition: 'transform 0.1s ease-out'
              }}>
                {/* Back Glass Card */}
                <div style={{ position: 'absolute', top: '20px', right: '-20px', width: '350px', height: '450px', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '24px', transform: 'translateZ(-50px)' }}></div>
                
                {/* Main Glass Card */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '380px', height: '480px', background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(244,247,244,0.95))', backdropFilter: 'blur(40px)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '24px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 30px 60px rgba(0,0,0,0.1)', transform: 'translateZ(20px)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(212,175,55,0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--gold-primary)' }}><ShieldCheck size={32}/></div>
                    <span style={{ border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>CONTRATO INTELIGENTE</span>
                  </div>

                  <div>
                    <div style={{ color: 'var(--charcoal-mid)', fontSize: '1rem', marginBottom: '0.5rem' }}>Valor Acción (SpA)</div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--sage-800)', letterSpacing: '-1px' }}>$40.000.000</div>
                    
                    <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--charcoal-mid)' }}>ROI Mensual</span>
                        <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>2.50%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--sage-800)', fontWeight: 600 }}>Flujo Intereses</span>
                        <span style={{ fontSize: '1.5rem', color: 'var(--success)', fontWeight: 800 }}>$1.000.000</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Action Button */}
                  <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%) translateZ(40px)', background: 'var(--gold-primary)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 20px 40px rgba(212,175,55,0.3)', width: 'max-content' }}>
                    <CheckCircle2 size={20}/> Blindaje Notarial Activo
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST BADGES SECTION */}
      <section style={{ background: 'rgba(255,255,255,0.3)', padding: '2rem 0', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', opacity: 0.6, filter: 'grayscale(1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--sage-800)' }}><Landmark size={24}/> BANCA NACIONAL INTEGRADA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--sage-800)' }}><ShieldCheck size={24}/> PROTOCOLIZADO ANTE NOTARIO</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--sage-800)' }}><Activity size={24}/> CUMPLIMIENTO UAF CHILE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--gold-primary)', background: 'rgba(212,175,55,0.1)', padding: '0.5rem 1rem', borderRadius: '12px' }}><Lock size={20}/> KYC OBLIGATORIO</div>
          </div>
        </div>
      </section>

      {/* BUSINESS MODEL SECTION (CLARITY FOCUS) */}
      <section id="modelo" style={{ padding: '8rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--sage-800)', fontFamily: 'Outfit', marginBottom: '1.5rem' }}>¿Cómo funciona el negocio?</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--charcoal-mid)', maxWidth: '800px', margin: '0 auto' }}>Nuestro modelo es simple: Tú aportas la liquidez, nosotros construimos y operamos, y las utilidades se dividen mensualmente.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', position: 'relative' }}>
            {/* Steps with arrows logic (simplified with grid) */}
            <div style={{ background: 'var(--sage-50)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--sage-100)', textAlign: 'center' }}>
              <div style={{ background: 'var(--gold-primary)', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.5rem', fontWeight: 800 }}>1</div>
              <h3 style={{ color: 'var(--sage-800)', marginBottom: '1rem' }}>Aporte de Capital</h3>
              <p style={{ color: 'var(--charcoal-mid)', lineHeight: 1.6 }}>Te conviertes en accionista de la SpA que es dueña del terreno y las casas. Tu dinero está respaldado por activos reales, no por papel.</p>
            </div>
            
            <div style={{ background: 'var(--sage-50)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--sage-100)', textAlign: 'center' }}>
              <div style={{ background: 'var(--gold-primary)', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.5rem', fontWeight: 800 }}>2</div>
              <h3 style={{ color: 'var(--sage-800)', marginBottom: '1rem' }}>Generación de Rentas</h3>
              <p style={{ color: 'var(--charcoal-mid)', lineHeight: 1.6 }}>Las casas se construyen y se venden o arriendan. Ese flujo de caja se traduce en tu pago mensual del 1.5% al 2.5% de interés.</p>
            </div>

            <div style={{ background: 'var(--sage-50)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--sage-100)', textAlign: 'center' }}>
              <div style={{ background: 'var(--gold-primary)', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.5rem', fontWeight: 800 }}>3</div>
              <h3 style={{ color: 'var(--sage-800)', marginBottom: '1rem' }}>Retiro con Garantía</h3>
              <p style={{ color: 'var(--charcoal-mid)', lineHeight: 1.6 }}>A los 12 meses, por contrato notarial obligatorio (Pacto de Retroventa), te compramos tus acciones y recuperas tu inversión inicial completa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="section" id="como-funciona">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Mecanismo de Inversión</span>
            <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', marginTop: '1rem', color: 'var(--sage-800)', fontFamily: 'Outfit' }}>Seguridad Institucional</h2>
          </div>

          <div className="mechanism-wrapper">
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">01</div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <FileText size={40} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--sage-800)' }}>Compra de Acción (SpA)</h3>
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem', lineHeight: 1.6 }}>Eliges tu volumen de capital. Pasas a ser accionista formal de la Sociedad dueña del activo inmobiliario. Tu inversión está respaldada en metros cuadrados, no en aire.</p>
                </div>
              </div>
              <div className="step-card">
                <div className="step-number">02</div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <TrendingUp size={40} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--sage-800)' }}>Flujo de Intereses (Mensual)</h3>
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem', lineHeight: 1.6 }}>Mientras el proyecto madura mediante flipping, condominios o renta hotelera, recibes el pago de intereses pactado directamente en tu cuenta bancaria cada 30 días.</p>
                </div>
              </div>
              <div className="step-card">
                <div className="step-number">03</div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <RefreshCw size={40} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--sage-800)' }}>Devolución del Capital (Mes 12)</h3>
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem', lineHeight: 1.6 }}>Al vencimiento del ciclo (Mes 12), ejecutamos el pacto de retroventa. Recibes un pago Bullet que te <strong>devuelve el 100% de tu capital inicial</strong> íntegro y sin comisiones.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR SECTION */}
      <section className="section calculator-section" id="calculadora">
        <div className="container calc-container">
          <div>
            <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '2rem', color: 'var(--sage-800)', lineHeight: 1.1, fontFamily: 'Outfit' }}>Simula tu Flujo Financiero</h2>
            <p style={{ color: 'var(--charcoal-mid)', marginBottom: '5rem', fontSize: '1.3rem', maxWidth: '700px', lineHeight: 1.8 }}>
              Mueve el deslizador a través de los bloques institucionales y descubre el flujo de caja exacto que depositaremos mes a mes en tu cuenta corriente.
            </p>

            <div className="calc-input-group">
              <label>Volumen de Inversión Seleccionado</label>
              <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '3rem', fontFamily: 'Outfit', lineHeight: 1 }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', color: 'var(--charcoal-mid)', fontSize: '1.1rem', fontWeight: 600 }}>
                <span>Tramo 1 ($1M)</span>
                <span>Institucional ($100M+)</span>
              </div>
            </div>
          </div>

          <div className="calc-results">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h3 style={{ color: 'var(--sage-800)', fontFamily: 'Outfit', fontSize: '2rem', margin: 0 }}>
                {currentTier.name}
              </h3>
              <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold-primary)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.5rem 1.5rem', borderRadius: '50px', fontWeight: 800, fontSize: '1.2rem' }}>
                {(currentTier.roi * 100).toFixed(1)}% Mensual
              </div>
            </div>
            
            <div className="result-row highlight">
              <span style={{ color: 'var(--charcoal-mid)' }}>Intereses (Flujo Mensual)</span>
              <span className="result-val">{formatCurrency(monthlyPayment)}</span>
            </div>
            <div className="result-row">
              <span style={{ color: 'var(--charcoal-mid)' }}>Rendimiento Anual Proyectado</span>
              <span className="result-val" style={{ color: 'var(--sage-800)' }}>{formatCurrency(yearlyInterests)}</span>
            </div>
            <div className="result-row">
              <span style={{ color: 'rgba(212,175,55,0.9)' }}>Pago Bullet del Capital (Mes 12)</span>
              <span className="result-val" style={{ color: 'rgba(212,175,55,0.9)' }}>{formatCurrency(investment)}</span>
            </div>
            <div className="result-row" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '3rem', marginTop: '2rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--charcoal-mid)' }}>Liquidación Total Cierre de Ciclo</span>
              <span className="result-val" style={{ color: 'var(--sage-800)', fontSize: '2.5rem' }}>{formatCurrency(totalReturn)}</span>
            </div>
            
            <button onClick={handleWhatsAppRedirect} className="btn btn-primary" style={{ width: '100%', marginTop: '3rem', fontSize: '1.2rem', padding: '1.2rem' }}>
              Iniciar Estructuración Legal
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Transparencia Total</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', marginTop: '1rem', color: 'var(--sage-800)', fontFamily: 'Outfit' }}>Preguntas Frecuentes</h2>
          </div>
          
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                  <button 
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    style={{ width: '100%', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--sage-800)', margin: 0, fontWeight: 600 }}>{faq.q}</h3>
                    <ChevronRight size={24} style={{ color: 'var(--gold-primary)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', minWidth: '24px' }} />
                  </button>
                  <div style={{ maxHeight: isOpen ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease-in-out' }}>
                    <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.1rem', lineHeight: 1.6, padding: '0 2.5rem 2.5rem 2.5rem', margin: 0 }}>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GUARANTEES SECTION */}
      <section className="section" style={{ background: 'var(--sage-900)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Auditoría y Certificación</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', marginTop: '1rem', color: 'var(--white)', fontFamily: 'Outfit' }}>Garantías Legales de tu Capital</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Scale size={48} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'var(--white)', fontSize: '1.5rem', marginBottom: '1rem' }}>Pacto de Retroventa Notarial</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>El capital no es un préstamo. Adquieres un % de la Sociedad Inmobiliaria con obligación legal de recompra (Bullet) por nuestra parte al mes 12. Protocolizado ante Notario Público.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Landmark size={48} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'var(--white)', fontSize: '1.5rem', marginBottom: '1rem' }}>Cumplimiento UAF</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Operamos bajo la normativa de la Unidad de Análisis Financiero (Ley 19.913). Todos los retornos se depositan exclusivamente a tu cuenta corriente bancaria irrevocablemente ligada a tu RUT.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Building2 size={48} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'var(--white)', fontSize: '1.5rem', marginBottom: '1rem' }}>Respaldo en Activos Reales</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>La sociedad holding posee terrenos, condominios en desarrollo y propiedades de flipping. Si la empresa quebrase (Tasa default 0%), los activos físicos se liquidan cubriendo tu aporte en +150%.</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: 'var(--sage-800)', color: 'rgba(255,255,255,0.6)', padding: '5rem 0 2rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2.5rem', color: 'var(--white)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <img src="/logo.png" alt="CrowdIn Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                CrowdIn<span style={{ color: 'var(--gold-primary)' }}>.</span>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>Firma privada de inversión inmobiliaria. Rentabilidad fija mediante estructuras notariales.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--white)', fontSize: '1.2rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contacto Institucional</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.3s' }}>Asesoría Privada</a></li>
                <li><a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.3s' }}>Términos del Pacto de Retroventa</a></li>
              </ul>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>
            <p>&copy; 2026 CrowdIn Capital. La información aquí presentada constituye una simulación matemática; los retornos son contractuales tras la materialización de los mandatos.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
