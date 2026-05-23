import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL || 'noreply@tlpairways.com';
    const senderName = process.env.SENDER_NAME || 'TLP Airways';

    if (!apiKey) {
        return res.status(500).json({ success: false, error: 'Email service not configured' });
    }

    const data = req.body;

    const htmlBody = buildEmailHtml(data);

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: data.email, name: data.passengerName }],
                subject: `Booking Confirmed – ${data.flightNumber} | ${data.pnr}`,
                htmlContent: htmlBody,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return res.status(500).json({ success: false, error: err.message || 'Brevo send failed' });
        }

        const result = await response.json();
        return res.status(200).json({ success: true, messageId: result.messageId, message: 'Email sent' });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Failed to send email' });
    }
}

function buildEmailHtml(d: any): string {
    const returnSection = d.returnFlight ? `
        <tr><td style="padding:16px 0 8px;font-weight:700;color:#004d40;">Return Flight</td></tr>
        <tr>
            <td style="background:#f0faf8;border-radius:8px;padding:16px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td><strong>${d.returnFlight.flightNumber}</strong> &nbsp;·&nbsp; ${d.returnFlight.route}</td>
                        <td align="right">${d.returnFlight.travelDate}</td>
                    </tr>
                    <tr>
                        <td style="color:#555;font-size:13px;padding-top:4px;">${d.returnFlight.departureTime}${d.returnFlight.arrivalTime ? ` → ${d.returnFlight.arrivalTime}` : ''}${d.returnFlight.duration ? ` &nbsp;(${d.returnFlight.duration})` : ''}</td>
                        <td align="right" style="color:#555;font-size:13px;">${d.returnFlight.travelClass || d.travelClass}</td>
                    </tr>
                </table>
            </td>
        </tr>` : '';

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr><td style="background:#004d40;padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#fff;font-size:22px;font-weight:700;">✈ TLP Airways</td>
            <td align="right" style="color:#80cbc4;font-size:13px;">Booking Confirmed</td>
          </tr>
        </table>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:28px 32px;">
        <p style="margin:0 0 8px;font-size:16px;color:#333;">Dear <strong>${d.passengerName}</strong>,</p>
        <p style="margin:0 0 24px;color:#555;">Your booking is confirmed. Here are your trip details.</p>

        <!-- PNR -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f5e9;border-radius:8px;padding:16px;margin-bottom:24px;">
          <tr>
            <td><span style="font-size:12px;color:#555;text-transform:uppercase;letter-spacing:1px;">PNR</span><br><strong style="font-size:22px;color:#004d40;letter-spacing:2px;">${d.pnr}</strong></td>
            <td align="right"><span style="font-size:12px;color:#555;text-transform:uppercase;letter-spacing:1px;">Booking Ref</span><br><strong style="font-size:14px;color:#333;">${d.bookingId}</strong></td>
          </tr>
        </table>

        <!-- Flights -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 0 8px;font-weight:700;color:#004d40;">Outbound Flight</td></tr>
          <tr>
            <td style="background:#f0faf8;border-radius:8px;padding:16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><strong>${d.flightNumber}</strong>${d.aircraftType ? ` &nbsp;·&nbsp; ${d.aircraftType}` : ''} &nbsp;·&nbsp; ${d.route}</td>
                  <td align="right">${d.travelDate}</td>
                </tr>
                <tr>
                  <td style="color:#555;font-size:13px;padding-top:4px;">${d.departureTime}${d.arrivalTime ? ` → ${d.arrivalTime}` : ''}${d.duration ? ` &nbsp;(${d.duration})` : ''}</td>
                  <td align="right" style="color:#555;font-size:13px;">${d.travelClass}</td>
                </tr>
              </table>
            </td>
          </tr>
          ${returnSection}
        </table>

        <!-- Passengers -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr><td style="padding:0 0 8px;font-weight:700;color:#004d40;">Passengers</td></tr>
          <tr>
            <td style="background:#fafafa;border-radius:8px;padding:12px 16px;color:#555;">
              ${d.adults} Adult${d.adults !== 1 ? 's' : ''}${d.children ? ` · ${d.children} Child${d.children !== 1 ? 'ren' : ''}` : ''} &nbsp;·&nbsp; ${d.travelClass}
            </td>
          </tr>
        </table>

        <!-- Fare -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
          <tr>
            <td style="color:#555;">Base Fare</td>
            <td align="right">₹${(d.baseFare || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="color:#555;">Taxes &amp; Fees</td>
            <td align="right">₹${(d.taxes || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="font-weight:700;font-size:16px;">
            <td style="padding-top:8px;border-top:1px solid #eee;">Total Paid</td>
            <td align="right" style="padding-top:8px;border-top:1px solid #eee;color:#004d40;">₹${(d.totalAmount || 0).toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f4f6f8;padding:20px 32px;text-align:center;color:#888;font-size:12px;">
        TLP Airways &nbsp;·&nbsp; For support, reply to this email<br>
        <span style="font-size:11px;">This is a demo application — no real booking has been made.</span>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
