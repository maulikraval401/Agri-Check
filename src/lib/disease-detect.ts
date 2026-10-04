const HF_API_URL = 'https://api-inference.huggingface.co/models/Arko007/agromind-plant-disease-nfnet';
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

export interface DiseaseResult {
  className: string;
  crop: string;
  disease: string;
  confidence: number;
  isHealthy: boolean;
  isConfident: boolean;
  topPredictions: { className: string; confidence: number }[];
}

export function parseLabel(label: string) {
  const cleanLabel = label.replace(/_/g, ' ').trim();
  let crop = 'Unknown';
  let disease = cleanLabel;
  let isHealthy = /healthy/i.test(cleanLabel);

  const crops = ['Corn', 'Cotton', 'Rice', 'Sugarcane', 'Tomato', 'Wheat', 'Apple', 'Cassava', 'Cherry', 'Chili', 'Coffee', 'Cucumber', 'Grape', 'Mango', 'Peach', 'Pepper', 'Pomegranate', 'Potato', 'Soybean', 'Strawberry', 'Tea'];

  for (const c of crops) {
    if (cleanLabel.toLowerCase().includes(c.toLowerCase())) {
      crop = c;
      disease = cleanLabel.replace(new RegExp(c, 'i'), '').replace(/^[\s_-]+/, '').trim();
      break;
    }
  }

  if (!disease) disease = isHealthy ? 'Healthy' : cleanLabel;
  return { crop, disease, isHealthy };
}

function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

export async function detectDisease(imageSrc: string): Promise<DiseaseResult> {
  const blob = dataURLtoBlob(imageSrc);

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/octet-stream',
    },
    body: blob,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('HF API Error:', response.status, errText);
    throw new Error(`Model error: ${response.status}`);
  }

  const predictions: { label: string; score: number }[] = await response.json();

  if (!Array.isArray(predictions) || predictions.length === 0) {
    throw new Error('No predictions returned');
  }

  predictions.sort((a, b) => b.score - a.score);
  const top = predictions[0];
  const { crop, disease, isHealthy } = parseLabel(top.label);

  const topPredictions = predictions.slice(0, 5).map((p) => ({
    className: p.label,
    confidence: p.score,
  }));

  return {
    className: top.label,
    crop,
    disease,
    confidence: top.score,
    isHealthy,
    isConfident: top.score >= 0.3,
    topPredictions,
  };
                  }
