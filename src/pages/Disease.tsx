import { useRef, useState, type ChangeEvent } from 'react';
import { Upload, Camera, Loader2, Check, AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { detectDisease, type DiseaseResult } from '@/lib/disease-detect';
import { detectCottonViaAPI } from '@/lib/cotton-api';
export default function DiseasePage() {
  const { copy } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'tomato' | 'cotton'>('tomato');
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImage(dataUrl);
      setLoading(true);

      try {
  const r =
    cropType === 'cotton'
      ? await detectCottonViaAPI(dataUrl).then((c) => ({
          className: c.className,
          crop: 'Cotton',
          disease: c.className,
          confidence: c.confidence,
          isHealthy: false,
        }))
      : await detectDisease(dataUrl);
  setResult(r);
} catch (err) {
        setError('Model load nahi hua. Dobara try karo.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="page-enter">
      <p className="eyebrow">08 / disease</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">Disease Detection</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Leaf ki photo lo — disease ya healthy batao
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          Works for: Tomato, Potato, Corn, Pepper, Grape, Apple, Cherry, Strawberry. 
          Baaki crops ke liye trained nahi hai.
        </span>
      </div>
<div className="mt-4 grid grid-cols-2 gap-2">
  <button
    type="button"
    onClick={() => setCropType('tomato')}
    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold ${
      cropType === 'tomato'
        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
        : 'border border-[hsl(var(--border))]'
    }`}
  >
    🍅 Tomato
  </button>
  <button
    type="button"
    onClick={() => setCropType('cotton')}
    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold ${
      cropType === 'cotton'
        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
        : 'border border-[hsl(var(--border))]'
    }`}
  >
    🌿 Cotton
  </button>
</div>
      
      {!image && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex min-h-16 items-center justify-center gap-3 rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-bold text-[hsl(var(--primary-foreground))]"
          >
            <Camera size={20} /> Camera
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex min-h-16 items-center justify-center gap-3 rounded-xl border border-[hsl(var(--border))] px-4 text-sm font-bold"
          >
            <Upload size={20} /> Gallery
          </button>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {image && (
        <div className="mt-6">
          <img src={image} alt="Leaf" className="w-full rounded-xl" />

          {loading && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Loader2 className="animate-spin" size={18} /> Analysing... (pehli baar 5-15 sec)
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-[hsl(var(--destructive))]">{error}</p>
          )}

          {result && (
            <div
              className={`mt-4 rounded-[1.35rem] p-5 ${
                result.isHealthy
                  ? 'border border-[#a9ccc2] bg-[#deeee9] text-[#28655e]'
                  : 'border border-[#e5b5a5] bg-[#f9e4dc] text-[#833b2e]'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.isHealthy ? <Check size={22} /> : <AlertTriangle size={22} />}
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase opacity-70">
                    Crop: {result.crop}
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {result.isHealthy ? 'Healthy ✓' : result.disease}
                  </p>
                  <p className="mt-2 text-xs">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={reset}
                className="mt-4 min-h-11 w-full rounded-xl border border-current/20 text-sm font-bold"
              >
                Try another leaf
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
      }
