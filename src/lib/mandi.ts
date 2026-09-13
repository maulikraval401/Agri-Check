const API_KEY = '579b464db66ec23bdd00000176c8de903be943337f6eb5348d3d92c4';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

export type MandiPrice = {
  market: string;
  commodity: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
};

export async function fetchMandiPrices(): Promise<MandiPrice[]> {
  try {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=100&filters[state.keyword]=Gujarat`;

    const res = await fetch(url);

    if (!res.ok) {
      console.error('Mandi API failed:', res.status);
      return getFallbackData();
    }

    const data = await res.json();
    const records = data.records || [];

    if (records.length === 0) {
      console.warn('No records found, using fallback');
      return getFallbackData();
    }

    return records.map((r: any) => ({
      market: r.market || r.district || 'Unknown',
      commodity: r.commodity || 'Unknown',
      minPrice: parseInt(r.min_price) || 0,
      maxPrice: parseInt(r.max_price) || 0,
      modalPrice: parseInt(r.modal_price) || 0,
      date: r.arrival_date || 'Today',
    }));
  } catch (err) {
    console.error('Mandi fetch error:', err);
    return getFallbackData();
  }
}

function getFallbackData(): MandiPrice[] {
  return [
    { market: 'Anand', commodity: 'Cotton', minPrice: 6800, maxPrice: 7300, modalPrice: 7100, date: 'Today' },
    { market: 'Rajkot', commodity: 'Groundnut', minPrice: 5500, maxPrice: 6100, modalPrice: 5800, date: 'Today' },
    { market: 'Ahmedabad', commodity: 'Wheat', minPrice: 2200, maxPrice: 2500, modalPrice: 2350, date: 'Today' },
    { market: 'Junagadh', commodity: 'Bajra', minPrice: 1800, maxPrice: 2100, modalPrice: 1950, date: 'Today' },
    { market: 'Mehsana', commodity: 'Cumin', minPrice: 18000, maxPrice: 22000, modalPrice: 20000, date: 'Today' },
  ];
}
