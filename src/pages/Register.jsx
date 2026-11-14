import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  }
  return (
  <div className="auth-page">
    <div className="auth-card">
      <p className="auth-eyebrow">FinTrack</p>
      <h1>Créer un compte</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Prénom</label>
          <input name="firstName" value={formData.firstName} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Nom</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Date de naissance</label>
          <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn-primary">S'inscrire</button>
      </form>
      <p className="auth-switch">Déjà un compte ? <Link to="/login">Se connecter</Link></p>
    </div>
  </div>
);
}