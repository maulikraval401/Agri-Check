export type Status = 'Low' | 'Medium' | 'High';
export type CropKey = 'cotton' | 'groundnut' | 'wheat' | 'bajra' | 'cumin';
export type WarningLang = 'en' | 'gu' | 'hi' | 'mr' | 'pa' | 'ta';

export const CROPS: { value: CropKey; label: string }[] = [
  { value: 'cotton', label: 'Cotton' },
  { value: 'groundnut', label: 'Groundnut' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'bajra', label: 'Bajra' },
  { value: 'cumin', label: 'Cumin' },
];

// Standard nutrient requirement in kg/acre (as pure N, P2O5, K2O).
// TODO: Verify every crop with SDAU/KVK (per acre vs per hectare, irrigated vs rainfed,
// hybrid vs variety). Groundnut looks too high if these are really per-hectare values.
const CROP_NPK: Record<CropKey, { n: number; p: number; k: number }> = {
  cotton: { n: 60, p: 30, k: 30 },
  groundnut: { n: 25, p: 50, k: 30 },
  wheat: { n: 50, p: 25, k: 20 },
  bajra: { n: 40, p: 20, k: 15 },
  cumin: { n: 20, p: 15, k: 10 },
};

// Set a crop to true ONLY after its dose has been confirmed with SDAU/KVK.
// The UI can use this to show "dose not verified yet" for crops that are still false.
export const RDF_VERIFIED: Record<CropKey, boolean> = {
  cotton: false,
  groundnut: false,
  wheat: false,
  bajra: false,
  cumin: false,
};

// Adjustment factors by soil test result:
// Low -> 1.25 (25% more), Medium -> 1.0 (full dose), High -> 0.75 (25% less).
// TODO: Confirm these percentages with SDAU/KVK.
const ADJUSTMENT: Record<Status, number> = {
  Low: 1.25,
  Medium: 1.0,
  High: 0.75,
};

// Fertilizer contents
const UREA_N_CONTENT = 0.46;
const DAP_N_CONTENT = 0.18; // DAP is 18-46-0
const DAP_P_CONTENT = 0.46;
const MOP_K_CONTENT = 0.6;

// Default prices (₹/kg). The farmer can change these to the local shop rate.
// Urea is government-fixed; DAP and MOP prices vary, so treat these as estimates.
export const DEFAULT_PRICES = {
  urea: 6,
  dap: 27,
  mop: 34,
};

export type FertilizerWarning = 'dap_excess_n' | 'invalid_area';

export type FertilizerResult = {
  urea: number;
  dap: number;
  mop: number;
  totalCost: number;
  /** Extra nitrogen (kg) that DAP gives beyond the crop's N need. 0 if none. */
  extraNFromDap: number;
  /** Machine-readable code. Show the text with getWarningText(code, language). */
  warning?: FertilizerWarning;
};

const WARNING_TEXT: Record<FertilizerWarning, Record<WarningLang, string>> = {
  dap_excess_n: {
    en: 'DAP alone gives more nitrogen than needed, so urea is not required. Ask your KVK about using SSP for phosphorus instead of DAP.',
    gu: 'DAP માંથી જ જરૂર કરતાં વધુ નાઇટ્રોજન મળી રહ્યો છે, તેથી યુરિયાની જરૂર નથી. ફોસ્ફરસ માટે DAP ને બદલે SSP વાપરવા અંગે તમારા KVK ની સલાહ લો.',
    hi: 'DAP से ही ज़रूरत से ज़्यादा नाइट्रोजन मिल रहा है, इसलिए यूरिया की ज़रूरत नहीं है। फॉस्फोरस के लिए DAP की जगह SSP इस्तेमाल करने के बारे में अपने KVK से सलाह लें।',
    mr: 'DAP मधूनच गरजेपेक्षा जास्त नायट्रोजन मिळत आहे, त्यामुळे युरियाची गरज नाही. फॉस्फरससाठी DAP ऐवजी SSP वापरण्याबाबत तुमच्या KVK चा सल्ला घ्या.',
    pa: 'DAP ਤੋਂ ਹੀ ਲੋੜ ਨਾਲੋਂ ਵੱਧ ਨਾਈਟ੍ਰੋਜਨ ਮਿਲ ਰਹੀ ਹੈ, ਇਸ ਲਈ ਯੂਰੀਆ ਦੀ ਲੋੜ ਨਹੀਂ। ਫਾਸਫੋਰਸ ਲਈ DAP ਦੀ ਥਾਂ SSP ਵਰਤਣ ਬਾਰੇ ਆਪਣੇ KVK ਤੋਂ ਸਲਾਹ ਲਓ।',
    ta: 'DAP-இலிருந்தே தேவைக்கு அதிகமாக நைட்ரஜன் கிடைக்கிறது, எனவே யூரியா தேவையில்லை. பாஸ்பரஸுக்கு DAP-க்குப் பதிலாக SSP பயன்படுத்துவது குறித்து உங்கள் KVK-யிடம் ஆலோசனை பெறுங்கள்.',
  },
  invalid_area: {
    en: 'Please enter a valid area (acres).',
    gu: 'કૃપા કરીને યોગ્ય વિસ્તાર (એકર) દાખલ કરો.',
    hi: 'कृपया सही क्षेत्रफल (एकड़) दर्ज करें।',
    mr: 'कृपया योग्य क्षेत्र (एकर) टाका.',
    pa: 'ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਰਕਬਾ (ਏਕੜ) ਦਰਜ ਕਰੋ।',
    ta: 'சரியான பரப்பளவை (ஏக்கர்) உள்ளிடவும்.',
  },
};

