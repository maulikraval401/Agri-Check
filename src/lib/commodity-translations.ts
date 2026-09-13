import type { Language } from '@/i18n/translations';

type TranslationMap = Record<string, { en: string; gu: string; hi: string }>;

const TRANSLATIONS: TranslationMap = {
  'cotton': { en: 'Cotton', gu: 'કપાસ', hi: 'कपास' },
  'groundnut': { en: 'Groundnut', gu: 'મગફળી', hi: 'मूंगफली' },
  'wheat': { en: 'Wheat', gu: 'ઘઉં', hi: 'गेहूँ' },
  'bajra': { en: 'Bajra', gu: 'બાજરી', hi: 'बाजरा' },
  'cumin': { en: 'Cumin', gu: 'જીરું', hi: 'जीरा' },
  'castor': { en: 'Castor', gu: 'એરંડા', hi: 'अरंडी' },
  'sesamum': { en: 'Sesamum', gu: 'તલ', hi: 'तिल' },
  'mustard': { en: 'Mustard', gu: 'રાઈ', hi: 'सरसों' },
  'bengal gram': { en: 'Bengal Gram', gu: 'ચણા', hi: 'चना' },
  'soyabean': { en: 'Soyabean', gu: 'સોયાબીન', hi: 'सोयाबीन' },
  'paddy': { en: 'Paddy', gu: 'ડાંગર', hi: 'धान' },
  'maize': { en: 'Maize', gu: 'મકાઈ', hi: 'मक्का' },
  'jowar': { en: 'Jowar', gu: 'જુવાર', hi: 'ज्वार' },
  'tur': { en: 'Tur', gu: 'તુવેર', hi: 'अरहर' },
  'moong': { en: 'Moong', gu: 'મગ', hi: 'मूंग' },
  'urad': { en: 'Urad', gu: 'અડદ', hi: 'उड़द' },
  'gram': { en: 'Gram', gu: 'ચણા', hi: 'चना' },
  'rapeseed': { en: 'Rapeseed', gu: 'રાઈ', hi: 'सरसों' },
  'tomato': { en: 'Tomato', gu: 'ટામેટા', hi: 'टमाटर' },
  'potato': { en: 'Potato', gu: 'બટાકા', hi: 'आलू' },
  'onion': { en: 'Onion', gu: 'ડુંગળી', hi: 'प्याज' },
  'cabbage': { en: 'Cabbage', gu: 'કોબી', hi: 'पत्तागोभी' },
  'cauliflower': { en: 'Cauliflower', gu: 'ફુલાવર', hi: 'फूलगोभी' },
  'brinjal': { en: 'Brinjal', gu: 'રીંગણ', hi: 'बैंगन' },
  'bhindi': { en: 'Bhindi', gu: 'ભીંડા', hi: 'भिंडी' },
  'ladies finger': { en: 'Bhindi', gu: 'ભીંડા', hi: 'भिंडी' },
  'cucumber': { en: 'Cucumber', gu: 'કાકડી', hi: 'खीरा' },
  'kheera': { en: 'Cucumber', gu: 'કાકડી', hi: 'खीरा' },
  'green chilli': { en: 'Green Chilli', gu: 'લીલા મરચા', hi: 'हरी मिर्च' },
  'capsicum': { en: 'Capsicum', gu: 'શિમલા મરચા', hi: 'शिमला मिर्च' },
  'carrot': { en: 'Carrot', gu: 'ગાજર', hi: 'गाजर' },
  'radish': { en: 'Radish', gu: 'મૂળા', hi: 'मूली' },
  'spinach': { en: 'Spinach', gu: 'પાલક', hi: 'पालक' },
  'palak': { en: 'Spinach', gu: 'પાલક', hi: 'पालक' },
  'bottle gourd': { en: 'Bottle Gourd', gu: 'દૂધી', hi: 'लौकी' },
  'bitter gourd': { en: 'Bitter Gourd', gu: 'કારેલા', hi: 'करेला' },
  'ridge gourd': { en: 'Ridge Gourd', gu: 'તુરીયા', hi: 'तुरई' },
  'snake gourd': { en: 'Snake Gourd', gu: 'પડવળ', hi: 'चिचिंडा' },
  'pumpkin': { en: 'Pumpkin', gu: 'કોળું', hi: 'कद्दू' },
  'drumstick': { en: 'Drumstick', gu: 'સરગવો', hi: 'सहजन' },
  'beans': { en: 'Beans', gu: 'ફણસી', hi: 'सेम' },
  'peas': { en: 'Peas', gu: 'વટાણા', hi: 'मटर' },
  'methi': { en: 'Fenugreek', gu: 'મેથી', hi: 'मेथी' },
  'coriander': { en: 'Coriander', gu: 'કોથમીર', hi: 'धनिया' },
  'garlic': { en: 'Garlic', gu: 'લસણ', hi: 'लहसुन' },
  'ginger': { en: 'Ginger', gu: 'આદું', hi: 'अदरक' },
  'lemon': { en: 'Lemon', gu: 'લીંબુ', hi: 'नींबू' },
  'mousambi': { en: 'Sweet Lime', gu: 'મોસંબી', hi: 'मौसंबी' },
  'sweet lime': { en: 'Sweet Lime', gu: 'મોસંબી', hi: 'मौसंबी' },
};

export function translateCommodity(commodity: string, language: Language): string {
  const clean = commodity.toLowerCase().replace(/[^a-z\s]/g, '').trim();

  if (TRANSLATIONS[clean]) {
    return TRANSLATIONS[clean][language] || TRANSLATIONS[clean].en;
  }

  for (const [key, value] of Object.entries(TRANSLATIONS)) {
    if (clean.includes(key)) {
      return value[language] || value.en;
    }
  }

  return commodity;
  }
