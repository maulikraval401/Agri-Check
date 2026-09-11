export type MandiPrice = {
  market: string;
  commodity: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
};

// ⚠️ data.gov.in API key chahiye. Tab tak demo data use kar rahe hain.
const DEMO_DATA: MandiPrice[] = [
  { market: 'Anand', commodity: 'Cotton', minPrice: 6800, maxPrice: 7300, modalPrice: 7100, date: 'Today' },
  { market: 'Rajkot', commodity: 'Groundnut', minPrice: 5500, maxPrice: 6100, modalPrice: 5800, date: 'Today' },
  { market: 'Ahmedabad', commodity: 'Wheat', minPrice: 2200, maxPrice: 2500, modalPrice: 2350, date: 'Today' },
  { market: 'Junagadh', commodity: 'Bajra', minPrice: 1800, maxPrice: 2100, modalPrice: 1950, date: 'Today' },
  { market: 'Mehsana', commodity: 'Cumin', minPrice: 18000, maxPrice: 22000, modalPrice: 20000, date: 'Today' },
  { market: 'Vadodara', commodity: 'Cotton', minPrice: 6700, maxPrice: 7200, modalPrice: 7000, date: 'Today' },
];

export async function fetchMandiPrices(): Promise<MandiPrice[]> {
  // Jab API key mile:
  // const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY&format=json&filters[state]=Gujarat&limit=50`;
  // const res = await fetch(url);
  // return transform(res);

  // Abhi demo:
  return new Promise((resolve) => {
    setTimeout(() => resolve(DEMO_DATA), 500);
  });
}
