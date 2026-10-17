import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2, Eye, Phone, Trash2, CheckCircle, RotateCcw, AlertCircle, Plus, ChevronDown, ChevronUp, MapPin, MessageCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase, type Listing } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

interface InterestedBuyer {
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_village: string | null;
  contacted_at: string;
}

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({});
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [buyersByListing, setBuyersByListing] = useState<Record<string, InterestedBuyer[]>>({});
  const [loadingBuyers, setLoadingBuyers] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [renewing, setRenewing] = useState<string | null>(null);

  const lang = ['en', 'gu', 'hi', 'mr', 'pa', 'ta'].includes(language) ? language : 'en';

  const t = {
    back: { en: 'Back', gu: 'પાછળ', hi: 'पीछे', mr: 'मागे', pa: 'ਪਿੱਛੇ', ta: 'பின்னால்' },
    title: { en: 'Meri Fasal', gu: 'મારી ફસલ', hi: 'मेरी फसल', mr: 'माझे पीक', pa: 'ਮੇਰੀ ਫ਼ਸਲ', ta: 'எனது பயிர்' },
    profile: { en: 'Profile', gu: 'પ્રોફાઇલ', hi: 'प्रोफाइल', mr: 'प्रोफाइल', pa: 'ਪ੍ਰੋਫਾਈਲ', ta: 'சுயவிவரம்' },
    nayi: { en: 'New', gu: 'નવી', hi: 'नई', mr: 'नवीन', pa: 'ਨਵੀਂ', ta: 'புதியது' },
    stats: { 
      en: 'listings — {active} active', gu: 'લિસ્ટિંગ — {active} એક્ટિવ', hi: 'लिस्टिंग — {active} सक्रिय', 
      mr: 'लिस्टिंग — {active} सक्रिय', pa: 'ਲਿਸਟਿੰਗਾਂ — {active} ਸਰਗਰਮ', ta: 'பட்டியல்கள் — {active} செயலில்' 
    },
    loading: { en: 'Loading...', gu: 'લોડ થઈ રહ્યું છે...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...', pa: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...', ta: 'ஏற்றுகிறது...' },
    noListings: { en: 'No listings yet', gu: 'હજી કોઈ લિસ્ટિંગ નથી', hi: 'अभी कोई लिस्टिंग नहीं', mr: 'अजून कोई लिस्टिंग नाही', pa: 'ਹਾਲੇ ਕੋਈ ਲਿਸਟਿੰਗ ਨਹੀਂ', ta: 'இன்னும் பட்டியல்கள் இல்லை' },
    createFirst: { en: 'Create your first listing', gu: 'તમારી પ્રથમ લિસ્ટિંગ બનાવો', hi: 'अपनी पहली लिस्टिंग बनाएं', mr: 'तुमची पहिली लिस्टिंग तयार करा', pa: 'ਆਪਣੀ ਪਹਿਲੀ ਲਿਸਟਿੰਗ ਬਣਾਓ', ta: 'உங்கள் முதல் பட்டியலை உருவாக்கவும்' },
    sellBtn: { en: 'Sell Crop', gu: 'ફસલ વેચો', hi: 'फसल बेचें', mr: 'पीक विका', pa: 'ਫ਼ਸਲ ਵੇਚੋ', ta: 'பயிரை விற்க' },
    sold: { en: 'Sold', gu: 'વેચાઈ ગયું', hi: 'बिक गई', mr: 'विकले', pa: 'ਵਿਕ ਗਈ', ta: 'விற்கப்பட்டது' },
    expired: { en: 'Expired', gu: 'સમાપ્ત', hi: 'समाप्त', mr: 'कालबाह्य', pa: 'ਸਮਾਪਤ', ta: 'காலாவதியானது' },
    views: { en: 'views', gu: 'વ્યુ', hi: 'व्यूज', mr: 'व्ह्यूज', pa: 'ਵਿਊਜ਼', ta: 'பார்வைகள்' },
    interested: { en: 'interested', gu: 'રસ ધરાવે છે', hi: 'इच्छुक', mr: 'इच्छुक', pa: 'ਦਿਲਚਸਪੀ', ta: 'ஆர்வம்' },
    intBuyers: { en: 'Interested Buyers', gu: 'રસ ધરાવતા ખરીદનાર', hi: 'इच्छुक खरीदार', mr: 'इच्छुक खरेदीदार', pa: 'ਦਿਲਚਸਪੀ ਰੱਖਣ ਵਾਲੇ ਖਰੀਦਦਾਰ', ta: 'ஆர்வமுள்ள வாங்குபவர்கள்' },
    noBuyers: { en: 'No buyers found', gu: 'કોઈ ખરીદનાર મળ્યા નથી', hi: 'कोई खरीदार नहीं मिला', mr: 'कोणतेही खरेदीदार आढळले नाहीत', pa: 'ਕੋਈ ਖਰੀਦਦਾਰ ਨਹੀਂ ਮਿਲਿਆ', ta: 'வாங்குபவர்கள் யாரும் இல்லை' },
    buyer: { en: 'Buyer', gu: 'ખરીદનાર', hi: 'खरीदार', mr: 'खरेदीदार', pa: 'ਖਰੀਦਦਾਰ', ta: 'வாங்குபவர்' },
    whatsapp: { en: 'WhatsApp', gu: 'WhatsApp', hi: 'WhatsApp', mr: 'WhatsApp', pa: 'WhatsApp', ta: 'WhatsApp' },
    soldMark: { en: 'Mark as Sold', gu: 'સોલ્ડ માર્ક કરો', hi: 'सोल्ड मार्क करें', mr: 'विकले म्हणून चिन्हांकित करा', pa: 'ਵਿਕਿਆ ਵਜੋਂ ਨਿਸ਼ਾਨ ਲਗਾਓ', ta: 'விற்பனையானதாகக் குறி' },
    backToSell: { en: 'Re-list', gu: 'ફરી વેચો', hi: 'फिर बेचें', mr: 'पुन्हा विका', pa: 'ਦੁਬਾਰਾ ਵੇਚੋ', ta: 'மீண்டும் விற்க' },
    renewBtn: { en: 'Renew 30 Days', gu: '૩૦ દિવસ લંબાવો', hi: '30 दिन बढ़ाएं', mr: '३० दिवस वाढवा', pa: '30 ਦਿਨ ਵਧਾਓ', ta: '30 நாட்கள் நீட்டிக்க' },
    renewing: { en: 'Renewing...', gu: 'લંબાવી રહ્યું છે...', hi: 'बढ़ रहा है...', mr: 'वाढवत आहे...', pa: 'ਵਧਾ ਰਿਹਾ ਹੈ...', ta: 'நீட்டிக்கிறது...' },
    delete: { en: 'Delete', gu: 'ડિલીટ કરો', hi: 'डिलीट करें', mr: 'हटवा', pa: 'ਮਿਟਾਓ', ta: 'நீக்கு' },
    deleting: { en: 'Deleting...', gu: 'ડિલીટ થઈ રહ્યું છે...', hi: 'डिलीट हो रहा है...', mr: 'हटवत आहे...', pa: 'ਮਿਟਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...', ta: 'நீக்குகிறது...' }
  };

  const getStatsText = () => {
    return t.stats[lang].replace('{active}', String(listings.filter((l) => l.status === 'active').length));
  };

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
  const msg = err?.message || '';
  if (msg.includes('10 active listings')) {
    setError('10 active listings limit reached. Kuch listings delete karein.');
  } else {
    setError('Listing renew nahi hui. Dobara try karein.');
  }
} finally { 
      setLoading(false);
    }
  };

  const fetchBuyers = async (listingId: string) => {
    if (buyersByListing[listingId]) return;
    setLoadingBuyers(listingId);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_listing_interests', { p_listing_id: listingId });
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
      setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l)));
   } catch (err: any) {
  const msg = err?.message || '';
  if (msg.includes('Listing expired')) {
    setError('Ye listing expire ho chuki hai. Pehle "Renew" karein.');
  } else if (msg.includes('10 active listings')) {
    setError('10 active listings limit reached. Kuch listings delete karein.');
  } else {
    setError('Status update nahi hua. Dobara try karein.');
  }
    } 
  };

  const handleRenew = async (listingId: string) => {
    setRenewing(listingId);
    setError('');
    try {
      const { data: newExpiry, error: rpcError } = await supabase.rpc('renew_listing', {
        p_listing_id: listingId,
      });

      if (rpcError) throw rpcError;

      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, status: 'active', expires_at: newExpiry } : l
        )
      );
    } catch (err: any) {
      setError(err?.message || 'Listing renew nahi hui');
    } finally {
      setRenewing(null);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Ye listing delete karni hai? Ye wapas nahi aayegi.')) return;
    setDeleting(listingId);
    try {
      const { error: deleteError } = await supabase.from('listings').delete().eq('id', listingId);
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
    
    // Double 91 fix
    const cleanPhone = buyer.buyer_phone.replace(/^\+?91/, '').replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHrs = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffHrs < 1) return lang === 'gu' ? 'હમણાં જ' : lang === 'hi' ? 'अभी' : lang === 'mr' ? 'आत्ताच' : lang === 'pa' ? 'ਹੁਣੇ' : lang === 'ta' ? 'இப்போது' : 'Just now';
    if (diffHrs < 24) return diffHrs + (lang === 'gu' ? ' કલાક પહેલા' : lang === 'hi' ? ' घंटे पहले' : lang === 'mr' ? ' तासांपूर्वी' : lang === 'pa' ? ' ਘੰਟੇ ਪਹਿਲਾਂ' : lang === 'ta' ? ' மணி நேரத்திற்கு முன்பு' : ' hours ago');
    if (diffDays < 7) return diffDays + (lang === 'gu' ? ' દિવસ પહેલા' : lang === 'hi' ? ' दिन पहले' : lang === 'mr' ? ' दिवसांपूर्वी' : lang === 'pa' ? ' ਦਿਨ ਪਹਿਲਾਂ' : lang === 'ta' ? ' நாட்களுக்கு முன்பு' : ' days ago');
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
        <ArrowLeft size={18} /> {t.back[lang]}
      </button>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="eyebrow">10 / my listings</p>
          <h1 className="mt-2 text-2xl font-bold">🌾 {t.title[lang]}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold no-underline"
          >
            👤 {t.profile[lang]}
          </Link>
          <Link
            href="/sell"
            className="flex items-center gap-1 rounded-xl bg-[hsl(var(--primary))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] no-underline"
          >
            <Plus size={14} /> {t.nayi[lang]}
          </Link>
        </div>
      </div>

      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        {getStatsText()}
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid place-items-center">
          <Loader2 className="animate-spin" size={24} />
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{t.loading[lang]}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[hsl(var(--border))] p-8 text-center">
          <AlertCircle size={40} className="mx-auto text-[hsl(var(--muted-foreground))]" />
          <p className="mt-3 text-sm font-bold">{t.noListings[lang]}</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {t.createFirst[lang]}
          </p>
          <Link
            href="/sell"
            className="mt-4 inline-block rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-bold text-[hsl(var(--primary-foreground))] no-underline"
          >
            🌾 {t.sellBtn[lang]}
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {listings.map((listing) => {
            const interestCount = interestCounts[listing.id] || 0;
            const isExpanded = expandedListing === listing.id;
            const buyers = buyersByListing[listing.id] || [];
            const isExpired = listing.status === 'expired' || (listing.expires_at && new Date(listing.expires_at) < new Date());

            return (
              <div
                key={listing.id}
                className={`rounded-xl border-2 bg-[hsl(var(--card))] p-4 ${
                  listing.status === 'sold'
                    ? 'border-green-200 opacity-90'
                    : isExpired
                    ? 'border-orange-200'
                    : 'border-[hsl(var(--border))]'
                }`}
              >
                {/* Status Badges */}
                {listing.status === 'sold' && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                    <CheckCircle size={12} /> {t.sold[lang]}
                  </div>
                )}
                {(listing.status === 'expired' || isExpired) && listing.status !== 'sold' && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">
                    <AlertCircle size={12} /> {t.expired[lang]}
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

                <div className="mt-3 flex items-center gap-4 border-t border-[hsl(var(--border))] pt-3 text-xs">
                  <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                    <Eye size={12} />
                    {listing.views} {t.views[lang]}
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
                    {interestCount} {t.interested[lang]}
                    {interestCount > 0 && (
                      isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3">
                    <p className="mb-2 text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">
                      {t.intBuyers[lang]}
                    </p>

                    {loadingBuyers === listing.id ? (
                      <div className="flex items-center gap-2 text-xs">
                        <Loader2 className="animate-spin" size={14} /> {t.loading[lang]}
                      </div>
                    ) : buyers.length === 0 ? (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t.noBuyers[lang]}
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
                                  {buyer.buyer_name || t.buyer[lang]}
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
                                <MessageCircle size={12} /> {t.whatsapp[lang]}
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
                  {isExpired && listing.status !== 'sold' ? (
                    <button
                      onClick={() => handleRenew(listing.id)}
                      disabled={renewing === listing.id}
                      className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-orange-600 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {renewing === listing.id ? (
                        <><Loader2 className="animate-spin" size={14} /> {t.renewing[lang]}</>
                      ) : (
                        <><RefreshCw size={14} /> {t.renewBtn[lang]}</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleSold(listing)}
                      className={`flex min-h-11 items-center justify-center gap-1 rounded-xl text-xs font-bold ${
                        listing.status === 'sold'
                          ? 'border border-[hsl(var(--border))]'
                          : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      }`}
                    >
                      {listing.status === 'sold' ? (
                        <><RotateCcw size={14} /> {t.backToSell[lang]}</>
                      ) : (
                        <><CheckCircle size={14} /> {t.soldMark[lang]}</>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleting === listing.id}
                    className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-[#e5b5a5] text-xs font-bold text-[#833b2e] disabled:opacity-50"
                  >
                    {deleting === listing.id ? (
                      <><Loader2 className="animate-spin" size={14} /> {t.deleting[lang]}</>
                    ) : (
                      <><Trash2 size={14} /> {t.delete[lang]}</>
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
