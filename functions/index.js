const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');

// Initialize admin SDK once
try {
  admin.initializeApp();
} catch (e) {}

const resendApiKey = process.env.RESEND_API_KEY || (functions.config().resend && functions.config().resend.key);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

exports.sendFeedbackEmail = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    const debug = true;
    if (debug) console.log('sendFeedbackEmail:data', data);

    if (!resend) {
      console.error('RESEND_API_KEY not configured');
      throw new functions.https.HttpsError('failed-precondition', 'Email service ikke konfigureret');
    }

    const subject = (data && data.subject) || 'Feedback';
    const message = (data && data.message) || '';
    const userEmail = (data && data.userEmail) || 'anon@smarthome.local';
    const userAgent = (data && data.userAgent) || '';
    const timestamp = (data && data.timestamp) || Date.now();

    if (!message || message.length < 10) {
      throw new functions.https.HttpsError('invalid-argument', 'Besked for kort');
    }

    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Ny feedback fra Smarthome Simulator</h2>
        <p><strong>Emne:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Fra:</strong> ${escapeHtml(userEmail)}</p>
        <p><strong>Tid:</strong> ${new Date(timestamp).toISOString()}</p>
        <hr/>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        <hr/>
        <p><strong>User-Agent:</strong> ${escapeHtml(userAgent)}</p>
      </div>
    `;

    try {
      const to = process.env.FEEDBACK_TO_EMAIL || (functions.config().feedback && functions.config().feedback.to) || 'owner@example.com';
      const from = process.env.FEEDBACK_FROM_EMAIL || (functions.config().feedback && functions.config().feedback.from) || 'no-reply@smarthome.local';
      if (debug) console.log('sendFeedbackEmail:send', { to, from, subject });

      const result = await resend.emails.send({
        from,
        to,
        subject: `[Smarthome Feedback] ${subject}`,
        html
      });
      if (debug) console.log('sendFeedbackEmail:ok', result);
      return { ok: true };
    } catch (err) {
      console.error('sendFeedbackEmail:error', err);
      throw new functions.https.HttpsError('internal', 'Kunne ikke sende email');
    }
  });

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


