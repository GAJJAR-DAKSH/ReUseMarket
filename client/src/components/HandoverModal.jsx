import React, { useState } from 'react';
import { KeyRound, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import FormInput from './FormInput';
import api from '../services/api';

const HandoverModal = ({ isOpen, onClose, reservation, isSeller, onHandoverSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!reservation) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!code || code.trim().length !== 6) {
      setError('Please enter the 6-digit handover code provided by the buyer');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/handover/verify', {
        reservationId: reservation._id,
        handoverCode: code.trim(),
      });

      setSuccess(true);
      if (onHandoverSuccess) onHandoverSuccess(res.data.reservation);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCode('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Invalid or expired handover code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Secure Campus Handover Verification">
      <div className="space-y-4">
        {/* Listing preview */}
        <div className="p-3 bg-charcoal-light rounded-card flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs text-charcoal-muted">Exchange Item</p>
            <p className="text-sm font-semibold text-charcoal truncate">
              {reservation.listing?.title || 'Campus Item'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-charcoal-muted">Counterparty</p>
            <p className="text-xs font-semibold text-charcoal">
              {isSeller ? reservation.buyer?.name : reservation.seller?.name}
            </p>
          </div>
        </div>

        {/* Buyer View: Show 6-digit code */}
        {!isSeller && (
          <div className="text-center py-4 space-y-3">
            <div className="inline-flex p-3 bg-primary-surface rounded-full text-primary mb-1">
              <KeyRound className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-semibold text-charcoal">Your Handover Code</h4>
            <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
              Show this one-time code to the seller when meeting in person on campus to verify the handover.
            </p>

            <div className="py-3 px-6 bg-primary-light rounded-xl inline-block border border-primary-border shadow-subtle tracking-widest text-2xl font-mono font-bold text-primary">
              {reservation.handoverCode || '------'}
            </div>

            <p className="text-[11px] text-charcoal-muted flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Do not share this code before physically inspecting the item.
            </p>
          </div>
        )}

        {/* Seller View: Enter 6-digit code from buyer */}
        {isSeller && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3 bg-primary-surface border border-primary-border rounded-card text-xs text-charcoal">
              <p className="font-semibold text-primary mb-0.5">Physical Meetup Verification</p>
              <p className="text-charcoal-muted">
                Ask the buyer for their 6-digit handover code at the campus meetup location to finalize this exchange.
              </p>
            </div>

            {success ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-card text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-semibold text-sm">Handover Verified!</p>
                <p className="text-xs">The exchange has been completed and recorded.</p>
              </div>
            ) : (
              <>
                <FormInput
                  label="Enter Buyer's 6-Digit Handover Code"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 583921"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  helperText="Ask the student receiving the item to show their reservation code."
                />

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-card flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary text-xs"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Complete Handover'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </Modal>
  );
};

export default HandoverModal;

