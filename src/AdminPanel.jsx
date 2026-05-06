import { useState, useEffect } from 'react';
import { Users, FileText, Plus, LogOut, CheckCircle2, ShieldAlert, DollarSign, Activity, AlertCircle, Trash2 } from 'lucide-react';

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

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`¿Estás 100% seguro de eliminar al inversor ${name} y destruir sus contratos? Esta acción es irreversible.`)) return;
    try {
      const res = await fetch('/api/admin/delete-client', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('crowdin_token')}` },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) fetchClients();
      else alert('Error al eliminar inversor');
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
          
          <p>En la ciudad de Santiago de Chile, a <strong>${new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>, comparecen por una parte <strong>CrowdIn SpA</strong>, sociedad anónima cerrada constituida bajo las leyes de la República de Chile, del giro de inversiones y desarrollos inmobiliarios (en adelante "La Sociedad" o "El Desarrollador"), debidamente representada por su Gerente General; y por la otra parte don/doña <strong>${client.name}</strong>, de nacionalidad chilena, estado civil _______________, profesión/oficio _______________, cédula de identidad N° _______________, domiciliado/a en _______________, correo electrónico <strong>${client.email}</strong>, ${client.bank_account_info ? 'Cuenta Bancaria Registrada (UAF): <strong>'+client.bank_account_info+'</strong>' : ''} (en adelante "El Inversor"), quienes libre y espontáneamente han convenido en celebrar el siguiente contrato, que se regirá por las cláusulas que a continuación se exponen y en silencio de ellas por la legislación chilena aplicable:</p>

          <h2>PRIMERO: Naturaleza y Antecedentes Societarios</h2>
          <p>La Sociedad es una entidad con personalidad jurídica propia, cuyo objeto principal comprende el desarrollo, remodelación, gestión y comercialización estratégica de activos inmobiliarios de alto rendimiento (Proptech). Para efectos de la estructuración de su capital de trabajo (Working Capital) y la mitigación del apalancamiento bancario tradicional, La Sociedad ha resuelto emitir series de acciones preferentes, destinadas exclusivamente a levantar fondos de inversores institucionales y privados. El Inversor, conociendo íntegramente el modelo de negocios, manifiesta su intención irrevocable de aportar liquidez a La Caja de La Sociedad, asumiendo una posición financiera (no controladora) a cambio de una rentabilidad mensual fija y contractualmente garantizada.</p>

          <h2>SEGUNDO: Aporte, Suscripción de Acciones y Toma de Razón</h2>
          <p>Por el presente acto y escritura privada, El Inversor suscribe, paga e integra materialmente a la caja de La Sociedad la suma única y total de <strong>$${new Intl.NumberFormat('es-CL').format(client.amount)} CLP</strong> (en adelante, el "Capital Aportado"). Dicho monto será transferido mediante vale vista, transferencia electrónica o depósito directo a la cuenta corriente institucional de la Sociedad. Contra la acreditación formal de la recepción íntegra de los fondos, el Gerente General de La Sociedad procederá, dentro del plazo máximo de 5 días hábiles, a emitir el certificado provisorio y registrar las acciones preferentes correspondientes a nombre del Inversor en el Registro Oficial de Accionistas de CrowdIn SpA, momento a partir del cual se perfecciona la presente suscripción.</p>

          <h2>TERCERO: Rentabilidad Preferente Garantizada (ROI Mensual)</h2>
          <p>Como contraprestación directa por la inyección de liquidez, La Sociedad garantiza contractualmente a favor del Inversor un flujo financiero mensual fijo, inalterable y preferente (Return on Investment) del <strong>${client.monthly_roi * 100}% mensual</strong> calculado sobre el Capital Aportado. Matemáticamente, esto equivale a la suma exacta de <strong>$${new Intl.NumberFormat('es-CL').format(client.amount * client.monthly_roi)} CLP</strong> mensuales.</p>
          <p>Los pagos se devengarán a partir del mes calendario siguiente a la recepción de los fondos, y serán depositados directamente en la cuenta bancaria designada por El Inversor, a más tardar el día 5 de cada mes. En caso de recaer el día 5 en sábado, domingo o festivo bancario, el pago se anticipará o prorrogará al día hábil inmediatamente más próximo según lo determine la política contable de La Sociedad.</p>

          <h2>CUARTO: Restricciones Estrictas de Cumplimiento (UAF y Lavado de Activos)</h2>
          <p><strong>CUMPLIMIENTO NORMATIVO (LEY N° 19.913):</strong> Las partes dejan expresa constancia y acuerdan irrevocablemente que todos y cada uno de los flujos de rentabilidad mensual (ROI), así como la devolución final del Capital Aportado (Pago Bullet), serán transferidos <strong>estricta, única y exclusivamente a la cuenta bancaria de origen</strong> declarada por el Inversor en la comparecencia de este instrumento.</p>
          <p>Bajo ninguna circunstancia, excepción, ni aun mediando solicitud expresa, formal o notarial del Inversor, La Sociedad aceptará, procesará o ejecutará transferencias a cuentas de terceros, familiares, sociedades externas u otras cuentas no verificadas por el sistema de onboarding corporativo. Lo anterior, con el fin de prevenir de manera absoluta la comisión de delitos contemplados en la Ley N° 19.913 sobre Lavado de Activos y Financiamiento del Terrorismo, así como sus reglamentos asociados. En el evento en que la cuenta de origen fuere cerrada, embargada o inhabilitada, el Inversor deberá someterse a un estricto proceso de compliance corporativo (KYC Ampliado) para el registro de una nueva cuenta, asumiendo cualquier costo legal y retraso que dicho procedimiento amerite.</p>

          <h2>QUINTO: Plazo de Inversión y Pago Bullet (Rescate)</h2>
          <p>El horizonte temporal de esta inversión, así como el período de bloqueo y goce de la rentabilidad, será de exactamente <strong>doce (12) meses calendario</strong>, contados desde la firma de este documento. Al vencimiento de este período (Mes 12), La Sociedad ejecutará el mecanismo denominado "Pago Bullet", el cual consiste en la restitución íntegra e inmediata del Capital Aportado ($${new Intl.NumberFormat('es-CL').format(client.amount)} CLP) a la cuenta bancaria del Inversor. Una vez materializado este pago, se extinguirá ipso facto toda participación accionaria, derechos económicos y políticos del Inversor en La Sociedad, procediéndose a la cancelación de sus acciones en el Registro, salvo que ambas partes acuerden por anexo escrito la reinversión total o parcial (Roll-over) en un nuevo ciclo operativo.</p>

          <h2>SEXTO: Opción de Compra Unilateral y Mandato Especial Irrevocable (Call Option Institucional)</h2>
          <p>El Inversor reconoce y acepta que su participación societaria es de naturaleza netamente financiera y transitoria, careciendo de intenciones de control o permanencia más allá del Plazo de Inversión. Por consiguiente, con el exclusivo objeto de asegurar la estrategia de salida y liquidez de La Sociedad, <strong>El Inversor otorga en este acto, de forma pura, simple, incondicional e irrevocable, una Opción de Compra (Call Option) a favor de La Sociedad</strong> o de los accionistas mayoritarios que esta libremente designe.</p>
          <p>Esta opción faculta a La Sociedad para recomprar la totalidad de las acciones suscritas por el Inversor, pagando exactamente el mismo valor nominal del Capital Aportado originalmente, sin recargos, reajustes ni primas adicionales.</p>
          <p><strong>Cláusula de Ejecución Forzosa:</strong> En el evento en que, cumplido el Mes 12, El Inversor se negare, dilatare injustificadamente o estuviere inubicable para firmar la escritura de traspaso de acciones de vuelta a La Sociedad, <strong>El Inversor otorga desde ya, en los términos del artículo 241 del Código de Comercio y artículo 2169 del Código Civil, un Mandato Especial, Gratuito e Irrevocable al representante legal de CrowdIn SpA.</strong> Dicho mandato le faculta expresa y extensamente para autocontratar, representar al Inversor como vendedor, suscribir los instrumentos públicos y privados de traspaso de acciones, e inscribir dicha transferencia en el Registro de Accionistas. Para que La Sociedad pueda ejercer este mandato y perfeccionar la salida forzosa del Inversor, bastará única y exclusivamente que La Sociedad acredite mediante comprobante bancario haber transferido o depositado el Capital Aportado a la cuenta bancaria registrada del Inversor, sin necesidad de autorización adicional alguna, requerimiento judicial, ni intervención de terceros.</p>

          <h2>SÉPTIMO: Asignación de Riesgos y Garantía de Matriz</h2>
          <p>La Sociedad declara expresamente que la obligación de pago del flujo mensual (cláusula Tercera) constituye un pasivo directo de la empresa. Por tanto, el pago de dichos retornos es independiente de la fluctuación del mercado inmobiliario, el éxito de la venta final de las propiedades subyacentes, o retrasos en la obtención de recepciones municipales. La Sociedad asume íntegramente el riesgo comercial y operativo de los proyectos con su propio patrimonio, flujo de caja matriz y capital de trabajo, liberando al Inversor de contingencias operativas vinculadas al desarrollo de las obras.</p>

          <h2>OCTAVO: Cláusula de Confidencialidad y Secreto Industrial</h2>
          <p>El Inversor se obliga a mantener estricta reserva y confidencialidad respecto a la información financiera, estrategias de adquisición, planos, acuerdos comerciales, márgenes de intermediación, listados de proveedores, y cualquier otro dato o documentación al que tuviere acceso en su calidad de accionista preferente. El incumplimiento de esta cláusula habilitará a La Sociedad a ejercer acciones indemnizatorias, sin perjuicio de la ejecución inmediata de la Opción de Compra (Cláusula Sexta) por grave incumplimiento del pacto social.</p>

          <h2>NOVENO: Domicilio, Jurisdicción y Resolución de Conflictos</h2>
          <p>Para todos los efectos legales, contractuales y extrajudiciales que emanen del presente instrumento, las partes fijan su domicilio comercial en la comuna y ciudad de Santiago de Chile.</p>
          <p>Cualquier duda, dificultad, controversia o reclamo que se suscite entre las partes con ocasión del presente contrato, su ejecución, cumplimiento, interpretación o validez, será resuelta de manera exclusiva por los Tribunales Ordinarios de Justicia competentes de la ciudad de Santiago, a cuya jurisdicción las partes se someten expresamente.</p>
          
          <p><br/><br/>En comprobante de total conformidad, aceptación incondicional de las cláusulas procedentes y obligándose a su fiel cumplimiento, se firma el presente contrato en dos (2) ejemplares de idéntico tenor, contenido y valor legal, quedando un ejemplar en poder de cada compareciente.</p>

          <div class="signature-block">
            <div class="line">
              CrowdIn SpA<br/>
              Representante Legal<br/>
              P.p. El Desarrollador
            </div>
            <div class="line">
              ${client.name}<br/>
              El Inversor<br/>
              RUT: ____________
            </div>
          </div>
          
          <script>
            window.onload = function() { 
              setTimeout(() => window.print(), 1000);
            }
          </script>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
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
                <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => handlePrintContract(client)} style={{ background: 'transparent', border: '1px solid var(--sage-500)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <FileText size={14} /> PDF
                  </button>
                  <button onClick={() => handleDelete(client.user_id, client.name)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Eliminar Inversor">
                    <Trash2 size={16} />
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
