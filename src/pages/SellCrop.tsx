import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Loader2, Share2, Copy, Check, AlertTriangle, Info, Camera, X, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { fetchMandiPrices } from '@/lib/mandi';
import { supabase } from '@/lib/supabase';

const CROPS = [
  { key: 'Cotton', emoji: '🌿' },
  { key: 'Wheat', emoji: '🌾' },
  { key: 'Rice', emoji: '🌾' },
  { key: 'Maize', emoji: '🌽' },
  { key: 'Groundnut', emoji: '🥜' },
  { key: 'Soybean', emoji: '🌱' },
  { key: 'Sugarcane', emoji: '🎋' },
  { key: 'Onion', emoji: '🧅' },
  { key: 'Potato', emoji: '🥔' },
  { key: 'Tomato', emoji: '🍅' },
  { key: 'Banana', emoji: '🍌' },
  { key: 'Mango', emoji: '🥭' },
  { key: 'Chilli', emoji: '🌶️' },
  { key: 'Turmeric', emoji: '🟡' },
  { key: 'Cumin', emoji: '🌿' },
  { key: 'Coriander', emoji: '🌿' },
  { key: 'Bajra', emoji: '🌾' },
  { key: 'Jowar', emoji: '🌾' },
  { key: 'Urad', emoji: '🫘' },
  { key: 'Moong', emoji: '🫘' },
  { key: 'Sesame', emoji: '⚪' },
  { key: 'Mustard', emoji: '🌼' },
  { key: 'Castor', emoji: '🌿' },
];

