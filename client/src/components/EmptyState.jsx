import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Try adjusting your search filters or browse other campus categories.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="text-center py-12 px-4 bg-white border border-charcoal-border rounded-card max-w-lg mx-auto">
      <div className="w-14 h-14 bg-charcoal-light rounded-full flex items-center justify-center mx-auto mb-4 text-charcoal-muted">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-charcoal mb-1">{title}</h3>
      <p className="text-sm text-charcoal-muted mb-6 max-w-sm mx-auto">{description}</p>
      
      {actionLink && actionLabel && (
        <Link to={actionLink} className="btn-primary text-xs">
          {actionLabel}
        </Link>
      )}

      {onAction && actionLabel && !actionLink && (
        <button onClick={onAction} className="btn-primary text-xs">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

