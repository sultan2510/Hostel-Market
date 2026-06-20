import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AppNavbar from '../../components/app/AppNavbar';
import ListingCard from '../../components/app/ListingCard';
import FilterSidebar from '../../components/app/FilterSidebar';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    condition: null,
    maxPrice: '',
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchListings() {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error('Failed to fetch listings:', error.message);
        setErrorMsg('Could not load listings. Please refresh the page.');
      } else {
        setListings(data || []);
      }
      setLoading(false);
    }

    fetchListings();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (filters.search && !l.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category && l.category !== filters.category) return false;
      if (filters.condition && l.condition !== filters.condition) return false;
      if (filters.maxPrice && Number(l.price) > Number(filters.maxPrice)) return false;
      return true;
    });
  }, [listings, filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          <FilterSidebar filters={filters} onChange={setFilters} />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-2xl font-semibold">
                Browse listings
              </h1>
              <span className="text-sm text-[var(--text-muted)]">
                {filteredListings.length} item{filteredListings.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading && (
              <p className="text-[var(--text-muted)] text-sm">Loading listings...</p>
            )}

            {errorMsg && (
              <p className="text-[var(--danger)] text-sm" role="alert">
                {errorMsg}
              </p>
            )}

            {!loading && !errorMsg && filteredListings.length === 0 && (
              <div className="text-center py-20 border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-lg)]">
                <p className="text-[var(--text-secondary)] mb-2">No listings match your filters yet.</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Be the first to post something your block needs.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
