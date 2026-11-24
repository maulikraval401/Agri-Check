// Vercel serverless function: POST /api/assistant
const VALID_PATHS = ['/calculator', '/disease', '/weather', '/mandi'];
const CROPS = ['cotton', 'groundnut', 'wheat', 'bajra', 'cumin'] as const;

const SYSTEM = `You are a helpful farming assistant for Indian farmers. Answer their questions in their language (Hindi, Gujarati, Marathi, Punjabi, Tamil, or English).

STRICT SAFETY RULES (never break these):
1. NEVER give exact fertilizer doses or pesticide doses. 
2. If the user asks about doses, mandi prices, weather, or crop diseases: you MUST set action="navigate" and provide the correct path.
3. For general knowledge questions (what is urea, how to make compost): you can answer directly with action="answer".
4. Keep answers short (2-4 sentences max).

Respond ONLY with valid JSON (no markdown, no backticks):
{"action":"answer"|"navigate"|"none","reply":"Your reply in user's language","path":"/calculator"|"/disease"|"/mandi"|"/weather"|null,"crop":"cotton"|"groundnut"|"wheat"|"bajra"|"cumin"|null}

Example 1 - User: "Mere cotton me red bug hai kya karu?" 
{"action":"navigate","reply":"Disease Detection page pe photo daalein, AI rog pehchan lega.","path":"/disease","crop":"cotton"}

Example 2 - User: "Urea kya hota hai?"
{"action":"answer","reply":"Urea ek khaad hai jisme 46% Nitrogen hota hai. Ye patton ko hara rakhne me madad karti hai.","path":null,"crop":null}

Example 3 - User: "Aaj mandi bhav kya hai?"
{"action":"navigate","reply":"Aaj ke mandi bhav dekhne ke liye Mandi page kholein.","path":"/mandi","crop":null}`;

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
    return res.status(200).json({ action: 'answer', reply: "Namaste! Kheti ke baare me kuch bhi poochhein — khaad, rog, mandi bhav, ya mausam.", path: null, crop: null });
  }

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0,
        max_tokens: 600, // Increased to prevent truncation
        response_format: { type: "json_object" }, // Forces valid JSON
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
      out = JSON.parse(cleaned);
    } catch {
      // fallback already set
    }

    const action = ['answer', 'navigate', 'none'].includes(out.action) ? out.action : 'none';
    const path = VALID_PATHS.includes(out.path) ? out.path : null;
    const crop = CROPS.find((c) => c === out.crop) ?? null;

    return res.status(200).json({ action, reply: String(out.reply || ''), path, crop: path === '/calculator' ? crop : null });
  } catch (err: any) {
    return res.status(502).json({ error: 'upstream', details: `Fetch failed: ${err.message}` });
  }
         }