export function getWarningText(code: FertilizerWarning, language: string): string {
  const lang = (['en', 'gu', 'hi', 'mr', 'pa', 'ta'] as const).includes(language as WarningLang)
    ? (language as WarningLang)
    : 'en';
  return WARNING_TEXT[code][lang];
}

// Practical rounding: small amounts to the nearest 1 kg (never 0 if something is needed),
// larger amounts to the nearest 5 kg.
function roundKg(kg: number): number {
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  if (kg < 25) return Math.max(1, Math.round(kg));
  return Math.round(kg / 5) * 5;
}

export function calculateFertilizer(
  crop: CropKey,
  areaAcres: number,
  nitrogenStatus: Status,
  phosphorusStatus: Status,
  potassiumStatus: Status,
  prices = DEFAULT_PRICES,
): FertilizerResult {
  // Do not silently assume 1 acre. A bad area gives an empty result with a warning.
  if (!Number.isFinite(areaAcres) || areaAcres <= 0 || areaAcres > 1000) {
    return { urea: 0, dap: 0, mop: 0, totalCost: 0, extraNFromDap: 0, warning: 'invalid_area' };
  }

  const base = CROP_NPK[crop];

  // 1. Pure nutrient requirement (kg), adjusted for the soil test result
  const requiredN = base.n * areaAcres * ADJUSTMENT[nitrogenStatus];
  const requiredP = base.p * areaAcres * ADJUSTMENT[phosphorusStatus];
  const requiredK = base.k * areaAcres * ADJUSTMENT[potassiumStatus];

  // 2. DAP first (it also supplies nitrogen). Round it, then use the rounded amount
  //    so the nitrogen credit matches what the farmer will really apply.
  const finalDap = roundKg(requiredP / DAP_P_CONTENT);
  const nitrogenFromDap = finalDap * DAP_N_CONTENT;

  // 3. Remaining nitrogen to be supplied by urea
  const remainingN = requiredN - nitrogenFromDap;

  let warning: FertilizerWarning | undefined;
  let extraNFromDap = 0;
  let finalUrea = 0;

  if (remainingN < 0) {
    // DAP already gives more nitrogen than the crop needs
    extraNFromDap = Math.round(-remainingN * 10) / 10;
    if (extraNFromDap >= 1) warning = 'dap_excess_n';
  } else {
    finalUrea = roundKg(remainingN / UREA_N_CONTENT);
  }

  // 4. MOP
  const finalMop = roundKg(requiredK / MOP_K_CONTENT);

  // 5. Estimated cost, from the amounts the farmer will actually buy
  const totalCost = Math.round(
    finalUrea * prices.urea + finalDap * prices.dap + finalMop * prices.mop,
  );

  return {
    urea: finalUrea,
    dap: finalDap,
    mop: finalMop,
    totalCost,
    extraNFromDap,
    warning,
  };
}
