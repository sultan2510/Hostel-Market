import { Link } from 'react-router-dom';
import { CategoryBadge, ConditionBadge } from '../shared/Badge';

export default function ListingCard({ listing }) {
  return (
    <Link
      to={`/app/listing/${listing.id}`}
      className="group block rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden hover:border-[var(--accent-deep)] transition-colors"
    >
      <div className="aspect-square bg-[var(--bg-surface-raised)] overflow-hidden">
        {listing.photo_url ? (
          <img
            src={listing.photo_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
            No photo
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-base font-semibold leading-tight line-clamp-2">
            {listing.title}
          </h3>
        </div>
        <p className="text-[var(--accent)] font-display font-semibold text-lg mb-3">
          PKR {Number(listing.price).toLocaleString()}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={listing.category} />
          <ConditionBadge condition={listing.condition} />
        </div>
      </div>
    </Link>
  );
}
