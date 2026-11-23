import { Link } from 'wouter';
import { useEffect, useState } from 'react';
import { ArrowRight, Calculator as CalcIcon, AlertTriangle, Info, IndianRupee } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  calculateFertilizer, 
  CROPS, 
  type CropKey, 
  type Status, 
  type Season,
  availableSeasons,
  defaultSeason,
  getWarningText,
  getNoticeText
} from '@/lib/fertilizer';
import { speak } from '@/lib/voice';

export default function CalculatorPage() {
  const { copy, language } = useLanguage();
  const [crop, setCrop] = useState<CropKey>('cotton');
  const [area, setArea] = useState<string>('1');
  const [n, setN] = useState<Status>('Medium');
  const [p, setP] = useState<Status>('Medium');
  const [k, setK] = useState<Status>('Medium');
  const [season, setSeason] = useState<Season>('kharif');

  // Set default season when crop changes
  useEffect(() => {
    const def = defaultSeason(crop);
    if (def) setSeason(def);
  }, [crop]);

  const seasonsAvailable = availableSeasons(crop);
  
  const result = calculateFertilizer(
    crop, 
    parseFloat(area) || 0, 
    n, p, k, 
    undefined, 
    { season }
  );

  const StatusSelect = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: Status;
    onChange: (s: Status) => void;
  }) => (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="flex gap-2">
        {(['Low', 'Medium', 'High'] as Status[]).map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`min-h-10 flex-1 rounded-lg text-xs font-bold ${
              value === s
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'border border-[hsl(var(--border))]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  const handleSpeak = () => {
    const msg = `Urea ${result.urea} kg, DAP ${result.dap} kg, MOP ${result.mop} kg. Total kharcha ${result.totalCost} rupees.`;
    speak(msg, language);
  };

  return (
    <div className="page-enter pb-24">
      <p className="eyebrow">04 / calculator</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">
        {copy.calculator}
      </h1>

      <div className="mt-6 grid gap-4 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-soft)]">
        <div>
          <p className="mb-2 text-sm font-semibold">{copy.calculatorCropLabel}</p>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value as CropKey)}
            className="min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3"
          >
            {CROPS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {seasonsAvailable.length > 1 && (
          <div>
            <p className="mb-2 text-sm font-semibold">Season / સીઝન</p>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value as Season)}
              className="min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3"
            >
              {seasonsAvailable.map((s) => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold">{copy.calculatorAreaLabel}</p>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3"
          />
        </div>

        <StatusSelect label={copy.nutrientNitrogen} value={n} onChange={setN} />
        <StatusSelect label={copy.nutrientPhosphorus} value={p} onChange={setP} />
        <StatusSelect label={copy.nutrientPotassium} value={k} onChange={setK} />
      </div>

      {/* Result Card */}
      <div className="mt-6 rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.2)] p-5">
        <div className="flex items-center gap-3">
          <CalcIcon size={22} />
          <h2 className="text-lg font-bold">{copy.calculatorRecommended}</h2>
        </div>
        
        {result.warning === 'no_rdf' ? (
          <div className="mt-4 rounded-xl bg-orange-100 p-4 text-orange-800 text-sm font-semibold flex gap-2">
             <AlertTriangle size={20} className="shrink-0" />
             {getWarningText('no_rdf', language)}
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[hsl(var(--card))] p-3 text-center">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Urea</p>
                <p className="mt-1 text-2xl font-bold">{result.urea}</p>
                <p className="text-xs">kg</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--card))] p-3 text-center">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">DAP</p>
                <p className="mt-1 text-2xl font-bold">{result.dap}</p>
                <p className="text-xs">kg</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--card))] p-3 text-center">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">MOP</p>
                <p className="mt-1 text-2xl font-bold">{result.mop}</p>
                <p className="text-xs">kg</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1 text-sm font-bold text-green-700 bg-green-50 rounded-lg py-2">
              <IndianRupee size={16} />
              Estimated Cost: {result.totalCost}
            </div>

            {/* Warning Banner (Red) */}
            {result.warning && result.warning !== 'no_rdf' && (
              <div className="mt-3 rounded-lg bg-red-100 p-3 text-xs font-bold text-red-700 flex gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                {getWarningText(result.warning, language)}
              </div>
            )}

            {/* Notice Banner (Yellow) */}
            {result.notice && (
              <div className="mt-3 rounded-lg bg-yellow-100 p-3 text-xs font-bold text-yellow-800 flex gap-2">
                <Info size={16} className="shrink-0" />
                {getNoticeText(result.notice, language)}
              </div>
            )}

            <button
              onClick={handleSpeak}
              className="mt-4 min-h-11 w-full rounded-xl border border-[hsl(var(--border))] text-sm font-bold"
            >
              🔊 {copy.calculatorListen}
            </button>
          </>
        )}
      </div>
      
      {/* Other Calculators */}
      <div className="mt-6">
        <p className="eyebrow mb-3">More Tools</p>
        <div className="grid gap-3">
          <Link
            href="/dose-calculator"
            className="flex items-center justify-between gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4 no-underline"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))] text-xl">
                🧪
              </span>
              <div>
                <p className="font-bold text-[hsl(var(--foreground))]">
                  Pesticide Dose Calculator
                </p>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                  Kitna ml kitne litre pani me
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="shrink-0 text-[hsl(var(--primary))]" />
          </Link>

          <Link
            href="/cost-calculator"
            className="flex items-center justify-between gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4 no-underline"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))] text-xl">
                💰
              </span>
              <div>
                <p className="font-bold text-[hsl(var(--foreground))]">
                  Cost & Profit Calculator
                </p>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                  Kitna kharcha, kitna munafa
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="shrink-0 text-[hsl(var(--primary))]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
