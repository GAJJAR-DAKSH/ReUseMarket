import React, { useState } from 'react';
import { Calendar, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import FormInput from './FormInput';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const ReserveModal = ({ isOpen, onClose, listing, onReserveSuccess }) => {
  // Default to tomorrow 4:00 PM
  const defaultPickup = new Date();
  defaultPickup.setDate(defaultPickup.getDate() + 1);
  defaultPickup.setHours(16, 0, 0, 0);
  const formattedDefault = defaultPickup.toISOString().slice(0, 16);

  const [pickupTime, setPickupTime] = useState(formattedDefault);
  const [pickupLocation, setPickupLocation] = useState(listing ? listing.pickupLocation : '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!pickupTime) {
      setError('Please select a pickup date and time');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/reservations', {
        listingId: listing._id,
        pickupTime: new Date(pickupTime).toISOString(),
        pickupLocation: pickupLocation || listing.pickupLocation,
        note,
      });

      if (onReserveSuccess) onReserveSuccess(res.data.reservation);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to complete reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reserve Item for Campus Pickup">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item summary */}
        <div className="p-3 bg-charcoal-light rounded-card flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs text-charcoal-muted font-medium">Item</p>
            <p className="text-sm font-semibold text-charcoal truncate">{listing.title}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-charcoal-muted">Price</p>
            <p className="text-sm font-bold text-primary">
              {listing.listingType === 'Free Donation' ? 'Free' : formatCurrency(listing.price)}
            </p>
          </div>
        </div>

        {/* Security / Handover info banner */}
        <div className="p-3 bg-primary-surface border border-primary-border rounded-card flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs text-charcoal">
            <p className="font-semibold text-primary mb-0.5">Secure Handover Code</p>
            <p className="text-charcoal-muted">
              Once reserved, you will receive a private 6-digit verification code. Show this code to the seller in person at pickup to verify the exchange.
            </p>
          </div>
        </div>

        <FormInput
          label="Pickup Date & Estimated Time"
          type="datetime-local"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
          helperText="Reservations are held for up to 48 hours."
        />

        <FormInput
          label="Pickup Location on Campus"
          type="text"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          placeholder="e.g. Central Library Reception or Hostel 7 Lawn"
          helperText="Default set to seller's preferred campus spot."
        />

        <FormInput
          label="Notes for Pickup (Optional)"
          type="textarea"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. I will be wearing a blue jacket / Call me when you reach gate 2"
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
            {loading ? 'Reserving...' : 'Confirm Campus Reservation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReserveModal;

