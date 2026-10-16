import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2, Eye, Phone, Trash2, CheckCircle, RotateCcw, AlertCircle, Plus, ChevronDown, ChevronUp, MapPin, MessageCircle, ArrowLeft } from 'lucide-react';
import { supabase, type Listing } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface InterestedBuyer {
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_village: string | null;
  contacted_at: string;
}

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({});
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [buyersByListing, setBuyersByListing] = useState<Record<string, InterestedBuyer[]>>({});
  const [loadingBuyers, setLoadingBuyers] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMyListings();
    }
  }, [user]);

  const fetchMyListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setListings(data || []);

      // Get interest counts
      if (data && data.length > 0) {
        const ids = data.map((l) => l.id);
        const { data: interests } = await supabase
          .from('interests')
          .select('listing_id')
          .in('listing_id', ids);

        const counts: Record<string, number> = {};
        interests?.forEach((i) => {
          counts[i.listing_id] = (counts[i.listing_id] || 0) + 1;
        });
        setInterestCounts(counts);
      }
    } catch (err: any) {
      setError(err?.message || 'Listings load nahi hui');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyers = async (listingId: string) => {
    // If already loaded, don't refetch
    if (buyersByListing[listingId]) return;

    setLoadingBuyers(listingId);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_listing_interests', {
        p_listing_id: listingId,
      });

      if (rpcError) throw rpcError;
      setBuyersByListing((prev) => ({ ...prev, [listingId]: data || [] }));
    } catch (err: any) {
      setError(err?.message || 'Buyers load nahi hue');
    } finally {
      setLoadingBuyers(null);
    }
  };

  const toggleExpand = (listingId: string) => {
    if (expandedListing === listingId) {
      setExpandedListing(null);
    } else {
      setExpandedListing(listingId);
      fetchBuyers(listingId);
    }
  };

  const handleToggleSold = async (listing: Listing) => {
    const newStatus = listing.status === 'sold' ? 'active' : 'sold';
    try {
      const { error: updateError } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', listing.id);

      if (updateError) throw updateError;

      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l))
      );
    } catch (err: any) {
      setError(err?.message || 'Status update nahi hua');
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Ye listing delete karni hai? Ye wapas nahi aayegi.')) return;

    setDeleting(listingId);
    try {
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (deleteError) throw deleteError;

      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (err: any) {
      setError(err?.message || 'Delete nahi hua');
    } finally {
      setDeleting(null);
    }
  };

  const contactBuyer = (buyer: InterestedBuyer, crop: string) => {
    const message = `Namaste ${buyer.buyer_name || 'bhai'},\n\nAapne Agri Check pe meri *${crop}* listing me interest dikhaya tha.\nKya aapko abhi bhi chahiye?\n\n— Agri Check app se`;
    window.open(`https://wa.me/91${buyer.buyer_phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHrs = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffHrs < 1) return 'Abhi';
    if (diffHrs < 24) return `${diffHrs} ghante pehle`;
    if (diffDays < 7) return `${diffDays} din pehle`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (authLoading) {
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

    <div className="mt-4 flex items-center justify-between">
   
        <div>
          <p className="eyebrow">10 / my listings</p>
          <h1 className="mt-2 text-2xl font-bold">🌾 Meri Fasal</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold no-underline"
          >
            👤 Profile
          </Link>
          <Link
            href="/sell"
            className="flex items-center gap-1 rounded-xl bg-[hsl(var(--primary))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] no-underline"
          >
            <Plus size={14} /> Nayi
          </Link>
        </div>
      </div>

      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        {listings.length} listings — {listings.filter((l) => l.status === 'active').length} active
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid place-items-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[hsl(var(--border))] p-8 text-center">
          <AlertCircle size={40} className="mx-auto text-[hsl(var(--muted-foreground))]" />
          <p className="mt-3 text-sm font-bold">Abhi koi listing nahi</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Apni pehli fasal listing banao
          </p>
          <Link
            href="/sell"
            className="mt-4 inline-block rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-bold text-[hsl(var(--primary-foreground))] no-underline"
          >
            🌾 Fasal Becho
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {listings.map((listing) => {
            const interestCount = interestCounts[listing.id] || 0;
            const isExpanded = expandedListing === listing.id;
            const buyers = buyersByListing[listing.id] || [];

            return (
              <div
                key={listing.id}
                className={`rounded-xl border-2 bg-[hsl(var(--card))] p-4 ${
                  listing.status === 'sold'
                    ? 'border-green-200 opacity-90'
                    : 'border-[hsl(var(--border))]'
                }`}
              >
                {/* Status badge */}
                {listing.status === 'sold' && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                    <CheckCircle size={12} /> Bik Gayi
                  </div>
                )}
                {listing.status === 'expired' && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                    Expired
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
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      📍 {listing.village ? `${listing.village}, ` : ''}{listing.district}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 flex items-center gap-4 border-t border-[hsl(var(--border))] pt-3 text-xs">
                  <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                    <Eye size={12} />
                    {listing.views} views
                  </div>
                  <button
                    onClick={() => toggleExpand(listing.id)}
                    disabled={interestCount === 0}
                    className={`flex items-center gap-1 font-bold ${
                      interestCount > 0
                        ? 'text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    <Phone size={12} />
                    {interestCount} interested
                    {interestCount > 0 && (
                      isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </button>
                </div>

                {/* Buyers List (expandable) */}
                {isExpanded && (
                  <div className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3">
                    <p className="mb-2 text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">
                      Interested Buyers
                    </p>

                    {loadingBuyers === listing.id ? (
                      <div className="flex items-center gap-2 text-xs">
                        <Loader2 className="animate-spin" size={14} /> Loading...
                      </div>
                    ) : buyers.length === 0 ? (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Koi buyer nahi mila
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {buyers.map((buyer) => (
                          <div
                            key={buyer.buyer_id}
                            className="rounded-lg bg-[hsl(var(--card))] p-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold">
                                  {buyer.buyer_name || 'Buyer'}
                                </p>
                                {buyer.buyer_village && (
                                  <p className="mt-0.5 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                                    <MapPin size={10} />
                                    {buyer.buyer_village}
                                  </p>
                                )}
                                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                                  {formatDate(buyer.contacted_at)}
                                </p>
                              </div>
                              <button
                                onClick={() => contactBuyer(buyer, listing.crop)}
                                className="flex shrink-0 items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-bold text-white"
                              >
                                <MessageCircle size={12} /> WhatsApp
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleSold(listing)}
                    className={`flex min-h-11 items-center justify-center gap-1 rounded-xl text-xs font-bold ${
                      listing.status === 'sold'
                        ? 'border border-[hsl(var(--border))]'
                        : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    }`}
                  >
                    {listing.status === 'sold' ? (
                      <><RotateCcw size={14} /> Wapas Becho</>
                    ) : (
                      <><CheckCircle size={14} /> Sold Mark Karo</>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleting === listing.id}
                    className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-[#e5b5a5] text-xs font-bold text-[#833b2e] disabled:opacity-50"
                  >
                    {deleting === listing.id ? (
                      <><Loader2 className="animate-spin" size={14} /> Deleting...</>
                    ) : (
                      <><Trash2 size={14} /> Delete</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
        }
