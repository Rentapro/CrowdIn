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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--sage-900)' }}>
      <button 
        onClick={() => onNavigate('#home')}
        style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--sage-200)', cursor: 'pointer', fontSize: '1rem' }}
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <div style={{ background: 'var(--sage-800)', padding: '3rem', borderRadius: '24px', width: '100%', maxWidth: '440px', border: '1px solid var(--sage-700)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ color: 'white', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Portal Privado</h2>
          <p style={{ color: 'var(--sage-300)', margin: 0 }}>Acceso exclusivo para capitalistas</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '12px', color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--sage-200)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sage-400)' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="inversor@correo.com"
                required
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white', fontSize: '1rem', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--sage-200)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sage-400)' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid var(--sage-600)', background: 'var(--sage-900)', color: 'white', fontSize: '1rem', outline: 'none' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '1rem', width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'white', color: 'var(--sage-900)', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
          >
            {loading ? 'Autenticando...' : 'Ingresar'} 
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
