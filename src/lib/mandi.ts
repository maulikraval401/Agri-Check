const API_KEY = '579b464db66ec23bdd00000176c8de903be943337f6eb5348d3d92c4';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

export type MandiPrice = {
  market: string;
  commodity: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
  category: 'crop' | 'vegetable' | 'other';
};

const CROPS = ['Cotton', 'Groundnut', 'Wheat', 'Bajra', 'Cumin', 'Castor', 'Sesamum', 'Mustard', 'Bengal Gram', 'Soyabean', 'Paddy', 'Maize', 'Jowar', 'Tur', 'Moong', 'Urad', 'Gram', 'Rapeseed'];
const VEGETABLES = ['Tomato', 'Potato', 'Onion', 'Cabbage', 'Cauliflower', 'Brinjal', 'Bhindi', 'Ladies Finger', 'Cucumber', 'Kheera', 'Green Chilli', 'Capsicum', 'Carrot', 'Radish', 'Spinach', 'Palak', 'Bottle Gourd', 'Bitter Gourd', 'Ridge Gourd', 'Snake Gourd', 'Pumpkin', 'Drumstick', 'Beans', 'Peas', 'Methi', 'Coriander', 'Garlic', 'Ginger', 'Lemon'];

function getCategory(commodity: string): 'crop' | 'vegetable' | 'other' {
  const c = commodity.toLowerCase();
  if (CROPS.some((crop) => c.includes(crop.toLowerCase()))) return 'crop';
  if (VEGETABLES.some((veg) => c.includes(veg.toLowerCase()))) return 'vegetable';
  return 'other';
}

// Cache variables
const CACHE_KEY = 'agri_mandi_cache';
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

// Fallback Data (Agar API fail ho jaye toh ye data dikhega taaki app khali na lage)
const FALLBACK_DATA: MandiPrice[] = [
  { market: 'Rajkot', commodity: 'Cotton', minPrice: 6800, maxPrice: 7500, modalPrice: 7100, date: 'Today', category: 'crop' },
  { market: 'Gondal', commodity: 'Groundnut', minPrice: 5500, maxPrice: 6200, modalPrice: 5800, date: 'Today', category: 'crop' },
  { market: 'Junagadh', commodity: 'Cumin', minPrice: 18000, maxPrice: 22000, modalPrice: 20000, date: 'Today', category: 'crop' },
  { market: 'Patan', commodity: 'Wheat', minPrice: 2400, maxPrice: 2600, modalPrice: 2500, date: 'Today', category: 'crop' },
  { market: 'Ahmedabad', commodity: 'Onion', minPrice: 1800, maxPrice: 2500, modalPrice: 2100, date: 'Today', category: 'vegetable' },
  { market: 'Surat', commodity: 'Tomato', minPrice: 1500, maxPrice: 2000, modalPrice: 1800, date: 'Today', category: 'vegetable' },
];

export async function fetchMandiPrices(): Promise<MandiPrice[]> {
  try {
    // 1. Check Cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        return data;
      }
    }

    // 2. Fetch from API
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=2000&filters[state.keyword]=Gujarat`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`API Error: ${res.status} - ${res.statusText}`);
      throw new Error('API failed');
    }

    const data = await res.json();
    const records = data.records || [];

    // Agar API success hui par data khali aaya (jaise Sunday ko hota hai)
    if (records.length === 0) {
      console.warn('API returned 0 records. Using fallback.');
      return FALLBACK_DATA;
    }

    // 3. Process records
    const mappedData: MandiPrice[] = records.map((r: any) => {
      let name = r.commodity || 'Unknown';
      if (name === 'Paddy') name = 'Rice';
      if (name === 'Soyabean') name = 'Soybean';

      return {
        market: r.market || r.district || 'Unknown',
        commodity: name,
        minPrice: parseInt(r.min_price) || 0,
        maxPrice: parseInt(r.max_price) || 0,
        modalPrice: parseInt(r.modal_price) || 0,
        date: r.arrival_date || 'Today',
        category: getCategory(name),
      };
    }).filter((r) => r.category !== 'other' && r.modalPrice > 0);

    if (mappedData.length === 0) {
       return FALLBACK_DATA;
    }

    // 4. Save to Cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: mappedData
      }));
    } catch {}

    return mappedData;

  } catch (err) {
    console.error('Mandi fetch error:', err);
    // API fail hone par fallback data return karo
    return FALLBACK_DATA;
  }
        }
