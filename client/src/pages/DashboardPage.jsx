import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Package,
  CalendarCheck,
  Tag,
  Gift,
  CheckCircle2,
  Bookmark,
  Star,
  Edit,
  Trash2,
  KeyRound,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, timeAgo } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import HandoverModal from '../components/HandoverModal';
import ReviewModal from '../components/ReviewModal';

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'listings';

  // Data states
  const [myListings, setMyListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [offers, setOffers] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    campusHostelOrBlock: user?.campusHostelOrBlock || '',
    avatar: user?.avatar || '',
  });

  // Handover & Review modals
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [isSellerHandover, setIsSellerHandover] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Counter offer response state
  const [counterPriceInput, setCounterPriceInput] = useState('');
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState(null);

  // Sync profileForm with user updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        campusHostelOrBlock: user.campusHostelOrBlock || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // Fetch data depending on active tab
  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      if (activeTab === 'listings' || activeTab === 'donations') {
        const res = await api.get(`/listings?seller=${user._id}`);
        if (res.data.success) setMyListings(res.data.listings || []);
      } else if (activeTab === 'reservations' || activeTab === 'purchases' || activeTab === 'completed') {
        const res = await api.get('/reservations');
        if (res.data.success) setReservations(res.data.reservations || []);
      } else if (activeTab === 'offers') {
        const res = await api.get('/offers');
        if (res.data.success) setOffers(res.data.offers || []);
      } else if (activeTab === 'saved') {
        const res = await api.get('/users/saved-listings');
        if (res.data.success) setSavedListings(res.data.savedListings || []);
      } else if (activeTab === 'reviews') {
        const res = await api.get(`/reviews/user/${user._id}`);
        if (res.data.success) setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard tab:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, user]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', profileForm);
      if (res.data.success) {
        updateUser(res.data.user);
        setEditProfileOpen(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleCancelReservation = async (resvId) => {
    const reason = prompt('Please specify a brief cancellation reason:');
    if (reason !== null) {
      try {
        await api.put(`/reservations/${resvId}/cancel`, { reason });
        alert('Reservation cancelled');
        fetchData();
      } catch (err) {
        alert(err.message || 'Failed to cancel reservation');
      }
    }
  };

  const handleOfferResponse = async (offerId, action, counterPrice = null) => {
    try {
      await api.put(`/offers/${offerId}/respond`, {
        action,
        counterPrice: counterPrice ? Number(counterPrice) : null,
      });
      alert(`Offer ${action}ed`);
      fetchData();
      setSelectedOfferForCounter(null);
    } catch (err) {
      alert(err.message || 'Failed to respond to offer');
    }
  };

  const handleCounterResponse = async (offerId, action) => {
    try {
      await api.put(`/offers/${offerId}/counter-response`, { action });
      alert(`Counter offer ${action}ed`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to respond to counter offer');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header Card */}
      <div className="bg-white border border-charcoal-border rounded-card p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xl overflow-hidden flex-shrink-0 border-2 border-primary/20">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-charcoal">{user?.name}</h1>
              {user?.isVerified ? (
                <span className="badge-verified">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Student
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">{user?.email}</p>
            <p className="text-xs text-charcoal-muted mt-0.5 font-medium">
              Residence: {user?.campusHostelOrBlock || 'Main Campus'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-charcoal-border">
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-charcoal">{user?.ratingAverage?.toFixed(1) || '5.0'}</span>
            <span className="text-charcoal-muted">({user?.ratingCount || 0} reviews)</span>
          </div>

          <button
            onClick={() => setEditProfileOpen(true)}
            className="btn-secondary text-xs"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-charcoal-border">
        <div className="flex gap-2 overflow-x-auto pb-px">
          {[
            { id: 'listings', label: 'My Listings', icon: Package },
            { id: 'reservations', label: 'My Reservations', icon: CalendarCheck },
            { id: 'offers', label: 'My Offers', icon: Tag },
            { id: 'donations', label: 'My Donations', icon: Gift },
            { id: 'completed', label: 'Completed Exchanges', icon: CheckCircle2 },
            { id: 'saved', label: 'Saved Items', icon: Bookmark },
            { id: 'reviews', label: 'Ratings & Reviews', icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-charcoal-muted hover:text-charcoal hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-charcoal">Items Listed by You</h2>
            <Link to="/create-listing" className="btn-primary text-xs">
              + Add New Listing
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-charcoal-muted">Loading your listings...</div>
          ) : myListings.length === 0 ? (
            <EmptyState
              title="You haven't listed any items yet"
              description="Have extra course textbooks or dorm accessories? List them for campus peers."
              actionLabel="Create First Listing"
              actionLink="/create-listing"
            />
          ) : (
            <div className="bg-white border border-charcoal-border rounded-card divide-y divide-charcoal-border overflow-hidden">
              {myListings.map((item) => (
                <div key={item._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                      alt={item.title}
                      className="w-16 h-16 rounded-card object-cover border border-charcoal-border flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={item.status} />
                        <span className="text-[11px] text-charcoal-muted">{item.category}</span>
                      </div>
                      <Link to={`/listings/${item._id}`} className="text-sm font-semibold text-charcoal hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </Link>
                      <p className="text-xs font-bold text-primary mt-0.5">
                        {item.listingType === 'Free Donation' ? 'Free Donation' : formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link to={`/edit-listing/${item._id}`} className="btn-secondary text-xs py-1.5 px-2.5">
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Link>
                    <Link to={`/listings/${item._id}`} className="btn-secondary text-xs py-1.5 px-2.5">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MY RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-charcoal">Campus Reservations & Pickups</h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-charcoal-muted">Loading reservations...</div>
          ) : reservations.length === 0 ? (
            <EmptyState
              title="No active reservations"
              description="When you reserve an item on campus, your pickup details and secure handover code will appear here."
              actionLabel="Explore Marketplace"
              actionLink="/marketplace"
            />
          ) : (
            <div className="space-y-4">
              {reservations.map((resv) => {
                const isBuyer = resv.buyer?._id === user._id;
                const otherParty = isBuyer ? resv.seller : resv.buyer;
                return (
                  <div key={resv._id} className="bg-white border border-charcoal-border rounded-card p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-charcoal-border">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={resv.status} />
                        <span className="text-xs font-semibold text-charcoal">
                          {isBuyer ? 'You are reserving from:' : 'Reserved by student:'}{' '}
                          <span className="text-primary">{otherParty?.name}</span>
                        </span>
                      </div>
                      <span className="text-xs text-charcoal-muted">
                        Pickup: {formatDate(resv.pickupTime)}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <Link to={`/listings/${resv.listing?._id}`} className="text-sm font-bold text-charcoal hover:text-primary transition-colors">
                          {resv.listing?.title}
                        </Link>
                        <p className="text-xs text-charcoal-muted mt-1">
                          Location: <strong>{resv.pickupLocation}</strong>
                        </p>
                        {resv.note && (
                          <p className="text-xs text-charcoal-muted italic mt-0.5">Note: "{resv.note}"</p>
                        )}
                      </div>

                      {/* Code or Verification Action */}
                      <div className="flex items-center gap-3">
                        {isBuyer && resv.status === 'Confirmed' && (
                          <div className="p-2.5 bg-primary-light border border-primary-border rounded-card text-center">
                            <span className="text-[10px] uppercase font-bold text-primary block">
                              Handover Code
                            </span>
                            <span className="text-base font-mono font-extrabold text-primary tracking-wider">
                              {resv.handoverCode || 'VIEW'}
                            </span>
                          </div>
                        )}

                        {!isBuyer && resv.status === 'Confirmed' && (
                          <button
                            onClick={() => {
                              setSelectedReservation(resv);
                              setIsSellerHandover(true);
                              setHandoverModalOpen(true);
                            }}
                            className="btn-primary text-xs py-2 px-3"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-1" /> Verify Handover
                          </button>
                        )}

                        {resv.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCancelReservation(resv._id)}
                            className="btn-secondary text-xs py-2 text-rose-600 hover:bg-rose-50"
                          >
                            Cancel
                          </button>
                        )}

                        {resv.status === 'Completed' && (
                          <button
                            onClick={() => {
                              setSelectedReservation(resv);
                              setReviewModalOpen(true);
                            }}
                            className="btn-primary text-xs py-2"
                          >
                            <Star className="w-3.5 h-3.5 mr-1 fill-white" /> Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: OFFERS */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-charcoal">Item Offers & Proposals</h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-charcoal-muted">Loading offers...</div>
          ) : offers.length === 0 ? (
            <EmptyState
              title="No offers yet"
              description="Make an offer on marketplace listings or wait for peers to send offers on yours."
              actionLabel="Explore Marketplace"
              actionLink="/marketplace"
            />
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => {
                const isSeller = offer.seller?._id === user._id;
                return (
                  <div key={offer._id} className="bg-white border border-charcoal-border rounded-card p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-charcoal-border">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={offer.status} />
                        <span className="text-xs text-charcoal font-semibold">
                          {isSeller ? `Offer from ${offer.buyer?.name}` : `Sent to ${offer.seller?.name}`}
                        </span>
                      </div>
                      <span className="text-[11px] text-charcoal-muted">{timeAgo(offer.createdAt)}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <Link to={`/listings/${offer.listing?._id}`} className="text-sm font-bold text-charcoal hover:text-primary transition-colors">
                          {offer.listing?.title}
                        </Link>
                        <p className="text-xs text-charcoal mt-1">
                          {offer.offerType === 'Item Exchange' ? (
                            <span className="text-blue-700 font-medium">Exchange: {offer.exchangeItemDescription}</span>
                          ) : (
                            <span>Offered: <strong className="text-primary">{formatCurrency(offer.offeredPrice)}</strong></span>
                          )}
                        </p>
                        {offer.message && (
                          <p className="text-xs text-charcoal-muted italic mt-0.5">"{offer.message}"</p>
                        )}
                        {offer.status === 'Countered' && (
                          <p className="text-xs text-purple-700 font-semibold mt-1">
                            Counter Offer: {formatCurrency(offer.counterPrice)}
                          </p>
                        )}
                      </div>

                      {/* Offer Response Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isSeller && offer.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleOfferResponse(offer._id, 'accept')}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => setSelectedOfferForCounter(offer)}
                              className="btn-secondary text-xs py-1.5 px-3"
                            >
                              Counter
                            </button>
                            <button
                              onClick={() => handleOfferResponse(offer._id, 'reject')}
                              className="btn-secondary text-xs py-1.5 px-3 text-rose-600"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {!isSeller && offer.status === 'Countered' && (
                          <>
                            <button
                              onClick={() => handleCounterResponse(offer._id, 'accept')}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              Accept Counter ({formatCurrency(offer.counterPrice)})
                            </button>
                            <button
                              onClick={() => handleCounterResponse(offer._id, 'reject')}
                              className="btn-secondary text-xs py-1.5 px-3 text-rose-600"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DONATIONS */}
      {activeTab === 'donations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-charcoal">Your Free Student Donations</h2>
            <Link to="/create-listing" className="btn-primary text-xs">
              + Donate an Item
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-charcoal-muted">Loading donations...</div>
          ) : (
            <div className="space-y-4">
              {myListings.filter((i) => i.listingType === 'Free Donation').length === 0 ? (
                <EmptyState
                  icon={Gift}
                  title="No free donations yet"
                  description="Give a classmate a helping hand by listing textbooks or hostel essentials for free."
                  actionLabel="Donate an Item"
                  actionLink="/create-listing"
                />
              ) : (
                myListings
                  .filter((i) => i.listingType === 'Free Donation')
                  .map((item) => (
                    <div key={item._id} className="p-4 bg-white border border-charcoal-border rounded-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                          alt=""
                          className="w-14 h-14 rounded-card object-cover"
                        />
                        <div>
                          <StatusBadge status={item.status} />
                          <Link to={`/listings/${item._id}`} className="text-sm font-semibold text-charcoal block mt-1 hover:text-primary">
                            {item.title}
                          </Link>
                          <span className="text-xs text-emerald-700 font-medium">Free Donation</span>
                        </div>
                      </div>
                      <Link to={`/listings/${item._id}`} className="btn-secondary text-xs">
                        View Item
                      </Link>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: COMPLETED EXCHANGES */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-charcoal">Completed Campus Exchanges</h2>
          {loading ? (
            <div className="p-8 text-center text-xs text-charcoal-muted">Loading history...</div>
          ) : (
            <div className="space-y-4">
              {reservations.filter((r) => r.status === 'Completed').length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="No completed exchanges yet"
                  description="Items where physical in-person handover was verified will appear here in your audit history."
                />
              ) : (
                reservations
                  .filter((r) => r.status === 'Completed')
                  .map((resv) => (
                    <div key={resv._id} className="p-4 bg-white border border-charcoal-border rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Handover Verified
                        </span>
                        <h4 className="text-sm font-semibold text-charcoal">{resv.listing?.title}</h4>
                        <p className="text-xs text-charcoal-muted">
                          Exchange with {resv.buyer?._id === user._id ? resv.seller?.name : resv.buyer?.name} on {formatDate(resv.handoverCompletedAt || resv.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReservation(resv);
                          setReviewModalOpen(true);
                        }}
                        className="btn-secondary text-xs"
                      >
                        <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" />
                        Write / View Review
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED ITEMS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-charcoal">Your Saved Favorites</h2>
          {loading ? (
            <div className="p-8 text-center text-xs text-charcoal-muted">Loading favorites...</div>
          ) : savedListings.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved items"
              description="Click the heart icon on any listing to save it for quick reference."
              actionLabel="Explore Marketplace"
              actionLink="/marketplace"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {savedListings.map((item) => (
                <div key={item._id} className="bg-white border border-charcoal-border rounded-card p-4 space-y-2">
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                    alt={item.title}
                    className="w-full h-36 object-cover rounded-card"
                  />
                  <StatusBadge status={item.status} />
                  <Link to={`/listings/${item._id}`} className="text-sm font-bold text-charcoal block line-clamp-1 hover:text-primary">
                    {item.title}
                  </Link>
                  <p className="text-xs font-bold text-primary">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-charcoal">Campus Peer Reviews</h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{user?.ratingAverage?.toFixed(1) || '5.0'} / 5.0</span>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-charcoal-muted">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Reviews are submitted by peers after verified in-person handovers on campus."
            />
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 bg-white border border-charcoal-border rounded-card space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-xs flex items-center justify-center">
                        {rev.reviewer?.name?.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-charcoal">{rev.reviewer?.name}</span>
                      <span className="text-[11px] text-charcoal-muted">({rev.listing?.title})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-charcoal-muted leading-relaxed">"{rev.comment}"</p>
                  <span className="text-[10px] text-charcoal-muted block">{formatDate(rev.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Edit Modal */}
      <Modal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            required
          />
          <FormInput
            label="Campus Hostel / Residence"
            value={profileForm.campusHostelOrBlock}
            onChange={(e) => setProfileForm({ ...profileForm, campusHostelOrBlock: e.target.value })}
            placeholder="e.g. Hostel 14, Room 402"
          />
          <FormInput
            label="Phone Number (for meetup coordination)"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
          <FormInput
            label="Avatar Image URL"
            value={profileForm.avatar}
            onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
            placeholder="https://..."
          />
          <FormInput
            label="Bio (Brief campus introduction)"
            type="textarea"
            rows={2}
            value={profileForm.bio}
            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            placeholder="e.g. 3rd year CS student. Keen on zero waste campus reuse."
          />
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setEditProfileOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Seller Handover Modal */}
      {selectedReservation && (
        <HandoverModal
          isOpen={handoverModalOpen}
          onClose={() => {
            setHandoverModalOpen(false);
            setSelectedReservation(null);
          }}
          reservation={selectedReservation}
          isSeller={isSellerHandover}
          onHandoverSuccess={() => {
            fetchData();
          }}
        />
      )}

      {/* Review Modal */}
      {selectedReservation && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedReservation(null);
          }}
          reservation={selectedReservation}
          onReviewSuccess={() => {
            fetchData();
          }}
        />
      )}

      {/* Counter Offer Modal */}
      {selectedOfferForCounter && (
        <Modal
          isOpen={!!selectedOfferForCounter}
          onClose={() => setSelectedOfferForCounter(null)}
          title="Submit Counter Offer"
        >
          <div className="space-y-4">
            <p className="text-xs text-charcoal-muted">
              Current offer on "{selectedOfferForCounter.listing?.title}": <strong>{formatCurrency(selectedOfferForCounter.offeredPrice)}</strong>
            </p>
            <FormInput
              label="Counter Price (₹)"
              type="number"
              placeholder="e.g. 400"
              value={counterPriceInput}
              onChange={(e) => setCounterPriceInput(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOfferForCounter(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleOfferResponse(selectedOfferForCounter._id, 'counter', counterPriceInput)}
                className="btn-primary text-xs"
              >
                Send Counter Offer
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default DashboardPage;

