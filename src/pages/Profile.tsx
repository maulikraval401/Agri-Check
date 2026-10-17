import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, LogOut, Trash2, Loader2, AlertTriangle, User, Phone, MapPin, Shield, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/i18n/LanguageContext';

export default function ProfilePage() {
  const { user, signOut, updateProfile } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editVillage, setEditVillage] = useState(user?.village || '');
  const [saving, setSaving] = useState(false);

  const lang = ['en', 'gu', 'hi', 'mr', 'pa', 'ta'].includes(language) ? language : 'en';

  const t = {
    title: { en: 'My Profile', gu: 'મારી પ્રોફાઇલ', hi: 'मेरी प्रोफाइल', mr: 'माझे प्रोफाइल', pa: 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ', ta: 'எனது சுயவிவரம்' },
    name: { en: 'Name', gu: 'નામ', hi: 'नाम', mr: 'नाव', pa: 'ਨਾਮ', ta: 'பெயர்' },
    phone: { en: 'Phone', gu: 'ફોન', hi: 'फोन', mr: 'फोन', pa: 'ਫੋਨ', ta: 'தொலைபேசி' },
    village: { en: 'Village', gu: 'ગામ', hi: 'गांव', mr: 'गाव', pa: 'ਪਿੰਡ', ta: 'கிராமம்' },
    notSet: { en: 'Not set', gu: 'સેટ નથી', hi: 'सेट नहीं है', mr: 'सेट केलेले नाही', pa: 'ਸੈੱਟ ਨਹੀਂ ਹੈ', ta: 'அமைக்கப்படவில்லை' },
    logout: { en: 'Logout', gu: 'લોગઆઉટ', hi: 'लॉगआउट', mr: 'लॉगआउट', pa: 'ਲੌਗਆਉਟ', ta: 'வெளியேறு' },
    deleteBtn: { en: 'Delete Account', gu: 'એકાઉન્ટ ડિલીટ કરો', hi: 'अकाउंट डिलीट करें', mr: 'खाते हटवा', pa: 'ਖਾਤਾ ਮਿਟਾਓ', ta: 'கணக்கை நீக்கு' },
    confirmTitle: { en: 'Confirm Delete?', gu: 'ખરેખર ડિલીટ કરવું છે?', hi: 'पक्का डिलीट करना है?', mr: 'नक्की हटवायचे आहे का?', pa: 'ਪੱਕਾ ਮਿਟਾਉਣਾ ਹੈ?', ta: 'நிச்சயமாக நீக்க வேண்டுமா?' },
    confirmDesc: { 
      en: 'All your listings, photos, and profile will be permanently deleted. This cannot be undone.', 
      gu: 'તમારી બધી લિસ્ટિંગ, ફોટા અને પ્રોફાઇલ કાયમ માટે ડિલીટ થઈ જશે. આ પાછું નહીં આવે.', 
      hi: 'आपकी सभी लिस्टिंग, फोटो और प्रोफाइल हमेशा के लिए डिलीट हो जाएंगी। यह वापस नहीं आएगा।', 
      mr: 'तुमच्या सर्व लिस्टिंग, फोटो आणि प्रोफाइल कायमचे हटवले जातील. हे परत येणार नाही.', 
      pa: 'ਤੁਹਾਡੀਆਂ ਸਾਰੀਆਂ ਲਿਸਟਿੰਗਾਂ, ਫੋਟੋਆਂ ਅਤੇ ਪ੍ਰੋਫਾਈਲ ਹਮੇਸ਼ਾ ਲਈ ਮਿਟਾ ਦਿੱਤੀਆਂ ਜਾਣਗੀਆਂ। ਇਹ ਵਾਪਸ ਨਹੀਂ ਆਵੇਗਾ।', 
      ta: 'உங்கள் அனைத்து பட்டியல்கள், புகைப்படங்கள் மற்றும் சுயவிவரம் நிரந்தரமாக நீக்கப்படும். இதை மீட்டெடுக்க முடியாது.' 
    },
    cancel: { en: 'Cancel', gu: 'રદ કરો', hi: 'रद्द करें', mr: 'रद्द करा', pa: 'ਰੱਦ ਕਰੋ', ta: 'ரத்துசெய்' },
    yesDelete: { en: 'Yes, Delete', gu: 'હા, ડિલીટ કરો', hi: 'हां, डिलीट करें', mr: 'होय, हटवा', pa: 'ਹਾਂ, ਮਿਟਾਓ', ta: 'ஆம், நீக்கு' },
    dataUsage: { en: 'How your data is used', gu: 'તમારો ડેટા કેવી રીતે વપરાય છે', hi: 'आपका डेटा कैसे उपयोग होता है', mr: 'तुमचा डेटा कसा वापरला जातो', pa: 'ਤੁਹਾਡਾ ਡੇਟਾ ਕਿਵੇਂ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ', ta: 'உங்கள் தரவு எவ்வாறு பயன்படுத்தப்படுகிறது' },
    privacyLink: { en: 'Privacy Policy', gu: 'ગોપનીયતા નીતિ', hi: 'गोपनीयता नीति', mr: 'गोपनीयता धोरण', pa: 'ਪਰਦੇਦਾਰੀ ਨੀਤੀ', ta: 'தனியுரிமைக் கொள்கை' },
    loginReq: { en: 'Login to see profile', gu: 'પ્રોફાઇલ જોવા લોગિન કરો', hi: 'प्रोफाइल देखने के लिए लॉगिन करें', mr: 'प्रोफाइल पाहण्यासाठी लॉगिन करा', pa: 'ਪ੍ਰੋਫਾਈਲ ਦੇਖਣ ਲਈ ਲੌਗਇਨ ਕਰੋ', ta: 'சுயவிவரத்தைப் பார்க்க உள்நுழைக' },
    loginBtn: { en: 'Login', gu: 'લોગિન', hi: 'लॉगिन', mr: 'लॉगिन', pa: 'ਲੌਗਇਨ', ta: 'உள்நுழை' },
    back: { en: 'Back', gu: 'પાછળ', hi: 'पीछे', mr: 'मागे', pa: 'ਪਿੱਛੇ', ta: 'பின்னால்' },
    deleting: { en: 'Deleting...', gu: 'ડિલીટ થઈ રહ્યું છે...', hi: 'डिलीट हो रहा है...', mr: 'हटवत आहे...', pa: 'ਮਿਟਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...', ta: 'நீக்குகிறது...' },
    editProfile: { en: 'Edit Profile', gu: 'પ્રોફાઇલ સુધારો', hi: 'प्रोफाइल सुधारें', mr: 'प्रोफाइल सुधारा', pa: 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ', ta: 'சுயவிவரத்தைத் திருத்து' },
    save: { en: 'Save Changes', gu: 'સેવ કરો', hi: 'सेव करें', mr: 'जतन करा', pa: 'ਸੇਵ ਕਰੋ', ta: 'சேமி' },
    saving: { en: 'Saving...', gu: 'સેવ થઈ રહ્યું છે...', hi: 'सेव हो रहा है...', mr: 'जतन होत आहे...', pa: 'ਸੇਵ ਹੋ ਰਿਹਾ ਹੈ...', ta: 'சேமிக்கிறது...' }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        name: editName,
        village: editVillage,
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || 'Profile save nahi hui');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Logout nahi hua');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    try {
      if (user) {
        const { data: listings } = await supabase
          .from('listings')
          .select('photos')
          .eq('user_id', user.id);

        const pathsToDelete: string[] = [];
        if (listings) {
          listings.forEach((l) => {
            if (l.photos && Array.isArray(l.photos)) {
              l.photos.forEach((url: string) => {
                const parts = url.split('/listing-photos/');
                if (parts.length === 2) pathsToDelete.push(parts[1]);
              });
            }
          });
        }

        if (pathsToDelete.length > 0) {
          await supabase.storage.from('listing-photos').remove(pathsToDelete);
        }

        const { error: rpcError } = await supabase.rpc('delete_my_account');
        if (rpcError) throw rpcError;
      }
      
      await signOut();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Account delete nahi hua. Dobara try karein.');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page-enter min-h-screen px-4 py-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <ArrowLeft size={18} /> {t.back[lang]}
        </button>
        <div className="mt-12 text-center">
          <p className="text-sm">{t.loginReq[lang]}</p>
          <button onClick={() => navigate('/login')} className="mt-4 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-bold text-[hsl(var(--primary-foreground))]">
            {t.loginBtn[lang]}
          </button>
        </div>
      </div>
    );
           }
    return (
    <div className="page-enter min-h-screen px-4 py-6 pb-24">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <ArrowLeft size={18} /> {t.back[lang]}
      </button>

      <h1 className="mt-4 text-2xl font-bold">👤 {t.title[lang]}</h1>

      {error && <div className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">{error}</div>}

      <div className="mt-6 space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        {!isEditing ? (
          // READ ONLY VIEW
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User size={18} className="text-[hsl(var(--muted-foreground))]" />
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.name[lang]}</p>
                  <p className="font-bold">{user.name || t.notSet[lang]}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditName(user.name || '');
                  setEditVillage(user.village || '');
                  setIsEditing(true);
                }}
                className="rounded-lg border border-[hsl(var(--border))] p-2 text-xs font-bold"
              >
                <Edit2 size={14} /> Edit
              </button>
            </div>

            <div className="flex items-center gap-3 border-t border-[hsl(var(--border))] pt-3">
              <Phone size={18} className="text-[hsl(var(--muted-foreground))]" />
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.phone[lang]}</p>
                <p className="font-bold">{user.phone || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-[hsl(var(--border))] pt-3">
              <MapPin size={18} className="text-[hsl(var(--muted-foreground))]" />
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.village[lang]}</p>
                <p className="font-bold">{user.village || t.notSet[lang]}</p>
              </div>
            </div>
          </>
        ) : (
          // EDIT VIEW
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{t.name[lang]}</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ramesh Patel"
                className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{t.village[lang]}</label>
              <input
                type="text"
                value={editVillage}
                onChange={(e) => setEditVillage(e.target.value)}
                placeholder="Rajkot"
                className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-[hsl(var(--border))] text-xs font-bold disabled:opacity-50"
              >
                <X size={14} /> {t.cancel[lang]}
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50"
              >
                {saving ? <><Loader2 className="animate-spin" size={14} /> {t.saving[lang]}</> : <><Check size={14} /> {t.save[lang]}</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <button onClick={handleLogout} disabled={loading} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />} {t.logout[lang]}
        </button>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} disabled={loading} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-[#e5b5a5] text-sm font-bold text-[#833b2e] disabled:opacity-50">
            <Trash2 size={18} /> {t.deleteBtn[lang]}
          </button>
        ) : (
          <div className="rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#833b2e]" />
              <div>
                <p className="font-bold text-[#833b2e]">{t.confirmTitle[lang]}</p>
                <p className="mt-1 text-xs text-[#833b2e]">{t.confirmDesc[lang]}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={loading} className="min-h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xs font-bold disabled:opacity-50">
                {t.cancel[lang]}
              </button>
              <button onClick={handleDeleteAccount} disabled={loading} className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-[#833b2e] text-xs font-bold text-white disabled:opacity-50">
                {loading ? <><Loader2 className="animate-spin" size={14} /> {t.deleting[lang]}</> : <><Trash2 size={14} /> {t.yesDelete[lang]}</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-[hsl(var(--border))] p-3 text-xs text-[hsl(var(--muted-foreground))]">
        <Shield size={16} className="mt-0.5 shrink-0" />
        <div>
          <p>{t.dataUsage[lang]} — <a href="/privacy" className="font-bold underline">{t.privacyLink[lang]}</a></p>
        </div>
      </div>
    </div>
  );
                                 }
