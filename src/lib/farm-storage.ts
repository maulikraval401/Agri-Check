const FARM_KEY = 'agri-check-farm-profile';

export type IrrigationType = 'drip' | 'flood' | 'rainfed' | 'sprinkler';
export type SoilType = 'black' | 'red' | 'sandy' | 'loamy' | 'clay';

export type FarmProfile = {
  name: string;
  village: string;
  crops: string[];
  landArea: number;
  irrigation: IrrigationType;
  soilType: SoilType;
  sowingDate: string;
  createdAt: string;
};

export function readFarm(): FarmProfile | null {
  try {
    const raw = localStorage.getItem(FARM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FarmProfile;
    return parsed && parsed.name ? parsed : null;
  } catch {
    return null;
  }
}

export function writeFarm(profile: FarmProfile): boolean {
  try {
    localStorage.setItem(FARM_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function clearFarm(): void {
  try {
    localStorage.removeItem(FARM_KEY);
  } catch {
    // silent
  }
}

export const IRRIGATION_OPTIONS: { value: IrrigationType; label: string }[] = [
  { value: 'drip', label: 'Drip (ટપક)' },
  { value: 'flood', label: 'Flood (પૂર)' },
  { value: 'rainfed', label: 'Rainfed (વરસાદ)' },
  { value: 'sprinkler', label: 'Sprinkler (ફુવારા)' },
];

export const SOIL_OPTIONS: { value: SoilType; label: string }[] = [
  { value: 'black', label: 'Black (કાળી)' },
  { value: 'red', label: 'Red (લાલ)' },
  { value: 'sandy', label: 'Sandy (રેતાળ)' },
  { value: 'loamy', label: 'Loamy (ગોરાડુ)' },
  { value: 'clay', label: 'Clay (ચીકણી)' },
];

// --- NAYE CROPS ADD KIYE HAIN ---
export const CROP_OPTIONS = [
  { value: 'cotton', label: 'Cotton (કપાસ)', emoji: '🌿' },
  { value: 'groundnut', label: 'Groundnut (મગફળી)', emoji: '🥜' },
  { value: 'wheat', label: 'Wheat (ઘઉં)', emoji: '🌾' },
  { value: 'bajra', label: 'Bajra (બાજરી)', emoji: '🌾' },
  { value: 'cumin', label: 'Cumin (જીરું)', emoji: '🌱' },
  { value: 'mustard', label: 'Mustard (રાઈ)', emoji: '🌼' },
  { value: 'sesame', label: 'Sesame (તલ)', emoji: '⚪' },
  { value: 'sugarcane', label: 'Sugarcane (શેરડી)', emoji: '🎋' },
  { value: 'moong', label: 'Moong (મગ)', emoji: '🫘' },
  { value: 'urad', label: 'Urad (અદદ)', emoji: '🫘' },
  { value: 'rice', label: 'Rice (ચોખા)', emoji: '🌾' },
  { value: 'onion', label: 'Onion (ડુંગળી)', emoji: '🧅' },
  { value: 'potato', label: 'Potato (બટાકા)', emoji: '🥔' },
  { value: 'tomato', label: 'Tomato (ટામેટા)', emoji: '🍅' },
  { value: 'chilli', label: 'Chilli (મરચું)', emoji: '🌶️' },
];
