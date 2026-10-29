import React, { useState } from 'react';
import Modal from './Modal';
import FormInput from './FormInput';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const MakeOfferModal = ({ isOpen, onClose, listing, onOfferSuccess }) => {
  const [offerType, setOfferType] = useState('Price Offer');
  const [offeredPrice, setOfferedPrice] = useState(listing ? listing.price : '');
  const [exchangeItemDescription, setExchangeItemDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (offerType === 'Price Offer') {
      if (!offeredPrice || Number(offeredPrice) <= 0) {
        setError('Please enter a valid offer amount');
        return;
      }
    } else if (offerType === 'Item Exchange') {
      if (!exchangeItemDescription.trim()) {
        setError('Please specify the item you are offering in exchange');
        return;
      }
    }

    try {
      setLoading(true);
      const res = await api.post('/offers', {
        listingId: listing._id,
        offerType,
        offeredPrice: offerType === 'Price Offer' ? Number(offeredPrice) : 0,
        exchangeItemDescription,
        message,
      });

      if (onOfferSuccess) onOfferSuccess(res.data.offer);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Make an Offer / Propose Exchange">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item summary */}
        <div className="p-3 bg-charcoal-light rounded-card flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs text-charcoal-muted font-medium">Listing</p>
            <p className="text-sm font-semibold text-charcoal truncate">{listing.title}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-charcoal-muted">Listed Price</p>
            <p className="text-sm font-bold text-primary">{formatCurrency(listing.price)}</p>
          </div>
        </div>

        {/* Offer Type selector */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1.5">Offer Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOfferType('Price Offer')}
              className={`py-2 text-xs font-medium rounded-card border transition-all ${
                offerType === 'Price Offer'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-charcoal border-charcoal-border hover:bg-charcoal-light'
              }`}
            >
              Cash Offer (₹)
            </button>
            <button
              type="button"
              onClick={() => setOfferType('Item Exchange')}
              className={`py-2 text-xs font-medium rounded-card border transition-all ${
                offerType === 'Item Exchange'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-charcoal border-charcoal-border hover:bg-charcoal-light'
              }`}
            >
              Item Exchange
            </button>
          </div>
        </div>

        {offerType === 'Price Offer' ? (
          <FormInput
            label="Your Offered Price (₹)"
            type="number"
            min="1"
            placeholder="e.g. 350"
            value={offeredPrice}
            onChange={(e) => setOfferedPrice(e.target.value)}
            required
            helperText="Enter a realistic amount in INR"
          />
        ) : (
          <FormInput
            label="What item are you proposing to exchange?"
            type="textarea"
            rows={3}
            placeholder="e.g. Offering my Calculus Stewart 8th Ed or an adjustable desk lamp in exchange..."
            value={exchangeItemDescription}
            onChange={(e) => setExchangeItemDescription(e.target.value)}
            required
          />
        )}

        <FormInput
          label="Optional Message for Seller"
          type="textarea"
          rows={2}
          placeholder="e.g. I can pick it up tomorrow after 4 PM at the library..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
            {loading ? 'Submitting...' : 'Send Offer to Seller'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MakeOfferModal;

