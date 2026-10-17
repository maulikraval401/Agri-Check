import { useLocation } from 'wouter';
import { ArrowLeft, FileText, AlertTriangle, Scale, UserX, Ban, Mail, Shield } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function TermsPage() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  const lang: 'en' | 'gu' | 'hi' | 'mr' | 'pa' | 'ta' = 
    ['en', 'gu', 'hi', 'mr', 'pa', 'ta'].includes(language) 
      ? (language as any) 
      : 'en';

  const t = {
    title: {
      en: 'Terms of Use', gu: 'ઉપયોગની શરતો', hi: 'उपयोग की शर्तें',
      mr: 'वापराच्या अटी', pa: 'ਵਰਤੋਂ ਦੀਆਂ ਸ਼ਰਤਾਂ', ta: 'பயன்பாட்டு விதிமுறைகள்',
    },
    updated: {
      en: 'Last updated: October 2026', gu: 'છેલ્લે અપડેટ: ઓક્ટોબર 2026', hi: 'अंतिम अपडेट: अक्टूबर 2026',
      mr: 'शेवटचे अपडेट: ऑक्टोबर 2026', pa: 'ਆਖਰੀ ਅੱਪਡੇਟ: ਅਕਤੂਬਰ 2026', ta: 'கடைசியாக புதுப்பிக்கப்பட்டது: அக்டோபர் 2026',
    },
    intro: {
      en: 'By using Agri Check, you agree to these terms. Please read carefully.',
      gu: 'Agri Check વાપરીને, તમે આ શરતો સ્વીકારો છો. કૃપા કરીને ધ્યાનથી વાંચો.',
      hi: 'Agri Check का उपयोग करके, आप इन शर्तों से सहमत हैं। कृपया ध्यान से पढ़ें।',
      mr: 'Agri Check वापरून, तुम्ही या अटींशी सहमत आहात. कृपया काळजीपूर्वक वाचा.',
      pa: 'Agri Check ਦੀ ਵਰਤੋਂ ਕਰਕੇ, ਤੁਸੀਂ ਇਹਨਾਂ ਸ਼ਰਤਾਂ ਨਾਲ ਸਹਿਮਤ ਹੋ। ਕਿਰਪਾ ਕਰਕੇ ਧਿਆਨ ਨਾਲ ਪੜ੍ਹੋ।',
      ta: 'Agri Check பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகளை ஏற்கிறீர்கள். தயவுசெய்து கவனமாக படிக்கவும்.',
    },
    s1title: {
      en: '1. What This App Does', gu: '1. આ એપ શું કરે છે', hi: '1. यह ऐप क्या करता है',
      mr: '1. हे ॲप काय करते', pa: '1. ਇਹ ਐਪ ਕੀ ਕਰਦੀ ਹੈ', ta: '1. இந்த செயலி என்ன செய்கிறது',
    },
    s1items: {
      en: ['Crop disease detection', 'Weather and mandi prices', 'Crop calendar and library', 'Connecting buyers and sellers'],
      gu: ['પાક રોગ ઓળખ', 'હવામાન અને મંડી ભાવ', 'પાક કેલેન્ડર અને લાઇબ્રેરી', 'ખરીદનાર અને વેચનારને જોડવા'],
      hi: ['फसल रोग पहचान', 'मौसम और मंडी भाव', 'फसल कैलेंडर और लाइब्रेरी', 'खरीदार और विक्रेता को जोड़ना'],
      mr: ['पीक रोग ओळख', 'हवामान आणि बाजारभाव', 'पीक दिनदर्शिका आणि लायब्ररी', 'खरेदीदार आणि विक्रेता जोडणे'],
      pa: ['ਫਸਲ ਰੋਗ ਪਛਾਣ', 'ਮੌਸਮ ਅਤੇ ਮੰਡੀ ਭਾਅ', 'ਫਸਲ ਕੈਲੰਡਰ ਅਤੇ ਲਾਇਬ੍ਰੇਰੀ', 'ਖਰੀਦਦਾਰ ਅਤੇ ਵਿਕਰੇਤਾ ਨੂੰ ਜੋੜਨਾ'],
      ta: ['பயிர் நோய் கண்டறிதல்', 'வானிலை மற்றும் மண்டி விலை', 'பயிர் நாட்காட்டி மற்றும் நூலகம்', 'வாங்குபவர் மற்றும் விற்பனையாளரை இணைத்தல்'],
    },
    s2title: {
      en: '2. Your Responsibility', gu: '2. તમારી જવાબદારી', hi: '2. आपकी जिम्मेदारी',
      mr: '2. तुमची जबाबदारी', pa: '2. ਤੁਹਾਡੀ ਜ਼ਿੰਮੇਵਾਰੀ', ta: '2. உங்கள் பொறுப்பு',
    },
    s2items: {
      en: ['Provide correct info (phone, name, crop details, photos)', 'No fake or misleading listings', 'Do not list under someone else\'s name', 'Talk to buyer/seller before dealing', 'Never give/take advance money (fraud protection)'],
      gu: ['સાચી માહિતી આપો (ફોન, નામ, પાકની વિગતો, ફોટા)', 'નકલી કે ભ્રામક લિસ્ટિંગ ન બનાવો', 'બીજાના નામે લિસ્ટિંગ ન કરો', 'વ્યવહાર પહેલાં ખરીદનાર/વેચનાર સાથે વાત કરો', 'ક્યારેય એડવાન્સ પૈસા ન આપો/લો (છેતરપિંડીથી બચવા)'],
      hi: ['सही जानकारी दें (फोन, नाम, फसल विवरण, फोटो)', 'नकली या भ्रामक लिस्टिंग न बनाएं', 'किसी और के नाम पर लिस्टिंग न करें', 'सौदा करने से पहले खरीदार/विक्रेता से बात करें', 'कभी भी एडवांस पैसे न दें/लें (धोखाधड़ी से बचाव)'],
      mr: ['योग्य माहिती द्या (फोन, नाव, पीक तपशील, फोटो)', 'बनावट किंवा दिशाभूल करणारी लिस्टिंग न करा', 'दुसऱ्याच्या नावाने लिस्टिंग करू नका', 'व्यवहारापूर्वी खरेदीदार/विक्रेत्याशी बोला', 'कधीही ॲडव्हान्स पैसे देऊ/घेऊ नका (फसवणूक टाळण्यासाठी)'],
      pa: ['ਸਹੀ ਜਾਣਕਾਰੀ ਦਿਓ (ਫੋਨ, ਨਾਮ, ਫਸਲ ਵੇਰਵੇ, ਫੋਟੋ)', 'ਨਕਲੀ ਜਾਂ ਭਰਮਾਉਣ ਵਾਲੀ ਲਿਸਟਿੰਗ ਨਾ ਬਣਾਓ', 'ਕਿਸੇ ਹੋਰ ਦੇ ਨਾਮ ਤੇ ਲਿਸਟਿੰਗ ਨਾ ਕਰੋ', 'ਸੌਦਾ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਖਰੀਦਦਾਰ/ਵਿਕਰੇਤਾ ਨਾਲ ਗੱਲ ਕਰੋ', 'ਕਦੇ ਵੀ ਐਡਵਾਂਸ ਪੈਸੇ ਨਾ ਦਿਓ/ਲਓ (ਧੋਖਾਧੜੀ ਤੋਂ ਬਚਾਅ)'],
      ta: ['சரியான தகவலை வழங்கவும் (தொலைபேசி, பெயர், பயிர் விவரங்கள், புகைப்படங்கள்)', 'போலி அல்லது தவறான பட்டியல்களை உருவாக்க வேண்டாம்', 'வேறொருவரின் பெயரில் பட்டியலிட வேண்டாம்', 'ஒப்பந்தத்திற்கு முன் வாங்குபவர்/விற்பனையாளரிடம் பேசுங்கள்', 'முன்பணம் யாருக்கும் கொடுக்கவோ வாங்கவோ வேண்டாம் (மோசடியைத் தடுக்க)'],
    },
    s3title: {
      en: '3. App Limits', gu: '3. એપની મર્યાદાઓ', hi: '3. ऐप की सीमाएं',
      mr: '3. ॲपच्या मर्यादा', pa: '3. ਐਪ ਦੀਆਂ ਸੀਮਾਵਾਂ', ta: '3. செயலி வரம்புகள்',
    },
    s3items: {
      en: ['Agri Check only connects farmers and buyers', 'We are not responsible for payment, delivery, or quality', 'Disease detection is guidance only — not expert advice', 'Do actual trade through APMC or e-NAM', 'We do not handle transaction disputes'],
      gu: ['Agri Check ફક્ત ખેડૂત અને ખરીદનારને જોડે છે', 'ચુકવણી, ડિલિવરી કે ગુણવત્તા માટે અમે જવાબદાર નથી', 'રોગ ઓળખ ફક્ત માર્ગદર્શન છે — નિષ્ણાત સલાહ નહીં', 'વાસ્તવિક વેપાર APMC અથવા e-NAM દ્વારા કરો', 'અમે વ્યવહારના વિવાદો હેન્ડલ કરતા નથી'],
      hi: ['Agri Check केवल किसान और खरीदार को जोड़ता है', 'भुगतान, डिलीवरी या गुणवत्ता के लिए हम जिम्मेदार नहीं हैं', 'रोग पहचान केवल मार्गदर्शन है — विशेषज्ञ सलाह नहीं', 'वास्तविक व्यापार APMC या e-NAM के माध्यम से करें', 'हम लेन-देन के विवादों को संभालते नहीं हैं'],
      mr: ['Agri Check फक्त शेतकरी आणि खरेदीदार जोडते', 'पेमेंट, डिलिव्हरी किंवा गुणवत्तेसाठी आम्ही जबाबदार नाही', 'रोग ओळख फक्त मार्गदर्शन आहे — तज्ञांचा सल्ला नाही', 'प्रत्यक्ष व्यापार APMC किंवा e-NAM द्वारे करा', 'आम्ही व्यवहारातील वाद हाताळत नाही'],
      pa: ['Agri Check ਸਿਰਫ਼ ਕਿਸਾਨ ਅਤੇ ਖਰੀਦਦਾਰ ਨੂੰ ਜੋੜਦੀ ਹੈ', 'ਭੁਗਤਾਨ, ਡਿਲੀਵਰੀ ਜਾਂ ਗੁਣਵੱਤਾ ਲਈ ਅਸੀਂ ਜ਼ਿੰਮੇਵਾਰ ਨਹੀਂ ਹਾਂ', 'ਰੋਗ ਪਛਾਣ ਸਿਰਫ਼ ਮਾਰਗਦਰਸ਼ਨ ਹੈ — ਮਾਹਰ ਸਲਾਹ ਨਹੀਂ', 'ਅਸਲੀ ਵਪਾਰ APMC ਜਾਂ e-NAM ਰਾਹੀਂ ਕਰੋ', 'ਅਸੀਂ ਲੈਣ-ਦੇਣ ਦੇ ਵਿਵਾਦ ਨਹੀਂ ਸੰਭਾਲਦੇ'],
      ta: ['Agri Check விவசாயிகள் மற்றும் வாங்குபவர்களை மட்டுமே இணைக்கிறது', 'பணம் செலுத்துதல், விநியோகம் அல்லது தரத்திற்கு நாங்கள் பொறுப்பல்ல', 'நோய் கண்டறிதல் வழிகாட்டுதல் மட்டுமே — நிபுணர் ஆலோசனை அல்ல', 'உண்மையான வணிகத்தை APMC அல்லது e-NAM மூலம் செய்யுங்கள்', 'பரிவர்த்தனை தகராறுகளை நாங்கள் கையாள்வதில்லை'],
    },
    s4title: {
      en: '4. Spam & Misuse', gu: '4. સ્પામ અને દુરુપયોગ', hi: '4. स्पैम और दुरुपयोग',
      mr: '4. स्पॅम आणि गैरवापर', pa: '4. ਸਪੈਮ ਅਤੇ ਦੁਰਵਰਤੋਂ', ta: '4. ஸ்பேம் மற்றும் தவறான பயன்பாடு',
    },
    s4items: {
      en: ['More than 10 active listings per user', 'Duplicate listings', 'Fake photos or wrong prices', 'Abusive behavior or spam messages'],
      gu: ['એક વપરાશકર્તા દીઠ 10 થી વધુ એક્ટિવ લિસ્ટિંગ', 'ડુપ્લિકેટ લિસ્ટિંગ', 'નકલી ફોટા કે ખોટા ભાવ', 'ગાળો કે સ્પામ સંદેશા'],
      hi: ['प्रति उपयोगकर्ता 10 से अधिक सक्रिय लिस्टिंग', 'डुप्लीकेट लिस्टिंग', 'नकली फोटो या गलत कीमतें', 'अभद्र व्यवहार या स्पैम संदेश'],
      mr: ['प्रति वापरकर्ता 10 पेक्षा जास्त सक्रिय लिस्टिंग', 'डुप्लिकेट लिस्टिंग', 'बनावट फोटो किंवा चुकीचे दर', 'अभद्र वर्तन किंवा स्पॅम संदेश'],
      pa: ['ਪ੍ਰਤੀ ਉਪਭੋਗਤਾ 10 ਤੋਂ ਵੱਧ ਸਰਗਰਮ ਲਿਸਟਿੰਗ', 'ਡੁਪਲੀਕੇਟ ਲਿਸਟਿੰਗ', 'ਨਕਲੀ ਫੋਟੋ ਜਾਂ ਗਲਤ ਕੀਮਤਾਂ', 'ਬਦਤਮੀਜ਼ੀ ਜਾਂ ਸਪੈਮ ਸੁਨੇਹੇ'],
      ta: ['ஒரு பயனருக்கு 10 க்கும் மேற்பட்ட செயலில் உள்ள பட்டியல்கள்', 'நகல் பட்டியல்கள்', 'போலி புகைப்படங்கள் அல்லது தவறான விலைகள்', 'தவறான நடத்தை அல்லது ஸ்பேம் செய்திகள்'],
    },
    s4warn: {
      en: 'Breaking rules may result in account ban.',
      gu: 'નિયમો તોડવાથી એકાઉન્ટ બેન થઈ શકે છે.',
      hi: 'नियम तोड़ने पर अकाउंट बैन हो सकता है।',
      mr: 'नियम मोडल्यास खाते बंद होऊ शकते.',
      pa: 'ਨਿਯਮ ਤੋੜਨ ਨਾਲ ਖਾਤਾ ਬੈਨ ਹੋ ਸਕਦਾ ਹੈ।',
      ta: 'விதிமுறைகளை மீறினால் கணக்கு முடக்கப்படலாம்.',
    },
    s5title: {
      en: '5. Account Delete', gu: '5. એકાઉન્ટ ડિલીટ', hi: '5. अकाउंट डिलीट',
      mr: '5. खाते हटवा', pa: '5. ਖਾਤਾ ਮਿਟਾਓ', ta: '5. கணக்கை நீக்கு',
    },
    s5desc: {
      en: 'You can delete your account anytime from the Profile page. After deletion, all data will be permanently removed.',
      gu: 'તમે ક્યારેય પણ Profile પેજ પરથી એકાઉન્ટ ડિલીટ કરી શકો છો. ડિલીટ કર્યા પછી, બધો ડેટા કાયમ માટે દૂર થઈ જશે.',
      hi: 'आप कभी भी Profile पेज से अकाउंट डिलीट कर सकते हैं। डिलीट करने के बाद, सारा डेटा हमेशा के लिए हट जाएगा।',
      mr: 'तुम्ही कधीही Profile पेजवरून खाते हटवू शकता. हटवल्यानंतर, सर्व डेटा कायमचा हटवला जाईल.',
      pa: 'ਤੁਸੀਂ ਕਦੇ ਵੀ Profile ਪੇਜ ਤੋਂ ਖਾਤਾ ਮਿਟਾ ਸਕਦੇ ਹੋ। ਮਿਟਾਉਣ ਤੋਂ ਬਾਅਦ, ਸਾਰਾ ਡੇਟਾ ਹਮੇਸ਼ਾ ਲਈ ਹਟਾ ਦਿੱਤਾ ਜਾਵੇਗਾ।',
      ta: 'நீங்கள் எப்போது வேண்டுமானாலும் Profile பக்கத்திலிருந்து கணக்கை நீக்கலாம். நீக்கிய பிறகு, அனைத்து தரவுகளும் நிரந்தரமாக அகற்றப்படும்.',
    },
    s5btn: {
      en: 'Open Profile Page', gu: 'Profile પેજ ખોલો', hi: 'Profile पेज खोलें',
      mr: 'Profile पेज उघडा', pa: 'Profile ਪੇਜ ਖੋਲ੍ਹੋ', ta: 'Profile பக்கத்தைத் திற',
    },
    s6title: {
      en: '6. Changes to Terms', gu: '6. શરતોમાં ફેરફાર', hi: '6. शर्तों में बदलाव',
      mr: '6. अटींमध्ये बदल', pa: '6. ਸ਼ਰਤਾਂ ਵਿੱਚ ਤਬਦੀਲੀਆਂ', ta: '6. விதிமுறைகளில் மாற்றங்கள்',
    },
    s6desc: {
      en: 'We may update these terms anytime. Major changes will be notified in the app. Continued use means accepting new terms.',
      gu: 'અમે આ શરતો ક્યારેય પણ અપડેટ કરી શકીએ છીએ. મોટા ફેરફારો એપમાં જાણ કરવામાં આવશે. ચાલુ રાખવાનો અર્થ નવી શરતો સ્વીકારવી.',
      hi: 'हम ये शर्तें कभी भी अपडेट कर सकते हैं। बड़े बदलाव ऐप में बताए जाएंगे। जारी रखने का मतलब नई शर्तें स्वीकार करना।',
      mr: 'आम्ही या अटी कधीही अपडेट करू शकतो. मोठे बदल ॲपमध्ये कळवले जातील. सुरू ठेवणे म्हणजे नवीन अटी स्वीकारणे.',
      pa: 'ਅਸੀਂ ਇਹ ਸ਼ਰਤਾਂ ਕਦੇ ਵੀ ਅੱਪਡੇਟ ਕਰ ਸਕਦੇ ਹਾਂ। ਵੱਡੀਆਂ ਤਬਦੀਲੀਆਂ ਐਪ ਵਿੱਚ ਦੱਸੀਆਂ ਜਾਣਗੀਆਂ। ਜਾਰੀ ਰੱਖਣ ਦਾ ਮਤਲਬ ਨਵੀਆਂ ਸ਼ਰਤਾਂ ਸਵੀਕਾਰ ਕਰਨਾ।',
      ta: 'இந்த விதிமுறைகளை எப்போது வேண்டுமானாலும் புதுப்பிக்கலாம். பெரிய மாற்றங்கள் செயலியில் அறிவிக்கப்படும். தொடர்ந்து பயன்படுத்துவது புதிய விதிமுறைகளை ஏற்பதாகும்.',
    },
    s7title: {
      en: '7. Contact', gu: '7. સંપર્ક', hi: '7. संपर्क',
      mr: '7. संपर्क', pa: '7. ਸੰਪਰਕ', ta: '7. தொடர்பு',
    },
    s7desc: {
      en: 'For any questions or complaints:', gu: 'કોઈપણ પ્રશ્નો અથવા ફરિયાદો માટે:', hi: 'किसी भी सवाल या शिकायत के लिए:',
      mr: 'कोणत्याही प्रश्नांसाठी किंवा तक्रारींसाठी:', pa: 'ਕਿਸੇ ਵੀ ਸਵਾਲ ਜਾਂ ਸ਼ਿਕਾਇਤ ਲਈ:', ta: 'ஏதேனும் கேள்விகள் அல்லது புகார்களுக்கு:',
    },
    note: {
      en: 'This app is made for farmers\' benefit. Report any fraud immediately via email.',
      gu: 'આ એપ ખેડૂતોના ફાયદા માટે બનાવવામાં આવી છે. કોઈપણ છેતરપિંડીની તરત જ ઈમેલ દ્વારા જાણ કરો.',
      hi: 'यह ऐप किसानों के फायदे के लिए बनाई गई है। किसी भी धोखाधड़ी की तुरंत ईमेल द्वारा रिपोर्ट करें।',
      mr: 'हे ॲप शेतकऱ्यांच्या फायद्यासाठी बनवले आहे. कोणतीही फसवणूक त्वरित ईमेलद्वारे कळवा.',
      pa: 'ਇਹ ਐਪ ਕਿਸਾਨਾਂ ਦੇ ਫਾਇਦੇ ਲਈ ਬਣਾਈ ਗਈ ਹੈ। ਕਿਸੇ ਵੀ ਧੋਖਾਧੜੀ ਦੀ ਤੁਰੰਤ ਈਮੇਲ ਰਾਹੀਂ ਰਿਪੋਰਟ ਕਰੋ।',
      ta: 'இந்த செயலி விவசாயிகளின் நன்மைக்காக உருவாக்கப்பட்டுள்ளது. எந்தவொரு மோசடியையும் உடனடியாக மின்னஞ்சல் மூலம் புகாரளிக்கவும்.',
    },
  };

  return (
    <div className="page-enter min-h-screen px-4 py-6 pb-24">
      <button
        onClick={() => navigate(-1 as any)}
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
      >
        <ArrowLeft size={18} /> {lang === 'gu' ? 'પાછળ' : lang === 'hi' ? 'पीछे' : lang === 'mr' ? 'मागे' : lang === 'pa' ? 'ਪਿੱਛੇ' : lang === 'ta' ? 'பின்னால்' : 'Back'}
      </button>

      <div className="mt-6 flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]">
          <FileText size={26} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t.title[lang]}</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.updated[lang]}</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm leading-relaxed">
        {t.intro[lang]}
      </p>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Shield size={18} className="text-[hsl(var(--primary))]" />
          {t.s1title[lang]}
        </h2>
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          {t.s1items[lang].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Scale size={18} className="text-[hsl(var(--primary))]" />
          {t.s2title[lang]}
        </h2>
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          {t.s2items[lang].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <AlertTriangle size={18} className="text-[hsl(var(--primary))]" />
          {t.s3title[lang]}
        </h2>
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-4">
          {t.s3items[lang].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-[#66511b]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Ban size={18} className="text-[hsl(var(--primary))]" />
          {t.s4title[lang]}
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <ul className="space-y-1.5">
            {t.s4items[lang].map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            {t.s4warn[lang]}
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <UserX size={18} className="text-[hsl(var(--primary))]" />
          {t.s5title[lang]}
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-sm">{t.s5desc[lang]}</p>
          <button
            onClick={() => navigate('/profile')}
            className="mt-3 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold"
          >
            {t.s5btn[lang]} →
          </button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <FileText size={18} className="text-[hsl(var(--primary))]" />
          {t.s6title[lang]}
        </h2>
        <p className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm">
          {t.s6desc[lang]}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Mail size={18} className="text-[hsl(var(--primary))]" />
          {t.s7title[lang]}
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-sm">{t.s7desc[lang]}</p>
          <a
            href="mailto:maulikraval401@gmail.com"
            className="mt-2 inline-block text-sm font-bold text-[hsl(var(--primary))] underline"
          >
            maulikraval401@gmail.com
          </a>
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
        <p className="font-bold">📌 Note:</p>
        <p className="mt-1">{t.note[lang]}</p>
      </div>
    </div>
  );
      }
