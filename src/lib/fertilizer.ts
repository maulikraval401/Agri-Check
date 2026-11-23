// =====================================================================
// Agri Check - fertilizer recommendation logic
//
// IMPORTANT SAFETY RULES
// - All RDF values below are kg/ha of N, P2O5 and K2O.
// - A dose is stored per crop + zone + season. Never copy a dose from another zone.
// - Every record has a `status`. Only VERIFIED_OFFICIAL / CONTEXT_SPECIFIC records are
//   "farmer ready". Records marked NEEDS_SOURCE_RECHECK still have to be matched with the
//   original SDAU page (open the URL, search for the quote, then change the status and
//   fill `verifiedOn`).
// - Do not invent doses. If a crop/season has no verified source, leave it out (the
//   calculator then shows "dose not available").
// =====================================================================

export type Status = 'Low' | 'Medium' | 'High';
export type CropKey = 'cotton' | 'groundnut' | 'wheat' | 'bajra' | 'cumin';
export type Season = 'kharif' | 'rabi' | 'summer';
export type Zone = 'sdau_north_gujarat';
export type ConfidenceStatus =
  | 'VERIFIED_OFFICIAL'
  | 'NEEDS_SOURCE_RECHECK'
  | 'CONTEXT_SPECIFIC'
  | 'NOT_FOUND';
export type WarningLang = 'en' | 'gu' | 'hi' | 'mr' | 'pa' | 'ta';

export const CROPS: { value: CropKey; label: string }[] = [
  { value: 'cotton', label: 'Cotton' },
  { value: 'groundnut', label: 'Groundnut' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'bajra', label: 'Bajra' },
  { value: 'cumin', label: 'Cumin' },
];

// ---------------------------------------------------------------------
// Switches (change here, not all over the code)
// ---------------------------------------------------------------------

// Pilot mode: if true, records that are not yet verified are still calculated, but the
// result is marked farmerReady = false so the UI must show the "being verified" notice.
// Set to false to hide every unverified dose (the app then says "dose not available").
export const SHOW_UNVERIFIED_DOSES = true;

// Low / Medium / High soil adjustment. These percentages are common practice but have not
// been confirmed by SDAU yet. Set to false to always use the plain RDF (factor 1.0).
export const APPLY_SOIL_ADJUSTMENT = true;

export const DEFAULT_ZONE: Zone = 'sdau_north_gujarat';

// ---------------------------------------------------------------------
// RDF records (kg/ha)
// ---------------------------------------------------------------------

export interface RdfRecord {
  id: string;
  crop: CropKey;
  zone: Zone;
  season: Season;
  /** kg N per hectare */
  n: number;
  /** kg P2O5 per hectare (check the source: some pages only say "P") */
  p: number;
  /** kg K2O per hectare */
  k: number;
  status: ConfidenceStatus;
  sourceUrl: string;
  sourceTitle: string;
  /** Quote as reported in the research pack. Match it on the original page before verifying. */
  quote: string;
  /** ISO date (YYYY-MM-DD) when a person matched the quote on the original page. */
  verifiedOn: string | null;
  notes: string;
}

