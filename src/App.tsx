import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Calculator as CalcIcon,
  Calendar as CalendarIcon,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Cloud,
  CloudOff,
  FileImage,
  FileText,
  History as HistoryIcon,
  Leaf,
  RefreshCw,
  Save,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import CalendarPage from '@/pages/Calendar';
import CalculatorPage from '@/pages/Calculator';
import WeatherPage from '@/pages/Weather';
import MandiPage from '@/pages/Mandi';
import SchemesPage from '@/pages/Schemes';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';

const queryClient = new QueryClient();
const HISTORY_KEY = 'soil-health-checker-history';
const MAX_HISTORY_ITEMS = 15;
const MAX_IMAGE_DIM = 480;

type Status = 'Low' | 'Medium' | 'High';
type NutrientKey = 'nitrogen' | 'phosphorus' | 'potassium' | 'ph';
type Step = 'home' | 'preview' | 'analyzing' | 'results';

type NutrientResult = {
  status: Status;
  explanation: string;
};

type SoilTest = {
  id: string;
  createdAt: string;
  imageDataUrl?: string;
  nutrients: Record<NutrientKey, NutrientResult>;
  recommendation: string;
  isDemo: boolean;
};

const nutrientMeta: Record
  NutrientKey,
  { label: string; short: string; accent: string; unit: string }
> = {
  nitrogen: { label: 'Nitrogen', short: 'N', accent: '#d86f54', unit: 'leaf growth' },
  phosphorus: { label: 'Phosphorus', short: 'P', accent: '#c39543', unit: 'root strength' },
  potassium: { label: 'Potassium', short: 'K', accent: '#3f8880', unit: 'plant resilience' },
  ph: { label: 'Soil pH', short: 'pH', accent: '#64718d', unit: 'nutrient access' },
};

/* ---------- storage (localStorage, capped at 15 items) ---------- */

function readHistory(): SoilTest[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SoilTest[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY_ITEMS) : [];
  } catch {
    return [];
  }
}

function writeHistory(items: SoilTest[]): boolean {
  try {
    const trimmed = items.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      try {
        const emergency = items.slice(0, 5);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(emergency));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

function getStorageSize(): number {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? new Blob([raw]).size : 0;
  } catch {
    return 0;
  }
}

/* ---------- helpers ---------- */

function formatDate(date: string, language: Language): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  const locale = language === 'en' ? 'en-IN' : `${language}-IN-u-nu-latn`;

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };

  try {
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch {
    return new Intl.DateTimeFormat('en-IN', options).format(d);
  }
}

async function downscaleImage(dataUrl: string, maxDim = MAX_IMAGE_DIM): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = dataUrl;
  });
}

async function sampleImageStats(dataUrl: string): Promise<{
  rgb: [number, number, number];
  brightness: number;
  saturation: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      const lo = Math.floor(size / 4);
      const hi = Math.ceil((size * 3) / 4);
      for (let y = lo; y < hi; y++) {
        for (let x = lo; x < hi; x++) {
          const i = (y * size + x) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      resolve({ rgb: [r, g, b], brightness, saturation });
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = dataUrl;
  });
}

/* ---------- classification (colour-based placeholder — replace with a
   real trained model once N/P/K/pH datasets + Teachable Machine models
   are ready) ---------- */

function bucket(v: number, lo: number, hi: number): Status {
  if (v < lo) return 'Low';
  if (v > hi) return 'High';
  return 'Medium';
}

async function classifySample(imageDataUrl: string): Promise<SoilTest> {
  const { rgb, brightness, saturation } = await sampleImageStats(imageDataUrl);
  const [r, g, b] = rgb;

  const warmth = r - b;
  const greenness = g - (r + b) / 2;

  const nutrients: Record<NutrientKey, NutrientResult> = {
    nitrogen: {
      status: bucket(greenness, -12, 12),
      explanation: 'Supports leafy growth and a healthy green canopy.',
    },
    phosphorus: {
      status: bucket(warmth, 10, 45),
      explanation: 'Helps roots establish and supports flowering.',
    },
    potassium: {
      status: bucket(saturation, 40, 95),
      explanation: 'Helps plants manage heat, water, and disease pressure.',
    },
    ph: {
      status: bucket(brightness, 95, 165),
      explanation: 'A balanced range helps plants access nutrients.',
    },
  };

  const lowKeys = (Object.keys(nutrients) as NutrientKey[]).filter(
    (k) => nutrients[k].status === 'Low',
  );

  const recommendation = lowKeys.length
    ? `Consider a measured ${lowKeys
        .map((k) => nutrientMeta[k].label)
        .join(' and ')} plan after confirming with a local soil lab.`
    : 'The sample looks broadly balanced. Keep organic matter moving and confirm before a major fertilizer application.';

  return {
    id: `soil-${Date.now()}`,
    createdAt: new Date().toISOString(),
    imageDataUrl,
    nutrients,
    recommendation,
    isDemo: true,
  };
    }

