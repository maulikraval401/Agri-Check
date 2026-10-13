import { useLocation } from 'wouter';
import { ArrowLeft, Shield, Database, Share2, UserCheck, Clock, Lock, Mail, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function PrivacyPage() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  // Only 3 languages for now (en, gu, hi)
  const lang: 'en' | 'gu' | 'hi' =
    language === 'gu' ? 'gu' : language === 'hi' ? 'hi' : 'en';

  const t = {
    title: {
      en: 'Privacy Policy',
      gu: 'ગોપનીયતા નીતિ',
      hi: 'गोपनीयता नीति',
    },
    lastUpdated: {
      en: 'Last updated: October 2026',
      gu: 'છેલ્લે અપડેટ: ઓક્ટોબર 2026',
      hi: 'अंतिम अपडेट: अक्टूबर 2026',
    },
    intro: {
      en: 'This Privacy Policy explains how Agri Check collects, uses, and protects your personal information. By using this app, you agree to this policy.',
      gu: 'આ ગોપનીયતા નીતિ સમજાવે છે કે Agri Check તમારી અંગત માહિતી કેવી રીતે એકત્ર કરે છે, ઉપયોગ કરે છે અને સુરક્ષિત રાખે છે. આ એપ વાપરીને, તમે આ નીતિ સ્વીકારો છો.',
      hi: 'यह गोपनीयता नीति बताती है कि Agri Check आपकी व्यक्तिगत जानकारी कैसे एकत्र करता है, उपयोग करता है और सुरक्षित रखता है। इस ऐप का उपयोग करके, आप इस नीति से सहमत हैं।',
    },
    s1title: {
      en: '1. What data we collect',
      gu: '1. અમે કયો ડેટા એકત્ર કરીએ છીએ',
      hi: '1. हम कौन सा डेटा एकत्र करते हैं',
    },
    s1: {
      en: [
        'Phone number — for login and buyer-seller contact',
        'Name — to show on your listings',
        'Village/District — to show listing location',
        'Crop details — for the marketplace',
        'Photos — for your crop listings',
        'Location (live) — only for weather and mandi prices',
        'Language preference — saved on your device only',
      ],
      gu: [
        'મોબાઇલ નંબર — લોગિન અને ખરીદનાર-વેચનાર સંપર્ક માટે',
        'નામ — તમારી લિસ્ટિંગ પર દર્શાવવા માટે',
        'ગામ/જિલ્લો — લિસ્ટિંગનું સ્થાન બતાવવા માટે',
        'પાકની વિગતો — માર્કેટપ્લેસ માટે',
        'ફોટા — તમારી પાક લિસ્ટિંગ માટે',
        'લોકેશન (લાઇવ) — ફક્ત હવામાન અને મંડી ભાવ માટે',
        'ભાષા પસંદગી — ફક્ત તમારા ડિવાઇસ પર સેવ થાય છે',
      ],
      hi: [
        'मोबाइल नंबर — लॉगिन और खरीदार-विक्रेता संपर्क के लिए',
        'नाम — आपकी लिस्टिंग पर दिखाने के लिए',
        'गांव/जिला — लिस्टिंग का स्थान दिखाने के लिए',
        'फसल विवरण — मार्केटप्लेस के लिए',
        'फोटो — आपकी फसल लिस्टिंग के लिए',
        'लोकेशन (लाइव) — केवल मौसम और मंडी भाव के लिए',
        'भाषा पसंद — केवल आपके डिवाइस पर सेव होती है',
      ],
    },
    s2title: {
      en: '2. How we use your data',
      gu: '2. અમે તમારા ડેટાનો ઉપયોગ કેવી રીતે કરીએ છીએ',
      hi: '2. हम आपके डेटा का उपयोग कैसे करते हैं',
    },
    s2: {
      en: [
        'To show your crop listings to buyers',
        'To let buyers contact you for your crops',
        'To show you weather and mandi prices',
        'To improve the app experience',
      ],
      gu: [
        'ખરીદનારને તમારી પાક લિસ્ટિંગ બતાવવા માટે',
        'ખરીદનારને તમારો સંપર્ક કરવા દેવા માટે',
        'તમને હવામાન અને મંડી ભાવ બતાવવા માટે',
        'એપનો અનુભવ સુધારવા માટે',
      ],
      hi: [
        'खरीदार को आपकी फसल लिस्टिंग दिखाने के लिए',
        'खरीदार को आपसे संपर्क करने देने के लिए',
        'आपको मौसम और मंडी भाव दिखाने के लिए',
        'ऐप का अनुभव सुधारने के लिए',
      ],
    },
    s3title: {
      en: '3. Who we share data with',
      gu: '3. અમે ડેટા કોની સાથે શેર કરીએ છીએ',
      hi: '3. हम डेटा किसके साथ साझा करते हैं',
    },
    s3: {
      en: [
        'We never sell your personal data',
        'We do not use your data for ads',
        'Supabase — for secure database storage',
        'data.gov.in — for mandi prices',
        'Open-Meteo — for weather',
        'WhatsApp — when you contact or share',
      ],
      gu: [
        'અમે ક્યારેય તમારો ડેટા વેચતા નથી',
        'અમે જાહેરાત માટે ડેટાનો ઉપયોગ કરતા નથી',
        'Supabase — સુરક્ષિત ડેટાબેઝ માટે',
        'data.gov.in — મંડી ભાવ માટે',
        'Open-Meteo — હવામાન માટે',
        'WhatsApp — જ્યારે તમે સંપર્ક કરો છો',
      ],
      hi: [
        'हम कभी आपका डेटा नहीं बेचते',
        'हम विज्ञापनों के लिए डेटा का उपयोग नहीं करते',
        'Supabase — सुरक्षित डेटाबेस के लिए',
        'data.gov.in — मंडी भाव के लिए',
        'Open-Meteo — मौसम के लिए',
        'WhatsApp — जब आप संपर्क करते हैं',
      ],
    },
    s4title: {
      en: '4. Your rights (DPDP Act 2023)',
      gu: '4. તમારા અધિકારો (DPDP એક્ટ 2023)',
      hi: '4. आपके अधिकार (DPDP एक्ट 2023)',
    },
    s4: {
      en: [
        'You can view your data on the Profile page',
        'You can delete your account anytime',
        'You can edit your name and village',
        'You can stop using the app anytime',
      ],
      gu: [
        'તમે Profile પેજ પર તમારો ડેટા જોઈ શકો છો',
        'તમે ક્યારેય પણ એકાઉન્ટ ડિલીટ કરી શકો છો',
        'તમે નામ અને ગામ એડિટ કરી શકો છો',
        'તમે ક્યારેય પણ એપ વાપરવાનું બંધ કરી શકો છો',
      ],
      hi: [
        'आप Profile पेज पर अपना डेटा देख सकते हैं',
        'आप कभी भी अकाउंट डिलीट कर सकते हैं',
        'आप नाम और गांव एडिट कर सकते हैं',
        'आप कभी भी ऐप इस्तेमाल करना बंद कर सकते हैं',
      ],
    },
    s5title: {
      en: '5. How long we keep data',
      gu: '5. અમે ડેટા કેટલા સમય સુધી રાખીએ છીએ',
      hi: '5. हम डेटा कितने समय तक रखते हैं',
    },
    s5: {
      en: [
        'Account data: until you delete your account',
        'Listings: auto-expire after 30 days',
        'Photos: deleted when listing is removed',
        'Location: never stored on our servers',
      ],
      gu: [
        'એકાઉન્ટ ડેટા: જ્યાં સુધી તમે એકાઉન્ટ ડિલીટ ન કરો',
        'લિસ્ટિંગ: 30 દિવસ પછી આપમેળે એક્સપાયર',
        'ફોટા: લિસ્ટિંગ ડિલીટ થતાં ડિલીટ થાય છે',
        'લોકેશન: અમારા સર્વર પર કદી સેવ થતું નથી',
      ],
      hi: [
        'अकाउंट डेटा: जब तक आप अकाउंट डिलीट न करें',
        'लिस्टिंग: 30 दिन बाद अपने आप एक्सपायर',
        'फोटो: लिस्टिंग डिलीट होते ही डिलीट',
        'लोकेशन: हमारे सर्वर पर कभी सेव नहीं होता',
      ],
    },
    s6title: {
      en: '6. Children\'s privacy',
      gu: '6. બાળકોની ગોપનીયતા',
      hi: '6. बच्चों की गोपनीयता',
    },
    s6: {
      en: 'This app is for users 18 years and older. We do not knowingly collect data from children.',
      gu: 'આ એપ 18 વર્ષ અને તેથી વધુ ઉંમરના વપરાશકર્તાઓ માટે છે. અમે જાણી જોઈને બાળકોનો ડેટા એકત્ર કરતા નથી.',
      hi: 'यह ऐप 18 साल और उससे अधिक उम्र के उपयोगकर्ताओं के लिए है। हम जानबूझकर बच्चों का डेटा एकत्र नहीं करते।',
    },
    s7title: {
      en: '7. Contact us',
      gu: '7. અમારો સંપર્ક કરો',
      hi: '7. हमसे संपर्क करें',
    },
    s7: {
      en: 'For any questions or data deletion requests, contact:',
      gu: 'કોઈપણ પ્રશ્નો અથવા ડેટા ડિલીટ કરવાની વિનંતી માટે, સંપર્ક કરો:',
      hi: 'किसी भी सवाल या डेटा डिलीट करने की रिक्वेस्ट के लिए, संपर्क करें:',
    },
    s8title: {
      en: '8. Changes to this policy',
      gu: '8. આ નીતિમાં ફેરફાર',
      hi: '8. इस नीति में बदलाव',
    },
    s8: {
      en: 'We may update this policy. Major changes will be notified in the app.',
      gu: 'અમે આ નીતિ અપડેટ કરી શકીએ છીએ. મોટા ફેરફારો એપમાં જાણ કરવામાં આવશે.',
      hi: 'हम इस नीति को अपडेट कर सकते हैं। बड़े बदलाव ऐप में बताए जाएंगे।',
    },
  };

  return (
    <div className="page-enter min-h-screen px-4 py-6 pb-24">
      <button
        onClick={() => navigate(-1 as any)}
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="mt-6 flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]">
          <Shield size={26} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t.title[lang]}</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.lastUpdated[lang]}</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm leading-relaxed">
        {t.intro[lang]}
      </p>

      {/* Section 1 */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Database size={18} className="text-[hsl(var(--primary))]" />
          {t.s1title[lang]}
        </h2>
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          {t.s1[lang].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 2 */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <UserCheck size={18} className="text-[hsl(var(--primary))]" />
          {t.s2title[lang]}
        </h2>
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          {t.s2[lang].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 3 */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Share2 size={18} className="text-[hsl(var(--primary))]" />
          {t.s3title[lang]}
        </h2>
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          {t.s3[lang].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 4 */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Lock size={18} className="text-[hsl(var(--primary))]" />
          {t.s4title[lang]}
        </h2>
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          {t.s4[lang].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 5 */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Clock size={18} className="text-[hsl(var(--primary))]" />
          {t.s5title[lang]}
        </h2>
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          {t.s5[lang].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 6 */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <AlertCircle size={18} className="text-[hsl(var(--primary))]" />
          {t.s6title[lang]}
        </h2>
        <p className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm">
          {t.s6[lang]}
        </p>
      </section>

      {/* Section 7 */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Mail size={18} className="text-[hsl(var(--primary))]" />
          {t.s7title[lang]}
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-sm">{t.s7[lang]}</p>
          <a
            href="mailto:maulikraval401@gmail.com"
            className="mt-2 inline-block text-sm font-bold text-[hsl(var(--primary))] underline"
          >
            maulikraval401@gmail.com
          </a>
          <button
            onClick={() => navigate('/profile')}
            className="mt-3 block rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold"
          >
            Account Delete Karo →
          </button>
        </div>
      </section>

      {/* Section 8 */}
      <section className="mt-6">
        <h2 className="text-base font-bold">{t.s8title[lang]}</h2>
        <p className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm">
          {t.s8[lang]}
        </p>
      </section>

      <div className="mt-8 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
        <p className="font-bold">🔒 Note:</p>
        <p className="mt-1">
          Aapka data safe hai. Kabhi bhi Profile page se apna account delete kar sakte ho.
        </p>
      </div>
    </div>
  );
}
