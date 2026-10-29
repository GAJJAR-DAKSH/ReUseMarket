import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, CheckCircle2, ArrowLeftRight, Gift } from 'lucide-react';
import { formatCurrency, timeAgo } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProductCard = ({ listing, onSaveToggle }) => {
  const { user, isAuthenticated } = useAuth();
  const isSavedInitial = user?.savedListings?.some(
    (id) => (typeof id === 'string' ? id : id._id) === listing._id
  );
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please sign in with your college account to save listings.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.post(`/users/save-listing/${listing._id}`);
      setIsSaved(res.data.saved);
      if (onSaveToggle) onSaveToggle(listing._id, res.data.saved);
    } catch (err) {
      console.error('Failed to toggle save:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const mainImage =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group bg-white border border-charcoal-border rounded-card overflow-hidden hover:border-gray-400/70 hover:shadow-card transition-all duration-200 flex flex-col h-full"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={mainImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Badges on image */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className="badge-category text-[11px] backdrop-blur-sm bg-white/90 shadow-sm">
            {listing.category}
          </span>
          {listing.listingType === 'Free Donation' && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-700 text-white shadow-sm">
              <Gift className="w-3 h-3" />
              Donation
            </span>
          )}
          {listing.listingType === 'Exchange' && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-700 text-white shadow-sm">
              <ArrowLeftRight className="w-3 h-3" />
              Exchange
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 text-charcoal hover:bg-white hover:text-rose-600'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save listing'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Reserved badge if status is Reserved */}
        {listing.status === 'Reserved' && (
          <div className="absolute bottom-2 left-2.5 bg-amber-500 text-white text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-sm shadow-sm">
            Reserved
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-charcoal-muted">
              {listing.condition}
            </span>
            <span className="text-xs text-charcoal-muted">
              {timeAgo(listing.createdAt)}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-charcoal line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center gap-1 text-xs text-charcoal-muted mt-2 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span className="truncate">{listing.pickupLocation}</span>
          </div>
        </div>

        {/* Footer info: Price & Seller */}
        <div className="pt-3 mt-3 border-t border-charcoal-border flex items-center justify-between">
          <div className="text-base font-bold text-charcoal">
            {listing.listingType === 'Free Donation' ? (
              <span className="text-emerald-700 text-sm font-semibold">Free</span>
            ) : listing.listingType === 'Exchange' ? (
              <span className="text-blue-700 text-sm font-semibold">Exchange</span>
            ) : (
              formatCurrency(listing.price)
            )}
          </div>

          {listing.seller && (
            <div className="flex items-center gap-1 text-xs text-charcoal font-medium">
              <span className="truncate max-w-[100px]">{listing.seller.name}</span>
              {listing.seller.isVerified && (
                <CheckCircle2
                  className="w-3.5 h-3.5 text-primary flex-shrink-0"
                  title="Verified Student"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
