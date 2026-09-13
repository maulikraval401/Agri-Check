const ROBOFLOW_API_KEY = 'MQCqehaGR5aX3HHVtN1Z';

const WORKFLOW_URL =
  'https://serverless.roboflow.com/maulik-raval/workflows/cotton-leaf-health-vcotton-leaf-health-1-resnet18-t1-logic';

export type CottonResult = {
  className: string;
  confidence: number;
};

export async function detectCottonViaAPI(
  imageDataUrl: string,
): Promise<CottonResult> {
  const response = await fetch(WORKFLOW_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ROBOFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: {
        image: { type: 'base64', value: imageDataUrl },
      },
    }),
  });

  const result = await response.json();

  // Debug log — Chrome console me dikhega
  console.log('Roboflow full response:', JSON.stringify(result, null, 2));

  // Result me predictions dhoondh
  return parseResult(result);
}

function parseResult(result: any): CottonResult {
  // Try all possible paths where predictions could be
  const paths = [
    result?.outputs?.[0]?.predictions,
    result?.outputs?.[0]?.classes,
    result?.outputs?.[0],
    result?.predictions,
    result?.classes,
    result,
  ];

  for (const p of paths) {
    if (!p) continue;

    // Object of {classname: confidence}
    if (typeof p === 'object' && !Array.isArray(p)) {
      const entries = Object.entries(p).filter(
        ([k, v]) => typeof v === 'number' && k !== 'confidence',
      );
      if (entries.length > 0) {
        const top = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
        return {
          className: String(top[0]).replace(/_/g, ' '),
          confidence: top[1] as number,
        };
      }
    }

    // Array of {class, confidence}
    if (Array.isArray(p)) {
      const best = p.reduce(
        (a: any, b: any) => (b.confidence > a.confidence ? b : a),
        p[0],
      );
      if (best?.class || best?.class_name) {
        return {
          className: (best.class || best.class_name).replace(/_/g, ' '),
          confidence: best.confidence || 0,
        };
      }
    }
  }

  return { className: 'Unknown', confidence: 0 };
}
