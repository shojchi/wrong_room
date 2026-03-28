import type { VercelRequest, VercelResponse } from '@vercel/node';

// Lightweight proxy/token approach for the hackathon
// Real production apps should use the ephemeral token pattern or full websocket proxy,
// but returning the key cleanly allows the frontend to use the SDK natively
// without exposing it in the GitHub repo or client-side bundle.

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS is handled by Vercel settings or Vercel's default behavior for same-site.
  // We can explicitly add it here if the frontend is on a different domain.
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: Missing GEMINI_API_KEY environment variable.');
    return res.status(500).json({ error: 'Server missing API key configuration' });
  }
  
  res.status(200).json({ token: apiKey });
}
