import { useRef, useState, type ChangeEvent } from 'react';
import { Upload, Camera, Loader2, Check, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { detectDisease, type DiseaseResult } from '@/lib/disease-detect';

const SUPPORTED_PLANTS = [
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🫐', name: 'Blueberry' },
  { emoji: '🍒', name: 'Cherry' },
  { emoji: '🌽', name: 'Corn' },
  { emoji: '🍇', name: 'Grape' },
  { emoji: '🍊', name: 'Orange' },
  { emoji: '🍑', name: 'Peach' },
  { emoji: '🫑', name: 'Pepper' },
  { emoji: '🥔', name: 'Potato' },
  { emoji: '🌱', name: 'Soybean' },
  { emoji: '🥒', name: 'Squash' },
  { emoji: '🍓', name: 'Strawberry' },
  { emoji: '🍅', name: 'Tomato' },
];

export default function DiseasePage() {
  const { language } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        const r = await detectDisease(dataUrl);
        setResult(r);
      } catch (err) {
        console.error(err);
        setError(
          language === 'gu'
            ? 'ફોટો વાંચી શકાયો નથી. ફરી પ્રયાસ કરો.'
            : 'Photo read nahi hua. Dobara try karo.',
        );
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
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">
        Disease Detection
      </h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Leaf ki photo lo — disease ya healthy batao
      </p>

      {/* Photo tips */}
      <div className="mt-4 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
        <p className="font-bold mb-1">📸 Photo tips:</p>
        <ul className="ml-4 list-disc space-y-0.5">
          <li>Sirf 1 leaf lo (fruit/stem nahi)</li>
          <li>Din ke ujale me lo</li>
          <li>Leaf poori frame me ho</li>
          <li>Background plain ho</li>
        </ul>
      </div>

      {/* Supported Plants */}
      <div className="mt-5">
        <p className="eyebrow mb-3">Supported Plants ({SUPPORTED_PLANTS.length})</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {SUPPORTED_PLANTS.map((plant) => (
            <div
              key={plant.name}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-semibold"
            >
              <span className="text-lg">{plant.emoji}</span>
              <span>{plant.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Camera / Gallery */}
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
              <Loader2 className="animate-spin" size={18} /> Analysing...
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-[hsl(var(--destructive))]">{error}</p>
          )}

          {result && !loading && (
            <>
              {!result.isConfident ? (
                <div className="mt-4 rounded-[1.35rem] border border-[#e6c879] bg-[#fbf0c9] p-5 text-[#66511b]">
                  <div className="flex items-start gap-3">
                    <HelpCircle size={22} className="mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">Photo clear nahi hai</p>
                      <p className="mt-1 text-sm">
                        Model {Math.round(result.confidence * 100)}% sure hai.
                        Kripya ek saaf leaf ki photo lo.
                      </p>
                      <p className="mt-2 text-xs opacity-80">
                        Best prediction: {result.crop} — {result.disease}
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
              ) : (
                <div
                  className={`mt-4 rounded-[1.35rem] p-5 ${
                    result.isHealthy
                      ? 'border border-[#a9ccc2] bg-[#deeee9] text-[#28655e]'
                      : 'border border-[#e5b5a5] bg-[#f9e4dc] text-[#833b2e]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.isHealthy ? (
                      <Check size={22} />
                    ) : (
                      <AlertTriangle size={22} />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase opacity-70">
                        {result.crop}
                      </p>
                      <p className="mt-1 text-lg font-bold">
                        {result.isHealthy ? 'Healthy ✓' : result.disease}
                      </p>
                      <p className="mt-2 text-xs">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                      </p>
                      <div className="mt-3 space-y-1 rounded-lg bg-white/50 p-2">
                        <p className="text-[.65rem] font-bold uppercase opacity-70">

                          Top predictions:
                        </p>
                        {result.topPredictions.map((p, i) => (
  
                  <div key={i} className="flex justify-between text-xs">
  
                    <span className="truncate">
        {p.className.split('___').join(' — ').replace(/_/g, ' ')}
      </span>
      <span className="font-bold ml-2">
        {(p.confidence * 100).toFixed(1)}%
      </span>
    </div>
  ))}
</div>
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
            </>
          )}
        </div>
      )}
    </div>
  );
             }
