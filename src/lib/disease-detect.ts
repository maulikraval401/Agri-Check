import * as tf from '@tensorflow/tfjs';

export const DISEASE_LABELS = [
  'Corn_Blight', 'Corn_Common_Rust', 'Corn_Gray_Leaf_Spot', 'Corn_Healthy',
  'Cotton_bacterial_blight', 'Cotton_curl_virus', 'Cotton_fussarium_wilt', 'Cotton_healthy',
  'Rice_Bacterial Leaf Blight', 'Rice_Brown Spot', 'Rice_Healthy Rice Leaf', 'Rice_Leaf Blast', 'Rice_Leaf scald', 'Rice_Sheath Blight',
  'Sugarcane_Healthy', 'Sugarcane_Mosaic', 'Sugarcane_RedRot', 'Sugarcane_Rust', 'Sugarcane_Yellow',
  'Tomato_Bacterial_spot', 'Tomato_Early_blight', 'Tomato_Late_blight', 'Tomato_Leaf_Mold',
  'Tomato_Septoria_leaf_spot', 'Tomato_Spider_mites Two-spotted_spider_mite', 'Tomato_Target_Spot',
  'Tomato_Tomato_Yellow_Leaf_Curl_Virus', 'Tomato_Tomato_mosaic_virus', 'Tomato_healthy', 'Tomato_powdery_mildew',
  'Wheat_Aphid', 'Wheat_Black Rust', 'Wheat_Blast', 'Wheat_Brown Rust', 'Wheat_Common Root Rot',
  'Wheat_Fusarium Head Blight', 'Wheat_Healthy', 'Wheat_Leaf Blight', 'Wheat_Mildew', 'Wheat_Mite',
  'Wheat_Septoria', 'Wheat_Smut', 'Wheat_Stem fly', 'Wheat_Tan spot', 'Wheat_Yellow Rust',
] as const;

export type DiseaseLabel = typeof DISEASE_LABELS[number];

export interface Prediction {
  label: string;
  crop: string;
  disease: string;
  confidence: number;
  isHealthy: boolean;
  rank: number;
}

export interface DiseaseResult {
  className: string;
  crop: string;
  disease: string;
  confidence: number;
  isHealthy: boolean;
  isConfident: boolean;
  topPredictions: { className: string; confidence: number }[];
}

const MODEL_URL = '/models/agri-disease/model.json';
const INPUT_SIZE = 224;
const CONFIDENCE_THRESHOLD = 0.6;

let _modelPromise: Promise<tf.GraphModel> | null = null;

export function loadDiseaseModel(): Promise<tf.GraphModel> {
  if (!_modelPromise) {
    _modelPromise = tf.loadGraphModel(MODEL_URL).catch((err) => {
      _modelPromise = null;
      throw err;
    });
  }
  return _modelPromise;
}

export function parseLabel(label: string) {
  const idx = label.indexOf('_');
  if (idx === -1) return { crop: label, disease: label, isHealthy: false };
  const crop = label.slice(0, idx);
  const disease = label.slice(idx + 1).replace(/_/g, ' ');
  const isHealthy = /healthy/i.test(label);
  return { crop, disease, isHealthy };
}

export async function predictDisease(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<Prediction[]> {
  const model = await loadDiseaseModel();

  const input = tf.tidy(() => {
    let img = tf.browser.fromPixels(source);
    img = tf.image.resizeBilinear(img, [INPUT_SIZE, INPUT_SIZE]);
    img = img.toFloat().div(127.5).sub(1);
    return img.expandDims(0);
  });

  const prediction = model.predict(input);
  const output = Array.isArray(prediction) ? prediction[0] : (prediction as tf.Tensor);
  const probs = await output.data();

  input.dispose();
  if (Array.isArray(prediction)) {
    prediction.forEach((t) => t.dispose());
  } else {
    (prediction as tf.Tensor).dispose();
  }

  const ranked = Array.from(probs)
    .map((confidence, index) => ({ confidence, index }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  return ranked.map(({ confidence, index }, i) => {
    const label = DISEASE_LABELS[index];
    const { crop, disease, isHealthy } = parseLabel(label);
    return { label, crop, disease, confidence, isHealthy, rank: i + 1 };
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

export async function detectDisease(imageSrc: string): Promise<DiseaseResult> {
  const img = await loadImage(imageSrc);
  const preds = await predictDisease(img);
  const top = preds[0];

  return {
    className: top.label,
    crop: top.crop,
    disease: top.disease,
    confidence: top.confidence,
    isHealthy: top.isHealthy,
    isConfident: top.confidence >= CONFIDENCE_THRESHOLD,
    topPredictions: preds.map((p) => ({
      className: p.label,
      confidence: p.confidence,
    })),
  };
  }