export const RDF_RECORDS: RdfRecord[] = [
  {
    id: 'wheat-rabi-ng',
    crop: 'wheat',
    zone: 'sdau_north_gujarat',
    season: 'rabi',
    n: 120,
    p: 60,
    k: 0,
    status: 'NEEDS_SOURCE_RECHECK',
    sourceUrl: 'https://sdau.edu.in/technologies-develop/76/2',
    sourceTitle: 'SDAU - Technologies Developed; North Gujarat (AES IV), pearl millet-wheat sequence',
    quote: '75 % recommended dose of NPK to wheat (RDF:120-60-00 NPK)',
    verifiedOn: null,
    notes:
      '100% RDF reference is 120-60-0. Second source: GW-11 under restricted irrigation, "recommended dose of fertilizers (120-60-0 kg N-P2O5-K2O/ha)" (10th Joint AGRESCO 2013-14, PDF p.29, 10.2.4.9). K = 0 in SDAU; JAU (Saurashtra) uses K 60, so do not mix zones. Confirm Patan taluka -> SDAU zone with KVK Patan.',
  },
  {
    id: 'bajra-kharif-ng',
    crop: 'bajra',
    zone: 'sdau_north_gujarat',
    season: 'kharif',
    n: 80,
    p: 40,
    k: 0,
    status: 'NEEDS_SOURCE_RECHECK',
    sourceUrl: 'https://sdau.edu.in/technologies-develop/76/2',
    sourceTitle: 'SDAU - Technologies Developed; North Gujarat (AES IV), pearl millet-wheat sequence',
    quote: '75 % recommended dose of NPK through fertilizer (RDF:80-40-00 NPK)',
    verifiedOn: null,
    notes:
      '100% RDF reference is 80-40-0. The source recommendation is an INM treatment (75% chemical + 25% N from gliricidia). Confirm with SDAU that 80-40-0 can be used as the chemical-only RDF.',
  },
  {
    id: 'cumin-rabi-ng',
    crop: 'cumin',
    zone: 'sdau_north_gujarat',
    season: 'rabi',
    n: 30,
    p: 15,
    k: 0,
    status: 'NEEDS_SOURCE_RECHECK',
    sourceUrl: 'https://sdau.edu.in/technologies-develop/84/2',
    sourceTitle: 'SDAU - Technologies Developed; Crop production, Fertilizer / INM, Cumin',
    quote: 'recommended dose of fertilizer (30 + 15 kg NP/ha)',
    verifiedOn: null,
    notes:
      'Check on the page whether P is elemental P or P2O5, and irrigated/rainfed. The Fe/Zn-enriched FYM (1 t FYM + 1.5 kg Fe + 0.75 kg Zn/ha, GC-4) is ONLY for light soils deficient in Fe and Zn - do not add it for everyone. Do not use the 8-10 DAS split (AAU trial, other zone).',
  },
  {
    id: 'groundnut-kharif-ng',
    crop: 'groundnut',
    zone: 'sdau_north_gujarat',
    season: 'kharif',
    n: 12.5,
    p: 25,
    k: 0,
    status: 'NEEDS_SOURCE_RECHECK',
    sourceUrl: 'https://sdau.edu.in/technologies-develop/73/2',
    sourceTitle: 'SDAU - Organic and Natural Farming; groundnut (12.5 kg N/ha)',
    quote: '12.5 kg N/ha through castor cake 15 days before sowing to kharif groundnut',
    verifiedOn: null,
    notes:
      'N 12.5 is from SDAU. P 25 and K are from an expert (J. M., Gujarat kharif RDF 12.5-25-50) and from JAU, not from SDAU. K CONFLICT: SDAU groundnut sequence says RDF 25-50-00 (K = 0) while the expert/JAU say K 50. K set to 0 here; confirm with SDAU/KVK. Standalone chemical RDF for North Gujarat: NOT FOUND in checked sources.',
  },
  {
    id: 'groundnut-summer-ng',
    crop: 'groundnut',
    zone: 'sdau_north_gujarat',
    season: 'summer',
    n: 25,
    p: 50,
    k: 0,
    status: 'NEEDS_SOURCE_RECHECK',
    sourceUrl: 'https://sdau.edu.in/technologies-develop/76/2',
    sourceTitle: 'SDAU - Technologies Developed; North Gujarat (AES IV), sunnhemp-potato-groundnut sequence',
    quote: 'groundnut (RDF 25-50-00 NPK kg/ha) as 50 % RDF + 50 % RDN from FYM',
    verifiedOn: null,
    notes:
      'Reported RDF 25-50-00 inside an integrated sequence (not standalone). The expert and JAU give 25-50-50 for summer (K 50). K set to 0 following SDAU; confirm. Gypsum is a separate recommendation: SDAU says "Sulphur @ 20 kg/ha through gypsum" (20 kg S/ha, NOT 20 kg gypsum); the expert gave gypsum 500 kg/ha - keep them separate and ask for timing.',
  },
];

// Crops/seasons that exist in the app but have NO verified dose yet (shown as "not available").
export const RDF_NOT_AVAILABLE: { crop: CropKey; season: Season | 'any'; reason: string }[] = [
  {
    crop: 'cotton',
    season: 'any',
    reason:
      'North Gujarat cotton dose depends on variety (reported 80 to 320 kg N/ha for DH-9, Hy-8/Hy-10, GTHH-49 BGII). Need the official page and one variety-wise table.',
  },
  {
    crop: 'bajra',
    season: 'summer',
    reason:
      'Only a sprinkler-specific trial found (120 kg N/ha, P 40 kg/ha, 10 t FYM; P form and K not stated). Google summary says 120-60-0. Not enough to publish.',
  },
];

// ---------------------------------------------------------------------
// Seasons
// ---------------------------------------------------------------------

export function availableSeasons(crop: CropKey, zone: Zone = DEFAULT_ZONE): Season[] {
  const found = RDF_RECORDS.filter((r) => r.crop === crop && r.zone === zone).map((r) => r.season);
  return Array.from(new Set(found));
}

// Month (1-12) centre of each season in Gujarat, used to pick a sensible default.
const SEASON_CENTRE_MONTH: Record<Season, number> = { kharif: 7, rabi: 12, summer: 2 };

