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
