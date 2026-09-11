export type Status = 'Low' | 'Medium' | 'High';
export type CropKey = 'cotton' | 'groundnut' | 'wheat' | 'bajra' | 'cumin';

export const CROPS: { value: CropKey; label: string }[] = [
  { value: 'cotton', label: 'Cotton' },
  { value: 'groundnut', label: 'Groundnut' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'bajra', label: 'Bajra' },
  { value: 'cumin', label: 'Cumin' },
];

// Standard nutrient requirement in kg/acre (as pure N, P2O5, K2O — not product weight).
const CROP_NPK: Record<CropKey, { n: number; p: number; k: number }> = {
  cotton: { n: 60, p: 30, k: 30 },
  groundnut: { n: 25, p: 50, k: 30 },
  wheat: { n: 50, p: 25, k: 20 },
  bajra: { n: 40, p: 20, k: 15 },
  cumin: { n: 20, p: 15, k: 10 },
};

// How much of the standard dose to apply, based on what the soil test already shows.
// Low → apply the full recommended dose. Medium → apply about half (topping up).
// High → only a small maintenance dose, since the nutrient is already sufficient.
const ADJUSTMENT: Record<Status, number> = {
  Low: 1,
  Medium: 0.5,
  High: 0.15,
};

// Nutrient content of common fertilizer products, used to convert pure
// nutrient kg into product kg a farmer would actually buy and apply.
const UREA_N_CONTENT = 0.46; // Urea is ~46% nitrogen
const DAP_P_CONTENT = 0.46; // DAP is ~46% P2O5
const MOP_K_CONTENT = 0.6; // MOP (Muriate of Potash) is ~60% K2O

export type FertilizerResult = {
  urea: number;
  dap: number;
  mop: number;
};

export function calculateFertilizer(
  crop: CropKey,
  areaAcres: number,
  nitrogenStatus: Status,
  phosphorusStatus: Status,
  potassiumStatus: Status,
): FertilizerResult {
  const base = CROP_NPK[crop];
  const area = Number.isFinite(areaAcres) && areaAcres > 0 ? areaAcres : 1;

  const requiredN = base.n * area * ADJUSTMENT[nitrogenStatus];
  const requiredP = base.p * area * ADJUSTMENT[phosphorusStatus];
  const requiredK = base.k * area * ADJUSTMENT[potassiumStatus];

  return {
    urea: Math.round(requiredN / UREA_N_CONTENT),
    dap: Math.round(requiredP / DAP_P_CONTENT),
    mop: Math.round(requiredK / MOP_K_CONTENT),
  };
}