function monthDistance(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 12 - d);
}

/** Season to preselect for a crop, based on today's month. The farmer can always change it. */
export function defaultSeason(
  crop: CropKey,
  date: Date = new Date(),
  zone: Zone = DEFAULT_ZONE,
): Season | null {
  const seasons = availableSeasons(crop, zone);
  if (seasons.length === 0) return null;
  const month = date.getMonth() + 1;
  return seasons.reduce((best, s) =>
    monthDistance(month, SEASON_CENTRE_MONTH[s]) < monthDistance(month, SEASON_CENTRE_MONTH[best])
      ? s
      : best,
  );
}

const SEASON_LABELS: Record<Season, Record<WarningLang, string>> = {
  kharif: { en: 'Kharif', gu: 'ખરીફ', hi: 'खरीफ', mr: 'खरीफ', pa: 'ਸਾਉਣੀ', ta: 'காரிஃப்' },
  rabi: { en: 'Rabi', gu: 'રવિ', hi: 'रबी', mr: 'रब्बी', pa: 'ਹਾੜ੍ਹੀ', ta: 'ரபி' },
  summer: { en: 'Summer', gu: 'ઉનાળુ', hi: 'गर्मी', mr: 'उन्हाळी', pa: 'ਗਰਮੀ', ta: 'கோடை' },
};

export function getSeasonLabel(season: Season, language: string): string {
  return SEASON_LABELS[season][toLang(language)];
}

export function getRdfRecord(
  crop: CropKey,
  season: Season,
  zone: Zone = DEFAULT_ZONE,
): RdfRecord | null {
  return RDF_RECORDS.find((r) => r.crop === crop && r.season === season && r.zone === zone) ?? null;
}

export function isFarmerReady(rec: RdfRecord): boolean {
  return rec.status === 'VERIFIED_OFFICIAL' || rec.status === 'CONTEXT_SPECIFIC';
}

// ---------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------

export const ACRE_TO_HECTARE = 0.404686;

// Soil-test adjustment (see APPLY_SOIL_ADJUSTMENT)
// Low -> 25% more, Medium -> full dose, High -> 25% less.
// TODO: confirm these percentages with SDAU/KVK, separately for N, P and K.
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

// ---------------------------------------------------------------------
// Messages (6 languages)
// ---------------------------------------------------------------------

export type FertilizerWarning = 'dap_excess_n' | 'invalid_area' | 'no_rdf';
export type FertilizerNotice = 'rdf_unverified';

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
  no_rdf: {
    en: 'A verified dose for this crop and season is not available yet. Please ask your KVK.',
    gu: 'આ પાક અને સીઝન માટે ચકાસાયેલી માત્રા હજી ઉપલબ્ધ નથી. કૃપા કરીને તમારા KVK ને પૂછો.',
    hi: 'इस फसल और मौसम के लिए सत्यापित मात्रा अभी उपलब्ध नहीं है। कृपया अपने KVK से पूछें।',
    mr: 'या पिकासाठी आणि हंगामासाठी पडताळलेली मात्रा अजून उपलब्ध नाही. कृपया तुमच्या KVK ला विचारा.',
    pa: 'ਇਸ ਫ਼ਸਲ ਅਤੇ ਮੌਸਮ ਲਈ ਪੜਤਾਲੀ ਮਾਤਰਾ ਅਜੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ KVK ਤੋਂ ਪੁੱਛੋ।',
    ta: 'இந்த பயிர் மற்றும் பருவத்திற்கான சரிபார்க்கப்பட்ட அளவு இன்னும் கிடைக்கவில்லை. உங்கள் KVK-யிடம் கேளுங்கள்.',
  },
};

