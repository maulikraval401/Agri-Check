import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Loader2, Share2, Copy, Check, AlertTriangle, Info, Camera, X, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { fetchMandiPrices } from '@/lib/mandi';
import { supabase } from '@/lib/supabase';

const CROPS = [
  { key: 'Cotton', emoji: '🌿' }, { key: 'Wheat', emoji: '🌾' }, { key: 'Rice', emoji: '🌾' },
  { key: 'Maize', emoji: '🌽' }, { key: 'Groundnut', emoji: '🥜' }, { key: 'Soybean', emoji: '🌱' },
  { key: 'Sugarcane', emoji: '🎋' }, { key: 'Onion', emoji: '🧅' }, { key: 'Potato', emoji: '🥔' },
  { key: 'Tomato', emoji: '🍅' }, { key: 'Banana', emoji: '🍌' }, { key: 'Mango', emoji: '🥭' },
  { key: 'Chilli', emoji: '🌶️' }, { key: 'Turmeric', emoji: '🟡' }, { key: 'Cumin', emoji: '🌿' },
  { key: 'Coriander', emoji: '🌿' }, { key: 'Bajra', emoji: '🌾' }, { key: 'Jowar', emoji: '🌾' },
  { key: 'Urad', emoji: '🫘' }, { key: 'Moong', emoji: '🫘' }, { key: 'Sesame', emoji: '⚪' },
  { key: 'Mustard', emoji: '🌼' }, { key: 'Castor', emoji: '🌿' },
];