const UNIT = 'quintal';

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
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [mandiPrices, setMandiPrices] = useState<number[]>([]);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  // Login check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (user) {
      setVillage(user.village || '');
      setPhone(user.phone || '');
    }
  }, [user, authLoading, navigate]);

  // Fetch mandi prices
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

  const medianPrice = mandiPrices.length
    ? mandiPrices[Math.floor(mandiPrices.length / 2)]
    : 0;

  const priceDiff = price && medianPrice ? Number(price) - medianPrice : 0;

  const compareText = () => {
    if (!price || !medianPrice) return null;
    const diffPercent = (priceDiff / medianPrice) * 100;
    if (Math.abs(diffPercent) <= 10) {
      return { text: '✅ Aapka bhav mandi ke paas hai', color: 'text-green-700' };
    }
    if (diffPercent > 10) {
      return { text: '⚠️ Aapka bhav mandi se zyada hai', color: 'text-orange-700' };
    }
    return { text: '⚠️ Aapka bhav mandi se kam hai', color: 'text-orange-700' };
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo 5 MB se kam honi chahiye');
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview('');
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo || !user) return null;
    setUploading(true);
    try {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(fileName, photo);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err: any) {
      setError(err?.message || 'Photo upload nahi hui');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const buildMessage = () => {
    const cropEmoji = CROPS.find((c) => c.key === crop)?.emoji || '🌾';
    const lines = [
      `${cropEmoji} *${crop}* bechna hai`,
      '',
      `📦 Matra: ${quantity} ${UNIT}`,
      price ? `💰 Bhav: ₹${price}/${UNIT}` : '',
      readyDate ? `📅 Tayyar: ${readyDate}` : '',
      village ? `📍 Jagah: ${village}${district ? `, ${district}` : ''}` : '',
      phone ? `📞 Sampark: ${phone}` : '',
      note ? `📝 ${note}` : '',
      '',
      medianPrice ? `📊 Aaj mandi bhav: ~₹${medianPrice}/${UNIT}` : '',
      '',
      `— Agri Check app se bheja`,
    ].filter(Boolean);
    return lines.join('\n');
  };

  // ============================================================
  // PUBLISH TO DATABASE
  // ============================================================
  const handlePublish = async () => {
    if (!crop || !quantity || !price || !district) {
      setError('Fasal, matra, bhav aur district zaroori hai');
      return;
    }
    if (!user) return;

    setPublishing(true);
    setError('');

    try {
      // Upload photo first (if any)
      let photoUrl = '';
      if (photo) {
        const url = await uploadPhoto();
        if (url) photoUrl = url;
      }

      // Insert listing into database
      const { error: insertError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          crop,
          quantity: Number(quantity),
          unit: UNIT,
          expected_price: Number(price),
          ready_date: readyDate || null,
          description: note || null,
          photos: photoUrl ? [photoUrl] : [],
          village: village || null,
          district,
          state: 'Gujarat',
          status: 'active',
        });

      if (insertError) throw insertError;
      setPublished(true);
    } catch (err: any) {
      setError(err?.message || 'Listing publish nahi hui');
    } finally {
      setPublishing(false);
    }
  };

  const resetForm = () => {
    setCrop('');
    setQuantity('');
    setPrice('');
    setReadyDate('');
    setDistrict('');
    setNote('');
    setPhoto(null);
    setPhotoPreview('');
    setPublished(false);
    setError('');
  };

  const handleWhatsApp = async () => {
    if (!crop || !quantity) {
      setError('Fasal aur matra zaroori hai');
      return;
    }
    let photoUrl = '';
    if (photo) {
      const url = await uploadPhoto();
      if (url) photoUrl = url;
    }
    let msg = buildMessage();
    if (photoUrl) msg += `\n\n📷 Photo: ${photoUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCopy = async () => {
    if (!crop || !quantity) {
      setError('Fasal aur matra zaroori hai');
      return;
    }
    let photoUrl = '';
    if (photo) {
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

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================
  if (published) {
    return (
      <div className="page-enter min-h-screen px-4 py-6">
        <div className="mt-12 mx-auto max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#deeee9] text-[#28655e]">
            <Check size={40} />
          </div>
          <h1 className="mt-6 text-2xl font-bold">✅ Listing Publish Ho Gayi!</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Ab buyers aapki fasal "Sabki Fasal" page pe dekh sakte hain.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate('/listings')}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))]"
            >
              Sabki Fasal Dekho
            </button>
            <button
              onClick={resetForm}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold"
            >
              Nayi Listing Banao
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-bold text-white"
            >
              <Share2 size={18} /> WhatsApp pe Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen px-4 py-6 pb-24">
      <button
        onClick={() => navigate('/mandi')}
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="mt-4 text-2xl font-bold">🌾 Fasal Becho</h1>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
        Apni fasal ki details bharo — buyers tak pahunchao
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="mt-6 space-y-4">
        {/* Crop */}
        <div>
          <label className="text-sm font-bold">Fasal *</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm font-semibold outline-none"
          >
            <option value="">-- Fasal chuno --</option>
            {CROPS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.emoji} {c.key}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-sm font-bold">Matra (quintal) *</label>
          <input
            type="number"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="50"
            className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none"
          />
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            1 quintal = 100 kg
          </p>
        </div>

        {/* Price */}
        <div>
          <label className="text-sm font-bold">Aapka bhav (₹/quintal) *</label>
          <input
            type="number"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="7100"
            className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none"
          />
        </div>

        {/* Mandi comparison */}
        {crop && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
            {mandiLoading ? (
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <Loader2 className="animate-spin" size={14} /> Mandi bhav load ho raha...
              </div>
            ) : medianPrice ? (
              <div>
                <p className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">
                  Aaj ka mandi bhav (median)
                </p>
                <p className="mt-1 text-lg font-bold">
                  ₹{medianPrice.toFixed(0)}/quintal
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  ≈ ₹{(medianPrice / 100).toFixed(1)}/kg
                </p>
                {compareText() && (
                  <p className={`mt-2 text-sm font-semibold ${compareText()?.color}`}>
                    {compareText()?.text}
                    {price && ` (₹${Math.abs(priceDiff).toFixed(0)} ${priceDiff > 0 ? 'zyada' : 'kam'})`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Is fasal ka aaj mandi bhav nahi mila
              </p>
            )}
          </div>
        )}

        {/* Ready date */}
        <div>
          <label className="text-sm font-bold">Kab se tayyar hai?</label>
          <input
            type="date"
            value={readyDate}
            onChange={(e) => setReadyDate(e.target.value)}
            className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none"
          />
        </div>

        {/* Village + District */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-bold">Gaon</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="Rajkot"
              className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-bold">District *</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Rajkot"
              className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-bold">Phone Number</label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            className="mt-1 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] px-3 text-sm outline-none"
          />
        </div>

        {/* Note */}
        <div>
          <label className="text-sm font-bold">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A-grade quality, good condition"
            rows={2}
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="text-sm font-bold">Photo (optional)</label>
          {!photoPreview ? (
            <label className="mt-1 flex min-h-24 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">
              <Camera size={20} />
              <span>Photo add karo (max 5 MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative mt-1">
              <img src={photoPreview} alt="Preview" className="w-full rounded-xl" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {crop && quantity && (
        <div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">
            Message Preview
          </p>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-[hsl(var(--foreground))] font-sans">
            {buildMessage()}
          </pre>
        </div>
      )}

      {/* PUBLISH BUTTON (Primary) */}
      <button
        onClick={handlePublish}
        disabled={publishing || !crop || !quantity || !price || !district}
        className="mt-6 flex min-h-16 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-base font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50"
      >
        {publishing ? (
          <><Loader2 className="animate-spin" size={20} /> Publishing...</>
        ) : (
          <><Upload size={20} /> Publish Listing</>
        )}
      </button>

      <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Listing "Sabki Fasal" page pe dikhegi
      </p>

      {/* Share buttons (Secondary) */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={handleWhatsApp}
          disabled={!crop || !quantity || uploading}
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-bold text-white disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="animate-spin" size={18} /> Wait...</>
          ) : (
            <><Share2 size={18} /> WhatsApp</>
          )}
        </button>
        <button
          onClick={handleCopy}
          disabled={!crop || !quantity || uploading}
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold disabled:opacity-50"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Safety warning */}
      <div className="mt-4 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
        <p className="flex items-start gap-2 font-bold">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Suraksha Chetavni
        </p>
        <p className="mt-1 ml-6">
          Kabhi advance paisa mat do/lo. Pehle maal aur khareedar ki jaanch karo.
        </p>
      </div>

      {/* Legal disclaimer */}
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-[hsl(var(--border))] p-3 text-xs text-[hsl(var(--muted-foreground))]">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          Ye app sirf kisan aur khareedar ko jodta hai. Actual trade APMC ya e-NAM ke through karo.
          Agri Check kisi transaction ke liye zimmedar nahi hai.
        </p>
      </div>
    </div>
  );
    }
