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

export async function fetchMandiPrices(): Promise<MandiPrice[]> {
  try {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=500&filters[state.keyword]=Gujarat`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error('Mandi API failed:', res.status);
      return getFallbackData();
    }

    const data = await res.json();
    const records = data.records || [];

    const filtered = records.filter((r: any) => {
      const cat = getCategory(r.commodity || '');
      return cat === 'crop' || cat === 'vegetable';
    });

    const seen = new Set<string>();
    const unique: any[] = [];
    filtered.forEach((r: any) => {
      if (!seen.has(r.commodity)) {
        seen.add(r.commodity);
        unique.push(r);
      }
    });

    const sorted = unique.sort((a, b) => {
      const catA = getCategory(a.commodity);
      const catB = getCategory(b.commodity);
      if (catA === catB) return 0;
      return catA === 'crop' ? -1 : 1;
    });

    return sorted.slice(0, 30).map((r: any) => ({
      market: r.market || r.district || 'Unknown',
      commodity: r.commodity || 'Unknown',
      minPrice: parseInt(r.min_price) || 0,
      maxPrice: parseInt(r.max_price) || 0,
      modalPrice: parseInt(r.modal_price) || 0,
      date: r.arrival_date || 'Today',
      category: getCategory(r.commodity || ''),
    }));
  } catch (err) {
    console.error('Mandi fetch error:', err);
    return getFallbackData();
  }
}

function getFallbackData(): MandiPrice[] {
  return [
    { market: 'Anand', commodity: 'Cotton', minPrice: 6800, maxPrice: 7300, modalPrice: 7100, date: 'Today', category: 'crop' },
    { market: 'Rajkot', commodity: 'Groundnut', minPrice: 5500, maxPrice: 6100, modalPrice: 5800, date: 'Today', category: 'crop' },
    { market: 'Ahmedabad', commodity: 'Wheat', minPrice: 2200, maxPrice: 2500, modalPrice: 2350, date: 'Today', category: 'crop' },
    { market: 'Junagadh', commodity: 'Bajra', minPrice: 1800, maxPrice: 2100, modalPrice: 1950, date: 'Today', category: 'crop' },
    { market: 'Mehsana', commodity: 'Cumin', minPrice: 18000, maxPrice: 22000, modalPrice: 20000, date: 'Today', category: 'crop' },
    { market: 'Ahmedabad', commodity: 'Tomato', minPrice: 1000, maxPrice: 2500, modalPrice: 1750, date: 'Today', category: 'vegetable' },
    { market: 'Rajkot', commodity: 'Potato', minPrice: 700, maxPrice: 1300, modalPrice: 1000, date: 'Today', category: 'vegetable' },
    { market: 'Anand', commodity: 'Onion', minPrice: 1500, maxPrice: 2800, modalPrice: 2200, date: 'Today', category: 'vegetable' },
  ];
                                    }
