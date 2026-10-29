import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import api from '../services/api';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from query parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    listingType: searchParams.get('listingType') || 'All',
    condition: searchParams.get('condition') || 'All',
    status: searchParams.get('status') || 'Available',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const [listings, setListings] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'All',
      listingType: searchParams.get('listingType') || 'All',
      condition: searchParams.get('condition') || 'All',
      status: searchParams.get('status') || 'Available',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page') || '1', 10),
    });
  }, [searchParams]);

  // Fetch listings when filters change
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category && filters.category !== 'All') params.append('category', filters.category);
        if (filters.listingType && filters.listingType !== 'All') params.append('listingType', filters.listingType);
        if (filters.condition && filters.condition !== 'All') params.append('condition', filters.condition);
        if (filters.status && filters.status !== 'All') params.append('status', filters.status);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);
        params.append('page', filters.page.toString());
        params.append('limit', '12');

        const res = await api.get(`/listings?${params.toString()}`);
        if (res.data.success) {
          setListings(res.data.listings || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalCount(res.data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching marketplace listings:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // Update query params in URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'All') params.set(k, v.toString());
    });
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const reset = {
      search: '',
      category: 'All',
      listingType: 'All',
      condition: 'All',
      status: 'Available',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1,
    };
    setFilters(reset);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateFilter('page', newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-charcoal-border">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Campus Marketplace</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Showing {totalCount} item{totalCount === 1 ? '' : 's'} available across campus
          </p>
        </div>

        {/* Search bar & Mobile filter button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-72">
            <SearchBar
              initialQuery={filters.search}
              onSearch={(query) => updateFilter('search', query)}
              placeholder="Search items..."
            />
          </div>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden p-2 rounded-card border border-charcoal-border bg-white text-charcoal hover:bg-charcoal-light flex items-center gap-1.5 text-xs flex-shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Sorting bar & Active filter indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-xs">
        {/* Active badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.category !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-light text-primary font-medium">
              Category: {filters.category}
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFilter('category', 'All')}
              />
            </span>
          )}
          {filters.listingType !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-light text-primary font-medium">
              Type: {filters.listingType}
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFilter('listingType', 'All')}
              />
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-charcoal-light text-charcoal font-medium">
              Query: "{filters.search}"
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFilter('search', '')}
              />
            </span>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-charcoal-muted font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by:
          </span>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="px-3 py-1.5 text-xs rounded-card border border-charcoal-border bg-white text-charcoal focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            filters={filters}
            onChange={updateFilter}
            onReset={handleResetFilters}
          />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          <ProductGrid
            listings={listings}
            loading={loading}
            emptyTitle="No matching items found"
            emptyDescription="Try clearing your search terms or expanding your filter criteria."
          />

          {/* Pagination */}
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full overflow-y-auto p-4 z-10 shadow-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-border mb-4">
              <span className="text-sm font-bold text-charcoal">Filter Items</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-full text-charcoal-muted hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={(k, v) => {
                updateFilter(k, v);
              }}
              onReset={handleResetFilters}
            />
            <div className="mt-4 pt-4 border-t border-charcoal-border">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-primary w-full text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;

