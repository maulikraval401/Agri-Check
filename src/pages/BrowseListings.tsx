import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2, Search, MapPin, Phone, User, Calendar, AlertCircle, CheckCircle2, ArrowLeft, Star, X, Flag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

const PAGE_SIZE = 20;

interface BrowseListing {
  id: string;
  user_id: string;
  crop: string;
  quantity: number;
  unit: string;
  expected_price: number;
  ready_date: string | null;
  description: string | null;
  photos: string[];
  village: string | null;
  district: string;
  state: string;
  created_at: string;
  seller_name: string;
  seller_rating: number;
}

export default function BrowseListingsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  
  const [listings, setListings] = useState<BrowseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [contacting, setContacting] = useState<string | null>(null);
  
  // Rating States
  const [ratingListing, setRatingListing] = useState<BrowseListing | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Report States
  const [reportListing, setReportListing] = useState<BrowseListing | null>(null);
  const [reportReason, setReportReason] = useState('Fake Listing');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  
  // User-wise contacted list
  const contactedKey = user ? `agri_contacted_listings_${user.id}` : 'agri_contacted_listings_guest';
  const [contactedIds, setContactedIds] = useState<string[]>([]);

  // Rated listings (per user)
  const ratedKey = user ? `agri_rated_listings_${user.id}` : 'agri_rated_listings_guest';
  const [ratedIds, setRatedIds] = useState<string[]>([]);

  // Applied filters (Load More inko hi use karega)
  const [appliedFilters, setAppliedFilters] = useState({ crop: '', district: '', min: '', max: '' });

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
    filterBtn: { en: 'Search / Filter', gu: 'શોધો / ફિલ્ટર', hi: 'खोजें / फिल्टर', mr: 'शोधा / फिल्टर', pa: 'ਖੋਜੋ / ਫਿਲਟਰ', ta: 'தேடு / வடிகட்டு' },
    noListings: { en: 'No listings found', gu: 'કોઈ લિસ્ટિંગ મળી નથી', hi: 'कोई लिस्टिंग नहीं मिली', mr: 'कोणतीही लिस्टिंग आढळली नाही', pa: 'ਕੋਈ ਲਿਸਟਿੰਗ ਨਹੀਂ ਮਿਲੀ', ta: 'பட்டியல்கள் எதுவும் இல்லை' },
    tryFilter: { en: 'Change filters or check later', gu: 'ફિલ્ટર બદલો અથવા પછી જુઓ', hi: 'फिल्टर बदलें या बाद में देखें', mr: 'फिल्टर बदला किंवा नंतर पहा', pa: 'ਫਿਲਟਰ ਬਦਲੋ ਜਾਂ ਬਾਅਦ ਵਿੱਚ ਦੇਖੋ', ta: 'வடிகட்டிகளை மாற்றவும் அல்லது பின்னர் பார்க்கவும்' },
    createBtn: { en: 'Create First Listing', gu: 'પ્રથમ લિસ્ટિંગ બનાવો', hi: 'पहली लिस्टिंग बनाएं', mr: 'पहिली लिस्टिंग तयार करा', pa: 'ਪਹਿਲੀ ਲਿਸਟਿੰਗ ਬਣਾਓ', ta: 'முதல் பட்டியலை உருவாக்கு' },
    ownListing: { en: 'This is your listing', gu: 'આ તમારી લિસ્ટિંગ છે', hi: 'यह आपकी लिस्टिंग है', mr: 'हे तुमचे लिस्टिंग आहे', pa: 'ਇਹ ਤੁਹਾਡੀ ਲਿਸਟਿੰਗ ਹੈ', ta: 'இது உங்கள் பட்டியல்' },
    contacted: { en: 'You contacted', gu: 'તમે સંપર્ક કર્યો', hi: 'आपने संपर्क किया', mr: 'तुम्ही संपर्क केला', pa: 'ਤੁਸੀਂ ਸੰਪਰਕ ਕੀਤਾ', ta: 'நீங்கள் தொடர்பு கொண்டீர்கள்' },
    contact: { en: 'Contact', gu: 'સંપર્ક કરો', hi: 'संपर्क करें', mr: 'संपर्क करा', pa: 'ਸੰਪਰਕ ਕਰੋ', ta: 'தொடர்பு கொள்ள' },
    contactAgain: { en: 'Contact Again', gu: 'ફરી સંપર્ક કરો', hi: 'फिर संपर्क करें', mr: 'पुन्हा संपर्क करा', pa: 'ਦੁਬਾਰਾ ਸੰਪਰਕ ਕਰੋ', ta: 'மீண்டும் தொடர்பு கொள்ள' },
    contacting: { en: 'Contacting...', gu: 'સંપર્ક થઈ રહ્યો છે...', hi: 'संपर्क हो रहा है...', mr: 'संपर्क होत आहे...', pa: 'ਸੰਪਰਕ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...', ta: 'தொடர்பு கொள்கிறது...' },
    farmer: { en: 'Farmer', gu: 'ખેડૂત', hi: 'किसान', mr: 'शेतकरी', pa: 'ਕਿਸਾਨ', ta: 'விவசாயி' },
    loadMore: { en: 'Load More', gu: 'વધુ લોડ કરો', hi: 'और लोड करें', mr: 'अधिक लोड करा', pa: 'ਹੋਰ ਲੋਡ ਕਰੋ', ta: 'மேலும் ஏற்று' },
    loading: { en: 'Loading...', gu: 'લોડ થઈ રહ્યું છે...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...', pa: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...', ta: 'ஏற்றுகிறது...' },
    rateSeller: { en: 'Rate', gu: 'રેટ કરો', hi: 'रेट करें', mr: 'रेट करा', pa: 'ਰੇਟ ਕਰੋ', ta: 'மதிப்பிடு' },
    submit: { en: 'Submit', gu: 'સબમિટ કરો', hi: 'जमा करें', mr: 'सबमिट करा', pa: 'ਸਬਮਿਟ ਕਰੋ', ta: 'சமர்ப்பிக்கவும்' },
    reviewPh: { en: 'Write a review (optional)...', gu: 'સમીક્ષા લખો (વૈકલ્પિક)...', hi: 'समीक्षा लिखें (वैकल्पिक)...', mr: 'पुनरावलोकन लिहा (पर्यायी)...', pa: 'ਸਮੀਖਿਆ ਲਿਖੋ (ਵਿਕਲਪਿਕ)...', ta: 'விமர்சனம் எழுதுங்கள் (விருப்பம்)...' },
    ratingSuccess: { en: 'Rating submitted!', gu: 'રેટિંગ સબમિટ થઈ ગઈ!', hi: 'रेटिंग जमा हो गई!', mr: 'रेटिंग सबमिट झाले!', pa: 'ਰੇਟਿੰਗ ਸਬਮਿਟ ਹੋ ਗਈ!', ta: 'மதிப்பீடு சமர்ப்பிக்கப்பட்டது!' },
    alreadyRated: { en: 'You already rated this seller for this listing', gu: 'તમે આ લિસ્ટિંગ માટે રેટ કરી ચૂક્યા છો', hi: 'आप इस लिस्टिंग के लिए रेट कर चुके हैं', mr: 'तुम्ही या लिस्टिंगसाठी आधीच रेट केले आहे', pa: 'ਤੁਸੀਂ ਇਸ ਲਿਸਟਿੰਗ ਲਈ ਪਹਿਲਾਂ ਹੀ ਰੇਟ ਕੀਤਾ ਹੈ', ta: 'இந்த பட்டியலுக்கு நீங்கள் ஏற்கனவே மதிப்பிட்டுள்ளீர்கள்' },
    
    // Errors & misc
    errOwn: { en: 'You cannot contact your own listing', gu: 'તમે તમારી જ લિસ્ટિંગ પર સંપર્ક કરી શકતા નથી', hi: 'आप अपनी ही लिस्टिंग पर संपर्क नहीं कर सकते', mr: 'तुम्ही तुमच्याच लिस्टिंगवर संपर्क करू शकत नाही', pa: 'ਤੁਸੀਂ ਆਪਣੀ ਹੀ ਲਿਸਟਿੰਗ ਨਾਲ ਸੰਪਰਕ ਨਹੀਂ ਕਰ ਸਕਦੇ', ta: 'உங்கள் சொந்த பட்டியலைத் தொடர்பு கொள்ள முடியாது' },
    errInactive: { en: 'This listing is no longer active', gu: 'આ લિસ્ટિંગ હવે એક્ટિવ નથી', hi: 'यह लिस्टिंग अब सक्रिय नहीं है', mr: 'ही लिस्टिंग आता सक्रिय नाही', pa: 'ਇਹ ਲਿਸਟਿੰਗ ਹੁਣ ਸਰਗਰਮ ਨਹੀਂ ਹੈ', ta: 'இந்த பட்டியல் இனி செயலில் இல்லை' },
    errLimit: { en: 'You contacted too many sellers today. Try again tomorrow.', gu: 'તમે આજે ઘણા વેચનારનો સંપર્ક કરી લીધો છે. કાલે ફરી પ્રયાસ કરો.', hi: 'आपने आज बहुत ज्यादा विक्रेताओं से संपर्क कर लिया है। कल फिर कोशिश करें।', mr: 'तुम्ही आज खूप विक्रेत्यांशी संपर्क केला आहे. उद्या पुन्हा प्रयत्न करा.', pa: 'ਤੁਸੀਂ ਅੱਜ ਬਹੁਤ ਸਾਰੇ ਵੇਚਣ ਵਾਲਿਆਂ ਨਾਲ ਸੰਪਰਕ ਕਰ ਲਿਆ ਹੈ। ਕੱਲ੍ਹ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', ta: 'இன்று நீங்கள் அதிக விற்பனையாளர்களைத் தொடர்பு கொண்டுவிட்டீர்கள். நாளை மீண்டும் முயலவும்.' },
    errNoPhone: { en: "Seller's phone number not found", gu: 'વેચનારનો ફોન નંબર મળ્યો નથી', hi: 'विक्रेता का फोन नंबर नहीं मिला', mr: 'विक्रेत्याचा फोन नंबर सापडला नाही', pa: 'ਵੇਚਣ ਵਾਲੇ ਦਾ ਫ਼ੋਨ ਨੰਬਰ ਨਹੀਂ ਮਿਲਿਆ', ta: 'விற்பனையாளரின் தொலைபேசி எண் கிடைக்கவில்லை' },
    errGeneric: { en: 'Something went wrong. Please try again.', gu: 'કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.', hi: 'कुछ गलत हुआ। फिर से कोशिश करें।', mr: 'काहीतरी चुकले. पुन्हा प्रयत्न करा.', pa: 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', ta: 'ஏதோ தவறு நடந்தது. மீண்டும் முயலவும்.' },
    errLoad: { en: 'Could not load listings', gu: 'લિસ્ટિંગ લોડ થઈ નથી', hi: 'लिस्टिंग लोड नहीं हुईं', mr: 'लिस्टिंग लोड झाल्या नाहीत', pa: 'ਲਿਸਟਿੰਗਾਂ ਲੋਡ ਨਹੀਂ ਹੋਈਆਂ', ta: 'பட்டியல்களை ஏற்ற முடியவில்லை' },
    errRateNotAllowed: { en: 'You can rate only sellers you have contacted', gu: 'તમે ફક્ત જેમનો સંપર્ક કર્યો હોય તેમને જ રેટ કરી શકો', hi: 'आप सिर्फ उन्हीं विक्रेताओं को रेट कर सकते हैं जिनसे आपने संपर्क किया है', mr: 'तुम्ही फक्त ज्यांच्याशी संपर्क केला त्यांनाच रेट करू शकता', pa: 'ਤੁਸੀਂ ਸਿਰਫ਼ ਉਨ੍ਹਾਂ ਨੂੰ ਰੇਟ ਕਰ ਸਕਦੇ ਹੋ ਜਿਨ੍ਹਾਂ ਨਾਲ ਤੁਸੀਂ ਸੰਪਰਕ ਕੀਤਾ ਹੈ', ta: 'நீங்கள் தொடர்பு கொண்ட விற்பனையாளர்களை மட்டுமே மதிப்பிட முடியும்' },
    rated: { en: 'Rated ✓', gu: 'રેટ થયું ✓', hi: 'रेट किया ✓', mr: 'रेट केले ✓', pa: 'ਰੇਟ ਕੀਤਾ ✓', ta: 'மதிப்பிட்டது ✓' },

    // Report Translations
    report: { en: 'Report', gu: 'રિપોર્ટ', hi: 'रिपोर्ट', mr: 'रिपोर्ट', pa: 'ਰਿਪੋਰਟ', ta: 'புகார்' },
    reportTitle: { en: 'Report Listing', gu: 'લિસ્ટિંગ રિપોર્ટ કરો', hi: 'लिस्टिंग रिपोर्ट करें', mr: 'लिस्टिंग रिपोर्ट करा', pa: 'ਲਿਸਟਿੰਗ ਰਿਪੋਰਟ ਕਰੋ', ta: 'பட்டியலைப் புகாரளி' },
    reasonFake: { en: 'Fake Listing', gu: 'ખોટી લિસ્ટિંગ', hi: 'फर्जी लिस्टिंग', mr: 'बनावट लिस्टिंग', pa: 'ਫਰਜ਼ੀ ਲਿਸਟਿੰਗ', ta: 'போலி பட்டியல்' },
    reasonSpam: { en: 'Spam / Wrong Info', gu: 'સ્પામ / ખોટી માહિતી', hi: 'स्पैम / गलत जानकारी', mr: 'स्पॅम / चुकीची माहिती', pa: 'ਸਪੈਮ / ਗਲਤ ਜਾਣਕਾਰੀ', ta: 'ஸ்பேம் / தவறான தகவல்' },
    reasonSold: { en: 'Already Sold', gu: 'પહેલેથી વેચાઈ ગયું', hi: 'पहले ही बिक चुका है', mr: 'आधीच विकले', pa: 'ਪਹਿਲਾਂ ਹੀ ਵਿਕ ਗਿਆ', ta: 'ஏற்கனவே விற்கப்பட்டது' },
    reasonOther: { en: 'Other', gu: 'અન્ય', hi: 'अन्य', mr: 'इतर', pa: 'ਹੋਰ', ta: 'மற்றவை' },
    detailsPh: { en: 'More details (optional)...', gu: 'વધુ વિગતો (વૈકલ્પિક)...', hi: 'अधिक जानकारी (वैकल्पिक)...', mr: 'अधिक तपशील (पर्यायी)...', pa: 'ਹੋਰ ਜਾਣਕਾਰੀ (ਵਿਕਲਪਿਕ)...', ta: 'மேலும் விவரங்கள் (விருப்பம்)...' },
    reportSuccess: { en: 'Report submitted. Thank you!', gu: 'રિપોર્ટ સબમિટ થઈ ગયો. આભાર!', hi: 'रिपोर्ट जमा हो गई। धन्यवाद!', mr: 'रिपोर्ट सबमिट झाला. धन्यवाद!', pa: 'ਰਿਪੋਰਟ ਸਬਮਿਟ ਹੋ ਗਈ। ਧੰਨਵਾਦ!', ta: 'புகார் சமர்ப்பிக்கப்பட்டது. நன்றி!' },
    alreadyReported: { en: 'You already reported this listing.', gu: 'તમે આ લિસ્ટિંગ પહેલેથી રિપોર્ટ કરી છે.', hi: 'आप इस लिस्टिंग को पहले ही रिपोर्ट कर चुके हैं।', mr: 'तुम्ही ही लिस्टिंग आधीच रिपोर्ट केली आहे.', pa: 'ਤੁਸੀਂ ਇਸ ਲਿਸਟਿੰਗ ਨੂੰ ਪਹਿਲਾਂ ਹੀ ਰਿਪੋਰਟ ਕੀਤਾ ਹੈ।', ta: 'இந்த பட்டியலை நீங்கள் ஏற்கனவே புகாரளித்துள்ளீர்கள்.' }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(contactedKey);
      if (saved) setContactedIds(JSON.parse(saved));
    } catch {}
    try {
      const savedRated = localStorage.getItem(ratedKey);
      if (savedRated) setRatedIds(JSON.parse(savedRated));
    } catch {}

    fetchListings(0, true);
    
    try {
      const savedScroll = sessionStorage.getItem('browse_scroll_pos');
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
          sessionStorage.removeItem('browse_scroll_pos');
        }, 300);
      }
    } catch {}
  }, [user]);

  const fetchListings = async (pageNumber: number, isInitial = false, f = appliedFilters) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    
    setError('');
    try {
      const { data, error: rpcError } = await supabase.rpc('get_browse_listings', {
        p_limit: PAGE_SIZE,
        p_offset: pageNumber * PAGE_SIZE,
        p_crop: f.crop.trim() || null,
        p_district: f.district.trim() || null,
        p_min_price: f.min ? Number(f.min) : null,
        p_max_price: f.max ? Number(f.max) : null,
      });

      if (rpcError) throw rpcError;

      const newListings = data || [];
      
      if (isInitial) {
        setListings(newListings);
      } else {
        setListings((prev) => [...prev, ...newListings]);
      }
      
      setHasMore(newListings.length === PAGE_SIZE);
      setPage(pageNumber);
      
    } catch (err: any) {
      setError(t.errLoad[lang]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilters = () => {
    const f = { crop: searchCrop, district: filterDistrict, min: filterMinPrice, max: filterMaxPrice };
    setAppliedFilters(f);
    fetchListings(0, true, f);
  };

  const handleContact = async (listing: BrowseListing) => {
    if (!user) {
      navigate('/login?redirect=/listings');
      return;
    }

    setContacting(listing.id);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_listing_contact', {
        p_listing_id: listing.id,
      });

      if (rpcError) {
        const m = (rpcError.message || '').toLowerCase();
        if (m.includes('your own listing')) {
          alert(t.errOwn[lang]);
        } else if (m.includes('not active') || m.includes('not found')) {
          alert(t.errInactive[lang]);
        } else if (m.includes('login required')) {
          navigate('/login?redirect=/listings');
        } else if (m.includes('limit reached')) {
          alert(t.errLimit[lang]);
        } else {
          alert(t.errGeneric[lang]);
        }
        return;
      }

      const seller = data?.[0];
      if (!seller?.phone) {
        alert(t.errNoPhone[lang]);
        return;
      }

      try {
        sessionStorage.setItem('browse_scroll_pos', String(window.scrollY));
      } catch {}

      const updated = contactedIds.includes(listing.id) ? contactedIds : [...contactedIds, listing.id];
      setContactedIds(updated);
      try {
        localStorage.setItem(contactedKey, JSON.stringify(updated));
      } catch {}

      // Double 91 fix
      const cleanPhone = seller.phone.replace(/^\+?91/, '').replace(/\D/g, '');
      const message = `Namaste ${seller.seller_name || 'bhai'},\n\nAgri Check pe aapki *${listing.crop}* listing dekhi.\n${listing.quantity} quintal ₹${listing.expected_price}/quintal me chahiye.\n\n— Agri Check app se`;

      window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    } catch (err: any) {
      alert(t.errGeneric[lang]);
    } finally {
      setContacting(null);
    }
  };

  const submitRating = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!ratingListing) return;

    setSubmittingRating(true);
    try {
      const { error } = await supabase.from('ratings').insert({
        listing_id: ratingListing.id,
        reviewer_id: user.id,
        reviewee_id: ratingListing.user_id,
        rating: ratingStars,
        review_text: ratingReview.trim() || null
      });

      const markRated = () => {
        const updated = ratedIds.includes(ratingListing.id) ? ratedIds : [...ratedIds, ratingListing.id];
        setRatedIds(updated);
        try { localStorage.setItem(ratedKey, JSON.stringify(updated)); } catch {}
      };

      if (error) {
        if (error.code === '23505') {
          markRated();
          alert(t.alreadyRated[lang]);
        } else {
          throw error;
        }
      } else {
        markRated();
        alert(t.ratingSuccess[lang]);
      }
    } catch (err: any) {
      const m = (err?.message || '').toLowerCase();
      if (m.includes('row-level security') || m.includes('cannot rate')) {
        alert(t.errRateNotAllowed[lang]);
      } else {
        alert(t.errGeneric[lang]);
      }
    } finally {
      setSubmittingRating(false);
      setRatingListing(null);
      setRatingStars(5);
      setRatingReview('');
    }
  };

  const submitReport = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!reportListing) return;

    setSubmittingReport(true);
    try {
      const { error } = await supabase.from('reports').insert({
        listing_id: reportListing.id,
        reporter_id: user.id,
        reason: reportReason,
        details: reportDetails.trim() || null
      });

      if (error) {
        if (error.code === '23505') {
          alert(t.alreadyReported[lang]);
        } else {
          throw error;
        }
      } else {
        alert(t.reportSuccess[lang]);
      }
    } catch (err: any) {
      alert(t.errGeneric[lang]);
    } finally {
      setSubmittingReport(false);
      setReportListing(null);
      setReportDetails('');
    }
  };

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

  if (loading && page === 0) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen px-4 py-6 pb-24 relative">
      <button onClick={() => navigate('/mandi')} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <ArrowLeft size={18} /> {t.back[lang]}
      </button>

      <p className="eyebrow mt-4">09 / listings</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">🛒 {t.title[lang]}</h1>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
        {listings.length} {t.found[lang]} {hasMore && '+'}
      </p>

      {/* Filters */}
      <div className="mt-4 space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
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
        <button
          onClick={applyFilters}
          className="mt-2 w-full min-h-10 rounded-lg bg-[hsl(var(--primary)/.1)] text-sm font-bold text-[hsl(var(--primary))]"
        >
          {t.filterBtn[lang]}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">{error}</div>
      )}

      {/* Listings */}
      <div className="mt-4 space-y-3">
        {listings.length === 0 && !loading && !loadingMore && (
          <div className="rounded-xl border border-[hsl(var(--border))] p-8 text-center">
            <AlertCircle size={40} className="mx-auto text-[hsl(var(--muted-foreground))]" />
            <p className="mt-3 text-sm font-bold">{t.noListings[lang]}</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{t.tryFilter[lang]}</p>
            <Link href="/sell" className="mt-4 inline-block rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-bold text-[hsl(var(--primary-foreground))] no-underline">
              {t.createBtn[lang]}
            </Link>
          </div>
        )}

        {listings.map((listing) => {
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
                    {listing.village && listing.village.trim().toLowerCase() !== listing.district.trim().toLowerCase()
                      ? `${listing.village.trim()}, `
                      : ''}{listing.district.trim()}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <User size={14} className="text-[hsl(var(--muted-foreground))]" />
                  <span className="font-semibold">{listing.seller_name || t.farmer[lang]}</span>
                  {listing.seller_rating ? (
                    <span className="text-[hsl(var(--muted-foreground))]">⭐ {listing.seller_rating.toFixed(1)}</span>
                  ) : null}
                  
                  {!isOwnListing && (
  <div className="flex items-center gap-1 ml-2">
    {/* Sirf tab dikhega jab contact kiya ho */}
    {isContacted && (
      ratedIds.includes(listing.id) ? (
        <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
          {t.rated[lang]}
        </span>
      ) : (
        <button 
          onClick={() => setRatingListing(listing)} 
          className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]"
        >
          {t.rateSeller[lang]}
        </button>
      )
    )}
                      <button 
                        onClick={() => setReportListing(listing)} 
                        className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 hover:bg-red-100 flex items-center gap-0.5"
                      >
                        <Flag size={10} /> {t.report[lang]}
                      </button>
                    </div>
                  )}
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

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => fetchListings(page + 1)}
            disabled={loadingMore}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] px-6 text-sm font-bold disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="animate-spin" size={18} /> : null}
            {loadingMore ? t.loading[lang] : t.loadMore[lang]}
          </button>
        </div>
      )}

      {/* Rating Modal */}
      {ratingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[hsl(var(--card))] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{t.rateSeller[lang]}</h3>
              <button onClick={() => setRatingListing(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4 text-center">
              {ratingListing.seller_name || t.farmer[lang]}
            </p>
            
            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRatingStars(star)} className="p-1 transition-transform hover:scale-110">
                  <Star 
                    size={36} 
                    fill={star <= ratingStars ? "#facc15" : "none"} 
                    className={star <= ratingStars ? "text-yellow-400" : "text-gray-300"} 
                  />
                </button>
              ))}
            </div>

            <textarea
              value={ratingReview}
              onChange={(e) => setRatingReview(e.target.value)}
              placeholder={t.reviewPh[lang]}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-sm outline-none resize-none h-24"
            />

            <button
              onClick={submitRating}
              disabled={submittingRating}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50"
            >
              {submittingRating && <Loader2 className="animate-spin" size={16} />}
              {t.submit[lang]}
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[hsl(var(--card))] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <Flag size={18} /> {t.reportTitle[lang]}
              </h3>
              <button onClick={() => setReportListing(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="reason" value="Fake Listing" checked={reportReason === 'Fake Listing'} onChange={(e) => setReportReason(e.target.value)} className="w-4 h-4 text-red-600" />
                {t.reasonFake[lang]}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="reason" value="Spam / Wrong Info" checked={reportReason === 'Spam / Wrong Info'} onChange={(e) => setReportReason(e.target.value)} className="w-4 h-4 text-red-600" />
                {t.reasonSpam[lang]}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="reason" value="Already Sold" checked={reportReason === 'Already Sold'} onChange={(e) => setReportReason(e.target.value)} className="w-4 h-4 text-red-600" />
                {t.reasonSold[lang]}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="reason" value="Other" checked={reportReason === 'Other'} onChange={(e) => setReportReason(e.target.value)} className="w-4 h-4 text-red-600" />
                {t.reasonOther[lang]}
              </label>
            </div>

            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder={t.detailsPh[lang]}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-sm outline-none resize-none h-20"
            />

            <button
              onClick={submitReport}
              disabled={submittingReport}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {submittingReport && <Loader2 className="animate-spin" size={16} />}
              {t.submit[lang]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
