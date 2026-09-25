import type { FarmProfile } from './farm-storage';

export function getCropAge(sowingDate: string): number {
  const sown = new Date(sowingDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - sown.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

const STAGES: Record<string, { day: number; key: string }[]> = {
  cotton: [
    { day: 0, key: 'taskSowing' },
    { day: 20, key: 'taskFirstIrrigation' },
    { day: 30, key: 'taskUrea50' },
    { day: 60, key: 'taskPestCheck' },
    { day: 90, key: 'taskSecondUrea' },
    { day: 150, key: 'taskHarvestPrep' },
  ],
  groundnut: [
    { day: 0, key: 'taskSowing' },
    { day: 25, key: 'taskGypsum' },
    { day: 45, key: 'taskWeeding' },
    { day: 90, key: 'taskHarvestPrep' },
  ],
  wheat: [
    { day: 0, key: 'taskSowing' },
    { day: 25, key: 'taskFirstIrrigation' },
    { day: 45, key: 'taskUrea40' },
    { day: 80, key: 'taskSecondUrea' },
    { day: 120, key: 'taskHarvestPrep' },
  ],
  bajra: [
    { day: 0, key: 'taskSowing' },
    { day: 25, key: 'taskUrea30' },
    { day: 60, key: 'taskHarvestPrep' },
  ],
  cumin: [
    { day: 0, key: 'taskSowing' },
    { day: 30, key: 'taskFirstIrrigation' },
    { day: 60, key: 'taskPestCheck' },
  ],
};

export type TaskInfo = {
  currentKey: string;
  nextKey: string | null;
  nextDay: number | null;
};

export function getCropTask(crop: string, ageDays: number): TaskInfo {
  const stages = STAGES[crop] || STAGES.cotton;
  let current = stages[0];

  for (const stage of stages) {
    if (ageDays >= stage.day) current = stage;
    else break;
  }

  const next = stages.find((s) => s.day > ageDays);

  return {
    currentKey: current.key,
    nextKey: next?.key ?? null,
    nextDay: next?.day ?? null,
  };
}

export type IrrigationAdviceKey = 'rainTomorrow' | 'irrigationToday' | 'irrigationTomorrow';

export function getIrrigationAdviceKey(
  rainTomorrow: number,
  cropAge: number,
): IrrigationAdviceKey {
  if (rainTomorrow > 5) return 'rainTomorrow';
  if (cropAge > 0 && cropAge % 7 === 0) return 'irrigationToday';
  return 'irrigationTomorrow';
}

export function getEstimatedRevenue(
  crop: string,
  acres: number,
  mandiPrice: number,
): number {
  const yields: Record<string, number> = {
    cotton: 8,
    groundnut: 10,
    wheat: 20,
    bajra: 12,
    cumin: 3,
  };
  const yieldPerAcre = yields[crop] || 8;
  const totalQuintal = yieldPerAcre * acres;
  return Math.round(totalQuintal * mandiPrice);
}

// Approximate cost per acre (seeds + fertilizer + labour + pesticide)
const COST_PER_ACRE: Record<string, number> = {
  cotton: 12000,
  groundnut: 10000,
  wheat: 8000,
  bajra: 6000,
  cumin: 15000,
};

export function getEstimatedProfit(
  crop: string,
  acres: number,
  mandiPrice: number,
): number {
  const revenue = getEstimatedRevenue(crop, acres, mandiPrice);
  const cost = (COST_PER_ACRE[crop] || 10000) * acres;
  return Math.max(0, revenue - cost);
    }
