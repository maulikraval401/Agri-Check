import * as tf from '@tensorflow/tfjs';

// ⚠️ IMPORTANT: This module expects trained model files at
// /public/models/plant-disease/model.json (+ weight shards) and
// /public/models/plant-disease/class_indices.json — neither exists yet.
// Disease Detection needs its own labelled leaf-image dataset and a
// separately trained model before this can return real predictions.
// Until then, every call below will throw, and the UI should catch that
// and show a "not available yet" state rather than a fake result.

const MODEL_URL = '/models/plant-disease/model.json';
const CLASS_INDICES_URL = '/models/plant-disease/class_indices.json';
const INPUT_SIZE = 224;

let modelPromise: Promise<tf.LayersModel> | null = null;
let classIndicesPromise: Promise<Record<string, string>> | null = null;

function loadModel(): Promise<tf.LayersModel> {
  if (!modelPromise) {
    modelPromise = tf.loadLayersModel(MODEL_URL);
  }
  return modelPromise;
}

function loadClassIndices(): Promise<Record<string, string>> {
  if (!classIndicesPromise) {
    classIndicesPromise = fetch(CLASS_INDICES_URL).then((res) => {
      if (!res.ok) throw new Error('class_indices.json not found');
      return res.json();
    });
  }
  return classIndicesPromise;
}

export type DiseasePrediction = {
  label: string;
  confidence: number;
};

/**
 * Returns true only if both the model and its class index file can be
 * fetched. Call this before showing the Disease Detection UI as "ready",
 * so the page can fall back to a "coming soon" message instead of crashing.
 */
export async function isDiseaseModelAvailable(): Promise<boolean> {
  try {
    await Promise.all([loadModel(), loadClassIndices()]);
    return true;
  } catch {
    return false;
  }
}

export async function detectDisease(imageElement: HTMLImageElement): Promise<DiseasePrediction[]> {
  const [model, classIndices] = await Promise.all([loadModel(), loadClassIndices()]);

  const tensor = tf.tidy(() => {
    return tf.browser
      .fromPixels(imageElement)
      .resizeBilinear([INPUT_SIZE, INPUT_SIZE])
      .toFloat()
      .div(255)
      .expandDims(0);
  });

  const output = model.predict(tensor) as tf.Tensor;
  const scores = await output.data();
  tensor.dispose();
  output.dispose();

  const predictions: DiseasePrediction[] = Array.from(scores).map((confidence, index) => ({
    label: classIndices[String(index)] ?? `class_${index}`,
    confidence,
  }));

  return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}
