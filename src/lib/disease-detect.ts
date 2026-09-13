import { detectCottonViaAPI } from '@/lib/cotton-api';
import * as tf from '@tensorflow/tfjs';

const MODEL_URL = '/models/plant-disease/model.json';

const CLASSES = [
  'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
  'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
  'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
  'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
  'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
  'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew',
  'Strawberry___Leaf_scorch', 'Strawberry___healthy',
  'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
  'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy',
];

let model: tf.LayersModel | null = null;

async function loadModel(): Promise<tf.LayersModel> {
  if (model) return model;
  model = await tf.loadLayersModel(MODEL_URL);
  return model;
}

export type DiseaseResult = {
  className: string;
  crop: string;
  disease: string;
  confidence: number;
  isHealthy: boolean;
};

export async function detectDisease(imageDataUrl: string): Promise<DiseaseResult> {
  const m = await loadModel();

  const img = new Image();
  img.src = imageDataUrl;
  await new Promise((r) => { img.onload = r; });

  const tensor = tf.browser
    .fromPixels(img)
    .resizeBilinear([224, 224])
    .toFloat()
    .div(255)
    .expandDims(0);

  const pred = m.predict(tensor) as tf.Tensor;
  const probs = await pred.data();

  let maxIdx = 0;
  let maxProb = probs[0];
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > maxProb) { maxProb = probs[i]; maxIdx = i; }
  }

  const className = CLASSES[maxIdx] || 'Unknown';
  const [crop, disease] = className.split('___');

  tensor.dispose();
  pred.dispose();

  return {
    className,
    crop: crop.replace(/_/g, ' ').replace(/\(.*?\)/g, '').trim(),
    disease: disease.replace(/_/g, ' '),
    confidence: maxProb,
    isHealthy: disease === 'healthy',
  };
      }
