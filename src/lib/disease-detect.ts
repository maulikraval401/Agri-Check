import * as tf from '@tensorflow/tfjs';
import { DISEASE_LABELS } from './disease-labels';

const MODEL_URL = '/models/agri-disease/model.json';
const IMG_SIZE = 224;

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
  const idx = label.indexOf('_');
  const crop = idx > 0 ? label.slice(0, idx) : 'Unknown';
  let disease = (idx > 0 ? label.slice(idx + 1) : label).replace(/_/g, ' ').trim();
  const isHealthy = /healthy/i.test(label);
  if (!disease) disease = isHealthy ? 'Healthy' : label;
  return { crop, disease, isHealthy };
}

let modelPromise: Promise<tf.GraphModel> | null = null;

function getModel() {
  if (!modelPromise) {
    modelPromise = tf.loadGraphModel(MODEL_URL).catch((e) => {
      modelPromise = null; // retry allow karo
      throw e;
    });
  }
  return modelPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

export async function detectDisease(imageSrc: string): Promise<DiseaseResult> {
  const [model, img] = await Promise.all([getModel(), loadImage(imageSrc)]);

  const probs = tf.tidy(() => {
    const x = tf.browser
      .fromPixels(img)
      .resizeBilinear([IMG_SIZE, IMG_SIZE])
      .toFloat()
      .div(127.5)
      .sub(1)
      .expandDims(0);
    let out = model.predict(x) as tf.Tensor;
    const sum = out.sum().dataSync()[0];
    if (Math.abs(sum - 1) > 0.01) out = tf.softmax(out); // logits aaye to softmax
    return out;
  });

  const scores = Array.from(await probs.data());
  probs.dispose();

  const ranked = scores
    .map((score, i) => ({ label: DISEASE_LABELS[i], score }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const { crop, disease, isHealthy } = parseLabel(top.label);

  return {
    className: top.label,
    crop,
    disease,
    confidence: top.score,
    isHealthy,
    isConfident: top.score >= 0.3,
    topPredictions: ranked.slice(0, 5).map((p) => ({
      className: p.label,
      confidence: p.score,
    })),
  };
      }
