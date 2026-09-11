import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import cropsData from '@/data/crops.json';

type CropKey = keyof typeof cropsData;

export default function CalendarPage() {
  const { copy, language } = useLanguage();
  const [selected, setSelected] = useState<CropKey>('cotton');
  const crop = cropsData[selected];

  const cropName =
    language === 'gu' ? crop.nameGu : language === 'hi' ? crop.nameHi : crop.name;

  return (
    <div className="page-enter">
      <p className="eyebrow">03 / crop calendar</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">{copy.calendar}</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(cropsData) as CropKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            className={`min-h-11 rounded-xl px-4 text-sm font-bold ${
              selected === k
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'border border-[hsl(var(--border))]'
            }`}
          >
            {cropsData[k].name}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-2xl font-bold">{cropName}</h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {crop.sowing} → {crop.harvest} · {crop.duration} days
        </p>

        <div className="mt-5 space-y-3">
          {crop.schedule.map((item) => {
            const task =
              language === 'gu'
                ? item.taskGu
                : language === 'hi'
                  ? item.taskHi
                  : item.task;
            return (
              <div
                key={item.day}
                className="flex items-center gap-4 rounded-xl bg-[hsl(var(--muted)/.55)] p-3"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
                  {item.day}d
                </span>
                <p className="text-sm font-semibold">{task}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
      }
