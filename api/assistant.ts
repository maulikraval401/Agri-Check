// Vercel serverless function: POST /api/assistant
const TARGETS = ['fertilizer', 'disease', 'weather', 'mandi', 'none'] as const;
const CROPS = ['cotton', 'groundnut', 'wheat', 'bajra', 'cumin'] as const;

const SYSTEM = `You route a farmer's message in an Indian farming app to one page. Reply ONLY with JSON: {"target":"...","crop":"..."|null}.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const { GROQ_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!GROQ_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'not_configured', details: 'Vercel Env variables missing hain' });
  }

  const auth = String(req.headers.authorization ?? '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'login', details: 'Token nahi mila' });

  // 1. Verify Supabase Token
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) {
    return res.status(401).json({ error: 'login', details: `Supabase auth failed: ${userRes.status} - ${await userRes.text()}` });
  }

  // 2. Check Daily Limit (RPC)
  const hitRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/assistant_hit`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  if (!hitRes.ok) {
    return res.status(500).json({ error: 'limit_check', details: `RPC failed: ${hitRes.status} - ${await hitRes.text()}` });
  }
  const hitData = await hitRes.json();
  if (hitData !== true) return res.status(429).json({ error: 'limit', details: 'Daily limit reached' });

  // 3. Input
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 200) : '';
  if (!text) return res.status(400).json({ error: 'empty', details: 'Text nahi mila' });

  // 4. Call Groq API
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        temperature: 0,
        max_tokens: 60,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: text },
        ],
      }),
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.status(502).json({ error: 'upstream', details: `Groq failed: ${r.status} - ${errText}` });
    }
    const data = await r.json();
    const out = JSON.parse(data.choices?.[0]?.message?.content ?? '{}');
    const target = TARGETS.find((t) => t === out?.target) ?? 'none';
    const crop = CROPS.find((c) => c === out?.crop) ?? null;
    return res.status(200).json({ target, crop: target === 'fertilizer' ? crop : null });
  } catch (err: any) {
    return res.status(502).json({ error: 'upstream', details: `Fetch failed: ${err.message}` });
  }
}
