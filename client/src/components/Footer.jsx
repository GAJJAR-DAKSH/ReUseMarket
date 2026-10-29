import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../utils/formatters';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-charcoal-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-card bg-primary flex items-center justify-center text-white">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-charcoal">
                ReUse<span className="text-primary">Market</span>
              </span>
            </Link>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              A university-exclusive reuse and exchange marketplace. Enabling students to buy, sell, reserve, and donate essential campus items sustainably.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-primary font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified College Email Only
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-muted">
              <li>
                <Link to="/marketplace" className="hover:text-primary transition-colors">
                  All Campus Items
                </Link>
              </li>
              <li>
                <Link to="/marketplace?listingType=Free+Donation" className="hover:text-primary transition-colors">
                  Free Student Donations
                </Link>
              </li>
              <li>
                <Link to="/marketplace?listingType=Exchange" className="hover:text-primary transition-colors">
                  Item Exchanges
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="hover:text-primary transition-colors">
                  List an Item for Free
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="hover:text-primary transition-colors">
                  Campus Carbon & Waste Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-3">
              Top Categories
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-muted">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/marketplace?category=${encodeURIComponent(cat)}`}
                    className="hover:text-primary transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety & Physical Handover guidelines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-3">
              Campus Handover Safety
            </h4>
            <p className="text-xs text-charcoal-muted leading-relaxed mb-3">
              All exchanges take place in person on campus (libraries, dining halls, hostel receptions). Always inspect the item before sharing your 6-digit handover code.
            </p>
            <div className="p-3 bg-primary-surface border border-primary-border rounded-card text-[11px] text-charcoal-muted">
              <span className="font-semibold text-primary block mb-0.5">Zero Commission</span>
              100% free student-to-student exchange with zero platform fees.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-charcoal-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-muted">
          <p>© {new Date().getFullYear()} ReUseMarket. Built for campus circular economy.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with care for student sustainability <Sparkles className="w-3.5 h-3.5 text-primary" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
