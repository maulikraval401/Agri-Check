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
  console.log('FULL RESPONSE:', JSON.stringify(data));

  return parseRoboflowResponse(data);
}

function parseRoboflowResponse(data: any): CottonResult {
  // Try every possible structure

  // 1. predictions as object {class: confidence}
  if (data?.predictions && !Array.isArray(data.predictions)) {
    const entries = Object.entries(data.predictions).filter(
      ([k, v]) => typeof v === 'number' && k !== 'confidence',
    );
    if (entries.length > 0) {
      const top = entries.reduce((a: any, b: any) => (a[1] > b[1] ? a : b));
      return {
        className: String(top[0]).replace(/_/g, ' '),
        confidence: top[1] as number,
      };
    }
  }

  // 2. predictions as array [{class, confidence}]
  if (Array.isArray(data?.predictions)) {
    const arr = data.predictions.filter((p: any) => p?.class || p?.class_name);
    if (arr.length > 0) {
      const top = arr.reduce((a: any, b: any) =>
        (b.confidence || 0) > (a.confidence || 0) ? b : a,
      );
      return {
        className: String(top.class || top.class_name).replace(/_/g, ' '),
        confidence: top.confidence || 0,
      };
    }
  }

  // 3. top-level top + confidence
  if (data?.top) {
    return {
      className: String(data.top).replace(/_/g, ' '),
      confidence: data.confidence || 0,
    };
  }

  // 4. outputs array (workflow format)
  if (Array.isArray(data?.outputs) && data.outputs.length > 0) {
    const out = data.outputs[0];
    if (out?.predictions) {
      return parseRoboflowResponse(out);
    }
  }

  // 5. classes object
  if (data?.classes && typeof data.classes === 'object') {
    const entries = Object.entries(data.classes);
    if (entries.length > 0) {
      const top = entries.reduce((a: any, b: any) =>
        (b[1] as number) > (a[1] as number) ? b : a,
      );
      return {
        className: String(top[0]).replace(/_/g, ' '),
        confidence: top[1] as number,
      };
    }
  }

  // 6. If nothing worked, show raw keys for debug
  console.error('Unknown response shape. Keys:', Object.keys(data || {}));
  return { className: 'Unknown', confidence: 0 };
         }
