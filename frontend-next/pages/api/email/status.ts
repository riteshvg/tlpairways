import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const configured = !!process.env.BREVO_API_KEY;
    res.status(200).json({ status: configured ? 'configured' : 'unconfigured', provider: 'brevo' });
}