/* ---------- UI components ---------- */

function Header() {
  const { copy } = useLanguage();
  return (
    <header className="topbar">
      <div className="app-max flex items-center justify-between px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3 no-underline" aria-label={copy.appName}>
          <span className="brand-mark" aria-hidden="true">
            <Leaf size={22} strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block text-[.92rem] font-bold tracking-[-.02em]">{copy.appName}</span>
            <span className="eyebrow mt-1 block">{copy.appSub}</span>
          </span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

function BottomNav({ location, onNewTest }: { location: string; onNewTest: () => void }) {
  const { copy } = useLanguage();
  const items = [
    { href: '/', label: copy.home, icon: ScanLine, isButton: true },
    { href: '/calendar', label: copy.calendar, icon: CalendarIcon },
    { href: '/calculator', label: copy.calculator, icon: CalcIcon },
    { href: '/weather', label: copy.weather, icon: Cloud },
    { href: '/mandi', label: copy.mandi, icon: TrendingUp },
    { href: '/schemes', label: copy.schemes, icon: FileText },
    { href: '/history', label: copy.history, icon: HistoryIcon },
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <div className="bottom-nav-inner flex items-center justify-around gap-1 overflow-x-auto px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          if (item.isButton) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={onNewTest}
                data-active={active}
                className="nav-pill flex min-h-12 min-w-20 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[.7rem] font-semibold"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active}
              className="nav-pill flex min-h-12 min-w-20 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[.7rem] font-semibold"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function StatusPill({ status }: { status: Status }) {
  const { copy } = useLanguage();
  const label = status === 'Low' ? copy.low : status === 'Medium' ? copy.medium : copy.high;
  const colors =
    status === 'Low'
      ? 'border-[#e5b5a5] bg-[#f9e4dc] text-[#9c4936]'
      : status === 'Medium'
        ? 'border-[#e6c879] bg-[#fbf0c9] text-[#79601e]'
        : 'border-[#a9ccc2] bg-[#deeee9] text-[#28655e]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${colors}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function EmptyHistory({ onStart }: { onStart: () => void }) {
  const { copy } = useLanguage();
  return (
    <div className="rise-in rounded-[1.6rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)] px-6 py-12 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
        <ClipboardList size={28} />
      </div>
      <h2 className="mt-5 text-xl font-bold tracking-[-.03em]">{copy.noHistory}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        {copy.noHistoryBody}
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-lift)]"
      >
        <ScanLine size={18} /> {copy.start}
      </button>
    </div>
  );
}

function PhotoChooser({
  onFile,
  error,
  onBack,
}: {
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  error: string | null;
  onBack: () => void;
}) {
  const { copy } = useLanguage();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rise-in rounded-[1.7rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[hsl(var(--border))] md:hidden"
          aria-label={copy.back}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
          <Camera size={23} />
        </div>
        <div>
          <p className="eyebrow">{copy.captureLabel}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">{copy.captureTitle}</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            {copy.captureBody}
          </p>
        </div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="tap-card flex min-h-16 items-center justify-center gap-3 rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-lift)]"
        >
          <Camera size={20} /> {copy.camera}
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="tap-card flex min-h-16 items-center justify-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)] px-4 text-sm font-bold"
        >
          <Upload size={20} /> {copy.gallery}
        </button>
      </div>
      <input ref={cameraRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={onFile} />
      <input ref={galleryRef} className="hidden" type="file" accept="image/*" onChange={onFile} />
      <div className="mt-5 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <ShieldCheck size={15} /> {copy.supported}
      </div>
      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
        <CircleHelp size={14} className="mt-0.5 shrink-0" /> {copy.unavailable}
      </p>
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-4 text-sm text-[#833b2e]" role="alert">
          <CloudOff size={18} className="mt-0.5 shrink-0" />
          <span>
            <strong>{copy.errorTitle}.</strong> {error}
          </span>
        </div>
      )}
    </section>
  );
}

function PreviewStep({
  image,
  onAnalyze,
  onRetake,
}: {
  image: string;
  onAnalyze: () => void;
  onRetake: () => void;
}) {
  const { copy } = useLanguage();
  return (
    <section className="rise-in mx-auto max-w-2xl rounded-[1.7rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex items-center gap-3 px-2 pt-1">
        <button
          type="button"
          onClick={onRetake}
          className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))]"
          aria-label={copy.back}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="eyebrow">{copy.previewLabel}</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-.03em]">{copy.previewTitle}</h2>
        </div>
      </div>
      <div className="photo-frame mt-5 overflow-hidden rounded-[1.2rem] border border-[hsl(var(--border))]">
        <img src={image} alt="Selected soil reagent sample" className="aspect-[4/3] h-auto w-full object-contain" />
      </div>
      <p className="mt-4 px-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy.previewBody}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={onAnalyze}
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-lift)]"
        >
          <Sparkles size={19} /> {copy.usePhoto}
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] px-5 text-sm font-bold"
        >
          <RefreshCw size={17} /> {copy.retake}
        </button>
      </div>
    </section>
  );
}

