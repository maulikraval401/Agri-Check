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
  const base64 = imageDataUrl.split(',')[1];

  const response = await fetch(WORKFLOW_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ROBOFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: {
        image: { type: 'base64', value: base64 },
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Roboflow error:', response.status, errText);
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();
  console.log('Roboflow result:', result);

  // Workflow response me predictions dhoondh
  const predictions = extractPredictions(result);

  return predictions;
}

function extractPredictions(result: any): CottonResult {
  const outputs = result.outputs || result;

  // Outputs array hai
  if (Array.isArray(outputs) && outputs.length > 0) {
    const first = outputs[0];

    // Classifications object
    if (first?.predictions) {
      return pickTop(first.predictions);
    }

    // Direct classes object
    if (first?.classes && typeof first.classes === 'object') {
      return pickTop(first.classes);
    }

    // Array of predictions
    if (Array.isArray(first)) {
      return pickTopFromArray(first);
    }
  }

  // Direct response me predictions
  if (result.predictions) {
    return pickTop(result.predictions);
  }

  return { className: 'Unknown', confidence: 0 };
}

function pickTop(classes: Record<string, number>): CottonResult {
  let topClass = 'Unknown';
  let topConf = 0;

  Object.entries(classes).forEach(([cls, conf]) => {
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

function pickTopFromArray(items: any[]): CottonResult {
  let topClass = 'Unknown';
  let topConf = 0;

  items.forEach((item) => {
    const conf = item.confidence || 0;
    if (conf > topConf) {
      topConf = conf;
      topClass = item.class || item.class_name || 'Unknown';
    }
  });

  return {
    className: topClass.replace(/_/g, ' '),
    confidence: topConf,
  };
    }
