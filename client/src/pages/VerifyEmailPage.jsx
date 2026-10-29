import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [inputToken, setInputToken] = useState(token);
  const [inputEmail, setInputEmail] = useState(email);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const performVerification = async (verifyToken, verifyEmail) => {
    try {
      setLoading(true);
      setStatus('idle');
      const res = await api.post('/auth/verify-email', {
        token: verifyToken,
        email: verifyEmail,
      });

      if (res.data.success) {
        setStatus('success');
        setMessage(res.data.message || 'College email successfully verified!');
        await refreshUser();
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Verification token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      performVerification(token, email);
    }
  }, [token, email]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputToken.trim()) {
      performVerification(inputToken.trim(), inputEmail.trim());
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-charcoal-border rounded-card p-6 sm:p-8 space-y-6 shadow-subtle text-center">
        
        <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-charcoal">College Email Verification</h1>

        {status === 'success' ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-card space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-semibold text-sm">Verification Complete!</p>
              <p className="text-xs">{message}</p>
            </div>
            <Link to="/marketplace" className="btn-primary w-full text-xs py-2.5">
              Explore Campus Marketplace
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-card space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="font-semibold text-sm">Verification Issue</p>
              <p className="text-xs">{message}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Enter Verification Token
                </label>
                <input
                  type="text"
                  placeholder="Paste token from email"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-card border border-charcoal-border"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-xs py-2"
              >
                {loading ? 'Verifying...' : 'Try Again'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-charcoal-muted">
            <p>
              {loading
                ? 'Verifying your student email token with the university registrar...'
                : 'Please check your college email inbox for the verification link.'}
            </p>
            {loading && (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            )}
          </div>
        )}

        <div className="pt-4 border-t border-charcoal-border">
          <Link to="/marketplace" className="text-xs text-primary hover:underline">
            Back to Marketplace
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmailPage;

