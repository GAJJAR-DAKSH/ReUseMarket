import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Recycle, Lock, Mail, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/marketplace';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your college email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-card bg-primary flex items-center justify-center text-white shadow-subtle">
              <Recycle className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-charcoal">Sign In to ReUseMarket</h1>
          <p className="text-xs text-charcoal-muted">
            Access your university reuse dashboard, offers, and reservations
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-charcoal-border rounded-card p-6 sm:p-8 space-y-5 shadow-subtle">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="College Email Address"
              id="email"
              type="email"
              placeholder="e.g. yourname@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="Only verified university student emails are permitted."
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-charcoal">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-card border border-charcoal-border bg-white text-charcoal focus:outline-none focus:border-primary"
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
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-4 border-t border-charcoal-border space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted text-center">
              Quick Demo Access (One-Click)
            </p>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => autofill('aarav@campus.edu')}
                className="p-1.5 rounded-card border border-charcoal-border bg-charcoal-light hover:bg-gray-200 text-charcoal font-medium text-center truncate"
                title="Student with listings & reviews"
              >
                Student 1
              </button>
              <button
                type="button"
                onClick={() => autofill('priya@campus.edu')}
                className="p-1.5 rounded-card border border-charcoal-border bg-charcoal-light hover:bg-gray-200 text-charcoal font-medium text-center truncate"
                title="Student with donation items"
              >
                Student 2
              </button>
              <button
                type="button"
                onClick={() => autofill('admin@campus.edu')}
                className="p-1.5 rounded-card border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-center truncate"
                title="Campus Administrator"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-charcoal-muted">
          New to the campus exchange?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register your college email
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

