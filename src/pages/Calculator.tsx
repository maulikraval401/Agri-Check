import { useState } from 'react';
import { Calculator as CalcIcon } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { calculateFertilizer, CROPS, type CropKey, type Status } from '@/lib/fertilizer';
import { speak } from '@/lib/voice';

export default function CalculatorPage() {
  const { copy, language } = useLanguage();
  const [crop, setCrop] = useState<CropKey>('cotton');
  const [area, setArea] = useState(1);
  const [n, setN] = useState<Status>('Medium');
  const [p, setP] = useState<Status>('Medium');
  const [k, setK] = useState<Status>('Medium');

  const result = calculateFertilizer(crop, area, n, p, k);

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
    const msg = `Urea ${result.urea} kg, DAP ${result.dap} kg, MOP ${result.mop} kg`;
    speak(msg, language);
  };

  return (
    <div className="page-enter">
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

        <div>
          <p className="mb-2 text-sm font-semibold">{copy.calculatorAreaLabel}</p>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={area}
            onChange={(e) => setArea(parseFloat(e.target.value) || 1)}
            className="min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3"
          />
        </div>

        <StatusSelect label={copy.nutrientNitrogen} value={n} onChange={setN} />
        <StatusSelect label={copy.nutrientPhosphorus} value={p} onChange={setP} />
        <StatusSelect label={copy.nutrientPotassium} value={k} onChange={setK} />
      </div>

      <div className="mt-6 rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.2)] p-5">
        <div className="flex items-center gap-3">
          <CalcIcon size={22} />
          <h2 className="text-lg font-bold">{copy.calculatorRecommended}</h2>
        </div>
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

        <button
          onClick={handleSpeak}
          className="mt-4 min-h-11 w-full rounded-xl border border-[hsl(var(--border))] text-sm font-bold"
        >
          🔊 {copy.calculatorListen}
        </button>
      </div>
    </div>
  );
}
