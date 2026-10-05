import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { quizApi } from '../api/quizApi';

interface Errors { name?: string; mobile?: string; email?: string; }

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.prefill ?? {};
  const [form, setForm] = useState({ name: prefill.name ?? '', mobile: prefill.mobile ?? '', email: prefill.email ?? '' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.mobile.trim()) e.mobile = 'Mobile is required';
    else if (!/^\+?[\d\s\-]{7,15}$/.test(form.mobile)) e.mobile = 'Enter a valid mobile number';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const participant = await quizApi.createParticipant(form);
      localStorage.setItem('participantId', String(participant.id));
      localStorage.setItem('participantName', participant.name);
      localStorage.setItem('participantMobile', form.mobile);
      localStorage.setItem('participantEmail', form.email);
      navigate(`/quiz/${participant.id}`);
    } catch {
      setApiError('Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#d4af37', fontSize: '1.8rem' }}>⚔️ Participant Details</h1>
          <p style={{ color: '#9090a0', marginTop: '0.5rem' }}>Enter your details to begin the quiz</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text" placeholder="Your full name"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="tel" placeholder="+91 98765 43210"
                value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
              />
              {errors.mobile && <span className="error">{errors.mobile}</span>}
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            {apiError && (
              <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '1rem' }}>{apiError}</p>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Starting...' : '⚔️ Start Quiz'}
            </button>
          </form>
        </div>
        <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>
    </div>
  );
}
