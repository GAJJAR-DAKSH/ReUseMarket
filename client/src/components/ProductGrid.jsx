import React from 'react';
import ProductCard from './ProductCard';
import ProductGridSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

const ProductGrid = ({
  listings = [],
  loading = false,
  emptyTitle = 'No campus listings found',
  emptyDescription = 'There are no active listings matching your filters right now.',
  onSaveToggle,
}) => {
  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (!listings || listings.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel="Explore All Items"
        actionLink="/marketplace"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {listings.map((item) => (
        <ProductCard key={item._id} listing={item} onSaveToggle={onSaveToggle} />
      ))}
    </div>
  );
};

export default ProductGrid;

