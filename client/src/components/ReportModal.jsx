import React, { useState } from 'react';
import { Flag, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import FormInput from './FormInput';
import api from '../services/api';

const REPORT_REASONS = [
  'Inappropriate Content',
  'Prohibited Campus Item',
  'Spam / Scam',
  'Misleading Information',
  'Harassment',
  'Failed Handover / Fraud',
  'Other'
];

const ReportModal = ({ isOpen, onClose, listingId, userId, reviewId, title = 'Report to Campus Moderation' }) => {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await api.post('/reports', {
        listingId,
        userId,
        reviewId,
        reason,
        details,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {submitted ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="text-sm font-semibold text-charcoal">Report Submitted</h4>
          <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
            Our campus moderation team will review this listing shortly. Thank you for maintaining campus trust.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-charcoal-muted">
            Reports are strictly confidential and reviewed by authorized campus administrators.
          </p>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Reason for Report <span className="text-rose-600">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-card border border-charcoal-border bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label="Additional Details (Optional)"
            type="textarea"
            rows={3}
            placeholder="Please provide any helpful context regarding why this item or user violates campus reuse guidelines..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-card">
              {error}
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
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-card bg-rose-600 text-white font-medium text-xs hover:bg-rose-700 transition-colors"
              disabled={loading}
            >
              <Flag className="w-3.5 h-3.5" />
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ReportModal;

