import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, ShieldCheck, RefreshCw, ChevronRight, BarChart3, Wallet, FileText, ArrowRight, CheckCircle2, Lock, Eye, Download, MapPin, Building, Image as ImageIcon } from 'lucide-react';
import Login from './Login';
import AdminPanel from './AdminPanel';
import ClientPortal from './ClientPortal';

function App() {
  const tierValues = [1000000, 5000000, 10000000, 20000000, 40000000, 100000000];
  const [sliderIndex, setSliderIndex] = useState(4); // Start at 40M Elite
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#home');
  const [activeProjectTab, setActiveProjectTab] = useState(0);
  
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

  const renderDownloadClick = () => {
    alert("Memorándum descargado con éxito. (Versión de prueba)");
  };

  const projects = [
    { name: "Condominio Los Robles", type: "Desarrollo", location: "Sur de Chile", roi: "30%", status: "En Construcción", imageReal: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", imageRender: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
    { name: "Cabañas del Lago", type: "Renta Hotelera", location: "Villarrica", roi: "25%", status: "Operativo", imageReal: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80", imageRender: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80" },
    { name: "Torre Zafiro", type: "Flipping Urbano", location: "Las Condes", roi: "20%", status: "Remodelación", imageReal: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&w=800&q=80", imageRender: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <>
      <nav className="navbar" style={{ position: 'fixed', width: '100%', zIndex: 1000, background: 'rgba(13, 23, 15, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--sage-800)' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(45deg, var(--gold-light), var(--gold-muted))', borderRadius: '8px' }}></div>
          CrowdIn<span style={{ color: 'var(--gold-muted)' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#proyectos" style={{ textDecoration: 'none', color: 'var(--sage-100)', fontWeight: 600, display: window.innerWidth > 768 ? 'block' : 'none' }}>Portafolio</a>
          <a href="#como-funciona" style={{ textDecoration: 'none', color: 'var(--sage-100)', fontWeight: 600, display: window.innerWidth > 768 ? 'block' : 'none' }}>Mecanismo</a>
          <a href="#calculadora" style={{ textDecoration: 'none', color: 'var(--sage-100)', fontWeight: 600, display: window.innerWidth > 768 ? 'block' : 'none' }}>Simulador</a>
          <button onClick={() => { window.location.hash = '#login'; }} className="btn" style={{ background: 'var(--gold-muted)', color: 'var(--charcoal)', padding: '0.6rem 2rem', fontWeight: 800, border: 'none' }}>Ingresar</button>
        </div>
      </nav>

      {/* HERO SECTION (3D Enhancements) */}
      <section className="hero" ref={heroRef} onMouseMove={handleMouseMove} style={{ minHeight: '100vh', paddingTop: '100px', display: 'flex', alignItems: 'center', background: 'radial-gradient(circle at center, var(--sage-900) 0%, #050a07 100%)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background Grid & Glows */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px', background: 'rgba(212, 175, 55, 0.1)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-grid" style={{ alignItems: 'center' }}>
            <div className="hero-content">
              <div style={{ display: 'inline-block', padding: '0.5rem 1.5rem', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-muted)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '50px', fontWeight: 800, marginBottom: '2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                <Lock size={14} style={{ display: 'inline', marginRight: '5px' }}/> Wealth Management
              </div>
              <h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1.1, color: 'white' }}>
                Rentabilidad Asegurada mediante <span style={{ color: 'var(--gold-muted)' }}>Activos Reales.</span>
              </h1>
              <p className="hero-subtitle" style={{ color: 'var(--sage-100)', fontSize: '1.2rem', lineHeight: 1.6 }}>
                Supera los instrumentos tradicionales bancarios. Invierte en operaciones de flipping, desarrollo de condominios y renta hotelera privada con retornos de hasta 30% anual, blindado con acciones notariales.
              </p>
              
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                <a href="#calculadora" className="btn" style={{ background: 'var(--gold-muted)', color: 'var(--charcoal)', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Proyectar Retornos <ArrowRight size={20} />
                </a>
                <a href="#memorandum" className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--sage-600)', color: 'white', padding: '1rem 2rem', fontSize: '1.1rem', backdropFilter: 'blur(10px)' }}>
                  Descargar Tesis
                </a>
              </div>

              <div className="stats-bar" style={{ marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <div className="stat-item"><h4 style={{ color: 'white' }}>0%</h4><p style={{ color: 'var(--sage-300)' }}>Tasa de Default</p></div>
                <div className="stat-item"><h4 style={{ color: 'white' }}>20+</h4><p style={{ color: 'var(--sage-300)' }}>Años Experiencia</p></div>
                <div className="stat-item"><h4 style={{ color: 'var(--gold-muted)' }}>+$500M</h4><p style={{ color: 'var(--sage-300)' }}>Gestionados Anual</p></div>
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
                <div style={{ position: 'absolute', top: '20px', right: '-20px', width: '350px', height: '450px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', transform: 'translateZ(-50px)' }}></div>
                
                {/* Main Glass Card */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '380px', height: '480px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', backdropFilter: 'blur(40px)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '24px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: 'translateZ(20px)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(212,175,55,0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--gold-muted)' }}><ShieldCheck size={32}/></div>
                    <span style={{ border: '1px solid var(--gold-muted)', color: 'var(--gold-muted)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>CONTRATO INTELIGENTE</span>
                  </div>

                  <div>
                    <div style={{ color: 'var(--sage-100)', fontSize: '1rem', marginBottom: '0.5rem' }}>Valor Acción (SpA)</div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>$40.000.000</div>
                    
                    <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--sage-300)' }}>ROI Mensual</span>
                        <span style={{ color: 'var(--gold-muted)', fontWeight: 'bold' }}>2.50%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 600 }}>Flujo Intereses</span>
                        <span style={{ fontSize: '1.5rem', color: '#34d399', fontWeight: 800 }}>$1.000.000</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Action Button (Illusion of depth) */}
                  <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%) translateZ(40px)', background: 'var(--gold-muted)', color: 'var(--charcoal)', padding: '1rem 2rem', borderRadius: '50px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 20px 40px rgba(212,175,55,0.3)' }}>
                    <CheckCircle2 size={20}/> Blindaje Notarial Activo
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NEW SECTION: INSIDE THE VAULT (Visual Trust) */}
      <section className="section" style={{ background: '#0a120c', position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--gold-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Plataforma Tecnológica</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: 'white', margin: '1rem 0' }}>Bóveda Digital del Inversor</h2>
            <p style={{ color: 'var(--sage-300)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>No operamos a ciegas. Como accionista, tienes acceso a un Dashboard Institucional en tiempo real donde ves tus pagos, descargas tus contratos y auditas el avance de tu capital.</p>
          </div>

          <div style={{ background: 'var(--sage-900)', borderRadius: '24px', border: '1px solid var(--sage-700)', padding: '1rem', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
            {/* Fake Browser Chrome */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderBottom: '1px solid var(--sage-800)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
            </div>
            {/* Mockup Dashboard UI */}
            <div style={{ display: 'flex', background: '#0d170f', borderRadius: '0 0 16px 16px', overflow: 'hidden' }}>
              <div style={{ width: '200px', background: '#0a120c', padding: '2rem', borderRight: '1px solid var(--sage-800)', display: window.innerWidth > 768 ? 'block' : 'none' }}>
                <div style={{ height: '20px', width: '80%', background: 'var(--sage-800)', borderRadius: '4px', marginBottom: '2rem' }}></div>
                <div style={{ height: '15px', width: '100%', background: 'rgba(212,175,55,0.2)', borderRadius: '4px', marginBottom: '1rem' }}></div>
                <div style={{ height: '15px', width: '90%', background: 'var(--sage-800)', borderRadius: '4px', marginBottom: '1rem' }}></div>
                <div style={{ height: '15px', width: '95%', background: 'var(--sage-800)', borderRadius: '4px' }}></div>
              </div>
              <div style={{ flexGrow: 1, padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <div style={{ width: '30%', height: '100px', background: 'var(--sage-800)', borderRadius: '16px' }}></div>
                  <div style={{ width: '30%', height: '100px', background: 'var(--sage-800)', borderRadius: '16px' }}></div>
                  <div style={{ width: '30%', height: '100px', background: 'var(--sage-800)', borderRadius: '16px' }}></div>
                </div>
                <div style={{ background: 'var(--sage-800)', padding: '2rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ height: '15px', width: '100px', background: 'var(--sage-600)', borderRadius: '4px', marginBottom: '1rem' }}></div>
                    <div style={{ height: '30px', width: '200px', background: 'white', borderRadius: '8px' }}></div>
                  </div>
                  <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid #34d399', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#34d399', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 color="white"/></div>
                    <div style={{ color: '#34d399', fontWeight: 'bold' }}>Rentando (4/12 Pagos)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: RENDER VS REALITY (Interactive Portfolio) */}
      <section className="section bg-sage" id="proyectos">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--gold-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Portafolio Tangible</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: 'white', margin: '1rem 0' }}>Lo que ves, se construye.</h2>
            <p style={{ color: 'var(--sage-100)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>Nuestra promesa es física. Compara las maquetas de inversión con el avance real de nuestras obras a lo largo de Chile.</p>
          </div>

          {/* Custom Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {projects.map((proj, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveProjectTab(idx)}
                style={{ background: activeProjectTab === idx ? 'var(--gold-muted)' : 'var(--sage-800)', color: activeProjectTab === idx ? 'var(--charcoal)' : 'white', border: '1px solid var(--sage-600)', padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
              >
                {proj.name}
              </button>
            ))}
          </div>

          {/* Project Display */}
          <div style={{ background: 'var(--sage-900)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--sage-700)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 992 ? '1fr 1fr' : '1fr', minHeight: '400px' }}>
              {/* Render Image */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={projects[activeProjectTab].imageRender} alt="Render" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={16}/> Render (Proyección)
                </div>
              </div>
              {/* Reality Image */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={projects[activeProjectTab].imageReal} alt="Realidad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--gold-muted)', color: 'var(--charcoal)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={16}/> Avance Real
                </div>
              </div>
            </div>
            
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.8rem', color: 'white', margin: '0 0 0.5rem 0' }}>{projects[activeProjectTab].name}</h3>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--sage-300)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14}/> {projects[activeProjectTab].location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Building size={14}/> {projects[activeProjectTab].type}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--sage-300)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>ESTADO ACTUAL</div>
                <div style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', padding: '0.5rem 1.5rem', borderRadius: '50px', fontWeight: 'bold' }}>{projects[activeProjectTab].status}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="section bg-dark" id="como-funciona">
        {/* ... (Mechanism content kept exactly the same as before for logic) ... */}
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'var(--gold-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Mecanismo de Inversión</span>
            <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', marginTop: '1rem', color: 'var(--white)' }}>Seguridad Institucional, paso a paso</h2>
          </div>

          <div className="mechanism-wrapper" style={{ marginTop: '4rem' }}>
            <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
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
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem' }}>Mientras el proyecto madura mediante flipping, condominios o renta hotelera, recibes el pago de intereses pactado directamente en tu cuenta bancaria cada 30 días.</p>
                </div>
              </div>
              <div className="step-card">
                <div className="step-number">03</div>
                <div className="step-content">
                  <RefreshCw size={40} color="var(--sage-800)" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>Devolución Bullet (Mes 12)</h3>
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem' }}>Al vencimiento del contrato (Mes 12), ejecutamos el pacto de retroventa. Recibes un pago Bullet que te <strong>devuelve el 100% de tu capital inicial</strong> íntegro.</p>
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

      {/* NEW SECTION: LEAD MAGNET (Download Pitch Deck) */}
      <section className="section bg-sage" id="memorandum" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(45deg, var(--sage-900), var(--sage-800))', zIndex: 0 }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', padding: '4rem', borderRadius: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <FileText size={60} color="var(--gold-muted)" style={{ marginBottom: '2rem' }} />
            <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>Memorándum de Inversión (PDF)</h2>
            <p style={{ color: 'var(--sage-100)', fontSize: '1.2rem', marginBottom: '3rem', lineHeight: 1.6 }}>
              Descarga nuestra tesis de inversión detallada. Descubre los marcos legales UAF, el detalle técnico de los pactos de retroventa y el análisis financiero de la rentabilidad anual del 30%.
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); renderDownloadClick(); }} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <input type="email" placeholder="Ingresa tu correo institucional" required style={{ padding: '1rem 1.5rem', width: '100%', maxWidth: '350px', borderRadius: '12px', border: 'none', fontSize: '1.1rem', background: 'white', color: 'var(--charcoal)' }} />
              <button type="submit" className="btn btn-primary" style={{ background: 'var(--gold-muted)', color: 'var(--charcoal)', border: 'none', padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                <Download size={20}/> Descargar PDF Confidencial
              </button>
            </form>
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
          
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} style={{ background: 'var(--sage-50)', borderRadius: '24px', border: '1px solid var(--sage-100)', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                  <button 
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    style={{ width: '100%', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <h3 style={{ fontSize: '1.3rem', color: 'var(--charcoal)', margin: 0, fontWeight: 600 }}>{faq.q}</h3>
                    <ChevronRight size={24} style={{ color: 'var(--sage-800)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', minWidth: '24px' }} />
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

      <footer style={{ background: '#050a07', color: 'rgba(255,255,255,0.4)', padding: '5rem 0 2rem 0' }}>
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
