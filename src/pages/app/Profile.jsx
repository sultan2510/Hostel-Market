import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import AppNavbar from '../../components/app/AppNavbar';
import { CategoryBadge, ConditionBadge, StatusBadge } from '../../components/shared/Badge';

export default function Profile() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchMyListings();
  }, []);

  async function fetchMyListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setListings(data || []);
    setLoading(false);
  }

  async function handleMarkSold(listingId) {
    setActionError('');
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId);

    if (error) {
      setActionError('Could not update listing. Please try again.');
      return;
    }
    fetchMyListings();
  }

  async function handleRelist(listingId) {
    setActionError('');
    const { error } = await supabase
      .from('listings')
      .update({ status: 'active' })
      .eq('id', listingId);

    if (error) {
      setActionError('Could not update listing. Please try again.');
      return;
    }
    fetchMyListings();
  }

  async function handleDelete(listingId) {
    if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return;

    setActionError('');
    const { error } = await supabase.from('listings').delete().eq('id', listingId);

    if (error) {
      setActionError('Could not delete listing. Please try again.');
      return;
    }
    fetchMyListings();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold mb-1">My listings</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {profile?.full_name} · {profile?.email}
            </p>
          </div>
          <Link
            to="/app/edit-profile"
            className="text-sm px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] hover:border-[var(--accent)] transition-colors shrink-0"
          >
            Edit account
          </Link>
        </div>

        {actionError && (
          <p className="text-sm text-[var(--danger)] mb-4" role="alert">
            {actionError}
          </p>
        )}

        {loading && <p className="text-[var(--text-muted)] text-sm">Loading...</p>}

        {!loading && listings.length === 0 && (
          <div className="text-center py-16 border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-lg)]">
            <p className="text-[var(--text-secondary)] mb-4">You haven't posted anything yet.</p>
            <Link
              to="/app/create-listing"
              className="inline-block px-5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors"
            >
              Post your first item
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
            >
              <div className="w-16 h-16 rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] overflow-hidden shrink-0">
                {listing.photo_url && (
                  <img src={listing.photo_url} alt={listing.title} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link to={`/app/listing/${listing.id}`} className="font-medium hover:text-[var(--accent)] transition-colors">
                  {listing.title}
                </Link>
                <p className="text-sm text-[var(--text-secondary)]">
                  PKR {Number(listing.price).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <CategoryBadge category={listing.category} />
                  <StatusBadge status={listing.status} />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {listing.status === 'active' ? (
                  <button
                    onClick={() => handleMarkSold(listing.id)}
                    className="text-sm px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] hover:border-[var(--accent)] transition-colors"
                  >
                    Mark sold
                  </button>
                ) : listing.status === 'sold' ? (
                  <button
                    onClick={() => handleRelist(listing.id)}
                    className="text-sm px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] hover:border-[var(--accent)] transition-colors"
                  >
                    Relist
                  </button>
                ) : null}
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="text-sm px-3 py-1.5 rounded-[var(--radius-sm)] text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}