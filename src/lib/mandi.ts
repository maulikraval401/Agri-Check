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

const CROPS = [
  'Cotton', 'Groundnut', 'Wheat', 'Bajra', 'Cumin', 'Castor',
  'Sesamum', 'Mustard', 'Bengal Gram', 'Soyabean', 'Paddy', 'Maize',
  'Jowar', 'Tur', 'Moong', 'Urad', 'Gram', 'Rapeseed',
];

const VEGETABLES = [
  'Tomato', 'Potato', 'Onion', 'Cabbage', 'Cauliflower', 'Brinjal',
  'Bhindi', 'Ladies Finger', 'Cucumber', 'Kheera', 'Green Chilli',
  'Capsicum', 'Carrot', 'Radish', 'Spinach', 'Palak', 'Bottle Gourd',
  'Bitter Gourd', 'Ridge Gourd', 'Snake Gourd', 'Pumpkin', 'Drumstick',
  'Beans', 'Peas', 'Methi', 'Coriander', 'Garlic', 'Ginger', 'Lemon',
];

function getCategory(commodity: string): 'crop' | 'vegetable' | 'other' {
  const c = commodity.toLowerCase();
  if (CROPS.some((crop) => c.includes(crop.toLowerCase()))) return 'crop';
  if (VEGETABLES.some((veg) => c.includes(veg.toLowerCase()))) return 'vegetable';
  return 'other';
}

// Cache variables
const CACHE_KEY = 'agri_mandi_cache';
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export async function fetchMandiPrices(): Promise<MandiPrice[]> {
  try {
    // 1. Check Cache first
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
      throw new Error('API failed');
    }

    const data = await res.json();
    const records = data.records || [];

    if (records.length === 0) {
      return [];
    }

    // 3. Process records (Keep ALL markets, no deduplication by commodity)
    const mappedData: MandiPrice[] = records.map((r: any) => {
      // Fix names to match app UI
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
    // Fallback data is REMOVED. Return empty array so UI shows "No data".
    return [];
  }
      }