function AnalysisStep() {
  const { copy } = useLanguage();
  const stages = [copy.preparing, copy.nutrients, copy.composing];
  return (
    <section
      className="rise-in mx-auto max-w-xl rounded-[1.7rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-7 shadow-[var(--shadow-soft)] sm:p-10"
      aria-live="polite"
    >
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-[hsl(var(--primary))] text-[hsl(var(--secondary))]">
        <ScanLine size={38} className="animate-pulse" />
      </div>
      <p className="eyebrow mt-8 text-center">{copy.readingLabel}</p>
      <h2 className="mt-3 text-center text-2xl font-bold tracking-[-.04em]">{copy.analyzing}</h2>
      <p className="mt-3 text-center text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        {copy.analyzingBody}
      </p>
      <div className="mt-8 space-y-5">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center gap-3 text-sm">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[hsl(var(--primary)/.3)] text-xs font-bold text-[hsl(var(--primary))]">
              {index + 1}
            </span>
            <span className={index === 1 ? 'font-bold' : 'text-[hsl(var(--muted-foreground))]'}>{stage}</span>
            <span
              className={`analysis-line ml-auto h-1 w-16 rounded-full bg-[hsl(var(--secondary))] ${
                index === 0 ? '' : 'opacity-60'
              }`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultView({
  test,
  saved,
  onSave,
  onNew,
}: {
  test: SoilTest;
  saved: boolean;
  onSave: () => void;
  onNew: () => void;
}) {
  const { copy, language } = useLanguage();
  const nutrientKeys = Object.keys(nutrientMeta) as NutrientKey[];

  return (
    <div className="page-enter">
      <section className="field-grain overflow-hidden rounded-[1.8rem] bg-[hsl(var(--primary))] px-5 py-7 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-lift)] sm:px-9 sm:py-9">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="eyebrow text-[hsl(var(--secondary)/.9)]">{copy.resultLabel}</p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-[-.05em] sm:text-4xl">{copy.resultTitle}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[hsl(var(--primary-foreground)/.74)]">
              {copy.resultBody}
            </p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--secondary)/.3)] bg-[hsl(var(--secondary)/.12)] px-3 py-2 text-right">
            <p className="font-mono-field text-[.62rem] uppercase tracking-[.14em] text-[hsl(var(--secondary))]">
              {copy.sampleProfile}
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--primary-foreground)/.75)]">
              {formatDate(test.createdAt, language)}
            </p>
          </div>
        </div>
      </section>

      {test.isDemo && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-4 text-sm text-[#66511b]">
          <CircleHelp size={19} className="mt-0.5 shrink-0" />
          <span>
            <strong>{copy.demo}.</strong> {copy.demoBody}
          </span>
        </div>
      )}

      <section className="mt-7">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">{copy.sampleProfile}</p>
            <h2 className="mt-2 text-xl font-bold tracking-[-.03em]">N · P · K · pH</h2>
          </div>
          <span className="font-mono-field text-xs text-[hsl(var(--muted-foreground))]">{copy.colourRead}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {nutrientKeys.map((key, index) => {
            const nutrient = test.nutrients[key];
            const meta = nutrientMeta[key];
            return (
              <article
                key={key}
                className={`rise-in rise-in-delay-${index + 1} rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-soft)]`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-11 w-11 place-items-center rounded-xl text-lg font-bold text-[#243634]"
                      style={{ backgroundColor: meta.accent }}
                    >
                      {meta.short}
                    </span>
                    <div>
                      <h3 className="font-bold">{meta.label}</h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{meta.unit}</p>
                    </div>
                  </div>
                  <StatusPill status={nutrient.status} />
                </div>
                <p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                  {nutrient.explanation}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-7 rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.2)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-[hsl(var(--primary))]">
            <Leaf size={21} />
          </div>
          <div>
            <p className="eyebrow text-[hsl(var(--primary))]">{copy.guidance}</p>
            <p className="mt-2 text-base font-semibold leading-7">{test.recommendation}</p>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy.guidanceBody}</p>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={saved ? undefined : onSave}
          disabled={saved}
          className={`flex min-h-14 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold ${
            saved
              ? 'border border-[#a9ccc2] bg-[#deeee9] text-[#28655e]'
              : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-lift)]'
          }`}
        >
          {saved ? <Check size={19} /> : <Save size={19} />}
          {saved ? copy.saved : copy.save}
        </button>
        <button
          type="button"
          onClick={onNew}
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 text-sm font-bold"
        >
          <ScanLine size={19} /> {copy.newTest}
        </button>
      </div>
    </div>
  );
}

function HomePage({
  history,
  step,
  image,
  currentTest,
  saved,
  error,
  onStart,
  onAnalyze,
  onRetake,
  onSave,
  onNew,
}: {
  history: SoilTest[];
  step: Step;
  image: string | null;
  currentTest: SoilTest | null;
  saved: boolean;
  error: string | null;
  onStart: () => void;
  onAnalyze: () => void;
  onRetake: () => void;
  onSave: () => void;
  onNew: () => void;
}) {
  const { copy, language } = useLanguage();

  if (step === 'preview' && image)
    return <PreviewStep image={image} onAnalyze={onAnalyze} onRetake={onRetake} />;
  if (step === 'analyzing') return <AnalysisStep />;
  if (step === 'results' && currentTest)
    return <ResultView test={currentTest} saved={saved} onSave={onSave} onNew={onNew} />;

  return (
    <div className="page-enter">
      <section className="field-grain relative overflow-hidden rounded-[1.8rem] bg-[hsl(var(--primary))] px-5 py-8 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-lift)] sm:px-9 sm:py-10">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-[hsl(var(--secondary))]">
            <span className="h-px w-8 bg-current" />
            <span className="eyebrow text-current">{copy.companionLabel}</span>
          </div>
          <h1 className="mt-5 max-w-xl text-[2.55rem] font-bold leading-[.98] tracking-[-.07em] sm:text-6xl">
            {copy.greeting}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[hsl(var(--primary-foreground)/.75)]">
            {copy.intro}
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-7 inline-flex min-h-14 items-center gap-3 rounded-xl bg-[hsl(var(--secondary))] px-5 text-sm font-bold text-[hsl(var(--secondary-foreground))] shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
          >
            {copy.start}
            <ArrowRight size={19} />
          </button>
        </div>
        <div
          className="absolute -bottom-10 -right-8 h-48 w-48 rounded-full border-[18px] border-[hsl(var(--secondary)/.22)] sm:h-64 sm:w-64"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-9 right-10 hidden h-24 w-24 rotate-12 rounded-[2rem] border border-[hsl(var(--secondary)/.38)] md:block"
          aria-hidden="true"
        />
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">{copy.how}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">{copy.usefulAnswer}</h2>
            </div>
            <span className="font-mono-field text-xs text-[hsl(var(--muted-foreground))]">N / P / K / pH</span>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              { no: '01', icon: Camera, title: copy.stepOne, body: copy.stepOneBody },
              { no: '02', icon: ScanLine, title: copy.stepTwo, body: copy.stepTwoBody },
              { no: '03', icon: Leaf, title: copy.stepThree, body: copy.stepThreeBody },
            ].map(({ no, icon: Icon, title, body }) => (
              <div key={no} className="tap-card flex gap-4 rounded-[1.2rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/.65)] p-4">
                <span className="font-mono-field pt-1 text-xs text-[hsl(var(--accent))]">{no}</span>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--primary))]">
                  <Icon size={19} />
                </div>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-5 text-[hsl(var(--muted-foreground))]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section cla

        /* ---------- app shell ---------- */

function AppContent() {
  const [location, setLocation] = useLocation();
  const { copy } = useLanguage();
  const [history, setHistory] = useState<SoilTest[]>(readHistory);
  const [step, setStep] = useState<Step>('home');
  const [image, setImage] = useState<string | null>(null);
  const [currentTest, setCurrentTest] = useState<SoilTest | null>(null);
  const [showChooser, setShowChooser] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const analysisTimer = useRef<number | null>(null);

  useEffect(() => {
    document.title = copy.appName;
  }, [copy.appName]);

  useEffect(() => {
    const manifest = document.querySelector('link[rel="manifest"]') ?? document.createElement('link');
    manifest.setAttribute('rel', 'manifest');
    manifest.setAttribute('href', '/manifest.webmanifest');
    document.head.appendChild(manifest);

    const theme = document.querySelector('meta[name="theme-color"]') ?? document.createElement('meta');
    theme.setAttribute('name', 'theme-color');
    theme.setAttribute('content', '#24544f');
    document.head.appendChild(theme);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (analysisTimer.current) window.clearTimeout(analysisTimer.current);
    };
  }, []);

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [history],
  );

  const start = () => {
    setLocation('/');
    setStep('home');
    setImage(null);
    setCurrentTest(null);
    setSaved(false);
    setError(null);
    setShowChooser(false);
    setAnalyzing(false);
  };

  const beginCapture = () => {
    setError(null);
    setShowChooser(true);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(copy.errorBody);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setCurrentTest(null);
        setSaved(false);
        setStep('preview');
      } else {
        setError(copy.errorBody);
      }
    };
    reader.onerror = () => setError(copy.errorBody);
    reader.readAsDataURL(file);
  };

  const analyse = () => {
    if (!image || analyzing) return;
    setAnalyzing(true);
    setStep('analyzing');

    analysisTimer.current = window.setTimeout(async () => {
      try {
        const result = await classifySample(image);
        setCurrentTest(result);
        setStep('results');
      } catch {
        setError(copy.errorBody);
        setStep('home');
        setShowChooser(true);
      } finally {
        setAnalyzing(false);
      }
    }, 1550);
  };

  const save = async () => {
    if (!currentTest || saved) return;
    let thumbnail = currentTest.imageDataUrl;
    try {
      if (thumbnail && thumbnail.length > 200_000) {
        thumbnail = await downscaleImage(thumbnail);
      }
    } catch {
      // downscale failed — fall back to the original image
      thumbnail = currentTest.imageDataUrl;
    }

    const toStore: SoilTest = { ...currentTest, imageDataUrl: thumbnail };
    const next = [toStore, ...history.filter((item) => item.id !== currentTest.id)];

    const success = writeHistory(next);
    if (!success) {
      setError('Storage full. Delete some old tests or skip saving this one.');
      return;
    }

    setHistory(next);
    setCurrentTest(toStore);
    setSaved(true);
  };

  // Opens a saved history entry in the results view, without re-running analysis.
  const openHistory = (test: SoilTest) => {
    setLocation('/');
    setCurrentTest(test);
    setImage(test.imageDataUrl ?? null);
    setSaved(true);
    setError(null);
    setShowChooser(false);
    setStep('results');
  };

  const clearAllHistory = () => {
    setHistory([]);
    writeHistory([]);
    setConfirmingClear(false);
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="app-max px-5 py-7 sm:py-10 md:px-8">
        <Switch>
          <Route path="/history">
            <HistoryPage
              history={sortedHistory}
              onOpen={openHistory}
              onClear={() => setConfirmingClear(true)}
              onStart={start}
            />
          </Route>
          <Route path="/calendar">
            <CalendarPage />
          </Route>
          <Route path="/calculator">
            <CalculatorPage />
          </Route>
          <Route path="/weather">
            <WeatherPage />
          </Route>
          <Route path="/mandi">
            <MandiPage />
          </Route>
          <Route path="/schemes">
            <SchemesPage />
          </Route>
          <Route path="/">
            {location === '/' && step === 'home' && showChooser ? (
              <PhotoChooser onFile={handleFile} error={error} onBack={start} />
            ) : (
              <HomePage
                history={sortedHistory}
                step={step}
                image={image}
                currentTest={currentTest}
                saved={saved}
                error={error}
                onStart={beginCapture}
                onAnalyze={analyse}
                onRetake={start}
                onSave={save}
                onNew={start}
              />
            )}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav location={location} onNewTest={start} />

      {confirmingClear && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-lift)]">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold tracking-[-.02em]">{copy.clearTitle}</h2>
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[hsl(var(--muted-foreground))]"
                aria-label={copy.cancel}
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy.clearBody}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="flex min-h-11 items-center justify-center rounded-xl border border-[hsl(var(--border))] text-sm font-bold"
              >
                {copy.cancel}
              </button>
              <button
                type="button"
                onClick={clearAllHistory}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#9c4936] text-sm font-bold text-white"
              >
                <Trash2 size={16} /> {copy.confirmClear}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </WouterRouter>
    </QueryClientProvider>
  );
          }  
