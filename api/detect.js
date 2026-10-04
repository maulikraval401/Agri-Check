export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const HF_TOKEN = process.env.VITE_HF_TOKEN;
  const MODEL_URL = 'https://api-inference.huggingface.co/models/Arko007/agromind-plant-disease-nfnet';

  // Debug info
  const debug = {
    hasToken: !!HF_TOKEN,
    tokenPrefix: HF_TOKEN ? HF_TOKEN.substring(0, 7) : 'NONE',
    modelUrl: MODEL_URL,
  };

  if (!HF_TOKEN) {
    return res.status(500).json({ 
      error: 'HF token not configured',
      debug 
    });
  }

  try {
    const imageBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    const hfResponse = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    const responseText = await hfResponse.text();

    // Agar HF ne error diya
    if (!hfResponse.ok) {
      return res.status(hfResponse.status).json({
        error: 'HF API error',
        status: hfResponse.status,
        hfResponse: responseText.substring(0, 500),
        debug,
      });
    }

    // Success
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({
        error: 'Invalid JSON from HF',
        rawResponse: responseText.substring(0, 500),
        debug,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack?.substring(0, 300),
      debug,
    });
  }
    }
