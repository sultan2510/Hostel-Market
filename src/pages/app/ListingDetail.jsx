import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import AppNavbar from '../../components/app/AppNavbar';
import { CategoryBadge, ConditionBadge, StatusBadge } from '../../components/shared/Badge';

export default function ListingDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();

  const [listing, setListing] = useState(null);
  const [sellerName, setSellerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [contact, setContact] = useState(null);
  const [revealStatus, setRevealStatus] = useState('idle'); // idle | revealing | error
  const [revealError, setRevealError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchListing() {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase
        .from('listings')
        .select('*, public_profiles!listings_seller_id_fkey(full_name)')
        .eq('id', id)
        .maybeSingle();

      if (!isMounted) return;

      if (error || !data) {
        setErrorMsg('This listing could not be found, or may have been removed.');
        setLoading(false);
        return;
      }

      setListing(data);
      setSellerName(data.public_profiles?.full_name || 'Seller');
      setLoading(false);
    }

    fetchListing();
    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleReveal() {
    setRevealStatus('revealing');
    setRevealError('');

    const { data, error } = await supabase.rpc('get_seller_contact', {
      p_listing_id: id,
    });

    if (error) {
      setRevealStatus('error');
      setRevealError(error.message || 'Could not load contact info. Please try again.');
      return;
    }

    if (data && data.length > 0) {
      setContact(data[0]);
    }
    setRevealStatus('idle');
  }

  const isOwnListing = listing?.seller_id === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <p className="text-center text-[var(--text-muted)] mt-20">Loading listing...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <div className="text-center mt-20">
          <p className="text-[var(--danger)] mb-4">{errorMsg}</p>
          <Link to="/app" className="text-[var(--accent)] hover:underline">
            Back to browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <Link to="/app" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 inline-block">
          ← Back to browse
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-[var(--bg-surface)] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-subtle)]">
            {listing.photo_url ? (
              <img src={listing.photo_url} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                No photo provided
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <CategoryBadge category={listing.category} />
              <ConditionBadge condition={listing.condition} />
              <StatusBadge status={listing.status} />
            </div>

            <h1 className="font-display text-3xl font-semibold mb-2">{listing.title}</h1>
            <p className="text-[var(--accent)] font-display text-2xl font-semibold mb-6">
              PKR {Number(listing.price).toLocaleString()}
            </p>

            <p className="text-[var(--text-secondary)] leading-relaxed mb-6 whitespace-pre-wrap">
              {listing.description}
            </p>

            <p className="text-sm text-[var(--text-muted)] mb-6">Listed by {sellerName}</p>

            {isOwnListing ? (
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)]">
                This is your own listing. Manage it from{' '}
                <Link to="/app/profile" className="text-[var(--accent)] hover:underline">
                  My listings
                </Link>
                .
              </div>
            ) : listing.status !== 'active' ? (
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)]">
                This item is no longer available.
              </div>
            ) : contact ? (
              <div className="p-5 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--accent-deep)]">
                <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Seller contact
                </p>
                <p className="text-[var(--text-primary)] font-medium mb-1">
                  📞 {contact.phone_number}
                </p>
                <p className="text-[var(--text-secondary)] text-sm">
                  📍 {contact.hostel_or_address}
                </p>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleReveal}
                  disabled={revealStatus === 'revealing'}
                  className="px-6 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60"
                >
                  {revealStatus === 'revealing' ? 'Loading...' : 'Reveal contact info'}
                </button>
                {revealError && (
                  <p className="mt-3 text-sm text-[var(--danger)]" role="alert">
                    {revealError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