const UNIT = 'quintal';
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function SellCropPage() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [crop, setCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [readyDate, setReadyDate] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [mandiPrices, setMandiPrices] = useState<number[]>([]);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  const lang = ['en', 'gu', 'hi', 'mr', 'pa', 'ta'].includes(language) ? language : 'en';

  const t = {
    back: { en: 'Back', gu: 'પાછળ', hi: 'पीछे', mr: 'मागे', pa: 'ਪਿੱਛੇ', ta: 'பின்னால்' },
    title: { en: 'Sell Crop', gu: 'ફસલ વેચો', hi: 'फसल बेचें', mr: 'पीक विका', pa: 'ਫ਼ਸਲ ਵੇਚੋ', ta: 'பயிரை விற்க' },
    subtitle: { en: 'Fill details and reach buyers', gu: 'વિગતો ભરો અને ખરીદનાર સુધી પહોંચો', hi: 'विवरण भरें और खरीदारों तक पहुंचें', mr: 'तपशील भरा आणि खरेदीदारांपर्यंत पोहोचा', pa: 'ਵੇਰਵੇ ਭਰੋ ਅਤੇ ਖਰੀਦਦਾਰਾਂ ਤੱਕ ਪਹੁੰਚੋ', ta: 'விவரங்களை நிரப்பி வாங்குபவர்களை அடையுங்கள்' },
    cropLabel: { en: 'Crop *', gu: 'ફસલ *', hi: 'फसल *', mr: 'पीक *', pa: 'ਫ਼ਸਲ *', ta: 'பயிர் *' },
    cropSelect: { en: '-- Select Crop --', gu: '-- ફસલ પસંદ કરો --', hi: '-- फसल चुनें --', mr: '-- पीक निवडा --', pa: '-- ਫ਼ਸਲ ਚੁਣੋ --', ta: '-- பயிரைத் தேர்ந்தெடு --' },
    qtyLabel: { en: 'Quantity (quintal) *', gu: 'જથ્થો (ક્વિન્ટલ) *', hi: 'मात्रा (क्विंटल) *', mr: 'प्रमाण (क्विंटल) *', pa: 'ਮਾਤਰਾ (ਕੁਇੰਟਲ) *', ta: 'அளவு (குவிண்டால்) *' },
    qtyHint: { en: '1 quintal = 100 kg', gu: '1 ક્વિન્ટલ = 100 કિલો', hi: '1 क्विंटल = 100 किलो', mr: '1 क्विंटल = 100 किलो', pa: '1 ਕੁਇੰਟਲ = 100 ਕਿਲੋ', ta: '1 குவிண்டால் = 100 கிலோ' },
    priceLabel: { en: 'Your price (₹/quintal) *', gu: 'તમારો ભાવ (₹/ક્વિન્ટલ) *', hi: 'आपका भाव (₹/क्विंटल) *', mr: 'तुमचा दर (₹/ક્વિન્ટલ) *', pa: 'ਤੁਹਾਡਾ ਭਾਅ (₹/ਕੁਇੰਟਲ) *', ta: 'உங்கள் விலை (₹/குவிண்டால்) *' },
    mandiLoading: { en: 'Loading mandi prices...', gu: 'મંડી ભાવ લોડ થઈ રહ્યા છે...', hi: 'मंडी भाव लोड हो रहे हैं...', mr: 'बाजारभाव लोड होत आहेत...', pa: 'ਮੰਡੀ ਭਾਅ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...', ta: 'மண்டி விலைகள் ஏற்றப்படுகின்றன...' },
    mandiMedian: { en: 'Today mandi price (median)', gu: 'આજનો મંડી ભાવ (મધ્યસ્થ)', hi: 'आज का मंडी भाव (माध्यिका)', mr: 'आजचा बाजारभाव (मध्यमान)', pa: 'ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ (ਮੱਧਮਾਨ)', ta: 'இன்றைய மண்டி விலை (இடைநிலை)' },
    mandiNo: { en: 'No mandi price found for this crop', gu: 'આ ફસલ માટે કોઈ મંડી ભાવ મળ્યો નથી', hi: 'इस फसल के लिए कोई मंडी भाव नहीं मिला', mr: 'या पिकासाठी बाजारभाव आढळला नाही', pa: 'ਇਸ ਫ਼ਸਲ ਲਈ ਕੋਈ ਮੰਡੀ ਭਾਅ ਨਹੀਂ ਮਿਲਿਆ', ta: 'இந்த பயிருக்கு மண்டி விலை இல்லை' },
    cmpClose: { en: 'Your price is close to mandi', gu: 'તમારો ભાવ મંડીની નજીક છે', hi: 'आपका भाव मंडी के करीब है', mr: 'तुमचा दर बाजारभावाच्या जवळ आहे', pa: 'ਤੁਹਾਡਾ ਭਾਅ ਮੰਡੀ ਦੇ ਨੇੜੇ ਹੈ', ta: 'உங்கள் விலை மண்டிக்கு அருகில் உள்ளது' },
    cmpHigh: { en: 'Your price is higher than mandi', gu: 'તમારો ભાવ મંડી કરતાં વધારે છે', hi: 'आपका भाव मंडी से ज्यादा है', mr: 'तुमचा दर बाजारभावापेक्षा जास्त आहे', pa: 'ਤੁਹਾਡਾ ਭਾਅ ਮੰਡੀ ਤੋਂ ਵੱਧ ਹੈ', ta: 'உங்கள் விலை மண்டியை விட அதிகம்' },
    cmpLow: { en: 'Your price is lower than mandi', gu: 'તમારો ભાવ મંડી કરતાં ઓછો છે', hi: 'आपका भाव मंडी से कम है', mr: 'तुमचा दर बाजारभावापेक्षा कमी आहे', pa: 'ਤੁਹਾਡਾ ਭਾਅ ਮੰਡੀ ਤੋਂ ਘੱਟ ਹੈ', ta: 'உங்கள் விலை மண்டியை விட குறைவு' },
    more: { en: 'more', gu: 'વધારે', hi: 'ज्यादा', mr: 'जास्त', pa: 'ਵੱਧ', ta: 'அதிகம்' },
    less: { en: 'less', gu: 'ઓછું', hi: 'कम', mr: 'कमी', pa: 'ਘੱਟ', ta: 'குறைவு' },
    readyLabel: { en: 'Ready from date?', gu: 'કઈ તારીખથી તૈયાર છે?', hi: 'किस तारीख से तैयार है?', mr: 'कोणत्या तारखेपासून तयार आहे?', pa: 'ਕਿਹੜੀ ਤਾਰੀਖ ਤੋਂ ਤਿਆਰ ਹੈ?', ta: 'எந்த தேதியிலிருந்து தயார்?' },
    villageLabel: { en: 'Village', gu: 'ગામ', hi: 'गांव', mr: 'गाव', pa: 'ਪਿੰਡ', ta: 'கிராமம்' },
    districtLabel: { en: 'District *', gu: 'જિલ્લો *', hi: 'जिला *', mr: 'जिल्हा *', pa: 'ਜ਼ਿਲ੍ਹਾ *', ta: 'மாவட்டம் *' },
    phoneLabel: { en: 'Phone Number', gu: 'ફોન નંબર', hi: 'फोन नंबर', mr: 'फोन नंबर', pa: 'ਫੋਨ ਨੰਬਰ', ta: 'தொலைபேசி எண்' },
    noteLabel: { en: 'Note (optional)', gu: 'નોંધ (વૈકલ્પિક)', hi: 'नोट (वैकल्पिक)', mr: 'टीप (ऐच्छिक)', pa: 'ਨੋਟ (ਵਿਕਲਪਿਕ)', ta: 'குறிப்பு (விருப்பம்)' },
    noteHint: { en: 'A-grade quality, good condition', gu: 'A-ગ્રેડ ગુણવત્તા, સારી સ્થિતિ', hi: 'A-ग्रेड गुणवत्ता, अच्छी स्थिति', mr: 'A-दर्जा गुणवत्ता, चांगली स्थिती', pa: 'A-ਗ੍ਰੇਡ ਗੁਣਵੱਤਾ, ਚੰਗੀ ਸਥਿਤੀ', ta: 'A-தரம், நல்ல நிலை' },
    photoLabel: { en: 'Photo (optional)', gu: 'ફોટો (વૈકલ્પિક)', hi: 'फोटो (वैकल्पिक)', mr: 'फोटो (ऐच्छिक)', pa: 'ਫੋਟੋ (ਵਿਕਲਪਿਕ)', ta: 'புகைப்படம் (விருப்பம்)' },
    photoHint: { en: 'Add photo (JPG/PNG/WebP, max 5 MB)', gu: 'ફોટો ઉમેરો (JPG/PNG/WebP, મહત્તમ 5 MB)', hi: 'फोटो जोड़ें (JPG/PNG/WebP, अधिकतम 5 MB)', mr: 'फोटो जोडा (JPG/PNG/WebP, कमाल 5 MB)', pa: 'ਫੋਟੋ ਸ਼ਾਮਲ ਕਰੋ (JPG/PNG/WebP, ਵੱਧ ਤੋਂ ਵੱਧ 5 MB)', ta: 'புகைப்படத்தைச் சேர் (JPG/PNG/WebP, அதிகபட்சம் 5 MB)' },
    preview: { en: 'Message Preview', gu: 'સંદેશ પૂર્વદર્શન', hi: 'संदेश पूर्वावलोकन', mr: 'संदेश पूर्वावलोकन', pa: 'ਸੁਨੇਹਾ ਝਲਕ', ta: 'செய்தி முன்னோட்டம்' },
    publishBtn: { en: 'Publish Listing', gu: 'લિસ્ટિંગ પ્રકાશિત કરો', hi: 'लिस्टिंग प्रकाशित करें', mr: 'लिस्टिंग प्रकाशित करा', pa: 'ਲਿਸਟਿੰਗ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ', ta: 'பட்டியலை வெளியிடு' },
    publishing: { en: 'Publishing...', gu: 'પ્રકાશિત થઈ રહ્યું છે...', hi: 'प्रकाशित हो रहा है...', mr: 'प्रकाशित होत आहे...', pa: 'ਪ੍ਰਕਾਸ਼ਿਤ ਹੋ ਰਿਹਾ ਹੈ...', ta: 'வெளியிடப்படுகிறது...' },
    publishHint: { en: 'Listing will show on "Sabki Fasal"', gu: 'લિસ્ટિંગ "બધાની ફસલ" પર દેખાશે', hi: 'लिस्टिंग "सबकी फसल" पर दिखेगी', mr: 'लिस्टिंग "सर्वांचे पीक" वर दिसेल', pa: 'ਲਿਸਟਿੰਗ "ਸਭ ਦੀ ਫ਼ਸਲ" ਤੇ ਦਿਖੇਗੀ', ta: 'பட்டியல் "அனைவரின் பயிர்" பக்கத்தில் தோன்றும்' },
    shareBtn: { en: 'WhatsApp', gu: 'WhatsApp', hi: 'WhatsApp', mr: 'WhatsApp', pa: 'WhatsApp', ta: 'WhatsApp' },
    copyBtn: { en: 'Copy', gu: 'કોપી કરો', hi: 'कॉपी करें', mr: 'कॉपी करा', pa: 'ਕਾਪੀ ਕਰੋ', ta: 'நகலெடு' },
    copiedBtn: { en: 'Copied', gu: 'કોપી થયું', hi: 'कॉपी हो गया', mr: 'कॉपी झाले', pa: 'ਕਾਪੀ ਹੋ ਗਿਆ', ta: 'நகலெடுக்கப்பட்டது' },
    safety: { en: 'Safety Warning', gu: 'સુરક્ષા ચેતવણી', hi: 'सुरक्षा चेतावनी', mr: 'सुरक्षा इशारा', pa: 'ਸੁਰੱਖਿਆ ਚੇਤਾਵਨੀ', ta: 'பாதுகாப்பு எச்சரிக்கை' },
    safetyDesc: { en: 'Never give/take advance money. Verify goods and buyer first.', gu: 'ક્યારેય એડવાન્સ પૈસા ન આપો/લો. પહેલા માલ અને ખરીદનારની ચકાસણી કરો.', hi: 'कभी एडवांस पैसे न दें/लें। पहले माल और खरीदार की जांच करें।', mr: 'कधीही ॲडव्हान्स पैसे देऊ/घेऊ नका. आधी माल आणि खरेदीदाराची तपासणी करा.', pa: 'ਕਦੇ ਐਡਵਾਂਸ ਪੈਸੇ ਨਾ ਦਿਓ/ਲਓ। ਪਹਿਲਾਂ ਮਾਲ ਅਤੇ ਖਰੀਦਦਾਰ ਦੀ ਜਾਂਚ ਕਰੋ।', ta: 'முன்பணம் கொடுக்கவோ வாங்கவோ வேண்டாம். முதலில் பொருள் மற்றும் வாங்குபவரை சரிபார்க்கவும்.' },
    legal: { en: 'This app only connects farmers and buyers. Actual trade through APMC or e-NAM. Agri Check is not responsible for any transaction.', gu: 'આ એપ ફક્ત ખેડૂત અને ખરીદનારને જોડે છે. વાસ્તવિક વેપાર APMC અથવા e-NAM દ્વારા. Agri Check કોઈપણ વ્યવહાર માટે જવાબદાર નથી.', hi: 'यह ऐप केवल किसान और खरीदार को जोड़ता है। वास्तविक व्यापार APMC या e-NAM के माध्यम से। Agri Check किसी भी लेन-देन के लिए जिम्मेदार नहीं है।', mr: 'हे ॲप फक्त शेतकरी आणि खरेदीदार जोडते. प्रत्यक्ष व्यापार APMC किंवा e-NAM द्वारे. Agri Check कोणत्याही व्यवहारासाठी जबाबदार नाही.', pa: 'ਇਹ ਐਪ ਸਿਰਫ਼ ਕਿਸਾਨ ਅਤੇ ਖਰੀਦਦਾਰ ਨੂੰ ਜੋੜਦੀ ਹੈ। ਅਸਲੀ ਵਪਾਰ APMC ਜਾਂ e-NAM ਰਾਹੀਂ। Agri Check ਕਿਸੇ ਵੀ ਲੈਣ-ਦੇਣ ਲਈ ਜ਼ਿੰਮੇਵਾਰ ਨਹੀਂ ਹੈ।', ta: 'இந்த செயலி விவசாயிகள் மற்றும் வாங்குபவர்களை மட்டுமே இணைக்கிறது. உண்மையான வணிகம் APMC அல்லது e-NAM மூலம். Agri Check எந்தவொரு பரிவர்த்தனைக்கும் பொறுப்பல்ல.' },
    successTitle: { en: 'Listing Published!', gu: 'લિસ્ટિંગ પ્રકાશિત થઈ!', hi: 'लिस्टिंग प्रकाशित हुई!', mr: 'लिस्टिंग प्रकाशित झाले!', pa: 'ਲਿਸਟਿੰਗ ਪ੍ਰਕਾਸ਼ਿਤ ਹੋਈ!', ta: 'பட்டியல் வெளியிடப்பட்டது!' },
    successDesc: { en: 'Buyers can now see your crop on "Sabki Fasal"', gu: 'ખરીદનાર હવે "બધાની ફસલ" પર તમારી ફસલ જોઈ શકે છે', hi: 'खरीदार अब "सबकी फसल" पर आपकी फसल देख सकते हैं', mr: 'खरेदीदार आता "सर्वांचे पीक" वर तुमचे पीक पाहू शकतात', pa: 'ਖਰੀਦਦਾਰ ਹੁਣ "ਸਭ ਦੀ ਫ਼ਸਲ" ਤੇ ਤੁਹਾਡੀ ਫ਼ਸਲ ਦੇਖ ਸਕਦੇ ਹਨ', ta: 'வாங்குபவர்கள் இப்போது "அனைவரின் பயிர்" பக்கத்தில் உங்கள் பயிரைப் பார்க்கலாம்' },
    viewBtn: { en: 'View All Listings', gu: 'બધી લિસ્ટિંગ જુઓ', hi: 'सभी लिस्टिंग देखें', mr: 'सर्व लिस्टिंग पहा', pa: 'ਸਾਰੀਆਂ ਲਿਸਟਿੰਗਾਂ ਦੇਖੋ', ta: 'அனைத்து பட்டியல்களையும் பார்' },
    newBtn: { en: 'Create New Listing', gu: 'નવી લિસ્ટિંગ બનાવો', hi: 'नई लिस्टिंग बनाएं', mr: 'नवीन लिस्टिंग तयार करा', pa: 'ਨਵੀਂ ਲਿਸਟਿੰਗ ਬਣਾਓ', ta: 'புதிய பட்டியலை உருவாக்கு' },
    errMissing: { en: 'Crop, quantity, price and district are required', gu: 'ફસલ, જથ્થો, ભાવ અને જિલ્લો જરૂરી છે', hi: 'फसल, मात्रा, भाव और जिला जरूरी है', mr: 'पीक, प्रमाण, दर आणि जिल्हा आवश्यक आहे', pa: 'ਫ਼ਸਲ, ਮਾਤਰਾ, ਭਾਅ ਅਤੇ ਜ਼ਿਲ੍ਹਾ ਜ਼ਰੂਰੀ ਹੈ', ta: 'பயிர், அளவு, விலை மற்றும் மாவட்டம் தேவை' },
    errFileType: { en: 'Only JPG, PNG, WebP allowed', gu: 'ફક્ત JPG, PNG, WebP માન્ય છે', hi: 'केवल JPG, PNG, WebP मान्य है', mr: 'फक्त JPG, PNG, WebP वैध आहे', pa: 'ਸਿਰਫ਼ JPG, PNG, WebP ਮਨਜ਼ੂਰ ਹੈ', ta: 'JPG, PNG, WebP மட்டுமே அனுமதிக்கப்படும்' },
    errFileSize: { en: 'Photo must be under 5 MB', gu: 'ફોટો 5 MB થી ઓછો હોવો જોઈએ', hi: 'फोटो 5 MB से कम होना चाहिए', mr: 'फोटो 5 MB पेक्षा कमी असावा', pa: 'ਫੋਟੋ 5 MB ਤੋਂ ਘੱਟ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ', ta: 'புகைப்படம் 5 MB க்கும் குறைவாக இருக்க வேண்டும்' },
    errUpload: { en: 'Photo upload failed', gu: 'ફોટો અપલોડ નિષ્ફળ', hi: 'फोटो अपलोड विफल', mr: 'फोटो अपलोड अयशस्वी', pa: 'ਫੋਟੋ ਅੱਪਲੋਡ ਫੇਲ੍ਹ', ta: 'புகைப்படம் பதிவேற்றம் தோல்வி' },
    errPublish: { en: 'Listing could not be published', gu: 'લિસ્ટિંગ પ્રકાશિત થઈ શકી નથી', hi: 'लिस्टिंग प्रकाशित नहीं हो सकी', mr: 'लिस्टिंग प्रकाशित होऊ शकली नाही', pa: 'ਲਿਸਟਿੰਗ ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ ਹੋ ਸਕੀ', ta: 'பட்டியலை வெளியிட முடியவில்லை' }
  };

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (user) {
      setVillage(user.village || '');
      setPhone(user.phone || '');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!crop) {
      setMandiPrices([]);
      return;
    }
    setMandiLoading(true);
    fetchMandiPrices()
      .then((data) => {
        const filtered = data
          .filter((p) => p.commodity.toLowerCase().includes(crop.toLowerCase()))
          .map((p) => Number(p.modalPrice))
          .filter((n) => !isNaN(n) && n > 0)
          .sort((a, b) => a - b);
        setMandiPrices(filtered);
      })
      .catch(() => setMandiPrices([]))
      .finally(() => setMandiLoading(false));
  }, [crop]);

  const medianPrice = mandiPrices.length > 0 ? mandiPrices[Math.floor(mandiPrices.length / 2)] : 0;
  const priceDiff = price && medianPrice ? Number(price) - medianPrice : 0;

  const compareText = () => {
    if (!price || !medianPrice) return null;
    const diffPercent = (priceDiff / medianPrice) * 100;
    if (Math.abs(diffPercent) <= 10) return { text: t.cmpClose[lang], color: 'text-green-700' };
    if (diffPercent > 10) return { text: t.cmpHigh[lang], color: 'text-orange-700' };
    return { text: t.cmpLow[lang], color: 'text-orange-700' };
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setError(t.errFileType[lang]);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t.errFileSize[lang]);
      e.target.value = '';
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setUploadedPhotoUrl('');
    setError('');
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (uploadedPhotoUrl) return uploadedPhotoUrl;
    if (!photo || !user) return null;

    setUploading(true);
    try {
      const fileExt = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(fileName, photo, { contentType: photo.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('listing-photos').getPublicUrl(fileName);
      setUploadedPhotoUrl(data.publicUrl);
      return data.publicUrl;
    } catch (err: any) {
      setError(t.errUpload[lang]);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const buildMessage = () => {
    const cropEmoji = CROPS.find((c) => c.key === crop)?.emoji || '🌾';
    const lines = [
      `${cropEmoji} *${crop}* bechna hai`, '',
      `📦 Matra: ${quantity} ${UNIT}`,
      price ? `💰 Bhav: ₹${price}/${UNIT}` : '',
      readyDate ? `📅 Tayyar: ${readyDate}` : '',
      village ? `📍 Jagah: ${village}${district ? `, ${district}` : ''}` : '',
      phone ? `📞 Sampark: ${phone}` : '',
      note ? `📝 ${note}` : '', '',
      medianPrice ? `📊 Aaj mandi bhav: ~₹${medianPrice}/${UNIT}` : '', '',
      `— Agri Check app se bheja`,
    ].filter(Boolean);
    return lines.join('\n');
  };

  const handlePublish = async () => {
    if (!crop || !quantity || !price || !district) {
      setError(t.errMissing[lang]);
      return;
    }
    if (!user) return;

    setPublishing(true);
    setError('');

    try {
      let photoUrl = '';
      if (photo) {
        const url = await uploadPhoto();
        if (url) photoUrl = url;
      }

      const { error: insertError } = await supabase.from('listings').insert({
        user_id: user.id, crop, quantity: Number(quantity), unit: UNIT,
        expected_price: Number(price), ready_date: readyDate || null,
        description: note || null, photos: photoUrl ? [photoUrl] : [],
        village: village || null, district, state: 'Gujarat', status: 'active',
      });

      if (insertError) throw insertError;
      setPublished(true);
    } catch (err: any) {
      setError(err?.message || t.errPublish[lang]);
    } finally {
      setPublishing(false);
    }
  };

  const resetForm = () => {
    setCrop(''); setQuantity(''); setPrice(''); setReadyDate('');
    setDistrict(''); setNote(''); setPhoto(null); setPhotoPreview('');
    setUploadedPhotoUrl(''); setPublished(false); setError('');
  };

  const handleWhatsApp = async () => {
    if (!crop || !quantity) { setError(t.errMissing[lang]); return; }
    let photoUrl = uploadedPhotoUrl;
    if (!photoUrl && photo) {
      const url = await uploadPhoto();
      if (url) photoUrl = url;
    }
    let msg = buildMessage();
    if (photoUrl) msg += `\n\n📷 Photo: ${photoUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCopy = async () => {
    if (!crop || !quantity) { setError(t.errMissing[lang]); return; }
    let photoUrl = uploadedPhotoUrl;
    if (!photoUrl && photo) {
      const url = await uploadPhoto();
      if (url) photoUrl = url;
    }
    let msg = buildMessage();
    if (photoUrl) msg += `\n\n📷 Photo: ${photoUrl}`;
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copy nahi hua');
    }
  };

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
}
   if (published) {
    return (
      <div className="page-enter min-h-screen px-4 py-6">
        <div className="mt-12 mx-auto max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#deeee9] text-[#28655e]">
            <Check size={40} />
          </div>
          <h1 className="mt-6 text-2xl font-bold">✅ {t.successTitle[lang]}</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            {t.successDesc[lang]}
          </p>
          <div className="mt-8 space-y-3">
            <button onClick={() => navigate('/listings')} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))]">
              {t.viewBtn[lang]}
            </button>
            <button onClick={resetForm} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold">
              {t.newBtn[lang]}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen px-4 py-6 pb-24">
      <button onClick={() => navigate('/mandi')} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <ArrowLeft size={18} /> {t.back[lang]}
      </button>

      <h1 className="mt-4 text-2xl font-bold">🌾 {t.title[lang]}</h1>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t.subtitle[lang]}</p>

      {error && (
        <div className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">{error}</div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-bold">{t.cropLabel[lang]}</label>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm font-semibold outline-none">
            <option value="">{t.cropSelect[lang]}</option>
            {CROPS.map((c) => (
              <option key={c.key} value={c.key}>{c.emoji} {c.key}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold">{t.qtyLabel[lang]}</label>
          <input type="number" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="50" className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none" />
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{t.qtyHint[lang]}</p>
        </div>

        <div>
          <label className="text-sm font-bold">{t.priceLabel[lang]}</label>
          <input type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="7100" className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none" />
        </div>

        {crop && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
            {mandiLoading ? (
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Loader2 className="animate-spin" size={14} /> {t.mandiLoading[lang]}
              </div>
            ) : medianPrice ? (
              <div>
                <p className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">{t.mandiMedian[lang]}</p>
                <p className="mt-1 text-lg font-bold">₹{medianPrice.toFixed(0)}/quintal</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">≈ ₹{(medianPrice / 100).toFixed(1)}/kg</p>
                {compareText() && (
                  <p className={`mt-2 text-sm font-semibold ${compareText()?.color}`}>
                    {compareText()?.text} {price && ` (₹${Math.abs(priceDiff).toFixed(0)} ${priceDiff > 0 ? t.more[lang] : t.less[lang]})`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.mandiNo[lang]}</p>
            )}
          </div>
        )}

        <div>
          <label className="text-sm font-bold">{t.readyLabel[lang]}</label>
          <input type="date" value={readyDate} onChange={(e) => setReadyDate(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-bold">{t.villageLabel[lang]}</label>
            <input type="text" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Rajkot" className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none" />
          </div>
          <div>
            <label className="text-sm font-bold">{t.districtLabel[lang]}</label>
            <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Rajkot" className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none" />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold">{t.phoneLabel[lang]}</label>
          <input type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none" />
        </div>

        <div>
          <label className="text-sm font-bold">{t.noteLabel[lang]}</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.noteHint[lang]} rows={2} className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none" />
        </div>

        <div>
          <label className="text-sm font-bold">{t.photoLabel[lang]}</label>
          {!photoPreview ? (
            <label className="mt-1 flex min-h-24 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">
              <Camera size={20} />
              <span>{t.photoHint[lang]}</span>
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
            </label>
          ) : (
            <div className="relative mt-1">
              <img src={photoPreview} alt="Preview" className="w-full rounded-xl" />
              <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(''); setUploadedPhotoUrl(''); }} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white">
                <X size={16} />
              </button>
              {uploadedPhotoUrl && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-green-600 px-2 py-1 text-xs font-bold text-white">
                  <Check size={12} /> Uploaded
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {crop && quantity && (
        <div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">{t.preview[lang]}</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-[hsl(var(--foreground))] font-sans">{buildMessage()}</pre>
        </div>
      )}

      <button onClick={handlePublish} disabled={publishing || !crop || !quantity || !price || !district} className="mt-6 flex min-h-16 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-base font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50">
        {publishing ? <><Loader2 className="animate-spin" size={20} /> {t.publishing[lang]}</> : <><Upload size={20} /> {t.publishBtn[lang]}</>}
      </button>

      <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">{t.publishHint[lang]}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={handleWhatsApp} disabled={!crop || !quantity || uploading} className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-bold text-white disabled:opacity-50">
          {uploading ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />} {t.shareBtn[lang]}
        </button>
        <button onClick={handleCopy} disabled={!crop || !quantity || uploading} className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold disabled:opacity-50">
          {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? t.copiedBtn[lang] : t.copyBtn[lang]}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
        <p className="flex items-start gap-2 font-bold">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {t.safety[lang]}
        </p>
        <p className="mt-1 ml-6">{t.safetyDesc[lang]}</p>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-[hsl(var(--border))] p-3 text-xs text-[hsl(var(--muted-foreground))]">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>{t.legal[lang]}</p>
      </div>
    </div>
  );
        } 
