import { useState } from 'react';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Login({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Save token and user info
      localStorage.setItem('crowdin_token', data.token);
      localStorage.setItem('crowdin_user', JSON.stringify(data.user));
      
      onLoginSuccess(data.user);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--sage-50)' }}>
      <button 
        onClick={() => onNavigate('#home')}
        style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--sage-700)', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', width: '100%', maxWidth: '440px', border: '1px solid var(--sage-100)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ color: 'var(--charcoal)', fontSize: '2rem', margin: '0 0 0.5rem 0', fontFamily: 'Outfit' }}>Portal Privado</h2>
          <p style={{ color: 'var(--charcoal-mid)', margin: 0 }}>Acceso exclusivo para capitalistas</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '12px', color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--charcoal-mid)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sage-500)' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="inversor@correo.com"
                required
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)', color: 'var(--charcoal)', fontSize: '1rem', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--charcoal-mid)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sage-500)' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid var(--sage-300)', background: 'var(--sage-50)', color: 'var(--charcoal)', fontSize: '1rem', outline: 'none' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '1rem', width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--sage-800)', color: 'white', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
          >
            {loading ? 'Autenticando...' : 'Ingresar'} 
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
