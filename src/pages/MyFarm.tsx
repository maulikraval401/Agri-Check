import { useState } from 'react';
import { Link } from 'wouter';
import { useLocation } from 'wouter';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  readFarm,
  writeFarm,
  clearFarm,
  type FarmProfile,
  type IrrigationType,
  type SoilType,
  IRRIGATION_OPTIONS,
  SOIL_OPTIONS,
  CROP_OPTIONS,
} from '@/lib/farm-storage';

export default function MyFarm() {
  const { language } = useLanguage();
  const existing = readFarm();
  const [, setLocation] = useLocation();
  const [name, setName] = useState(existing?.name || '');
  const [village, setVillage] = useState(existing?.village || '');
  const [crops, setCrops] = useState<string[]>(existing?.crops || []);
  const [landArea, setLandArea] = useState(existing?.landArea || 1);
  const [irrigation, setIrrigation] = useState<IrrigationType>(
    existing?.irrigation || 'drip',
  );
  const [soilType, setSoilType] = useState<SoilType>(
    existing?.soilType || 'black',
  );
  const [sowingDate, setSowingDate] = useState(
    existing?.sowingDate || new Date().toISOString().split('T')[0],
  );
  const [saved, setSaved] = useState(false);

  const toggleCrop = (value: string) => {
    setCrops((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Naam daalo');
      return;
    }
    if (crops.length === 0) {
      alert('Kam se kam ek crop select karo');
      return;
    }

    const profile: FarmProfile = {
      name: name.trim(),
      village: village.trim(),
      crops,
      landArea,
      irrigation,
      soilType,
      sowingDate,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    const ok = writeFarm(profile);
    if (ok) {
      setSaved(true);
      setTimeout(() => {
  setLocation('/dashboard');
      }, 800);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert('Save nahi hua. Dobara try karo.');
    }
  };

  const handleClear = () => {
    if (!confirm('My Farm data delete karna hai?')) return;
    clearFarm();
    setName('');
    setVillage('');
    setCrops([]);
    setLandArea(1);
    setIrrigation('drip');
    setSoilType('black');
    setSowingDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="page-enter">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] no-underline"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <p className="eyebrow mt-4">My Farm Setup</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">
        {language === 'gu' ? 'મારું ખેત' : 'My Farm'}
      </h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Apni khet ki jankari save karo — app roz personalized advice degi
      </p>

      <div className="mt-6 grid gap-4">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold">Naam *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maulik Raval"
            className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
          />
        </div>

        {/* Village */}
        <div>
          <label className="mb-2 block text-sm font-semibold">Gaam / Village</label>
          <input
            type="text"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            placeholder="Anand"
            className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
          />
        </div>

        {/* Crops */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Crops * (ek ya zyada)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CROP_OPTIONS.map((crop) => (
              <button
                key={crop.value}
                type="button"
                onClick={() => toggleCrop(crop.value)}
                className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${
                  crops.includes(crop.value)
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                }`}
              >
                <span>{crop.emoji}</span>
                <span className="truncate">{crop.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Land Area */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Zameen (acres)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={landArea}
            onChange={(e) => setLandArea(parseFloat(e.target.value) || 1)}
            className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
          />
        </div>

        {/* Irrigation */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Sinchai / Irrigation
          </label>
          <select
            value={irrigation}
            onChange={(e) => setIrrigation(e.target.value as IrrigationType)}
            className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
          >
            {IRRIGATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Soil Type */}
        <div>
          <label className="mb-2 block text-sm font-semibold">Mati / Soil Type</label>
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value as SoilType)}
            className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
          >
            {SOIL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sowing Date */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Buwai ki tarikh / Sowing Date
          </label>
          <input
            type="date"
            value={sowingDate}
            onChange={(e) => setSowingDate(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid gap-3">
      {existing && (
  <Link
    href="/dashboard"
    className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--secondary))] text-sm font-bold text-[hsl(var(--secondary-foreground))] no-underline"
  >
    🌅 View My Dashboard
  </Link>
)}
        
        <button
          type="button"
          onClick={handleSave}
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))]"
        >
          <Save size={18} />
          {saved ? '✓ Saved!' : 'Save My Farm'}
        </button>

        {existing && (
          <button
            type="button"
            onClick={handleClear}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#e5b5a5] text-sm font-bold text-[#9c4936]"
          >
            <Trash2 size={16} /> Delete My Farm
          </button>
        )}
      </div>
    </div>
  );
                }
