import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Phone, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { sendOtp, verifyOtp } = useAuth();

  const lang = ['en', 'gu', 'hi', 'mr', 'pa', 'ta'].includes(language) ? language : 'en';

  // URL se redirect path nikaalo aur validate karo (Security Fix)
  const searchParams = new URLSearchParams(window.location.search);
  const rawRedirect = searchParams.get('redirect');
  // Sirf internal paths allow karo (starts with '/', but not '//' or '/\')
  const redirectTo = (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/\\')) 
    ? rawRedirect 
    : '/sell';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    title: { en: 'Login / Sign Up', gu: 'લોગિન / સાઇન અપ', hi: 'लॉगिन / साइन अप', mr: 'लॉगिन / साइन अप', pa: 'ਲੌਗਇਨ / ਸਾਈਨ ਅੱਪ', ta: 'உள்நுழை / பதிவு' },
    phoneLabel: { en: 'Phone Number', gu: 'મોબાઇલ નંબર', hi: 'मोबाइल नंबर', mr: 'मोबाइल नंबर', pa: 'ਮੋਬਾਈਲ ਨੰਬਰ', ta: 'மொபைல் எண்' },
    sendOtp: { en: 'Send OTP', gu: 'OTP મોકલો', hi: 'OTP भेजें', mr: 'OTP पाठवा', pa: 'OTP ਭੇਜੋ', ta: 'OTP அனுப்பு' },
    otpLabel: { en: 'Enter OTP', gu: 'OTP દાખલ કરો', hi: 'OTP दर्ज करें', mr: 'OTP टाका', pa: 'OTP ਦਾਖਲ ਕਰੋ', ta: 'OTP உள்ளிடவும்' },
    verify: { en: 'Verify & Login', gu: 'ચકાસો અને લોગિન', hi: 'सत्यापित करें', mr: 'सत्यापित करा', pa: 'ਪੁਸ਼ਟੀ ਕਰੋ', ta: 'சரிபார்' },
    testHint: { en: 'For testing: use 9999999999 with OTP 123456', gu: 'ટેસ્ટિંગ માટે: 9999999999 વાપરો, OTP 123456', hi: 'टेस्टिंग के लिए: 9999999999, OTP 123456', mr: 'टेस्टिंगसाठी: 9999999999, OTP 123456', pa: 'ਟੈਸਟ ਲਈ: 9999999999, OTP 123456', ta: 'சோதனைக்கு: 9999999999, OTP 123456' },
    
    // Consent text with placeholders for links
    consentText: { 
      en: 'I agree to the {privacy} and {terms}. My phone number and name will be securely stored.', 
      gu: 'હું {privacy} અને {terms} સાથે સહમત છું. મારો મોબાઇલ નંબર અને નામ સુરક્ષિત રીતે સંગ્રહિત થશે.', 
      hi: 'मैं {privacy} और {terms} से सहमत हूं। मेरा मोबाइल नंबर और नाम सुरक्षित रूप से संग्रहीत होगा।', 
      mr: 'मी {privacy} आणि {terms} शी सहमत आहे. माझा मोबाइल नंबर आणि नाव सुरक्षितपणे संग्रहित केले जाईल.', 
      pa: 'ਮੈਂ {privacy} ਅਤੇ {terms} ਨਾਲ ਸਹਿਮਤ ਹਾਂ। ਮੇਰਾ ਮੋਬਾਈਲ ਨੰਬਰ ਅਤੇ ਨਾਮ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸਟੋਰ ਕੀਤਾ ਜਾਵੇਗਾ।', 
      ta: 'நான் {privacy} மற்றும் {terms} ஏற்கிறேன். எனது மொபைல் எண் மற்றும் பெயர் பாதுகாப்பாக சேமிக்கப்படும்.' 
    },
    privacyLink: { en: 'Privacy Policy', gu: 'ગોપનીયતા નીતિ', hi: 'गोपनीयता नीति', mr: 'गोपनीयता धोरण', pa: 'ਪਰਦੇਦਾਰੀ ਨੀਤੀ', ta: 'தனியுரிமைக் கொள்கை' },
    and: { en: 'and', gu: 'અને', hi: 'और', mr: 'आणि', pa: 'ਅਤੇ', ta: 'மற்றும்' },
    terms: { en: 'Terms', gu: 'શરતો', hi: 'शर्तें', mr: 'अटी', pa: 'ਸ਼ਰਤਾਂ', ta: 'விதிமுறைகள்' },
    back: { en: 'Back', gu: 'પાછળ', hi: 'पीछे', mr: 'मागे', pa: 'ਪਿੱਛੇ', ta: 'பின்னால்' },
    
    // New Translations for errors & UI
    sending: { en: 'Sending...', gu: 'મોકલી રહ્યું છે...', hi: 'भेज रहा है...', mr: 'पाठवत आहे...', pa: 'ਭੇਜ ਰਿਹਾ ਹੈ...', ta: 'அனுப்புகிறது...' },
    verifying: { en: 'Verifying...', gu: 'ચકાસી રહ્યું છે...', hi: 'सत्यापित हो रहा है...', mr: 'सत्यापित करत आहे...', pa: 'ਪੁਸ਼ਟੀ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...', ta: 'சரிபார்க்கிறது...' },
    changeNum: { en: '← Change number', gu: '← નંબર બદલો', hi: '← नंबर बदलें', mr: '← नंबर बदला', pa: '← ਨੰਬਰ ਬਦਲੋ', ta: '← எண்ணை மாற்று' },
    sentTo: { en: 'Sent to +91', gu: '+91 પર મોકલ્યો', hi: '+91 पर भेजा', mr: '+91 वर पाठवले', pa: '+91 ਤੇ ਭੇਜਿਆ', ta: '+91 க்கு அனுப்பப்பட்டது' },
    secNote: { en: 'Your data is safe. Read our', gu: 'તમારો ડેટા સુરક્ષિત છે. વાંચો', hi: 'आपका डेटा सुरक्षित है। पढ़ें', mr: 'तुमचा डेटा सुरक्षित आहे. वाचा', pa: 'ਤੁਹਾਡਾ ਡੇਟਾ ਸੁਰੱਖਿਅਤ ਹੈ। ਪੜ੍ਹੋ', ta: 'உங்கள் தரவு பாதுகாப்பானது. படிக்க' },
    errPhone: { en: 'Enter 10 digit number', gu: '10 આંકડાનો નંબર દાખલ કરો', hi: '10 अंकों का नंबर डालें', mr: '10 अंकी नंबर टाका', pa: '10 ਅੰਕਾਂ ਦਾ ਨੰਬਰ ਦਾਖਲ ਕਰੋ', ta: '10 இலக்க எண்ணை உள்ளிடவும்' },
    errConsent: { en: 'Please accept Privacy Policy', gu: 'કૃપા કરીને ગોપનીયતા નીતિ સ્વીકારો', hi: 'कृपया गोपनीयता नीति स्वीकार करें', mr: 'कृपया गोपनीयता धोरण स्वीकारा', pa: 'ਕਿਰਪਾ ਕਰਕੇ ਪਰਦੇਦਾਰੀ ਨੀਤੀ ਸਵੀਕਾਰ ਕਰੋ', ta: 'தனியுரிமைக் கொள்கையை ஏற்கவும்' },
    errOtp: { en: 'Enter 6 digit OTP', gu: '6 આંકડાનો OTP દાખલ કરો', hi: '6 अंकों का OTP डालें', mr: '6 अंकी OTP टाका', pa: '6 ਅੰਕਾਂ ਦਾ OTP ਦਾਖਲ ਕਰੋ', ta: '6 இலக்க OTP உள்ளிடவும்' },
    errSend: { en: 'Failed to send OTP. Try again.', gu: 'OTP મોકલવામાં નિષ્ફળ. ફરી પ્રયાસ કરો.', hi: 'OTP भेजने में विफल। पुनः प्रयास करें।', mr: 'OTP पाठवण्यात अयशस्वी. पुन्हा प्रयत्न करा.', pa: 'OTP ਭੇਜਣ ਵਿੱਚ ਫੇਲ੍ਹ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', ta: 'OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' },
    errVerify: { en: 'Invalid OTP. Try again.', gu: 'ખોટો OTP. ફરી પ્રયાસ કરો.', hi: 'गलत OTP। पुनः प्रयास करें।', mr: 'चुकीचा OTP. पुन्हा प्रयत्न करा.', pa: 'ਗਲਤ OTP। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', ta: 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.' }
  };

  const handleSendOtp = async () => {
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t.errPhone[lang]);
      return;
    }
    if (!consent) {
      setError(t.errConsent[lang]);
      return;
    }

    setLoading(true);
    try {
      await sendOtp(`+91${cleanPhone}`);
      setStep('otp');
    } catch (err: any) {
      setError(t.errSend[lang]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length !== 6) {
      setError(t.errOtp[lang]);
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(`+91${phone.replace(/\D/g, '')}`, otp);
      
      // Consent timestamp DB me save karo
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('users').update({
          consent_given_at: new Date().toISOString(),
          consent_version: 'v1.0'
        }).eq('id', session.user.id);
      }

      navigate(redirectTo);
    } catch (err: any) {
      setError(t.errVerify[lang]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function consent text ke andar links render karne ke liye
  const renderConsentText = () => {
    const parts = t.consentText[lang].split(/({privacy}|{terms})/);
    return parts.map((part, i) => {
      if (part === '{privacy}') {
        return <Link key={i} href="/privacy" className="font-bold text-[hsl(var(--primary))] underline">{t.privacyLink[lang]}</Link>;
      }
      if (part === '{terms}') {
        return <Link key={i} href="/terms" className="font-bold text-[hsl(var(--primary))] underline">{t.terms[lang]}</Link>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="page-enter min-h-screen px-4 py-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
      >
        <ArrowLeft size={18} /> {t.back[lang]}
      </button>

      <div className="mt-8 mx-auto max-w-md">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
            <Phone size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{t.title[lang]}</h1>
        </div>

        {step === 'phone' && (
          <div className="mt-8">
            <label className="text-sm font-bold">
              {t.phoneLabel[lang]}
            </label>
            <div className="mt-2 flex items-center rounded-xl border border-[hsl(var(--border))] px-3">
              <span className="text-sm font-bold text-[hsl(var(--muted-foreground))]">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9999999999"
                className="min-h-14 flex-1 bg-transparent px-3 text-lg font-bold outline-none"
              />
            </div>

            {/* CONSENT CHECKBOX with fixed text */}
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[hsl(var(--primary))]"
              />
              <span className="text-xs leading-relaxed">
                {renderConsentText()}
              </span>
            </label>

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10 || !consent}
              className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> {t.sending[lang]}
                </>
              ) : (
                t.sendOtp[lang]
              )}
            </button>

            {import.meta.env.DEV && (
              <div className="mt-4 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
                <p className="font-bold">🧪 Testing mode:</p>
                <p className="mt-1">{t.testHint[lang]}</p>
              </div>
            )}
          </div>
        )}

        {step === 'otp' && (
          <div className="mt-8">
            <label className="text-sm font-bold">
              {t.otpLabel[lang]}
            </label>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {t.sentTo[lang]} {phone}
            </p>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="mt-2 min-h-14 w-full rounded-xl border border-[hsl(var(--border))] px-4 text-center text-2xl font-bold tracking-widest outline-none"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> {t.verifying[lang]}
                </>
              ) : (
                t.verify[lang]
              )}
            </button>

            <button
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
              className="mt-3 w-full text-center text-sm text-[hsl(var(--muted-foreground))]"
            >
              {t.changeNum[lang]}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-[hsl(var(--border))] p-3 text-xs text-[hsl(var(--muted-foreground))]">
          <Shield size={16} className="mt-0.5 shrink-0" />
          <p>
            {t.secNote[lang]} <Link href="/privacy" className="font-bold underline">{t.privacyLink[lang]}</Link>.
          </p>
        </div>
      </div>
    </div>
  );
        }
