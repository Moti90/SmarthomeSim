import { Resend } from 'resend';

export default async function handler(req, res) {
  // CORS (tillad din app og lokal udvikling)
  const allowOrigin = [
    'https://mot90.github.io',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ];
  const origin = req.headers.origin || '';
  if (allowOrigin.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const body = req.body || {};
    const subject = body.subject || 'Feedback';
    const message = body.message || '';
    const userEmail = body.userEmail || 'anon@smarthome.local';
    const userAgent = body.userAgent || '';
    const timestamp = body.timestamp || Date.now();

    if (!message || String(message).trim().length < 10) {
      return res.status(400).json({ ok: false, error: 'short_message' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({ ok: false, error: 'missing_resend_api_key' });
    }

    const resend = new Resend(resendApiKey);
    const to = process.env.FEEDBACK_TO_EMAIL || 'owner@example.com';
    const from = process.env.FEEDBACK_FROM_EMAIL || 'no-reply@smarthome.local';

    const safe = (str) => String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Ny feedback fra Smarthome Simulator</h2>
        <p><strong>Emne:</strong> ${safe(subject)}</p>
        <p><strong>Fra:</strong> ${safe(userEmail)}</p>
        <p><strong>Tid:</strong> ${new Date(timestamp).toISOString()}</p>
        <hr/>
        <p style="white-space: pre-wrap;">${safe(message)}</p>
        <hr/>
        <p><strong>User-Agent:</strong> ${safe(userAgent)}</p>
      </div>
    `;

    await resend.emails.send({ from, to, subject: `[Smarthome Feedback] ${subject}`, html });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send-feedback:error', err);
    return res.status(500).json({ ok: false, error: 'send_failed' });
  }
}