const NOTICE_TEXT: Record<FertilizerNotice, Record<WarningLang, string>> = {
  rdf_unverified: {
    en: 'This dose is taken from SDAU (North Gujarat) sources and is still being verified. Confirm with your KVK before applying fertilizer.',
    gu: 'આ માત્રા SDAU (ઉત્તર ગુજરાત) ના સ્રોતમાંથી લેવામાં આવી છે અને હજી ચકાસણી હેઠળ છે. ખાતર આપતા પહેલા તમારા KVK પાસે ખાતરી કરો.',
    hi: 'यह मात्रा SDAU (उत्तर गुजरात) के स्रोत से ली गई है और अभी सत्यापन में है। खाद डालने से पहले अपने KVK से पुष्टि करें।',
    mr: 'ही मात्रा SDAU (उत्तर गुजरात) च्या स्रोतावरून घेतली आहे आणि अजून पडताळणी सुरू आहे. खत देण्यापूर्वी तुमच्या KVK कडून खात्री करा.',
    pa: 'ਇਹ ਮਾਤਰਾ SDAU (ਉੱਤਰੀ ਗੁਜਰਾਤ) ਦੇ ਸਰੋਤ ਤੋਂ ਲਈ ਗਈ ਹੈ ਅਤੇ ਅਜੇ ਪੜਤਾਲ ਅਧੀਨ ਹੈ। ਖਾਦ ਪਾਉਣ ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ KVK ਤੋਂ ਪੁਸ਼ਟੀ ਕਰੋ।',
    ta: 'இந்த அளவு SDAU (வட குஜராத்) மூலத்திலிருந்து எடுக்கப்பட்டது; இன்னும் சரிபார்க்கப்பட்டு வருகிறது. உரம் இடும் முன் உங்கள் KVK-யிடம் உறுதிசெய்யுங்கள்.',
  },
};

function toLang(language: string): WarningLang {
  return (['en', 'gu', 'hi', 'mr', 'pa', 'ta'] as const).includes(language as WarningLang)
    ? (language as WarningLang)
    : 'en';
}

export function getWarningText(code: FertilizerWarning, language: string): string {
  return WARNING_TEXT[code][toLang(language)];
}

export function getNoticeText(code: FertilizerNotice, language: string): string {
  return NOTICE_TEXT[code][toLang(language)];
}

// ---------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------

export type FertilizerResult = {
  urea: number;
  dap: number;
  mop: number;
  totalCost: number;
  /** Extra nitrogen (kg) that DAP gives beyond the crop's N need. 0 if none. */
  extraNFromDap: number;
  /** Machine-readable code. Show the text with getWarningText(code, language). */
  warning?: FertilizerWarning;
  /** 'rdf_unverified' when the dose is not farmer-ready. Show getNoticeText(...). */
  notice?: FertilizerNotice;
  /** false when the dose has not been verified against the original source yet. */
  farmerReady: boolean;
  /** The RDF (kg/ha) and record used, so the UI can show season, zone and source. */
  rdf?: { n: number; p: number; k: number; season: Season; zone: Zone; recordId: string; sourceUrl: string; status: ConfidenceStatus };
};

const EMPTY: Omit<FertilizerResult, 'warning'> = {
  urea: 0,
  dap: 0,
  mop: 0,
  totalCost: 0,
  extraNFromDap: 0,
  farmerReady: false,
};

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
  options: { season?: Season; zone?: Zone; date?: Date } = {},
): FertilizerResult {
  // Do not silently assume 1 acre. A bad area gives an empty result with a warning.
  if (!Number.isFinite(areaAcres) || areaAcres <= 0 || areaAcres > 1000) {
    return { ...EMPTY, warning: 'invalid_area' };
  }

  const zone = options.zone ?? DEFAULT_ZONE;
  const season = options.season ?? defaultSeason(crop, options.date ?? new Date(), zone);
  const rec = season ? getRdfRecord(crop, season, zone) : null;

  // No dose for this crop/season/zone: never fall back to another zone or season.
  if (!rec || (!isFarmerReady(rec) && !SHOW_UNVERIFIED_DOSES)) {
    return { ...EMPTY, warning: 'no_rdf' };
  }

  const hectares = areaAcres * ACRE_TO_HECTARE;
  const factor = (s: Status) => (APPLY_SOIL_ADJUSTMENT ? ADJUSTMENT[s] : 1);

  // 1. Pure nutrient requirement (kg), adjusted for the soil test result
  const requiredN = rec.n * hectares * factor(nitrogenStatus);
  const requiredP = rec.p * hectares * factor(phosphorusStatus);
  const requiredK = rec.k * hectares * factor(potassiumStatus);

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

  // 4. MOP (0 when the verified K2O dose is 0)
  const finalMop = roundKg(requiredK / MOP_K_CONTENT);

  // 5. Estimated cost, from the amounts the farmer will actually buy
  const totalCost = Math.round(
    finalUrea * prices.urea + finalDap * prices.dap + finalMop * prices.mop,
  );

  const farmerReady = isFarmerReady(rec);

  return {
    urea: finalUrea,
    dap: finalDap,
    mop: finalMop,
    totalCost,
    extraNFromDap,
    warning,
    notice: farmerReady ? undefined : 'rdf_unverified',
    farmerReady,
    rdf: {
      n: rec.n,
      p: rec.p,
      k: rec.k,
      season: rec.season,
      zone: rec.zone,
      recordId: rec.id,
      sourceUrl: rec.sourceUrl,
      status: rec.status,
    },
  };
}
