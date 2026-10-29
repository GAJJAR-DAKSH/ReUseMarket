import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import FormInput from '../components/FormInput';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-charcoal-border rounded-card p-6 sm:p-8 space-y-6 shadow-subtle">
        
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold text-charcoal">Forgot Password</h1>
          <p className="text-xs text-charcoal-muted">
            Enter your college email address to receive a secure password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="py-4 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold text-charcoal">Reset Link Dispatched</p>
            <p className="text-xs text-charcoal-muted">
              If an account is associated with <strong>{email}</strong>, instructions to reset your password have been sent.
            </p>
            <div className="pt-2">
              <Link to="/login" className="btn-secondary text-xs">
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="College Email Address"
              id="email"
              type="email"
              placeholder="e.g. yourname@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-card">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm py-2.5"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-charcoal-border text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-charcoal-muted hover:text-charcoal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;

