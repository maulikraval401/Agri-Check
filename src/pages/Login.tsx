import { useState } from 'react';
import { useLocation } from 'wouter';
import { Phone, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LoginPage() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    title: {
      en: 'Login / Sign Up',
      gu: 'લોગિન / સાઇન અપ',
      hi: 'लॉगिन / साइन अप',
      mr: 'लॉगिन / साइन अप',
      pa: 'ਲੌਗਇਨ / ਸਾਈਨ ਅੱਪ',
      ta: 'உள்நுழை / பதிவு',
    },
    phoneLabel: {
      en: 'Phone Number',
      gu: 'મોબાઇલ નંબર',
      hi: 'मोबाइल नंबर',
      mr: 'मोबाइल नंबर',
      pa: 'ਮੋਬਾਈਲ ਨੰਬਰ',
      ta: 'மொபைல் எண்',
    },
    sendOtp: {
      en: 'Send OTP',
      gu: 'OTP મોકલો',
      hi: 'OTP भेजें',
      mr: 'OTP पाठवा',
      pa: 'OTP ਭੇਜੋ',
      ta: 'OTP அனுப்பு',
    },
    otpLabel: {
      en: 'Enter OTP',
      gu: 'OTP દાખલ કરો',
      hi: 'OTP दर्ज करें',
      mr: 'OTP टाका',
      pa: 'OTP ਦਾਖਲ ਕਰੋ',
      ta: 'OTP உள்ளிடவும்',
    },
    verify: {
      en: 'Verify & Login',
      gu: 'ચકાસો અને લોગિન',
      hi: 'सत्यापित करें',
      mr: 'सत्यापित करा',
      pa: 'ਪੁਸ਼ਟੀ ਕਰੋ',
      ta: 'சரிபார்',
    },
    nameLabel: {
      en: 'Your Name',
      gu: 'તમારું નામ',
      hi: 'आपका नाम',
      mr: 'तुमचे नाव',
      pa: 'ਤੁਹਾਡਾ ਨਾਮ',
      ta: 'உங்கள் பெயர்',
    },
    save: {
      en: 'Save & Continue',
      gu: 'સાચવો અને આગળ વધો',
      hi: 'सहेजें और जारी रखें',
      mr: 'जतन करा',
      pa: 'ਸੇਵ ਕਰੋ',
      ta: 'சேமி',
    },
    testHint: {
      en: 'For testing: use 9999999999 with OTP 123456',
      gu: 'ટેસ્ટિંગ માટે: 9999999999 વાપરો, OTP 123456',
      hi: 'टेस्टिंग के लिए: 9999999999, OTP 123456',
      mr: 'टेस्टिंगसाठी: 9999999999, OTP 123456',
      pa: 'ਟੈਸਟ ਲਈ: 9999999999, OTP 123456',
      ta: 'சோதனைக்கு: 9999999999, OTP 123456',
    },
    privacy: {
      en: 'By continuing, you agree to our Privacy Policy and Terms of Use.',
      gu: 'ચાલુ રાખીને, તમે અમારી ગોપનીયતા નીતિ સ્વીકારો છો.',
      hi: 'जारी रखकर, आप हमारी गोपनीयता नीति से सहमत हैं।',
      mr: 'सुरू ठेवून, तुम्ही गोपनीयता धोरण स्वीकारता.',
      pa: 'ਜਾਰੀ ਰੱਖ ਕੇ, ਤੁਸੀਂ ਸਾਡੀ ਪਰਦੇਦਾਰੀ ਨੀਤੀ ਨਾਲ ਸਹਿਮਤ ਹੋ।',
      ta: 'தொடர்வதன் மூலம், எங்கள் தனியுரிமைக் கொள்கையை ஏற்கிறீர்கள்.',
    },
  } as const;

  const handleSendOtp = async () => {
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('10 digit ka number daalo');
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
      navigate('/sell');
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
        <ArrowLeft size={18} /> Back
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

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
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

            <div className="mt-4 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
              <p className="font-bold">🧪 Testing mode:</p>
              <p className="mt-1">{t.testHint[language]}</p>
            </div>
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
          <p>{t.privacy[language]}</p>
        </div>
      </div>
    </div>
  );
      }
