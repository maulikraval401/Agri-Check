// Vercel serverless function: POST /api/assistant
const TARGETS = ['fertilizer', 'disease', 'weather', 'mandi', 'none'] as const;
const CROPS = ['cotton', 'groundnut', 'wheat', 'bajra', 'cumin'] as const;

const SYSTEM = `You are a helpful farming assistant for Indian farmers. Answer their questions in their language (Hindi, Gujarati, Marathi, Punjabi, Tamil, or English).

STRICT SAFETY RULES (never break these):
1. NEVER give exact fertilizer doses (like "daalo 50 kg urea"). Instead say "Calculator me jaakar sahi dose dekhein" and set action=navigate path=/calculator.
2. NEVER give pesticide/medicine doses. Always say "KVK ya agriculture officer se poochhein".
3. For mandi prices, weather, or diseases: set action=navigate to the right page.
4. For general knowledge (what is urea, how to compost, what is crop rotation): answer directly with action=answer.
5. Keep answers short (2-4 sentences max). Use simple words a farmer understands.
6. If unsure, say "Main nahi jaanta, apne KVK se poochhein".

Respond ONLY with valid JSON (no markdown, no backticks):
{"action":"answer"|"navigate"|"none","reply":"Your reply in user's language","path":"/calculator"|"/disease"|"/mandi"|"/weather"|null,"crop":"cotton"|"groundnut"|"wheat"|"bajra"|"cumin"|null}

Example 1 - User: "Mere kapas me kitni urea daalu?" 
{"action":"navigate","reply":"Sahi dose ke liye Calculator kholein, wahan fasal aur area daalein.","path":"/calculator","crop":"cotton"}

Example 2 - User: "Urea kya hota hai?"
{"action":"answer","reply":"Urea ek khaad hai jisme 46% Nitrogen hota hai. Ye patton ko hara rakhne me madad karti hai.","path":null,"crop":null}

Example 3 - User: "Mere tamatar me keede lag gaye hain"
{"action":"navigate","reply":"Disease Detection page pe photo daalein, AI rog pehchan lega.","path":"/disease","crop":null}`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const { GROQ_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!GROQ_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'not_configured', details: 'Vercel Env variables missing hain' });
  }

  const auth = String(req.headers.authorization ?? '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'login', details: 'Token nahi mila' });

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) return res.status(401).json({ error: 'login', details: `Auth failed: ${userRes.status}` });

  const hitRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/assistant_hit`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!hitRes.ok) return res.status(500).json({ error: 'limit_check', details: `RPC failed: ${hitRes.status}` });
  if ((await hitRes.json()) !== true) return res.status(429).json({ error: 'limit', details: 'Daily limit reached' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 300) : '';
  if (!text) return res.status(400).json({ error: 'empty', details: 'Text nahi mila' });

  if (text.length < 3 || ['hi', 'hello', 'hey', 'namaste', 'hola'].includes(text.toLowerCase())) {
    return res.status(200).json({ action: 'none', reply: "Namaste! Kheti ke baare me kuch bhi poochhein — khaad, rog, mandi bhav, ya mausam.", path: null, crop: null });
  }

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 250,
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
    const rawContent = data.choices?.[0]?.message?.content ?? '';

    let out: any = { action: 'none', reply: 'Maaf kijiyega, samajh nahi aaya. Dobara try karein.', path: null, crop: null };
    try {
      const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        out = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      }
    } catch {
      // fallback already set
    }

    const action = ['answer', 'navigate', 'none'].includes(out.action) ? out.action : 'none';
    const path = TARGETS.find((t) => t === out.path) ? out.path : null;
    const crop = CROPS.find((c) => c === out.crop) ?? null;

    return res.status(200).json({ action, reply: String(out.reply || ''), path, crop: path === '/fertilizer' ? crop : null });
  } catch (err: any) {
    return res.status(502).json({ error: 'upstream', details: `Fetch failed: ${err.message}` });
  }
}
