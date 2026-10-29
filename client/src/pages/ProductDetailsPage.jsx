import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  Star,
  ShieldCheck,
  Tag,
  KeyRound,
  ArrowLeftRight,
  Gift,
  Share2,
  Flag,
  Heart,
  Phone,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, timeAgo } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import MakeOfferModal from '../components/MakeOfferModal';
import ReserveModal from '../components/ReserveModal';
import ReportModal from '../components/ReportModal';
import ProductCard from '../components/ProductCard';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [relatedListings, setRelatedListings] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Active reservation if current user is buyer
  const [userActiveReservation, setUserActiveReservation] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/listings/${id}`);
        if (res.data.success) {
          setListing(res.data.listing);
          setRelatedListings(res.data.relatedListings || []);
        }

        // If authenticated, check if user has an active reservation for this listing
        if (isAuthenticated) {
          try {
            const resvRes = await api.get('/reservations?role=buyer');
            if (resvRes.data.success) {
              const active = resvRes.data.reservations.find(
                (r) =>
                  r.listing?._id === id &&
                  ['Pending', 'Confirmed'].includes(r.status)
              );
              if (active) setUserActiveReservation(active);
            }
          } catch (rErr) {
            // Ignore reservation query error
          }
        }
      } catch (err) {
        setError(err.message || 'Listing not found');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-charcoal-muted">Loading item details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-charcoal-border rounded-card text-center space-y-4">
        <h2 className="text-base font-semibold text-charcoal">Listing Not Found</h2>
        <p className="text-xs text-charcoal-muted">{error || 'This campus listing may have been removed or sold.'}</p>
        <Link to="/marketplace" className="btn-primary text-xs">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && listing.seller && user._id === listing.seller._id;
  const isAvailable = listing.status === 'Available';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out ${listing.title} on ReUseMarket:`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDeleteListing = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/listings/${listing._id}`);
        alert('Listing deleted successfully');
        navigate('/dashboard?tab=listings');
      } catch (err) {
        alert(err.message || 'Failed to delete listing');
      }
    }
  };

  const handleMarkSold = async () => {
    try {
      await api.put(`/listings/${listing._id}`, { status: 'Sold' });
      setListing((prev) => ({ ...prev, status: 'Sold' }));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-charcoal-muted">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
        <span>/</span>
        <Link
          to={`/marketplace?category=${encodeURIComponent(listing.category)}`}
          className="hover:text-primary"
        >
          {listing.category}
        </Link>
        <span>/</span>
        <span className="text-charcoal font-medium truncate max-w-[200px]">{listing.title}</span>
      </nav>

      {/* Handover Code banner if reserved by current user */}
      {userActiveReservation && (
        <div className="p-4 bg-primary-surface border-2 border-primary rounded-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">You have an active reservation for this item</h3>
              <p className="text-xs text-charcoal-muted">
                Show this 6-digit code to {listing.seller?.name} when meeting on campus for handover:
              </p>
            </div>
          </div>
          <div className="py-2 px-5 bg-white border border-primary-border rounded-xl text-xl font-mono font-extrabold text-primary tracking-widest shadow-subtle">
            {userActiveReservation.handoverCode || 'CONFIRMED'}
          </div>
        </div>
      )}

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main display image */}
          <div className="relative aspect-[4/3] bg-gray-100 rounded-card overflow-hidden border border-charcoal-border">
            <img
              src={images[activeImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <StatusBadge status={listing.status} size="md" />
            </div>
          </div>

          {/* Thumbnail list (if multiple images) */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-card overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-charcoal-border hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Detailed Item Description */}
          <div className="bg-white border border-charcoal-border rounded-card p-6 space-y-3 mt-6">
            <h3 className="text-sm font-bold text-charcoal">Item Description</h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>

            {listing.exchangePreferences && (
              <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-card">
                <span className="text-xs font-semibold text-blue-900 block mb-1">
                  Exchange Preferences:
                </span>
                <p className="text-xs text-blue-800">{listing.exchangePreferences}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Listing Details & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-charcoal-border rounded-card p-6 space-y-5">
            {/* Category & Condition tags */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge-category">{listing.category}</span>
                <span className="text-xs font-medium text-charcoal-muted border-l border-charcoal-border pl-2">
                  Condition: <strong className="text-charcoal">{listing.condition}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted">
                <button onClick={handleShare} className="p-1.5 hover:text-charcoal rounded-full" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="p-1.5 hover:text-rose-600 rounded-full"
                  title="Report Listing"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal leading-snug">
              {listing.title}
            </h1>

            {/* Price section */}
            <div className="py-3 px-4 bg-charcoal-light rounded-card flex items-baseline justify-between">
              <div>
                <p className="text-[11px] text-charcoal-muted font-medium uppercase tracking-wider">
                  Price
                </p>
                <div className="text-2xl font-extrabold text-charcoal">
                  {listing.listingType === 'Free Donation' ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <Gift className="w-5 h-5" /> Free Donation
                    </span>
                  ) : listing.listingType === 'Exchange' ? (
                    <span className="text-blue-700 flex items-center gap-1.5">
                      <ArrowLeftRight className="w-5 h-5" /> Open to Exchange
                    </span>
                  ) : (
                    formatCurrency(listing.price)
                  )}
                </div>
              </div>
              <span className="text-xs text-charcoal-muted">
                Posted {timeAgo(listing.createdAt)}
              </span>
            </div>

            {/* Campus Pickup Spot */}
            <div className="flex items-start gap-2.5 text-xs text-charcoal p-3 border border-charcoal-border rounded-card">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-charcoal">Campus Pickup Location</span>
                <span className="text-charcoal-muted">{listing.pickupLocation}</span>
              </div>
            </div>

            {/* Action Buttons for non-owners */}
            {!isOwner ? (
              <div className="space-y-2.5 pt-2">
                {isAvailable ? (
                  <>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) return navigate('/login');
                        setReserveModalOpen(true);
                      }}
                      className="btn-primary w-full text-sm py-3"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Reserve Item for Campus Pickup
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (!isAuthenticated) return navigate('/login');
                          setOfferModalOpen(true);
                        }}
                        className="btn-secondary text-xs py-2.5"
                      >
                        Make an Offer / Exchange
                      </button>
                      <button
                        onClick={() => setContactModalOpen(true)}
                        className="btn-secondary text-xs py-2.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Contact Seller
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-gray-50 border border-charcoal-border rounded-card text-center text-xs text-charcoal-muted">
                    This item is currently <strong>{listing.status.toLowerCase()}</strong> and not available for new reservations.
                  </div>
                )}
              </div>
            ) : (
              /* Seller's Own Listing Controls */
              <div className="p-4 bg-primary-surface border border-primary-border rounded-card space-y-3">
                <p className="text-xs font-semibold text-primary">You are the seller of this listing</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    to={`/edit-listing/${listing._id}`}
                    className="btn-secondary text-xs py-2"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit Listing
                  </Link>
                  {listing.status === 'Available' && (
                    <button onClick={handleMarkSold} className="btn-secondary text-xs py-2">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Mark as Sold
                    </button>
                  )}
                  <button
                    onClick={handleDeleteListing}
                    className="col-span-2 inline-flex items-center justify-center text-xs py-2 rounded-card text-rose-600 hover:bg-rose-50 border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Listing
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seller Card */}
          {listing.seller && (
            <div className="bg-white border border-charcoal-border rounded-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                Seller Information
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
                  {listing.seller.avatar ? (
                    <img src={listing.seller.avatar} alt={listing.seller.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{listing.seller.name.charAt(0)}</span>
                  )}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-charcoal truncate">{listing.seller.name}</span>
                    {listing.seller.isVerified && (
                      <span className="badge-verified text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-primary" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted truncate">
                    {listing.seller.campusHostelOrBlock || 'Campus Student'}
                  </p>
                </div>
              </div>

              {/* Rating summary */}
              <div className="pt-3 border-t border-charcoal-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-charcoal font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{listing.seller.ratingAverage ? listing.seller.ratingAverage.toFixed(1) : '5.0'}</span>
                  <span className="text-charcoal-muted font-normal">
                    ({listing.seller.ratingCount || 0} campus review{listing.seller.ratingCount === 1 ? '' : 's'})
                  </span>
                </div>
                <span className="text-charcoal-muted text-[11px]">
                  Joined {formatDate(listing.seller.createdAt)}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Related Products Section */}
      {relatedListings.length > 0 && (
        <section className="pt-8 border-t border-charcoal-border">
          <h2 className="text-base sm:text-lg font-bold text-charcoal mb-4">
            Similar in {listing.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {relatedListings.map((rel) => (
              <ProductCard key={rel._id} listing={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <MakeOfferModal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        listing={listing}
        onOfferSuccess={(offer) => {
          alert('Offer submitted to seller! You can monitor responses in your dashboard.');
        }}
      />

      <ReserveModal
        isOpen={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        listing={listing}
        onReserveSuccess={(reservation) => {
          setUserActiveReservation(reservation);
          setListing((prev) => ({ ...prev, status: 'Reserved' }));
        }}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        listingId={listing._id}
      />

      {/* Contact Seller Info Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
          <div className="bg-white rounded-card border border-charcoal-border p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-charcoal">Contact {listing.seller?.name}</h3>
            <p className="text-xs text-charcoal-muted">
              Connect directly with the seller to coordinate questions or check item details before pickup.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-charcoal-light rounded-card flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="truncate">{listing.seller?.email}</span>
              </div>
              {listing.seller?.phone && (
                <div className="p-3 bg-charcoal-light rounded-card flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{listing.seller?.phone}</span>
                </div>
              )}
              <div className="p-3 bg-charcoal-light rounded-card flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Preferred Meetup: {listing.pickupLocation}</span>
              </div>
            </div>
            <button
              onClick={() => setContactModalOpen(false)}
              className="btn-primary w-full text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailsPage;

