import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2, Search, MapPin, Phone, User, Calendar, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase, type Listing } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

interface ListingWithUser extends Listing {
  users?: {
    name: string;
    average_rating: number;
  };
}

const CONTACTED_KEY = 'agri_contacted_listings';

export default function BrowseListingsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
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

  const lang = ['en', 'gu', 'hi', 'mr', 'pa', 'ta'].includes(language) ? language : 'en';

  const t = {
    back: { en: 'Back', gu: 'પાછળ', hi: 'पीछे', mr: 'मागे', pa: 'ਪਿੱਛੇ', ta: 'பின்னால்' },
    title: { en: 'Sabki Fasal', gu: 'બધાની ફસલ', hi: 'सबकी फसल', mr: 'सर्वांचे पीक', pa: 'ਸਭ ਦੀ ਫ਼ਸਲ', ta: 'அனைவரின் பயிர்' },
    found: { en: 'listings found', gu: 'લિસ્ટિંગ મળી', hi: 'लिस्टिंग मिली', mr: 'लिस्टिंग आढळल्या', pa: 'ਲਿਸਟਿੰਗਾਂ ਮਿਲੀਆਂ', ta: 'பட்டியல்கள் கிடைத்தன' },
    searchPh: { en: 'Search crop (Cotton, Wheat...)', gu: 'ફસલ શોધો (કપાસ, ઘઉં...)', hi: 'फसल खोजें (कपास, गेहूं...)', mr: 'पीक शोधा (कापूस, गहू...)', pa: 'ਫ਼ਸਲ ਖੋਜੋ (ਕਪਾਹ, ਕਣਕ...)', ta: 'பயிரைத் தேடு (பருத்தி, கோதுமை...)' },
    districtPh: { en: 'District', gu: 'જિલ્લો', hi: 'जिला', mr: 'जिल्हा', pa: 'ਜ਼ਿਲ੍ਹਾ', ta: 'மாவட்டம்' },
    minPrice: { en: 'Min ₹', gu: 'ન્યૂનતમ ₹', hi: 'न्यूनतम ₹', mr: 'किमान ₹', pa: 'ਘੱਟੋ-ਘੱਟ ₹', ta: 'குறைந்தபட்ச ₹' },
    maxPrice: { en: 'Max ₹', gu: 'મહત્તમ ₹', hi: 'अधिकतम ₹', mr: 'कमाल ₹', pa: 'ਵੱਧ ਤੋਂ ਵੱਧ ₹', ta: 'அதிகபட்ச ₹' },
    noListings: { en: 'No listings found', gu: 'કોઈ લિસ્ટિંગ મળી નથી', hi: 'कोई लिस्टिंग नहीं मिली', mr: 'कोणतीही लिस्टिंग आढळली नाही', pa: 'ਕੋਈ ਲਿਸਟਿੰਗ ਨਹੀਂ ਮਿਲੀ', ta: 'பட்டியல்கள் எதுவும் இல்லை' },
    tryFilter: { en: 'Change filters or check later', gu: 'ફિલ્ટર બદલો અથવા પછી જુઓ', hi: 'फिल्टर बदलें या बाद में देखें', mr: 'फिल्टर बदला किंवा नंतर पहा', pa: 'ਫਿਲਟਰ ਬਦਲੋ ਜਾਂ ਬਾਅਦ ਵਿੱਚ ਦੇਖੋ', ta: 'வடிகட்டிகளை மாற்றவும் அல்லது பின்னர் பார்க்கவும்' },
    createBtn: { en: 'Create First Listing', gu: 'પ્રથમ લિસ્ટિંગ બનાવો', hi: 'पहली लिस्टिंग बनाएं', mr: 'पहिली लिस्टिंग तयार करा', pa: 'ਪਹਿਲੀ ਲਿਸਟਿੰਗ ਬਣਾਓ', ta: 'முதல் பட்டியலை உருவாக்கு' },
    ownListing: { en: 'This is your listing', gu: 'આ તમારી લિસ્ટિંગ છે', hi: 'यह आपकी लिस्टिंग है', mr: 'हे तुमचे लिस्टिंग आहे', pa: 'ਇਹ ਤੁਹਾਡੀ ਲਿਸਟਿੰਗ ਹੈ', ta: 'இது உங்கள் பட்டியல்' },
    contacted: { en: 'You contacted', gu: 'તમે સંપર્ક કર્યો', hi: 'आपने संपर्क किया', mr: 'तुम्ही संपर्क केला', pa: 'ਤੁਸੀਂ ਸੰਪਰਕ ਕੀਤਾ', ta: 'நீங்கள் தொடர்பு கொண்டீர்கள்' },
    contact: { en: 'Contact', gu: 'સંપર્ક કરો', hi: 'संपर्क करें', mr: 'संपर्क करा', pa: 'ਸੰਪਰਕ ਕਰੋ', ta: 'தொடர்பு கொள்ள' },
    contactAgain: { en: 'Contact Again', gu: 'ફરી સંપર્ક કરો', hi: 'फिर संपर्क करें', mr: 'पुन्हा संपर्क करा', pa: 'ਦੁਬਾਰਾ ਸੰਪਰਕ ਕਰੋ', ta: 'மீண்டும் தொடர்பு கொள்ள' },
    contacting: { en: 'Contacting...', gu: 'સંપર્ક થઈ રહ્યો છે...', hi: 'संपर्क हो रहा है...', mr: 'संपर्क होत आहे...', pa: 'ਸੰਪਰਕ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...', ta: 'தொடர்பு கொள்கிறது...' },
    farmer: { en: 'Farmer', gu: 'ખેડૂત', hi: 'किसान', mr: 'शेतकरी', pa: 'ਕਿਸਾਨ', ta: 'விவசாயி' }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONTACTED_KEY);
      if (saved) setContactedIds(JSON.parse(saved));
    } catch {}

    fetchListings();

    try {
      const savedScroll = sessionStorage.getItem('browse_scroll_pos');
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
          sessionStorage.removeItem('browse_scroll_pos');
        }, 300);
      }
    } catch {}
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select(`*, users:user_id (name, average_rating)`)
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

    if (diffHrs < 1) return lang === 'gu' ? 'હમણાં જ' : lang === 'hi' ? 'अभी' : lang === 'mr' ? 'आत्ताच' : lang === 'pa' ? 'ਹੁਣੇ' : lang === 'ta' ? 'இப்போது' : 'Just now';
    if (diffHrs < 24) return diffHrs + (lang === 'gu' ? ' કલાક પહેલા' : lang === 'hi' ? ' घंटे पहले' : lang === 'mr' ? ' तासांपूर्वी' : lang === 'pa' ? ' ਘੰਟੇ ਪਹਿਲਾਂ' : lang === 'ta' ? ' மணி நேரத்திற்கு முன்பு' : ' hours ago');
    if (diffDays < 7) return diffDays + (lang === 'gu' ? ' દિવસ પહેલા' : lang === 'hi' ? ' दिन पहले' : lang === 'mr' ? ' दिवसांपूर्वी' : lang === 'pa' ? ' ਦਿਨ ਪਹਿਲਾਂ' : lang === 'ta' ? ' நாட்களுக்கு முன்பு' : ' days ago');
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

      try {
        sessionStorage.setItem('browse_scroll_pos', String(window.scrollY));
      } catch {}

      const updated = contactedIds.includes(listing.id) ? contactedIds : [...contactedIds, listing.id];
      setContactedIds(updated);
      try {
        localStorage.setItem(CONTACTED_KEY, JSON.stringify(updated));
      } catch {}

      const cleanPhone = seller.phone.replace(/^\+?91/, '').replace(/\D/g, '');
      const message = `Namaste ${seller.seller_name || 'bhai'},\n\nAgri Check pe aapki *${listing.crop}* listing dekhi.\n${listing.quantity} quintal ₹${listing.expected_price}/quintal me chahiye.\n\n— Agri Check app se`;

      window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
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
      <button onClick={() => navigate('/mandi')} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <ArrowLeft size={18} /> {t.back[lang]}
      </button>

      <p className="eyebrow mt-4">09 / listings</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">🛒 {t.title[lang]}</h1>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
        {filteredListings.length} {t.found[lang]}
      </p>

      <div className="mt-4 space-y-2 rounded-xl border border-[hsl(var(--border))] p-3">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            placeholder={t.searchPh[lang]}
            className="min-h-10 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <input
          type="text"
          value={filterDistrict}
          onChange={(e) => setFilterDistrict(e.target.value)}
          placeholder={t.districtPh[lang]}
          className="min-h-10 w-full rounded-lg border border-[hsl(var(--border))] px-3 text-sm outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={filterMinPrice}
            onChange={(e) => setFilterMinPrice(e.target.value)}
            placeholder={t.minPrice[lang]}
            className="min-h-10 rounded-lg border border-[hsl(var(--border))] px-3 text-sm outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(e.target.value)}
            placeholder={t.maxPrice[lang]}
            className="min-h-10 rounded-lg border border-[hsl(var(--border))] px-3 text-sm outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">{error}</div>
      )}

      <div className="mt-4 space-y-3">
        {filteredListings.length === 0 && !loading && (
          <div className="rounded-xl border border-[hsl(var(--border))] p-8 text-center">
            <AlertCircle size={40} className="mx-auto text-[hsl(var(--muted-foreground))]" />
            <p className="mt-3 text-sm font-bold">{t.noListings[lang]}</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{t.tryFilter[lang]}</p>
            <Link href="/sell" className="mt-4 inline-block rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-bold text-[hsl(var(--primary-foreground))] no-underline">
              {t.createBtn[lang]}
            </Link>
          </div>
        )}

        {filteredListings.map((listing) => {
          const isOwnListing = listing.user_id === user?.id;
          const isContacted = contactedIds.includes(listing.id);

          return (
            <div key={listing.id} className={`rounded-xl border bg-[hsl(var(--card))] p-4 ${isContacted ? 'border-green-300' : 'border-[hsl(var(--border))]'}`}>
              
              {isContacted && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                  <CheckCircle2 size={12} /> {t.contacted[lang]}
                </div>
              )}

              <div className="flex gap-3">
                {listing.photos?.[0] ? (
                  <img src={listing.photos[0]} alt={listing.crop} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-[hsl(var(--muted))] text-3xl">🌾</div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold">{listing.crop}</h3>
                  <p className="mt-1 text-sm font-semibold text-[hsl(var(--primary))]">₹{listing.expected_price}/quintal</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{listing.quantity} quintal • {formatDate(listing.created_at)}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <MapPin size={12} />
                    {listing.village ? `${listing.village}, ` : ''}{listing.district}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <User size={14} className="text-[hsl(var(--muted-foreground))]" />
                  <span className="font-semibold">{listing.users?.name || t.farmer[lang]}</span>
                  {listing.users?.average_rating ? (
                    <span className="text-[hsl(var(--muted-foreground))]">⭐ {listing.users.average_rating.toFixed(1)}</span>
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
                <p className="mt-2 rounded-lg bg-[hsl(var(--muted))] p-2 text-xs">📝 {listing.description}</p>
              )}

              {isOwnListing ? (
                <div className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-center text-xs font-bold text-[hsl(var(--muted-foreground))]">
                  👤 {t.ownListing[lang]}
                </div>
              ) : (
                <button
                  onClick={() => handleContact(listing)}
                  disabled={contacting === listing.id}
                  className={`mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold disabled:opacity-50 ${
                    isContacted ? 'border border-green-300 bg-green-50 text-green-800' : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  }`}
                >
                  {contacting === listing.id ? (
                    <><Loader2 className="animate-spin" size={16} /> {t.contacting[lang]}</>
                  ) : isContacted ? (
                    <><CheckCircle2 size={16} /> {t.contactAgain[lang]}</>
                  ) : (
                    <><Phone size={16} /> {t.contact[lang]}</>
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
