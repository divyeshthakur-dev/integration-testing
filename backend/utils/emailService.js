const sendEmail = async ({ provider, to, subject, body }) => {
  switch (provider) {
    case 'resend':
      return await sendViaResend({ to, subject, body });
    case 'brevo':
      return await sendViaBrevo({ to, subject, body });
    case 'mailjet':
      return await sendViaMailjet({ to, subject, body });
    default:
      throw new Error('Unsupported email provider');
  }
};

const sendViaResend = async ({ to, subject, body }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Acme <onboarding@resend.dev>',
      to: [to],
      subject,
      html: body
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Resend Error: ${response.status} ${JSON.stringify(errorData)}`);
  }
  return await response.json();
};

const sendViaBrevo = async ({ to, subject, body }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'E-commerce Test', email: 'test@example.com' },
      to: [{ email: to }],
      subject,
      htmlContent: body
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Brevo Error: ${response.status} ${JSON.stringify(errorData)}`);
  }
  return await response.json();
};

const sendViaMailjet = async ({ to, subject, body }) => {
  const apiKeyPublic = process.env.MAILJET_API_KEY;
  const apiKeyPrivate = process.env.MAILJET_API_SECRET;
  if (!apiKeyPublic || !apiKeyPrivate) throw new Error('Mailjet API keys are not set');

  // Basic auth
  const authHeader = 'Basic ' + Buffer.from(`${apiKeyPublic}:${apiKeyPrivate}`).toString('base64');

  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: 'test@example.com', Name: 'E-commerce Test' },
          To: [{ Email: to, Name: 'Customer' }],
          Subject: subject,
          HTMLPart: body
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Mailjet Error: ${response.status} ${JSON.stringify(errorData)}`);
  }
  return await response.json();
};

module.exports = { sendEmail };
