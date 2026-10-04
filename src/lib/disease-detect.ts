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
    modelPromise = (async () => {
      // WebGL phone pe galat output deta tha, isliye CPU
      await tf.setBackend('cpu');
      await tf.ready();
      return tf.loadGraphModel(MODEL_URL);
    })().catch((e) => {
      modelPromise = null;
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

// Badi photo ko aadha-aadha karke chhota karo (smooth)
function smoothResize(img: HTMLImageElement, size: number): HTMLCanvasElement {
  let cur: HTMLCanvasElement | HTMLImageElement = img;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;

  while (w / 2 > size && h / 2 > size) {
    w = Math.floor(w / 2);
    h = Math.floor(h / 2);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cur, 0, 0, w, h);
    cur = c;
  }

  const out = document.createElement('canvas');
  out.width = size;
  out.height = size;
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cur, 0, 0, size, size);
  return out;
}

export async function detectDisease(imageSrc: string): Promise<DiseaseResult> {
  const [model, img] = await Promise.all([getModel(), loadImage(imageSrc)]);
  const canvas = smoothResize(img, IMG_SIZE);

  const probs = tf.tidy(() => {
    const x = tf.browser
      .fromPixels(canvas)
      .toFloat()
      .div(127.5)
      .sub(1)
      .expandDims(0);
    let out = model.predict(x) as tf.Tensor;
    const sum = out.sum().dataSync()[0];
    if (Math.abs(sum - 1) > 0.01) out = tf.softmax(out);
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
