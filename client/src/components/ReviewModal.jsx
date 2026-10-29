import React, { useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import FormInput from './FormInput';
import api from '../services/api';

const ReviewModal = ({ isOpen, onClose, reservation, onReviewSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!reservation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Please provide feedback on your exchange experience');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/reviews', {
        reservationId: reservation._id,
        rating,
        comment,
      });

      setSubmitted(true);
      if (onReviewSuccess) onReviewSuccess(res.data.review);
      setTimeout(() => {
        setSubmitted(false);
        setComment('');
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate & Review Campus Exchange">
      {submitted ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="text-sm font-semibold text-charcoal">Review Published!</h4>
          <p className="text-xs text-charcoal-muted">
            Thank you for helping keep our campus marketplace trustworthy.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-charcoal-light rounded-card flex items-center justify-between text-xs">
            <div className="truncate mr-2">
              <span className="text-charcoal-muted block">Exchange Item</span>
              <span className="font-semibold text-charcoal truncate">
                {reservation.listing?.title || 'Campus Item'}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-charcoal-muted block">Counterparty</span>
              <span className="font-semibold text-charcoal">
                {reservation.seller?.name || reservation.buyer?.name}
              </span>
            </div>
          </div>

          {/* Star selector */}
          <div className="text-center py-2 space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal">
              How was your exchange experience?
            </label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-primary">
              {rating === 5
                ? 'Outstanding exchange'
                : rating === 4
                ? 'Great experience'
                : rating === 3
                ? 'Satisfactory'
                : rating === 2
                ? 'Below average'
                : 'Poor experience'}
            </p>
          </div>

          <FormInput
            label="Written Review"
            type="textarea"
            rows={3}
            placeholder="Share details on punctuality, item condition, communication, and overall handover experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
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
            <button type="submit" className="btn-primary text-xs" disabled={loading}>
              {loading ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ReviewModal;

