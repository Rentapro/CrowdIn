import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, ShieldCheck, RefreshCw, ChevronRight, BarChart3, Wallet, FileText, ArrowRight, CheckCircle2, Lock, Scale, Building2, Landmark, Activity, MapPin, Clock, Zap, LayoutGrid, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Login from './Login';
import AdminPanel from './AdminPanel';
import ClientPortal from './ClientPortal';
import ParallaxBackground from './ParallaxBackground';

function App() {
  const tierValues = [5000000, 10000000, 20000000, 40000000, 100000000, 250000000, 500000000];
  const [sliderIndex, setSliderIndex] = useState(1); // Empezar en 10M para mostrar tracción
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#home');
  
  // Hooks de Framer Motion (Deben estar al inicio para evitar crash de reglas de hooks)
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Mouse position for 3D effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Estados para el Simulador Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalAmount, setModalAmount] = useState(10000000);

  const projects = [
    {
      id: 'flipping-express',
      title: 'Flipping Express',
      subtitle: 'Liquidez de Corto Plazo',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
      ticket: 500000000,
      plazo: '6 MESES',
      roi: 0.012, 
      type: 'PAGO MENSUAL',
      description: 'Modelo diseñado para inversionistas que buscan flujo de caja inmediato. Recibe intereses mensuales y recupera tu capital en solo 6 meses.',
      tag: 'LIQUIDEZ PREFERENTE'
    },
    {
      id: 'zapallar',
      title: 'Laguna de Zapallar',
      subtitle: 'Resort & Spa de Lujo',
      image: '/zapallar.png',
      ticket: 500000000,
      plazo: '12 MESES',
      roi: 0.12,
      type: 'PAGO ÚNICO',
      description: 'Desarrollo de 10 casas de lujo con spa privado. Modelo patrimonial de alta plusvalía con respaldo en tierra premium.',
      tag: 'RESGUARDO VALOR'
    },
    {
      id: 'limache',
      title: 'Altura Limache',
      subtitle: 'Condominio Vertical',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      ticket: 2000000000,
      plazo: '24 MESES',
      roi: 0.18,
      type: 'PAGO ÚNICO',
      description: 'Desarrollo de edificios residenciales en zona de expansión. Proyecto institucional de largo aliento con CIP aprobado.',
      tag: 'INSTITUCIONAL'
    }
  ];

  const handleOpenModal = (project) => {
    setSelectedProject(project);
    setModalAmount(project.ticket / 5); // Sugerir el 20% del ticket por defecto
    setIsModalOpen(true);
  };

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
    { q: "¿Qué pasa si el proyecto se retrasa más allá del plazo pactado?", a: "Nuestros contratos incluyen una Cláusula de Penalización por Mora. Si el ciclo se extiende, CrowdIn asume una multa mensual a favor del inversionista, asegurando que tu capital siga rentando por cada día de retraso." },
    { q: "¿Y si el proyecto inmobiliario no se vende como esperaban?", a: "Tu rentabilidad es fija y garantizada por el Pacto de Retroventa. No depende de las ventas finales. CrowdIn tiene la obligación legal de recomprar tus acciones al precio pactado (Capital + Premio), independientemente del resultado comercial del proyecto." },
    { q: "¿Qué seguridad tengo si CrowdIn llegara a tener problemas financieros?", a: "La SpA donde inviertes es un vehículo independiente (Asset-Backed). El capital se materializa en el terreno y la construcción. Como accionista, tienes derecho preferente sobre el activo físico; si el proyecto se detiene, el patrimonio inmobiliario respalda tu devolución." },
    { q: "¿Qué pasa si no se llega a la meta de recaudación total?", a: "Contamos con Capital Puente propio y líneas de crédito constructor aprobadas. El inicio de obra no depende exclusivamente del Crowdfunding; tu inversión solo ingresa una vez que el proyecto tiene 'Luz Verde' garantizada." },
    { q: "¿Cómo se gestiona el riesgo de desvío de fondos?", a: "Operamos con cuentas segregadas y auditoría de estados de pago. Cada peso invertido tiene un destino específico: Adquisición o Construcción, visado por el mandato de la SpA." },
    { q: "¿El pago de impuestos recae sobre mi utilidad final?", a: "Las estructuras se diseñan según normativa de rentas de capital mobiliario. Entregamos los certificados correspondientes al finalizar el ciclo del proyecto para su declaración en la Operación Renta anual." },
    { q: "¿Puedo retirar mi capital antes del vencimiento?", a: "El capital se materializa en activos reales. La ventana de rescate se abre exclusivamente al cumplir el ciclo pactado (12 o 24 meses), donde recibes el capital más el premio acumulado." },
    { q: "¿En qué tipo de propiedades invierte mi capital?", a: "Nuestro portafolio abarca: 1) Flipping de alta velocidad, 2) Desarrollo de complejos turísticos (Resort Zapallar), y 3) Edificios residenciales. Tú eliges en qué proyecto participar." },
    { q: "¿Me mantendrán informado del progreso de las obras?", a: "Sí. Enviamos reportes digitales de avance a nuestros accionistas mensualmente durante la fase de obra." },
    { q: "¿Dónde se realiza la firma legal de las acciones?", a: "Todo el proceso notarial se realiza mediante firma presencial en Notaría o a través de plataformas certificadas de Firma Electrónica Avanzada." },
    { q: "¿Quién administra el dinero transferido?", a: "Los fondos ingresan directamente a la cuenta corriente institucional de la Sociedad por Acciones (SpA) que desarrolla el proyecto." }
  ];

  const [selectedPlan, setSelectedPlan] = useState('patrimonial'); // 'liquidez' o 'patrimonial'

  const getTier = (val) => {
    if (selectedPlan === 'liquidez') {
      if (val >= 100000000) return { name: 'Tramo Preferente', roi: 0.012 };
      return { name: 'Tramo Inicial', roi: 0.009 };
    }
    // Plan Patrimonial (Escala técnica ajustada para protección de utilidad)
    if (val >= 500000000) return { name: 'Tramo Institucional', roi: 0.022 };
    if (val >= 100000000) return { name: 'Tramo Senior', roi: 0.018 };
    if (val >= 40000000) return { name: 'Tramo Base', roi: 0.015 };
    return { name: 'Tramo Entrada', roi: 0.012 };
  };

  const currentTier = getTier(investment);
  
  // Calculo de retornos
  const monthlyEquivalent = currentTier.roi;
  const totalReturnPremium = selectedPlan === 'liquidez' 
    ? (investment * monthlyEquivalent * 6) 
    : (investment * monthlyEquivalent * 12);
  const totalReturn = investment + totalReturnPremium;


  const formatCurrency = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const handleWhatsAppRedirect = (amount = investment, project = null) => {
    let message = "";
    if (project) {
      if (project.type === 'PAGO MENSUAL') {
        const monthly = amount * project.roi;
        message = `Hola equipo CrowdIn.\n\nHe simulado una inversión de *LIQUIDEZ* (0.9%-1.2% mensual) para el proyecto *${project.title}*.\n\n*Monto:* ${formatCurrency(amount)}\n*Plazo:* ${project.plazo}\n*Flujo Mensual:* ${formatCurrency(monthly)}\n*Retorno Total:* ${formatCurrency(amount + (monthly * 6))}\n\nSolicito validación de cupo.`;
      } else {
        const gain = amount * project.roi;
        message = `Hola equipo CrowdIn.\n\nHe simulado una inversión *PREMIUM* para el proyecto *${project.title}*.\n\n*Monto:* ${formatCurrency(amount)}\n*Plazo:* ${project.plazo}\n*Ganancia Proyectada:* ${formatCurrency(gain)}\n*Total a recibir:* ${formatCurrency(amount + gain)}\n\nSolicito el borrador del Pacto de Retroventa.`;
      }
    } else {
      message = `Hola equipo CrowdIn.\nQuiero estructurar un ticket bajo el *PLAN ${selectedPlan.toUpperCase()}* por *${formatCurrency(investment)}*.\n\nEntiendo que mi ${selectedPlan === 'liquidez' ? 'flujo mensual' : 'premio final'} será de aproximadamente *${formatCurrency(selectedPlan === 'liquidez' ? investment * currentTier.roi : totalReturnPremium)}*.\n\nSolicito información de cupos.`;
    }
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };



  return (
    <>
      <div className="top-banner" style={{ background: 'var(--sage-900)', color: 'rgba(255,255,255,0.7)', padding: '0.6rem 0', fontSize: '0.75rem', fontWeight: 600, position: 'fixed', top: 0, width: '100%', zIndex: 3000, borderBottom: '1px solid var(--gold-primary)', backdropFilter: 'blur(10px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', letterSpacing: '0.5px', textTransform: 'uppercase', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Lock size={12} color="var(--gold-primary)"/> Cifrado SSL</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={12} color="var(--gold-primary)"/> Ley 19.913</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Activity size={12} color="var(--gold-primary)"/> Activos 2026</span>
        </div>
      </div>

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

      <nav className="navbar">
        <div className="navbar-logo">
          <img src="/logo.png" alt="CrowdIn Logo" />
          CrowdIn<span>.</span>
        </div>
        <div className="navbar-actions">
          <a href="#como-funciona" className="nav-link">Mecanismo</a>
          <a href="#calculadora" className="nav-link">Simulador</a>
          <button onClick={() => { window.location.hash = '#login'; }} className="btn btn-primary btn-login">Ingresar</button>
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
              <h1 className="hero-title">
                Inversión Inmobiliaria con <span style={{ color: 'var(--gold-primary)' }}>Retorno Único Garantizado.</span>
              </h1>
              <p className="hero-subtitle">
                Invierte en el desarrollo de complejos turísticos y flipping, recibe tu <strong>capital + premio</strong> al finalizar el proyecto. Blindado por Notaría.
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
                <div className="stat-item"><h4 style={{ color: 'var(--sage-800)' }}>0%</h4><p style={{ color: 'var(--charcoal-mid)' }}>Default Histórico</p></div>
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
                <div style={{ position: 'absolute', top: 0, right: 0, width: '380px', height: '480px', background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(244,247,244,0.95))', backdropFilter: 'blur(40px)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '24px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 30px 60px rgba(0,0,0,0.1)', transform: 'translateZ(20px)', overflow: 'hidden' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(212,175,55,0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--gold-primary)' }}><ShieldCheck size={32}/></div>
                    <span style={{ border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>CERTIFICADO LEGAL</span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ color: 'var(--charcoal-mid)', fontSize: '1rem', marginBottom: '0.5rem' }}>Estructura Societaria</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--sage-800)', letterSpacing: '-1px', lineHeight: 1.1 }}>Sociedad por Acciones</div>
                    
                    <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.8rem' }}>
                        <span style={{ color: 'var(--charcoal-mid)' }}>Flujo Mensual</span>
                        <span style={{ fontWeight: 800, color: 'var(--success)' }}>{formatCurrency(investment * (investment >= 40000000 ? 0.012 : 0.009))}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--charcoal-mid)' }}>Respaldo Directo</span>
                        <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>Activos Reales</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--sage-800)', fontWeight: 600 }}>Garantía</span>
                        <span style={{ fontSize: '1.1rem', color: 'var(--success)', fontWeight: 800 }}>Pacto Retroventa</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--gold-primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={18}/> Blindaje Notarial Activo
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
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--sage-800)' }}><Landmark size={24}/> BANCA NACIONAL INTEGRADA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--sage-800)' }}><ShieldCheck size={24}/> PROTOCOLIZADO ANTE NOTARIO</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--sage-800)' }}><Activity size={24}/> CUMPLIMIENTO UAF CHILE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--gold-primary)', background: 'rgba(212,175,55,0.1)', padding: '0.5rem 1rem', borderRadius: '12px' }}><Lock size={20}/> KYC OBLIGATORIO</div>
          </div>
        </div>
      </section>

      {/* PROJECTS PORTFOLIO SECTION (THE VITRINE) */}
      <section id="proyectos" style={{ padding: '8rem 0', background: 'var(--sage-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Oportunidades Activas</span>
            <h2 style={{ fontSize: '3.5rem', color: 'var(--sage-800)', fontFamily: 'Outfit', marginTop: '1rem' }}>Portafolio de Inversión 2026</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--charcoal-mid)', maxWidth: '800px', margin: '1rem auto' }}>
              Proyectos seleccionados por su alta rentabilidad y velocidad de ejecución. Respaldados por activos inmobiliarios tangibles.
            </p>
          </div>

          <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
            {projects.map((project) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ background: 'white', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--sage-200)', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}
              >
                <div style={{ height: '250px', background: `url('${project.image}') center/cover`, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: project.id === 'zapallar' ? 'var(--gold-primary)' : (project.id === 'flipping-express' ? '#3b82f6' : 'var(--charcoal)'), color: 'white', padding: '0.6rem 1.2rem', borderRadius: '50px', fontWeight: 800, fontSize: '0.8rem', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>{project.tag}</div>
                </div>
                <div style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--sage-900)', fontSize: '1.8rem', fontFamily: 'Outfit' }}>{project.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--charcoal-mid)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {project.id === 'zapallar' ? <MapPin size={16} /> : (project.id === 'flipping-express' ? <TrendingUp size={16} /> : <Building2 size={16} />)} {project.subtitle}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', background: 'var(--sage-50)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-mid)', fontWeight: 800, textTransform: 'uppercase' }}>Modelo</div>
                      <div style={{ color: 'var(--sage-800)', fontWeight: 800, fontSize: '0.9rem' }}>{project.type}</div>
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem', height: '80px', overflow: 'hidden' }}>
                    {project.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--sage-50)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--sage-100)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-mid)', fontWeight: 800, textTransform: 'uppercase' }}>Ticket Proyecto</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sage-900)' }}>{formatCurrency(project.ticket).replace('CLP', '')}</div>
                    </div>
                    <div style={{ background: 'var(--sage-900)', padding: '1.2rem', borderRadius: '16px', color: 'white' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 800, textTransform: 'uppercase' }}>Plazo Retorno</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{project.plazo}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--sage-100)' }}>
                    <div style={{ color: project.type === 'PAGO MENSUAL' ? '#3b82f6' : 'var(--success)', fontWeight: 800, fontSize: '1.2rem' }}>
                      {project.type === 'PAGO MENSUAL' ? `+${(project.roi * 100).toFixed(1)}% Mensual` : `+${(project.roi * 100).toFixed(0)}% Final`}
                    </div>
                    <button onClick={() => handleOpenModal(project)} style={{ background: project.id === 'zapallar' ? 'var(--gold-primary)' : (project.type === 'PAGO MENSUAL' ? '#3b82f6' : 'var(--sage-800)'), color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Simular <ArrowRight size={18}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTMENT SIMULATOR MODAL */}
      {isModalOpen && selectedProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10, 31, 28, 0.8)', backdropFilter: 'blur(10px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', position: 'relative' }}
          >
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--sage-50)', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: 'var(--sage-800)' }}>
              <X size={24} />
            </button>

            <div style={{ padding: '3rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px' }}>Simulador de Inversión</span>
                <h3 style={{ fontSize: '2.2rem', color: 'var(--sage-900)', fontFamily: 'Outfit', marginTop: '0.5rem' }}>{selectedProject.title}</h3>
              </div>

              <div style={{ background: 'var(--sage-50)', padding: '2rem', borderRadius: '24px', marginBottom: '2.5rem', border: '1px solid var(--sage-100)' }}>
                <label style={{ color: 'var(--charcoal-mid)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', display: 'block', marginBottom: '1rem' }}>Monto a Participar</label>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--sage-900)', marginBottom: '1.5rem', fontFamily: 'Outfit' }}>
                  {formatCurrency(modalAmount)}
                </div>
                <input 
                  type="range" 
                  min="5000000" 
                  max={selectedProject.ticket} 
                  step="5000000"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(Number(e.target.value))}
                  style={{ width: '100%', height: '8px', borderRadius: '5px', background: 'var(--sage-200)', appearance: 'none', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--charcoal-mid)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>$5M (Mínimo)</span>
                  <span>{formatCurrency(selectedProject.ticket)} (Proyecto Completo)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {selectedProject.type === 'PAGO MENSUAL' ? 'Flujo Mensual' : 'Premio Acumulado'}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: selectedProject.type === 'PAGO MENSUAL' ? '#3b82f6' : 'var(--success)' }}>
                    {selectedProject.type === 'PAGO MENSUAL' 
                      ? formatCurrency(modalAmount * (modalAmount >= 100000000 ? 0.012 : 0.009))
                      : formatCurrency(modalAmount * selectedProject.roi)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--charcoal-mid)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {selectedProject.type === 'PAGO MENSUAL' ? 'Retorno Total (6m)' : 'Retorno Total'}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--sage-900)' }}>
                    {selectedProject.type === 'PAGO MENSUAL' 
                      ? formatCurrency(modalAmount + (modalAmount * (modalAmount >= 100000000 ? 0.012 : 0.009) * 6))
                      : formatCurrency(modalAmount + (modalAmount * selectedProject.roi))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleWhatsAppRedirect(modalAmount, selectedProject)}
                style={{ width: '100%', background: 'var(--gold-primary)', color: 'white', border: 'none', padding: '1.2rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', boxShadow: '0 15px 30px rgba(212,175,55,0.3)' }}
              >
                Reservar Participación <ArrowRight size={22}/>
              </button>
              
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--charcoal-mid)', marginTop: '1.5rem' }}>
                *Simulación basada en el {selectedProject.plazo} de plazo del proyecto. Sujeta a contrato notarial.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* EXIT STRATEGY & LIQUIDITY SECTION */}
      <section id="estrategia-salida" style={{ padding: '100px 0', background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Ciclo de Inversión</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', marginTop: '1rem', color: 'var(--sage-800)', fontFamily: 'Outfit' }}>Liquidez y Estrategia de Salida</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--charcoal-mid)', marginTop: '1rem' }}>No invertimos en papel volátil, invertimos en ciclos de activos reales. Tu capital tiene una fecha de retorno contractual, blindada por el Pacto de Retroventa.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            <div style={{ background: 'var(--sage-50)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--sage-100)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '3rem', background: 'var(--gold-primary)', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>FASE 1: INGRESO</div>
              <h3 style={{ color: 'var(--sage-800)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>Suscripción de Acciones</h3>
              <p style={{ color: 'var(--charcoal-mid)', lineHeight: 1.8 }}>Te conviertes en accionista formal de la SpA dueña del proyecto. Tu inversión se registra legalmente y se protocoliza el valor de salida desde el día uno.</p>
            </div>
            
            <div style={{ background: 'var(--sage-50)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--sage-100)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '3rem', background: 'var(--gold-primary)', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>FASE 2: MADURACIÓN</div>
              <h3 style={{ color: 'var(--sage-800)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>Valorización del Activo</h3>
              <p style={{ color: 'var(--charcoal-mid)', lineHeight: 1.8 }}>El capital trabaja en la construcción o flipping inmobiliario. El valor de tu participación no fluctúa por noticias, solo crece con el avance real de la obra.</p>
            </div>

            <div style={{ background: 'var(--sage-900)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--sage-900)', position: 'relative', color: 'white' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '3rem', background: 'var(--success)', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>FASE 3: LIQUIDEZ</div>
              <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.4rem' }}>Retroventa Pactada</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>Al cumplirse el ciclo, CrowdIn recompra tus acciones. Recibes tu <strong>Capital + Premio Acumulado</strong> en un solo pago. Sin buscar compradores, sin esperas.</p>
            </div>
          </div>

          <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(212,175,55,0.05)', borderRadius: '24px', border: '1px dashed var(--gold-primary)', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--sage-800)', fontWeight: 600 }}>
              <ShieldCheck size={24} style={{ verticalAlign: 'middle', marginRight: '0.8rem', color: 'var(--gold-primary)' }} />
              <strong>Seguridad Patrimonial:</strong> Al ser Private Equity, tu capital es inmune a las caídas de la bolsa y crisis financieras externas.
            </p>
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
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--sage-800)' }}>Maduración del Activo</h3>
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem', lineHeight: 1.6 }}>Tu capital trabaja en la construcción o adquisición estratégica. No hay retiros intermedios, lo que permite maximizar el interés compuesto y la eficiencia tributaria del proyecto.</p>
                </div>
              </div>
              <div className="step-card">
                <div className="step-number">03</div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <RefreshCw size={40} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--sage-800)' }}>Liquidación y Salida</h3>
                  <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.05rem', lineHeight: 1.6 }}>Al venderse el activo o cumplirse el plazo (lo que ocurra primero), se ejecuta la retroventa. Recibes tu capital + premio. Si el proyecto se vende en 8 meses, recuperas tu plata en 8 meses.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section calculator-section" id="calculadora" style={{ background: 'var(--sage-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--sage-800)', fontFamily: 'Outfit', marginBottom: '1rem' }}>Simulador de Inversión Elite</h2>
            <p style={{ color: 'var(--charcoal-mid)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
              Compara tu rentabilidad proyectada frente a la banca tradicional y elige tu estrategia de salida.
            </p>
          </div>

          <div className="calculator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'stretch' }}>
            
            {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
            <div className="calculator-card" style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid var(--sage-100)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--sage-800)', borderBottom: '1px solid var(--sage-50)', paddingBottom: '1rem' }}>Configuración de Ticket</h3>
              
              <div style={{ marginBottom: '3rem', flex: 1 }}>
                <label style={{ display: 'block', color: 'var(--charcoal-mid)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Estrategia de Retorno</label>
                <div style={{ display: 'flex', background: 'var(--sage-50)', padding: '0.4rem', borderRadius: '16px', gap: '0.4rem' }}>
                  <button 
                    onClick={() => setSelectedPlan('liquidez')}
                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: selectedPlan === 'liquidez' ? '#3b82f6' : 'transparent', color: selectedPlan === 'liquidez' ? 'white' : 'var(--charcoal-mid)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    Liquidez
                  </button>
                  <button 
                    onClick={() => setSelectedPlan('patrimonial')}
                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: selectedPlan === 'patrimonial' ? 'var(--gold-primary)' : 'transparent', color: selectedPlan === 'patrimonial' ? 'white' : 'var(--charcoal-mid)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    Patrimonial
                  </button>
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--charcoal-mid)', lineHeight: 1.5, minHeight: '3rem' }}>
                  {selectedPlan === 'liquidez' 
                    ? `* Plan Liquidez: Retiro mensual de utilidad. Ejemplo: Inviertes ${formatCurrency(investment)}, recibes ${formatCurrency(investment * currentTier.roi)} cada mes por 6 meses.` 
                    : `* Plan Patrimonial: Hasta liquidación del proyecto (12-24 meses). Capital + Premio en un solo pago al cierre.`}
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', color: 'var(--charcoal-mid)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Volumen de Inversión</label>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--sage-900)', marginBottom: '2rem', fontFamily: 'Outfit' }}>
                  {formatCurrency(investment)}
                </div>
                <input 
                  type="range" min="0" max={tierValues.length - 1} step="1"
                  value={sliderIndex} onChange={(e) => setSliderIndex(Number(e.target.value))}
                  className="calc-slider"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--charcoal-mid)', fontWeight: 600 }}>
                  <span>$5M</span>
                  <span>$500M</span>
                </div>
              </div>

              <button onClick={() => handleWhatsAppRedirect()} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', background: selectedPlan === 'liquidez' ? '#3b82f6' : 'var(--gold-primary)' }}>
                Iniciar Estructuración Legal
              </button>
            </div>

            {/* PANEL DERECHO: RESULTADOS Y BENCHMARK */}
            <div className="calculator-card" style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid var(--sage-100)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--sage-800)' }}>Proyección Detallada</h3>
                <div style={{ background: selectedPlan === 'liquidez' ? 'rgba(59,130,246,0.1)' : 'rgba(212,175,55,0.1)', color: selectedPlan === 'liquidez' ? '#3b82f6' : 'var(--gold-primary)', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 800, fontSize: '0.9rem' }}>
                  {currentTier.name} • {((investment >= 100000000 ? 0.012 : 0.009) * 100).toFixed(1)}% Mes
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'var(--sage-50)', padding: '1.5rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-mid)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>{selectedPlan === 'liquidez' ? 'Flujo Mensual' : 'Utilidad al Cierre'}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedPlan === 'liquidez' ? '#3b82f6' : 'var(--gold-primary)' }}>
                    {selectedPlan === 'liquidez' ? formatCurrency(investment * (investment >= 100000000 ? 0.012 : 0.009)) : formatCurrency(investment * currentTier.roi * 12)}
                  </div>
                </div>
                <div style={{ background: 'var(--sage-900)', padding: '1.5rem', borderRadius: '16px', color: 'white' }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Liquidación Total</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    {selectedPlan === 'liquidez' ? formatCurrency(investment + (investment * (investment >= 100000000 ? 0.012 : 0.009) * 6)) : formatCurrency(investment + (investment * currentTier.roi * 12))}
                  </div>
                </div>
              </div>

              {/* BENCHMARK INTEGRADO */}
              <div style={{ borderTop: '1px solid var(--sage-50)', paddingTop: '2rem', flex: 1 }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--sage-800)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Comparativa Bancaria (12 Meses)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { name: 'CrowdIn', gain: investment * currentTier.roi * 12, highlight: true },
                    { name: 'Banco Estado (DAP)', gain: investment * 0.0045 * 12 },
                    { name: 'Banco BICE', gain: investment * 0.0048 * 12 },
                    { name: 'Banco Santander', gain: investment * 0.0047 * 12 },
                    { name: 'Itaú Personal Bank', gain: investment * 0.0050 * 12 }
                  ].map((bank, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: i === 4 ? 'none' : '1px solid var(--sage-50)' }}>
                      <span style={{ fontWeight: bank.highlight ? 800 : 500, color: bank.highlight ? (selectedPlan === 'liquidez' ? '#3b82f6' : 'var(--gold-primary)') : 'var(--charcoal-mid)' }}>{bank.name}</span>
                      <span style={{ fontWeight: 700, color: bank.highlight ? 'var(--success)' : 'var(--sage-800)' }}>{formatCurrency(bank.gain)}</span>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  * Valores referenciales proyectados a 12 meses. Información obtenida de los simuladores web oficiales de cada institución al 12/05/2026. La rentabilidad de CrowdIn es fija y garantizada contractualmente.
                </p>
              </div>
            </div>
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
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Seguridad y Cumplimiento</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', marginTop: '1rem', color: 'var(--white)', fontFamily: 'Outfit' }}>Blindaje Jurídico de tu Capital</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Scale size={48} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: 'var(--white)', fontSize: '1.5rem', marginBottom: '1rem' }}>Mitigación de Riesgo (SPV)</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Cada proyecto opera bajo una SpA independiente. Si la gestora falla, el patrimonio inmobiliario permanece bajo propiedad de los accionistas, blindando el capital en activos reales (Tierras/Obras).</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Landmark size={48} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'var(--white)', fontSize: '1.5rem', marginBottom: '1rem' }}>Sobre-Colateralización</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Solo levantamos capital hasta un 60% del valor proyectado del activo (LTV). Esto genera un margen de seguridad donde, incluso en una liquidación forzosa, el capital del inversionista está cubierto.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Building2 size={48} color="var(--gold-primary)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'var(--white)', fontSize: '1.5rem', marginBottom: '1rem' }}>Salida vía Retroventa</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Estructura de salida protocolizada. El retorno no es variable ni depende de especulación; se define por contrato y se liquida preferencialmente tras la maduración del activo.</p>
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
