import React from 'react';
import { CATEGORIES, LISTING_TYPES, CONDITIONS } from '../utils/formatters';
import { RotateCcw } from 'lucide-react';

const FilterSidebar = ({ filters, onChange, onReset }) => {
  return (
    <div className="bg-white border border-charcoal-border/70 rounded-card p-5 space-y-6 shadow-subtle">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-charcoal-border/70">
        <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal">Filters</h3>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-charcoal-muted hover:text-primary transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-charcoal mb-2.5">
          Listing Type
        </label>
        <div className="space-y-1">
          {['All', ...LISTING_TYPES].map((type) => (
            <label
              key={type}
              className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filters.listingType === type
                  ? 'bg-primary-light text-primary font-bold'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light/60'
              }`}
            >
              <span>{type}</span>
              <input
                type="radio"
                name="listingType"
                checked={filters.listingType === type}
                onChange={() => onChange('listingType', type)}
                className="hidden"
              />
              {filters.listingType === type && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-charcoal mb-2.5">
          Category
        </label>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <label
            className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              filters.category === 'All'
                ? 'bg-primary-light text-primary font-bold'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light/60'
            }`}
          >
            <span>All Categories</span>
            <input
              type="radio"
              name="category"
              checked={filters.category === 'All'}
              onChange={() => onChange('category', 'All')}
              className="hidden"
            />
            {filters.category === 'All' && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </label>
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filters.category === cat
                  ? 'bg-primary-light text-primary font-bold'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light/60'
              }`}
            >
              <span className="truncate">{cat}</span>
              <input
                type="radio"
                name="category"
                checked={filters.category === cat}
                onChange={() => onChange('category', cat)}
                className="hidden"
              />
              {filters.category === cat && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-charcoal mb-2.5">
          Condition
        </label>
        <div className="space-y-1">
          <label
            className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              filters.condition === 'All'
                ? 'bg-primary-light text-primary font-bold'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light/60'
            }`}
          >
            <span>Any Condition</span>
            <input
              type="radio"
              name="condition"
              checked={filters.condition === 'All'}
              onChange={() => onChange('condition', 'All')}
              className="hidden"
            />
            {filters.condition === 'All' && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </label>
          {CONDITIONS.map((cond) => (
            <label
              key={cond}
              className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filters.condition === cond
                  ? 'bg-primary-light text-primary font-bold'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light/60'
              }`}
            >
              <span>{cond}</span>
              <input
                type="radio"
                name="condition"
                checked={filters.condition === cond}
                onChange={() => onChange('condition', cond)}
                className="hidden"
              />
              {filters.condition === cond && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-charcoal mb-2.5">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={(e) => onChange('minPrice', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-charcoal-border bg-[#F8F9F6] placeholder-charcoal-subtle focus:bg-white focus:outline-none focus:border-primary transition-colors"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={(e) => onChange('maxPrice', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-charcoal-border bg-[#F8F9F6] placeholder-charcoal-subtle focus:bg-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-charcoal mb-2.5">
          Availability
        </label>
        <select
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full px-3 py-1.5 text-xs rounded-lg border border-charcoal-border bg-[#F8F9F6] text-charcoal focus:bg-white focus:outline-none focus:border-primary transition-colors"
        >
          <option value="Available">Available Only</option>
          <option value="Reserved">Reserved</option>
          <option value="All">All Items</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSidebar;
