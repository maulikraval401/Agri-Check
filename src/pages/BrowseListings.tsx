import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2, Search, MapPin, Phone, User, Calendar, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase, type Listing } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ListingWithUser extends Listing {
  users?: {
    name: string;
    average_rating: number;
  };
}

const CONTACTED_KEY = 'agri_contacted_listings';

export default function BrowseListingsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [listings, setListings] = useState<ListingWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contacting, setContacting] = useState<string | null>(null);
  const [contactedIds, setContactedIds] = useState<string[]>([]);

  // Filters
  const [searchCrop, setSearchCrop] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  useEffect(() => {
    // Load contacted IDs from localStorage
    try {
      const saved = localStorage.getItem(CONTACTED_KEY);
      if (saved) setContactedIds(JSON.parse(saved));
    } catch {
      // ignore
    }

    fetchListings();

    // Restore scroll position after listings load
    try {
      const savedScroll = sessionStorage.getItem('browse_scroll_pos');
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
          sessionStorage.removeItem('browse_scroll_pos');
        }, 300);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          users:user_id (
            name,
            average_rating
          )
        `)
        .eq('status', 'active')
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setListings(data || []);
    } catch (err: any) {
      setError(err?.message || 'Listings load nahi hui');
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((l) => {
    if (searchCrop && !l.crop.toLowerCase().includes(searchCrop.toLowerCase())) return false;
    if (filterDistrict && !l.district.toLowerCase().includes(filterDistrict.toLowerCase())) return false;
    if (filterMinPrice && l.expected_price < Number(filterMinPrice)) return false;
    if (filterMaxPrice && l.expected_price > Number(filterMaxPrice)) return false;
    return true;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    if (diffHrs < 1) return 'Abhi';
    if (diffHrs < 24) return `${diffHrs} ghante pehle`;
    if (diffDays < 7) return `${diffDays} din pehle`;
    return d.toLocaleDateString('en-IN');
  };

  const handleContact = async (listing: ListingWithUser) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setContacting(listing.id);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_listing_contact', {
        p_listing_id: listing.id,
      });

      if (rpcError) {
        if (rpcError.message.includes('your own listing')) {
          alert('Apni hi listing pe contact nahi kar sakte');
        } else if (rpcError.message.includes('not active')) {
          alert('Ye listing ab active nahi hai');
        } else if (rpcError.message.includes('Login required')) {
          navigate('/login');
        } else {
          alert(rpcError.message || 'Contact nahi hua');
        }
        return;
      }

      const seller = data?.[0];
      if (!seller?.phone) {
        alert('Seller ka phone number nahi mila');
        return;
      }

      // Save scroll position before opening WhatsApp
      try {
        sessionStorage.setItem('browse_scroll_pos', String(window.scrollY));
      } catch {
        // ignore
      }

      // Save contacted listing ID
      const updated = contactedIds.includes(listing.id)
        ? contactedIds
        : [...contactedIds, listing.id];
      setContactedIds(updated);
      try {
        localStorage.setItem(CONTACTED_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      // Strip country code if already present
      const cleanPhone = seller.phone.replace(/^\+?91/, '').replace(/\D/g, '');

      const message = `Namaste ${seller.seller_name || 'bhai'},\n\nAgri Check pe aapki *${listing.crop}* listing dekhi.\n${listing.quantity} quintal ₹${listing.expected_price}/quintal me chahiye.\n\n— Agri Check app se`;

      window.open(
        `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`,
        '_blank'
      );
    } catch (err: any) {
      alert(err?.message || 'Contact nahi hua');
    } finally {
      setContacting(null);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
  <div className="page-enter min-h-screen px-4 py-6 pb-24">
    <button
      onClick={() => navigate('/mandi')}
      className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
    >
      <ArrowLeft size={18} /> Back
    </button>

    <p className="eyebrow mt-4">09 / listings</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">🛒 Sabki Fasal</h1>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
        {filteredListings.length} listings mili
      </p>

      {/* Filters */}
      <div className="mt-4 space-y-2 rounded-xl border border-[hsl(var(--border))] p-3">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            placeholder="Fasal dhundo (Cotton, Wheat...)"
            className="min-h-10 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <input
          type="text"
          value={filterDistrict}
          onChange={(e) => setFilterDistrict(e.target.value)}
          placeholder="District"
          className="min-h-10 w-full rounded-lg border border-[hsl(var(--border))] px-3 text-sm outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={filterMinPrice}
            onChange={(e) => setFilterMinPrice(e.target.value)}
            placeholder="Min ₹"
            className="min-h-10 rounded-lg border border-[hsl(var(--border))] px-3 text-sm outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(e.target.value)}
            placeholder="Max ₹"
            className="min-h-10 rounded-lg border border-[hsl(var(--border))] px-3 text-sm outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">
          {error}
        </div>
      )}

      {/* Listings */}
      <div className="mt-4 space-y-3">
        {filteredListings.length === 0 && !loading && (
          <div className="rounded-xl border border-[hsl(var(--border))] p-8 text-center">
            <AlertCircle size={40} className="mx-auto text-[hsl(var(--muted-foreground))]" />
            <p className="mt-3 text-sm font-bold">Koi listing nahi mili</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Filter change karo ya baad me dekho
            </p>
            <Link
              href="/sell"
              className="mt-4 inline-block rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-bold text-[hsl(var(--primary-foreground))] no-underline"
            >
              Pehli Listing Banao
            </Link>
          </div>
        )}

        {filteredListings.map((listing) => {
          const isOwnListing = listing.user_id === user?.id;
          const isContacted = contactedIds.includes(listing.id);

          return (
            <div
              key={listing.id}
              className={`rounded-xl border bg-[hsl(var(--card))] p-4 ${
                isContacted
                  ? 'border-green-300'
                  : 'border-[hsl(var(--border))]'
              }`}
            >
              {/* Contacted badge */}
              {isContacted && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                  <CheckCircle2 size={12} /> Aapne contact kiya
                </div>
              )}

              <div className="flex gap-3">
                {listing.photos?.[0] ? (
                  <img
                    src={listing.photos[0]}
                    alt={listing.crop}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-[hsl(var(--muted))] text-3xl">
                    🌾
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold">{listing.crop}</h3>
                  <p className="mt-1 text-sm font-semibold text-[hsl(var(--primary))]">
                    ₹{listing.expected_price}/quintal
                  </p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {listing.quantity} quintal • {formatDate(listing.created_at)}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <MapPin size={12} />
                    {listing.village ? `${listing.village}, ` : ''}{listing.district}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <User size={14} className="text-[hsl(var(--muted-foreground))]" />
                  <span className="font-semibold">{listing.users?.name || 'Farmer'}</span>
                  {listing.users?.average_rating ? (
                    <span className="text-[hsl(var(--muted-foreground))]">
                      ⭐ {listing.users.average_rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                {listing.ready_date && (
                  <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <Calendar size={12} />
                    {new Date(listing.ready_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>

              {listing.description && (
                <p className="mt-2 rounded-lg bg-[hsl(var(--muted))] p-2 text-xs">
                  📝 {listing.description}
                </p>
              )}

              {isOwnListing ? (
                <div className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-center text-xs font-bold text-[hsl(var(--muted-foreground))]">
                  👤 Ye aapki hi listing hai
                </div>
              ) : (
                <button
                  onClick={() => handleContact(listing)}
                  disabled={contacting === listing.id}
                  className={`mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold disabled:opacity-50 ${
                    isContacted
                      ? 'border border-green-300 bg-green-50 text-green-800'
                      : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  }`}
                >
                  {contacting === listing.id ? (
                    <><Loader2 className="animate-spin" size={16} /> Contact ho raha...</>
                  ) : isContacted ? (
                    <><CheckCircle2 size={16} /> Wapas Contact Karo</>
                  ) : (
                    <><Phone size={16} /> Contact Karo</>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
    }
