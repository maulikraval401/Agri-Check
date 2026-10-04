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

const MODEL_URL = '/models/agri-disease/model.json';
const INPUT_SIZE = 224;

let _modelPromise: Promise<tf.LayersModel> | null = null;

export function loadDiseaseModel(): Promise<tf.LayersModel> {
  if (!_modelPromise) {
    _modelPromise = tf.loadLayersModel(MODEL_URL).catch((err) => {
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

  // Preprocessing: resize 224x224, pixel/127.5 - 1 → range [-1, 1]
  const input = tf.tidy(() => {
    let img = tf.browser.fromPixels(source);
    img = tf.image.resizeBilinear(img, [INPUT_SIZE, INPUT_SIZE]);
    img = img.toFloat().div(127.5).sub(1);
    return img.expandDims(0);
  });

  const output = model.predict(input) as tf.Tensor;
  const probs = await output.data();

  input.dispose();
  output.dispose();

  // Top 5 predictions
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
