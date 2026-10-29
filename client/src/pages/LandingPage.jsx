import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  BookOpen,
  Laptop,
  Home,
  Armchair,
  Shirt,
  PenTool,
  Bike,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  KeyRound,
  Leaf,
  Users,
  Repeat
} from 'lucide-react';
import api from '../services/api';
import ProductGrid from '../components/ProductGrid';
import { CATEGORIES } from '../utils/formatters';

const categoryIcons = {
  'Books & Notes': BookOpen,
  'Electronics': Laptop,
  'Hostel Essentials': Home,
  'Furniture': Armchair,
  'Clothing': Shirt,
  'Stationery': PenTool,
  'Sports Equipment': Bike,
  'Other': Sparkles,
};

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const [featuredRes, recentRes, analyticsRes] = await Promise.all([
          api.get('/listings?limit=4&sort=popular'),
          api.get('/listings?limit=4&sort=newest'),
          api.get('/analytics')
        ]);

        if (featuredRes.data.success) {
          setFeaturedListings(featuredRes.data.listings || []);
        }
        if (recentRes.data.success) {
          setRecentListings(recentRes.data.listings || []);
        }
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data);
        }
      } catch (err) {
        console.error('Failed to load landing page data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-8 text-center max-w-4xl mx-auto px-4">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light border border-primary-border text-primary text-xs font-semibold tracking-wide uppercase mb-6">
          <Leaf className="w-3.5 h-3.5" />
          University Circular Economy Platform
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-charcoal leading-tight sm:leading-tight mb-4">
          Give your campus essentials a <span className="text-primary underline decoration-primary/30 underline-offset-4">second life.</span>
        </h1>

        <p className="text-sm sm:text-base text-charcoal-muted max-w-2xl mx-auto leading-relaxed mb-8">
          A secure, university-only marketplace where students sell, donate, reserve, and exchange pre-loved textbooks, lab equipment, cycles, and hostel gear directly on campus.
        </p>

        {/* Hero Search Box */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-6">
          <div className="relative flex items-center bg-white border border-charcoal-border rounded-card p-1.5 shadow-card hover:border-primary/50 transition-all">
            <Search className="w-5 h-5 text-charcoal-muted ml-2.5 mr-2" />
            <input
              type="text"
              placeholder="What are you looking for? (e.g. calculator, physics notes, study chair)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm text-charcoal placeholder-charcoal-subtle focus:outline-none bg-transparent"
            />
            <button type="submit" className="btn-primary text-xs py-2 px-4 flex-shrink-0">
              Search
            </button>
          </div>
        </form>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/marketplace" className="btn-primary text-xs sm:text-sm px-5 py-2.5">
            Explore Marketplace
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
          <Link to="/create-listing" className="btn-secondary text-xs sm:text-sm px-5 py-2.5">
            List an Item
          </Link>
        </div>

        {/* Fast assurance tags */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Verified Student IDs Only</span>
          </div>
          <div className="flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-primary" />
            <span>Secure In-Person Handover</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-primary" />
            <span>Zero Platform Fees</span>
          </div>
        </div>
      </section>

      {/* Category Shortcuts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-charcoal">Browse by Category</h2>
            <p className="text-xs text-charcoal-muted">Everything students need from semester start to graduation</p>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            All categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat] || Sparkles;
            return (
              <Link
                key={cat}
                to={`/marketplace?category=${encodeURIComponent(cat)}`}
                className="group p-3.5 bg-white border border-charcoal-border rounded-card flex flex-col items-center text-center hover:border-primary hover:shadow-subtle transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-charcoal-light group-hover:bg-primary-light group-hover:text-primary transition-colors flex items-center justify-center text-charcoal mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-charcoal group-hover:text-primary transition-colors line-clamp-1">
                  {cat}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-charcoal">Featured Campus Listings</h2>
            <p className="text-xs text-charcoal-muted">Popular essentials with active interest from peers</p>
          </div>
          <Link
            to="/marketplace?sort=popular"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View more <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid
          listings={featuredListings}
          loading={loading}
          emptyTitle="No featured items yet"
          emptyDescription="Be the first to list a student essential on campus."
        />
      </section>

      {/* How It Works Section */}
      <section className="bg-white border-y border-charcoal-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-2">
              How Campus Reuse Works
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              Simple, verified, and completely local. No couriers, no commission, no sketchy strangers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 bg-[#F8F9F6] border border-charcoal-border rounded-card text-left space-y-3">
              <div className="w-10 h-10 rounded-card bg-primary text-white flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-semibold text-charcoal">List or Browse</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Snap photos of textbooks, hostel gear, or electronics you no longer need. Set a fair student price, offer it for free donation, or propose an exchange.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-[#F8F9F6] border border-charcoal-border rounded-card text-left space-y-3">
              <div className="w-10 h-10 rounded-card bg-primary text-white flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-semibold text-charcoal">Make an Offer & Reserve</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Send a monetary offer or exchange proposal. When agreed, reserve the item for an in-person campus pickup window to prevent double-booking.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-[#F8F9F6] border border-charcoal-border rounded-card text-left space-y-3">
              <div className="w-10 h-10 rounded-card bg-primary text-white flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-semibold text-charcoal">Secure Handover Code</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Meet at the campus library, hostel, or student center. Inspect the item, then exchange your 6-digit one-time verification code to complete the transfer and leave a verified review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-charcoal">Recently Added Items</h2>
            <p className="text-xs text-charcoal-muted">Fresh listings posted by fellow students this week</p>
          </div>
          <Link
            to="/marketplace?sort=newest"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Browse all recent <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid
          listings={recentListings}
          loading={loading}
          emptyTitle="No recent listings"
          emptyDescription="Check back soon for new student essentials."
        />
      </section>

      {/* Sustainability Impact Metric Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary-light mb-2">
              <Leaf className="w-4 h-4 text-emerald-300" />
              Real Campus Sustainability Impact
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Every reused book and chair keeps our campus green.
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed mb-8">
              By circulating items within our university community, we prevent landfill waste, lower collegiate carbon footprints, and save students thousands in semester expenses.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-white/20">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {analytics?.environmentalImpact?.kgCo2Saved || 185} <span className="text-sm font-normal">kg</span>
                </p>
                <p className="text-[11px] text-gray-300">CO2 Emissions Avoided</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {analytics?.environmentalImpact?.kgWasteDiverted || 48} <span className="text-sm font-normal">kg</span>
                </p>
                <p className="text-[11px] text-gray-300">Campus Waste Diverted</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  ₹{analytics?.environmentalImpact?.estimatedStudentSavingsInr ? analytics.environmentalImpact.estimatedStudentSavingsInr.toLocaleString() : '8,450'}
                </p>
                <p className="text-[11px] text-gray-300">Saved by Students</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {analytics?.stats?.completedExchanges || 13}
                </p>
                <p className="text-[11px] text-gray-300">Completed Exchanges</p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/sustainability"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-card bg-white text-primary text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                View Full Impact Report & Assumptions
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
