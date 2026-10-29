import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    campusHostelOrBlock: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      setSuccessMessage(
        res.message || 'Registration successful! Verification instructions sent to your college inbox.'
      );
      setTimeout(() => {
        navigate('/marketplace');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-card bg-primary flex items-center justify-center text-white shadow-subtle">
              <Recycle className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-charcoal">Join ReUseMarket</h1>
          <p className="text-xs text-charcoal-muted">
            The exclusive sustainable marketplace for university students
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-charcoal-border rounded-card p-6 sm:p-8 space-y-5 shadow-subtle">
          
          {/* Allowed College Domain notice */}
          <div className="p-3 bg-primary-surface border border-primary-border rounded-card flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-charcoal leading-relaxed">
              <strong>College verification required:</strong> You must register with an institutional student email (e.g. ending in <code className="text-primary font-mono">.edu</code>, <code className="text-primary font-mono">.ac.in</code>).
            </p>
          </div>

          {successMessage ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-charcoal">Account Created!</h3>
              <p className="text-xs text-charcoal-muted">{successMessage}</p>
              <p className="text-[11px] text-primary pt-2">Redirecting to campus market...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Full Name"
                id="name"
                name="name"
                placeholder="e.g. Ananya Sen"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <FormInput
                label="College Email Address"
                id="email"
                name="email"
                type="email"
                placeholder="e.g. ananya@campus.edu"
                value={formData.email}
                onChange={handleChange}
                required
                helperText="Must match your university institutional domain."
              />

              <FormInput
                label="Campus Residence / Hostel (Optional)"
                id="campusHostelOrBlock"
                name="campusHostelOrBlock"
                placeholder="e.g. Hostel 5, Room 210 or Block C"
                value={formData.campusHostelOrBlock}
                onChange={handleChange}
                helperText="Helps peers find convenient meetup spots."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <FormInput
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-card">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-sm py-2.5 mt-2"
              >
                {loading ? 'Creating Account...' : 'Register Campus Account'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-charcoal-muted">
          Already registered on campus?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

