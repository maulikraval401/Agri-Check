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
    const errText = await res.text();
    console.error('Proxy error:', res.status, errText);
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  console.log('Roboflow raw response:', JSON.stringify(data));

  // Response format:
  // { predictions: { class1: 0.9, class2: 0.05, ... }, top: "class1", confidence: 0.9 }
  let topClass = 'Unknown';
  let topConf = 0;

  if (data?.top) {
    topClass = data.top;
    topConf = data.confidence || 0;
  } else if (data?.predictions && typeof data.predictions === 'object') {
    const entries = Object.entries(data.predictions).filter(
      ([key, val]) =>
        typeof val === 'number' &&
        key !== 'confidence' &&
        key !== 'predictions',
    );
    if (entries.length > 0) {
      const best = entries.reduce((a: any, b: any) =>
        (a[1] as number) > (b[1] as number) ? a : b,
      );
      topClass = String(best[0]);
      topConf = best[1] as number;
    }
  }

  return {
    className: topClass.replace(/_/g, ' '),
    confidence: topConf,
  };
}
