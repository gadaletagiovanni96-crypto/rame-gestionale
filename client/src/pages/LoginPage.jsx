import { useState } from 'react'; 
import { useAuth } from '../context/AuthContext.jsx'; 
import ErrorText from '../components/ui/ErrorText.jsx';

export default function LoginPage() {
  const { login } = useAuth(); 
  const [form, setForm] = useState({ email: '', password: '' }); 
  const [error, setError] = useState('');
  
  const submit = async e => { 
    e.preventDefault(); 
    try { 
      await login(form); 
    } catch (x) { 
      setError(x.message); 
    } 
  };

  return (
    <main style={{ 
      maxWidth: 400, 
      margin: '80px auto', 
      padding: '0 20px' 
    }}>
      <div 
        className="card" 
        style={{ 
          borderTop: '8px solid var(--giallo)', 
          padding: '2.5rem 2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          backgroundColor: '#fff'
        }}
      >
        {/* Logo dell'agenzia */}
        <img 
          src="/logo2.png" 
          alt="Logo Agenzia" 
          style={{ 
            width: '100%', 
            maxWidth: '240px', // Adatto a un logo lungo e stretto
            height: 'auto',
            objectFit: 'contain',
            marginBottom: '1rem'
          }} 
        />
        
        <h1 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '2rem', 
          color: '#333',
          fontWeight: '600'
        }}>
          Accedi
        </h1>

        <form onSubmit={submit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label 
              htmlFor="email" 
              style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}
            >
              Email
            </label>
            <input 
              id="email" 
              type="email" 
              required 
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="pw" 
              style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}
            >
              Password
            </label>
            <input 
              id="pw" 
              type="password" 
              required 
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            />
          </div>

          <ErrorText>{error}</ErrorText>
          
          <button 
            type="submit"
            className="y"
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              marginTop: '0.5rem',
              fontSize: '1rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Entra
          </button>
        </form>
      </div>
    </main>
  );
}