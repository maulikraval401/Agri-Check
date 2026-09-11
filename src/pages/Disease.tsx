import { useEffect, useRef, useState } from 'react';
import { Bug, Camera, Upload, CircleHelp } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  isDiseaseModelAvailable,
  detectDisease,
  type DiseasePrediction,
} from '@/lib/disease-detect';

// ⚠️ No trained plant-disease model exists yet (see src/lib/disease-detect.ts).
// This page checks for the model on mount and shows a "not available yet"
// state instead of a fake result when it's missing — same honesty principle
// as the isDemo flag on the soil test results.

export default function DiseasePage() {
  const { language } = useLanguage();
  const [modelReady, setModelReady] = useState<boolean | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<DiseasePrediction[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    isDiseaseModelAvailable().then(setModelReady);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPredictions(null);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const runDetection = async () => {
    if (!imgRef.current) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await detectDisease(imgRef.current);
      setPredictions(result);
    } catch {
      setError('Could not analyse this image.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-enter">
      <p className="eyebrow">08 / disease detection</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">
        Disease Detection
      </h1>

      {modelReady === false && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-4 text-sm text-[#66511b]">
          <CircleHelp size={19} className="mt-0.5 shrink-0" />
          <span>
            <strong>Not available yet.</strong> This feature needs a trained
            plant-disease model that hasn't been added to the project yet.
            Check back once it's trained and connected.
          </span>
        </div>
      )}

      {modelReady === null && (
        <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">
          Checking availability…
        </p>
      )}

      {modelReady === true && (
        <div className="mt-6 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-soft)]">
          {!image ? (
            <label className="flex min-h-16 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-[hsl(var(--border))] text-sm font-bold">
              <Upload size={20} />
              Upload a leaf photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFile}
              />
            </label>
          ) : (
            <div>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img
                ref={imgRef}
                src={image}
                alt="Uploaded leaf"
                className="w-full rounded-xl object-cover"
                crossOrigin="anonymous"
              />
              <button
                onClick={runDetection}
                disabled={analyzing}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))]"
              >
                <Bug size={18} />
                {analyzing ? 'Analysing…' : 'Detect disease'}
              </button>
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-[hsl(var(--destructive))]">{error}</p>
          )}

          {predictions && (
            <div className="mt-4 space-y-2">
              {predictions.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center justify-between rounded-xl bg-[hsl(var(--muted)/.55)] p-3 text-sm"
                >
                  <span className="font-semibold">{p.label}</span>
                  <span>{(p.confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
          }
