export type CottonResult = {
  className: string;
  confidence: number;
};

export async function detectCottonViaAPI(
  imageDataUrl: string,
): Promise<CottonResult> {
  const res = await fetch('/api/cotton', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Proxy error:', res.status, err);
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  console.log('Roboflow response:', data);

  const predictions: Record<string, number> = data.predictions || {};

  let topClass = data.top || 'Unknown';
  let topConf = data.confidence || 0;

  Object.entries(predictions).forEach(([cls, conf]) => {
    const c = typeof conf === 'number' ? conf : 0;
    if (c > topConf) {
      topConf = c;
      topClass = cls;
    }
  });

  return {
    className: topClass.replace(/_/g, ' '),
    confidence: topConf,
  };
}
