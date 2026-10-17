import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Phone, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LoginPage() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { sendOtp, verifyOtp } = useAuth();

  // URL se redirect path nikaalo (e.g., /login?redirect=/listings)
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get('redirect') || '/sell';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    title: {
      en: 'Login / Sign Up', gu: 'લોગિન / સાઇન અપ', hi: 'लॉगिन / साइन अप',
      mr: 'लॉगिन / साइन अप', pa: 'ਲੌਗਇਨ / ਸਾਈਨ ਅੱਪ', ta: 'உள்நுழை / பதிவு',
    },
    phoneLabel: {
      en: 'Phone Number', gu: 'મોબાઇલ નંબર', hi: 'मोबाइल नंबर',
      mr: 'मोबाइल नंबर', pa: 'ਮੋਬਾਈਲ ਨੰਬਰ', ta: 'மொபைல் எண்',
    },
    sendOtp: {
      en: 'Send OTP', gu: 'OTP મોકલો', hi: 'OTP भेजें',
      mr: 'OTP पाठवा', pa: 'OTP ਭੇਜੋ', ta: 'OTP அனுப்பு',
    },
    otpLabel: {
      en: 'Enter OTP', gu: 'OTP દાખલ કરો', hi: 'OTP दर्ज करें',
      mr: 'OTP टाका', pa: 'OTP ਦਾਖਲ ਕਰੋ', ta: 'OTP உள்ளிடவும்',
    },
    verify: {
      en: 'Verify & Login', gu: 'ચકાસો અને લોગિન', hi: 'सत्यापित करें',
      mr: 'सत्यापित करा', pa: 'ਪੁਸ਼ਟੀ ਕਰੋ', ta: 'சரிபார்',
    },
    testHint: {
      en: 'For testing: use 9999999999 with OTP 123456',
      gu: 'ટેસ્ટિંગ માટે: 9999999999 વાપરો, OTP 123456',
      hi: 'टेस्टिंग के लिए: 9999999999, OTP 123456',
      mr: 'टेस्टिंगसाठी: 9999999999, OTP 123456',
      pa: 'ਟੈਸਟ ਲਈ: 9999999999, OTP 123456',
      ta: 'சோதனைக்கு: 9999999999, OTP 123456',
    },
    consentText: {
      en: 'I agree to the Privacy Policy and Terms. My phone number and name will be securely stored.',
      gu: 'હું ગોપનીયતા નીતિ અને શરતોથી સહમત છું. મારો મોબાઇલ નંબર અને નામ સુરક્ષિત રીતે સંગ્રહિત થશે.',
      hi: 'मैं गोपनीयता नीति और शर्तों से सहमत हूं। मेरा मोबाइल नंबर और नाम सुरक्षित रूप से संग्रहीत होगा।',
      mr: 'मी गोपनीयता धोरण आणि अटींशी सहमत आहे. माझा मोबाइल नंबर आणि नाव सुरक्षितपणे संग्रहित केले जाईल.',
      pa: 'ਮੈਂ ਪਰਦੇਦਾਰੀ ਨੀਤੀ ਅਤੇ ਸ਼ਰਤਾਂ ਨਾਲ ਸਹਿਮਤ ਹਾਂ। ਮੇਰਾ ਮੋਬਾਈਲ ਨੰਬਰ ਅਤੇ ਨਾਮ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸਟੋਰ ਕੀਤਾ ਜਾਵੇਗਾ।',
      ta: 'நான் தனியுரிமைக் கொள்கை மற்றும் விதிமுறைகளை ஏற்கிறேன். எனது மொபைல் எண் மற்றும் பெயர் பாதுகாப்பாக சேமிக்கப்படும்.',
    },
    privacyLink: {
      en: 'Privacy Policy', gu: 'ગોપનીયતા નીતિ', hi: 'गोपनीयता नीति',
      mr: 'गोपनीयता धोरण', pa: 'ਪਰਦੇਦਾਰੀ ਨੀਤੀ', ta: 'தனியுரிமைக் கொள்கை',
    },
    and: {
      en: 'and', gu: 'અને', hi: 'और',
      mr: 'आणि', pa: 'ਅਤੇ', ta: 'மற்றும்',
    },
    terms: {
      en: 'Terms', gu: 'શરતો', hi: 'शर्तें',
      mr: 'अटी', pa: 'ਸ਼ਰਤਾਂ', ta: 'விதிமுறைகள்',
    },
    back: {
      en: 'Back', gu: 'પાછળ', hi: 'पीछे',
      mr: 'मागे', pa: 'ਪਿੱਛੇ', ta: 'பின்னால்'
    },
  } as const;

  const handleSendOtp = async () => {
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('10 digit ka number daalo');
      return;
    }
    if (!consent) {
      setError('Privacy Policy se sehmat ho');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(`+91${cleanPhone}`);
      setStep('otp');
    } catch (err: any) {
      setError(err?.message || 'OTP send nahi hua');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('6 digit ka OTP daalo');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(`+91${phone.replace(/\D/g, '')}`, otp);
      // Redirect to the intended page (default is /sell)
      navigate(redirectTo);
    } catch (err: any) {
      setError(err?.message || 'OTP galat hai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter min-h-screen px-4 py-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
      >
        <ArrowLeft size={18} /> {t.back[language]}
      </button>

      <div className="mt-8 mx-auto max-w-md">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
            <Phone size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{t.title[language]}</h1>
        </div>

        {step === 'phone' && (
          <div className="mt-8">
            <label className="text-sm font-bold">
              {t.phoneLabel[language]}
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

            {/* CONSENT CHECKBOX */}
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[hsl(var(--primary))]"
              />
              <span className="text-xs leading-relaxed">
                {t.consentText[language].split('Privacy Policy')[0]}
                <Link
                  href="/privacy"
                  className="font-bold text-[hsl(var(--primary))] underline"
                >
                  {t.privacyLink[language]}
                </Link>
                {' '}{t.and[language]}{' '}
                <Link
                  href="/terms"
                  className="font-bold text-[hsl(var(--primary))] underline"
                >
                  {t.terms[language]}
                </Link>
              </span>
            </label>

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10 || !consent}
              className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Sending...
                </>
              ) : (
                t.sendOtp[language]
              )}
            </button>

            {/* Sirf development mode me dikhega */}
            {import.meta.env.DEV && (
              <div className="mt-4 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
                <p className="font-bold">🧪 Testing mode:</p>
                <p className="mt-1">{t.testHint[language]}</p>
              </div>
            )}
          </div>
        )}

        {step === 'otp' && (
          <div className="mt-8">
            <label className="text-sm font-bold">
              {t.otpLabel[language]}
            </label>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Sent to +91 {phone}
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
                  <Loader2 className="animate-spin" size={18} /> Verifying...
                </>
              ) : (
                t.verify[language]
              )}
            </button>

            <button
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
              className="mt-3 w-full text-center text-sm text-[hsl(var(--muted-foreground))]"
            >
              ← Change number
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
            Aapka data surakshit hai. <Link href="/privacy" className="font-bold underline">Privacy Policy</Link> padho.
          </p>
        </div>
      </div>
    </div>
  );
    }
