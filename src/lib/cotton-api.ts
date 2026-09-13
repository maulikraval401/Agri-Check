const ROBOFLOW_API_KEY = 'MQCqehaGR5aX3HHVtN1Z';
const MODEL = 'cotton-leaf-health-1-resnet18-t1';
const VERSION = '1';

export type CottonResult = {
  className: string;
  confidence: number;
};

export async function detectCottonViaAPI(imageDataUrl: string): Promise<CottonResult> {
  const base64 = imageDataUrl.split(',')[1];

  const res = await fetch(
    `https://classify.roboflow.com/${MODEL}/${VERSION}?api_key=${ROBOFLOW_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: base64,
    }
  );

  if (!res.ok) throw new Error('API error');

  const data = await res.json();
  const predictions: Record<string, number> = data.predictions || {};

  let topClass = data.top || 'Unknown';
  let topConf = data.confidence || 0;

  Object.entries(predictions).forEach(([cls, conf]) => {
    if ((conf as number) > topConf) {
      topClass = cls;
      topConf = conf as number;
    }
  });

  return {
    className: topClass.replace(/_/g, ' '),
    confidence: topConf,
  };
}
